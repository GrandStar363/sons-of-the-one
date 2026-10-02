# Deploy runbook — Sons of the One

Project ref: `gkjbrfwidybzptvgifxz` · URL: https://gkjbrfwidybzptvgifxz.supabase.co

## 1. Database  ✅ DONE
Schema + RLS are applied and verified (52 tables, RLS on all, 0 exposed).
Source of truth: [db/migrations/](db/migrations/) · notes: [db/README.md](db/README.md).

## 2. Auth — TWO SEPARATE systems (important)
This app has two independent logins:

- **Main app** (`/`, the "Welcome Back" screen) → **Supabase Auth** (`auth.users`),
  via `supabase.auth.signInWithPassword` / `signUp` (`AuthPage`/`AccessGate`/`AuthModal`).
- **Admin dashboard** (`/admin`, `AdminLogin.tsx`) → **custom** `admin-auth` edge
  function + `public.admins` table (opaque session token, not a Supabase JWT).

A `public.admins` row does **not** create an app login, and vice‑versa. `mabahoisyou@outlook.com`
is seeded in BOTH: as `super_admin` in `admins` (for `/admin`) and as a confirmed
Supabase Auth user (for the main app).

**Create an app user** (Supabase Auth): sign up in the UI, or (pre‑confirmed, no email)
the SQL used during setup — insert into `auth.users` with
`extensions.crypt(pw, extensions.gen_salt('bf'))` + a matching `auth.identities` row.
**Re‑seed the admin**: the PBKDF2 INSERT into `public.admins` (scheme in
`supabase/functions/admin-auth/index.ts`).

**Email confirmation:** until SMTP/Resend is configured, keep **"Confirm email" OFF**
(Dashboard → Authentication → Sign In / Providers → Email) so UI sign‑ups can log in
without a verification email. Turn it back on once Resend is set up.

## 3. Edge functions
23 functions live in `supabase/functions/` (the self-hosted `functions/main`
dispatcher is NOT deployed on hosted Supabase). `verify_jwt=false` is set per
function in `supabase/config.toml` (they do their own auth / are public).

Deploy from the project root (needs the Supabase CLI + internet):

```bash
# Install CLI if needed:  npm i -g supabase   (or: brew install supabase/tap/supabase)
export SUPABASE_ACCESS_TOKEN=sbp_...            # your personal access token
supabase link --project-ref gkjbrfwidybzptvgifxz
supabase functions deploy                       # deploys ALL functions
```

If a deploy blips on the network, just re-run `supabase functions deploy` — it
redeploys idempotently. (If the CLI asks for Docker, add `--use-api`.)

## 4. Function secrets (set when the keys arrive)
Supabase auto-injects `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` into functions.
Only the external keys need setting:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set GOOGLE_MAPS_API_KEY=...
```
Any key left unset → that feature degrades gracefully (checkout disabled, etc.).

## 5. Frontend
`app/.env` holds `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (publishable key).
Build & host the static site:

```bash
cd app && npm install && npm run build   # outputs app/dist
```
Add `VITE_STRIPE_PUBLISHABLE_KEY` before building if using checkout.

### Hosting on Vercel
- Vercel project **Root Directory = `app`** (framework Vite, build `npm run build`, output `dist`).
- `app/vercel.json` rewrites every path to `index.html` (so `/admin`, `/reset-password`
  don't 404 on refresh) and stops `sw.js` from being cached.
- Environment variables (Production + Preview): `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`. They're baked in at build
  time — after changing one, **redeploy**.
- Supabase → Authentication → URL Configuration: **Site URL** = the Vercel/custom URL,
  and add `https://<site>/**` to **Redirect URLs** (password-reset links).
