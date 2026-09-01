import React, { useState, useEffect } from 'react';

const DivineCallingBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const callingWords = [
    { word: 'Called', color: 'from-teal-400 to-cyan-300', glow: 'glow-teal' },
    { word: 'Chosen', color: 'from-blue-400 to-indigo-300', glow: 'glow-blue' },
    { word: 'Faithful', color: 'from-purple-400 to-pink-300', glow: '' },
  ];


  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c1929] via-[#1a0a2e] to-[#0c1929]">
        {/* Radial glow effects */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/60 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        
        {/* Cross pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="cross-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 5 L10 15 M5 10 L15 10" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-amber-400" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#cross-pattern)" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Crown/Authority Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 flex items-center justify-center border border-amber-400/30 animate-pulse">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>
            </div>
            <div className="absolute -inset-4 bg-amber-400/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>

        {/* Main Title - Authority/Purpose */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[0.2em] uppercase mb-12 animate-pulse drop-shadow-lg" style={{ color: '#FFD700', textShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.4)' }}>
          AUTHORITY  &   PURPOSE
        </h2>



        {/* Clarity of Discipline Poem */}
        <div className="mb-12 text-center">
          <h3 className="text-2xl sm:text-3xl font-serif italic text-amber-300/90 mb-6">
            Clarity of discipline
          </h3>
          <p className="text-lg sm:text-xl text-white/80 font-serif italic leading-relaxed mb-6 max-w-3xl mx-auto">
            The true strength of a man is forged thru bitterness, hurt, pain, struggle, loneliness and isolation...these produce mighty warriors in Christ! And some of the holiest-godly men that have ever walked upon the Earth...
          </p>

          <p className="text-base sm:text-lg text-teal-300/90 font-serif italic">
            Experience, knowledge, and age...<br/>
            Are the very essence of wisdom... ©
          </p>
        </div>



        {/* Holy and Accountable Poem */}
        <div className="mb-12 text-center">
          <h3 className="text-2xl sm:text-3xl font-serif italic text-amber-300/90 mb-6">
            Holy and Accountable
          </h3>
          

          <p className="text-lg sm:text-xl text-white/80 font-serif italic leading-relaxed mb-6 max-w-3xl mx-auto">
            By the narrow strait path in which I barely see...<br/>
            by the slight sight of light to be, further and further, thee shall<br/>
            see, until finally, I shall see thee...Patiently...awaiting me...
          </p>
          
          <p className="text-lg sm:text-xl text-teal-300/90 font-serif italic leading-relaxed mb-4">
            I am, Awoke!<br/>
            and I see thee, saying,<br/>
            well done towards me...
          </p>
          
          <p className="text-xl sm:text-2xl text-white/70 font-serif italic mb-2">Praise the Father...</p>
          <p className="text-xl sm:text-2xl text-white/70 font-serif italic mb-2">The Holy One...</p>
          <p className="text-xl sm:text-2xl text-amber-300/90 font-serif italic mb-6">God...</p>
          
          <p className="text-lg sm:text-xl text-white/80 font-serif italic leading-relaxed mb-4 max-w-2xl mx-auto">
            by God's great and mighty glorious grace...<br/>

            He thought of little Ol" me, by saying...
          </p>
          
          <p className="text-xl sm:text-2xl text-teal-300 font-serif italic mb-8">
            Well done my faithful "Son" to me...©
          </p>




          
          {/* Scripture Reference */}
          <div className="bg-gradient-to-br from-amber-900/30 to-teal-900/20 border border-amber-400/30 rounded-xl p-6 max-w-xl mx-auto">
            <p className="text-lg sm:text-xl font-bold text-amber-300 mb-3">2 Timothy 2</p>
            <p className="text-base sm:text-lg text-white/90 font-serif italic leading-relaxed">
              <span className="text-amber-400 font-bold not-italic">15.</span> Study to shew thyself approved unto God,<br/>
              a workman that needeth not to be ashamed,<br/>
              rightly dividing the word of truth...<span className="text-teal-300 font-bold not-italic">Amen!</span>
            </p>
          </div>
        </div>



        {/* Divider after poem */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7z"/>
          </svg>
          <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        </div>


        {/* The Four Callings */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-8">
          {callingWords.map((item, index) => (
            <React.Fragment key={item.word}>
              <span
                className={`text-3xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent transition-all duration-500 ${
                  pulseIndex === index ? 'scale-110 drop-shadow-2xl' : 'scale-100'
                }`}
                style={{
                  textShadow: pulseIndex === index ? '0 0 40px rgba(251, 191, 36, 0.5)' : 'none',
                }}
              >
                {item.word}
              </span>
              {index < callingWords.length - 1 && (
                <span className="text-2xl sm:text-4xl text-white/30 font-light">,</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Ellipsis with animation */}
        <div className="flex justify-center items-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-amber-400 to-teal-400 animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* God's Elect */}
        <div className="mb-10">
          <span className="text-2xl sm:text-4xl md:text-5xl font-serif italic text-white/90">
            God's <span className="font-black bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">Elect</span>
          </span>

          <span className="text-2xl sm:text-4xl text-amber-400 animate-pulse">...</span>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          <svg className="w-6 h-6 text-amber-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7z"/>
          </svg>
          <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        </div>

        {/* WANT - The Game Changer Section */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-amber-900/40 via-amber-800/30 to-amber-900/40 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-amber-400" />
              <span className="text-sm sm:text-base font-bold tracking-[0.4em] text-amber-300/80 uppercase">The Game-Changer</span>
              <div className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
            
            <h3 className="text-5xl sm:text-7xl md:text-8xl font-black mb-4">
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                "WANT"
              </span>
            </h3>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/80 italic font-serif mb-4">
              "Do you <span className="underline decoration-amber-400 decoration-2 underline-offset-4">Want</span> to be made whole?"
            </p>


            
            {/* Jesus Christ - The Only Way */}
            <div className="mt-6 pt-6 border-t border-amber-400/30">
              <div className="flex items-center justify-center gap-3 mb-3">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2v8H4v2h8v10h2V12h8v-2h-8V2z"/>
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black">
                <span className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                  Jesus Christ
                </span>
              </p>
              <p className="text-lg sm:text-xl md:text-2xl text-teal-300 font-semibold mt-2">
                is the <span className="underline decoration-amber-400 decoration-2 underline-offset-4">ONLY</span> way unto Heaven
              </p>
            </div>
          </div>
        </div>

        {/* Matthew 6:33 Scripture */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-teal-500/10 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-[#0f2942]/90 to-[#1a0a2e]/90 border border-teal-400/30 rounded-2xl p-6 sm:p-8">
            {/* Scripture Reference */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4v16h12V4H6zm10 14H8V6h8v12zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>
              </svg>
              <span className="text-base sm:text-lg font-bold text-teal-300 tracking-wider">Matthew 6:33</span>
              <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4v16h12V4H6zm10 14H8V6h8v12zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>
              </svg>
            </div>
            
            {/* Scripture Text */}
            <blockquote className="text-lg sm:text-xl md:text-2xl text-white/90 font-serif italic leading-relaxed">
              "But <span className="font-bold text-amber-300 not-italic">seek ye first</span> the{' '}
              <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent font-bold not-italic">
                kingdom of God
              </span>{' '}
              and his{' '}
              <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent font-bold not-italic">
                righteousness
              </span>; and <span className="text-white font-semibold not-italic">all these things</span> shall be{' '}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent font-black not-italic">
                added unto you
              </span>."
            </blockquote>
          </div>
        </div>

        {/* Second Divider */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />
          <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2v8H4v2h8v10h2V12h8v-2h-8V2z"/>
          </svg>
          <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />
        </div>

        {/* The Call to Action - WANT SUM A= TAT? */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-blue-500/10 rounded-3xl blur-xl" />
          <div className="relative bg-gradient-to-r from-[#1a0a2e]/80 via-[#0f2942]/80 to-[#1a0a2e]/80 border-2 border-amber-400/30 rounded-3xl p-6 sm:p-10">
            
            {/* Main CTA Text */}
            <p className="text-2xl sm:text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
                WANT SUM a=tat?
              </span>
            </p>
            
            {/* GO GET SUM a=tat! */}
            <p className="text-3xl sm:text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-teal-300 bg-clip-text text-transparent">
                GO GET SUM a=tat!
              </span>
            </p>

            {/* Only -U- can... */}
            <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white/80 italic">
              Only <span className="font-black text-amber-300 not-italic">-U-</span> can...©
            </p>

          </div>
        </div>

        {/* I become WE - Transformation Section */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-teal-500/15 to-amber-500/15 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-[#1a0a2e]/90 via-[#0f2942]/80 to-[#1a0a2e]/90 border-2 border-teal-400/40 rounded-3xl p-6 sm:p-10 overflow-hidden">
            
            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-amber-400/30 rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-teal-400/30 rounded-br-3xl" />
            
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-purple-400" />
              <span className="text-sm sm:text-base font-bold tracking-[0.3em] text-purple-300/80 uppercase">The Transformation</span>
              <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-purple-400" />
            </div>
            
            {/* I become WE */}
            <div className="text-center mb-6">
              <p className="text-3xl sm:text-5xl md:text-6xl font-black mb-2">
                <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">I</span>
                <span className="text-white/60 mx-2 sm:mx-4 font-light italic">become</span>
                <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-teal-300 bg-clip-text text-transparent">WE</span>
              </p>
            </div>
            
            {/* Transformation description */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-serif italic leading-relaxed text-center mb-6 max-w-3xl mx-auto">
              in the transformation of the <span className="text-white/60">old man</span> unto{' '}
              <span className="font-bold text-amber-300 not-italic">The New Creature</span>...
            </p>
            
            {/* Divider */}
            <div className="flex items-center justify-center gap-3 my-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400/50" />
              <svg className="w-4 h-4 text-amber-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7z"/>
              </svg>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400/50" />
            </div>
            
            {/* Don't just be... */}
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4">
              <span className="text-white/70">Don't just</span>{' '}
              <span className="text-white/50 italic">be</span>{' '}
              <span className="text-white/70">but rather</span>{' '}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent font-black uppercase tracking-wider">BECOME</span>
              <span className="text-amber-400">...</span>
            </p>
            
            {/* Be that man... */}
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-8">
              <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                Be that man
              </span>
              <span className="text-teal-400">...</span>
            </p>
            
            {/* WE ARE Called CHOSEN and faithful */}
            <div className="bg-gradient-to-r from-amber-900/30 via-teal-900/20 to-amber-900/30 border border-amber-400/30 rounded-2xl p-6 sm:p-8">
              <p className="text-2xl sm:text-4xl md:text-5xl font-black text-center leading-tight">
                <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-teal-300 bg-clip-text text-transparent">WE ARE</span>
              </p>
              <p className="text-xl sm:text-3xl md:text-4xl font-bold text-center mt-3">
                <span className="bg-gradient-to-r from-purple-300 via-pink-200 to-purple-300 bg-clip-text text-transparent">Called</span>
                <span className="text-white/40 mx-2">,</span>
                <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-blue-300 bg-clip-text text-transparent">CHOSEN</span>
                <span className="text-white/40 mx-2">&</span>
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">faithful</span>
              </p>
              <p className="text-2xl sm:text-4xl md:text-5xl font-black text-center mt-4">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  Sons' of The One
                </span>
                <span className="text-amber-400 animate-pulse">!!!</span>
              </p>
            </div>
            
          </div>
        </div>

        {/* Amen with Prayer Hands */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
          <div className="h-px w-12 sm:w-24 bg-gradient-to-r from-transparent to-amber-400/50" />
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-3xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent tracking-wider">
              Amen
            </span>
            <span className="text-3xl sm:text-5xl" role="img" aria-label="prayer hands">🙏</span>
          </div>
          <div className="h-px w-12 sm:w-24 bg-gradient-to-l from-transparent to-amber-400/50" />
        </div>

        {/* Decorative bottom rays */}
        <div className="mt-12 flex justify-center">
          <div className="relative">
            <div className="flex items-end justify-center gap-1">
              {[...Array(7)].map((_, i) => {
                const heights = [16, 24, 32, 40, 32, 24, 16];
                const colors = ['bg-amber-500/50', 'bg-teal-500/50', 'bg-blue-500/50', 'bg-amber-400/80', 'bg-blue-500/50', 'bg-teal-500/50', 'bg-amber-500/50'];
                return (
                  <div
                    key={i}
                    className={`w-1 sm:w-1.5 rounded-full ${colors[i]} animate-pulse`}
                    style={{
                      height: `${heights[i]}px`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

      </div>



      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0c1929] to-transparent" />
    </section>
  );
};

export default DivineCallingBanner;
