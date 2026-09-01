import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, BookOpen, Heart, Users, Sparkles, Shield, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToPrivacy?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'reset';

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onNavigateToTerms, onNavigateToPrivacy }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setError(null);
    setSuccess(null);
    setAgreedToTerms(false);
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

    // Capture the acceptance timestamp
    const termsAcceptedAt = new Date().toISOString();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim() || email.split('@')[0],
            trial_start: new Date().toISOString(),
            trial_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            // Store terms acceptance for legal compliance
            terms_accepted: true,
            terms_accepted_at: termsAcceptedAt,
            privacy_policy_accepted: true,
            privacy_policy_accepted_at: termsAcceptedAt,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create user_data record with terms acceptance
        await supabase.from('user_data').insert({
          user_id: data.user.id,
          bookmarks: [],
          highlights: [],
          notes: {},
          plan_progress: {},
        });

        setSuccess('Account created successfully! You can now sign in.');
        setTimeout(() => {
          handleModeChange('signin');
        }, 2000);
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

  const features = [
    {
      icon: BookOpen,
      title: 'Daily Devotionals',
      description: 'Start each day with inspiring scripture and reflections',
    },
    {
      icon: Heart,
      title: 'Personal Journal',
      description: 'Record your spiritual journey and insights',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with fellow believers in faith',
    },
    {
      icon: Sparkles,
      title: 'Bible Study Tools',
      description: 'Deep dive into scripture with powerful study features',
    },
  ];

  // Check if the signup button should be disabled
  const isSignupDisabled = mode === 'signup' && !agreedToTerms;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1929] via-[#0f2942] to-[#0c1929] flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center p-12 xl:p-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-[#14B8A6] blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-[#F59E0B] blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center shadow-lg shadow-[#14B8A6]/30">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Sons of God</h1>
              <p className="text-[#14B8A6] text-sm">Walking in Divine Identity</p>
              <p className="text-[#F59E0B] text-xs mt-1 italic">Jesus said, Go forth teaching all nations</p>
              <p className="text-[#F59E0B] text-xs italic">I shall...I am Robert...One Son of many ©</p>

            </div>
          </div>


          {/* Main Heading - WE ARE... */}
          <div className="mb-10">
            <h2 className="text-5xl xl:text-6xl font-serif font-bold leading-tight">
              <span className="text-[#14B8A6]">WE ARE</span>
              <span className="text-white/60">...</span>
            </h2>
            <h2 className="text-4xl xl:text-5xl font-serif font-bold leading-tight mt-2">
              <span className="text-white">Sons' of The One</span>
              <span className="text-white/60">...</span>
            </h2>
            <h2 className="text-4xl xl:text-5xl font-serif font-bold leading-tight mt-2">
              <span className="text-[#F59E0B]">God Almighty</span>
              <span className="text-white/60">...</span>
            </h2>
            <h2 className="text-3xl xl:text-4xl font-serif font-bold leading-tight mt-4">
              <span className="text-white/70 italic">are you one of</span>
              <span className="text-white/60">...</span>
            </h2>
            <h2 className="text-5xl xl:text-6xl font-serif font-bold leading-tight mt-2">
              <span className="text-[#14B8A6]">WE</span>
              <span className="text-[#F59E0B]">?</span>
            </h2>
            <p className="text-xl xl:text-2xl text-white/80 mt-6 font-light">
              The <span className="font-bold text-[#14B8A6]">"WALK"</span> starts in the lessons...
            </p>
            <p className="text-xl xl:text-2xl text-white/80 mt-2 font-light">
              <span className="font-bold text-[#F59E0B]">"Spiritual Growth"</span>
            </p>

            <div className="mt-4 space-y-1">
              <p className="text-lg xl:text-xl text-white/90">
                <span className="text-[#14B8A6] font-bold">WE ARE</span>
                <span className="text-white/60">...</span>
                <span className="text-white"> Sons' of The One</span>
                <span className="text-white/60">...</span>
                <span className="text-[#F59E0B] font-bold"> God Almighty</span>
                <span className="text-white/60">...</span>
              </p>
              <p className="text-lg xl:text-xl text-white/90">
                <span className="text-[#14B8A6] font-bold">WALKING</span>
                <span className="text-white"> in </span>
                <span className="text-[#F59E0B] font-bold">SPIRIT</span>
                <span className="text-white"> and not of the flesh</span>
                <span className="text-white/60">...</span>
                <span className="text-[#F59E0B] font-bold"> AMEN</span>
                <span className="text-white"> 🙏</span>
              </p>




            </div>
          </div>


          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-[#14B8A6]/20 rounded-xl p-5 hover:bg-white/10 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#14B8A6]/20 to-[#14B8A6]/10 flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-[#14B8A6]" />
                </div>
                <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Scripture Quote */}
          <div className="mt-12 p-6 bg-gradient-to-r from-[#14B8A6]/10 to-transparent border-l-4 border-[#14B8A6] rounded-r-xl">
            <p className="text-white/80 italic text-lg mb-2">
              "For as many as are led by the Spirit of God, they are the sons of God."
            </p>
            <p className="text-[#F59E0B] font-medium">— Romans 8:14 (KJV 1611)</p>
          </div>

        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo & Heading */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center shadow-lg shadow-[#14B8A6]/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-white">Sons of God</h1>
                <p className="text-[#14B8A6] text-xs">Walking in Divine Identity</p>
                <p className="text-[#F59E0B] text-xs mt-0.5 italic">Jesus said, Go forth teaching all nations</p>
                <p className="text-[#F59E0B] text-xs italic">I shall...I am Robert...One Son of many ©</p>

              </div>

            </div>
            {/* Mobile WE ARE heading */}
            <div className="space-y-1">
              <p className="text-2xl font-serif font-bold">
                <span className="text-[#14B8A6]">WE ARE</span>
                <span className="text-white/60">...</span>
                <span className="text-white">Sons' of The One</span>
                <span className="text-white/60">...</span>
              </p>
              <p className="text-2xl font-serif font-bold">
                <span className="text-[#F59E0B]">God Almighty</span>
                <span className="text-white/60">...</span>
              </p>
              <p className="text-xl font-serif font-bold">
                <span className="text-white/70 italic">are you one of</span>
                <span className="text-white/60">...</span>
                <span className="text-[#14B8A6]">WE</span>
                <span className="text-[#F59E0B]">?</span>
              </p>
              <p className="text-sm text-white/80 mt-3 font-light">
                The <span className="font-bold text-[#14B8A6]">"WALK"</span> starts in the lessons...
              </p>
              <p className="text-sm text-white/80 mt-1 font-light">
                <span className="font-bold text-[#F59E0B]">"Spiritual Growth"</span>
              </p>

              <div className="mt-3 space-y-1">
                <p className="text-sm text-white/90">
                  <span className="text-[#14B8A6] font-bold">WE ARE</span>
                  <span className="text-white/60">...</span>
                  <span className="text-white"> Sons' of The One</span>
                  <span className="text-white/60">...</span>
                  <span className="text-[#F59E0B] font-bold"> God Almighty</span>
                  <span className="text-white/60">...</span>
                </p>
                <p className="text-sm text-white/90">
                  <span className="text-[#14B8A6] font-bold">WALKING</span>
                  <span className="text-white"> in </span>
                  <span className="text-[#F59E0B] font-bold">SPIRIT</span>
                  <span className="text-white"> and not of the flesh</span>
                  <span className="text-white/60">...</span>
                  <span className="text-[#F59E0B] font-bold"> AMEN</span>
                  <span className="text-white"> 🙏</span>
                </p>
              </div>
            </div>
          </div>

          {/* Auth Card */}


          <div className="bg-gradient-to-br from-[#0f2942]/80 to-[#0c1929]/80 backdrop-blur-xl border border-[#14B8A6]/30 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-0">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center shadow-lg shadow-[#14B8A6]/30">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-white">
                  {mode === 'signin' && 'Welcome Back'}
                  {mode === 'signup' && 'Join the Family'}
                  {mode === 'reset' && 'Reset Password'}
                </h2>
                <p className="text-white/60 mt-2">
                  {mode === 'signin' && 'Sign in to continue your spiritual journey'}
                  {mode === 'signup' && 'Create an account to begin your journey'}
                  {mode === 'reset' && 'Enter your email to receive a reset link'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
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

              {/* Display Name (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Display Name (optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-[#14B8A6]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all"
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
                    placeholder="you@example.com"
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

              {/* Confirm Password (Sign Up only) */}
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

              {/* Terms and Privacy Agreement Checkbox (Sign Up only) */}
              {mode === 'signup' && (
                <div className="space-y-3">
                  {/* Agreement Checkbox */}
                  <div className="bg-[#0c1929]/70 border border-[#14B8A6]/30 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center h-6 mt-0.5">
                        <input
                          type="checkbox"
                          id="terms-agreement"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="w-5 h-5 rounded border-[#14B8A6]/50 bg-white/5 text-[#14B8A6] focus:ring-[#14B8A6]/50 focus:ring-offset-0 cursor-pointer"
                        />
                      </div>
                      <label htmlFor="terms-agreement" className="text-sm text-white/80 cursor-pointer leading-relaxed">
                        I have read and agree to the{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (onNavigateToTerms) {
                              onNavigateToTerms();
                            }
                          }}
                          className="text-[#14B8A6] hover:text-[#5EEAD4] underline font-medium inline-flex items-center"
                        >
                          Terms of Service
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </button>
                        {' '}and{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (onNavigateToPrivacy) {
                              onNavigateToPrivacy();
                            }
                          }}
                          className="text-[#14B8A6] hover:text-[#5EEAD4] underline font-medium inline-flex items-center"
                        >
                          Privacy Policy
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </button>
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
                </div>
              )}

              {/* 3-Day Free Trial Badge (Sign Up only) */}
              {mode === 'signup' && (
                <div className="flex items-center justify-center space-x-2 p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl">
                  <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-[#F59E0B] font-medium">3-Day Free Trial Included!</span>
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
                className={`w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl transition-all shadow-lg ${
                  isSignupDisabled 
                    ? 'opacity-50 cursor-not-allowed from-gray-500 to-gray-600 shadow-none' 
                    : 'hover:from-[#0D9488] hover:to-[#0F766E] shadow-[#14B8A6]/30 hover:shadow-[#14B8A6]/50'
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
                      Sign up free
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
            <div className="px-8 pb-6">
              <p className="text-xs text-center text-white/40">
                By continuing, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => onNavigateToTerms?.()}
                  className="text-[#14B8A6] hover:underline"
                >
                  Terms of Service
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={() => onNavigateToPrivacy?.()}
                  className="text-[#14B8A6] hover:underline"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </div>
          </div>

          {/* Mobile Scripture */}
          <div className="lg:hidden mt-8 p-4 bg-gradient-to-r from-[#14B8A6]/10 to-transparent border-l-4 border-[#14B8A6] rounded-r-xl">
            <p className="text-white/70 italic text-sm mb-1">
              "For as many as are led by the Spirit of God, they are the sons of God."
            </p>
            <p className="text-[#F59E0B] text-sm font-medium">— Romans 8:14 (KJV 1611)</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
