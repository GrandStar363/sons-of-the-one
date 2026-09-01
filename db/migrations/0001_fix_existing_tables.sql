-- 0001_fix_existing_tables.sql
-- Reconcile the 25 pre-existing (Famous.ai) public tables with what the current
-- application code actually reads and writes. Safe to run: every table is empty
-- (0 rows), so type changes and new constraints cannot fail on existing data.
--
-- Findings this fixes:
--   * user_data was missing 9 of the 14 columns the sync hook writes, and its
--     JSON columns were `text` (the client sends real arrays/objects).
--   * Upserts across the app use onConflict targets that had no matching unique
--     constraint, so they silently failed. Added here.
--   * prayer_requests lacked columns some community components write/read.

begin;

-- ---------------------------------------------------------------------------
-- user_data: real jsonb + the missing columns + unique(user_id) for upsert
-- ---------------------------------------------------------------------------
alter table public.user_data
  alter column bookmarks     type jsonb using nullif(bookmarks, '')::jsonb,
  alter column highlights    type jsonb using nullif(highlights, '')::jsonb,
  alter column notes         type jsonb using nullif(notes, '')::jsonb,
  alter column plan_progress type jsonb using nullif(plan_progress, '')::jsonb;

alter table public.user_data
  add column if not exists completed_lessons   jsonb   default '[]'::jsonb,
  add column if not exists lesson_progress     jsonb   default '{}'::jsonb,
  add column if not exists earned_certificates jsonb   default '[]'::jsonb,
  add column if not exists saved_comparisons   jsonb   default '[]'::jsonb,
  add column if not exists reading_plan        text,
  add column if not exists trivia_highscores   jsonb   default '{}'::jsonb,
  add column if not exists trivia_progress     jsonb   default '{}'::jsonb,
  add column if not exists verse_prefs         jsonb   default '{}'::jsonb,
  add column if not exists leaderboard_public  boolean default false;

create unique index if not exists user_data_user_id_key
  on public.user_data (user_id);

-- ---------------------------------------------------------------------------
-- prayer_requests: add columns written/read by CommunityWall + AdminPrayerRequests.
-- NOTE: `request` and `request_text` now coexist (drift between two components).
-- A later code cleanup should standardize on one; kept both so nothing breaks.
-- ---------------------------------------------------------------------------
alter table public.prayer_requests
  add column if not exists request_text text,
  add column if not exists user_name    text,
  add column if not exists user_email   text,
  add column if not exists status       text default 'active';

-- ---------------------------------------------------------------------------
-- Unique constraints required by upsert onConflict targets on existing tables.
-- (create unique index if not exists is idempotent; any Famous-era duplicate is
--  harmless on empty tables and can be de-duplicated after verification.)
-- ---------------------------------------------------------------------------
create unique index if not exists notification_preferences_user_id_key
  on public.notification_preferences (user_id);
create unique index if not exists memory_streaks_user_id_key
  on public.memory_streaks (user_id);
create unique index if not exists wwjd_streaks_user_id_key
  on public.wwjd_streaks (user_id);
create unique index if not exists baptism_journeys_user_id_key
  on public.baptism_journeys (user_id);
create unique index if not exists wwjd_reflections_user_scenario_key
  on public.wwjd_reflections (user_id, scenario_date);
create unique index if not exists baptism_milestones_user_milestone_key
  on public.baptism_milestones (user_id, milestone_id);
create unique index if not exists baptism_study_progress_user_lesson_key
  on public.baptism_study_progress (user_id, lesson_id);

commit;
