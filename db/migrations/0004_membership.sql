-- 0004_membership.sql
-- Paid membership ($1 for the first 24 hours, then monthly/annual via Stripe).
--
-- user_subscriptions mirrors the member's Stripe subscription; the `membership`
-- edge function keeps it in sync with Stripe on every status check. The old
-- cancel-subscription function wrote cancel_at_period_end / canceled_at, which
-- never existed, so cancellations were never recorded.

alter table public.user_subscriptions
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists canceled_at          timestamptz;

create index if not exists user_subscriptions_customer_idx
  on public.user_subscriptions (stripe_customer_id);
create index if not exists user_subscriptions_subscription_idx
  on public.user_subscriptions (stripe_subscription_id);
