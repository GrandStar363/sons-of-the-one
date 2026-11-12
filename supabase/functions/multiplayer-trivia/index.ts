// multiplayer-trivia — Battle Mode (live 1-v-1) and Spectator Mode.
//
// The contract is the two pages, MultiplayerTrivia.tsx and SpectatorMode.tsx:
//
//   join_queue      -> { matched, match? }      (poll it while searching)
//   leave_queue
//   leave_match     -> before the start: cancelled; during the game: forfeit
//   player_ready    -> { bothReady, match }
//   get_match_state -> { match, opponentAnswered, bothAnswered, myAnswered }
//   submit_answer   -> { correct, points, correctAnswer, bothAnswered }
//   next_question   -> { gameOver, match }       (safe to call from both phones)
//   get_stats / get_leaderboard / get_history
//   get_live_matches / join_spectate / leave_spectate / get_spectator_state
//
// Match status: ready (matched, waiting for both "I'm Ready") -> playing ->
// completed. Both players see the same question; it moves on once both have
// answered (or its time is up). A player who stops searching, never readies
// up, or leaves mid-game can't leave the other one stuck.
//
// The caller is identified from their session (Authorization header).

import { admin, ok, fail, handler, corsHeaders } from '../_shared/db.ts';
import { pickQuestions } from '../_shared/questions.ts';

const QUESTIONS_PER_MATCH = 10;
const SECONDS_PER_QUESTION = 15;
const GRACE_MS = 2500;
const QUEUE_FRESH_MS = 20_000;        // searchers poll every ~2s; older entries have left
const READY_TIMEOUT_MS = 2 * 60_000;   // matched but nobody readied up
const STALE_GAME_MS = 3 * 60_000;      // a game nobody is polling any more
const RANK = { win: 25, loss: -15, draw: 5 };

type Db = ReturnType<typeof admin>;

async function callerOf(req: Request, db: Db) {
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) return null;
  const { data } = await db.auth.getUser(jwt);
  return data?.user ?? null;
}
const nameOf = (u: any, fallback?: string | null) =>
  String(fallback || u?.user_metadata?.display_name || u?.user_metadata?.full_name || u?.email?.split('@')[0] || 'Player').slice(0, 40);

function seedFrom(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h || 1;
}
const now = () => new Date().toISOString();
const sideOf = (m: any, userId: string): 1 | 2 | null =>
  m.player1_id === userId ? 1 : m.player2_id === userId ? 2 : null;

async function loadMatch(db: Db, id: string) {
  const { data } = await db.from('trivia_matches').select('*').eq('id', id).maybeSingle();
  return data;
}

/** PlayerStats as the page reads it. */
const mapStats = (s: any, userId: string, name?: string | null) => ({
  id: s?.id ?? userId,
  user_id: userId,
  display_name: s?.display_name ?? name ?? 'Player',
  wins: s?.wins ?? 0,
  losses: s?.losses ?? 0,
  draws: s?.draws ?? 0,
  total_matches: s?.matches ?? 0,
  total_points_scored: s?.total_score ?? 0,
  ranking_points: s?.ranking_points ?? 1000,
  win_streak: s?.win_streak ?? 0,
  best_win_streak: s?.best_win_streak ?? 0,
});

async function bumpStats(db: Db, userId: string, name: string | null, result: 'win' | 'loss' | 'draw', score: number) {
  const { data: cur } = await db.from('trivia_stats').select('*').eq('user_id', userId).maybeSingle();
  const streak = result === 'win' ? (cur?.win_streak ?? 0) + 1 : 0;
  await db.from('trivia_stats').upsert({
    user_id: userId,
    display_name: name ?? cur?.display_name ?? null,
    matches: (cur?.matches ?? 0) + 1,
    wins: (cur?.wins ?? 0) + (result === 'win' ? 1 : 0),
    losses: (cur?.losses ?? 0) + (result === 'loss' ? 1 : 0),
    draws: (cur?.draws ?? 0) + (result === 'draw' ? 1 : 0),
    total_score: (cur?.total_score ?? 0) + score,
    ranking_points: Math.max(0, (cur?.ranking_points ?? 1000) + RANK[result]),
    win_streak: streak,
    best_win_streak: Math.max(cur?.best_win_streak ?? 0, streak),
    updated_at: now(),
  }, { onConflict: 'user_id' });
}

/** End the game once (status guard), then record both players' stats. */
async function complete(db: Db, m: any, forfeitBy?: string) {
  const p1 = m.player1_score ?? 0, p2 = m.player2_score ?? 0;
  const winner = forfeitBy
    ? (forfeitBy === m.player1_id ? m.player2_id : m.player1_id)
    : p1 === p2 ? null : p1 > p2 ? m.player1_id : m.player2_id;
  const { data: closed } = await db.from('trivia_matches').update({
    status: 'completed', winner_id: winner,
    winner_name: winner ? (winner === m.player1_id ? m.player1_name : m.player2_name) : null,
    completed_at: now(), updated_at: now(),
  }).eq('id', m.id).eq('status', 'playing').select().maybeSingle();
  if (!closed) return await loadMatch(db, m.id);
  const res = (id: string): 'win' | 'loss' | 'draw' => !winner ? 'draw' : winner === id ? 'win' : 'loss';
  if (closed.player1_id) await bumpStats(db, closed.player1_id, closed.player1_name, res(closed.player1_id), p1);
  if (closed.player2_id) await bumpStats(db, closed.player2_id, closed.player2_name, res(closed.player2_id), p2);
  return closed;
}

/** Time-outs and abandoned games. Returns the fresh row. */
async function settle(db: Db, m: any) {
  if (!m) return m;
  const t = Date.now();
  if (m.status === 'ready' && t - new Date(m.created_at).getTime() > READY_TIMEOUT_MS) {
    await db.from('trivia_matches').update({ status: 'abandoned', updated_at: now() }).eq('id', m.id).eq('status', 'ready');
    return await loadMatch(db, m.id);
  }
  if (m.status === 'playing' && m.current_question_start) {
    const deadline = new Date(m.current_question_start).getTime() + (m.time_per_question ?? SECONDS_PER_QUESTION) * 1000 + GRACE_MS;
    if (t > deadline && !(m.player1_answered && m.player2_answered)) {
      // Whoever hasn't answered in time gets it wrong. (Not counted as
      // activity: updated_at only moves when a player does something.)
      const patch: Record<string, unknown> = {};
      for (const s of [1, 2] as const) {
        if (!m[`player${s}_answered`]) {
          patch[`player${s}_answered`] = true;
          patch[`player${s}_answers`] = [...(m[`player${s}_answers`] ?? []),
            { q: m.current_question, answer: -1, correct: false, points: 0, timeRemaining: 0, answeredAt: now() }];
        }
      }
      const { data } = await db.from('trivia_matches').update(patch)
        .eq('id', m.id).eq('current_question', m.current_question).select().maybeSingle();
      m = data ?? await loadMatch(db, m.id);
    }
    // Nobody has touched it for minutes (both left): finish it.
    if (m.status === 'playing' && t - new Date(m.updated_at ?? m.created_at).getTime() > STALE_GAME_MS) {
      return await complete(db, m);
    }
  }
  return m;
}

const stateFor = (m: any, userId: string | null) => {
  const s = userId ? sideOf(m, userId) : null;
  const mine = s ? m[`player${s}_answered`] : false;
  const theirs = s ? m[`player${s === 1 ? 2 : 1}_answered`] : false;
  return {
    match: m,
    myAnswered: !!mine,
    opponentAnswered: !!theirs,
    bothAnswered: !!(m.player1_answered && m.player2_answered),
  };
};

Deno.serve(handler(async (body, req) => {
  const { action } = body;
  if (!action) return fail('action is required');
  const db = admin();
  const user = await callerOf(req, db);
  const matchId = body.matchId ?? body.match_id;

  // ---------- public reads ----------
  if (action === 'get_leaderboard') {
    const { data } = await db.from('trivia_stats').select('*')
      .order('ranking_points', { ascending: false }).order('wins', { ascending: false }).limit(20);
    return ok({ leaderboard: (data ?? []).map((s: any) => mapStats(s, s.user_id)) });
  }

  if (action === 'get_live_matches') {
    const since = new Date(Date.now() - STALE_GAME_MS).toISOString();
    const { data } = await db.from('trivia_matches').select('*')
      .in('status', ['ready', 'playing']).gte('updated_at', since)
      .order('created_at', { ascending: false }).limit(20);
    const ids = (data ?? []).map((m: any) => m.id);
    const { data: specs } = ids.length
      ? await db.from('trivia_spectators').select('match_id').in('match_id', ids)
      : { data: [] as any[] };
    const counts: Record<string, number> = {};
    (specs ?? []).forEach((s: any) => { counts[s.match_id] = (counts[s.match_id] ?? 0) + 1; });
    return ok({
      matches: (data ?? []).map((m: any) => ({
        id: m.id, player1_name: m.player1_name, player2_name: m.player2_name,
        player1_score: m.player1_score, player2_score: m.player2_score,
        current_question: m.current_question, total_questions: m.total_questions,
        status: m.status, category: m.category, started_at: m.started_at ?? m.created_at,
        spectator_count: counts[m.id] ?? 0,
      })),
    });
  }

  if (action === 'get_spectator_state') {
    if (!matchId) return fail('matchId is required');
    const m = await settle(db, await loadMatch(db, matchId));
    if (!m) return fail('Match not found', 404);
    const { count } = await db.from('trivia_spectators')
      .select('id', { count: 'exact', head: true }).eq('match_id', matchId);
    const q = (m.questions ?? [])[m.current_question ?? 0];
    // Reveal the right answer only once both players have answered.
    const reveal = m.status === 'completed' || (m.player1_answered && m.player2_answered);
    const feed = [
      ...(m.player1_answers ?? []).map((a: any) => ({ ...a, playerName: m.player1_name, playerId: m.player1_id })),
      ...(m.player2_answers ?? []).map((a: any) => ({ ...a, playerName: m.player2_name, playerId: m.player2_id })),
    ].sort((a, b) => String(b.answeredAt).localeCompare(String(a.answeredAt))).slice(0, 20)
      .map((a) => ({
        playerName: a.playerName, playerId: a.playerId, questionIndex: a.q,
        isCorrect: !!a.correct, points: a.points ?? 0, timeRemaining: a.timeRemaining ?? 0, answeredAt: a.answeredAt,
      }));
    const { questions: _hidden, ...publicMatch } = m;
    return ok({
      match: { ...publicMatch, spectator_count: count ?? 0 },
      currentQuestion: q && m.status === 'playing' ? {
        question: q.question,
        options: q.options.map((text: string, i: number) => (reveal ? { text, isCorrect: i === q.correct } : { text })),
      } : null,
      answerFeed: feed,
    });
  }

  // ---------- everything else needs a signed-in member ----------
  if (!user) return fail('Please sign in to play Battle Mode.', 401);
  const me = user.id;

  if (action === 'get_stats') {
    const { data } = await db.from('trivia_stats').select('*').eq('user_id', me).maybeSingle();
    return ok({ stats: mapStats(data, me, nameOf(user, body.displayName)) });
  }

  if (action === 'get_history') {
    const { data } = await db.from('trivia_matches').select('*')
      .or(`player1_id.eq.${me},player2_id.eq.${me}`).eq('status', 'completed')
      .order('created_at', { ascending: false }).limit(25);
    return ok({
      history: (data ?? []).map((m: any) => {
        const s = sideOf(m, me)!;
        const result = !m.winner_id ? 'draw' : m.winner_id === me ? 'win' : 'loss';
        return {
          id: m.id,
          opponent_name: s === 1 ? m.player2_name : m.player1_name,
          user_score: s === 1 ? m.player1_score : m.player2_score,
          opponent_score: s === 1 ? m.player2_score : m.player1_score,
          result,
          ranking_change: RANK[result as keyof typeof RANK],
          played_at: m.completed_at ?? m.created_at,
        };
      }),
    });
  }

  // ---------- matchmaking ----------
  if (action === 'join_queue') {
    const myName = nameOf(user, body.displayName);
    // Already in a match? Hand it back (abandoned/stale ones are closed first).
    const { data: mine } = await db.from('trivia_matches').select('*')
      .or(`player1_id.eq.${me},player2_id.eq.${me}`).in('status', ['ready', 'playing'])
      .order('created_at', { ascending: false }).limit(3);
    for (const m of mine ?? []) {
      const fresh = await settle(db, m);
      if (fresh && (fresh.status === 'ready' || fresh.status === 'playing')) {
        await db.from('trivia_queue').delete().eq('user_id', me);
        return ok({ matched: true, match: fresh });
      }
    }

    // A search poll only keeps an existing place in the queue: if the player
    // has left (a poll can arrive just after "leave"), don't put them back.
    if (body.poll) {
      const { data: row } = await db.from('trivia_queue').select('id').eq('user_id', me).maybeSingle();
      if (!row) return ok({ matched: false, queued: false });
    }

    // Someone else searching right now?
    const freshSince = new Date(Date.now() - QUEUE_FRESH_MS).toISOString();
    await db.from('trivia_queue').delete().lt('joined_at', freshSince);
    const { data: waiting } = await db.from('trivia_queue').select('*')
      .neq('user_id', me).gte('joined_at', freshSince)
      .order('joined_at', { ascending: true }).limit(1).maybeSingle();

    if (waiting) {
      // Claim them (only one searcher can).
      const { data: claimed } = await db.from('trivia_queue').delete().eq('id', waiting.id).select().maybeSingle();
      if (claimed) {
        await db.from('trivia_queue').delete().eq('user_id', me);
        const { data: created, error } = await db.from('trivia_matches').insert({
          player1_id: waiting.user_id, player1_name: waiting.display_name ?? 'Player',
          player2_id: me, player2_name: myName,
          status: 'ready', total_questions: QUESTIONS_PER_MATCH,
          time_per_question: SECONDS_PER_QUESTION, current_question: 0,
          category: body.category ?? 'general',
        }).select().single();
        if (error) throw error;
        const questions = pickQuestions(QUESTIONS_PER_MATCH, seedFrom(created.id))
          .map(({ question, options, correct, reference }) => ({ question, options, correct, reference }));
        const { data: match } = await db.from('trivia_matches').update({ questions }).eq('id', created.id).select().single();
        return ok({ matched: true, match });
      }
    }

    // Wait in the queue (re-joining refreshes our place as "still here").
    await db.from('trivia_queue').upsert(
      { user_id: me, display_name: myName, category: body.category ?? 'general', joined_at: now() },
      { onConflict: 'user_id' });
    return ok({ matched: false, queued: true });
  }

  if (action === 'leave_queue') {
    await db.from('trivia_queue').delete().eq('user_id', me);
    return ok({ left: true });
  }

  if (action === 'join_spectate' || action === 'leave_spectate') {
    if (!matchId) return fail('matchId is required');
    if (action === 'join_spectate') {
      const m = await loadMatch(db, matchId);
      if (!m) return fail('Match not found', 404);
      await db.from('trivia_spectators').upsert({ match_id: matchId, user_id: me }, { onConflict: 'match_id,user_id' });
      const { questions: _hidden, ...publicMatch } = m;
      return ok({ match: publicMatch });
    }
    await db.from('trivia_spectators').delete().eq('match_id', matchId).eq('user_id', me);
    return ok({ left: true });
  }

  // ---------- the game ----------
  if (!matchId) return fail('matchId is required');
  let m = await loadMatch(db, matchId);
  if (!m) return fail('Match not found', 404);
  const side = sideOf(m, me);
  if (!side) return fail("You're not playing in this match.", 403);

  if (action === 'leave_match') {
    // Before the start: the match is off for both. During the game: forfeit.
    if (m.status === 'ready') {
      await db.from('trivia_matches').update({ status: 'abandoned', updated_at: now() }).eq('id', matchId).eq('status', 'ready');
    } else if (m.status === 'playing') {
      await complete(db, m, me);
    }
    return ok({ left: true, match: await loadMatch(db, matchId) });
  }

  if (action === 'player_ready') {
    m = await settle(db, m);
    if (m.status === 'ready') {
      const { data: updated } = await db.from('trivia_matches')
        .update({ [`player${side}_ready`]: true, updated_at: now() }).eq('id', matchId).select().single();
      m = updated;
      if (m.player1_ready && m.player2_ready) {
        const { data: started } = await db.from('trivia_matches').update({
          status: 'playing', current_question: 0, started_at: now(),
          player1_answered: false, player2_answered: false,
          current_question_start: new Date(Date.now() + 1000).toISOString(),
          updated_at: now(),
        }).eq('id', matchId).eq('status', 'ready').select().maybeSingle();
        m = started ?? await loadMatch(db, matchId);
      }
    }
    return ok({ bothReady: m.status === 'playing', match: m });
  }

  if (action === 'get_match_state') {
    m = await settle(db, m);
    // Polling keeps the game alive (see STALE_GAME_MS).
    if (m.status === 'playing') {
      await db.from('trivia_matches').update({ updated_at: now() }).eq('id', matchId);
    }
    return ok(stateFor(m, me));
  }

  if (action === 'submit_answer') {
    m = await settle(db, m);
    const idx = Number(body.questionIndex ?? m.current_question);
    if (m.status !== 'playing' || idx !== m.current_question || m[`player${side}_answered`]) {
      return ok({ correct: false, points: 0, stale: true, ...stateFor(m, me) });
    }
    const q = (m.questions ?? [])[idx];
    const answer = Number(body.answer);
    const correct = !!q && q.correct === answer;
    const timeRemaining = Math.max(0, Math.min(m.time_per_question ?? SECONDS_PER_QUESTION, Number(body.timeRemaining) || 0));
    // 10 for a right answer plus a point for every second left.
    const points = correct ? 10 + Math.round(timeRemaining) : 0;
    const { data: saved } = await db.from('trivia_matches').update({
      [`player${side}_answered`]: true,
      [`player${side}_score`]: (m[`player${side}_score`] ?? 0) + points,
      [`player${side}_answers`]: [...(m[`player${side}_answers`] ?? []),
        { q: idx, answer, correct, points, timeRemaining, answeredAt: now() }],
      updated_at: now(),
    }).eq('id', matchId).eq('current_question', idx).eq(`player${side}_answered`, false).select().maybeSingle();
    const after = saved ?? await loadMatch(db, matchId);
    return ok({ correct: saved ? correct : false, points: saved ? points : 0, correctAnswer: q?.correct ?? null, ...stateFor(after, me) });
  }

  if (action === 'next_question') {
    m = await settle(db, m);
    if (m.status === 'completed') return ok({ gameOver: true, match: m });
    const idx = body.questionIndex === undefined ? m.current_question : Number(body.questionIndex);
    // Only from the question both have finished; the second phone's call is a no-op.
    if (m.status === 'playing' && idx === m.current_question && m.player1_answered && m.player2_answered) {
      const next = m.current_question + 1;
      if (next >= (m.total_questions ?? QUESTIONS_PER_MATCH)) {
        const done = await complete(db, m);
        return ok({ gameOver: true, match: done });
      }
      const { data: moved } = await db.from('trivia_matches').update({
        current_question: next, player1_answered: false, player2_answered: false,
        current_question_start: now(), updated_at: now(),
      }).eq('id', matchId).eq('current_question', idx).select().maybeSingle();
      m = moved ?? await loadMatch(db, matchId);
    }
    return ok({ gameOver: m.status === 'completed', match: m });
  }

  return fail(`Unknown action: ${action}`);
}));

export { corsHeaders };
