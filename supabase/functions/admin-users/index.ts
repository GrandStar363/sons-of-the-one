
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireAdmin, requireRole, auditLog, AdminAuthError } from '../_shared/admin.ts';

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
    const { action, userId, userData, page = 1, limit = 20, search, adminToken, email }
      = await req.json();

    // These endpoints previously performed no authorization at all: anyone
    // holding the public anon key could list every member's email.
    const who = await requireAdmin(adminToken);

    if (action === 'list') {
      let query = supabase
        .from('app_users')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
      }

      const { data: users, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        users: users || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'get') {
      if (!userId) throw new Error('User ID is required');

      const { data: user, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Get user's donations (donations are keyed by `email`, not `donor_email`;
      // `donor_email` only ever existed in the Stripe metadata, never as a column).
      const { data: donations } = await supabase
        .from('donations')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(10);

      return new Response(JSON.stringify({
        success: true,
        user,
        donations: donations || []
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'update') {
      if (!userId || !userData) throw new Error('User ID and data are required');

      const { data: user, error } = await supabase
        .from('app_users')
        .update({ ...userData, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        user
      }), {
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
      const { data: users, error } = await supabase
        .from('app_users')
        .select('*');

      if (error) throw error;

      const allUsers = users || [];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        totalUsers: allUsers.length,
        subscribedUsers: allUsers.filter(u => u.is_subscribed).length,
        newUsersThisMonth: allUsers.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length,
        activeUsersThisWeek: allUsers.filter(u => u.last_active && new Date(u.last_active) >= sevenDaysAgo).length,
        totalDonations: allUsers.reduce((sum, u) => sum + (parseFloat(u.total_donations) || 0), 0)
      };

      return new Response(JSON.stringify({
        success: true,
        stats
      }), {
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
