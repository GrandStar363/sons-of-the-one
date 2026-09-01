
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Direct fetch to Supabase REST API instead of using client library
    const subscriptionResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_subscriptions?email=eq.${encodeURIComponent(email)}&limit=1`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const subscriptions = await subscriptionResponse.json();
    const subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;

    if (!subscription) {
      return new Response(JSON.stringify({
        hasSubscription: false,
        status: 'none',
        subscription: null,
        history: []
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Get subscription history
    const historyResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscription_history?email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=20`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const history = await historyResponse.json();

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (subscription.status === 'trialing' && subscription.trial_end) {
      const trialEnd = new Date(subscription.trial_end);
      const now = new Date();
      const diffTime = trialEnd.getTime() - now.getTime();
      trialDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    return new Response(JSON.stringify({
      hasSubscription: subscription.status !== 'none' && subscription.status !== 'canceled',
      status: subscription.status,
      planType: subscription.plan_type,
      trialDaysRemaining,
      trialEnd: subscription.trial_end,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at,
      stripeCustomerId: subscription.stripe_customer_id,
      stripeSubscriptionId: subscription.stripe_subscription_id,
      createdAt: subscription.created_at,
      history: history || []
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
