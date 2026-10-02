
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { stripeFetch } from '../_shared/stripe.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { email, immediately = false } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    // Get subscription from database
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('email', email)
      .single();

    if (subError || !subscription) {
      throw new Error("Subscription not found");
    }

    if (!subscription.stripe_subscription_id) {
      throw new Error("No active Stripe subscription found");
    }

    // Cancel subscription in Stripe
    const cancelResponse = await stripeFetch(
      `https://stripe.gateway.fastrouter.io/payments/subscriptions/${subscription.stripe_subscription_id}/cancel`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ immediately })
      }
    );

    const cancelData = await cancelResponse.json();
    
    if (!cancelResponse.ok) {
      throw new Error(cancelData.error || 'Failed to cancel subscription');
    }

    const now = new Date();
    
    // Update subscription in database
    const updateData: any = {
      updated_at: now.toISOString()
    };

    if (immediately) {
      updateData.status = 'canceled';
      updateData.canceled_at = now.toISOString();
    } else {
      updateData.cancel_at_period_end = true;
      updateData.canceled_at = now.toISOString();
    }

    await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('id', subscription.id);

    // Add to subscription history
    await supabase
      .from('subscription_history')
      .insert({
        user_subscription_id: subscription.id,
        email: subscription.email,
        event_type: 'canceled',
        stripe_subscription_id: subscription.stripe_subscription_id,
        plan_type: subscription.plan_type,
        description: immediately 
          ? 'Subscription canceled immediately' 
          : `Subscription will cancel at end of billing period (${subscription.current_period_end})`,
        metadata: { 
          immediately,
          cancel_at_period_end: !immediately,
          current_period_end: subscription.current_period_end
        }
      });

    return new Response(JSON.stringify({
      success: true,
      message: immediately 
        ? 'Subscription canceled immediately' 
        : 'Subscription will cancel at end of billing period',
      canceledAt: now.toISOString(),
      accessUntil: immediately ? now.toISOString() : subscription.current_period_end
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
