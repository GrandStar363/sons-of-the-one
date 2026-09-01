
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { stripeFetch } from '../_shared/stripe.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Recurring donation price IDs
const RECURRING_PRICES: Record<number, string> = {
  1000: 'price_1SjRj6HzXgTRD3HA3id9GyMs',   // $10/month
  2500: 'price_1SjRj6HzXgTRD3HATcvs3SOj',   // $25/month
  5000: 'price_1SjRj7HzXgTRD3HA9XhSud0p',   // $50/month
  10000: 'price_1SjRj7HzXgTRD3HAqblj8dBe'   // $100/month
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {

    const { email, name, amount, action, customerId: existingCustomerId } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Cancel recurring donation
    if (action === 'cancel') {
      const { subscriptionId } = await req.json();
      if (!subscriptionId) throw new Error("Subscription ID is required");

      const cancelResponse = await stripeFetch(`https://stripe.gateway.fastrouter.io/payments/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ immediately: false })
      });

      const cancelData = await cancelResponse.json();
      if (!cancelResponse.ok) throw new Error(cancelData.error || 'Failed to cancel recurring donation');

      // Update database
      await supabase
        .from('recurring_donations')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Step 1: Create customer and SetupIntent
    if (action === 'create-setup-intent' || !action) {
      if (!email) throw new Error("Email is required");
      if (!amount || !RECURRING_PRICES[amount]) {
        throw new Error("Please select a valid recurring donation amount ($10, $25, $50, or $100/month)");
      }

      // Check if customer exists
      const customersResponse = await stripeFetch(`https://stripe.gateway.fastrouter.io/payments/customers?email=${encodeURIComponent(email)}`, {
        headers: { 'Content-Type': 'application/json'}
      });
      const customersData = await customersResponse.json();
      
      let customerId;
      if (customersData.data?.length > 0) {
        customerId = customersData.data[0].id;
      } else {
        // Create new customer
        const createCustomerResponse = await stripeFetch('https://stripe.gateway.fastrouter.io/payments/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({ 
            email, 
            name: name || email.split('@')[0],
            metadata: { type: 'recurring_donor' }
          })
        });
        const newCustomer = await createCustomerResponse.json();
        if (!createCustomerResponse.ok) throw new Error(newCustomer.error || 'Failed to create customer');
        customerId = newCustomer.id;
      }

      // Create SetupIntent
      const setupIntentResponse = await stripeFetch('https://stripe.gateway.fastrouter.io/payments/setup-intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          customer: customerId, 
          metadata: { 
            price_id: RECURRING_PRICES[amount],
            amount: amount.toString(),
            type: 'recurring_donation'
          }
        })
      });
      const setupIntent = await setupIntentResponse.json();
      if (!setupIntentResponse.ok) throw new Error(setupIntent.error || 'Failed to create setup intent');

      return new Response(JSON.stringify({
        clientSecret: setupIntent.clientSecret,
        customerId,
        setupIntentId: setupIntent.id,
        priceId: RECURRING_PRICES[amount]
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Step 2: Activate recurring donation subscription
    if (action === 'activate-recurring') {
      if (!existingCustomerId) throw new Error("Customer ID is required");
      if (!amount || !RECURRING_PRICES[amount]) throw new Error("Invalid amount");

      const priceId = RECURRING_PRICES[amount];

      const subscriptionResponse = await stripeFetch('https://stripe.gateway.fastrouter.io/payments/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          customer: existingCustomerId, 
          items: [{ price: priceId }],
          metadata: { type: 'recurring_donation' }
        })
      });
      const subscription = await subscriptionResponse.json();
      if (!subscriptionResponse.ok) throw new Error(subscription.error || 'Failed to create recurring donation');

      // Calculate next billing date
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      // Save to database
      const { data: recurringDonation, error: dbError } = await supabase
        .from('recurring_donations')
        .insert({
          email,
          name: name || 'Monthly Supporter',
          amount,
          currency: 'usd',
          stripe_subscription_id: subscription.id,
          stripe_customer_id: existingCustomerId,
          stripe_price_id: priceId,
          status: 'active',
          next_billing_date: nextBillingDate.toISOString()
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error saving recurring donation:', dbError);
      }

      return new Response(JSON.stringify({
        subscriptionId: subscription.id,
        status: subscription.status,
        recurringDonationId: recurringDonation?.id
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    throw new Error("Invalid action");
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
