
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { email, action } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get public donors for thank you wall
    if (action === 'get-public-donors') {
      const { data: publicDonors, error: publicError } = await supabase
        .from('donations')
        .select('name, amount, message, created_at')
        .eq('show_on_wall', true)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (publicError) throw publicError;

      return new Response(JSON.stringify({
        donors: publicDonors || []
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get impact metrics
    if (action === 'get-impact-metrics') {
      const { data: metrics, error: metricsError } = await supabase
        .from('donation_impact_metrics')
        .select('*')
        .order('metric_name');

      if (metricsError) throw metricsError;

      // Get total donations stats
      const { data: totalStats, error: statsError } = await supabase
        .from('donations')
        .select('amount')
        .eq('status', 'completed');

      let totalAmount = 0;
      let totalDonations = 0;
      if (!statsError && totalStats) {
        totalDonations = totalStats.length;
        totalAmount = totalStats.reduce((sum, d) => sum + d.amount, 0);
      }

      return new Response(JSON.stringify({
        metrics: metrics || [],
        totalDonations,
        totalAmount
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get user's donation history
    if (!email) {
      throw new Error("Email is required to view donation history");
    }

    // Get one-time donations with receipt info including email send error
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('id, amount, status, donation_type, message, created_at, completed_at, receipt_number, email_receipt_sent, email_send_error, email_send_attempts')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (donationsError) throw donationsError;

    // Get recurring donations
    const { data: recurringDonations, error: recurringError } = await supabase
      .from('recurring_donations')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (recurringError) throw recurringError;

    // Calculate lifetime giving
    const completedDonations = (donations || []).filter(d => d.status === 'completed');
    const lifetimeTotal = completedDonations.reduce((sum, d) => sum + d.amount, 0);

    // Calculate recurring total (estimate based on months active)
    let recurringTotal = 0;
    for (const rd of (recurringDonations || [])) {
      if (rd.status === 'active' || rd.status === 'cancelled') {
        const startDate = new Date(rd.created_at);
        const endDate = rd.cancelled_at ? new Date(rd.cancelled_at) : new Date();
        const monthsActive = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)));
        recurringTotal += rd.amount * monthsActive;
      }
    }

    return new Response(JSON.stringify({
      donations: donations || [],
      recurringDonations: recurringDonations || [],
      lifetimeTotal: lifetimeTotal + recurringTotal,
      oneTimeTotal: lifetimeTotal,
      recurringTotal,
      totalDonations: completedDonations.length
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
