import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import AuthPage from '@/components/AuthPage';
import TermsOfService from '@/components/TermsOfService';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import { AppProvider } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

type ViewMode = 'auth' | 'terms' | 'privacy' | 'app';

const Index: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('auth');
  // Track where the user came from for proper back navigation
  const [previousViewMode, setPreviousViewMode] = useState<ViewMode>('auth');

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
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
      setIsAuthenticated(!!session);
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setViewMode('auth');
        setPreviousViewMode('auth');
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
      />
    );
  }

  // Show main app if authenticated
  return (
    <AppProvider>
      <AppLayout 
        onNavigateToTerms={handleNavigateToTerms}
        onNavigateToPrivacy={handleNavigateToPrivacy}
      />
    </AppProvider>
  );
};

export default Index;
