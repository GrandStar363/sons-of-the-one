import React, { useState, useEffect } from 'react';
import { Heart, Users, Sparkles, ArrowRight, HandHeart, Clock, Send } from 'lucide-react';

interface PrayerRequest {
  id: string;
  name: string;
  isAnonymous: boolean;
  category: string;
  content: string;
  prayerCount: number;
  timestamp: Date;
}

interface PrayerWallHighlightProps {
  onNavigateToPrayerWall: () => void;
  user?: any;
}

const PrayerWallHighlight: React.FC<PrayerWallHighlightProps> = ({ onNavigateToPrayerWall, user }) => {
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set());
  const [animatingPrayer, setAnimatingPrayer] = useState<string | null>(null);
  const [showQuickPrayer, setShowQuickPrayer] = useState(false);
  const [quickPrayerText, setQuickPrayerText] = useState('');
  const [quickPrayerSubmitted, setQuickPrayerSubmitted] = useState(false);

  // Sample recent prayers
  const [recentPrayers, setRecentPrayers] = useState<PrayerRequest[]>([
    {
      id: '1',
      name: 'Sarah M.',
      isAnonymous: false,
      category: 'Healing',
      content: 'Please pray for my mother who is recovering from surgery. We trust in God\'s healing power.',
      prayerCount: 47,
      timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 mins ago
    },
    {
      id: '2',
      name: 'Anonymous',
      isAnonymous: true,
      category: 'Guidance',
      content: 'Seeking God\'s direction for a major life decision. Please pray for clarity and peace.',
      prayerCount: 32,
      timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 mins ago
    },
    {
      id: '3',
      name: 'David K.',
      isAnonymous: false,
      category: 'Family',
      content: 'Prayers for unity and restoration in my family. God is faithful!',
      prayerCount: 28,
      timestamp: new Date(Date.now() - 1000 * 60 * 90) // 90 mins ago
    }
  ]);

  const stats = {
    totalPrayers: 1247,
    prayersToday: 89,
    prayerWarriors: 342
  };

  const handlePray = (prayerId: string) => {
    if (prayedFor.has(prayerId)) return;
    
    setAnimatingPrayer(prayerId);
    setPrayedFor(prev => new Set([...prev, prayerId]));
    
    setRecentPrayers(prev => prev.map(p => 
      p.id === prayerId ? { ...p, prayerCount: p.prayerCount + 1 } : p
    ));

    setTimeout(() => setAnimatingPrayer(null), 1000);
  };

  const handleQuickPrayerSubmit = () => {
    if (!quickPrayerText.trim()) return;
    setQuickPrayerSubmitted(true);
    setQuickPrayerText('');
    setTimeout(() => {
      setQuickPrayerSubmitted(false);
      setShowQuickPrayer(false);
    }, 2000);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Healing': 'from-rose-500 to-pink-500',
      'Guidance': 'from-blue-500 to-cyan-500',
      'Family': 'from-amber-500 to-orange-500',
      'Thanksgiving': 'from-emerald-500 to-teal-500',
      'Protection': 'from-violet-500 to-purple-500',
      'Financial': 'from-green-500 to-emerald-500',
      'Spiritual Growth': 'from-indigo-500 to-blue-500',
      'Relationships': 'from-pink-500 to-rose-500'
    };
    return colors[category] || 'from-gray-500 to-slate-500';
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
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

        </div>


        {/* Stats Bar */}

        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Heart className="w-5 h-5 text-pink-300" />
            <span className="text-white font-bold">{stats.totalPrayers.toLocaleString()}</span>
            <span className="text-white/70 text-sm">prayers shared</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-white font-bold">{stats.prayersToday}</span>
            <span className="text-white/70 text-sm">prayers today</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Users className="w-5 h-5 text-cyan-300" />
            <span className="text-white font-bold">{stats.prayerWarriors}</span>
            <span className="text-white/70 text-sm">prayer warriors</span>
          </div>
        </div>

        {/* Prayer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {recentPrayers.map((prayer) => (
            <div
              key={prayer.id}
              className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            >
              {/* Category Badge */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(prayer.category)} text-white text-xs font-semibold mb-3`}>
                {prayer.category}
              </div>

              {/* Prayer Content */}
              <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-3">
                "{prayer.content}"
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {prayer.isAnonymous ? '?' : prayer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {prayer.isAnonymous ? 'Anonymous' : prayer.name}
                    </p>
                    <p className="text-white/50 text-xs flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {getTimeAgo(prayer.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Pray Button */}
                <button
                  onClick={() => handlePray(prayer.id)}
                  disabled={prayedFor.has(prayer.id)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                    prayedFor.has(prayer.id)
                      ? 'bg-emerald-500/30 text-emerald-300 cursor-default'
                      : 'bg-white/20 text-white hover:bg-white hover:text-purple-600'
                  } ${animatingPrayer === prayer.id ? 'animate-bounce' : ''}`}
                >
                  <HandHeart className={`w-4 h-4 ${prayedFor.has(prayer.id) ? 'text-emerald-300' : ''}`} />
                  <span>{prayedFor.has(prayer.id) ? 'Prayed!' : 'Pray'}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {prayer.prayerCount}
                  </span>
                </button>
              </div>

              {/* Prayed Animation Overlay */}
              {animatingPrayer === prayer.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 rounded-2xl pointer-events-none">
                  <div className="text-4xl animate-ping">🙏</div>
                </div>
              )}
            </div>
          ))}
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
                <p className="text-white/70">Your prayer has been shared with the community.</p>
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
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-4 space-x-3">
                  <button
                    onClick={() => setShowQuickPrayer(false)}
                    className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQuickPrayerSubmit}
                    disabled={!quickPrayerText.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-full hover:from-amber-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
