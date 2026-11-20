
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireAdmin, requireRole, auditLog, AdminAuthError } from '../_shared/admin.ts';
import { stripeApi } from '../_shared/stripe.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Members are Supabase Auth accounts. (This used to read `app_users`, a
// Famous.ai table nothing writes to, so the page always showed 0 users.)
// Each account is joined with its membership, test-account flag, last
// activity and completed donations.
interface Member {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  is_subscribed: boolean;
  subscription_tier: string;
  membership_status: string;
  total_donations: number;
  last_active: string | null;
  created_at: string;
}

const ACCESS_STATUSES = ['active', 'trialing', 'past_due'];

function tierLabel(sub: any, tester: boolean): string {
  if (tester) return 'Test account';
  if (!sub) return 'No membership';
  const plan = sub.plan_type === 'annual' ? 'Yearly' : sub.plan_type === 'monthly' ? 'Monthly' : (sub.plan_type ?? 'Member');
  if (sub.status === 'trialing') return `${plan} ($1 first day)`;
  if (sub.status === 'active') return sub.cancel_at_period_end ? `${plan} (cancelling)` : plan;
  if (sub.status === 'past_due') return `${plan} (payment failed)`;
  if (sub.status === 'canceled') return 'Cancelled';
  return sub.status ?? 'No membership';
}

async function loadMembers(supabase: any): Promise<Member[]> {
  const accounts: any[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    accounts.push(...(data?.users ?? []));
    if ((data?.users ?? []).length < 1000) break;
  }

  const [subs, testers, donations, events] = await Promise.all([
    supabase.from('user_subscriptions').select('user_id, email, status, plan_type, cancel_at_period_end, updated_at, stripe_subscription_id'),
    supabase.from('membership_testers').select('email'),
    supabase.from('donations').select('email, amount, status').eq('status', 'completed'),
    supabase.from('activity_events').select('user_id, occurred_at')
      .gte('occurred_at', new Date(Date.now() - 90 * 86400000).toISOString())
      .not('user_id', 'is', null).order('occurred_at', { ascending: false }).limit(20000),
  ]);

  // Membership rows are checked against live Stripe: rows left over from
  // Stripe test mode point at subscriptions live Stripe has never had.
  const live = new Map<string, any>();
  let liveChecked = false;
  try {
    let startingAfter: string | undefined;
    for (let page = 0; page < 20; page++) {
      const res = await stripeApi('GET', '/subscriptions', { status: 'all', limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) });
      for (const sub of res.data ?? []) live.set(sub.id, sub);
      if (!res.has_more || !res.data?.length) break;
      startingAfter = res.data[res.data.length - 1].id;
    }
    liveChecked = true;
  } catch (e) {
    console.error('[admin-users] Stripe check skipped:', (e as Error).message);
  }

  const subByUser = new Map<string, any>();
  for (const row of subs.data ?? []) {
    let s = row;
    if (liveChecked && row.stripe_subscription_id) {
      const l = live.get(row.stripe_subscription_id);
      if (!l) continue; // test-mode leftover
      s = { ...row, status: l.status, cancel_at_period_end: l.cancel_at_period_end };
    }
    const prev = subByUser.get(s.user_id);
    if (!prev || new Date(s.updated_at) > new Date(prev.updated_at)) subByUser.set(s.user_id, s);
  }
  const testerEmails = new Set((testers.data ?? []).map((t: any) => String(t.email).toLowerCase()));
  const donatedByEmail = new Map<string, number>();
  for (const d of donations.data ?? []) {
    const e = String(d.email ?? '').toLowerCase();
    donatedByEmail.set(e, (donatedByEmail.get(e) ?? 0) + (Number(d.amount) || 0) / 100); // cents
  }
  const lastEvent = new Map<string, string>();
  for (const e of events.data ?? []) if (!lastEvent.has(e.user_id)) lastEvent.set(e.user_id, e.occurred_at);

  return accounts.map((u) => {
    const email = String(u.email ?? '').toLowerCase();
    const sub = subByUser.get(u.id);
    const tester = testerEmails.has(email);
    const seen = [u.last_sign_in_at, lastEvent.get(u.id)].filter(Boolean).sort().pop() ?? null;
    return {
      id: u.id,
      email,
      name: u.user_metadata?.display_name || u.user_metadata?.full_name || u.user_metadata?.name || email.split('@')[0],
      avatar_url: u.user_metadata?.avatar_url ?? '',
      is_subscribed: tester || (!!sub && ACCESS_STATUSES.includes(sub.status)),
      subscription_tier: tierLabel(sub, tester),
      membership_status: tester ? 'test_account' : sub?.status ?? 'none',
      total_donations: Math.round((donatedByEmail.get(email) ?? 0) * 100) / 100,
      last_active: seen,
      created_at: u.created_at,
    };
  }).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, userId, userData, page = 1, limit = 20, search, adminToken, email }
      = await req.json();

    // These endpoints previously performed no authorization at all: anyone
    // holding the public anon key could list every member's email.
    const who = await requireAdmin(adminToken);

    if (action === 'list') {
      const q = String(search ?? '').trim().toLowerCase();
      const all = (await loadMembers(supabase))
        .filter((u) => !q || u.email.includes(q) || u.name.toLowerCase().includes(q));
      const users = all.slice((page - 1) * limit, page * limit);
      return new Response(JSON.stringify({
        success: true,
        users,
        total: all.length,
        page,
        totalPages: Math.max(1, Math.ceil(all.length / limit)),
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'get') {
      if (!userId) throw new Error('User ID is required');
      const user = (await loadMembers(supabase)).find((u) => u.id === userId);
      if (!user) throw new Error('User not found');

      const { data: donations } = await supabase
        .from('donations')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      return new Response(JSON.stringify({
        success: true,
        user,
        // amounts are stored in cents
        donations: (donations || []).map((d: any) => ({ ...d, amount: (Number(d.amount) || 0) / 100 }))
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'update') {
      if (!userId || !userData) throw new Error('User ID and data are required');
      const name = typeof userData.name === 'string' ? userData.name.trim() : '';
      if (!name) throw new Error('Only the display name can be changed here');
      const { error } = await supabase.auth.admin.updateUserById(userId, { user_metadata: { display_name: name } });
      if (error) throw error;
      await auditLog(who, 'update_user', userId, { name });
      const user = (await loadMembers(supabase)).find((u) => u.id === userId);
      return new Response(JSON.stringify({ success: true, user }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'impersonate') {
      // Minting a session as another member is a support tool with real blast
      // radius, so it is restricted and always recorded.
      requireRole(who, 'super_admin');

      const target = (email ?? '').trim();
      if (!target) {
        return new Response(JSON.stringify({ success: false, error: 'email is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      // Never allow impersonating another admin account.
      const { data: isAdmin } = await supabase
        .from('admins').select('id').eq('email', target).maybeSingle();
      if (isAdmin) {
        await auditLog(who, 'impersonate_denied', target, { reason: 'target is an admin' });
        return new Response(JSON.stringify({ success: false, error: 'Cannot impersonate an admin account' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      // GoTrue's admin API mints a real, refreshable session. Signing a JWT by
      // hand would skip GoTrue's session bookkeeping and break token refresh.
      const res = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ type: 'magiclink', email: target }),
      });
      const link = await res.json();
      if (!res.ok) {
        return new Response(JSON.stringify({ success: false, error: link?.msg ?? 'Could not create session' }),
          { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      await auditLog(who, 'impersonate', target, { admin: who.email });

      return new Response(JSON.stringify({
        success: true,
        email: target,
        // The client exchanges this for a session via verifyOtp().
        token_hash: link?.hashed_token ?? link?.properties?.hashed_token ?? null,
        action_link: link?.action_link ?? link?.properties?.action_link ?? null,
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    if (action === 'stats') {
      const allUsers = await loadMembers(supabase);
      const now = Date.now();
      const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      const sevenDaysAgo = now - 7 * 86400000;

      const stats = {
        totalUsers: allUsers.length,
        subscribedUsers: allUsers.filter((u) => u.is_subscribed && u.membership_status !== 'test_account').length,
        newUsersThisMonth: allUsers.filter((u) => new Date(u.created_at).getTime() >= thisMonth).length,
        activeUsersThisWeek: allUsers.filter((u) => u.last_active && new Date(u.last_active).getTime() >= sevenDaysAgo).length,
        totalDonations: Math.round(allUsers.reduce((sum, u) => sum + u.total_donations, 0) * 100) / 100,
      };

      return new Response(JSON.stringify({ success: true, stats }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    throw new Error('Invalid action');
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return new Response(JSON.stringify({ success: false, error: error.message }),
        { status: error.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
