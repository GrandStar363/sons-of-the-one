// Edge-runtime dispatcher.
//
// supabase/edge-runtime boots exactly one "main" worker. Every request arrives
// here and we spawn a short-lived isolate for the requested function. nginx
// strips the /functions/v1 prefix, so a browser call to
//   POST /functions/v1/create-donation
// arrives here as
//   POST /create-donation
//
// This mirrors how Supabase hosts functions, which is why the 16 recovered
// functions run unmodified.

const FUNCTIONS_ROOT = '/home/deno/functions';

// Generous enough for Stripe and Resend round-trips without letting a wedged
// isolate pin memory indefinitely.
const MEMORY_LIMIT_MB = 256;
const WORKER_TIMEOUT_MS = 60_000;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  const { pathname } = new URL(req.url);
  const name = pathname.split('/').filter(Boolean)[0];

  if (!name) {
    return json({ error: 'missing function name' }, 400);
  }

  // Refuse anything that could escape FUNCTIONS_ROOT.
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(name)) {
    return json({ error: 'invalid function name' }, 400);
  }

  const servicePath = `${FUNCTIONS_ROOT}/${name}`;

  try {
    await Deno.stat(servicePath);
  } catch {
    // Matches databasepad's shape, so callers see the same error we saw while
    // probing the original backend.
    return json({ error: 'not_found' }, 404);
  }

  try {
    // @ts-ignore EdgeRuntime is injected by supabase/edge-runtime
    const worker = await EdgeRuntime.userWorkers.create({
      servicePath,
      memoryLimitMb: MEMORY_LIMIT_MB,
      workerTimeoutMs: WORKER_TIMEOUT_MS,
      noModuleCache: false,
      envVars: Object.entries(Deno.env.toObject()),
    });
    return await worker.fetch(req);
  } catch (err) {
    console.error(`[main] ${name} failed:`, err);
    return json({ error: String(err?.message ?? err) }, 500);
  }
});
