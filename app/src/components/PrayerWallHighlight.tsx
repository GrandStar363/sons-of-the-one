import React, { useState } from 'react';
import SectionShare from './SectionShare';
import PrayerSpotlight, { PrayerStats } from './PrayerSpotlight';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Heart, Users, Sparkles, ArrowRight, HandHeart, Send, Loader2 } from 'lucide-react';

interface PrayerWallHighlightProps {
  onNavigateToPrayerWall: () => void;
  onReadVerse?: (reference: string) => void;
  onOpenAuth?: () => void;
  user?: User | null;
}

// Home-page Prayer Wall: members' prayer requests rotating one after another
// (with prayers from Scripture while there are only a few), real counts, and
// a quick form that posts straight to the Prayer Wall.
const PrayerWallHighlight: React.FC<PrayerWallHighlightProps> = ({ onNavigateToPrayerWall, onReadVerse, onOpenAuth, user }) => {
  const [showQuickPrayer, setShowQuickPrayer] = useState(false);
  const [quickPrayerText, setQuickPrayerText] = useState('');
  const [quickAnonymous, setQuickAnonymous] = useState(false);
  const [quickPrayerSubmitted, setQuickPrayerSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stats, setStats] = useState<PrayerStats | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleQuickPrayerSubmit = async () => {
    const request = quickPrayerText.trim();
    if (!request) return;
    if (!user) { onOpenAuth?.(); return; }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const name = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'A member';
      const firstLine = request.split(/[.!?\n]/)[0].trim();
      const { error } = await supabase.from('prayer_requests').insert({
        user_id: user.id,
        name: quickAnonymous ? 'Anonymous' : name,
        title: (firstLine.length > 3 ? firstLine : 'Prayer request').slice(0, 70),
        request,
        category: 'general',
        is_urgent: false,
        is_anonymous: quickAnonymous,
      });
      if (error) throw error;
      setQuickPrayerSubmitted(true);
      setQuickPrayerText('');
      setQuickAnonymous(false);
      setRefreshKey((k) => k + 1); // show it in the rotation straight away
      setTimeout(() => {
        setQuickPrayerSubmitted(false);
        setShowQuickPrayer(false);
      }, 2500);
    } catch (err) {
      console.error('Could not share prayer request', err);
      setSubmitError('Your prayer could not be shared just now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative py-10 sm:py-14 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A855F7]">
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <HandHeart className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm uppercase tracking-wider">Community Prayer Wall</span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
            Lift Each Other Up in <span className="text-amber-300">Prayer</span>
          </h2>
          
          {/* James 5:16a - LARGE, BOLD, and GOLD */}
          <p className="text-amber-400 font-bold italic text-2xl sm:text-3xl lg:text-4xl max-w-4xl mx-auto leading-tight mb-4">
            "Confess your faults one to another, and pray one for another, that ye may be healed."
          </p>
          <p className="text-amber-400 font-bold text-lg sm:text-xl">— James 5:16a (KJV 1611)</p>
          <div className="mt-6 flex justify-center">
            <SectionShare
              title={"Community Prayer Wall — Lift Each Other Up in Prayer"}
              text={"Share your prayer requests and pray for one another.\n\n\"Confess your faults one to another, and pray one for another, that ye may be healed.\" — James 5:16 (KJV)"}
            />
          </div>

        </div>


        {/* Stats (real counts, shown once members have shared requests) */}
        {stats && stats.total > 0 && (
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Heart className="w-5 h-5 text-pink-300" />
              <span className="text-white font-bold">{stats.total.toLocaleString()}</span>
              <span className="text-white/70 text-sm">prayer requests shared</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span className="text-white font-bold">{stats.today}</span>
              <span className="text-white/70 text-sm">today</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Users className="w-5 h-5 text-cyan-300" />
              <span className="text-white font-bold">{stats.warriors}</span>
              <span className="text-white/70 text-sm">prayer warriors</span>
            </div>
          </div>
        )}

        {/* Rotating prayers */}
        <div className="mb-8">
          <PrayerSpotlight
            user={user ?? null}
            refreshKey={refreshKey}
            onReadVerse={onReadVerse}
            onOpenAuth={onOpenAuth}
            onStats={setStats}
            tone="light"
          />
        </div>

        {/* Quick Prayer Form */}
        {showQuickPrayer && (
          <div className="max-w-2xl mx-auto mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-fadeIn">
            {quickPrayerSubmitted ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/30 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-emerald-300" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Prayer Request Submitted!</h3>
                <p className="text-white/70">Your prayer is now on the Prayer Wall, where the family can pray with you.</p>
              </div>
            ) : (
              <>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                  <Send className="w-5 h-5 mr-2 text-amber-300" />
                  Share Your Prayer Request
                </h3>
                <textarea
                  value={quickPrayerText}
                  onChange={(e) => setQuickPrayerText(e.target.value)}
                  placeholder="Share what's on your heart..."
                  maxLength={1000}
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none"
                  rows={3}
                />
                <label className="mt-3 flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={quickAnonymous}
                    onChange={(e) => setQuickAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded accent-amber-400"
                  />
                  Share anonymously
                </label>
                {submitError && <p className="mt-3 text-sm text-red-200">{submitError}</p>}
                <div className="flex justify-end mt-4 space-x-3">
                  <button
                    onClick={() => setShowQuickPrayer(false)}
                    className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQuickPrayerSubmit}
                    disabled={!quickPrayerText.trim() || submitting}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-full hover:from-amber-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Prayer
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onNavigateToPrayerWall}
            className="group flex items-center space-x-3 px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full hover:bg-amber-100 transition-all shadow-2xl shadow-black/20 hover:scale-105"
          >
            <HandHeart className="w-6 h-6" />
            <span>Visit Prayer Wall</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {!showQuickPrayer && (
            <button
              onClick={() => setShowQuickPrayer(true)}
              className="flex items-center space-x-3 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:bg-white/30 transition-all border border-white/30"
            >
              <Send className="w-5 h-5" />
              <span>Share a Prayer Request</span>
            </button>
          )}
        </div>

        {/* Bottom Scripture - LARGE, BOLD, and GOLD */}
        <div className="mt-10 text-center">
          <p className="text-amber-400 font-bold italic text-2xl sm:text-3xl lg:text-4xl max-w-4xl mx-auto leading-tight">
            "The effectual fervent prayer of a righteous man availeth much."
          </p>
          <p className="text-amber-400 font-bold text-lg sm:text-xl mt-3">— James 5:16b (KJV 1611)</p>
        </div>

      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default PrayerWallHighlight;
