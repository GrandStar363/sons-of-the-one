-- 0007_membership_testers.sql
-- Test accounts for the member side. With live billing, every new member
-- pays the $1 entry with a real card; accounts listed here get full member
-- access without billing, for testing the app. This is NOT admin access:
-- the admin panel only accepts rows in public.admins.
--
-- Add:    insert into public.membership_testers (email, note) values ('x@y.com', 'why');
-- Remove: delete from public.membership_testers where email = 'x@y.com';

create table if not exists public.membership_testers (
  email      text primary key check (email = lower(email)),
  note       text,
  created_at timestamptz not null default now()
);

-- Read only by the membership function (service role); no client access.
alter table public.membership_testers enable row level security;
