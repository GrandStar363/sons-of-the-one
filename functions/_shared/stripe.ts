// Stripe client for the recovered edge functions.
//
// These functions were written against Famous.ai's proxy at
// stripe.gateway.fastrouter.io, which accepted JSON and authenticated with an
// X-API-Key header. That host dies with Famous. Real Stripe differs in ways the
// original call sites do not account for:
//
//   1. auth      Authorization: Bearer sk_...        (not X-API-Key)
//   2. encoding  application/x-www-form-urlencoded   (not JSON)
//   3. nesting   metadata[key]=value                 (not nested objects)
//   4. paths     /v1/payment_intents                 (not /payments/payment-intents)
//   5. field     client_secret                       (proxy returned clientSecret)
//
// `stripeFetch` is deliberately fetch-compatible: it takes the ORIGINAL proxy
// URL and init object and returns a real Response. That way each call site only
// changes `fetch(` to `stripeFetch(` and all the surrounding `.json()` / `.ok`
// handling keeps working. Translation happens here, in one reviewable place.

const STRIPE_API = 'https://api.stripe.com/v1';

// Famous proxy resource -> real Stripe resource
const PATH_MAP: Record<string, string> = {
  'payment-intents': 'payment_intents',
  'setup-intents': 'setup_intents',
  'customers': 'customers',
  'subscriptions': 'subscriptions',
};

/** Flatten nested objects into Stripe's bracket notation. */
function toForm(obj: Record<string, unknown>, prefix = '', out = new URLSearchParams()): URLSearchParams {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item !== null && typeof item === 'object') {
          toForm(item as Record<string, unknown>, `${key}[${i}]`, out);
        } else {
          out.append(`${key}[${i}]`, String(item));
        }
      });
    } else if (typeof v === 'object') {
      toForm(v as Record<string, unknown>, key, out);
    } else {
      out.append(key, String(v));
    }
  }
  return out;
}

interface Translated {
  url: string;
  /** Set when the proxy route maps onto a different Stripe verb. */
  method?: string;
  /** Set when the proxy route maps onto Stripe body params. */
  extraBody?: Record<string, unknown>;
}

/** Rewrite a fastrouter proxy URL to its real Stripe equivalent. */
function translateUrl(input: string, body: Record<string, unknown> | undefined): Translated {
  const u = new URL(input);
  // /payments/<resource>[/<id>/<action>]
  const rest = u.pathname.replace(/^\/payments\//, '');
  const [resource, ...tail] = rest.split('/');
  const mapped = PATH_MAP[resource] ?? resource;

  // Stripe has no /cancel sub-path. The proxy invented one. Real Stripe is:
  //   immediate        DELETE /v1/subscriptions/{id}
  //   at period end    POST   /v1/subscriptions/{id}  cancel_at_period_end=true
  if (mapped === 'subscriptions' && tail[tail.length - 1] === 'cancel') {
    const id = tail[0];
    const immediately = body?.immediately === true;
    return immediately
      ? { url: `${STRIPE_API}/subscriptions/${id}`, method: 'DELETE' }
      : { url: `${STRIPE_API}/subscriptions/${id}`, method: 'POST',
          extraBody: { cancel_at_period_end: true } };
  }

  const path = [mapped, ...tail].join('/');
  return { url: `${STRIPE_API}/${path}${u.search}` };
}

/**
 * Drop-in replacement for fetch() against the old Stripe proxy.
 * Returns a Response so existing `.ok` / `.json()` handling is unchanged.
 */
export async function stripeFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) {
    return new Response(
      JSON.stringify({ error: 'Stripe is not configured (STRIPE_SECRET_KEY missing)' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Call sites pass JSON.stringify(...); Stripe needs form encoding.
  let parsed: Record<string, unknown> | undefined;
  if (init.body) {
    parsed = typeof init.body === 'string'
      ? JSON.parse(init.body)
      : (init.body as Record<string, unknown>);
  }

  const t = translateUrl(input, parsed);
  const merged = { ...(parsed ?? {}), ...(t.extraBody ?? {}) };
  // `immediately` is a proxy-ism, not a Stripe param.
  delete (merged as Record<string, unknown>).immediately;

  const method = t.method ?? init.method ?? (parsed ? 'POST' : 'GET');
  const body = method === 'DELETE' || Object.keys(merged).length === 0
    ? undefined
    : toForm(merged).toString();

  const res = await fetch(t.url, {
    method,
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  // Stripe nests errors under `error`; the proxy returned a flat `error`
  // string, which is what the call sites read.
  if (!res.ok && data?.error?.message) {
    data = { ...data, error: data.error.message };
  }
  // Proxy returned clientSecret; keep Stripe's client_secret alongside it.
  if (data?.client_secret && !data.clientSecret) {
    data.clientSecret = data.client_secret;
  }

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
