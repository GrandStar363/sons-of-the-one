import React, { useMemo, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { ArrowLeft, Check, CreditCard, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { stripeEnabled, stripePromise } from '@/lib/stripe';
import {
  confirmMembership, ENTRY_FEE, formatDate, Membership, Plan, PLANS, SignupContext, startMembership,
} from '@/lib/membership';

// Billing step: shown right after sign-up, and to any signed-in user without a
// membership. $1 today for 24 hours of full access, then the chosen plan.

interface MembershipCheckoutProps {
  email: string;
  /** Present right after sign-up (there may be no session yet). */
  signup?: SignupContext;
  onComplete: (membership: Membership) => void;
  onSignOut?: () => void;
}

const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#14B8A6',
    colorBackground: '#0c1929',
    colorText: '#ffffff',
    colorDanger: '#f87171',
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};

function PayForm({ subscriptionId, signup, plan, onPaid, onBack }: {
  subscriptionId: string;
  signup?: SignupContext;
  plan: Plan;
  onPaid: (m: Membership) => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);
    try {
      const { error: payError } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/?membership=return` },
        redirect: 'if_required',
      });
      if (payError) {
        setError(payError.message || 'Your card was not charged. Please try again.');
        return;
      }
      // The payment went through; give Stripe a moment to mark the invoice paid.
      for (let attempt = 0; attempt < 5; attempt++) {
        const m = await confirmMembership(subscriptionId, signup);
        if (m.paid && m.isMember) {
          onPaid(m);
          return;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      setError('Your payment is still processing. Please refresh in a minute — you will not be charged twice.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement
        options={{ layout: 'tabs' }}
        onReady={() => setReady(true)}
        onLoadError={(e) => setError(e.error?.message || 'The card form could not load. Please refresh and try again.')}
      />
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || !ready || paying}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488] px-6 py-4 font-semibold text-white shadow-lg transition-all hover:from-[#0D9488] hover:to-[#0F766E] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {paying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
        {paying ? 'Processing…' : `Pay ${ENTRY_FEE} & Enter`}
      </button>
      <button
        type="button"
        onClick={onBack}
        disabled={paying}
        className="flex w-full items-center justify-center gap-1 text-sm text-white/60 hover:text-white disabled:opacity-50"
      >
        <ArrowLeft className="h-4 w-4" /> Change plan ({PLANS[plan].label})
      </button>
    </form>
  );
}

const MembershipCheckout: React.FC<MembershipCheckoutProps> = ({ email, signup, onComplete, onSignOut }) => {
  const [plan, setPlan] = useState<Plan>('monthly');
  const [step, setStep] = useState<'plan' | 'pay' | 'done'>('plan');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<{ clientSecret: string; subscriptionId: string } | null>(null);
  const [result, setResult] = useState<Membership | null>(null);

  // When billing starts if they keep the membership (shown before they pay).
  const billingStarts = useMemo(() => formatDate(new Date(Date.now() + 24 * 3600 * 1000).toISOString(), true), []);
  const chosen = PLANS[plan];

  const startPayment = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await startMembership(plan, signup);
      if (res.alreadyMember) {
        setResult(res as Membership);
        setStep('done');
        onComplete(res as Membership);
        return;
      }
      if (!res.clientSecret || !res.subscriptionId) throw new Error('Could not start the payment. Please try again.');
      setPayment({ clientSecret: res.clientSecret, subscriptionId: res.subscriptionId });
      setStep('pay');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStarting(false);
    }
  };

  if (!stripeEnabled) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
        Membership sign-up is temporarily unavailable. Please try again shortly.
      </div>
    );
  }

  if (step === 'done' && result) {
    const until = result.trialEnd ?? result.currentPeriodEnd;
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488]">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h3 className="mb-2 font-serif text-2xl font-bold text-white">Welcome to the Classroom!</h3>
        <p className="text-white/70">
          Your {ENTRY_FEE} entry is paid. You have full access, and your {PLANS[result.plan ?? plan].label.toLowerCase()} membership
          ({PLANS[result.plan ?? plan].price}/{PLANS[result.plan ?? plan].per}) begins {formatDate(until, true)} unless you cancel before then.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] shadow-lg shadow-amber-500/30">
          <CreditCard className="h-7 w-7 text-white" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-white">Membership & Billing</h2>
        <p className="mt-1 text-sm text-white/60">{email}</p>
      </div>

      {/* Plan choice */}
      {step === 'plan' && (
        <div className="mb-4 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Choose your plan">
          {(Object.keys(PLANS) as Plan[]).map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={plan === p}
              onClick={() => setPlan(p)}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                plan === p ? 'border-[#14B8A6] bg-[#14B8A6]/10' : 'border-white/15 bg-white/5 hover:border-white/30'
              }`}
            >
              {PLANS[p].note && (
                <span className="absolute -top-2.5 right-2 rounded-full bg-[#F59E0B] px-2 py-0.5 text-[10px] font-bold text-white">
                  {PLANS[p].note}
                </span>
              )}
              <span className="block text-sm text-white/70">{PLANS[p].label}</span>
              <span className="block text-xl font-bold text-white">{PLANS[p].price}</span>
              <span className="block text-xs text-white/50">per {PLANS[p].per}</span>
            </button>
          ))}
        </div>
      )}

      {/* What they'll be charged, and when */}
      <div className="mb-5 space-y-2 rounded-xl border border-[#14B8A6]/30 bg-[#0c1929]/70 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-white/80">Due today — 24 hours full access</span>
          <span className="font-bold text-white">{ENTRY_FEE}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/80">Then, from {billingStarts}</span>
          <span className="font-bold text-white">{chosen.price}/{chosen.per}</span>
        </div>
        <p className="border-t border-white/10 pt-2 text-xs text-white/50">
          Billed automatically every {chosen.per} until you cancel. Cancel within 24 hours and you won't be charged again.
          {plan === 'monthly' && ' You can switch to annual billing at any time.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      {step === 'plan' && (
        <button
          type="button"
          onClick={startPayment}
          disabled={starting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488] px-6 py-4 font-semibold text-white shadow-lg transition-all hover:from-[#0D9488] hover:to-[#0F766E] disabled:opacity-60"
        >
          {starting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
          {starting ? 'Preparing secure payment…' : 'Continue to Card Details'}
        </button>
      )}

      {step === 'pay' && payment && (
        <Elements stripe={stripePromise} options={{ clientSecret: payment.clientSecret, appearance: stripeAppearance }}>
          <PayForm
            subscriptionId={payment.subscriptionId}
            signup={signup}
            plan={plan}
            onBack={() => { setPayment(null); setStep('plan'); }}
            onPaid={(m) => { setResult(m); setStep('done'); onComplete(m); }}
          />
        </Elements>
      )}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/40">
        <ShieldCheck className="h-3.5 w-3.5" /> Secure payment by Stripe. We never see or store your card number.
      </p>

      {onSignOut && (
        <button type="button" onClick={onSignOut} className="mt-3 w-full text-center text-sm text-white/50 hover:text-white">
          Sign out
        </button>
      )}
    </div>
  );
};

export default MembershipCheckout;
