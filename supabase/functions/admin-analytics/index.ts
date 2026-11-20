// admin-analytics — money and members for the admin dashboard.
//
// Read straight from Stripe, so the admin panel matches the Stripe dashboard:
// every successful card payment in the last 12 months, sorted into
// memberships ($1 entry, monthly, annual), monthly donations and one-time
// donations, with Stripe's fees, refunds and the net that reaches the bank.
// Members are counted from live Stripe subscriptions.
//
// (It used to read only the donations table: membership income never showed,
// unpaid "pending" attempts were counted, and cents were shown as dollars.)

import { requireAdmin, AdminAuthError } from '../_shared/admin.ts';
import { stripeApi } from '../_shared/stripe.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

type Kind = 'membership' | 'monthly_donation' | 'donation' | 'other';

interface Payment {
  id: string;
  kind: Kind;
  label: string;
  amount: number;     // dollars
  fee: number;        // dollars
  refunded: number;   // dollars
  net: number;        // dollars (amount - fee - refunded)
  name: string | null;
  email: string | null;
  created_at: string;
}

const dollars = (cents: number) => Math.round(cents) / 100;

function classify(c: any): { kind: Kind; label: string } {
  const inv = c.invoice && typeof c.invoice === 'object' ? c.invoice : null;
  if (inv) {
    const meta = inv.subscription_details?.metadata ?? {};
    if (meta.type === 'recurring_donation') return { kind: 'monthly_donation', label: 'Monthly donation' };
    const lines: any[] = inv.lines?.data ?? [];
    // The first-day $1 is a one-off line (no recurring price) on the first invoice.
    const entry = lines.some((l) => l.amount > 0 && !l.price?.recurring);
    const yearly = meta.plan === 'annual' || lines.some((l) => l.price?.recurring?.interval === 'year' && l.amount > 0);
    return {
      kind: 'membership',
      label: entry ? 'Membership — $1 first day' : yearly ? 'Membership — yearly' : 'Membership — monthly',
    };
  }
  const pi = c.payment_intent && typeof c.payment_intent === 'object' ? c.payment_intent : null;
  const type = pi?.metadata?.type ?? c.metadata?.type;
  if (type === 'donation' || /donation/i.test(c.description ?? '')) return { kind: 'donation', label: 'Donation' };
  return { kind: 'other', label: c.description || 'Payment' };
}

async function loadPayments(sinceUnix: number): Promise<Payment[]> {
  const out: Payment[] = [];
  let startingAfter: string | undefined;
  for (let page = 0; page < 20; page++) { // up to 2,000 payments
    const res = await stripeApi('GET', '/charges', {
      limit: 100,
      'created[gte]': sinceUnix,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
      expand: ['data.balance_transaction', 'data.invoice', 'data.payment_intent'],
    });
    for (const c of res.data ?? []) {
      if (c.status !== 'succeeded' || !c.paid) continue;
      const { kind, label } = classify(c);
      const fee = typeof c.balance_transaction === 'object' ? c.balance_transaction?.fee ?? 0 : 0;
      const pi = typeof c.payment_intent === 'object' ? c.payment_intent : null;
      out.push({
        id: c.id,
        kind,
        label,
        amount: dollars(c.amount),
        fee: dollars(fee),
        refunded: dollars(c.amount_refunded ?? 0),
        net: dollars(c.amount - fee - (c.amount_refunded ?? 0)),
        name: c.billing_details?.name || pi?.metadata?.donor_name || c.invoice?.customer_name || null,
        email: c.billing_details?.email || c.receipt_email || pi?.metadata?.donor_email || c.invoice?.customer_email || null,
        created_at: new Date(c.created * 1000).toISOString(),
      });
    }
    if (!res.has_more || !res.data?.length) break;
    startingAfter = res.data[res.data.length - 1].id;
  }
  return out;
}

async function loadMembers() {
  const counts = { active: 0, firstDay: 0, monthly: 0, annual: 0, cancelling: 0, pastDue: 0, monthlyDonors: 0 };
  let mrr = 0; // dollars per month from memberships (annual / 12)
  let donationMrr = 0;
  let startingAfter: string | undefined;
  for (let page = 0; page < 20; page++) {
    const res = await stripeApi('GET', '/subscriptions', {
      status: 'all', limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    for (const s of res.data ?? []) {
      if (!['active', 'trialing', 'past_due'].includes(s.status)) continue;
      const price = s.items?.data?.[0]?.price;
      const cents = (price?.unit_amount ?? 0) * (s.items?.data?.[0]?.quantity ?? 1);
      if (s.metadata?.type === 'recurring_donation') {
        counts.monthlyDonors++;
        donationMrr += cents / 100;
        continue;
      }
      // Memberships: the trialing ones count only once their $1 is paid (Stripe
      // keeps an unpaid first attempt as "incomplete", which is skipped above).
      counts.active++;
      if (s.status === 'trialing') counts.firstDay++;
      if (s.status === 'past_due') counts.pastDue++;
      if (s.cancel_at_period_end) counts.cancelling++;
      if (price?.recurring?.interval === 'year') { counts.annual++; mrr += cents / 100 / 12; }
      else { counts.monthly++; mrr += cents / 100; }
    }
    if (!res.has_more || !res.data?.length) break;
    startingAfter = res.data[res.data.length - 1].id;
  }
  return { ...counts, membershipMrr: Math.round(mrr * 100) / 100, donationMrr: Math.round(donationMrr * 100) / 100 };
}

const sum = (ps: Payment[], k: keyof Payment = 'amount') =>
  Math.round(ps.reduce((t, p) => t + (p[k] as number), 0) * 100) / 100;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { adminToken } = await req.json().catch(() => ({}));
    await requireAdmin(adminToken);

    const now = new Date();
    const firstMonth = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const [payments, members] = await Promise.all([
      loadPayments(Math.floor(firstMonth.getTime() / 1000)),
      loadMembers(),
    ]);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const inRange = (p: Payment, from: Date, to?: Date) => {
      const d = new Date(p.created_at);
      return d >= from && (!to || d < to);
    };
    const thisMonth = payments.filter((p) => inRange(p, startOfMonth));
    const lastMonth = payments.filter((p) => inRange(p, startOfLastMonth, startOfMonth));
    const donations = payments.filter((p) => p.kind === 'donation' || p.kind === 'monthly_donation');
    const memberships = payments.filter((p) => p.kind === 'membership');

    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const inMonth = payments.filter((p) => inRange(p, from, to));
      monthlyTrends.push({
        month: from.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        amount: sum(inMonth),
        memberships: sum(inMonth.filter((p) => p.kind === 'membership')),
        donations: sum(inMonth.filter((p) => p.kind !== 'membership')),
        count: inMonth.length,
      });
    }

    const donorMap = new Map<string, { email: string; name: string; total: number; count: number }>();
    for (const d of donations) {
      const key = (d.email || d.name || 'anonymous').toLowerCase();
      const cur = donorMap.get(key) ?? { email: d.email ?? '', name: d.name || d.email || 'Anonymous', total: 0, count: 0 };
      cur.total = Math.round((cur.total + d.amount) * 100) / 100;
      cur.count += 1;
      donorMap.set(key, cur);
    }

    const thisMonthAmount = sum(thisMonth);
    const lastMonthAmount = sum(lastMonth);
    return json({
      success: true,
      analytics: {
        source: 'stripe',
        // all payments, last 12 months
        totalAmount: sum(payments),
        totalPayments: payments.length,
        totalFees: sum(payments, 'fee'),
        totalRefunded: sum(payments, 'refunded'),
        totalNet: sum(payments, 'net'),
        membershipAmount: sum(memberships),
        donationAmount: sum(donations),
        thisMonthAmount,
        thisMonthCount: thisMonth.length,
        lastMonthAmount,
        growthPercentage: lastMonthAmount > 0
          ? Math.round(((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 1000) / 10
          : thisMonthAmount > 0 ? 100 : 0,
        monthlyTrends,
        members,
        topDonors: [...donorMap.values()].sort((a, b) => b.total - a.total).slice(0, 10),
        recentPayments: payments.slice(0, 25),
        // kept for older dashboards
        totalDonations: donations.length,
        activeRecurringCount: members.monthlyDonors,
        monthlyRecurringRevenue: members.donationMrr,
        recentDonations: donations.slice(0, 20).map((d) => ({
          id: d.id, donor_name: d.name, amount: d.amount, created_at: d.created_at,
          is_recurring: d.kind === 'monthly_donation', receipt_sent: true,
        })),
        averageDonation: donations.length ? Math.round((sum(donations) / donations.length) * 100) / 100 : 0,
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) return json({ success: false, error: error.message }, error.status);
    console.error('[admin-analytics]', error);
    return json({ success: false, error: (error as Error).message }, 500);
  }
});
