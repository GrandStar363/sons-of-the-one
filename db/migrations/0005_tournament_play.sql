-- 0005_tournament_play.sql
-- Tournament of Disciples: the columns the page (TournamentOfDisciples.tsx)
-- actually plays with. 0002 created only a skeleton, so the bracket, the
-- ready-up, the shared question timer and the scores had nowhere to live and
-- the page crashed on open.
--
-- Matches identify players by their *registration* id (the page compares
-- player1_id/player2_id/winner_id with the caller's registration id).

alter table public.tournaments
  add column if not exists current_round integer not null default 0,
  add column if not exists total_rounds  integer not null default 2,
  add column if not exists end_time      timestamptz;

alter table public.tournament_registrations
  add column if not exists status        text    not null default 'registered', -- registered | active | eliminated | winner
  add column if not exists current_round integer not null default 1,
  add column if not exists total_score   integer not null default 0,
  add column if not exists matches_won   integer not null default 0,
  add column if not exists matches_lost  integer not null default 0;

-- One registration per person per tournament (the function relied on this
-- unique violation to say "already registered", but nothing enforced it).
create unique index if not exists tournament_registrations_one_per_user
  on public.tournament_registrations (tournament_id, user_id);

alter table public.tournament_matches
  add column if not exists match_number           integer,
  add column if not exists player1_score          integer not null default 0,
  add column if not exists player2_score          integer not null default 0,
  add column if not exists player1_answers        jsonb   not null default '[]'::jsonb,
  add column if not exists player2_answers        jsonb   not null default '[]'::jsonb,
  add column if not exists player1_ready          boolean not null default false,
  add column if not exists player2_ready          boolean not null default false,
  add column if not exists player1_current_answer integer,
  add column if not exists player2_current_answer integer,
  add column if not exists questions              jsonb   not null default '[]'::jsonb,
  add column if not exists question_start_time    timestamptz,
  add column if not exists time_per_question      integer not null default 15000, -- milliseconds
  add column if not exists completed_at           timestamptz;

create index if not exists tournament_matches_tournament_idx
  on public.tournament_matches (tournament_id, round, match_number);
