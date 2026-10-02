# Stripe setup guide

What the app uses Stripe for:
- **One‑time donations** — dynamic `PaymentIntent` (any amount). Needs only the keys.
- **Recurring donations** — fixed monthly tiers → need **Products/Prices**.
- **Premium subscriptions** — monthly & annual → need **Products/Prices**.
- No webhooks are used (donations are confirmed client‑side).

## Keys you need
| Key | Where it goes | Notes |
|-----|---------------|-------|
| Publishable key `pk_…` | `app/.env` → `VITE_STRIPE_PUBLISHABLE_KEY` | browser‑safe |
| Secret key `sk_…` | Supabase Edge Function secret → `STRIPE_SECRET_KEY` | **never** in the frontend/git |
| ~~Account ID~~ | leave `VITE_STRIPE_ACCOUNT_ID` **empty** | that was Stripe Connect; using the client's own account directly, so not needed |

## Products/Prices to create in the client's Stripe account
Create these, then copy each **Price ID** (`price_…`). They replace the old hard‑coded IDs.

| Product | Price | Billing | Replaces (file) |
|---------|-------|---------|-----------------|
| Premium Monthly | $9.99  | recurring / monthly | `MONTHLY_PRICE_ID` — `create-subscription/index.ts:11` |
| Premium Annual  | $79.99 | recurring / yearly  | `ANNUAL_PRICE_ID` — `create-subscription/index.ts:12` |
| Donation $10/mo | $10.00 | recurring / monthly | `RECURRING_PRICES[1000]` — `create-recurring-donation/index.ts:16` |
| Donation $25/mo | $25.00 | recurring / monthly | `RECURRING_PRICES[2500]` — `:17` |
| Donation $50/mo | $50.00 | recurring / monthly | `RECURRING_PRICES[5000]` — `:18` |
| Donation $100/mo| $100.00| recurring / monthly | `RECURRING_PRICES[10000]` — `:19` |

---

## Step by step

### 0. Test mode first
In the Stripe Dashboard, keep the **Test mode** toggle ON (top‑right) while setting up.
Do the whole thing with **test** keys/prices, verify it works, then repeat in **Live** mode
(test and live objects are completely separate — live keys and live price IDs differ).

### 1. Get the API keys
Dashboard → **Developers → API keys**:
- Copy the **Publishable key** (`pk_test_…`).
- Click **Reveal** on the **Secret key** (`sk_test_…`) and copy it.

### 2. Create the 6 Products/Prices
For each row in the table above: **Product catalogue → + Add product** →
name it → **Pricing: Recurring**, set the amount and interval (monthly/yearly) → **Save**.
Open the product and copy its **Price ID** (`price_…`). Collect all 6.

### 3. Set the secret key (backend)
From the project root (CLI already linked):
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_XXXXXXXX
```
(or Dashboard → Project → Edge Functions → Manage secrets → add `STRIPE_SECRET_KEY`.)

### 4. Set the publishable key (frontend)
In `app/.env`:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXX
```
Then restart the dev server (`npm run dev`) so Vite picks it up.

### 5. Update the price IDs in code, then redeploy
Replace the 6 old IDs in `create-subscription/index.ts` and
`create-recurring-donation/index.ts` with the new ones, then:
```bash
supabase functions deploy create-subscription create-recurring-donation
```

### 6. Test
With test keys/prices live, use Stripe test cards:
- Success: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.
- Try a one‑time donation, a recurring donation, and a subscription (has a 3‑day trial).
Check the payments appear in the Stripe Dashboard (Test mode) and in the DB
(`donations`, `recurring_donations`, `user_subscriptions`).

### 7. Go live (when ready)
Switch the Dashboard to **Live mode**, recreate the 6 products/prices there, grab the
**live** keys + **live** price IDs, and repeat steps 3‑5 with the `sk_live_…` / `pk_live_…`
values and live price IDs.

## Recommended follow‑up (optional, not required to work)
Add a Stripe **webhook** (e.g. `checkout`/`invoice`/`payment_intent` events → a new
`stripe-webhook` function) so payment/subscription status is confirmed server‑side rather
than relying on the client. Not needed for basic functionality.
