-- Store the student's class details entered from the profile page.
alter table if exists public.profiles
  add column if not exists grade_level text,
  add column if not exists section text;

alter table if exists public.profiles enable row level security;

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

notify pgrst, 'reload schema';
