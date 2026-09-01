-- 0002_create_missing_tables.sql
-- Create the ~27 tables the application code depends on but that were never
-- created in this database. Columns/types/constraints derived from the edge
-- functions and hooks that own each table. `avatars` (Supabase Storage bucket)
-- and `bookmarks` (dead/commented code) are intentionally NOT created.

begin;

-- ===========================================================================
-- Admin / identity
-- ===========================================================================
create table if not exists public.app_users (
  id              uuid primary key,               -- = auth.users.id
  email           text unique,
  name            text,
  is_subscribed   boolean default false,
  last_active     timestamptz,
  total_donations numeric default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists public.admins (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  name          text,
  role          text not null default 'admin',    -- 'admin' | 'super_admin'
  password_hash text not null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.admin_sessions (
  token      text primary key,
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

-- ===========================================================================
-- Donations & subscriptions (Stripe) — written only by edge functions
-- ===========================================================================
create table if not exists public.donations (
  id                       uuid primary key default gen_random_uuid(),
  email                    text,
  name                     text,
  amount                   integer,               -- cents
  currency                 text default 'usd',
  donation_type            text default 'one_time',
  message                  text,
  show_on_wall             boolean default false,
  status                   text default 'pending',
  stripe_payment_intent_id text,
  receipt_number           text,
  email_receipt_sent       boolean default false,
  email_receipt_sent_at    timestamptz,
  email_send_attempts      integer default 0,
  email_send_error         text,
  completed_at             timestamptz,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

create table if not exists public.recurring_donations (
  id                     uuid primary key default gen_random_uuid(),
  email                  text,
  name                   text,
  amount                 integer,
  currency               text default 'usd',
  status                 text default 'active',
  next_billing_date      timestamptz,
  cancelled_at           timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text,
  stripe_price_id        text,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create table if not exists public.user_subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid,
  email                  text,
  status                 text,
  plan_type              text,
  stripe_customer_id     text,
  stripe_subscription_id text,
  trial_start            timestamptz,
  trial_end              timestamptz,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);
-- Both are used as upsert onConflict targets (create-subscription: email,
-- referral-system: user_id). Partial-null uniqueness is fine.
create unique index if not exists user_subscriptions_email_key   on public.user_subscriptions (email);
create unique index if not exists user_subscriptions_user_id_key on public.user_subscriptions (user_id);

create table if not exists public.subscription_history (
  id                     uuid primary key default gen_random_uuid(),
  user_subscription_id   uuid references public.user_subscriptions(id) on delete cascade,
  email                  text,
  event_type             text,
  plan_type              text,
  description            text,
  stripe_subscription_id text,
  metadata               jsonb default '{}'::jsonb,
  created_at             timestamptz default now()
);

create table if not exists public.donation_impact_metrics (
  id           uuid primary key default gen_random_uuid(),
  metric_name  text unique,
  metric_value numeric default 0,
  updated_at   timestamptz default now()
);

-- ===========================================================================
-- Support / contact
-- ===========================================================================
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

-- ===========================================================================
-- Content / CMS (admin-content) + email prefs
-- ===========================================================================
create table if not exists public.devotionals (
  id                  uuid primary key default gen_random_uuid(),
  title               text,
  content             text,
  scripture_reference text,
  scripture_text      text,
  author              text,
  is_published        boolean default false,
  publish_date        date,
  created_by          uuid,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create table if not exists public.featured_verses (
  id           uuid primary key default gen_random_uuid(),
  reference    text,
  verse_text   text,
  translation  text default 'KJV',
  display_date date,
  is_active    boolean default true,
  created_by   uuid,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table if not exists public.devotional_preferences (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid,
  email           text,
  subscribed      boolean default false,
  frequency       text default 'daily',
  send_time       text default '06:00',
  timezone        text default 'America/New_York',
  include_verse   boolean default true,
  include_prayer  boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create unique index if not exists devotional_preferences_user_id_key on public.devotional_preferences (user_id);
create unique index if not exists devotional_preferences_email_key   on public.devotional_preferences (email);

create table if not exists public.reminder_preferences (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid,
  email                       text,
  display_name                text,
  reminders_enabled           boolean default true,
  continue_reading_enabled    boolean default true,
  new_study_suggestions       boolean default true,
  encouragement_enabled       boolean default true,
  trivia_challenge_enabled    boolean default true,
  competition_invites_enabled boolean default true,
  leaderboard_updates_enabled boolean default true,
  reminder_time               text default '07:00',
  timezone                    text default 'America/New_York',
  frequency                   text default 'daily',
  last_sent_at                timestamptz,
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);
create unique index if not exists reminder_preferences_user_id_key on public.reminder_preferences (user_id);

-- ===========================================================================
-- Activity / analytics
-- ===========================================================================
create table if not exists public.activity_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid,
  session_id  text,
  event_type  text default 'page_view',
  path        text,
  referrer    text,
  user_agent  text,
  metadata    jsonb default '{}'::jsonb,
  occurred_at timestamptz default now()
);

create table if not exists public.user_activity (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid,
  last_book    text,
  last_chapter integer,
  updated_at   timestamptz default now()
);
create unique index if not exists user_activity_user_id_key on public.user_activity (user_id);

-- ===========================================================================
-- Referrals
-- ===========================================================================
create table if not exists public.referrals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid,
  referral_code  text,
  signups        integer default 0,
  trials_claimed integer default 0,
  created_at     timestamptz default now()
);
create unique index if not exists referrals_user_id_key       on public.referrals (user_id);
create unique index if not exists referrals_referral_code_key on public.referrals (referral_code);

create table if not exists public.referral_claims (
  id             uuid primary key default gen_random_uuid(),
  referral_code  text,
  referred_email text,
  referred_user  uuid,
  trial_days     integer,
  created_at     timestamptz default now()
);
-- One trial per person per code (function relies on 23505 here).
create unique index if not exists referral_claims_code_email_key
  on public.referral_claims (referral_code, referred_email);

create table if not exists public.referral_shares (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid,
  referral_code text,
  platform      text,
  created_at    timestamptz default now()
);

-- ===========================================================================
-- Trivia (multiplayer / spectator)
-- ===========================================================================
create table if not exists public.trivia_matches (
  id                uuid primary key default gen_random_uuid(),
  player1_id        uuid,
  player1_name      text,
  player2_id        uuid,
  player2_name      text,
  status            text default 'ready',
  total_questions   integer,
  time_per_question integer,
  current_question  integer default 0,
  questions         jsonb,
  winner_id         uuid,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table if not exists public.trivia_queue (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid,
  display_name text,
  category     text default 'general',
  joined_at    timestamptz default now()
);
create unique index if not exists trivia_queue_user_id_key on public.trivia_queue (user_id);

create table if not exists public.trivia_spectators (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid references public.trivia_matches(id) on delete cascade,
  user_id    uuid,
  created_at timestamptz default now()
);
create unique index if not exists trivia_spectators_match_user_key
  on public.trivia_spectators (match_id, user_id);

create table if not exists public.trivia_stats (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid,
  display_name text,
  matches      integer default 0,
  wins         integer default 0,
  losses       integer default 0,
  total_score  integer default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create unique index if not exists trivia_stats_user_id_key on public.trivia_stats (user_id);

-- ===========================================================================
-- Tournaments
-- ===========================================================================
create table if not exists public.tournaments (
  id               uuid primary key default gen_random_uuid(),
  name             text,
  description      text,
  type             text default 'single_elimination',
  category         text default 'general',
  difficulty       text default 'medium',
  entry_fee        integer default 0,
  prize_pool       integer default 0,
  max_participants integer default 8,
  participants     integer default 0,
  start_time       timestamptz,
  status           text default 'registration',
  created_by       uuid,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table if not exists public.tournament_registrations (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  user_id       uuid,
  user_name     text,
  user_avatar   text,
  seed          integer,
  position      integer,
  created_at    timestamptz default now()
);
create unique index if not exists tournament_registrations_tournament_user_key
  on public.tournament_registrations (tournament_id, user_id);

create table if not exists public.tournament_matches (
  id               uuid primary key default gen_random_uuid(),
  tournament_id    uuid references public.tournaments(id) on delete cascade,
  round            integer,
  position         integer,
  player1_id       uuid,
  player1_name     text,
  player2_id       uuid,
  player2_name     text,
  winner_id        uuid,
  status           text default 'pending',
  current_question integer default 0,
  started_at       timestamptz,
  updated_at       timestamptz default now(),
  created_at       timestamptz default now()
);

-- ===========================================================================
-- Journal (real table, not a user_data blob)
-- ===========================================================================
create table if not exists public.journal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,
  title      text,
  content    text,
  entry_type text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists journal_entries_user_id_idx on public.journal_entries (user_id);

commit;
