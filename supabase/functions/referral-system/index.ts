// referral-system
//
// Called only by the st07 fork; Famous.ai never built it. Contract derived
// from InviteFriends.tsx and SocialShareButtons.tsx:
//
//   generate_code        { userId }                  -> { code, referral_url }
//   get_stats            { userId }                  -> { stats }
//   track_share          { userId, platform, code }  -> { success }
//   claim_referral_trial { code, email, userId }     -> { success, trial_days }

import { admin, ok, fail, handler, corsHeaders } from '../_shared/db.ts';

const TRIAL_DAYS = 3;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1

function makeCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('');
}

function siteUrl(): string {
  return Deno.env.get('SITE_URL') ?? 'https://robert.ituldev.com';
}

Deno.serve(handler(async (body) => {
  const { action, userId } = body;
  if (!action) return fail('action is required');
  const db = admin();

  if (action === 'generate_code') {
    if (!userId) return fail('userId is required');
    const { data: existing } = await db
      .from('referrals').select('referral_code').eq('user_id', userId).maybeSingle();
    if (existing?.referral_code) {
      return ok({ code: existing.referral_code,
                  referral_url: `${siteUrl()}/?ref=${existing.referral_code}` });
    }
    // Retry on the (unlikely) unique collision rather than failing the caller.
    for (let i = 0; i < 5; i++) {
      const code = makeCode();
      const { error } = await db.from('referrals').insert({ user_id: userId, referral_code: code });
      if (!error) return ok({ code, referral_url: `${siteUrl()}/?ref=${code}` });
      if (error.code !== '23505') throw error;
    }
    return fail('Could not allocate a referral code', 500);
  }

  if (action === 'get_stats') {
    if (!userId) return fail('userId is required');
    const { data: ref } = await db
      .from('referrals').select('*').eq('user_id', userId).maybeSingle();
    if (!ref) {
      return ok({ stats: { referral_code: null, referral_url: null,
                           signups: 0, trials_claimed: 0, shares: 0 } });
    }
    const { count: shares } = await db
      .from('referral_shares').select('id', { count: 'exact', head: true })
      .eq('referral_code', ref.referral_code);
    const { count: claims } = await db
      .from('referral_claims').select('id', { count: 'exact', head: true })
      .eq('referral_code', ref.referral_code);
    return ok({
      stats: {
        referral_code: ref.referral_code,
        referral_url: `${siteUrl()}/?ref=${ref.referral_code}`,
        signups: ref.signups ?? 0,
        trials_claimed: claims ?? 0,
        shares: shares ?? 0,
      },
    });
  }

  if (action === 'track_share') {
    const code = body.code ?? body.referralCode ?? null;
    const { error } = await db.from('referral_shares').insert({
      user_id: userId ?? null,
      referral_code: code,
      platform: body.platform ?? 'unknown',
    });
    if (error) throw error;
    return ok({ tracked: true });
  }

  if (action === 'claim_referral_trial') {
    const code = body.code ?? body.referralCode;
    const email = body.email;
    if (!code || !email) return fail('code and email are required');

    const { data: ref } = await db
      .from('referrals').select('*').eq('referral_code', code).maybeSingle();
    if (!ref) return fail('Invalid referral code', 404);
    if (userId && ref.user_id === userId) return fail('You cannot use your own referral code');

    const { error: claimErr } = await db.from('referral_claims').insert({
      referral_code: code, referred_email: email, referred_user: userId ?? null,
      trial_days: TRIAL_DAYS,
    });
    // Unique (referral_code, referred_email) -- one trial per person per code.
    if (claimErr) {
      if (claimErr.code === '23505') return fail('This trial has already been claimed');
      throw claimErr;
    }

    await db.from('referrals')
      .update({ signups: (ref.signups ?? 0) + 1, trials_claimed: (ref.trials_claimed ?? 0) + 1 })
      .eq('id', ref.id);

    const now = new Date();
    const end = new Date(now.getTime() + TRIAL_DAYS * 86400000);
    if (userId) {
      await db.from('user_subscriptions').upsert({
        user_id: userId, email, status: 'trialing',
        trial_start: now.toISOString(), trial_end: end.toISOString(),
      }, { onConflict: 'user_id' });
    }

    return ok({ trial_days: TRIAL_DAYS, trial_end: end.toISOString() });
  }

  return fail(`Unknown action: ${action}`);
}));

export { corsHeaders };
