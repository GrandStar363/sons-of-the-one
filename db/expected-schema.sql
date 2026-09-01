-- =============================================================================
-- Sons of the One — EXPECTED database schema (reconstructed from application code)
-- =============================================================================
--
-- ⚠️  THIS IS NOT A DUMP OF THE LIVE DATABASE.
--
-- The repo shipped with no schema/migrations. This file is the schema the
-- application CODE assumes, reverse-engineered from every .from()/.insert()/
-- .upsert()/.update()/.select()/.eq() call in app/src and functions/.
--
-- Purpose: a baseline to DIFF against the real database once connected. Every
-- place the live DB disagrees with this file is either (a) a column this file
-- guessed wrong, or (b) a real bug in the code. The known example is
-- donations.donor_email (see notes) — the code filters on it but never writes
-- it, and only `email` is ever inserted.
--
-- Column NAMES and PRESENCE are high-confidence (taken straight from the code).
-- Column TYPES are inferred by naming convention and should be verified:
--   *_id            -> uuid (internal) / text (stripe_*, *_code, token, slugs)
--   *_at            -> timestamptz
--   *_date          -> date
--   is_* / *_enabled-> boolean
--   amount/count/streak/score/*_questions -> integer/numeric
--   metadata/detail/blob study data        -> jsonb
--
-- user_id columns generally reference auth.users(id) (Supabase GoTrue).
-- Reconcile, then promote the corrected version to db/schema.sql.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Admin / identity
-- ----------------------------------------------------------------------------

-- Application members mirror (separate from auth.users). Written by triggers or
-- functions; admin-users reads/updates it.
create table if not exists public.app_users (
  id            uuid primary key,               -- = auth.users.id
  email         text unique,
  name          text,
  is_subscribed boolean default false,
  last_active   timestamptz,
  total_donations numeric default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.admins (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  name          text,
  role          text not null default 'admin',  -- 'admin' | 'super_admin'
  password_hash text not null,                  -- pbkdf2$iter$salt$hash (legacy sha256 upgraded on login)
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.admin_sessions (
  token      text primary key,                  -- opaque 32-byte hex, checked every request
  admin_id   uuid not null references public.admins(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists public.admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid,
  admin_email text,
  action      text not null,
  target      text,
  detail      jsonb default '{}'::jsonb,
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Per-user study data (browser <-> DB sync via useSyncedState)
-- ----------------------------------------------------------------------------

-- Single JSON-blob row per user. Authoritative column list comes from the
-- UserDataColumn type in app/src/hooks/useSyncedState.ts.
create table if not exists public.user_data (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  bookmarks           jsonb default '[]'::jsonb,
  highlights          jsonb default '[]'::jsonb,
  notes               jsonb default '{}'::jsonb,
  active_plan         text,
  plan_progress       jsonb default '{}'::jsonb,
  completed_lessons   jsonb default '[]'::jsonb,
  lesson_progress     jsonb default '{}'::jsonb,
  earned_certificates jsonb default '[]'::jsonb,
  saved_comparisons   jsonb default '[]'::jsonb,
  reading_plan        text,
  trivia_highscores   jsonb default '{}'::jsonb,
  trivia_progress     jsonb default '{}'::jsonb,
  verse_prefs         jsonb default '{}'::jsonb,
  leaderboard_public  boolean default false,
  updated_at          timestamptz default now()
);

-- Last-read pointer (user_activity), separate from user_data.
create table if not exists public.user_activity (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  last_book    text,
  last_chapter integer,
  updated_at   timestamptz default now()
);

create table if not exists public.journal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  title      text,
  content    text,
  entry_date date,
  mood       text,
  tags       jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Referenced directly from the browser; columns beyond id not fully evidenced.
create table if not exists public.bookmarks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  reference  text,
  created_at timestamptz default now()
);

create table if not exists public.avatars (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  url        text,
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Scripture memory
-- ----------------------------------------------------------------------------

create table if not exists public.memory_verses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  verse_text text,
  created_at timestamptz default now()
);

create table if not exists public.memory_progress (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade,
  verse_id          uuid,
  times_correct     integer default 0,
  times_incorrect   integer default 0,
  last_reviewed_at  timestamptz,
  next_review_date  date,
  updated_at        timestamptz default now()
);

create table if not exists public.memory_streaks (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  current_streak     integer default 0,
  longest_streak     integer default 0,
  total_reviews      integer default 0,
  last_practice_date date,
  updated_at         timestamptz default now()
);

create table if not exists public.memory_achievements (
  user_id        uuid references auth.users(id) on delete cascade,
  achievement_id text,
  created_at     timestamptz default now(),
  primary key (user_id, achievement_id)
);

-- ----------------------------------------------------------------------------
-- Baptism journey
-- ----------------------------------------------------------------------------

create table if not exists public.baptism_journeys (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  baptism_status      text,
  baptism_date        date,
  old_man_description text,
  new_man_description text,
  testimony           text,
  updated_at          timestamptz default now()
);

create table if not exists public.baptism_milestones (
  user_id      uuid references auth.users(id) on delete cascade,
  milestone_id text,
  completed    boolean default false,
  completed_at timestamptz,
  reflection   text,
  primary key (user_id, milestone_id)
);

create table if not exists public.baptism_study_progress (
  user_id      uuid references auth.users(id) on delete cascade,
  lesson_id    text,
  completed    boolean default false,
  completed_at timestamptz,
  notes        text,
  primary key (user_id, lesson_id)
);

-- ----------------------------------------------------------------------------
-- WWJD reflections
-- ----------------------------------------------------------------------------

create table if not exists public.wwjd_reflections (
  user_id              uuid references auth.users(id) on delete cascade,
  scenario_date        date,
  scenario_title       text,
  scenario_description text,
  scripture_reference  text,
  reflection           text,
  updated_at           timestamptz default now(),
  primary key (user_id, scenario_date)
);

create table if not exists public.wwjd_streaks (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  current_streak        integer default 0,
  longest_streak        integer default 0,
  total_reflections     integer default 0,
  last_reflection_date  date,
  updated_at            timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Community: prayer wall & declarations
-- ----------------------------------------------------------------------------

-- NOTE: schema drift — different components write different column names here
-- (`request` vs `request_text`, `title`, `name` vs `user_name`, `user_email`).
-- Verify which columns actually exist; some inserts may be silently failing.
create table if not exists public.prayer_requests (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  user_name         text,
  user_email        text,
  name              text,
  title             text,
  request           text,
  request_text      text,
  category          text,
  status            text default 'active',
  is_anonymous      boolean default false,
  is_urgent         boolean default false,
  is_answered       boolean default false,
  answered_at       timestamptz,
  answered_testimony text,
  created_at        timestamptz default now()
);

create table if not exists public.prayer_commitments (
  prayer_id  uuid references public.prayer_requests(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (prayer_id, user_id)
);

create table if not exists public.prayer_encouragements (
  id                  uuid primary key default gen_random_uuid(),
  prayer_id           uuid references public.prayer_requests(id) on delete cascade,
  user_id             uuid references auth.users(id) on delete set null,
  name                text,
  message             text,
  scripture_reference text,
  is_answered         boolean default false,
  answered_at         timestamptz,
  answered_testimony  text,
  created_at          timestamptz default now()
);

create table if not exists public.declarations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  name        text,
  declaration text,
  testimony   text,
  created_at  timestamptz default now()
);

create table if not exists public.declaration_amens (
  declaration_id uuid references public.declarations(id) on delete cascade,
  user_id        uuid references auth.users(id) on delete cascade,
  created_at     timestamptz default now(),
  primary key (declaration_id, user_id)
);

create table if not exists public.declaration_responses (
  id             uuid primary key default gen_random_uuid(),
  declaration_id uuid references public.declarations(id) on delete cascade,
  user_id        uuid references auth.users(id) on delete set null,
  name           text,
  message        text,
  created_at     timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Contact / support
-- ----------------------------------------------------------------------------

-- ⚠️ Read AND written directly from the browser (AdminContactMessages.tsx and
-- ContactUs.tsx) with the anon key. Security depends entirely on RLS here.
create table if not exists public.contact_messages (
  id             uuid primary key default gen_random_uuid(),
  name           text,
  email          text,
  subject        text,
  message        text,
  status         text default 'new',
  response_notes text,
  responded_at   timestamptz,
  created_at     timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Donations & subscriptions (Stripe)
-- ----------------------------------------------------------------------------

-- BUG: admin-users "get" filters .eq('donor_email', ...) but only `email` is
-- ever inserted. donor_email is included below only because the code references
-- it; the live table most likely has `email` and NOT donor_email.
create table if not exists public.donations (
  id                      uuid primary key default gen_random_uuid(),
  email                   text,
  donor_email             text,          -- SUSPECT: filtered but never written
  name                    text,
  amount                  integer,       -- cents
  currency                text default 'usd',
  donation_type           text default 'one_time',
  message                 text,
  show_on_wall            boolean default false,
  status                  text default 'pending',
  stripe_payment_intent_id text,
  receipt_number          text,
  email_receipt_sent      boolean default false,
  email_receipt_sent_at   timestamptz,
  email_send_attempts     integer default 0,
  email_send_error        text,
  completed_at            timestamptz,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create table if not exists public.recurring_donations (
  id                     uuid primary key default gen_random_uuid(),
  email                  text,
  name                   text,
  currency               text default 'usd',
  status                 text default 'active',
  next_billing_date      timestamptz,
  cancelled_at           timestamptz,
  stripe_customer_id     text,
  stripe_price_id        text,
  stripe_subscription_id text,
  created_at             timestamptz default now()
);

create table if not exists public.user_subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid unique references auth.users(id) on delete cascade,
  email                  text,
  status                 text,
  plan_type              text,
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  trial_start            timestamptz,
  trial_end              timestamptz,
  updated_at             timestamptz default now()
);

create table if not exists public.subscription_history (
  id                    uuid primary key default gen_random_uuid(),
  user_subscription_id  uuid references public.user_subscriptions(id) on delete cascade,
  email                 text,
  event_type            text,
  plan_type             text,
  description           text,
  stripe_subscription_id text,
  metadata              jsonb default '{}'::jsonb,
  created_at            timestamptz default now()
);

create table if not exists public.donation_impact_metrics (
  metric_name text primary key,
  metric_value numeric default 0,
  updated_at   timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Referrals
-- ----------------------------------------------------------------------------
-- NOTE: `referrals` and `referral_claims` share the same column set in the code.
-- One may be a leftover/rename. Confirm whether both exist in the live DB.

create table if not exists public.referrals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  referral_code  text,
  referred_email text,
  referred_user  uuid,
  platform       text,
  status         text,
  trial_days     integer,
  trial_start    timestamptz,
  trial_end      timestamptz,
  signups        integer default 0,
  trials_claimed integer default 0,
  created_at     timestamptz default now()
);

create table if not exists public.referral_claims (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  referral_code  text,
  referred_email text,
  referred_user  uuid,
  status         text,
  trial_days     integer,
  trial_start    timestamptz,
  trial_end      timestamptz,
  signups        integer default 0,
  trials_claimed integer default 0,
  created_at     timestamptz default now()
);

create table if not exists public.referral_shares (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  referral_code  text,
  platform       text,
  signups        integer default 0,
  trials_claimed integer default 0,
  created_at     timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Trivia (solo, multiplayer, spectator)
-- ----------------------------------------------------------------------------

create table if not exists public.trivia_matches (
  id                uuid primary key default gen_random_uuid(),
  match_id          text unique,
  player1_id        uuid,
  player1_name      text,
  player2_id        uuid,
  player2_name      text,
  status            text default 'waiting',
  current_question  integer default 0,
  total_questions   integer,
  time_per_question integer,
  winner_id         uuid,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table if not exists public.trivia_queue (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid unique references auth.users(id) on delete cascade,
  player1_id        uuid,
  player1_name      text,
  player2_id        uuid,
  player2_name      text,
  status            text,
  current_question  integer default 0,
  total_questions   integer,
  time_per_question integer,
  joined_at         timestamptz default now(),
  updated_at        timestamptz default now()
);

create table if not exists public.trivia_spectators (
  match_id text,
  user_id  uuid references auth.users(id) on delete cascade,
  id       uuid default gen_random_uuid(),
  created_at timestamptz default now(),
  primary key (match_id, user_id)
);

create table if not exists public.trivia_stats (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  matches      integer default 0,
  wins         integer default 0,
  losses       integer default 0,
  total_score  integer default 0,
  updated_at   timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Tournaments
-- ----------------------------------------------------------------------------

create table if not exists public.tournaments (
  id               uuid primary key default gen_random_uuid(),
  tournament_id    text unique,
  name             text,
  description      text,
  category         text,
  difficulty       text,
  type             text,
  entry_fee        integer default 0,
  prize_pool       integer default 0,
  max_participants integer,
  participants     integer default 0,
  start_time       timestamptz,
  started_at       timestamptz,
  status           text default 'open',
  seed             integer,
  created_by       uuid,
  updated_at       timestamptz default now(),
  created_at       timestamptz default now()
);

create table if not exists public.tournament_registrations (
  id            uuid primary key default gen_random_uuid(),
  tournament_id text references public.tournaments(tournament_id) on delete cascade,
  user_id       uuid references auth.users(id) on delete cascade,
  user_name     text,
  user_avatar   text,
  seed          integer,
  position      integer,
  created_at    timestamptz default now()
);

create table if not exists public.tournament_matches (
  id               uuid primary key default gen_random_uuid(),
  tournament_id    text references public.tournaments(tournament_id) on delete cascade,
  round            integer,
  position         integer,
  status           text default 'pending',
  current_question integer default 0,
  started_at       timestamptz,
  updated_at       timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Content, devotionals, featured verses, notifications, activity
-- ----------------------------------------------------------------------------

create table if not exists public.devotionals (
  id                  uuid primary key default gen_random_uuid(),
  title               text,
  content             text,
  author              text,
  scripture_reference text,
  scripture_text      text,
  publish_date        date,
  is_published        boolean default false,
  created_by          uuid,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create table if not exists public.devotional_preferences (
  user_id    uuid references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz default now(),
  primary key (user_id, email)
);

create table if not exists public.featured_verses (
  id           uuid primary key default gen_random_uuid(),
  reference    text,
  verse_text   text,
  translation  text,
  display_date date,
  is_active    boolean default true,
  created_by   uuid,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table if not exists public.notification_preferences (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  email                 text,
  notifications_enabled boolean default false,
  email_enabled         boolean default false,
  push_enabled          boolean default false,
  include_daily_verse   boolean default true,
  include_wwjd          boolean default true,
  frequency             text default 'daily',
  notification_time     time,
  timezone              text,
  updated_at            timestamptz default now()
);

create table if not exists public.reminder_preferences (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  last_sent_at timestamptz,
  updated_at   timestamptz default now()
);

create table if not exists public.activity_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,
  session_id text,
  event_type text,
  path       text,
  referrer   text,
  user_agent text,
  metadata   jsonb default '{}'::jsonb,
  occurred_at timestamptz default now()
);
