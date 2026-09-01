import React, { useState } from 'react';
import { Sun, BookOpen, ChevronRight, Share2 } from 'lucide-react';
import { featuredVerses } from '@/data/bibleData';
import ShareModal from './ShareModal';

interface DailyDevotionalProps {
  onReadMore: (reference: string) => void;
}

const DailyDevotional: React.FC<DailyDevotionalProps> = ({ onReadMore }) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Get today's verse based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const todayVerse = featuredVerses[dayOfYear % featuredVerses.length];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const shareContent = {
    type: 'devotional' as const,
    title: `Daily Devotional - ${formatDate()}`,
    text: todayVerse.text,
    reference: todayVerse.reference,
    theme: todayVerse.theme,
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#14B8A6]/20">
              <img
                src="https://d64gsuwffb70l.cloudfront.net/694fcc3ee4301f3ab0bd6a9d_1766838126198_1af41e1b.png"
                alt="Open Bible"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1929] via-transparent to-transparent" />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 sm:bottom-6 sm:right-6 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white p-4 rounded-xl shadow-xl max-w-[200px] glow-teal">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="w-5 h-5 text-[#FCD34D]" />
                <span className="font-semibold text-sm">Daily Verse</span>
              </div>
              <p className="text-xs opacity-80">{formatDate()}</p>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#F59E0B]/20 to-[#14B8A6]/20 rounded-full mb-6 border border-[#F59E0B]/30">
              <Sun className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-[#F59E0B] text-sm font-medium">{getGreeting()}, Child of God</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-6">
              Today's Scripture
            </h2>

            <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#3B82F6]/5 to-[#F59E0B]/5 border border-[#14B8A6]/30 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <span className="text-[#14B8A6] font-serif text-lg">{todayVerse.reference}</span>
                <button
                  onClick={handleShare}
                  className="p-2 text-white/50 hover:text-[#14B8A6] transition-colors rounded-lg hover:bg-white/5"
                  title="Share this devotional"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              <blockquote className="text-xl sm:text-2xl font-serif text-white leading-relaxed italic">
                "{todayVerse.text}"
              </blockquote>
              <div className="mt-4 flex items-center space-x-2">
                <span className="px-3 py-1 bg-[#F59E0B]/20 text-[#FCD34D] text-sm rounded-full border border-[#F59E0B]/30">
                  {todayVerse.theme}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Reflection</h3>
              <p className="text-white/70 leading-relaxed">
                As children of God, we are called to walk in the Spirit, embracing our identity as sons and daughters of the Most High. 
                This verse reminds us that through faith in Christ Jesus, we have been adopted into God's family—
                heirs of His promises and partakers of His divine nature.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onReadMore(todayVerse.reference)}
                  className="group flex items-center space-x-2 text-[#14B8A6] hover:text-[#5EEAD4] transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Read Full Chapter</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleShare}
                  className="group flex items-center space-x-2 text-[#F59E0B] hover:text-[#FCD34D] transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Share Devotional</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        content={shareContent}
      />
    </section>
  );
};

export default DailyDevotional;
