// membership
//
// Paid membership: $1 today for the first 24 hours, then the chosen plan
// (monthly or annual) is billed automatically unless cancelled.
//
//   status                         -> membership summary, live-synced with Stripe
//   start   { plan }               -> { clientSecret, subscriptionId }  (the $1 payment to confirm)
//   confirm { subscriptionId }     -> summary once the $1 payment has gone through
//   cancel                         -> stop at the end of the current period (no further charges)
//   resume                         -> undo a pending cancellation
//   switch-plan { plan }           -> e.g. upgrade monthly -> annual
//
// Stripe model: one subscription per member with a 1-day trial; the $1 entry
// fee is an extra line on the subscription's first invoice, so it's charged
// immediately and atomically with creating the subscription. The card used is
// saved as the subscription's default for the renewals.
//
// Identity: the caller's Supabase session (Authorization: Bearer <user JWT>).
// Right after sign-up, with email confirmation on, there is no session yet, so
// `start` and `confirm` also accept { signupUserId } for an account created in
// the last two hours. Membership actions are never authorised by email alone.

import { admin, corsHeaders } from '../_shared/db.ts';
import { stripeApi, StripeError } from '../_shared/stripe.ts';

type Plan = 'monthly' | 'annual';

// Price IDs differ between Stripe test and live mode: set the secrets when going
// live instead of editing code. Defaults are the current test-mode prices.
const PRICES: Record<Plan, string> = {
  monthly: Deno.env.get('STRIPE_PRICE_MONTHLY') ?? 'price_1UGLivLfsMwtRrDIWoukyPIT', // $9.99 / month
  annual: Deno.env.get('STRIPE_PRICE_ANNUAL') ?? 'price_1UGLjtLfsMwtRrDIhPr5vfyK',   // $79.99 / year
};
const ENTRY_FEE_CENTS = 100;
const ENTRY_PRODUCT_ID = 'sons_of_the_one_entry_fee';
const SIGNUP_WINDOW_MS = 2 * 60 * 60 * 1000;
// Stripe keeps retrying a failed renewal for a while (past_due); keep access meanwhile.
const MEMBER_STATUSES = new Set(['trialing', 'active', 'past_due']);

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });

const iso = (unix?: number | null) => (unix ? new Date(unix * 1000).toISOString() : null);
// Human-readable date for history descriptions, e.g. "Nov 6, 2026".
const day = (unix?: number | null) => (unix
  ? new Date(unix * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  : 'after 24 hours');

interface Caller { id: string; email: string; name: string }

async function resolveCaller(req: Request, body: any, action: string): Promise<Caller> {
  const db = admin();
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (jwt) {
    const { data } = await db.auth.getUser(jwt);
    const u = data?.user;
    if (u?.email) return { id: u.id, email: u.email.toLowerCase(), name: u.user_metadata?.display_name ?? '' };
  }
  if (body.signupUserId && (action === 'start' || action === 'confirm')) {
    const { data } = await db.auth.admin.getUserById(String(body.signupUserId));
    const u = data?.user;
    const fresh = u?.created_at && Date.now() - new Date(u.created_at).getTime() < SIGNUP_WINDOW_MS;
    if (u?.email && fresh) return { id: u.id, email: u.email.toLowerCase(), name: u.user_metadata?.display_name ?? '' };
  }
  throw new HttpError('Please sign in to manage your membership.', 401);
}

async function isAdmin(email: string): Promise<boolean> {
  const { data } = await admin().from('admins').select('id').eq('email', email.toLowerCase()).maybeSingle();
  return !!data;
}

/** The member's row: by user id first, then by email (rows from older flows). */
async function findRow(c: Caller) {
  const db = admin();
  const byId = await db.from('user_subscriptions').select('*').eq('user_id', c.id).maybeSingle();
  if (byId.data) return byId.data;
  const byEmail = await db.from('user_subscriptions').select('*').eq('email', c.email.toLowerCase()).maybeSingle();
  return byEmail.data ?? null;
}

/**
 * Whether this subscription grants access. During the first 24 hours (trialing)
 * the only invoice is the $1 entry fee, and it must actually be paid: depending
 * on timing Stripe can report "trialing" before that payment completes.
 * Requires latest_invoice to be expanded.
 */
function grantsAccess(sub: any): boolean {
  if (!MEMBER_STATUSES.has(sub?.status)) return false;
  if (sub.status !== 'trialing') return true;
  return typeof sub.latest_invoice === 'object' && sub.latest_invoice?.status === 'paid';
}

function planOf(sub: any): Plan {
  const price = sub?.items?.data?.[0]?.price?.id;
  return price === PRICES.annual ? 'annual' : 'monthly';
}

function summarize(sub: any | null, adminUser = false) {
  if (!sub) {
    return { isMember: adminUser, isAdmin: adminUser, hasSubscription: false, status: 'none' };
  }
  return {
    isMember: adminUser || grantsAccess(sub),
    isAdmin: adminUser,
    hasSubscription: true,
    status: sub.status as string,
    plan: planOf(sub),
    inEntryPeriod: sub.status === 'trialing',
    trialEnd: iso(sub.trial_end),
    currentPeriodEnd: iso(sub.current_period_end),
    cancelAtPeriodEnd: !!sub.cancel_at_period_end,
    subscriptionId: sub.id as string,
  };
}

/** Mirror the Stripe subscription into user_subscriptions. */
async function saveRow(c: Caller, sub: any, customerId: string) {
  const db = admin();
  const row = {
    user_id: c.id,
    email: c.email,
    status: sub.status,
    plan_type: planOf(sub),
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    trial_start: iso(sub.trial_start),
    trial_end: iso(sub.trial_end),
    current_period_start: iso(sub.current_period_start),
    current_period_end: iso(sub.current_period_end),
    cancel_at_period_end: !!sub.cancel_at_period_end,
    canceled_at: iso(sub.canceled_at),
    updated_at: new Date().toISOString(),
  };
  const existing = await findRow(c);
  const res = existing
    ? await db.from('user_subscriptions').update(row).eq('id', existing.id).select('id').single()
    : await db.from('user_subscriptions').insert(row).select('id').single();
  if (res.error) console.error('[membership] save failed:', res.error.message);
  return res.data?.id as string | undefined;
}

async function logEvent(c: Caller, rowId: string | undefined, sub: any, event: string, description: string) {
  await admin().from('subscription_history').insert({
    user_subscription_id: rowId ?? null,
    email: c.email,
    event_type: event,
    plan_type: planOf(sub),
    stripe_subscription_id: sub.id,
    description,
  });
}

/** Load the member's current Stripe subscription (live) and keep the row in sync. */
async function currentSubscription(c: Caller): Promise<{ sub: any | null; customerId: string | null }> {
  const row = await findRow(c);
  let customerId: string | null = row?.stripe_customer_id ?? null;

  if (row?.stripe_subscription_id) {
    try {
      const sub = await stripeApi('GET', `/subscriptions/${row.stripe_subscription_id}`, { expand: ['latest_invoice'] });
      customerId = sub.customer;
      // A replaced/abandoned attempt isn't the membership if a better one exists.
      if (grantsAccess(sub) || !customerId) {
        await saveRow(c, sub, sub.customer);
        return { sub, customerId };
      }
    } catch (e) {
      if (!(e instanceof StripeError && e.status === 404)) throw e;
    }
  }

  if (!customerId) {
    const found = await stripeApi('GET', '/customers', { email: c.email, limit: 1 });
    customerId = found.data?.[0]?.id ?? null;
  }
  if (!customerId) return { sub: null, customerId: null };

  // Fall back to the customer's subscriptions: prefer a live one, else the latest.
  const list = await stripeApi('GET', '/subscriptions', {
    customer: customerId, status: 'all', limit: 10, expand: ['data.latest_invoice'],
  });
  const subs: any[] = list.data ?? [];
  const sub = subs.find(grantsAccess) ?? subs[0] ?? null;
  if (sub) await saveRow(c, sub, customerId);
  return { sub, customerId };
}

async function ensureEntryProduct() {
  try {
    await stripeApi('GET', `/products/${ENTRY_PRODUCT_ID}`);
  } catch (e) {
    if (!(e instanceof StripeError && e.status === 404)) throw e;
    try {
      await stripeApi('POST', '/products', {
        id: ENTRY_PRODUCT_ID,
        name: 'Sons of the One — membership entry (first 24 hours)',
      });
    } catch (e2) {
      // Created by a concurrent request: fine.
      if (!(e2 instanceof StripeError && e2.code === 'resource_already_exists')) throw e2;
    }
  }
}

async function ensureCustomer(c: Caller, known: string | null): Promise<string> {
  if (known) return known;
  const created = await stripeApi('POST', '/customers', {
    email: c.email,
    name: c.name || c.email.split('@')[0],
    metadata: { user_id: c.id, app: 'sons_of_the_one' },
  });
  return created.id;
}

const parsePlan = (p: unknown): Plan => {
  if (p === 'monthly' || p === 'annual') return p;
  throw new HttpError('Please choose the monthly or annual plan.', 400);
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? 'status');
    const c = await resolveCaller(req, body, action);
    const adminUser = await isAdmin(c.email);

    if (action === 'status') {
      const { sub } = await currentSubscription(c);
      const summary = summarize(sub, adminUser);
      if (!body.withHistory) return json(summary);
      const { data: history } = await admin().from('subscription_history')
        .select('id, event_type, plan_type, description, created_at')
        .eq('email', c.email).order('created_at', { ascending: false }).limit(10);
      return json({ ...summary, history: history ?? [] });
    }

    if (action === 'start') {
      const plan = parsePlan(body.plan);
      const { sub: existing, customerId: knownCustomer } = await currentSubscription(c);
      if (existing && grantsAccess(existing)) {
        return json({ alreadyMember: true, ...summarize(existing, adminUser) });
      }

      const customerId = await ensureCustomer(c, knownCustomer);
      await ensureEntryProduct();

      // Clear abandoned earlier attempts (the $1 never paid), so they can't linger
      // or bill later: void their open $1 invoice and cancel them.
      const earlier = await stripeApi('GET', '/subscriptions', {
        customer: customerId, status: 'all', limit: 20, expand: ['data.latest_invoice'],
      });
      for (const s of earlier.data ?? []) {
        const abandoned = s.status === 'incomplete' || (s.status === 'trialing' && !grantsAccess(s));
        if (!abandoned) continue;
        const inv = s.latest_invoice;
        if (inv && typeof inv === 'object' && inv.status === 'open') {
          await stripeApi('POST', `/invoices/${inv.id}/void`).catch(() => {});
        }
        await stripeApi('DELETE', `/subscriptions/${s.id}`).catch(() => {});
      }

      const sub = await stripeApi('POST', '/subscriptions', {
        customer: customerId,
        items: [{ price: PRICES[plan] }],
        trial_period_days: 1,
        add_invoice_items: [{
          price_data: { currency: 'usd', product: ENTRY_PRODUCT_ID, unit_amount: ENTRY_FEE_CENTS },
        }],
        payment_behavior: 'default_incomplete',
        // Credit/debit cards only; the card used is kept for the renewals.
        payment_settings: { payment_method_types: ['card'], save_default_payment_method: 'on_subscription' },
        trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
        metadata: { app: 'sons_of_the_one', user_id: c.id, plan },
        expand: ['latest_invoice.payment_intent'],
      });

      const clientSecret = sub.latest_invoice?.payment_intent?.client_secret;
      if (!clientSecret) {
        await stripeApi('DELETE', `/subscriptions/${sub.id}`).catch(() => {});
        throw new HttpError('Could not start the payment. Please try again.', 502);
      }
      await saveRow(c, sub, customerId);
      return json({ clientSecret, subscriptionId: sub.id, plan, amountTodayCents: ENTRY_FEE_CENTS });
    }

    if (action === 'confirm') {
      const id = String(body.subscriptionId ?? '');
      if (!/^sub_[A-Za-z0-9]+$/.test(id)) throw new HttpError('Missing subscription.', 400);
      const sub = await stripeApi('GET', `/subscriptions/${id}`, { expand: ['latest_invoice'] });
      if (sub.metadata?.user_id !== c.id) throw new HttpError('That membership belongs to another account.', 403);

      const rowId = await saveRow(c, sub, sub.customer);
      const paid = sub.latest_invoice?.status === 'paid';
      if (paid && grantsAccess(sub)) {
        await logEvent(c, rowId, sub, 'membership_started',
          `Paid $1.00 entry; ${planOf(sub)} billing starts ${day(sub.trial_end ?? sub.current_period_end)}`);
      }
      return json({ paid, ...summarize(sub, adminUser) });
    }

    // Everything below manages an existing membership.
    const { sub } = await currentSubscription(c);
    if (!sub || !grantsAccess(sub)) {
      throw new HttpError("You don't have an active membership.", 404);
    }

    if (action === 'cancel' || action === 'resume') {
      const cancel = action === 'cancel';
      const updated = await stripeApi('POST', `/subscriptions/${sub.id}`, {
        cancel_at_period_end: cancel, expand: ['latest_invoice'],
      });
      const rowId = await saveRow(c, updated, updated.customer);
      await logEvent(c, rowId, updated, cancel ? 'canceled' : 'resumed',
        cancel
          ? `Membership will end ${day(updated.status === 'trialing' ? updated.trial_end : updated.current_period_end)}; no further charges`
          : 'Cancellation withdrawn; membership continues');
      return json(summarize(updated, adminUser));
    }

    if (action === 'switch-plan') {
      const plan = parsePlan(body.plan);
      if (planOf(sub) === plan) return json(summarize(sub, adminUser));
      const itemId = sub.items?.data?.[0]?.id;
      // During the first 24 hours nothing has been billed yet: just change what
      // gets billed when it ends. Afterwards, charge the prorated difference now.
      const trialing = sub.status === 'trialing';
      const updated = await stripeApi('POST', `/subscriptions/${sub.id}`, {
        items: [{ id: itemId, price: PRICES[plan] }],
        proration_behavior: trialing ? 'none' : 'always_invoice',
        payment_behavior: trialing ? 'allow_incomplete' : 'error_if_incomplete',
        cancel_at_period_end: false,
        expand: ['latest_invoice'],
      });
      const rowId = await saveRow(c, updated, updated.customer);
      await logEvent(c, rowId, updated, 'plan_changed', `Switched to the ${plan} plan`);
      return json(summarize(updated, adminUser));
    }

    throw new HttpError('Unknown action.', 400);
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    if (err instanceof StripeError) {
      console.error('[membership] stripe:', err.status, err.code, err.message);
      // Card problems (402) are the member's to fix; show Stripe's wording.
      return json({ error: err.status === 402 ? err.message : 'Payment service error. Please try again.' },
        err.status === 402 ? 402 : 502);
    }
    console.error('[membership]', err);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
