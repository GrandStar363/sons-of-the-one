
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, requestId, adminId, status, rejectionReason, page = 1, limit = 20, filterStatus, requestData, adminToken } = await req.json();

    // Previously unauthenticated: reachable by anyone with the anon key.
    await requireAdmin(adminToken);

    if (action === 'list') {
      let query = supabase
        .from('prayer_requests')
        .select('*', { count: 'exact' });

      if (filterStatus && filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data: requests, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Get stats
      const { data: allRequests } = await supabase
        .from('prayer_requests')
        .select('status');

      const stats = {
        total: allRequests?.length || 0,
        pending: allRequests?.filter(r => r.status === 'pending').length || 0,
        approved: allRequests?.filter(r => r.status === 'approved').length || 0,
        rejected: allRequests?.filter(r => r.status === 'rejected').length || 0
      };

      return new Response(JSON.stringify({
        success: true,
        requests: requests || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
        stats
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'moderate') {
      if (!requestId || !status || !adminId) {
        throw new Error('Request ID, status, and admin ID are required');
      }

      if (!['approved', 'rejected'].includes(status)) {
        throw new Error('Status must be approved or rejected');
      }

      const updateData: any = {
        status,
        moderated_by: adminId,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (status === 'rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { data: request, error } = await supabase
        .from('prayer_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        request
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'submit') {
      // Public endpoint for submitting prayer requests
      if (!requestData?.request_text) {
        throw new Error('Prayer request text is required');
      }

      const { data: request, error } = await supabase
        .from('prayer_requests')
        .insert({
          user_email: requestData.user_email || null,
          user_name: requestData.user_name || null,
          request_text: requestData.request_text,
          is_anonymous: requestData.is_anonymous || false,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        request
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'delete') {
      if (!requestId) throw new Error('Request ID is required');

      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'get-approved') {
      // Public endpoint for getting approved prayer requests
      const { data: requests, error } = await supabase
        .from('prayer_requests')
        .select('id, request_text, user_name, is_anonymous, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        requests: requests?.map(r => ({
          ...r,
          user_name: r.is_anonymous ? 'Anonymous' : r.user_name
        })) || []
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
