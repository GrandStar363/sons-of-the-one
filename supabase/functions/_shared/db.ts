// Shared helpers for the six functions Famous.ai never wrote.
//
// The recovered functions each re-declared their own CORS headers and Supabase
// client. These six are new code, so they share one implementation instead.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-api-version',
};

/**
 * Service-role client. Bypasses RLS, so every function below is responsible
 * for scoping its own queries to the caller's user_id.
 */
export function admin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
}

export function ok(body: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ success: true, ...body }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export function fail(message: string, status = 400): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/** Standard preflight + JSON-body handling wrapper. */
export function handler(
  fn: (body: any, req: Request) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }
    try {
      const body = await req.json().catch(() => ({}));
      return await fn(body, req);
    } catch (err) {
      console.error(err);
      // Supabase errors are plain objects, not Errors -- String() on them
      // yields "[object Object]" and hides the actual cause.
      const e = err as Record<string, unknown>;
      const message = typeof e?.message === 'string'
        ? [e.message, e.details, e.hint].filter(Boolean).join(' | ')
        : JSON.stringify(err);
      return fail(message, 500);
    }
  };
}
