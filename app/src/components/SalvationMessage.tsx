import React, { useState } from 'react';
import { Heart, Droplets, BookOpen, ChevronRight, Sparkles, Church } from 'lucide-react';
interface SalvationMessageProps {
  onReadVerse: (reference: string) => void;
  onNavigateToBaptism?: () => void;
  onNavigateToChurches?: () => void;
}
const SalvationMessage: React.FC<SalvationMessageProps> = ({
  onReadVerse,
  onNavigateToBaptism,
  onNavigateToChurches
}) => {
  const [showPrayer, setShowPrayer] = useState(false);
  const salvationVerses = [{
    reference: 'John 3:16',
    text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'
  }, {
    reference: 'Romans 10:9-10',
    text: 'That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved. For with the heart man believeth unto righteousness; and with the mouth confession is made unto salvation.'
  }, {
    reference: 'Acts 4:12',
    text: 'Neither is there salvation in any other: for there is none other name under heaven given among men, whereby we must be saved.'
  }, {
    reference: 'Ephesians 2:8-9',
    text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.'
  }];
  return <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0c1929] via-[#1a1510] to-[#0c1929] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #F59E0B 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }} />
      </div>

      {/* Glowing Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#14B8A6]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}

        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full mb-6">
            <Heart className="w-5 h-5 text-white" />
            <span className="text-white font-medium">The Road of Salvation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white mb-4">
            The Gospel Message
            <br />
            <span className="font-bold italic text-[#F59E0B] text-glow-amber">Do You Know Jesus?</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Discover the path to eternal life through <span className="font-bold italic text-[#F59E0B]">Jesus Christ</span>, our Lord and Savior.
          </p>
        </div>



        {/* Redemption Message - Jesus Christ */}
        <div className="bg-gradient-to-br from-[#F59E0B]/25 via-[#F59E0B]/15 to-[#14B8A6]/10 rounded-3xl p-8 sm:p-12 border-2 border-[#F59E0B]/50 mb-10 relative overflow-hidden">
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/10 via-[#F59E0B]/20 to-[#14B8A6]/10 animate-pulse" style={{
          animationDuration: '3s'
        }} />
          
          <div className="text-center relative z-10">
            {/* Cross Icon */}
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-[#F59E0B] drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 2v7H4v4h7v9h2v-9h7V9h-7V2z" />
              </svg>
            </div>
            
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white leading-relaxed mb-6">
              <span className="font-bold italic text-[#F59E0B] text-glow-amber">"Jesus Christ"</span>
              <span className="text-white"> is the redemption of all Sin...</span>
            </blockquote>
            
            <p className="text-xl sm:text-2xl lg:text-3xl font-serif text-white mb-8 tracking-wide">
              <span className="font-bold italic text-[#F59E0B] text-glow-amber">He was</span>
              <span className="text-white/80"> — </span>
              <span className="font-bold italic text-[#F59E0B] text-glow-amber">He is</span>
              <span className="text-white/80"> — </span>
              <span className="text-white">and shall always be... Amen 🙏</span>
            </p>
            
            <p className="text-3xl sm:text-4xl font-serif font-bold italic text-[#F59E0B] text-glow-amber">
              Amen
            </p>
          </div>
        </div>

        {/* Great Commission Message */}
        <div className="bg-gradient-to-br from-[#14B8A6]/20 to-[#3B82F6]/10 rounded-3xl p-8 sm:p-10 border border-[#14B8A6]/30 mb-10">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-[#14B8A6] mx-auto mb-6" />
            
            <blockquote className="text-xl sm:text-2xl font-serif text-white leading-relaxed mb-6 italic">
              "Go forth teaching all who will hear and accept, 
              <span className="font-bold text-[#F59E0B] text-glow-amber"> Jesus Christ</span>, 
              as their own personal savior and baptize them in the name of 
              <span className="font-bold text-[#14B8A6] text-glow-teal"> The Father</span>, 
              <span className="font-bold text-[#3B82F6] text-glow-blue"> The Son</span>, and 
              <span className="font-bold text-[#F59E0B] text-glow-amber"> The Holy Ghost</span>..."
            </blockquote>
            
            <p className="text-3xl font-serif font-bold italic text-[#14B8A6] text-glow-teal">
              Amen
            </p>
          </div>
        </div>

        {/* Matthew 28:19-20 Reference */}
        <div className="bg-[#0c1929]/50 rounded-2xl p-6 sm:p-8 border border-[#14B8A6]/20 mb-10">
          <div className="flex items-start space-x-4">
            <BookOpen className="w-6 h-6 text-[#3B82F6] flex-shrink-0 mt-1" />
            <div>
              <p className="text-[#3B82F6] font-bold mb-2">Matthew 28:19-20 (KJV 1611)</p>
              <p className="text-white/90 font-serif italic leading-relaxed">
                "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen."
              </p>

            </div>
          </div>
        </div>

        {/* Salvation Scriptures Grid */}
        <div className="mb-10">
          <h3 className="text-xl font-serif font-bold italic text-white text-center mb-6">
            The Way of <span className="text-[#F59E0B]">Salvation</span>
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {salvationVerses.map(verse => <button key={verse.reference} onClick={() => onReadVerse(verse.reference)} className="group text-left p-5 bg-gradient-to-br from-[#0c1929]/50 to-[#14B8A6]/5 rounded-2xl border border-[#14B8A6]/20 hover:border-[#F59E0B]/50 hover:bg-[#0c1929]/70 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[#F59E0B] font-bold italic">{verse.reference}</span>
                  <BookOpen className="w-4 h-4 text-white/30 group-hover:text-[#14B8A6] transition-colors" />
                </div>
                <p className="text-white/70 text-sm leading-relaxed line-clamp-3 italic">

                  "{verse.text}"
                </p>
              </button>)}
          </div>
        </div>

        {/* Prayer of Salvation */}
        <div className="bg-gradient-to-br from-[#F59E0B]/10 via-[#14B8A6]/5 to-transparent rounded-3xl p-8 sm:p-10 border border-[#F59E0B]/20">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-serif font-bold italic text-white mb-2">
              Accept <span className="text-[#F59E0B]">Jesus Christ</span> Today
            </h3>
            <p className="text-white/70">
              If you have not yet accepted Jesus as your personal Savior, you can do so right now.
            </p>
          </div>

          {!showPrayer ? <div className="text-center">
              <button onClick={() => setShowPrayer(true)} className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#F59E0B]/30 transition-all transform hover:scale-105 glow-amber">
                <Heart className="w-5 h-5" />
                <span>I Want to Accept Jesus</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div> : <div className="space-y-6">
              <div className="bg-[#0c1929]/50 rounded-2xl p-6 border border-[#F59E0B]/30">
                <p className="text-[#F59E0B] font-bold italic mb-4">Prayer of Salvation:</p>
                <p className="text-white font-serif italic leading-relaxed">
                  "Dear Lord Jesus, I know that I am a sinner and I ask for Your forgiveness. 
                  I believe You died for my sins and rose from the dead. I turn from my sins 
                  and invite You to come into my heart and life. I want to trust and follow 
                  You as my Lord and Savior. In Jesus' name, Amen."
                </p>
              </div>

              <div className="text-center space-y-4">
                <p className="text-white/80">
                  If you prayed this prayer sincerely, welcome to the family of God!
                </p>
                <p className="text-lg font-serif text-white">
                  You are now <span className="font-bold italic text-[#F59E0B] text-glow-amber">"One "Son" of many..."©</span>
                </p>



                <p className="text-white">
                  <span className="font-bold italic text-[#14B8A6] text-glow-teal">Sons' of The One</span>
                  <br />
                  <span className="font-bold italic text-[#F59E0B] text-glow-amber">God Almighty!!!</span>
                </p>

                <div className="pt-4">
                  <p className="text-white/70 mb-4">
                    Your next steps: <span className="font-bold italic text-[#14B8A6]">Baptism</span> and finding a <span className="font-bold italic text-[#3B82F6]">Church Home</span>
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {onNavigateToBaptism && <button onClick={onNavigateToBaptism} className="inline-flex items-center space-x-2 px-6 py-3 bg-[#14B8A6]/20 border border-[#14B8A6]/50 text-[#5EEAD4] font-semibold rounded-xl hover:bg-[#14B8A6]/30 transition-all">
                        <Droplets className="w-5 h-5" />
                        <span>Learn About Baptism</span>
                      </button>}
                    {onNavigateToChurches && <button onClick={onNavigateToChurches} className="inline-flex items-center space-x-2 px-6 py-3 bg-[#3B82F6]/20 border border-[#3B82F6]/50 text-[#60A5FA] font-semibold rounded-xl hover:bg-[#3B82F6]/30 transition-all">
                        <Church className="w-5 h-5" />
                        <span>Find a Church</span>
                      </button>}
                  </div>
                </div>
              </div>
            </div>}
        </div>

        {/* Jonah 2:9 Reference */}
        <div className="mt-10 text-center">
          <p className="text-white/60 font-serif italic mb-2">
            "Salvation is from the LORD."
          </p>
          <button onClick={() => onReadVerse('Jonah 2:9')} className="text-[#14B8A6] font-bold italic hover:underline hover:text-[#5EEAD4] transition-colors">
            — Jonah 2:9
          </button>
        </div>
      </div>
    </section>;
};
export default SalvationMessage;