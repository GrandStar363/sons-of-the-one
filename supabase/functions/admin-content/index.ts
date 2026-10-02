
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
    const { action, contentType, contentId, contentData, adminId, page = 1, limit = 20, adminToken } = await req.json();

    // Previously unauthenticated: reachable by anyone with the anon key.
    await requireAdmin(adminToken);

    // FEATURED VERSES
    if (contentType === 'verses') {
      if (action === 'list') {
        const { data: verses, error, count } = await supabase
          .from('featured_verses')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          verses: verses || [],
          total: count || 0,
          page,
          totalPages: Math.ceil((count || 0) / limit)
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (action === 'create') {
        if (!contentData?.reference || !contentData?.verse_text) {
          throw new Error('Reference and verse text are required');
        }

        const { data: verse, error } = await supabase
          .from('featured_verses')
          .insert({
            reference: contentData.reference,
            verse_text: contentData.verse_text,
            translation: contentData.translation || 'KJV',
            is_active: contentData.is_active ?? true,
            display_date: contentData.display_date || null,
            created_by: adminId
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          verse
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (action === 'update') {
        if (!contentId) throw new Error('Content ID is required');

        const { data: verse, error } = await supabase
          .from('featured_verses')
          .update({ ...contentData, updated_at: new Date().toISOString() })
          .eq('id', contentId)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          verse
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (action === 'delete') {
        if (!contentId) throw new Error('Content ID is required');

        const { error } = await supabase
          .from('featured_verses')
          .delete()
          .eq('id', contentId);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (action === 'get-active') {
        const { data: verses, error } = await supabase
          .from('featured_verses')
          .select('*')
          .eq('is_active', true)
          .order('display_date', { ascending: false })
          .limit(10);

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          verses: verses || []
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    // DEVOTIONALS
    if (contentType === 'devotionals') {
      if (action === 'list') {
        const { data: devotionals, error, count } = await supabase
          .from('devotionals')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          devotionals: devotionals || [],
          total: count || 0,
          page,
          totalPages: Math.ceil((count || 0) / limit)
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (action === 'create') {
        if (!contentData?.title || !contentData?.content) {
          throw new Error('Title and content are required');
        }

        const { data: devotional, error } = await supabase
          .from('devotionals')
          .insert({
            title: contentData.title,
            content: contentData.content,
            scripture_reference: contentData.scripture_reference || null,
            scripture_text: contentData.scripture_text || null,
            author: contentData.author || null,
            is_published: contentData.is_published ?? false,
            publish_date: contentData.publish_date || null,
            created_by: adminId
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          devotional
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (action === 'update') {
        if (!contentId) throw new Error('Content ID is required');

        const { data: devotional, error } = await supabase
          .from('devotionals')
          .update({ ...contentData, updated_at: new Date().toISOString() })
          .eq('id', contentId)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          devotional
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (action === 'delete') {
        if (!contentId) throw new Error('Content ID is required');

        const { error } = await supabase
          .from('devotionals')
          .delete()
          .eq('id', contentId);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (action === 'get-published') {
        const today = new Date().toISOString().split('T')[0];
        const { data: devotionals, error } = await supabase
          .from('devotionals')
          .select('*')
          .eq('is_published', true)
          .lte('publish_date', today)
          .order('publish_date', { ascending: false })
          .limit(10);

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          devotionals: devotionals || []
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    throw new Error('Invalid action or content type');
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
