create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
     or lower(email) = lower((select email from auth.users where id = auth.uid()))
  limit 1;
$$;

alter table if exists public.departments
  add column if not exists adviser text;

create or replace function public.get_my_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  profile public.profiles;
begin
  select p.* into profile
  from public.profiles as p
  where p.id = auth.uid()
     or lower(p.email) = lower((select email from auth.users where id = auth.uid()))
  limit 1;

  return profile;
end;
$$;

grant execute on function public.get_my_profile() to authenticated;

create or replace function public.get_admin_profiles()
returns setof public.profiles
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role() <> 'admin' then
    return;
  end if;

  return query
    select p.*
    from public.profiles as p
    order by p.full_name nulls last, p.email;
end;
$$;

grant execute on function public.get_admin_profiles() to authenticated;

create or replace function public.admin_update_profile_role(
  p_profile_id uuid,
  p_role text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  if public.current_role() <> 'admin' then
    raise exception 'Only administrators can change account roles';
  end if;

  if p_role not in ('student', 'school_personnel', 'admin', 'unlisted') then
    raise exception 'Invalid account role';
  end if;

  update public.profiles
  set role = p_role
  where id = p_profile_id
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Account profile was not found';
  end if;

  return updated_profile;
end;
$$;

revoke execute on function public.admin_update_profile_role(uuid, text) from public;
grant execute on function public.admin_update_profile_role(uuid, text) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, student_id, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'student_id', ''),
    case
      when new.raw_user_meta_data ->> 'role' in ('admin', 'school_personnel', 'student')
        then new.raw_user_meta_data ->> 'role'
      else 'unlisted'
    end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    student_id = excluded.student_id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Repair profiles whose Auth users were deleted and recreated with new IDs.
update public.profiles as current_profile
set role = old_profile.role,
    full_name = nullif(current_profile.full_name, ''),
    student_id = coalesce(current_profile.student_id, old_profile.student_id)
from public.profiles as old_profile
join auth.users as users on lower(old_profile.email) = lower(users.email)
where current_profile.id = users.id
  and old_profile.id <> users.id;

delete from public.profiles as old_profile
using auth.users as users
where lower(old_profile.email) = lower(users.email)
  and old_profile.id <> users.id
  and exists (
    select 1
    from public.profiles as current_profile
    where current_profile.id = users.id
  );

update public.profiles as profiles
set id = users.id
from auth.users as users
where lower(profiles.email) = lower(users.email)
  and profiles.id <> users.id;

alter table public.profiles enable row level security;
alter table if exists public.profiles
  add column if not exists grade_level text,
  add column if not exists section text,
  add column if not exists contact_number text;
alter table if exists public.departments
  add column if not exists grade_level text default 'Others',
  add column if not exists section text default 'N/A';
update public.departments
set grade_level = 'Others'
where grade_level is null or trim(grade_level) = '';

update public.departments
set grade_level = 'Grade 7';
alter table public.departments enable row level security;
alter table public.requirements enable row level security;
alter table public.clearance_submissions enable row level security;
alter table public.department_personnel enable row level security;
alter table public.activity_logs enable row level security;

-- Class-level and individual requirement assignments used by school personnel.
create table if not exists public.class_requirements (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  grade_level text not null,
  section text not null,
  assigned_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (requirement_id, grade_level, section)
);

create table if not exists public.student_requirements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (student_id, requirement_id)
);

create table if not exists public.department_students (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (department_id, student_id)
);

alter table public.class_requirements enable row level security;
alter table public.student_requirements enable row level security;
alter table public.department_students enable row level security;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where role = 'admin'
      and (id = auth.uid() or lower(email) = lower(coalesce(auth.email(), '')))
  );
$$;

revoke execute on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

drop policy if exists "class_requirements_read_authenticated" on public.class_requirements;
create policy "class_requirements_read_authenticated"
on public.class_requirements for select to authenticated using (true);

drop policy if exists "class_requirements_staff_manage" on public.class_requirements;
create policy "class_requirements_staff_manage"
on public.class_requirements for all to authenticated
using (public.current_role() in ('admin', 'school_personnel'))
with check (public.current_role() in ('admin', 'school_personnel'));

drop policy if exists "student_requirements_read_own_or_staff" on public.student_requirements;
create policy "student_requirements_read_own_or_staff"
on public.student_requirements for select to authenticated
using (student_id = auth.uid() or public.current_role() in ('admin', 'school_personnel'));

drop policy if exists "student_requirements_staff_manage" on public.student_requirements;
create policy "student_requirements_staff_manage"
on public.student_requirements for all to authenticated
using (public.current_role() in ('admin', 'school_personnel'))
with check (public.current_role() in ('admin', 'school_personnel'));

drop policy if exists "department_students_read_authenticated" on public.department_students;
create policy "department_students_read_authenticated"
on public.department_students for select to authenticated
using (student_id = auth.uid() or public.is_admin_user() or public.current_role() = 'school_personnel');

drop policy if exists "department_students_admin_manage" on public.department_students;
drop policy if exists "department_students_admin_insert" on public.department_students;
drop policy if exists "department_students_admin_update" on public.department_students;
drop policy if exists "department_students_admin_delete" on public.department_students;
create policy "department_students_admin_insert"
on public.department_students for insert to authenticated
with check (public.is_admin_user());
create policy "department_students_admin_update"
on public.department_students for update to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());
create policy "department_students_admin_delete"
on public.department_students for delete to authenticated
using (public.is_admin_user());

alter table if exists public.clearance_submissions
  add column if not exists file_name text,
  add column if not exists file_path text,
  add column if not exists remarks text;

create or replace function public.submit_clearance_requirement(
  p_requirement_id uuid,
  p_file_name text,
  p_file_path text
)
returns public.clearance_submissions
language plpgsql
security definer
set search_path = public
as $$
declare
  submission public.clearance_submissions;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.clearance_submissions (
    student_id,
    requirement_id,
    status,
    file_name,
    file_path
  )
  values (auth.uid(), p_requirement_id, 'pending', p_file_name, p_file_path)
  on conflict (requirement_id, student_id)
  do update set
    status = 'pending',
    file_name = excluded.file_name,
    file_path = excluded.file_path
  returning * into submission;

  return submission;
end;
$$;

revoke execute on function public.submit_clearance_requirement(uuid, text, text) from public;
grant execute on function public.submit_clearance_requirement(uuid, text, text) to authenticated;

drop function if exists public.get_staff_clearance_submissions();
create function public.get_staff_clearance_submissions()
returns setof jsonb
language sql
security definer
set search_path = public
as $$
  select to_jsonb(s) || jsonb_build_object(
    'student_name', coalesce(p.full_name, p.email, s.student_id::text),
    'requirement_name', r.title,
    'department_name', d.name
  )
  from public.clearance_submissions s
  left join public.profiles p on p.id = s.student_id
  left join public.requirements r on r.id = s.requirement_id
  left join public.departments d on d.id = r.department_id
  where public.current_role() = 'admin'
     or exists (
       select 1
       from public.department_personnel dp
       where dp.department_id = r.department_id
         and dp.personnel_id = auth.uid()
     );
$$;

revoke execute on function public.get_staff_clearance_submissions() from public;
grant execute on function public.get_staff_clearance_submissions() to authenticated;

create or replace function public.get_staff_department_students()
returns setof public.profiles
language sql
security definer
set search_path = public
as $$
  select distinct p.*
  from public.profiles p
  join public.department_students ds on ds.student_id = p.id
  join public.department_personnel dp on dp.department_id = ds.department_id
  where dp.personnel_id = auth.uid()
    and p.role = 'student';
$$;

revoke execute on function public.get_staff_department_students() from public;
grant execute on function public.get_staff_department_students() to authenticated;

create or replace function public.review_clearance_submission(
  p_submission_id uuid,
  p_status text,
  p_remarks text default null
)
returns public.clearance_submissions
language plpgsql
security definer
set search_path = public
as $$
declare
  submission public.clearance_submissions;
begin
  if public.current_role() <> 'admin' and not exists (
    select 1
    from public.clearance_submissions cs
    join public.requirements req on req.id = cs.requirement_id
    join public.department_personnel dp on dp.department_id = req.department_id
    where cs.id = p_submission_id
      and dp.personnel_id = auth.uid()
  ) then
    raise exception 'Only staff can review submissions';
  end if;

  if lower(p_status) not in ('approved', 'rejected') then
    raise exception 'Invalid review status';
  end if;

  update public.clearance_submissions
  set status = lower(p_status),
      remarks = nullif(trim(p_remarks), '')
  where id = p_submission_id
  returning * into submission;

  return submission;
end;
$$;

grant execute on function public.review_clearance_submission(uuid, text) to authenticated;

create or replace function public.get_my_clearance_submissions()
returns setof public.clearance_submissions
language sql
security definer
set search_path = public
as $$
  select s.*
  from public.clearance_submissions s
  where s.student_id = auth.uid();
$$;

grant execute on function public.get_my_clearance_submissions() to authenticated;

insert into storage.buckets (id, name, public)
values ('clearance-submissions', 'clearance-submissions', false)
on conflict (id) do nothing;

drop policy if exists "submission_files_student_upload" on storage.objects;
create policy "submission_files_student_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'clearance-submissions'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "submission_files_staff_read" on storage.objects;
create policy "submission_files_staff_read"
on storage.objects for select to authenticated
using (
  bucket_id = 'clearance-submissions'
  and public.current_role() in ('admin', 'school_personnel')
);

-- Profiles: users can see their own profile; admins can manage all profiles.
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "profiles_school_personnel_read_students" on public.profiles;
create policy "profiles_school_personnel_read_students"
on public.profiles for select to authenticated
using (role = 'student' and public.current_role() = 'school_personnel');

drop policy if exists "profiles_admin_manage" on public.profiles;
create policy "profiles_admin_manage"
on public.profiles for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Departments and requirements are readable by signed-in users.
drop policy if exists "departments_read_authenticated" on public.departments;
create policy "departments_read_authenticated"
on public.departments for select to authenticated
using (
  public.current_role() = 'admin'
  or public.current_role() in ('student', 'unlisted')
  or exists (
    select 1
    from public.department_personnel dp
    where dp.department_id = departments.id
      and dp.personnel_id = auth.uid()
  )
);

drop policy if exists "departments_admin_manage" on public.departments;
create policy "departments_admin_manage"
on public.departments for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

drop policy if exists "departments_admin_insert" on public.departments;
create policy "departments_admin_insert"
on public.departments for insert to authenticated
with check (public.current_role() = 'admin');

drop policy if exists "requirements_read_authenticated" on public.requirements;
create policy "requirements_read_authenticated"
on public.requirements for select to authenticated
using (
  public.current_role() in ('admin', 'student', 'unlisted')
  or exists (
    select 1 from public.department_personnel dp
    where dp.department_id = requirements.department_id
      and dp.personnel_id = auth.uid()
  )
);

drop policy if exists "requirements_staff_manage" on public.requirements;
create policy "requirements_staff_manage"
on public.requirements for all to authenticated
using (
  public.current_role() = 'admin'
  or exists (
    select 1
    from public.department_personnel dp
    where dp.department_id = requirements.department_id
      and dp.personnel_id = auth.uid()
  )
)
with check (
  public.current_role() = 'admin'
  or exists (
    select 1
    from public.department_personnel dp
    where dp.department_id = requirements.department_id
      and dp.personnel_id = auth.uid()
  )
);

drop policy if exists "requirements_staff_insert" on public.requirements;
create policy "requirements_staff_insert"
on public.requirements for insert to authenticated
with check (
  public.current_role() = 'admin'
  or exists (
    select 1 from public.department_personnel dp
    where dp.department_id = requirements.department_id
      and dp.personnel_id = auth.uid()
  )
);

drop policy if exists "requirements_staff_update" on public.requirements;
create policy "requirements_staff_update"
on public.requirements for update to authenticated
using (
  public.current_role() = 'admin'
  or exists (select 1 from public.department_personnel dp where dp.department_id = requirements.department_id and dp.personnel_id = auth.uid())
)
with check (
  public.current_role() = 'admin'
  or exists (select 1 from public.department_personnel dp where dp.department_id = requirements.department_id and dp.personnel_id = auth.uid())
);

-- Students see and create only their own submissions.
drop policy if exists "submissions_student_read_own" on public.clearance_submissions;
create policy "submissions_student_read_own"
on public.clearance_submissions for select to authenticated
using (student_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "submissions_student_create_own" on public.clearance_submissions;
create policy "submissions_student_create_own"
on public.clearance_submissions for insert to authenticated
with check (
  student_id = auth.uid()
  and lower(coalesce(status, 'pending')) in ('pending', 'in review')
);

drop policy if exists "clearance_submissions_student_insert" on public.clearance_submissions;
create policy "clearance_submissions_student_insert"
on public.clearance_submissions for insert to authenticated
with check (student_id = auth.uid());

-- Admins and school personnel can review submissions.
drop policy if exists "submissions_staff_read" on public.clearance_submissions;
create policy "submissions_staff_read"
on public.clearance_submissions for select to authenticated
using (
  public.current_role() = 'admin'
  or exists (
    select 1
    from public.requirements r
    join public.department_personnel dp on dp.department_id = r.department_id
    where r.id = clearance_submissions.requirement_id
      and dp.personnel_id = auth.uid()
  )
);

drop policy if exists "submissions_staff_review" on public.clearance_submissions;
create policy "submissions_staff_review"
on public.clearance_submissions for update to authenticated
using (public.current_role() in ('admin', 'school_personnel'))
with check (public.current_role() in ('admin', 'school_personnel'));

-- Personnel assignments are admin-managed and visible to assigned staff/admins.
drop policy if exists "department_personnel_read" on public.department_personnel;
create policy "department_personnel_read"
on public.department_personnel for select to authenticated
using (personnel_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "department_personnel_admin_manage" on public.department_personnel;
create policy "department_personnel_admin_manage"
on public.department_personnel for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- Activity is private to the owner, with admin visibility.
drop policy if exists "activity_logs_read" on public.activity_logs;
create policy "activity_logs_read"
on public.activity_logs for select to authenticated
using (user_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "activity_logs_insert" on public.activity_logs;
create policy "activity_logs_insert"
on public.activity_logs for insert to authenticated
with check (user_id = auth.uid());

-- Never expose the legacy plaintext-password table through the browser API.
alter table if exists public.users enable row level security;
drop policy if exists "users_no_browser_access" on public.users;
create policy "users_no_browser_access"
on public.users for all to anon, authenticated
using (false)
with check (false);

alter table if exists public.clearease_personnel enable row level security;
drop policy if exists "personnel_no_browser_access" on public.clearease_personnel;
create policy "personnel_no_browser_access"
on public.clearease_personnel for all to anon, authenticated
using (false)
with check (false);
