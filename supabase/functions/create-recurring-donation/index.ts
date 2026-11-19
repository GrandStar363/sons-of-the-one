// create-recurring-donation — monthly donations ($10 / $25 / $50 / $100).
//
//   create-setup-intent { email, name, amount }      -> { clientSecret, customerId, setupIntentId, priceId }
//   activate-recurring  { customerId, amount, email, name } -> { subscriptionId, status, recurringDonationId }
//   cancel              { subscriptionId }            -> { success }   (ends after the current month)
//
// Prices are found by lookup key (sog_donation_monthly_<cents>), so the same
// code works in Stripe test and live mode without hard-coded price ids.
// The card saved by the SetupIntent is made the subscription's payment
// method; without that, the first monthly charge has no card to use.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { stripeApi, StripeError } from '../_shared/stripe.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const AMOUNTS = [1000, 2500, 5000, 10000]; // cents per month
const lookupKey = (cents: number) => `sog_donation_monthly_${cents}`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

async function priceFor(cents: number): Promise<string> {
  const found = await stripeApi('GET', '/prices', { lookup_keys: [lookupKey(cents)], active: true, limit: 1 });
  const id = found.data?.[0]?.id;
  if (!id) throw new Error('Monthly donations are not set up yet. Please try again later.');
  return id;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Read the body once (the cancel branch used to read it twice and always failed).
    const { email, name, amount, action, customerId: existingCustomerId, subscriptionId } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ---- Cancel: no further charges after the current month ------------------
    if (action === 'cancel') {
      if (!subscriptionId || !/^sub_[A-Za-z0-9]+$/.test(String(subscriptionId))) {
        throw new Error('Subscription ID is required');
      }
      await stripeApi('POST', `/subscriptions/${subscriptionId}`, { cancel_at_period_end: true });
      await supabase.from('recurring_donations')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscriptionId);
      return json({ success: true });
    }

    // ---- Step 1: customer + SetupIntent (saves the card) --------------------
    if (action === 'create-setup-intent' || !action) {
      if (!email) throw new Error('Email is required');
      if (!AMOUNTS.includes(Number(amount))) {
        throw new Error('Please select a valid recurring donation amount ($10, $25, $50, or $100/month)');
      }
      const priceId = await priceFor(Number(amount));

      const existing = await stripeApi('GET', '/customers', { email: String(email).toLowerCase(), limit: 1 });
      let customerId: string = existing.data?.[0]?.id;
      if (!customerId) {
        const created = await stripeApi('POST', '/customers', {
          email: String(email).toLowerCase(),
          name: name || String(email).split('@')[0],
          metadata: { type: 'recurring_donor', app: 'sons_of_the_one' },
        });
        customerId = created.id;
      }

      const setupIntent = await stripeApi('POST', '/setup_intents', {
        customer: customerId,
        usage: 'off_session',
        automatic_payment_methods: { enabled: true },
        metadata: { price_id: priceId, amount: String(amount), type: 'recurring_donation', app: 'sons_of_the_one' },
      });

      return json({ clientSecret: setupIntent.client_secret, customerId, setupIntentId: setupIntent.id, priceId });
    }

    // ---- Step 2: start the monthly donation with the saved card --------------
    if (action === 'activate-recurring') {
      if (!existingCustomerId || !/^cus_[A-Za-z0-9]+$/.test(String(existingCustomerId))) {
        throw new Error('Customer ID is required');
      }
      if (!AMOUNTS.includes(Number(amount))) throw new Error('Invalid amount');
      const priceId = await priceFor(Number(amount));

      // The card just saved by the SetupIntent.
      const intents = await stripeApi('GET', '/setup_intents', { customer: existingCustomerId, limit: 5 });
      const saved = (intents.data ?? []).find((si: any) => si.status === 'succeeded' && si.payment_method);
      if (!saved) throw new Error('Your card was not saved. Please try again.');
      const paymentMethod = typeof saved.payment_method === 'string' ? saved.payment_method : saved.payment_method.id;

      await stripeApi('POST', `/customers/${existingCustomerId}`, {
        invoice_settings: { default_payment_method: paymentMethod },
      });
      const subscription = await stripeApi('POST', '/subscriptions', {
        customer: existingCustomerId,
        items: [{ price: priceId }],
        default_payment_method: paymentMethod,
        // Charge the first month now; if the card declines, say so instead of
        // recording a donation that never happened.
        payment_behavior: 'error_if_incomplete',
        metadata: { type: 'recurring_donation', app: 'sons_of_the_one' },
        expand: ['latest_invoice'],
      });

      const { data: recurringDonation, error: dbError } = await supabase
        .from('recurring_donations')
        .insert({
          email,
          name: name || 'Monthly Supporter',
          amount: Number(amount),
          currency: 'usd',
          stripe_subscription_id: subscription.id,
          stripe_customer_id: existingCustomerId,
          stripe_price_id: priceId,
          status: subscription.status === 'active' ? 'active' : subscription.status,
          next_billing_date: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
        })
        .select()
        .single();
      if (dbError) console.error('Error saving recurring donation:', dbError);

      return json({ subscriptionId: subscription.id, status: subscription.status, recurringDonationId: recurringDonation?.id });
    }

    throw new Error('Invalid action');
  } catch (error) {
    const message = error instanceof StripeError && error.status === 402
      ? error.message // card declined etc.: the donor's to fix
      : (error as Error).message;
    console.error('[create-recurring-donation]', message);
    return json({ error: message }, error instanceof StripeError && error.status === 402 ? 402 : 500);
  }
});
