-- Mark a newly uploaded clearance document as awaiting staff review.
alter table public.clearance_submissions
  drop constraint if exists clearance_submissions_status_check;

alter table public.clearance_submissions
  add constraint clearance_submissions_status_check
  check (lower(status) in ('pending', 'in review', 'approved', 'rejected', 'cleared', 'completed', 'for action'));

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
  values (auth.uid(), p_requirement_id, 'in review', p_file_name, p_file_path)
  on conflict (requirement_id, student_id)
  do update set
    status = 'in review',
    file_name = excluded.file_name,
    file_path = excluded.file_path,
    remarks = null
  returning * into submission;

  return submission;
end;
$$;

revoke execute on function public.submit_clearance_requirement(uuid, text, text) from public;
grant execute on function public.submit_clearance_requirement(uuid, text, text) to authenticated;

drop policy if exists "submission_files_student_read_own" on storage.objects;
create policy "submission_files_student_read_own"
on storage.objects for select to authenticated
using (
  bucket_id = 'clearance-submissions'
  and (storage.foldername(name))[1] = auth.uid()::text
);

notify pgrst, 'reload schema';
