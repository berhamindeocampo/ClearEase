-- Run this migration in the Supabase SQL Editor.
-- It enables Admin Department -> Manage -> student assignment.

create table if not exists public.department_students (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (department_id, student_id)
);

alter table public.department_students enable row level security;

drop policy if exists "department_students_read_authenticated" on public.department_students;
create policy "department_students_read_authenticated"
on public.department_students for select to authenticated
using (student_id = auth.uid() or public.current_role() in ('admin', 'school_personnel'));

drop policy if exists "department_students_admin_manage" on public.department_students;
drop policy if exists "department_students_admin_insert" on public.department_students;
drop policy if exists "department_students_admin_update" on public.department_students;
drop policy if exists "department_students_admin_delete" on public.department_students;
create policy "department_students_admin_insert"
on public.department_students for insert to authenticated
with check (exists (
  select 1 from public.profiles
  where role = 'admin'
    and (id = auth.uid() or lower(email) = lower((select email from auth.users where id = auth.uid())))
));
create policy "department_students_admin_update"
on public.department_students for update to authenticated
using (exists (
  select 1 from public.profiles
  where role = 'admin'
    and (id = auth.uid() or lower(email) = lower((select email from auth.users where id = auth.uid())))
))
with check (exists (
  select 1 from public.profiles
  where role = 'admin'
    and (id = auth.uid() or lower(email) = lower((select email from auth.users where id = auth.uid())))
));
create policy "department_students_admin_delete"
on public.department_students for delete to authenticated
using (exists (
  select 1 from public.profiles
  where role = 'admin'
    and (id = auth.uid() or lower(email) = lower((select email from auth.users where id = auth.uid())))
));

notify pgrst, 'reload schema';
