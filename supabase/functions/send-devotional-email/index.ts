// send-devotional-email
//
// Called only by the st07 fork; Famous.ai never built it. Contract derived
// from EmailDevotionalSubscription.tsx:
//
//   get-preferences  { userId, email }                  -> { preferences }
//   save-preferences { userId, email, preferences, ... } -> { success }
//   send-test        { email }                          -> { success }
//
// Subscribing without an account is supported: rows may have a null user_id
// and are keyed on email instead.

import { admin, ok, fail, handler, corsHeaders } from '../_shared/db.ts';

const DEVOTIONALS = [
  {
    title: 'Sons by Adoption',
    verse: 'Romans 8:15',
    text: 'For ye have not received the spirit of bondage again to fear; but ye have received the Spirit of adoption, whereby we cry, Abba, Father.',
    reflection: 'Sonship is not earned by performance. It is received. Walk today as one already adopted, not as one auditioning.',
  },
  {
    title: 'Led by the Spirit',
    verse: 'Romans 8:14',
    text: 'For as many as are led by the Spirit of God, they are the sons of God.',
    reflection: 'Being led is a daily posture, not a one-time decision. Ask where you are being led before you ask what you should do.',
  },
  {
    title: 'Heirs Together',
    verse: 'Romans 8:17',
    text: 'And if children, then heirs; heirs of God, and joint-heirs with Christ.',
    reflection: 'An inheritance is not a wage. Rest in what has been given rather than striving for what is already yours.',
  },
];

function todaysDevotional() {
  return DEVOTIONALS[Math.floor(Date.now() / 86400000) % DEVOTIONALS.length];
}

function renderEmail(d: typeof DEVOTIONALS[number]) {
  return `<div style="font-family:Georgia,serif;background:#f5f0e6;padding:24px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
    <h1 style="color:#7c9a7a;font-size:22px;margin:0 0 4px">Sons of God</h1>
    <p style="color:#c9a227;font-style:italic;margin:0 0 24px">Daily Devotional</p>
    <h2 style="color:#3d4a4a;font-size:20px">${d.title}</h2>
    <blockquote style="font-size:18px;font-style:italic;color:#3d4a4a;border-left:3px solid #9cb59c;margin:16px 0;padding-left:16px">
      ${d.text}
      <div style="color:#7c9a7a;font-weight:bold;margin-top:8px">— ${d.verse}</div>
    </blockquote>
    <p style="color:#5c4f42;line-height:1.6">${d.reflection}</p>
  </div>
</div>`;
}

Deno.serve(handler(async (body) => {
  const { action, userId, email, preferences, frequency, timezone } = body;
  if (!action) return fail('action is required');
  const db = admin();

  if (action === 'get-preferences') {
    if (!userId && !email) return fail('userId or email is required');
    let q = db.from('devotional_preferences').select('*');
    q = userId ? q.eq('user_id', userId) : q.eq('email', email);
    const { data, error } = await q.maybeSingle();
    if (error) throw error;
    return ok({
      preferences: data ?? {
        user_id: userId ?? null, email: email ?? null, subscribed: false,
        frequency: 'daily', send_time: '06:00',
        timezone: timezone ?? 'America/New_York',
        include_verse: true, include_prayer: true,
      },
    });
  }

  if (action === 'save-preferences') {
    if (!email) return fail('email is required');
    const p = preferences ?? {};
    const row = {
      user_id: userId ?? null,
      email,
      subscribed: p.subscribed ?? true,
      frequency: p.frequency ?? frequency ?? 'daily',
      send_time: p.sendTime ?? '06:00',
      timezone: p.timezone ?? timezone ?? 'America/New_York',
      include_verse: p.includeVerse ?? true,
      include_prayer: p.includePrayer ?? true,
      updated_at: new Date().toISOString(),
    };
    // Authenticated users key on user_id; email-only subscribers key on email.
    const { error } = userId
      ? await db.from('devotional_preferences').upsert(row, { onConflict: 'user_id' })
      : await db.from('devotional_preferences').upsert(row, { onConflict: 'email' });
    if (error) throw error;
    return ok({ saved: true });
  }

  if (action === 'send-test') {
    if (!email) return fail('email is required');
    const d = todaysDevotional();
    const subject = `Today's Devotional — ${d.title}`;
    const html = renderEmail(d);

    const key = Deno.env.get('RESEND_API_KEY');
    if (!key) {
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
        from: 'Sons of God <devotional@sonoftheonegroup.com>',
        to: email, subject, html,
      }),
    });
    const out = await res.json();
    if (!res.ok) return fail(out?.message ?? 'Failed to send devotional', 502);
    return ok({ sent: true, id: out?.id });
  }

  return fail(`Unknown action: ${action}`);
}));

export { corsHeaders };
