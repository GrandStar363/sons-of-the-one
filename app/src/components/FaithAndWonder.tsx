import React, { useState } from 'react';

interface FaithAndWonderProps {
  onReadVerse: (reference: string) => void;
}

const FaithAndWonder: React.FC<FaithAndWonderProps> = ({ onReadVerse }) => {
  const [activeTab, setActiveTab] = useState<'faith' | 'wonder' | 'heroes'>('faith');
  const [expandedHero, setExpandedHero] = useState<number | null>(null);
  const [savedVerses, setSavedVerses] = useState<string[]>([]);

  const toggleSaveVerse = (reference: string) => {
    setSavedVerses(prev => 
      prev.includes(reference) 
        ? prev.filter(v => v !== reference)
        : [...prev, reference]
    );
  };

  const faithVerses = [
    {
      reference: "Hebrews 11:1",
      text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
      highlight: true,
      reflection: "Faith gives reality to our hopes and certainty to what we cannot see. It is the foundation upon which we build our relationship with God."
    },
    {
      reference: "2 Corinthians 5:7",
      text: "For we walk by faith, not by sight.",
      reflection: "Our journey with God transcends physical perception. We trust in His promises even when circumstances seem contrary."
    },
    {
      reference: "Romans 10:17",
      text: "So then faith cometh by hearing, and hearing by the word of God.",
      reflection: "Faith grows as we immerse ourselves in Scripture, allowing God's Word to transform our understanding."
    },
    {
      reference: "Mark 11:24",
      text: "Therefore I say unto you, What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them.",
      reflection: "Jesus teaches that believing prayer has power. Faith activates God's promises in our lives."
    },
    {
      reference: "Hebrews 11:6",
      text: "But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him.",
      reflection: "Faith is essential to our relationship with God. He rewards those who earnestly seek Him."
    },
    {
      reference: "Matthew 17:20",
      text: "If ye have faith as a grain of mustard seed, ye shall say unto this mountain, Remove hence to yonder place; and it shall remove; and nothing shall be impossible unto you.",
      reflection: "Even the smallest genuine faith can accomplish the impossible through God's power."
    }
  ];

  const wonderVerses = [
    {
      reference: "Psalm 19:1",
      text: "The heavens declare the glory of God; and the firmament sheweth his handywork.",
      reflection: "Creation itself is a testament to God's majesty, inviting us to wonder at His infinite creativity."
    },
    {
      reference: "Psalm 139:14",
      text: "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.",
      reflection: "We ourselves are masterpieces of divine craftsmanship, worthy of wonder and gratitude."
    },
    {
      reference: "Isaiah 55:8-9",
      text: "For my thoughts are not your thoughts, neither are your ways my ways, saith the LORD. For as the heavens are higher than the earth, so are my ways higher than your ways, and my thoughts than your thoughts.",
      reflection: "God's wisdom transcends human understanding, inspiring holy wonder at His infinite nature."
    },
    {
      reference: "Job 37:14",
      text: "Hearken unto this, O Job: stand still, and consider the wondrous works of God.",
      reflection: "Sometimes we must pause and be still to truly perceive the wonders God has placed around us."
    },
    {
      reference: "Ephesians 3:20",
      text: "Now unto him that is able to do exceeding abundantly above all that we ask or think, according to the power that worketh in us.",
      reflection: "God's capacity to work in our lives far exceeds our imagination—a cause for endless wonder."
    }
  ];

  const heroesOfFaith = [
    {
      name: "Abraham",
      title: "Father of Faith",
      description: "Left his homeland trusting God's promise of a great nation, even offering Isaac in faith that God could raise the dead.",
      verse: "Hebrews 11:8-12",
      icon: "🏕️"
    },
    {
      name: "Moses",
      title: "Deliverer of Israel",
      description: "Chose suffering with God's people over Egyptian royalty, seeing Him who is invisible.",
      verse: "Hebrews 11:24-27",
      icon: "🔥"
    },
    {
      name: "David",
      title: "Man After God's Heart",
      description: "Faced Goliath with unwavering trust in God, becoming Israel's greatest king through faith.",
      verse: "1 Samuel 17:45-47",
      icon: "👑"
    },
    {
      name: "Daniel",
      title: "Faithful in Exile",
      description: "Maintained his faith in a foreign land, trusting God even in the lion's den.",
      verse: "Daniel 6:23",
      icon: "🦁"
    },
    {
      name: "Mary",
      title: "Handmaid of the Lord",
      description: "Accepted God's impossible plan with humble faith: 'Be it unto me according to thy word.'",
      verse: "Luke 1:38",
      icon: "⭐"
    },
    {
      name: "Peter",
      title: "Rock of the Church",
      description: "Walked on water toward Jesus, teaching us that faith keeps us above the storms of life.",
      verse: "Matthew 14:29",
      icon: "🌊"
    }
  ];

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/695129fe8ba84d19c5b1a5a5_1766955846904_d103a594.jpg"
          alt="Faith and Wonder"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1929]/95 via-[#0c1929]/85 to-[#0c1929]/95" />
      </div>

      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#F59E0B]/20 to-[#14B8A6]/20 border border-[#F59E0B]/30 rounded-full mb-6">
            <svg className="w-5 h-5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="text-[#F59E0B] font-medium text-sm">Faith & Wonder</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#14B8A6] bg-clip-text text-transparent">
              Faith & Wonder
            </span>
          </h2>

          {/* Main Quote */}
          <div className="max-w-4xl mx-auto">
            <blockquote className="relative">
              <svg className="absolute -top-4 -left-4 w-12 h-12 text-[#F59E0B]/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 font-serif italic leading-relaxed mb-4">
                "Wonder is the ability to see beyond the limitations of sight." ©
              </p>

              <p className="text-lg sm:text-xl text-[#14B8A6] font-medium">
                — Seeing Thru Spiritual Eyes

              </p>
            </blockquote>
          </div>
        </div>

        {/* Featured Scripture Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#F59E0B] via-[#14B8A6] to-[#3B82F6] rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-[#F59E0B]/30 rounded-2xl p-8 sm:p-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[#F59E0B] font-bold text-lg">Hebrews 11:1</span>
                    <p className="text-white/50 text-sm">The Definition of Faith</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSaveVerse('Hebrews 11:1')}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg 
                    className={`w-6 h-6 transition-colors ${savedVerses.includes('Hebrews 11:1') ? 'text-[#F59E0B] fill-current' : 'text-white/50'}`} 
                    fill={savedVerses.includes('Hebrews 11:1') ? 'currentColor' : 'none'} 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              
              <p className="text-2xl sm:text-3xl lg:text-4xl text-white font-serif leading-relaxed mb-6">
                "Now <span className="text-[#F59E0B] font-bold">faith</span> is the <span className="text-[#14B8A6]">substance</span> of things hoped for, the <span className="text-[#14B8A6]">evidence</span> of things not seen."
              </p>
              
              <div className="bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-xl p-4 sm:p-6">
                <h4 className="text-[#14B8A6] font-semibold mb-2 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Reflection</span>
                </h4>
                <p className="text-white/80 leading-relaxed">
                  Faith transforms the invisible into reality. It is not blind belief, but confident assurance based on God's character and promises. 
                  When we exercise faith, we give substance to our hopes and provide evidence for what our physical eyes cannot perceive. 
                  This is the foundation of our walk with God—trusting in His unseen hand guiding our every step.
                </p>
              </div>

              <button
                onClick={() => onReadVerse('Hebrews 11:1')}
                className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all"
              >
                <span>Read Full Chapter</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-[#0f2942]/80 border border-white/10 rounded-xl p-1">
            {[
              { id: 'faith', label: 'Scriptures on Faith', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
              { id: 'wonder', label: 'Scriptures on Wonder', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
              { id: 'heroes', label: 'Heroes of Faith', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'faith' | 'wonder' | 'heroes')}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#14B8A6] text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {/* Faith Scriptures */}
          {activeTab === 'faith' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faithVerses.map((verse, index) => (
                <div
                  key={verse.reference}
                  className={`group bg-gradient-to-br from-[#0f2942]/80 to-[#0c1929]/80 border rounded-xl p-6 hover:border-[#F59E0B]/50 transition-all ${
                    verse.highlight ? 'border-[#F59E0B]/30 md:col-span-2' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[#F59E0B] font-bold">{verse.reference}</span>
                    <button
                      onClick={() => toggleSaveVerse(verse.reference)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <svg 
                        className={`w-5 h-5 transition-colors ${savedVerses.includes(verse.reference) ? 'text-[#F59E0B] fill-current' : 'text-white/40'}`}
                        fill={savedVerses.includes(verse.reference) ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  <p className={`text-white font-serif italic leading-relaxed mb-4 ${verse.highlight ? 'text-xl' : 'text-lg'}`}>
                    "{verse.text}"
                  </p>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{verse.reflection}</p>
                  <button
                    onClick={() => onReadVerse(verse.reference)}
                    className="text-[#14B8A6] hover:text-[#0D9488] font-medium text-sm flex items-center space-x-1 transition-colors"
                  >
                    <span>Read in Context</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Wonder Scriptures */}
          {activeTab === 'wonder' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wonderVerses.map((verse, index) => (
                <div
                  key={verse.reference}
                  className="group bg-gradient-to-br from-[#0f2942]/80 to-[#0c1929]/80 border border-white/10 rounded-xl p-6 hover:border-[#14B8A6]/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[#14B8A6] font-bold">{verse.reference}</span>
                    <button
                      onClick={() => toggleSaveVerse(verse.reference)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <svg 
                        className={`w-5 h-5 transition-colors ${savedVerses.includes(verse.reference) ? 'text-[#14B8A6] fill-current' : 'text-white/40'}`}
                        fill={savedVerses.includes(verse.reference) ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-white font-serif italic leading-relaxed mb-4">
                    "{verse.text}"
                  </p>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{verse.reflection}</p>
                  <button
                    onClick={() => onReadVerse(verse.reference)}
                    className="text-[#F59E0B] hover:text-[#D97706] font-medium text-sm flex items-center space-x-1 transition-colors"
                  >
                    <span>Read in Context</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Heroes of Faith */}
          {activeTab === 'heroes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroesOfFaith.map((hero, index) => (
                <div
                  key={hero.name}
                  className="group bg-gradient-to-br from-[#0f2942]/80 to-[#0c1929]/80 border border-white/10 rounded-xl overflow-hidden hover:border-[#F59E0B]/50 transition-all cursor-pointer"
                  onClick={() => setExpandedHero(expandedHero === index ? null : index)}
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#14B8A6]/20 border border-[#F59E0B]/30 flex items-center justify-center text-2xl">
                        {hero.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">{hero.name}</h4>
                        <p className="text-[#F59E0B] text-sm">{hero.title}</p>
                      </div>
                    </div>
                    
                    <p className="text-white/70 leading-relaxed mb-4">{hero.description}</p>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${expandedHero === index ? 'max-h-40' : 'max-h-0'}`}>
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-[#14B8A6] font-medium text-sm mb-2">Key Scripture:</p>
                        <p className="text-white/60 text-sm">{hero.verse}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReadVerse(hero.verse);
                        }}
                        className="text-[#14B8A6] hover:text-[#0D9488] font-medium text-sm flex items-center space-x-1 transition-colors"
                      >
                        <span>Read Story</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <svg 
                        className={`w-5 h-5 text-white/40 transition-transform ${expandedHero === index ? 'rotate-180' : ''}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-[#F59E0B]/10 via-[#14B8A6]/10 to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-8 sm:p-10 max-w-2xl">
            <svg className="w-12 h-12 mx-auto mb-4 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-4">
              Walk by Faith Today
            </h3>
            <p className="text-white/70 leading-relaxed mb-6">
              Let these scriptures transform your perspective. Begin to see beyond the visible, 
              trust in God's promises, and experience the wonder of walking by faith.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onReadVerse('Hebrews 11:1')}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all"
              >
                Study Hebrews 11
              </button>
              <button
                onClick={() => onReadVerse('2 Corinthians 5:7')}
                className="w-full sm:w-auto px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
              >
                Walk by Faith
              </button>
            </div>
          </div>
        </div>

        {/* Saved Verses Indicator */}
        {savedVerses.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-gradient-to-r from-[#F59E0B] to-[#14B8A6] text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="font-medium">{savedVerses.length} verse{savedVerses.length > 1 ? 's' : ''} saved</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FaithAndWonder;
