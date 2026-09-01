import React, { useState, useEffect } from 'react';
import { ChevronRight, BookOpen, Share2, Copy, Check, Droplets, Brain, HandHeart, UsersRound, Headphones, GitCompare, Bell, CalendarDays, Sparkles, PenLine, Route } from 'lucide-react';
import { featuredVerses } from '@/data/bibleData';
interface HeroSectionProps {
  onStartReading: () => void;
  onExploreTopics: () => void;
  onNavigateToSalvation?: () => void;
  onNavigateToBaptism?: () => void;
  onNavigateToMemory?: () => void;
  onNavigateToPrayer?: () => void;
  onNavigateToGroups?: () => void;
  onNavigateToAudio?: () => void;
  onNavigateToCompare?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToDailyReading?: () => void;
  onNavigateToJournal?: () => void;
}
const HeroSection: React.FC<HeroSectionProps> = ({
  onStartReading,
  onExploreTopics,
  onNavigateToSalvation,
  onNavigateToBaptism,
  onNavigateToMemory,
  onNavigateToPrayer,
  onNavigateToGroups,
  onNavigateToAudio,
  onNavigateToCompare,
  onNavigateToNotifications,
  onNavigateToDailyReading,
  onNavigateToJournal
}) => {

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const currentVerse = featuredVerses[currentVerseIndex];
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentVerseIndex(prev => (prev + 1) % featuredVerses.length);
        setFadeIn(true);
      }, 500);
    }, 12000);
    return () => clearInterval(interval);
  }, []);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(`"${currentVerse.text}" - ${currentVerse.reference} (KJV 1611)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: currentVerse.reference,
        text: `"${currentVerse.text}" - ${currentVerse.reference} (KJV 1611)`
      });
    } else {
      handleCopy();
    }
  };
  const nextVerse = () => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentVerseIndex(prev => (prev + 1) % featuredVerses.length);
      setFadeIn(true);
    }, 300);
  };
  const prevVerse = () => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentVerseIndex(prev => (prev - 1 + featuredVerses.length) % featuredVerses.length);
      setFadeIn(true);
    }, 300);
  };
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with stunning gradient and image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/694fcc3ee4301f3ab0bd6a9d_1766856967865_45adb0e1.jpg)'
    }}>
        {/* Multi-layer gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1929]/95 via-[#0f2942]/80 to-[#0c1929]/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/10 via-transparent to-[#3B82F6]/10" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F59E0B]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/20 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#3B82F6]/15 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '2s'
      }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        {/* Theme Badge */}
        <div className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#14B8A6]/20 to-[#3B82F6]/20 border border-[#14B8A6]/30 rounded-full mb-8 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <Sparkles className="w-4 h-4 text-[#F59E0B] animate-pulse" />
          <span className="text-[#5EEAD4] text-sm font-medium uppercase tracking-wider">{currentVerse.theme}</span>
          <Sparkles className="w-4 h-4 text-[#F59E0B] animate-pulse" />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
          <span className="font-bold italic text-[#F59E0B] text-glow-amber">WE ARE...</span>
          <br />
          <span className="font-bold italic bg-gradient-to-r from-[#F59E0B] via-[#FCD34D] to-[#F59E0B] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Sons' of The One
          </span>
          <br />
          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold italic text-[#FCD34D] text-glow-amber">
            God Almighty!!!

          </span>
        </h1>

        {/* I am Robert - Core Identity */}
        <div className="mb-8">
          <p className="text-2xl sm:text-3xl font-serif text-[#60A5FA]">
            I am Robert
          </p>
          <p className="text-lg sm:text-xl font-serif text-[#5EEAD4] mt-2">
            One "Son" of many...©
          </p>
        </div>




        {/* Subtitle */}
        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-white/70 mb-12 max-w-2xl mx-auto">
          <span className="italic text-white/80">"For as many that are led by the Spirit of God, they are the sons of God..."</span>
        </p>








        {/* Featured Verse Card */}
        <div className={`bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942]/50 to-[#3B82F6]/10 backdrop-blur-sm border border-[#14B8A6]/30 rounded-2xl p-6 sm:p-8 mb-10 max-w-3xl mx-auto transition-all duration-500 ${fadeIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevVerse} className="p-2 text-white/60 hover:text-[#14B8A6] hover:bg-[#14B8A6]/10 rounded-full transition-all" aria-label="Previous verse">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <span className="text-[#5EEAD4] font-serif text-lg">{currentVerse.reference}</span>
            <button onClick={nextVerse} className="p-2 text-white/60 hover:text-[#14B8A6] hover:bg-[#14B8A6]/10 rounded-full transition-all" aria-label="Next verse">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <blockquote className="text-xl sm:text-2xl font-serif text-white leading-relaxed mb-6 italic">

            "{currentVerse.text}"
          </blockquote>

          <div className="flex items-center justify-center space-x-4">
            <button onClick={handleCopy} className="flex items-center space-x-2 px-4 py-2 text-white/70 hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded-lg transition-all">
              {copied ? <Check className="w-4 h-4 text-[#14B8A6]" /> : <Copy className="w-4 h-4" />}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button onClick={handleShare} className="flex items-center space-x-2 px-4 py-2 text-white/70 hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-lg transition-all">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>

          {/* Verse Indicators */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            {featuredVerses.slice(0, 6).map((_, index) => <button key={index} onClick={() => {
            setFadeIn(false);
            setTimeout(() => {
              setCurrentVerseIndex(index);
              setFadeIn(true);
            }, 300);
          }} className={`h-2 rounded-full transition-all ${index === currentVerseIndex ? 'bg-gradient-to-r from-[#F59E0B] to-[#14B8A6] w-8' : 'bg-white/30 hover:bg-white/50 w-2'}`} aria-label={`Go to verse ${index + 1}`} />)}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
          {/* THE ROAD OF SALVATION - FIRST AND MOST PROMINENT */}
          {onNavigateToSalvation && (
            <button 
              onClick={onNavigateToSalvation} 
              className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] text-white font-semibold rounded-xl hover:from-[#2563EB] hover:via-[#1D4ED8] hover:to-[#1E40AF] transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
            >
              <Route className="w-5 h-5" />
              <span>The Road of Salvation</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}


          <button onClick={onStartReading} className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all transform hover:scale-105 glow-teal">
            <BookOpen className="w-5 h-5" />
            <span>Begin Reading</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {onNavigateToBaptism && (
            <button 
              onClick={onNavigateToBaptism} 
              className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] text-white font-semibold rounded-xl hover:from-[#2563EB] hover:via-[#1D4ED8] hover:to-[#1E40AF] transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
            >
              <Droplets className="w-5 h-5" />
              <span>Baptism Journey</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {onNavigateToMemory && <button onClick={onNavigateToMemory} className="flex items-center space-x-2 px-8 py-4 border-2 border-[#3B82F6]/50 text-white font-semibold rounded-xl hover:border-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all">
              <Brain className="w-5 h-5 text-[#60A5FA]" />
              <span>Scripture Memory</span>
            </button>}




          {onNavigateToPrayer && <button onClick={onNavigateToPrayer} className="flex items-center space-x-2 px-8 py-4 border-2 border-[#F59E0B]/50 text-white font-semibold rounded-xl hover:border-[#F59E0B] hover:bg-[#F59E0B]/10 transition-all">
              <HandHeart className="w-5 h-5 text-[#FCD34D]" />
              <span>Prayer Requests</span>
            </button>}

          {onNavigateToGroups && <button onClick={onNavigateToGroups} className="flex items-center space-x-2 px-8 py-4 border-2 border-[#14B8A6]/50 text-white font-semibold rounded-xl hover:border-[#14B8A6] hover:bg-[#14B8A6]/10 transition-all">
              <UsersRound className="w-5 h-5 text-[#5EEAD4]" />
              <span>Study Groups</span>
            </button>}

          {onNavigateToAudio && <button onClick={onNavigateToAudio} className="flex items-center space-x-2 px-8 py-4 border-2 border-[#F59E0B]/50 text-white font-semibold rounded-xl hover:border-[#F59E0B] hover:bg-[#F59E0B]/10 transition-all">
              <Headphones className="w-5 h-5 text-[#FCD34D]" />
              <span>Audio Bible</span>
            </button>}

          {onNavigateToCompare && <button onClick={onNavigateToCompare} className="flex items-center space-x-2 px-8 py-4 border-2 border-[#3B82F6]/50 text-white font-semibold rounded-xl hover:border-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all">
              <GitCompare className="w-5 h-5 text-[#60A5FA]" />
              <span>Compare Translations</span>
            </button>}

          {onNavigateToNotifications && <button onClick={onNavigateToNotifications} className="flex items-center space-x-2 px-8 py-4 border-2 border-[#F59E0B]/50 text-white font-semibold rounded-xl hover:border-[#F59E0B] hover:bg-[#F59E0B]/10 transition-all">
              <Bell className="w-5 h-5 text-[#FCD34D]" />
              <span>Daily Notifications</span>
            </button>}

          {onNavigateToDailyReading && <button onClick={onNavigateToDailyReading} className="flex items-center space-x-2 px-8 py-4 border-2 border-[#14B8A6]/50 text-white font-semibold rounded-xl hover:border-[#14B8A6] hover:bg-[#14B8A6]/10 transition-all">
              <CalendarDays className="w-5 h-5 text-[#5EEAD4]" />
              <span>Daily Bible Reading</span>
            </button>}

          {onNavigateToJournal && <button onClick={onNavigateToJournal} className="flex items-center space-x-2 px-8 py-4 border-2 border-[#EC4899]/50 text-white font-semibold rounded-xl hover:border-[#EC4899] hover:bg-[#EC4899]/10 transition-all">
              <PenLine className="w-5 h-5 text-[#F472B6]" />
              <span>Personal Journal</span>
            </button>}

          <button onClick={onExploreTopics} className="flex items-center space-x-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:border-white/50 hover:bg-white/5 transition-all">
            <span>Explore Topics</span>
          </button>
        </div>


        {/* Scripture Reference */}
        <p className="mt-16 text-sm text-white/50">
          Based on the King James Version (KJV) 1611
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-[#14B8A6]/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-gradient-to-b from-[#F59E0B] to-[#14B8A6] rounded-full animate-pulse" />
        </div>
      </div>
    </section>;
};
export default HeroSection;