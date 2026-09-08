drop function if exists public.get_my_student_requirements();
create function public.get_my_student_requirements()
returns table (requirement_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select sr.requirement_id
  from public.student_requirements sr
  join public.profiles student on student.id = sr.student_id
  where sr.student_id = auth.uid()
     or lower(student.email) = lower(coalesce(auth.email(), ''));
$$;

revoke execute on function public.get_my_student_requirements() from public;
grant execute on function public.get_my_student_requirements() to authenticated;

drop function if exists public.assign_student_requirement(uuid, uuid);
create function public.assign_student_requirement(
  p_student_id uuid,
  p_requirement_id uuid
)
returns public.student_requirements
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment public.student_requirements;
begin
  if not exists (
    select 1
    from public.profiles actor
    where (actor.id = auth.uid() or lower(actor.email) = lower(coalesce(auth.email(), '')))
      and actor.role in ('admin', 'school_personnel')
  ) then
    raise exception 'Only administrators and school personnel can assign requirements';
  end if;

  insert into public.student_requirements (student_id, requirement_id, assigned_by)
  values (p_student_id, p_requirement_id, auth.uid())
  on conflict (student_id, requirement_id)
  do update set assigned_by = auth.uid()
  returning * into assignment;

  return assignment;
end;
$$;

revoke execute on function public.assign_student_requirement(uuid, uuid) from public;
grant execute on function public.assign_student_requirement(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
