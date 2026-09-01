
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { stripeFetch } from '../_shared/stripe.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const MONTHLY_PRICE_ID = 'price_1SjRTnHzXgTRD3HAmkJ6L4ov';
const ANNUAL_PRICE_ID = 'price_1SjRTnHzXgTRD3HA5YTQnY3H';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { email, name, action, customerId: existingCustomerId, planType = 'monthly' } = await req.json();

    const priceId = planType === 'annual' ? ANNUAL_PRICE_ID : MONTHLY_PRICE_ID;

    // STEP 1: Create customer and SetupIntent to collect payment method
    if (action === 'create-setup-intent' || !action) {
      if (!email) throw new Error("Email is required");

      // Check if customer exists in Stripe
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
          body: JSON.stringify({ email, name: name || email.split('@')[0] })
        });
        const newCustomer = await createCustomerResponse.json();
        if (!createCustomerResponse.ok) throw new Error(newCustomer.error || 'Failed to create customer');
        customerId = newCustomer.id;
      }

      // Upsert user subscription record
      await supabase
        .from('user_subscriptions')
        .upsert({
          email,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });

      // Create SetupIntent to collect payment method
      const setupIntentResponse = await stripeFetch('https://stripe.gateway.fastrouter.io/payments/setup-intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          customer: customerId, 
          metadata: { 
            price_id: priceId,
            plan_type: planType,
            trial_days: '3'
          } 
        })
      });
      const setupIntent = await setupIntentResponse.json();
      if (!setupIntentResponse.ok) throw new Error(setupIntent.error || 'Failed to create setup intent');

      return new Response(JSON.stringify({
        clientSecret: setupIntent.clientSecret,
        customerId,
        setupIntentId: setupIntent.id,
        priceId,
        planType
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // STEP 2: Create subscription after payment method is saved (with 3-day trial)
    if (action === 'activate-subscription') {
      if (!existingCustomerId) throw new Error("Customer ID is required");

      const subscriptionResponse = await stripeFetch('https://stripe.gateway.fastrouter.io/payments/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          customer: existingCustomerId, 
          items: [{ price: priceId }],
          trial_period_days: 3,
          metadata: {
            plan_type: planType,
            app: 'divine_word_bible'
          }
        })
      });
      const subscription = await subscriptionResponse.json();
      if (!subscriptionResponse.ok) throw new Error(subscription.error || 'Failed to create subscription');

      // Calculate dates
      const now = new Date();
      const trialEnd = new Date(subscription.trial_end * 1000);
      const periodEnd = new Date(subscription.current_period_end * 1000);

      // Update user subscription in database
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .update({
          stripe_subscription_id: subscription.id,
          status: subscription.status, // 'trialing'
          plan_type: planType,
          trial_start: now.toISOString(),
          trial_end: trialEnd.toISOString(),
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('stripe_customer_id', existingCustomerId)
        .select()
        .single();

      // Add to subscription history
      await supabase
        .from('subscription_history')
        .insert({
          user_subscription_id: subData?.id,
          email: subData?.email || email,
          event_type: 'trial_started',
          stripe_subscription_id: subscription.id,
          plan_type: planType,
          description: `Started 3-day free trial for ${planType} plan`,
          metadata: { trial_end: trialEnd.toISOString() }
        });

      return new Response(JSON.stringify({
        subscriptionId: subscription.id,
        status: subscription.status,
        trialEnd: subscription.trial_end,
        currentPeriodEnd: subscription.current_period_end
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    throw new Error("Invalid action");
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
