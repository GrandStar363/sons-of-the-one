import React, { useState } from 'react';
import { Eye, Sun, BookOpen, Heart, ChevronRight, ChevronLeft, Sparkles, MessageCircle, Share2, Bookmark, Calendar } from 'lucide-react';
interface LifeThroughSpiritualEyesProps {
  onReadVerse: (reference: string) => void;
}

// Daily devotionals data - rotates based on day of year
const devotionals = [{
  title: "Seeing Beyond the Visible",
  scripture: "2 Corinthians 4:18",
  scriptureText: "So we fix our eyes not on what is seen, but on what is unseen, since what is seen is temporary, but what is unseen is eternal.",
  message: "In our daily lives, we are constantly bombarded with the visible—bills to pay, tasks to complete, challenges to overcome. Yet as children of God, we are called to a higher perspective. When we view our circumstances through spiritual eyes, we begin to see that every trial is an opportunity for growth, every setback is a setup for a comeback, and every moment of darkness is simply the canvas upon which God paints His light.",
  prayer: "Father, open the eyes of my heart today. Help me to see beyond my circumstances and into Your eternal purposes. Give me the faith to trust what I cannot see and the wisdom to discern Your hand in all things. In Jesus' name, Amen.",
  application: ["Identify one current challenge and ask God to show you His perspective on it", "Practice gratitude by listing three unseen blessings in your life", "Spend 5 minutes in quiet meditation, asking the Holy Spirit to reveal truth"],
  relatedVerses: ["Hebrews 11:1", "Romans 8:28", "Ephesians 1:18"]
}, {
  title: "The Eyes of Faith",
  scripture: "Hebrews 11:1",
  scriptureText: "Now faith is the substance of things hoped for, the evidence of things not seen.",
  message: "Faith is not blind—it sees what others cannot. When Abraham looked at the stars, he saw his descendants. When Moses stood before the Red Sea, he saw a pathway. When David faced Goliath, he saw victory. Spiritual eyes are eyes of faith that perceive God's promises as more real than present circumstances. Today, what is God asking you to see by faith?",
  prayer: "Lord, increase my faith. Help me to see Your promises as already fulfilled. When doubt clouds my vision, remind me of Your faithfulness throughout history and in my own life. I choose to walk by faith, not by sight. Amen.",
  application: ["Write down a promise from Scripture and declare it over your situation", "Share a testimony of God's faithfulness with someone today", "Take one step of faith in an area where you've been hesitating"],
  relatedVerses: ["2 Corinthians 5:7", "Romans 10:17", "Mark 11:24"]
}, {
  title: "Renewed Vision",
  scripture: "Ephesians 1:18",
  scriptureText: "I pray that the eyes of your heart may be enlightened in order that you may know the hope to which he has called you, the riches of his glorious inheritance in his holy people.",
  message: "Paul's prayer for the Ephesians is our prayer today—that the eyes of our hearts would be enlightened. This isn't about physical sight but spiritual perception. When our spiritual eyes are opened, we begin to understand our calling, appreciate our inheritance, and recognize the immeasurable power available to us as believers. This renewed vision transforms how we live each day.",
  prayer: "Holy Spirit, enlighten the eyes of my heart. Reveal to me the hope of my calling and the riches of my inheritance in Christ. Help me to live today in the fullness of who I am in You. Amen.",
  application: ["Meditate on your identity in Christ—you are chosen, loved, and empowered", "Ask the Holy Spirit to reveal one area where you need renewed vision", "Journal about what it means to be an heir of God's kingdom"],
  relatedVerses: ["Romans 8:17", "Colossians 1:27", "1 Peter 2:9"]
}, {
  title: "Seeing Others as God Sees",
  scripture: "1 Samuel 16:7",
  scriptureText: "The LORD does not look at the things people look at. People look at the outward appearance, but the LORD looks at the heart.",
  message: "Spiritual eyes don't just change how we see our circumstances—they transform how we see people. Where the world sees failures, God sees potential. Where society sees the marginalized, Jesus sees the beloved. When we begin to see others through God's eyes, compassion replaces judgment, patience replaces frustration, and love replaces indifference. Today, ask God to help you see the people around you as He sees them.",
  prayer: "Father, give me Your eyes for the people in my life. Help me to look beyond outward appearances and see hearts that need Your love. Use me as an instrument of Your grace to those I encounter today. Amen.",
  application: ["Choose one person you find difficult and pray for them with compassion", "Look for the image of God in everyone you meet today", "Offer an encouraging word to someone who seems overlooked"],
  relatedVerses: ["Matthew 9:36", "John 4:35", "Galatians 3:28"]
}, {
  title: "The Light of the World",
  scripture: "Matthew 6:22-23",
  scriptureText: "The eye is the lamp of the body. If your eyes are healthy, your whole body will be full of light. But if your eyes are bad, your whole body will be full of darkness.",
  message: "Jesus teaches that our spiritual vision affects our entire being. When we focus on Him—the Light of the World—our whole life becomes illuminated. But when we fix our gaze on darkness, fear, and negativity, that darkness permeates everything. Guard what you allow into your spiritual vision. Fill your eyes with Scripture, worship, and the beauty of God's creation. Let the light in.",
  prayer: "Jesus, You are the Light of the World. Fill my eyes with Your light today. Help me to guard my heart and mind from darkness and to fix my gaze on You alone. Let Your light shine through me to others. Amen.",
  application: ["Evaluate what you're allowing into your mind through media and conversations", "Replace one negative input with Scripture reading or worship", "Be a light to someone in darkness today through kindness or encouragement"],
  relatedVerses: ["John 8:12", "Psalm 119:105", "Matthew 5:14-16"]
}, {
  title: "Eternal Perspective",
  scripture: "Colossians 3:1-2",
  scriptureText: "Since, then, you have been raised with Christ, set your hearts on things above, where Christ is, seated at the right hand of God. Set your minds on things above, not on earthly things.",
  message: "Living with spiritual eyes means maintaining an eternal perspective. This doesn't mean we ignore earthly responsibilities, but rather that we view them in light of eternity. When we set our minds on things above, temporary troubles become lighter, material possessions lose their grip, and our priorities align with heaven's values. Today, let eternity inform how you spend your time, energy, and resources.",
  prayer: "Lord, help me to live with eternity in view. Realign my priorities with Your kingdom purposes. Free me from the tyranny of the urgent so I can focus on what truly matters. May my life count for eternity. Amen.",
  application: ["Evaluate your schedule—does it reflect eternal priorities?", "Invest in someone's spiritual growth today", "Make one decision today based on eternal rather than temporal value"],
  relatedVerses: ["Matthew 6:19-21", "2 Peter 3:11-12", "1 John 2:17"]
}, {
  title: "Spiritual Discernment",
  scripture: "1 Corinthians 2:14",
  scriptureText: "The person without the Spirit does not accept the things that come from the Spirit of God but considers them foolishness, and cannot understand them because they are discerned only through the Spirit.",
  message: "Spiritual eyes require the Holy Spirit. Without Him, the things of God seem foolish or irrelevant. But with the Spirit's illumination, Scripture comes alive, God's voice becomes recognizable, and His ways make sense even when they contradict worldly wisdom. Cultivate your relationship with the Holy Spirit—He is your guide into all truth and the One who opens your spiritual eyes.",
  prayer: "Holy Spirit, I welcome Your presence in my life. Open my understanding to the things of God. Give me discernment to recognize truth from deception and wisdom to apply what You reveal. Lead me into all truth. Amen.",
  application: ["Spend time in prayer asking the Holy Spirit to teach you", "When reading Scripture, pause and ask 'What are You showing me, Lord?'", "Practice listening for God's voice in the quiet moments of your day"],
  relatedVerses: ["John 16:13", "1 John 2:27", "Proverbs 2:6"]
}];
const LifeThroughSpiritualEyes: React.FC<LifeThroughSpiritualEyesProps> = ({
  onReadVerse
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false);

  // Get today's devotional based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const todayIndex = dayOfYear % devotionals.length;
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const devotional = devotionals[selectedDay];
  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const handlePrevDay = () => {
    setSelectedDay(prev => prev === 0 ? devotionals.length - 1 : prev - 1);
  };
  const handleNextDay = () => {
    setSelectedDay(prev => prev === devotionals.length - 1 ? 0 : prev + 1);
  };
  const handleShare = async () => {
    const shareText = `📖 Life Through Spiritual Eyes - ${devotional.title}\n\n"${devotional.scriptureText}"\n- ${devotional.scripture}\n\n${devotional.message.substring(0, 200)}...`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Life Through Spiritual Eyes - Daily Devotional',
          text: shareText
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Devotional copied to clipboard!');
    }
  };
  return <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#F59E0B]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#14B8A6]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#F59E0B]/20 to-[#14B8A6]/20 rounded-full mb-6 border border-[#F59E0B]/30">
            <Eye className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-[#F59E0B] text-sm font-medium">Daily Devotional</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">
            Life Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#14B8A6]">Spiritual Eyes</span>
          </h2>
          
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Transform your perspective daily as you learn to see life, circumstances, and people through the lens of God's eternal truth.
          </p>
        </div>

        {/* Hero Image */}

        <div className="relative mb-12 rounded-2xl overflow-hidden border border-[#14B8A6]/20">
          <div className="aspect-[21/9] sm:aspect-[3/1]">
            <img src="https://d64gsuwffb70l.cloudfront.net/694fcc3ee4301f3ab0bd6a9d_1766880032316_55880465.png" alt="Spiritual sunrise" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1929] via-[#0c1929]/50 to-transparent" />
          </div>
          
          {/* Floating date card */}
          <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white p-4 rounded-xl shadow-xl glow-teal">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="font-semibold text-sm">Today's Devotional</span>
            </div>
            <p className="text-xs opacity-80">{formatDate()}</p>
          </div>
        </div>

        {/* Day Navigation */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <button onClick={handlePrevDay} className="p-2 rounded-full bg-[#14B8A6]/20 border border-[#14B8A6]/30 text-[#14B8A6] hover:bg-[#14B8A6]/30 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            {devotionals.map((_, index) => <button key={index} onClick={() => setSelectedDay(index)} className={`w-2 h-2 rounded-full transition-all ${index === selectedDay ? 'w-8 bg-gradient-to-r from-[#F59E0B] to-[#14B8A6]' : 'bg-white/30 hover:bg-white/50'}`} />)}
          </div>
          
          <button onClick={handleNextDay} className="p-2 rounded-full bg-[#14B8A6]/20 border border-[#14B8A6]/30 text-[#14B8A6] hover:bg-[#14B8A6]/30 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Main Devotional Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-6 sm:p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[#F59E0B] text-sm font-medium" data-mixed-content="true">Day {selectedDay + 1} of {devotionals.length}</span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                    {devotional.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setIsBookmarked(!isBookmarked)} className={`p-2 rounded-full transition-all ${isBookmarked ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-white/10 text-white/50 hover:text-white'}`}>
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={handleShare} className="p-2 rounded-full bg-white/10 text-white/50 hover:text-white transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scripture */}
              <div className="bg-gradient-to-r from-[#F59E0B]/10 to-[#14B8A6]/10 border border-[#F59E0B]/30 rounded-xl p-5 mb-6">
                <button onClick={() => onReadVerse(devotional.scripture)} className="group flex items-center space-x-2 text-[#F59E0B] font-serif text-lg mb-3 hover:text-[#FCD34D] transition-colors">
                  <BookOpen className="w-5 h-5" />
                  <span>{devotional.scripture}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
                <blockquote className="text-xl sm:text-2xl font-serif text-white leading-relaxed italic" data-mixed-content="true">
                  "{devotional.scriptureText}"
                </blockquote>
              </div>

              {/* Message */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-[#14B8A6]" />
                  <h4 className="text-lg font-semibold text-white">Today's Reflection</h4>
                </div>
                <p className="text-white/80 leading-relaxed text-lg">
                  {devotional.message}
                </p>
              </div>

              {/* Prayer */}
              <div className="bg-gradient-to-br from-[#3B82F6]/10 to-[#14B8A6]/10 border border-[#3B82F6]/30 rounded-xl p-5">
                <div className="flex items-center space-x-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-[#3B82F6]" />
                  <h4 className="text-lg font-semibold text-white">Prayer</h4>
                </div>
                <p className="text-white/80 leading-relaxed italic">
                  {devotional.prayer}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Application & Related */}
          <div className="space-y-6">
            {/* Application Points */}
            <div className="bg-gradient-to-br from-[#F59E0B]/10 via-[#0f2942] to-[#14B8A6]/10 border border-[#F59E0B]/30 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-[#F59E0B]" />
                <h4 className="text-lg font-semibold text-white">Apply It Today</h4>
              </div>
              <ul className="space-y-3">
                {devotional.application.map((point, index) => <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white text-sm font-bold flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-white/80 text-sm leading-relaxed">{point}</span>
                  </li>)}
              </ul>
            </div>

            {/* Related Verses */}
            <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-5 h-5 text-[#14B8A6]" />
                <h4 className="text-lg font-semibold text-white">Related Scriptures</h4>
              </div>
              <div className="space-y-2">
                {devotional.relatedVerses.map((verse, index) => <button key={index} onClick={() => onReadVerse(verse)} className="w-full text-left px-4 py-3 bg-[#14B8A6]/10 hover:bg-[#14B8A6]/20 border border-[#14B8A6]/20 rounded-lg text-[#5EEAD4] font-medium transition-all group flex items-center justify-between">
                    <span>{verse}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>)}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-white/10 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Your Journey</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-[#F59E0B]/10 rounded-xl border border-[#F59E0B]/20">
                  <div className="text-2xl font-bold text-[#F59E0B]">{devotionals.length}</div>
                  <div className="text-xs text-white/60">Devotionals</div>
                </div>
                <div className="text-center p-3 bg-[#14B8A6]/10 rounded-xl border border-[#14B8A6]/20">
                  <div className="text-2xl font-bold text-[#14B8A6]">{selectedDay + 1}</div>
                  <div className="text-xs text-white/60">Current Day</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View All Days Button */}
        <div className="text-center mt-12">
          <button onClick={() => setShowAllDays(!showAllDays)} className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all glow-teal">
            <Calendar className="w-5 h-5" />
            <span>{showAllDays ? 'Hide All Days' : 'View All Devotionals'}</span>
          </button>
        </div>

        {/* All Days Grid */}
        {showAllDays && <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {devotionals.map((dev, index) => <button key={index} onClick={() => {
          setSelectedDay(index);
          setShowAllDays(false);
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }} className={`text-left p-4 rounded-xl border transition-all ${index === selectedDay ? 'bg-gradient-to-br from-[#F59E0B]/20 to-[#14B8A6]/20 border-[#F59E0B]/50' : 'bg-[#0f2942]/50 border-white/10 hover:border-[#14B8A6]/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#14B8A6]" data-mixed-content="true">Day {index + 1}</span>
                  {index === todayIndex && <span className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] text-xs rounded-full">Today</span>}
                </div>
                <h5 className="text-white font-semibold mb-1 line-clamp-1">{dev.title}</h5>
                <p className="text-white/50 text-sm">{dev.scripture}</p>
              </button>)}
          </div>}
      </div>
    </section>;
};
export default LifeThroughSpiritualEyes;