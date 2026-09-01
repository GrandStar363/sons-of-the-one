// multiplayer-trivia
//
// Called only by the st07 fork; Famous.ai never built it. Contract derived
// from MultiplayerTrivia.tsx and SpectatorMode.tsx:
//
//   join_queue / leave_queue      matchmaking against trivia_queue
//   player_ready                  both players ready -> match starts
//   get_match_state               poll for opponent + current question
//   submit_answer / next_question gameplay
//   get_stats / get_leaderboard / get_history
//   get_live_matches / join_spectate / leave_spectate / get_spectator_state
//
// Matchmaking is intentionally simple: the queue is small, so the oldest
// waiting player is paired on join. Both players get the same questions via a
// seed derived from the match id, so no question state has to be synchronised.

import { admin, ok, fail, handler, corsHeaders } from '../_shared/db.ts';
import { pickQuestions } from '../_shared/questions.ts';

const QUESTIONS_PER_MATCH = 10;
const SECONDS_PER_QUESTION = 15;

function seedFrom(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h || 1;
}

async function bumpStats(db: any, userId: string, displayName: string | null,
                         won: boolean, score: number) {
  const { data: cur } = await db.from('trivia_stats')
    .select('*').eq('user_id', userId).maybeSingle();
  await db.from('trivia_stats').upsert({
    user_id: userId,
    display_name: displayName ?? cur?.display_name ?? null,
    matches: (cur?.matches ?? 0) + 1,
    wins: (cur?.wins ?? 0) + (won ? 1 : 0),
    losses: (cur?.losses ?? 0) + (won ? 0 : 1),
    total_score: (cur?.total_score ?? 0) + score,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
}

Deno.serve(handler(async (body) => {
  const { action, userId, displayName, matchId, category } = body;
  if (!action) return fail('action is required');
  const db = admin();

  // ---------- matchmaking ----------
  if (action === 'join_queue') {
    if (!userId) return fail('userId is required');

    // Already in a live match? Return it instead of queueing again.
    const { data: live } = await db.from('trivia_matches').select('*')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .in('status', ['ready', 'active']).limit(1).maybeSingle();
    if (live) return ok({ matched: true, match: live });

    const { data: waiting } = await db.from('trivia_queue').select('*')
      .neq('user_id', userId).order('joined_at', { ascending: true })
      .limit(1).maybeSingle();

    if (waiting) {
      await db.from('trivia_queue').delete().eq('user_id', waiting.user_id);
      const { data: match, error } = await db.from('trivia_matches').insert({
        player1_id: waiting.user_id, player1_name: waiting.display_name,
        player2_id: userId, player2_name: displayName ?? null,
        status: 'ready', total_questions: QUESTIONS_PER_MATCH,
        time_per_question: SECONDS_PER_QUESTION, current_question: 0,
      }).select().single();
      if (error) throw error;

      const questions = pickQuestions(QUESTIONS_PER_MATCH, seedFrom(match.id));
      await db.from('trivia_matches').update({ questions }).eq('id', match.id);
      return ok({ matched: true, match: { ...match, questions },
                  opponent: { id: waiting.user_id, name: waiting.display_name } });
    }

    await db.from('trivia_queue').upsert(
      { user_id: userId, display_name: displayName ?? null, category: category ?? 'general' },
      { onConflict: 'user_id' });
    return ok({ matched: false, queued: true });
  }

  if (action === 'leave_queue') {
    if (!userId) return fail('userId is required');
    await db.from('trivia_queue').delete().eq('user_id', userId);
    return ok({ left: true });
  }

  if (action === 'player_ready') {
    if (!matchId) return fail('matchId is required');
    const { data: match } = await db.from('trivia_matches')
      .select('*').eq('id', matchId).maybeSingle();
    if (!match) return fail('Match not found', 404);
    if (match.status === 'ready') {
      await db.from('trivia_matches')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', matchId);
    }
    return ok({ both: true, game: { ...match, status: 'active' } });
  }

  // ---------- gameplay ----------
  if (action === 'get_match_state') {
    if (!matchId) return fail('matchId is required');
    const { data: match } = await db.from('trivia_matches')
      .select('*').eq('id', matchId).maybeSingle();
    if (!match) return fail('Match not found', 404);
    return ok({ match, current: match.current_question ?? 0 });
  }

  if (action === 'submit_answer') {
    if (!matchId || !userId) return fail('matchId and userId are required');
    const { data: match } = await db.from('trivia_matches')
      .select('*').eq('id', matchId).maybeSingle();
    if (!match) return fail('Match not found', 404);

    const idx = match.current_question ?? 0;
    const q = (match.questions ?? [])[idx];
    const correct = q ? q.correct === body.answer : false;
    const isP1 = match.player1_id === userId;
    const points = correct ? 20 : 0;

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    patch[isP1 ? 'player1_score' : 'player2_score'] =
      (isP1 ? match.player1_score : match.player2_score) + points;
    await db.from('trivia_matches').update(patch).eq('id', matchId);

    return ok({ correct, points, answer: q?.correct ?? null });
  }

  if (action === 'next_question') {
    if (!matchId) return fail('matchId is required');
    const { data: match } = await db.from('trivia_matches')
      .select('*').eq('id', matchId).maybeSingle();
    if (!match) return fail('Match not found', 404);

    const next = (match.current_question ?? 0) + 1;
    const finished = next >= (match.total_questions ?? QUESTIONS_PER_MATCH);

    if (finished) {
      const p1 = match.player1_score ?? 0, p2 = match.player2_score ?? 0;
      const winner = p1 === p2 ? null : (p1 > p2 ? match.player1_id : match.player2_id);
      await db.from('trivia_matches')
        .update({ status: 'completed', winner_id: winner,
                  updated_at: new Date().toISOString() }).eq('id', matchId);
      if (match.player1_id) await bumpStats(db, match.player1_id, match.player1_name, winner === match.player1_id, p1);
      if (match.player2_id) await bumpStats(db, match.player2_id, match.player2_name, winner === match.player2_id, p2);
      return ok({ match_completed: true, winner_id: winner, player1_score: p1, player2_score: p2 });
    }

    await db.from('trivia_matches')
      .update({ current_question: next, updated_at: new Date().toISOString() })
      .eq('id', matchId);
    return ok({ current: next, match_completed: false });
  }

  // ---------- stats ----------
  if (action === 'get_stats') {
    if (!userId) return fail('userId is required');
    const { data } = await db.from('trivia_stats')
      .select('*').eq('user_id', userId).maybeSingle();
    return ok({
      stats: data ?? { user_id: userId, display_name: displayName ?? null,
                       matches: 0, wins: 0, losses: 0, total_score: 0 },
      display_name: data?.display_name ?? displayName ?? null,
    });
  }

  if (action === 'get_leaderboard') {
    const { data } = await db.from('trivia_stats').select('*')
      .order('total_score', { ascending: false }).limit(20);
    return ok({ leaderboard: data ?? [] });
  }

  if (action === 'get_history') {
    if (!userId) return fail('userId is required');
    const { data } = await db.from('trivia_matches').select('*')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .eq('status', 'completed')
      .order('created_at', { ascending: false }).limit(25);
    return ok({ history: data ?? [] });
  }

  // ---------- spectating ----------
  if (action === 'get_live_matches') {
    const { data } = await db.from('trivia_matches').select('*')
      .in('status', ['ready', 'active'])
      .order('created_at', { ascending: false }).limit(20);
    return ok({ matches: data ?? [] });
  }

  if (action === 'join_spectate') {
    if (!matchId) return fail('matchId is required');
    await db.from('trivia_spectators')
      .upsert({ match_id: matchId, user_id: userId ?? null },
              { onConflict: 'match_id,user_id' });
    const { data: match } = await db.from('trivia_matches')
      .select('*').eq('id', matchId).maybeSingle();
    return ok({ match });
  }

  if (action === 'leave_spectate') {
    if (!matchId) return fail('matchId is required');
    await db.from('trivia_spectators').delete()
      .eq('match_id', matchId).eq('user_id', userId ?? null);
    return ok({ left: true });
  }

  if (action === 'get_spectator_state') {
    if (!matchId) return fail('matchId is required');
    const { data: match } = await db.from('trivia_matches')
      .select('*').eq('id', matchId).maybeSingle();
    if (!match) return fail('Match not found', 404);
    const { count } = await db.from('trivia_spectators')
      .select('id', { count: 'exact', head: true }).eq('match_id', matchId);
    // Spectators must not receive the answer key for the live question.
    const questions = (match.questions ?? []).map((q: any, i: number) =>
      i === (match.current_question ?? 0) ? { ...q, correct: undefined } : q);
    return ok({ match: { ...match, questions },
                current: match.current_question ?? 0, spectators: count ?? 0 });
  }

  return fail(`Unknown action: ${action}`);
}));

export { corsHeaders };
