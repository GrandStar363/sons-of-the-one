-- 0003_rls_policies.sql
-- SECURITY FIX: Row-Level Security was DISABLED on every public table, so anyone
-- holding the anon key (it ships in the browser bundle) could read or modify
-- every row. This enables RLS on all tables and adds policies that match how
-- each table is actually accessed.
--
-- Access model:
--   Tier A  Private per-user   — owner-only (user_id = auth.uid())
--   Tier B  Community          — any signed-in user reads; only the owner writes
--   Tier C  Study groups       — any signed-in user (no anon); membership-scoping
--                                is a documented follow-up
--   Tier D  Service-role only  — RLS on, NO anon/authenticated policy; reachable
--                                only by edge functions (service_role bypasses RLS)
--   Special trivia_matches     — signed-in read (matchmaking/realtime); writes via function
--   Special contact_messages   — public INSERT (contact form); reads/edits via admin function
--
-- Idempotent: policies are dropped-if-exists before creation, so this can re-run.

begin;

-- ---------------------------------------------------------------------------
-- Tier A — private per-user (owner-only, all commands)
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'user_data','notification_preferences','memory_verses','memory_progress',
    'memory_streaks','memory_achievements','baptism_journeys','baptism_milestones',
    'baptism_study_progress','wwjd_reflections','wwjd_streaks','user_activity',
    'journal_entries'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists own_all on public.%I', t);
    execute format(
      'create policy own_all on public.%I for all to authenticated '
      || 'using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Tier B — community (signed-in read-all; owner-only insert/update/delete)
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'prayer_requests','prayer_commitments','prayer_encouragements',
    'declarations','declaration_amens','declaration_responses'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists read_all on public.%I', t);
    execute format('drop policy if exists own_write on public.%I', t);
    execute format(
      'create policy read_all on public.%I for select to authenticated using (true)', t);
    execute format(
      'create policy own_write on public.%I for all to authenticated '
      || 'using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Tier C — study groups (any signed-in user; anon blocked)
-- Text identity columns (author_id/user_id/created_by) make owner-scoping
-- unreliable today, and the current frontend does not query these directly.
-- FOLLOW-UP: tighten to group-membership once a membership model is settled.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'bible_study_groups','group_members','group_discussions','group_discussion_replies',
    'group_invites','group_prayer_requests','group_shared_bookmarks','group_shared_highlights'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists auth_all on public.%I', t);
    execute format(
      'create policy auth_all on public.%I for all to authenticated '
      || 'using (true) with check (true)', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Tier D — service-role only (RLS enabled, NO anon/authenticated policies).
-- Edge functions use the service-role key, which bypasses RLS.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'app_users','admins','admin_sessions','admin_audit_log',
    'donations','recurring_donations','user_subscriptions','subscription_history',
    'donation_impact_metrics','devotionals','featured_verses','devotional_preferences',
    'reminder_preferences','activity_events','referrals','referral_claims','referral_shares',
    'tournaments','tournament_registrations','tournament_matches',
    'trivia_queue','trivia_spectators','trivia_stats'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Special cases
-- ---------------------------------------------------------------------------
-- trivia_matches: signed-in users read directly (matchmaking + realtime); all
-- writes go through the multiplayer-trivia function (service role).
alter table public.trivia_matches enable row level security;
drop policy if exists read_all on public.trivia_matches;
create policy read_all on public.trivia_matches for select to authenticated using (true);

-- contact_messages: the public contact form inserts; nobody may read/edit with
-- the anon key. The admin dashboard reads/edits via the admin-contact-messages
-- edge function (service role) — see functions/admin-contact-messages.
alter table public.contact_messages enable row level security;
drop policy if exists public_insert on public.contact_messages;
create policy public_insert on public.contact_messages
  for insert to anon, authenticated with check (true);

commit;
