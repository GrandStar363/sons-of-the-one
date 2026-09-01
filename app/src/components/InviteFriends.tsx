import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import SocialShareButtons from './SocialShareButtons';

interface InviteFriendsProps {
  user: User | null;
  onOpenAuth: () => void;
}

interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  successfulReferrals: number;
  triviaCompletions: number;
  totalPoints: number;
  badges: any[];
  notifications: any[];
  referralTrialAwarded?: boolean;
  referralTrialEnd?: string | null;
}

const InviteFriends: React.FC<InviteFriendsProps> = ({ user, onOpenAuth }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [claimingTrial, setClaimingTrial] = useState(false);

  const preWrittenMessages = [
    {
      title: 'Personal Invitation',
      message: `Hey! I've been using Sons of God for Bible study and trivia - it's amazing! Join me and let's grow in faith together. Use my code {CODE} to get 50 bonus points!`
    },
    {
      title: 'Challenge a Friend',
      message: `Think you know the Bible? I challenge you to beat my trivia score on Sons of God! Use code {CODE} when you sign up and let's see who knows more! 📖`
    },
    {
      title: 'Faith Journey',
      message: `I found an incredible app for daily Bible study called Sons of God. It has trivia, devotionals, and a great community. Use my invite code {CODE} to join!`
    },
    {
      title: 'Study Together',
      message: `Want to study the Bible together? Sons of God has study groups, trivia challenges, and daily readings. Sign up with code {CODE} and we can track our progress together!`
    },
    {
      title: 'Iron Sharpens Iron',
      message: `"As iron sharpens iron, so one person sharpens another." - Proverbs 27:17. Join me on Sons of God to grow together! Use code {CODE} for bonus points.`
    }
  ];

  const REFERRALS_FOR_TRIAL = 3;

  useEffect(() => {
    if (user) {
      loadStats();
      checkTrialStatus();
    }
  }, [user]);

  const checkTrialStatus = async () => {
    if (!user) return;
    
    // Check if user already has referral trial awarded in their metadata
    const metadata = user.user_metadata || {};
    if (metadata.referral_trial_awarded) {
      setStats(prev => prev ? {
        ...prev,
        referralTrialAwarded: true,
        referralTrialEnd: metadata.referral_trial_end || null
      } : null);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('referral-system', {
        body: { action: 'get_stats', userId: user.id }
      });

      if (error) throw error;
      
      if (data.success) {
        const metadata = user.user_metadata || {};
        setStats({
          ...data.stats,
          referralTrialAwarded: metadata.referral_trial_awarded || false,
          referralTrialEnd: metadata.referral_trial_end || null
        });
        
        // Check if user just reached 3 referrals and hasn't claimed trial yet
        if (data.stats.successfulReferrals >= REFERRALS_FOR_TRIAL && !metadata.referral_trial_awarded) {
          setShowCelebration(true);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimFreeTrial = async () => {
    if (!user || claimingTrial) return;
    
    setClaimingTrial(true);
    try {
      const { data, error } = await supabase.functions.invoke('referral-system', {
        body: { 
          action: 'claim_referral_trial', 
          userId: user.id,
          email: user.email
        }
      });

      if (error) throw error;

      if (data.success) {
        // Update local state
        setStats(prev => prev ? {
          ...prev,
          referralTrialAwarded: true,
          referralTrialEnd: data.trialEnd
        } : null);
        
        setShowCelebration(false);
        
        toast({
          title: '🎉 Free Trial Activated!',
          description: 'Your 3-day premium trial has been activated. Enjoy all premium features!',
        });
        
        // Refresh user data to get updated metadata
        await supabase.auth.refreshSession();
      } else {
        throw new Error(data.error || 'Failed to claim trial');
      }
    } catch (error: any) {
      console.error('Error claiming trial:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to claim free trial. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setClaimingTrial(false);
    }
  };

  const generateCode = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('referral-system', {
        body: { action: 'generate_code', userId: user.id }
      });

      if (error) throw error;

      if (data.success) {
        setStats(prev => prev ? { ...prev, referralCode: data.code } : {
          referralCode: data.code,
          totalReferrals: 0,
          successfulReferrals: 0,
          triviaCompletions: 0,
          totalPoints: 0,
          badges: [],
          notifications: [],
          referralTrialAwarded: false,
          referralTrialEnd: null
        });
        toast({
          title: 'Code Generated!',
          description: `Your referral code is ${data.code}`,
        });
      }
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate referral code',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const getInviteLink = () => {
    return `${window.location.origin}?ref=${stats?.referralCode || ''}`;
  };

  const getFormattedMessage = (message: string) => {
    return message.replace('{CODE}', stats?.referralCode || 'YOUR_CODE');
  };

  const getTrialProgress = () => {
    const successful = stats?.successfulReferrals || 0;
    return Math.min(successful, REFERRALS_FOR_TRIAL);
  };

  const getTrialProgressPercentage = () => {
    return (getTrialProgress() / REFERRALS_FOR_TRIAL) * 100;
  };

  const formatTrialEndDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#F59E0B]/10 border border-[#14B8A6]/30 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#14B8A6]/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Invite Friends & Earn Rewards</h2>
          <p className="text-white/70 mb-6">Sign in to get your unique referral code and start earning rewards!</p>
          <button
            onClick={onOpenAuth}
            className="px-8 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all"
          >
            Sign In to Start Inviting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Celebration Modal */}
      {showCelebration && !stats?.referralTrialAwarded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCelebration(false)} />
          <div className="relative bg-gradient-to-br from-[#0f2942] via-[#14B8A6]/20 to-[#F59E0B]/20 border-2 border-[#F59E0B]/50 rounded-3xl p-8 max-w-md w-full text-center animate-bounce-in">
            {/* Confetti effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    backgroundColor: ['#F59E0B', '#14B8A6', '#8B5CF6', '#EC4899', '#10B981'][Math.floor(Math.random() * 5)],
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-lg shadow-amber-500/30">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-serif font-bold text-white mb-3">
                Congratulations!
              </h2>
              <p className="text-[#F59E0B] text-xl font-semibold mb-4">
                You've Invited 3 Friends!
              </p>
              <p className="text-white/80 mb-6">
                You've unlocked a <span className="text-[#14B8A6] font-bold">3-Day Free Premium Trial</span> as a reward for spreading the Word!
              </p>
              
              <div className="bg-[#0c1929]/80 rounded-xl p-4 mb-6 border border-[#14B8A6]/30">
                <div className="flex items-center justify-center space-x-2 text-[#5EEAD4]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Premium Features Include:</span>
                </div>
                <ul className="mt-3 text-white/70 text-sm space-y-1">
                  <li>• Unlimited Bible study access</li>
                  <li>• Ad-free experience</li>
                  <li>• Advanced trivia modes</li>
                  <li>• Exclusive devotionals</li>
                </ul>
              </div>
              
              <button
                onClick={claimFreeTrial}
                disabled={claimingTrial}
                className="w-full py-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-bold text-lg rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
              >
                {claimingTrial ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Activating...</span>
                  </span>
                ) : (
                  'Claim My Free Trial!'
                )}
              </button>
              
              <button
                onClick={() => setShowCelebration(false)}
                className="mt-3 text-white/50 hover:text-white/70 text-sm transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#F59E0B]/20 border border-[#F59E0B]/40 rounded-full mb-4">
          <svg className="w-5 h-5 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[#F59E0B] font-semibold">Earn Rewards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
          Invite Friends & <span className="text-[#F59E0B]">Grow Together</span>
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Share the gift of faith! Invite friends to join Sons of God and earn rewards when they sign up and complete their first trivia.
        </p>
      </div>

      {/* Free Trial Progress Card */}
      <div className="mb-8">
        <div className={`bg-gradient-to-br ${stats?.referralTrialAwarded ? 'from-green-500/20 via-[#0f2942] to-[#14B8A6]/20 border-green-500/40' : 'from-[#F59E0B]/20 via-[#0f2942] to-[#14B8A6]/20 border-[#F59E0B]/40'} border-2 rounded-2xl p-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full ${stats?.referralTrialAwarded ? 'bg-green-500/20' : 'bg-[#F59E0B]/20'} flex items-center justify-center flex-shrink-0`}>
                {stats?.referralTrialAwarded ? (
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {stats?.referralTrialAwarded ? '3-Day Free Trial Active!' : 'Unlock 3-Day Free Trial'}
                </h3>
                <p className="text-white/60">
                  {stats?.referralTrialAwarded 
                    ? `Your premium trial is active until ${formatTrialEndDate(stats.referralTrialEnd)}`
                    : `Invite ${REFERRALS_FOR_TRIAL} friends to unlock a free premium trial`
                  }
                </p>
              </div>
            </div>
            
            {!stats?.referralTrialAwarded && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#F59E0B]">
                    {getTrialProgress()}/{REFERRALS_FOR_TRIAL}
                  </div>
                  <div className="text-white/50 text-sm">Friends Joined</div>
                </div>
              </div>
            )}
          </div>
          
          {!stats?.referralTrialAwarded && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/60">Progress to Free Trial</span>
                <span className="text-[#F59E0B] font-medium">{Math.round(getTrialProgressPercentage())}%</span>
              </div>
              <div className="w-full bg-[#0c1929] rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#F59E0B] to-[#14B8A6] rounded-full transition-all duration-500 relative"
                  style={{ width: `${getTrialProgressPercentage()}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between mt-2">
                {[...Array(REFERRALS_FOR_TRIAL)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      i < getTrialProgress() 
                        ? 'bg-[#14B8A6] text-white' 
                        : 'bg-[#0c1929] border border-white/20 text-white/40'
                    }`}>
                      {i < getTrialProgress() ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">{i + 1}</span>
                      )}
                    </div>
                    <span className="text-xs text-white/40 mt-1">Friend {i + 1}</span>
                  </div>
                ))}
              </div>
              
              {getTrialProgress() >= REFERRALS_FOR_TRIAL && !stats?.referralTrialAwarded && (
                <button
                  onClick={() => setShowCelebration(true)}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-bold rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all shadow-lg shadow-amber-500/30 animate-pulse"
                >
                  Claim Your Free Trial Now!
                </button>
              )}
            </div>
          )}
          
          {stats?.referralTrialAwarded && (
            <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-green-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="font-semibold">Premium Features Unlocked!</span>
              </div>
              <p className="text-white/60 text-sm mt-2">
                Thank you for sharing Sons of God with your friends. Enjoy your premium access!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#14B8A6]/20 to-[#0f2942] border border-[#14B8A6]/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#14B8A6]">{stats?.totalReferrals || 0}</div>
          <div className="text-white/60 text-sm">Total Invites</div>
        </div>
        <div className="bg-gradient-to-br from-[#F59E0B]/20 to-[#0f2942] border border-[#F59E0B]/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#F59E0B]">{stats?.successfulReferrals || 0}</div>
          <div className="text-white/60 text-sm">Friends Joined</div>
        </div>
        <div className="bg-gradient-to-br from-[#8B5CF6]/20 to-[#0f2942] border border-[#8B5CF6]/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#8B5CF6]">{stats?.triviaCompletions || 0}</div>
          <div className="text-white/60 text-sm">Trivia Complete</div>
        </div>
        <div className="bg-gradient-to-br from-[#EC4899]/20 to-[#0f2942] border border-[#EC4899]/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#EC4899]">{stats?.totalPoints || 0}</div>
          <div className="text-white/60 text-sm">Points Earned</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Referral Code Section */}
        <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#F59E0B]/10 border border-[#14B8A6]/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg className="w-6 h-6 text-[#14B8A6] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Your Referral Code
          </h2>

          {stats?.referralCode ? (
            <div className="space-y-4">
              <div className="bg-[#0c1929] border-2 border-dashed border-[#F59E0B]/50 rounded-xl p-6 text-center">
                <div className="text-4xl font-mono font-bold text-[#F59E0B] tracking-wider mb-2">
                  {stats.referralCode}
                </div>
                <p className="text-white/60 text-sm">Share this code with friends</p>
              </div>

              <button
                onClick={() => copyToClipboard(stats.referralCode!, 'code')}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                  copied === 'code'
                    ? 'bg-green-500 text-white'
                    : 'bg-[#14B8A6]/20 border border-[#14B8A6]/40 text-[#5EEAD4] hover:bg-[#14B8A6]/30'
                }`}
              >
                {copied === 'code' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              {/* Invite Link */}
              <div className="mt-4">
                <label className="text-white/70 text-sm mb-2 block">Or share your invite link:</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={getInviteLink()}
                    className="flex-1 bg-[#0c1929] border border-white/20 rounded-lg px-4 py-2 text-white/80 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(getInviteLink(), 'link')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      copied === 'link'
                        ? 'bg-green-500 text-white'
                        : 'bg-[#F59E0B] text-white hover:bg-[#D97706]'
                    }`}
                  >
                    {copied === 'link' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <button
                onClick={generateCode}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-bold rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </span>
                ) : (
                  'Generate My Referral Code'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Pre-written Messages */}
        <div className="bg-gradient-to-br from-[#8B5CF6]/10 via-[#0f2942] to-[#EC4899]/10 border border-[#8B5CF6]/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg className="w-6 h-6 text-[#8B5CF6] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Ready-to-Share Messages
          </h2>

          <div className="space-y-3 mb-4">
            {preWrittenMessages.map((msg, index) => (
              <button
                key={index}
                onClick={() => setSelectedMessage(index)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedMessage === index
                    ? 'bg-[#8B5CF6]/30 border border-[#8B5CF6]/50'
                    : 'bg-[#0c1929]/50 border border-white/10 hover:border-white/30'
                }`}
              >
                <div className="font-medium text-white text-sm">{msg.title}</div>
              </button>
            ))}
          </div>

          <div className="bg-[#0c1929] border border-white/20 rounded-xl p-4 mb-4">
            <p className="text-white/80 text-sm leading-relaxed">
              {getFormattedMessage(preWrittenMessages[selectedMessage].message)}
            </p>
          </div>

          <button
            onClick={() => copyToClipboard(getFormattedMessage(preWrittenMessages[selectedMessage].message), 'message')}
            className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
              copied === 'message'
                ? 'bg-green-500 text-white'
                : 'bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#A78BFA] hover:bg-[#8B5CF6]/30'
            }`}
          >
            {copied === 'message' ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Message Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share on Social Media */}
      <div className="mt-8 bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 text-center">Share on Social Media</h2>
        <SocialShareButtons
          type="achievement"
          title="Invite your friends to join Sons of God!"
          achievementName="Referral Invitation"
          userId={user?.id}
        />
      </div>

      {/* Rewards Info */}
      <div className="mt-8 grid sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#14B8A6]/10 to-[#0f2942] border border-[#14B8A6]/30 rounded-xl p-5">
          <div className="w-12 h-12 rounded-full bg-[#14B8A6]/20 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h3 className="font-bold text-white mb-2">Friend Signs Up</h3>
          <p className="text-white/60 text-sm mb-2">When your friend joins using your code</p>
          <div className="text-[#14B8A6] font-bold">+100 Points for You</div>
          <div className="text-[#F59E0B] font-bold">+50 Points for Them</div>
        </div>

        <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#0f2942] border border-[#F59E0B]/30 rounded-xl p-5">
          <div className="w-12 h-12 rounded-full bg-[#F59E0B]/20 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="font-bold text-white mb-2">First Trivia Complete</h3>
          <p className="text-white/60 text-sm mb-2">When they complete their first trivia</p>
          <div className="text-[#F59E0B] font-bold">+150 Bonus Points</div>
          <div className="text-white/50 text-sm">You'll be notified!</div>
        </div>

        <div className="bg-gradient-to-br from-[#EC4899]/10 to-[#0f2942] border border-[#EC4899]/30 rounded-xl p-5">
          <div className="w-12 h-12 rounded-full bg-[#EC4899]/20 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-[#EC4899]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 className="font-bold text-white mb-2">3 Friends Join</h3>
          <p className="text-white/60 text-sm mb-2">Invite 3 friends who sign up</p>
          <div className="text-[#EC4899] font-bold">3-Day Free Trial!</div>
          <div className="text-white/50 text-sm">Premium access unlocked</div>
        </div>

        <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#0f2942] border border-[#8B5CF6]/30 rounded-xl p-5">
          <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 className="font-bold text-white mb-2">Earn Badges</h3>
          <p className="text-white/60 text-sm mb-2">Unlock special badges as you refer more friends</p>
          <div className="text-[#8B5CF6] font-bold">Up to 2500+ Points</div>
          <div className="text-white/50 text-sm">From badge rewards!</div>
        </div>
      </div>

      {/* Badges Section */}
      {stats?.badges && stats.badges.length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Your Referral Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.badges.map((badge: any) => (
              <div key={badge.id} className="bg-[#0c1929] border border-[#F59E0B]/30 rounded-xl p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="font-bold text-white text-sm">{badge.badges?.name}</div>
                <div className="text-[#F59E0B] text-xs">+{badge.badges?.points_reward} pts</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {stats?.notifications && stats.notifications.length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-green-500/10 to-[#0f2942] border border-green-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg className="w-6 h-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Recent Notifications
          </h2>
          <div className="space-y-3">
            {stats.notifications.map((notif: any) => (
              <div key={notif.id} className="bg-[#0c1929] border border-green-500/20 rounded-lg p-4 flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white">{notif.message}</p>
                  <p className="text-white/50 text-sm mt-1">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default InviteFriends;
