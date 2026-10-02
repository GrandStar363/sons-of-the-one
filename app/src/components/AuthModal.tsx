import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, UserPlus, Award, BookOpen, Shield, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToPrivacy?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'reset';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, onNavigateToTerms, onNavigateToPrivacy }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setError(null);
    setSuccess(null);
    setAgreedToTerms(false);
    setShowTerms(false);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const validateForm = (): boolean => {
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (mode !== 'reset') {
      if (!password) {
        setError('Password is required');
        return false;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Full name is required');
        return false;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }

      if (!agreedToTerms) {
        setError('You must agree to the Terms of Service and Privacy Policy to create an account');
        return false;
      }
    }

    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        onAuthSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    // Capture the acceptance timestamp for legal compliance
    const termsAcceptedAt = new Date().toISOString();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            // Store terms acceptance for legal compliance
            terms_accepted: true,
            terms_accepted_at: termsAcceptedAt,
            privacy_policy_accepted: true,
            privacy_policy_accepted_at: termsAcceptedAt,
          },
          // Where the confirmation link returns the user (must be listed in
          // Supabase → Authentication → URL Configuration → Redirect URLs).
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      // Supabase reports an already-registered email as a user with no
      // identities (instead of an error) to avoid leaking which emails exist.
      if (data.user && data.user.identities?.length === 0) {
        setError('An account with this email already exists. Please sign in instead.');
        return;
      }

      if (data.session) {
        setSuccess('Account created! Signing you in…');
      } else if (data.user) {
        setSuccess(`Almost there! We've sent a confirmation link to ${email.trim()}. Click it to activate your account, then sign in.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (mode) {
      case 'signin':
        handleSignIn();
        break;
      case 'signup':
        handleSignUp();
        break;
      case 'reset':
        handlePasswordReset();
        break;
    }
  };

  // Check if the signup button should be disabled
  const isSignupDisabled = mode === 'signup' && !agreedToTerms;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0c1929]/95 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-[#14B8A6]/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 pb-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-[#F59E0B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center glow-teal">
              {mode === 'reset' ? (
                <Mail className="w-8 h-8 text-white" />
              ) : mode === 'signup' ? (
                <UserPlus className="w-8 h-8 text-white" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-serif font-bold text-white">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'reset' && 'Reset Password'}
            </h2>
            <p className="text-white/60 mt-2">
              {mode === 'signin' && 'Sign in to continue your spiritual journey'}
              {mode === 'signup' && 'Join us and grow in your faith'}
              {mode === 'reset' && 'Enter your email to receive a reset link'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-lg text-[#5EEAD4] text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Full Name (Signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-[#14B8A6]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-[#14B8A6]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-white/5 border border-[#14B8A6]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-[#F59E0B] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (Signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-[#14B8A6]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all"
                  required
                />
              </div>
            </div>
          )}

          {/* Terms and Privacy Agreement (Signup only) */}
          {mode === 'signup' && (
            <div className="space-y-3">
              {/* Agreement Checkbox */}
              <div className="bg-[#0c1929]/70 border border-[#14B8A6]/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-6 mt-0.5">
                    <input
                      type="checkbox"
                      id="terms-modal"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 rounded border-[#14B8A6]/50 bg-white/5 text-[#14B8A6] focus:ring-[#14B8A6]/50 focus:ring-offset-0 cursor-pointer"
                    />
                  </div>
                  <label htmlFor="terms-modal" className="text-sm text-white/80 cursor-pointer leading-relaxed">
                    I have read and agree to the{' '}
                    {onNavigateToTerms ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigateToTerms();
                        }}
                        className="text-[#14B8A6] hover:text-[#5EEAD4] underline font-medium inline-flex items-center"
                      >
                        Terms of Service
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowTerms(!showTerms)}
                        className="text-[#14B8A6] hover:text-[#5EEAD4] underline font-medium"
                      >
                        Terms of Service
                      </button>
                    )}
                    {' '}and{' '}
                    {onNavigateToPrivacy ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigateToPrivacy();
                        }}
                        className="text-[#14B8A6] hover:text-[#5EEAD4] underline font-medium inline-flex items-center"
                      >
                        Privacy Policy
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                    ) : (
                      <span className="text-[#14B8A6] font-medium">Privacy Policy</span>
                    )}
                  </label>
                </div>
                
                {/* Legal Notice */}
                <div className="mt-3 pt-3 border-t border-[#14B8A6]/20">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-white/50">
                      By creating an account, you acknowledge that your acceptance of these terms will be recorded with a timestamp for legal compliance purposes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual indicator when not agreed */}
              {!agreedToTerms && (
                <div className="flex items-center space-x-2 text-[#F59E0B]/80 text-xs">
                  <FileText className="w-4 h-4" />
                  <span>Please review and accept the terms to continue</span>
                </div>
              )}

              {/* Expandable Terms Summary (fallback when no navigation props) */}
              {showTerms && !onNavigateToTerms && (
                <div className="bg-[#0c1929] border border-[#14B8A6]/30 rounded-xl p-4 space-y-4 max-h-64 overflow-y-auto">
                  <div className="flex items-center space-x-2 text-[#F59E0B]">
                    <Shield className="w-5 h-5" />
                    <h4 className="font-bold">User Agreement Summary</h4>
                  </div>
                  
                  <div className="space-y-3 text-sm text-white/80">
                    <div className="flex items-start space-x-2">
                      <BookOpen className="w-4 h-4 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-[#5EEAD4]">Biblical Education Platform</p>
                        <p className="text-white/60 mt-1">
                          This application is designed exclusively as a <span className="text-[#F59E0B] font-semibold">biblical education platform</span>. 
                          Its sole purpose is to facilitate personal spiritual growth, Bible study, and learning about God's Word.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <div>
                        <p className="font-semibold text-red-400">Communication Policy</p>
                        <p className="text-white/60 mt-1">
                          Users may share email addresses for communication <span className="text-[#F59E0B] font-semibold">outside this platform</span>. 
                          No in-platform messaging or communication features exist.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg p-3 mt-3">
                      <p className="text-[#FCD34D] text-xs font-medium">
                        By checking the box above, you acknowledge that you have read, understood, and agree to abide by 
                        these terms. Violation of these terms may result in immediate account termination.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Forgot Password Link */}
          {mode === 'signin' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => handleModeChange('reset')}
                className="text-sm text-[#14B8A6] hover:text-[#5EEAD4] hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isSignupDisabled}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl transition-all ${
              isSignupDisabled 
                ? 'opacity-50 cursor-not-allowed from-gray-500 to-gray-600' 
                : 'hover:from-[#0D9488] hover:to-[#0F766E] glow-teal'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <span>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && (agreedToTerms ? 'Create Account' : 'Accept Terms to Continue')}
                {mode === 'reset' && 'Send Reset Link'}
              </span>
            )}
          </button>

          {/* Mode Switch */}
          <div className="text-center pt-4 border-t border-[#14B8A6]/20">
            {mode === 'signin' && (
              <p className="text-white/60">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('signup')}
                  className="text-[#F59E0B] hover:text-[#FCD34D] hover:underline font-medium transition-colors"
                >
                  Sign up
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-white/60">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('signin')}
                  className="text-[#F59E0B] hover:text-[#FCD34D] hover:underline font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === 'reset' && (
              <p className="text-white/60">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('signin')}
                  className="text-[#F59E0B] hover:text-[#FCD34D] hover:underline font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="p-4 bg-gradient-to-r from-[#14B8A6]/5 to-[#3B82F6]/5 border border-[#14B8A6]/20 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#14B8A6]/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Subscribe for Full Access</p>
                <p className="text-xs text-white/50">Unlock all spiritual growth tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
