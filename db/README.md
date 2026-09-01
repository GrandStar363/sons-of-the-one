# Database — schema, migrations & reconciliation

The project was handed over with **no schema, no migrations, and no RLS
definitions**. We connected to the live Supabase project (`gkjbrfwidybzptvgifxz`)
and reconciled the code's expectations against reality. This folder is now the
source of truth for the database.

## What we found in the live database

- **RLS was DISABLED on all 25 tables** → anyone with the public anon key could
  read/modify every row (personal journals, prayer requests, emails, group data).
  Supabase's linter flags this `ERROR`. **This was the top-priority fix.**
- **Only 25 of the ~52 tables the code needs existed.** ~27 were never created,
  so donations, subscriptions, admin auth, contact, trivia, tournaments,
  referrals, devotional content, journal, activity all failed at runtime.
- **Column mismatches** on tables that did exist:
  - `user_data` had 5 of 14 columns, and its JSON columns were `text` (the client
    writes real arrays/objects) → sync was failing.
  - `prayer_requests` lacked `request_text` / `user_name` / `user_email` / `status`.
  - **Upserts everywhere use `onConflict` targets with no unique constraint**, so
    they silently failed (only PKs on `id` existed).
- **Every table is empty (0 rows)** → schema fixes carry no data-migration risk.

## Files

| File | Purpose |
|------|---------|
| `expected-schema.sql` | The schema the code assumes (reverse-engineered). Reference/diff baseline. |
| `migrations/0001_fix_existing_tables.sql` | Fix the 25 existing tables: `user_data` columns + jsonb, `prayer_requests` columns, missing unique constraints for upserts. |
| `migrations/0002_create_missing_tables.sql` | Create the ~27 missing tables with verified columns/keys. |
| `migrations/0003_rls_policies.sql` | **Security fix** — enable RLS on every table with per-tier policies. |

## RLS access model (migration 0003)

| Tier | Tables | Policy |
|------|--------|--------|
| A — private per-user | user_data, user_activity, journal_entries, notification_preferences, memory_*, baptism_*, wwjd_* | owner-only (`user_id = auth.uid()`) |
| B — community | prayer_requests, prayer_commitments, prayer_encouragements, declarations, declaration_amens, declaration_responses | signed-in read; owner writes |
| C — study groups | bible_study_groups, group_* | any signed-in user (anon blocked); membership-scoping is a follow-up |
| D — service-role only | admins, admin_sessions, admin_audit_log, app_users, donations, recurring_donations, user_subscriptions, subscription_history, donation_impact_metrics, devotionals, featured_verses, devotional_preferences, reminder_preferences, activity_events, referrals, referral_claims, referral_shares, tournaments, tournament_registrations, tournament_matches, trivia_queue, trivia_spectators, trivia_stats | RLS on, **no** anon/authenticated policy (edge functions use service-role, which bypasses RLS) |
| Special | `trivia_matches` | signed-in read (matchmaking/realtime); writes via function |
| Special | `contact_messages` | public INSERT (contact form); reads/edits via new `admin-contact-messages` function |

## Accompanying code changes (already applied to the repo)

- `functions/admin-users/index.ts` — donations lookup fixed (`donor_email` → `email`).
- `functions/admin-contact-messages/index.ts` — **new** admin-gated function, so
  the dashboard no longer reads `contact_messages` with the anon key.
- `app/src/components/admin/AdminContactMessages.tsx` — now calls that function.

## How to apply

The Supabase MCP connection must be in **write mode** (remove `--read-only` from
`.mcp.json`, then reload Claude Code). Then apply in order: `0001` → `0002` →
`0003`, and re-run the security advisor to confirm RLS is enabled with no errors.

## Known follow-ups (documented, not yet done)

- Tighten Tier C group policies to actual group membership.
- Standardize `prayer_requests` on one of `request` / `request_text` (drift).
- If the app should display CMS content (`devotionals`, `featured_verses`), add a
  public-read policy for published/active rows.
- `avatars` uses a Supabase **Storage bucket**, not a table — confirm the bucket
  exists with appropriate storage policies.
