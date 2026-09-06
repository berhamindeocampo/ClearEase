-- ClearEase RLS policies
-- Run this in Supabase SQL Editor after confirming the column names.
-- Required profile columns: id uuid references auth.users(id), role text.
-- Roles: admin, school_personnel, student.
-- This intentionally does not expose plaintext passwords from public.users.

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.requirements enable row level security;
alter table public.clearance_submissions enable row level security;
alter table public.department_personnel enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles: users can see their own profile; admins can manage all profiles.
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "profiles_admin_manage" on public.profiles;
create policy "profiles_admin_manage"
on public.profiles for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- Departments and requirements are readable by signed-in users.
drop policy if exists "departments_read_authenticated" on public.departments;
create policy "departments_read_authenticated"
on public.departments for select to authenticated
using (true);

drop policy if exists "departments_admin_manage" on public.departments;
create policy "departments_admin_manage"
on public.departments for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

drop policy if exists "requirements_read_authenticated" on public.requirements;
create policy "requirements_read_authenticated"
on public.requirements for select to authenticated
using (true);

drop policy if exists "requirements_staff_manage" on public.requirements;
create policy "requirements_staff_manage"
on public.requirements for all to authenticated
using (public.current_role() in ('admin', 'school_personnel'))
with check (public.current_role() in ('admin', 'school_personnel'));

-- Students see and create only their own submissions.
drop policy if exists "submissions_student_read_own" on public.clearance_submissions;
create policy "submissions_student_read_own"
on public.clearance_submissions for select to authenticated
using (student_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "submissions_student_create_own" on public.clearance_submissions;
create policy "submissions_student_create_own"
on public.clearance_submissions for insert to authenticated
with check (student_id = auth.uid());

-- Admins and school personnel can review submissions.
drop policy if exists "submissions_staff_read" on public.clearance_submissions;
create policy "submissions_staff_read"
on public.clearance_submissions for select to authenticated
using (public.current_role() in ('admin', 'school_personnel'));

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
