import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Password hashing.
//
// This function previously stored sha256(password + 'bibleapp_salt') -- a fast
// general-purpose digest with one hard-coded salt shared by every install. That
// is not a password hash: SHA-256 is built to be quick, so it is cheap to brute
// force offline, and a single global salt means one rainbow table works against
// every deployment of this application at once.
//
// Passwords are now PBKDF2-HMAC-SHA256 with a random per-user salt. Stored as
//
//     pbkdf2$<iterations>$<salt-b64>$<hash-b64>
//
// so the cost can be raised later without invalidating existing hashes.
// Legacy sha256 hashes are still accepted at login and transparently rewritten
// to the new format, so existing admins keep working and upgrade on next use.

const PBKDF2_ITERATIONS = 210_000;   // OWASP guidance for PBKDF2-HMAC-SHA256
const LEGACY_SALT = 'bibleapp_salt';

const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256,
  );
  return b64(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64(salt.buffer)}$${hash}`;
}

/** Constant-time string compare -- a length-independent early return leaks. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyPassword(
  password: string,
  stored: string,
): Promise<{ ok: boolean; needsUpgrade: boolean }> {
  if (stored?.startsWith('pbkdf2$')) {
    const [, iterStr, saltB64, hashB64] = stored.split('$');
    const iterations = Number(iterStr);
    if (!Number.isFinite(iterations) || !saltB64 || !hashB64) {
      return { ok: false, needsUpgrade: false };
    }
    const computed = await pbkdf2(password, unb64(saltB64), iterations);
    return {
      ok: timingSafeEqual(computed, hashB64),
      // Re-hash if the stored cost has fallen behind the current one.
      needsUpgrade: iterations < PBKDF2_ITERATIONS,
    };
  }

  // Legacy sha256(password + global salt).
  const legacy = await sha256Hex(password + LEGACY_SALT);
  return { ok: timingSafeEqual(legacy, stored ?? ''), needsUpgrade: true };
}

function genToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action, email, password, token } = await req.json();

    // There used to be a block here that created admin@bibleapp.com with the
    // password "admin123" whenever the admins table was empty -- described as
    // making sure the dashboard is "never locked out".
    //
    // It ran before the action check, so ANY request reached it, including an
    // unauthenticated failed login from anyone holding the anon key, which
    // ships in the browser bundle. That made a well-known default super_admin
    // credential exist on every install, and deleting the account did not help:
    // the next request recreated it.
    //
    // The first admin is now seeded explicitly and out of band:
    //
    //     python3 tools/create-admin.py --email you@example.com --role super_admin
    //
    // Being locked out is recoverable by running that. A publicly known
    // super_admin password is not recoverable at all.

    if (action === 'login') {
      if (!email || !password) {
        return json({ success: false, error: 'Email and password are required' }, 400);
      }

      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', String(email).toLowerCase().trim())
        .maybeSingle();

      // A query error is not a failed login. These used to be reported
      // together as "Invalid email or password", so an unreachable database --
      // nginx down, PostgREST down, a stale schema cache -- presented as every
      // admin suddenly having the wrong password, which sends you looking in
      // entirely the wrong place.
      if (error) {
        console.error('[admin-auth] admin lookup failed:', error.message);
        return json(
          { success: false, error: 'Authentication is temporarily unavailable' },
          503,
        );
      }

      if (!admin) {
        return json({ success: false, error: 'Invalid email or password' }, 401);
      }

      const { ok, needsUpgrade } = await verifyPassword(password, admin.password_hash);
      if (!ok) {
        return json({ success: false, error: 'Invalid email or password' }, 401);
      }

      // Migrate a legacy or under-cost hash now that the password is known to
      // be correct. Best-effort: a failure here must not block the login.
      if (needsUpgrade) {
        try {
          await supabase
            .from('admins')
            .update({ password_hash: await hashPassword(password) })
            .eq('id', admin.id);
        } catch (e) {
          console.error('[admin-auth] password hash upgrade failed:', e);
        }
      }

      const newToken = genToken();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days

      await supabase.from('admin_sessions').insert({
        token: newToken,
        admin_id: admin.id,
        expires_at: expiresAt
      });

      return json({
        success: true,
        token: newToken,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    }

    if (action === 'verify') {
      if (!token) return json({ success: false, error: 'No token' }, 401);

      const { data: session } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('token', token)
        .maybeSingle();

      if (!session || new Date(session.expires_at) < new Date()) {
        return json({ success: false, error: 'Session expired' }, 401);
      }

      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('id', session.admin_id)
        .maybeSingle();

      if (!admin) return json({ success: false, error: 'Admin not found' }, 401);

      return json({
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    }

    if (action === 'logout') {
      if (token) {
        await supabase.from('admin_sessions').delete().eq('token', token);
      }
      return json({ success: true });
    }

    return json({ success: false, error: 'Unknown action' }, 400);
  } catch (err) {
    return json({ success: false, error: (err as Error).message }, 500);
  }
});
