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
create policy "department_students_admin_manage"
on public.department_students for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

notify pgrst, 'reload schema';
