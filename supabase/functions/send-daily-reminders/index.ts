// send-daily-reminders
//
// Called only by the st07 fork; Famous.ai never built it, so this is new code.
// Contract derived from DailyReminders.tsx:
//
//   get-preferences  { userId }                     -> { preferences }
//   save-preferences { userId, email, preferences } -> { success }
//   test-reminder    { userId, email }              -> { success, preview }
//
// The component reads snake_case fields off `preferences` but sends camelCase,
// so the mapping is explicit in both directions.

import { admin, ok, fail, handler, corsHeaders } from '../_shared/db.ts';

const DEFAULTS = {
  reminders_enabled: true,
  continue_reading_enabled: true,
  new_study_suggestions: true,
  encouragement_enabled: true,
  trivia_challenge_enabled: true,
  competition_invites_enabled: true,
  leaderboard_updates_enabled: true,
  reminder_time: '07:00',
  timezone: 'America/New_York',
  frequency: 'daily',
};

const ENCOURAGEMENTS = [
  'Draw near to God, and he will draw near to you. — James 4:8',
  'Thy word is a lamp unto my feet, and a light unto my path. — Psalm 119:105',
  'Be strong and of a good courage. — Joshua 1:9',
];

function toRow(userId: string, email: string | null, p: Record<string, any> = {}) {
  return {
    user_id: userId,
    email,
    display_name: p.displayName ?? null,
    reminders_enabled: p.remindersEnabled ?? DEFAULTS.reminders_enabled,
    continue_reading_enabled: p.continueReadingEnabled ?? DEFAULTS.continue_reading_enabled,
    new_study_suggestions: p.newStudySuggestions ?? DEFAULTS.new_study_suggestions,
    encouragement_enabled: p.encouragementEnabled ?? DEFAULTS.encouragement_enabled,
    trivia_challenge_enabled: p.triviaChallengeEnabled ?? DEFAULTS.trivia_challenge_enabled,
    competition_invites_enabled: p.competitionInvitesEnabled ?? DEFAULTS.competition_invites_enabled,
    leaderboard_updates_enabled: p.leaderboardUpdatesEnabled ?? DEFAULTS.leaderboard_updates_enabled,
    reminder_time: p.reminderTime ?? DEFAULTS.reminder_time,
    timezone: p.timezone ?? DEFAULTS.timezone,
    frequency: p.frequency ?? DEFAULTS.frequency,
    updated_at: new Date().toISOString(),
  };
}

Deno.serve(handler(async (body) => {
  const { action, userId, email, preferences } = body;
  if (!action) return fail('action is required');
  const db = admin();

  if (action === 'get-preferences') {
    if (!userId) return fail('userId is required');
    const { data, error } = await db
      .from('reminder_preferences').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    // Returning defaults rather than null keeps the component's ?? fallbacks
    // consistent for a user who has never saved.
    return ok({ preferences: data ?? { user_id: userId, email, ...DEFAULTS } });
  }

  if (action === 'save-preferences') {
    if (!userId) return fail('userId is required');
    const { error } = await db
      .from('reminder_preferences')
      .upsert(toRow(userId, email ?? null, preferences), { onConflict: 'user_id' });
    if (error) throw error;
    return ok({ saved: true });
  }

  if (action === 'test-reminder') {
    if (!email) return fail('email is required');
    const verse = ENCOURAGEMENTS[Math.floor(Date.now() / 86400000) % ENCOURAGEMENTS.length];
    const subject = 'Your daily reminder — Sons of God';
    const html =
      `<div style="font-family:Georgia,serif;color:#3d4a4a">` +
      `<h2 style="color:#7c9a7a">A moment with the Word</h2>` +
      `<p style="font-style:italic;font-size:18px">${verse}</p>` +
      `<p>Pick up where you left off in your reading plan.</p></div>`;

    const key = Deno.env.get('RESEND_API_KEY');
    if (!key) {
      // Mirrors send-donation-receipt: report clearly rather than pretending.
      return ok({
        sent: false,
        reason: 'Email service not configured (RESEND_API_KEY missing)',
        preview: { to: email, subject, html },
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Sons of God <reminders@sonoftheonegroup.com>',
        to: email, subject, html,
      }),
    });
    const out = await res.json();
    if (!res.ok) return fail(out?.message ?? 'Failed to send reminder', 502);

    if (userId) {
      await db.from('reminder_preferences')
        .update({ last_sent_at: new Date().toISOString() }).eq('user_id', userId);
    }
    return ok({ sent: true, id: out?.id });
  }

  return fail(`Unknown action: ${action}`);
}));

export { corsHeaders };
