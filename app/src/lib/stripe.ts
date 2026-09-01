import { loadStripe, Stripe } from '@stripe/stripe-js';

// Credentials come from .env at build time. Nothing payment-related is hardcoded:
// the recovered Famous.ai build shipped a live publishable key and a Connect
// account id in source, which we deliberately do not carry forward.
//
//   VITE_STRIPE_PUBLISHABLE_KEY  pk_test_... on staging, pk_live_... in production
//   VITE_STRIPE_ACCOUNT_ID       optional; only set for Stripe Connect setups
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripeAccount = import.meta.env.VITE_STRIPE_ACCOUNT_ID as string | undefined;

// True when the app is configured to take payments. Components use this to hide
// or disable checkout instead of crashing when Stripe is not configured.
export const stripeEnabled = Boolean(publishableKey);

export const stripePromise: Promise<Stripe | null> = publishableKey
  ? loadStripe(publishableKey, stripeAccount ? { stripeAccount } : undefined)
  : Promise.resolve(null);

if (!stripeEnabled && import.meta.env.DEV) {
  console.warn(
    '[stripe] VITE_STRIPE_PUBLISHABLE_KEY is not set — donation and subscription ' +
    'checkout will be disabled. See staging/README.md.'
  );
}
