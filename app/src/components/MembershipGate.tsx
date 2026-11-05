import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import MembershipCheckout from './MembershipCheckout';
import { getMembership, Membership, MEMBERSHIP_REQUIRED } from '@/lib/membership';

// Lets signed-in members (and admins) into the app; everyone else gets the
// billing step: $1 for the first 24 hours, then monthly or annual.

interface MembershipGateProps {
  userId: string;
  email: string;
  /** Came back from a Stripe redirect (e.g. card 3-D Secure) with a successful payment. */
  returningFromPayment?: boolean;
  children: React.ReactNode;
}

const Screen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#0c1929] via-[#0f2942] to-[#0c1929] flex items-center justify-center px-4 py-10">
    {children}
  </div>
);

const MembershipGate: React.FC<MembershipGateProps> = ({ userId, email, returningFromPayment, children }) => {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(MEMBERSHIP_REQUIRED);

  const check = useCallback(async () => {
    setChecking(true);
    setError(null);
    try {
      // After a payment redirect Stripe can take a moment to mark the $1 paid.
      const attempts = returningFromPayment ? 5 : 1;
      let m = await getMembership();
      for (let i = 1; i < attempts && !m.isMember; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        m = await getMembership();
      }
      setMembership(m);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setChecking(false);
    }
  }, [returningFromPayment]);

  useEffect(() => {
    if (MEMBERSHIP_REQUIRED) check();
    // Re-check only when a different account signs in (not on token refreshes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!MEMBERSHIP_REQUIRED || membership?.isMember) return <>{children}</>;

  const signOut = () => supabase.auth.signOut();

  if (checking) {
    return (
      <Screen>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#14B8A6] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Checking your membership…</p>
        </div>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0f2942]/80 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-white mb-1 font-semibold">We couldn't check your membership.</p>
          <p className="text-white/60 text-sm mb-5">{error}</p>
          <button
            type="button"
            onClick={check}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488] px-6 py-3 font-semibold text-white"
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
          <button type="button" onClick={signOut} className="mt-4 block w-full text-sm text-white/50 hover:text-white">
            Sign out
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif font-bold text-white">
            Sons of the <span className="text-[#F59E0B]">One</span>
          </h1>
          <p className="text-white/60 mt-2">
            {membership?.hasSubscription && membership.status === 'canceled'
              ? 'Your membership has ended. Rejoin to enter the Classroom.'
              : 'One last step: choose your membership to enter the Classroom.'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#0f2942]/80 to-[#0c1929]/80 backdrop-blur-xl border border-[#14B8A6]/30 rounded-2xl shadow-2xl p-6 sm:p-8">
          <MembershipCheckout
            email={email}
            onComplete={(m) => {
              // Show the "Welcome" confirmation briefly, then into the app.
              setTimeout(() => {
                setMembership(m);
                window.scrollTo({ top: 0 });
              }, 2500);
            }}
            onSignOut={signOut}
          />
        </div>
      </div>
    </Screen>
  );
};

export default MembershipGate;
