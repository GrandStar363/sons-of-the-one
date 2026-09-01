// admin-contact-messages
//
// contact_messages is public-INSERT only (the contact form) and locked to
// service-role for reads/edits by RLS (migration 0003). The admin dashboard
// therefore cannot query the table directly with the anon key any more -- it
// goes through this function, which authenticates the admin session first,
// exactly like the other admin-* functions.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireAdmin, auditLog, AdminAuthError } from '../_shared/admin.ts';

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

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, messageId, responseNotes, adminToken } = await req.json();

    const who = await requireAdmin(adminToken);

    if (action === 'list') {
      const { data: messages, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return json({ success: true, messages: messages ?? [] });
    }

    if (action === 'respond') {
      if (!messageId) return json({ success: false, error: 'messageId is required' }, 400);
      const { error } = await supabase
        .from('contact_messages')
        .update({
          status: 'responded',
          responded_at: new Date().toISOString(),
          response_notes: responseNotes ?? null,
        })
        .eq('id', messageId);
      if (error) throw error;
      await auditLog(who, 'contact_message_respond', messageId);
      return json({ success: true });
    }

    if (action === 'delete') {
      if (!messageId) return json({ success: false, error: 'messageId is required' }, 400);
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);
      if (error) throw error;
      await auditLog(who, 'contact_message_delete', messageId);
      return json({ success: true });
    }

    return json({ success: false, error: 'Unknown action' }, 400);
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return json({ success: false, error: err.message }, err.status);
    }
    return json({ success: false, error: (err as Error).message }, 500);
  }
});
