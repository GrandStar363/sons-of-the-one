-- 0006_battle_mode.sql
-- Battle Mode (MultiplayerTrivia.tsx) and Spectator Mode: the columns the pages
-- play with. 0002 created a skeleton, so ready-up, scores and "answered"
-- flags had nowhere to live: two players could be matched, but after both
-- pressed "I'm Ready" the game never started.

alter table public.trivia_matches
  add column if not exists category               text    not null default 'general',
  add column if not exists player1_score          integer not null default 0,
  add column if not exists player2_score          integer not null default 0,
  add column if not exists player1_answers        jsonb   not null default '[]'::jsonb,
  add column if not exists player2_answers        jsonb   not null default '[]'::jsonb,
  add column if not exists player1_ready          boolean not null default false,
  add column if not exists player2_ready          boolean not null default false,
  add column if not exists player1_answered       boolean not null default false,
  add column if not exists player2_answered       boolean not null default false,
  add column if not exists current_question_start timestamptz,
  add column if not exists winner_name            text,
  add column if not exists realtime_mode          boolean not null default true,
  add column if not exists started_at             timestamptz,
  add column if not exists completed_at           timestamptz;

alter table public.trivia_stats
  add column if not exists draws           integer not null default 0,
  add column if not exists ranking_points  integer not null default 1000,
  add column if not exists win_streak      integer not null default 0,
  add column if not exists best_win_streak integer not null default 0;

create index if not exists trivia_matches_players_idx on public.trivia_matches (player1_id, player2_id, status);
create index if not exists trivia_matches_status_idx on public.trivia_matches (status, updated_at);
