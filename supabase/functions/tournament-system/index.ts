// tournament-system — "Tournament of Disciples" (single elimination, live 1-v-1).
//
// The contract is the page, TournamentOfDisciples.tsx, which reads `data.data`:
//
//   get_active_tournaments              -> Tournament[]
//   get_user_tournaments                -> Registration[] (each with `tournaments`)
//   create_tournament                   -> { tournament }
//   register  { tournament_id }         -> { registered, participants, started }
//   get_bracket { tournament_id }       -> { tournament, registrations, matches }
//   start_match { match_id }            -> { match, both_ready, waiting_for_opponent }
//   get_match_state { match_id }        -> { match, waiting_for_opponent, match_completed }
//   submit_answer { match_id, question_index, answer, time_taken(ms) }
//                                       -> { answer_result, match, match_completed, waiting_for_opponent }
//
// Matches name players by *registration* id. Both players see the same
// question at the same time: the question advances once both have answered,
// or when its time runs out (checked lazily on every poll, so a player who
// leaves can't stall the match). A player who readies up and is left waiting
// for FORFEIT_MS wins by forfeit.
//
// The caller is identified from their session (Authorization header), never
// from ids in the request body.

import { admin, ok as okBase, fail, handler, corsHeaders } from '../_shared/db.ts';
import { pickQuestions } from '../_shared/questions.ts';

const QUESTIONS_PER_MATCH = 10;
const TIME_PER_QUESTION_MS = 15000;
const GRACE_MS = 2500;              // network slack before a question times out
const REVEAL_MS = 2000;             // pause between questions to show the result
const FORFEIT_MS = 3 * 60 * 1000;   // opponent never readied up
const SIZES = [2, 4, 8, 16];
const MAX_OPEN_TOURNAMENTS = 3;

const ok = (data: unknown) => okBase({ data, server_now: new Date().toISOString() });

type Db = ReturnType<typeof admin>;

async function callerOf(req: Request, db: Db) {
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) return null;
  const { data } = await db.auth.getUser(jwt);
  return data?.user ?? null;
}

const nameOf = (u: any) =>
  (u?.user_metadata?.display_name || u?.user_metadata?.full_name || u?.email?.split('@')[0] || 'Disciple') as string;

/** DB row -> what the page expects. */
const mapTournament = (t: any) => t && ({
  ...t,
  status: t.status === 'in_progress' ? 'active' : t.status,
  current_participants: t.participants ?? 0,
});
const mapRegistration = (r: any) => r && ({ ...r, registered_at: r.created_at });

function seedFrom(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h || 1;
}

async function loadMatch(db: Db, id: string) {
  const { data } = await db.from('tournament_matches').select('*').eq('id', id).maybeSingle();
  return data;
}

/** Which side of the match the caller is on (by their registration). */
async function sideOf(db: Db, match: any, userId: string): Promise<{ side: 1 | 2; regId: string } | null> {
  const { data: reg } = await db.from('tournament_registrations').select('id')
    .eq('tournament_id', match.tournament_id).eq('user_id', userId).maybeSingle();
  if (!reg) return null;
  if (match.player1_id === reg.id) return { side: 1, regId: reg.id };
  if (match.player2_id === reg.id) return { side: 2, regId: reg.id };
  return null;
}

/** Bring a match up to date: time-outs, forfeits. Returns the fresh row. */
async function settle(db: Db, match: any) {
  const now = Date.now();

  // Ready-up forfeit: one player waited too long for the other.
  if (match.status === 'pending' && match.started_at && (match.player1_ready !== match.player2_ready)) {
    if (now - new Date(match.started_at).getTime() > FORFEIT_MS) {
      const winner = match.player1_ready ? match.player1_id : match.player2_id;
      return await finish(db, match, { status: 'completed', winner_id: winner }, 'forfeit');
    }
  }

  // Question time-out: whoever hasn't answered gets it wrong, then advance.
  if (match.status === 'in_progress' && match.question_start_time) {
    const deadline = new Date(match.question_start_time).getTime() + (match.time_per_question ?? TIME_PER_QUESTION_MS) + GRACE_MS;
    if (now > deadline) {
      const patch: Record<string, unknown> = {};
      for (const s of [1, 2] as const) {
        if (match[`player${s}_current_answer`] === null || match[`player${s}_current_answer`] === undefined) {
          patch[`player${s}_current_answer`] = -1;
          patch[`player${s}_answers`] = [...(match[`player${s}_answers`] ?? []),
            { q: match.current_question, answer: -1, correct: false, time: match.time_per_question, points: 0 }];
        }
      }
      return await advance(db, { ...match, ...patch }, patch);
    }
  }
  return match;
}

/** Both answered (or timed out): next question, or the end of the match. */
async function advance(db: Db, match: any, patch: Record<string, unknown>) {
  const next = (match.current_question ?? 0) + 1;
  const total = (match.questions ?? []).length || QUESTIONS_PER_MATCH;
  if (next >= total) {
    const p1 = match.player1_score ?? 0, p2 = match.player2_score ?? 0;
    let winner = p1 > p2 ? match.player1_id : p2 > p1 ? match.player2_id : null;
    if (!winner) {
      // Tie: the faster player overall wins; still level, player 1 (higher seed).
      const t = (a: any[]) => (a ?? []).reduce((s, x) => s + (Number(x.time) || 0), 0);
      winner = t(match.player2_answers) < t(match.player1_answers) ? match.player2_id : match.player1_id;
    }
    return await finish(db, match, { ...patch, status: 'completed', winner_id: winner }, 'played');
  }
  const update = {
    ...patch,
    current_question: next,
    player1_current_answer: null,
    player2_current_answer: null,
    // A short pause so both players see the last answer's result first.
    question_start_time: new Date(Date.now() + REVEAL_MS).toISOString(),
    updated_at: new Date().toISOString(),
  };
  // Only advance from the question we read: a concurrent request may already have.
  const { data } = await db.from('tournament_matches').update(update)
    .eq('id', match.id).eq('current_question', match.current_question).select().maybeSingle();
  return data ?? await loadMatch(db, match.id);
}

/** Close a match, update both players, and move the winner on. */
async function finish(db: Db, match: any, patch: Record<string, unknown>, how: 'played' | 'forfeit') {
  const completed = { ...patch, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  const { data: closed } = await db.from('tournament_matches').update(completed)
    .eq('id', match.id).neq('status', 'completed').select().maybeSingle();
  if (!closed) return await loadMatch(db, match.id); // someone else closed it first

  const winnerId = closed.winner_id as string;
  const loserId = closed.player1_id === winnerId ? closed.player2_id : closed.player1_id;
  const scoreOf = (regId: string) => (closed.player1_id === regId ? closed.player1_score : closed.player2_score) ?? 0;

  const { data: t } = await db.from('tournaments').select('*').eq('id', closed.tournament_id).maybeSingle();
  const isFinal = closed.round >= (t?.total_rounds ?? 1);

  const { data: w } = await db.from('tournament_registrations').select('*').eq('id', winnerId).maybeSingle();
  if (w) {
    await db.from('tournament_registrations').update({
      matches_won: (w.matches_won ?? 0) + 1,
      total_score: (w.total_score ?? 0) + scoreOf(winnerId),
      current_round: isFinal ? w.current_round : closed.round + 1,
      status: isFinal ? 'winner' : 'active',
    }).eq('id', winnerId);
  }
  if (loserId) {
    const { data: l } = await db.from('tournament_registrations').select('*').eq('id', loserId).maybeSingle();
    if (l) {
      await db.from('tournament_registrations').update({
        matches_lost: (l.matches_lost ?? 0) + 1,
        total_score: (l.total_score ?? 0) + scoreOf(loserId),
        status: 'eliminated',
      }).eq('id', loserId);
    }
  }

  if (isFinal) {
    await db.from('tournaments').update({
      status: 'completed', end_time: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', closed.tournament_id);
  } else {
    // Winner of match n goes to match ceil(n/2) of the next round: odd n -> player 1, even n -> player 2.
    const nextNumber = Math.ceil(closed.match_number / 2);
    const slot = closed.match_number % 2 === 1 ? 1 : 2;
    const { data: existing } = await db.from('tournament_matches').select('id')
      .eq('tournament_id', closed.tournament_id).eq('round', closed.round + 1)
      .eq('match_number', nextNumber).maybeSingle();
    const fill = { [`player${slot}_id`]: winnerId, [`player${slot}_name`]: w?.user_name ?? null };
    if (existing) {
      await db.from('tournament_matches').update(fill).eq('id', existing.id);
    } else {
      await db.from('tournament_matches').insert({
        tournament_id: closed.tournament_id, round: closed.round + 1,
        match_number: nextNumber, position: nextNumber - 1, status: 'pending',
        time_per_question: TIME_PER_QUESTION_MS, ...fill,
      });
    }
    await db.from('tournaments').update({
      current_round: Math.max(t?.current_round ?? 1, closed.round + 1), updated_at: new Date().toISOString(),
    }).eq('id', closed.tournament_id);
  }
  if (how === 'forfeit') console.log(`[tournament] match ${closed.id} won by forfeit`);
  return closed;
}

Deno.serve(handler(async (body, req) => {
  const { action } = body;
  if (!action) return fail('action is required');
  const db = admin();

  if (action === 'get_active_tournaments') {
    const { data } = await db.from('tournaments').select('*')
      .in('status', ['registration', 'in_progress', 'active'])
      .order('created_at', { ascending: false });
    return ok((data ?? []).map(mapTournament));
  }

  const user = await callerOf(req, db);

  if (action === 'get_user_tournaments') {
    if (!user) return ok([]);
    const { data: regs } = await db.from('tournament_registrations').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    const ids = [...new Set((regs ?? []).map((r: any) => r.tournament_id))];
    const { data: ts } = ids.length ? await db.from('tournaments').select('*').in('id', ids) : { data: [] };
    const byId = new Map((ts ?? []).map((t: any) => [t.id, mapTournament(t)]));
    return ok((regs ?? []).map((r: any) => ({ ...mapRegistration(r), tournaments: byId.get(r.tournament_id) ?? null })));
  }

  if (action === 'get_bracket') {
    const tid = body.tournament_id;
    if (!tid) return fail('tournament_id is required');
    const { data: tournament } = await db.from('tournaments').select('*').eq('id', tid).maybeSingle();
    if (!tournament) return fail('Tournament not found', 404);
    const { data: registrations } = await db.from('tournament_registrations')
      .select('*').eq('tournament_id', tid).order('seed', { ascending: true });
    const { data: matches } = await db.from('tournament_matches')
      .select('*').eq('tournament_id', tid)
      .order('round', { ascending: true }).order('match_number', { ascending: true });
    return ok({
      tournament: mapTournament(tournament),
      registrations: (registrations ?? []).map(mapRegistration),
      matches: matches ?? [],
    });
  }

  // Everything below changes something: members only.
  if (!user) return fail('Please sign in to take part in tournaments.', 401);

  if (action === 'create_tournament') {
    const { count } = await db.from('tournaments').select('id', { count: 'exact', head: true })
      .in('status', ['registration', 'in_progress', 'active']);
    if ((count ?? 0) >= MAX_OPEN_TOURNAMENTS) {
      return fail('There are already tournaments open. Join one of those!');
    }
    const size = SIZES.includes(Number(body.max_participants)) ? Number(body.max_participants) : 4;
    const { data, error } = await db.from('tournaments').insert({
      name: String(body.name ?? 'Tournament of Disciples').slice(0, 80),
      description: body.description ? String(body.description).slice(0, 300) : null,
      type: ['daily', 'weekly', 'championship'].includes(body.type) ? body.type : 'daily',
      category: body.category ?? 'general',
      difficulty: body.difficulty ?? 'mixed',
      entry_fee: 0,
      prize_pool: Math.max(0, Math.min(1000, Number(body.prize_pool) || 100)),
      max_participants: size,
      participants: 0,
      total_rounds: Math.log2(size),
      current_round: 0,
      start_time: body.start_time ?? new Date().toISOString(),
      created_by: user.id,
      status: 'registration',
    }).select().single();
    if (error) throw error;
    return ok({ tournament: mapTournament(data) });
  }

  if (action === 'register') {
    const tid = body.tournament_id;
    if (!tid) return fail('tournament_id is required');
    const { data: t } = await db.from('tournaments').select('*').eq('id', tid).maybeSingle();
    if (!t) return fail('Tournament not found', 404);
    if (t.status !== 'registration') return fail('Registration for this tournament has closed.');

    const { count } = await db.from('tournament_registrations')
      .select('id', { count: 'exact', head: true }).eq('tournament_id', tid);
    if ((count ?? 0) >= t.max_participants) return fail('This tournament is full.');

    const { error } = await db.from('tournament_registrations').insert({
      tournament_id: tid, user_id: user.id,
      user_name: String(body.user_name || nameOf(user)).slice(0, 40),
      user_avatar: body.user_avatar ?? null,
      seed: (count ?? 0) + 1,
      status: 'registered',
    });
    if (error) {
      if (error.code === '23505') return fail("You're already registered for this tournament.");
      throw error;
    }

    const { count: filledCount } = await db.from('tournament_registrations')
      .select('id', { count: 'exact', head: true }).eq('tournament_id', tid);
    const filled = filledCount ?? (count ?? 0) + 1;
    await db.from('tournaments').update({ participants: filled, updated_at: new Date().toISOString() }).eq('id', tid);

    // Full: seed the first round (1 v N, 2 v N-1, ...) exactly once.
    if (filled >= t.max_participants) {
      const { data: started } = await db.from('tournaments')
        .update({ status: 'in_progress', current_round: 1, updated_at: new Date().toISOString() })
        .eq('id', tid).eq('status', 'registration').select().maybeSingle();
      if (started) {
        const { data: regs } = await db.from('tournament_registrations')
          .select('*').eq('tournament_id', tid).order('seed', { ascending: true });
        const list = regs ?? [];
        const rows = [];
        for (let i = 0; i < Math.floor(list.length / 2); i++) {
          const a = list[i], b = list[list.length - 1 - i];
          rows.push({
            tournament_id: tid, round: 1, match_number: i + 1, position: i,
            player1_id: a.id, player1_name: a.user_name,
            player2_id: b.id, player2_name: b.user_name,
            status: 'pending', time_per_question: TIME_PER_QUESTION_MS,
          });
        }
        await db.from('tournament_matches').insert(rows);
        await db.from('tournament_registrations').update({ status: 'active' }).eq('tournament_id', tid);
      }
    }
    return ok({ registered: true, participants: filled, started: filled >= t.max_participants });
  }

  // ---- live match actions ------------------------------------------------
  const mid = body.match_id;
  if (!mid) return fail('match_id is required');
  let match = await loadMatch(db, mid);
  if (!match) return fail('Match not found', 404);
  const me = await sideOf(db, match, user.id);
  if (!me && action !== 'get_match_state') return fail("You're not playing in this match.", 403);

  if (action === 'start_match') {
    if (match.status === 'pending') {
      if (!match.player1_id || !match.player2_id) return fail('Your opponent for this match is not decided yet.');
      const ready = { [`player${me!.side}_ready`]: true } as Record<string, unknown>;
      const otherReady = match[`player${me!.side === 1 ? 2 : 1}_ready`];
      if (!otherReady) {
        if (!match.started_at) ready.started_at = new Date().toISOString(); // forfeit clock
        await db.from('tournament_matches').update(ready).eq('id', mid);
      } else {
        // Second player in: start question 1 for both.
        const questions = pickQuestions(QUESTIONS_PER_MATCH, seedFrom(match.id) ^ Date.now() % 100000)
          .map(({ question, options, correct, reference }) => ({ question, options, correct, reference }));
        await db.from('tournament_matches').update({
          ...ready, status: 'in_progress', questions, current_question: 0,
          player1_current_answer: null, player2_current_answer: null,
          question_start_time: new Date(Date.now() + 1500).toISOString(), // a beat to get ready
          time_per_question: TIME_PER_QUESTION_MS, updated_at: new Date().toISOString(),
        }).eq('id', mid).eq('status', 'pending');
      }
      match = await loadMatch(db, mid);
    }
    match = await settle(db, match);
    return ok({
      match,
      both_ready: match.status === 'in_progress',
      waiting_for_opponent: match.status === 'pending',
      match_completed: match.status === 'completed',
    });
  }

  if (action === 'get_match_state') {
    match = await settle(db, match);
    return ok({
      match,
      waiting_for_opponent: match.status === 'pending',
      match_completed: match.status === 'completed',
    });
  }

  if (action === 'submit_answer') {
    match = await settle(db, match);
    const side = me!.side;
    const idx = Number(body.question_index);
    const already = match[`player${side}_current_answer`];
    if (match.status !== 'in_progress' || idx !== match.current_question || (already !== null && already !== undefined)) {
      // Late or duplicate: report the state as it is.
      return ok({ answer_result: null, match, match_completed: match.status === 'completed', waiting_for_opponent: false });
    }

    const q = (match.questions ?? [])[idx];
    const answer = Number(body.answer);
    const correct = !!q && q.correct === answer;
    const limit = match.time_per_question ?? TIME_PER_QUESTION_MS;
    const taken = Math.max(0, Math.min(limit, Number(body.time_taken) || limit));
    // 10 for a right answer, plus up to 10 for speed.
    const points = correct ? 10 + Math.round(10 * (1 - taken / limit)) : 0;

    const patch: Record<string, unknown> = {
      [`player${side}_current_answer`]: answer,
      [`player${side}_answers`]: [...(match[`player${side}_answers`] ?? []), { q: idx, answer, correct, time: taken, points }],
      [`player${side}_score`]: (match[`player${side}_score`] ?? 0) + points,
      updated_at: new Date().toISOString(),
    };
    // Write only if this player hasn't answered meanwhile (double taps).
    const { data: saved } = await db.from('tournament_matches').update(patch)
      .eq('id', mid).eq('current_question', idx).is(`player${side}_current_answer`, null).select().maybeSingle();
    let after = saved ?? await loadMatch(db, mid);
    const other = after[`player${side === 1 ? 2 : 1}_current_answer`];
    const bothIn = saved && other !== null && other !== undefined;
    if (bothIn) after = await advance(db, after, {});

    return ok({
      answer_result: saved ? { is_correct: correct, points, correct_answer: q?.correct ?? null } : null,
      match: after,
      match_completed: after.status === 'completed',
      waiting_for_opponent: !bothIn,
    });
  }

  return fail(`Unknown action: ${action}`);
}));

export { corsHeaders };
