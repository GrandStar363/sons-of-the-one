
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireAdmin, AdminAuthError } from '../_shared/admin.ts';

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
    // This endpoint previously read no body and performed no authorization:
    // anyone with the public anon key could pull donation analytics.
    const { adminToken } = await req.json().catch(() => ({}));
    await requireAdmin(adminToken);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get total donations
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (donationsError) throw donationsError;

    const allDonations = donations || [];
    
    // Calculate total amount
    const totalAmount = allDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    
    // Calculate this month's donations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthDonations = allDonations.filter(d => new Date(d.created_at) >= startOfMonth);
    const thisMonthAmount = thisMonthDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

    // Calculate last month's donations for comparison
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthDonations = allDonations.filter(d => {
      const date = new Date(d.created_at);
      return date >= startOfLastMonth && date <= endOfLastMonth;
    });
    const lastMonthAmount = lastMonthDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

    // Calculate monthly trends (last 12 months)
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const monthDonations = allDonations.filter(d => {
        const date = new Date(d.created_at);
        return date >= monthStart && date <= monthEnd;
      });
      
      monthlyTrends.push({
        month: monthName,
        amount: monthDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0),
        count: monthDonations.length
      });
    }

    // Get top donors
    const donorMap = new Map();
    allDonations.forEach(d => {
      const email = d.donor_email || 'anonymous';
      const existing = donorMap.get(email) || { email, name: d.donor_name || 'Anonymous', total: 0, count: 0 };
      existing.total += parseFloat(d.amount) || 0;
      existing.count += 1;
      donorMap.set(email, existing);
    });

    const topDonors = Array.from(donorMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Get recent donations
    const recentDonations = allDonations.slice(0, 20).map(d => ({
      id: d.id,
      amount: d.amount,
      donor_name: d.donor_name,
      donor_email: d.donor_email,
      is_recurring: d.is_recurring,
      receipt_sent: d.receipt_sent,
      created_at: d.created_at
    }));

    // Get recurring donations stats
    const { data: recurringDonations } = await supabase
      .from('recurring_donations')
      .select('*')
      .eq('status', 'active');

    const activeRecurring = recurringDonations || [];
    const monthlyRecurringRevenue = activeRecurring.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    // Calculate growth percentage
    const growthPercentage = lastMonthAmount > 0 
      ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount * 100).toFixed(1)
      : thisMonthAmount > 0 ? 100 : 0;

    return new Response(JSON.stringify({
      success: true,
      analytics: {
        totalAmount,
        totalDonations: allDonations.length,
        thisMonthAmount,
        thisMonthCount: thisMonthDonations.length,
        lastMonthAmount,
        growthPercentage: parseFloat(growthPercentage),
        monthlyTrends,
        topDonors,
        recentDonations,
        activeRecurringCount: activeRecurring.length,
        monthlyRecurringRevenue,
        averageDonation: allDonations.length > 0 ? (totalAmount / allDonations.length).toFixed(2) : 0
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return new Response(JSON.stringify({ success: false, error: error.message }),
        { status: error.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
