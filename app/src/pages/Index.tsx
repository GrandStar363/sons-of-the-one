import React, { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import AuthPage from '@/components/AuthPage';
import WelcomeClassroom from '@/components/WelcomeClassroom';
import MembershipGate from '@/components/MembershipGate';
import TermsOfService from '@/components/TermsOfService';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import { AppProvider } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { claimDeviceFor, clearMemberDataOnDevice, hasEnteredClassroom, markEnteredClassroom } from '@/lib/session';
import { Loader2 } from 'lucide-react';

type ViewMode = 'auth' | 'terms' | 'privacy' | 'app';

// The "One Classroom" welcome page opens each visit (once per browser tab
// session) and after every sign-out; "Enter The Classroom" then goes on into
// the app, or to sign-in. See lib/session.ts.

/** Drop the page part of the address (#/lessons): the next person starts at Home. */
function resetAddress() {
  window.history.replaceState(null, '', window.location.pathname);
}

// Stripe sends the browser back to /?membership=return&redirect_status=… when a
// card needs an extra check (3-D Secure) during the $1 payment.
function readPaymentReturn(): 'succeeded' | 'failed' | null {
  const params = new URLSearchParams(window.location.search);
  if (params.get('membership') !== 'return') return null;
  window.history.replaceState(null, '', window.location.pathname);
  return params.get('redirect_status') === 'succeeded' ? 'succeeded' : 'failed';
}

const Index: React.FC = () => {
  const [paymentReturn] = useState(readPaymentReturn);
  const [showWelcome, setShowWelcome] = useState(() => !paymentReturn && !hasEnteredClassroom());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [account, setAccount] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('auth');
  // Track where the user came from for proper back navigation
  const [previousViewMode, setPreviousViewMode] = useState<ViewMode>('auth');
  // True while nobody is signed in, so a sign-in can be told apart from a
  // session being restored on page load or a token refresh.
  const signedOutRef = useRef(false);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          claimDeviceFor(session.user.id);
        } else {
          // Nobody signed in: personal data left by an earlier session goes.
          clearMemberDataOnDevice();
          signedOutRef.current = true;
        }
        setIsAuthenticated(!!session);
        setAccount(session ? { id: session.user.id, email: session.user.email ?? '' } : null);
        if (session) {
          setViewMode('app');
          setPreviousViewMode('app');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Before their pages load: cached data from another account is removed.
        claimDeviceFor(session.user.id);
        if (signedOutRef.current) {
          signedOutRef.current = false;
          resetAddress(); // a fresh sign-in starts at Home
        }
      }
      setIsAuthenticated(!!session);
      // Same object identity unless the account changes (token refreshes fire too).
      setAccount((prev) => {
        if (!session) return null;
        if (prev?.id === session.user.id) return prev;
        return { id: session.user.id, email: session.user.email ?? '' };
      });
      if (event === 'SIGNED_OUT') {
        // Back to the first page, "Enter The Classroom" (personal data on the
        // device is cleared by lib/session.ts).
        signedOutRef.current = true;
        setIsAuthenticated(false);
        setViewMode('auth');
        setPreviousViewMode('auth');
        setShowWelcome(true);
        resetAddress();
        window.scrollTo({ top: 0 });
      } else if (session) {
        setViewMode('app');
        setPreviousViewMode('app');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setViewMode('app');
    setPreviousViewMode('app');
  }, []);

  const handleNavigateToTerms = useCallback(() => {
    // Store current view before navigating
    setPreviousViewMode(viewMode);
    setViewMode('terms');
  }, [viewMode]);

  const handleNavigateToPrivacy = useCallback(() => {
    // Store current view before navigating
    setPreviousViewMode(viewMode);
    setViewMode('privacy');
  }, [viewMode]);

  const handleNavigateBack = useCallback(() => {
    // Navigate back to the previous view
    if (isAuthenticated) {
      setViewMode('app');
    } else {
      setViewMode('auth');
    }
  }, [isAuthenticated]);

  const handleEnterClassroom = useCallback(() => {
    markEnteredClassroom();
    setShowWelcome(false);
    window.scrollTo({ top: 0 });
  }, []);

  // Welcome page first. It doesn't depend on the auth check, so it renders
  // immediately while the session is restored in the background.
  if (showWelcome) {
    return <WelcomeClassroom onEnter={handleEnterClassroom} />;
  }

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1929] via-[#0f2942] to-[#0c1929] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#14B8A6] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Terms of Service page
  if (viewMode === 'terms') {
    return (
      <TermsOfService 
        key="terms-page"
        onNavigateBack={handleNavigateBack} 
      />
    );
  }

  // Show Privacy Policy page
  if (viewMode === 'privacy') {
    return (
      <PrivacyPolicy 
        key="privacy-page"
        onNavigateBack={handleNavigateBack} 
      />
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthPage 
        key="auth-page"
        onAuthSuccess={handleAuthSuccess}
        onNavigateToTerms={handleNavigateToTerms}
        onNavigateToPrivacy={handleNavigateToPrivacy}
        notice={paymentReturn === 'succeeded'
          ? 'Payment received. Confirm your email with the link we sent, then sign in to enter the Classroom.'
          : undefined}
      />
    );
  }

  // Signed in: members (and admins) into the app, everyone else to billing.
  return (
    <MembershipGate
      userId={account?.id ?? ''}
      email={account?.email ?? ''}
      returningFromPayment={paymentReturn === 'succeeded'}
    >
      <AppProvider>
        <AppLayout
          onNavigateToTerms={handleNavigateToTerms}
          onNavigateToPrivacy={handleNavigateToPrivacy}
        />
      </AppProvider>
    </MembershipGate>
  );
};

export default Index;
