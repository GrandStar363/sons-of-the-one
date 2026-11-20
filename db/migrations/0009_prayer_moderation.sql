-- Prayer moderation from the admin panel.
-- admin-prayer-requests writes moderated_by / moderated_at / rejection_reason,
-- which never existed, so Approve / Reject always failed. New prayers start as
-- 'pending' (posted and visible, waiting for review). A rejected prayer leaves
-- the wall for everyone but its author. Only the server (service role) can
-- change moderation fields, so a member cannot un-reject their own post.

alter table public.prayer_requests
  add column if not exists moderated_by uuid,
  add column if not exists moderated_at timestamptz,
  add column if not exists rejection_reason text;

alter table public.prayer_requests alter column status set default 'pending';
update public.prayer_requests set status = 'pending' where status is null or status = 'active';

drop policy if exists "read_all" on public.prayer_requests;
create policy "read_all" on public.prayer_requests
  for select to authenticated
  using (coalesce(status, 'pending') <> 'rejected' or user_id = auth.uid());

create or replace function public.protect_prayer_moderation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    if tg_op = 'INSERT' then
      new.status := 'pending';
      new.moderated_by := null;
      new.moderated_at := null;
      new.rejection_reason := null;
    else
      new.status := old.status;
      new.moderated_by := old.moderated_by;
      new.moderated_at := old.moderated_at;
      new.rejection_reason := old.rejection_reason;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists protect_prayer_moderation on public.prayer_requests;
create trigger protect_prayer_moderation
  before insert or update on public.prayer_requests
  for each row execute function public.protect_prayer_moderation();
