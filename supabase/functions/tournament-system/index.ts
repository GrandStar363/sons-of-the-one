// tournament-system
//
// Called only by the st07 fork; Famous.ai never built it. Contract derived
// from TournamentOfDisciples.tsx, which reads results off `data.data`:
//
//   get_active_tournaments / get_user_tournaments / create_tournament
//   register                -> seeds a player, builds the bracket when full
//   get_bracket             -> { registrations, matches }
//   start_match / get_match_state / submit_answer
//
// Single elimination. The bracket is generated once, when registration fills,
// and winners are advanced into the next round's slot as matches complete.

import { admin, ok as okBase, fail, handler, corsHeaders } from '../_shared/db.ts';
import { pickQuestions } from '../_shared/questions.ts';

const QUESTIONS_PER_MATCH = 10;

// The component reads data.data.*, so responses are nested one level.
const ok = (data: Record<string, unknown>) => okBase({ data });

function seedFrom(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h || 1;
}

/** Build round 1 pairings: 1 vs N, 2 vs N-1, ... */
function buildFirstRound(tournamentId: string, regs: any[]) {
  const rows = [];
  for (let i = 0; i < Math.floor(regs.length / 2); i++) {
    const a = regs[i], b = regs[regs.length - 1 - i];
    rows.push({
      tournament_id: tournamentId, round: 1, position: i,
      player1_id: a.user_id, player1_name: a.user_name,
      player2_id: b.user_id, player2_name: b.user_name,
      status: 'pending',
    });
  }
  return rows;
}

Deno.serve(handler(async (body) => {
  const { action } = body;
  if (!action) return fail('action is required');
  const db = admin();

  if (action === 'get_active_tournaments') {
    const { data } = await db.from('tournaments').select('*')
      .in('status', ['registration', 'in_progress'])
      .order('start_time', { ascending: true });
    return ok({ tournaments: data ?? [] });
  }

  if (action === 'get_user_tournaments') {
    const userId = body.user_id ?? body.userId;
    if (!userId) return fail('user_id is required');
    const { data: regs } = await db.from('tournament_registrations')
      .select('tournament_id').eq('user_id', userId);
    const ids = (regs ?? []).map((r: any) => r.tournament_id);
    if (!ids.length) return ok({ tournaments: [] });
    const { data } = await db.from('tournaments').select('*').in('id', ids);
    return ok({ tournaments: data ?? [] });
  }

  if (action === 'create_tournament') {
    const { data, error } = await db.from('tournaments').insert({
      name: body.name ?? 'Tournament of Disciples',
      description: body.description ?? null,
      type: body.type ?? 'single_elimination',
      category: body.category ?? 'general',
      difficulty: body.difficulty ?? 'medium',
      entry_fee: body.entry_fee ?? 0,
      prize_pool: body.prize_pool ?? 0,
      max_participants: body.max_participants ?? 8,
      start_time: body.start_time ?? null,
      created_by: body.user_id ?? null,
      status: 'registration',
    }).select().single();
    if (error) throw error;
    return ok({ tournament: data });
  }

  if (action === 'register') {
    const tid = body.tournament_id, userId = body.user_id;
    if (!tid || !userId) return fail('tournament_id and user_id are required');

    const { data: t } = await db.from('tournaments').select('*').eq('id', tid).maybeSingle();
    if (!t) return fail('Tournament not found', 404);
    if (t.status !== 'registration') return fail('Registration is closed');

    const { count } = await db.from('tournament_registrations')
      .select('id', { count: 'exact', head: true }).eq('tournament_id', tid);
    if ((count ?? 0) >= t.max_participants) return fail('Tournament is full');

    const { error } = await db.from('tournament_registrations').insert({
      tournament_id: tid, user_id: userId,
      user_name: body.user_name ?? null, user_avatar: body.user_avatar ?? null,
      seed: (count ?? 0) + 1,
    });
    if (error) {
      if (error.code === '23505') return fail('You are already registered');
      throw error;
    }

    const filled = (count ?? 0) + 1;
    await db.from('tournaments')
      .update({ participants: filled, updated_at: new Date().toISOString() })
      .eq('id', tid);

    // Bracket is generated exactly once, when the last slot fills.
    if (filled === t.max_participants) {
      const { data: regs } = await db.from('tournament_registrations')
        .select('*').eq('tournament_id', tid).order('seed', { ascending: true });
      await db.from('tournament_matches').insert(buildFirstRound(tid, regs ?? []));
      await db.from('tournaments').update({ status: 'in_progress' }).eq('id', tid);
    }

    return ok({ registered: true, participants: filled,
                started: filled === t.max_participants });
  }

  if (action === 'get_bracket') {
    const tid = body.tournament_id;
    if (!tid) return fail('tournament_id is required');
    const { data: registrations } = await db.from('tournament_registrations')
      .select('*').eq('tournament_id', tid).order('seed', { ascending: true });
    const { data: matches } = await db.from('tournament_matches')
      .select('*').eq('tournament_id', tid)
      .order('round', { ascending: true }).order('position', { ascending: true });
    return ok({ registrations: registrations ?? [], matches: matches ?? [] });
  }

  if (action === 'start_match') {
    const mid = body.match_id;
    if (!mid) return fail('match_id is required');
    const { data: match } = await db.from('tournament_matches')
      .select('*').eq('id', mid).maybeSingle();
    if (!match) return fail('Match not found', 404);

    if (match.status === 'pending') {
      const questions = pickQuestions(QUESTIONS_PER_MATCH, seedFrom(match.id));
      await db.from('tournament_matches').update({
        status: 'active', questions, current_question: 0,
        started_at: new Date().toISOString(),
      }).eq('id', mid);
      return ok({ match: { ...match, status: 'active', questions, current_question: 0 },
                  both_ready: true });
    }
    return ok({ match, both_ready: match.status === 'active' });
  }

  if (action === 'get_match_state') {
    const mid = body.match_id;
    if (!mid) return fail('match_id is required');
    const { data: match } = await db.from('tournament_matches')
      .select('*').eq('id', mid).maybeSingle();
    if (!match) return fail('Match not found', 404);
    return ok({
      match,
      waiting_for_opponent: match.status === 'pending',
      match_completed: match.status === 'completed',
    });
  }

  if (action === 'submit_answer') {
    const mid = body.match_id, userId = body.user_id;
    if (!mid || !userId) return fail('match_id and user_id are required');
    const { data: match } = await db.from('tournament_matches')
      .select('*').eq('id', mid).maybeSingle();
    if (!match) return fail('Match not found', 404);

    const idx = body.question_index ?? match.current_question ?? 0;
    const q = (match.questions ?? [])[idx];
    const correct = q ? q.correct === body.answer : false;
    // Faster correct answers score higher, floored at 10.
    const taken = Number(body.time_taken ?? 0);
    const points = correct ? Math.max(10, 20 - Math.floor(taken / 3)) : 0;
    const isP1 = match.player1_id === userId;

    const patch: Record<string, unknown> = {};
    patch[isP1 ? 'player1_score' : 'player2_score'] =
      (isP1 ? match.player1_score : match.player2_score) + points;

    const next = idx + 1;
    const finished = next >= QUESTIONS_PER_MATCH;
    if (finished) {
      const p1 = (isP1 ? patch.player1_score : match.player1_score) as number;
      const p2 = (isP1 ? match.player2_score : patch.player2_score) as number;
      const winner = p1 === p2 ? match.player1_id : (p1 > p2 ? match.player1_id : match.player2_id);
      Object.assign(patch, { status: 'completed', winner_id: winner,
                             completed_at: new Date().toISOString() });
      await db.from('tournament_matches').update(patch).eq('id', mid);
      await advanceWinner(db, match, winner);
      return ok({ correct, points, match_completed: true, winner_id: winner });
    }

    patch.current_question = next;
    await db.from('tournament_matches').update(patch).eq('id', mid);
    return ok({ correct, points, match_completed: false, current_question: next });
  }

  return fail(`Unknown action: ${action}`);
}));

/**
 * Move a winner into the next round, creating that match if the sibling has
 * not finished yet. Two matches feed one slot: positions 0,1 -> 0; 2,3 -> 1.
 */
async function advanceWinner(db: any, match: any, winnerId: string | null) {
  if (!winnerId) return;
  const nextRound = (match.round ?? 1) + 1;
  const nextPos = Math.floor((match.position ?? 0) / 2);
  const slot = (match.position ?? 0) % 2 === 0 ? 1 : 2;

  const { data: reg } = await db.from('tournament_registrations')
    .select('user_name').eq('tournament_id', match.tournament_id)
    .eq('user_id', winnerId).maybeSingle();

  const { data: existing } = await db.from('tournament_matches').select('*')
    .eq('tournament_id', match.tournament_id)
    .eq('round', nextRound).eq('position', nextPos).maybeSingle();

  if (existing) {
    await db.from('tournament_matches').update({
      [`player${slot}_id`]: winnerId,
      [`player${slot}_name`]: reg?.user_name ?? null,
    }).eq('id', existing.id);
  } else {
    await db.from('tournament_matches').insert({
      tournament_id: match.tournament_id, round: nextRound, position: nextPos,
      [`player${slot}_id`]: winnerId,
      [`player${slot}_name`]: reg?.user_name ?? null,
      status: 'pending',
    });
  }

  // No sibling match left in this round means the tournament is decided.
  const { data: siblings } = await db.from('tournament_matches')
    .select('id,status').eq('tournament_id', match.tournament_id).eq('round', match.round);
  const allDone = (siblings ?? []).every((m: any) => m.status === 'completed');
  if (allDone && (siblings ?? []).length === 1) {
    await db.from('tournaments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', match.tournament_id);
  }
}

export { corsHeaders };
