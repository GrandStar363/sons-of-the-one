import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, BookOpen, KeyRound, ShieldCheck, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check for valid password reset session on mount
  useEffect(() => {
    const checkSession = async () => {
      setCheckingSession(true);
      
      try {
        // Listen for auth state changes - specifically PASSWORD_RECOVERY event
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            setIsValidSession(true);
            setCheckingSession(false);
          }
        });

        // Also check if there's already a session (user might have refreshed the page)
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check URL hash for recovery token
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        
        if (type === 'recovery' && accessToken) {
          // Set the session using the recovery token
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
          
          if (!error) {
            setIsValidSession(true);
          } else {
            setIsValidSession(false);
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        } else if (session) {
          // User has a valid session (might be from the recovery flow)
          setIsValidSession(true);
        } else {
          // No valid session or recovery token
          setIsValidSession(false);
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
        
        setCheckingSession(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Session check error:', err);
        setIsValidSession(false);
        setError('An error occurred while validating your reset link.');
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const validatePassword = (): boolean => {
    setError(null);

    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (password.length > 72) {
      setError('Password must be less than 72 characters');
      return false;
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }

    // Check for at least one number
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return false;
    }

    if (!confirmPassword) {
      setError('Please confirm your password');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      
      // Sign out the user after password reset
      await supabase.auth.signOut();
      
      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  // Password strength indicator
  const getPasswordStrength = (): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 4) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1929] via-[#0f2942] to-[#0c1929] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center animate-pulse">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2 text-white">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Validating reset link...</span>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1929] via-[#0f2942] to-[#0c1929] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-[#0f2942]/80 to-[#0c1929]/80 backdrop-blur-xl border border-[#14B8A6]/30 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center shadow-lg shadow-[#14B8A6]/30">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-3">Password Reset Successful!</h2>
            <p className="text-white/70 mb-6">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </p>
            <div className="flex items-center justify-center space-x-2 text-[#14B8A6] mb-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Redirecting to login...</span>
            </div>
            <button
              onClick={handleBackToLogin}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all shadow-lg shadow-[#14B8A6]/30"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go to Login Now</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Invalid session state
  if (isValidSession === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1929] via-[#0f2942] to-[#0c1929] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-[#0f2942]/80 to-[#0c1929]/80 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-3">Invalid Reset Link</h2>
            <p className="text-white/70 mb-6">
              {error || 'This password reset link is invalid or has expired. Please request a new password reset link.'}
            </p>
            <button
              onClick={handleBackToLogin}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all shadow-lg shadow-[#14B8A6]/30"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1929] via-[#0f2942] to-[#0c1929] flex">
      {/* Left Side - Branding */}
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
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-10">
            <h2 className="text-4xl xl:text-5xl font-serif font-bold leading-tight">
              <span className="text-white">Create Your</span>
            </h2>
            <h2 className="text-4xl xl:text-5xl font-serif font-bold leading-tight mt-2">
              <span className="text-[#14B8A6]">New Password</span>
            </h2>
            <p className="text-xl text-white/70 mt-6">
              Choose a strong password to protect your spiritual journey and keep your account secure.
            </p>
          </div>

          {/* Security Tips */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#F59E0B] flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Password Security Tips</span>
            </h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                <span>Use at least 6 characters with a mix of letters and numbers</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                <span>Include both uppercase and lowercase letters</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                <span>Add special characters for extra security</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                <span>Avoid using personal information or common words</span>
              </li>
            </ul>
          </div>

          {/* Scripture Quote */}
          <div className="mt-12 p-6 bg-gradient-to-r from-[#14B8A6]/10 to-transparent border-l-4 border-[#14B8A6] rounded-r-xl">
            <p className="text-white/80 italic text-lg mb-2">
              "The name of the LORD is a strong tower: the righteous runneth into it, and is safe."
            </p>
            <p className="text-[#F59E0B] font-medium">— Proverbs 18:10 KJV</p>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center shadow-lg shadow-[#14B8A6]/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-white">Sons of God</h1>
                <p className="text-[#14B8A6] text-xs">Walking in Divine Identity</p>
              </div>
            </div>
          </div>

          {/* Reset Card */}
          <div className="bg-gradient-to-br from-[#0f2942]/80 to-[#0c1929]/80 backdrop-blur-xl border border-[#14B8A6]/30 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-0">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center shadow-lg shadow-[#14B8A6]/30">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-white">Reset Your Password</h2>
                <p className="text-white/60 mt-2">
                  Enter your new password below to complete the reset process.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleResetPassword} className="p-8 pt-4 space-y-5">
              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-11 pr-12 py-3 bg-white/5 border border-[#14B8A6]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-[#F59E0B] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/50">Password strength:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.strength === 1 ? 'text-red-400' :
                        passwordStrength.strength === 2 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= passwordStrength.strength ? passwordStrength.color : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-11 pr-12 py-3 bg-white/5 border border-[#14B8A6]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-[#F59E0B] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="mt-2 flex items-center space-x-2">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-red-400">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-[#0c1929]/50 border border-[#14B8A6]/20 rounded-xl p-4">
                <p className="text-xs font-medium text-white/70 mb-2">Password Requirements:</p>
                <ul className="space-y-1 text-xs text-white/50">
                  <li className={`flex items-center space-x-2 ${password.length >= 6 ? 'text-green-400' : ''}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? 'bg-green-400' : 'bg-white/30'}`} />
                    <span>At least 6 characters</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${/[A-Z]/.test(password) ? 'text-green-400' : ''}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-400' : 'bg-white/30'}`} />
                    <span>One uppercase letter</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${/[a-z]/.test(password) ? 'text-green-400' : ''}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-green-400' : 'bg-white/30'}`} />
                    <span>One lowercase letter</span>
                  </li>
                  <li className={`flex items-center space-x-2 ${/[0-9]/.test(password) ? 'text-green-400' : ''}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-green-400' : 'bg-white/30'}`} />
                    <span>One number</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all shadow-lg shadow-[#14B8A6]/30 hover:shadow-[#14B8A6]/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>

              {/* Back to Login Link */}
              <div className="text-center pt-4 border-t border-[#14B8A6]/20">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="inline-flex items-center space-x-2 text-[#14B8A6] hover:text-[#5EEAD4] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </button>
              </div>
            </form>
          </div>

          {/* Mobile Scripture */}
          <div className="lg:hidden mt-8 p-4 bg-gradient-to-r from-[#14B8A6]/10 to-transparent border-l-4 border-[#14B8A6] rounded-r-xl">
            <p className="text-white/70 italic text-sm mb-1">
              "The name of the LORD is a strong tower: the righteous runneth into it, and is safe."
            </p>
            <p className="text-[#F59E0B] text-sm font-medium">— Proverbs 18:10 KJV</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
