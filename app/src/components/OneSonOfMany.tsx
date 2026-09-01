import React, { useState } from 'react';
import { Users, Crown, Heart, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
interface OneSonOfManyProps {
  onReadVerse: (reference: string) => void;
}
const unityVerses = [{
  reference: 'Romans 8:29',
  text: 'For whom he did foreknow, he also did predestinate to be conformed to the image of his Son, that he might be the firstborn among many brethren.',
  emphasis: 'firstborn among many brethren'
}, {
  reference: 'Hebrews 2:10-11',
  text: 'For it became him, for whom are all things, and by whom are all things, in bringing many sons unto glory, to make the captain of their salvation perfect through sufferings. For both he that sanctifieth and they who are sanctified are all of one: for which cause he is not ashamed to call them brethren,',
  emphasis: 'bringing many sons unto glory'
}, {
  reference: 'Galatians 3:26-28',
  text: 'For ye are all the children of God by faith in Christ Jesus. For as many of you as have been baptized into Christ have put on Christ. There is neither Jew nor Greek, there is neither bond nor free, there is neither male nor female: for ye are all one in Christ Jesus.',
  emphasis: 'ye are all one in Christ Jesus'
}, {
  reference: '1 Corinthians 12:12-13',
  text: 'For as the body is one, and hath many members, and all the members of that one body, being many, are one body: so also is Christ. For by one Spirit are we all baptized into one body, whether we be Jews or Gentiles, whether we be bond or free; and have been all made to drink into one Spirit.',
  emphasis: 'one body... many members'
}, {
  reference: 'Ephesians 4:4-6',
  text: 'There is one body, and one Spirit, even as ye are called in one hope of your calling; One Lord, one faith, one baptism, One God and Father of all, who is above all, and through all, and in you all.',
  emphasis: 'one God and Father of all'
}, {
  reference: 'John 17:21-23',
  text: 'That they all may be one; as thou, Father, art in me, and I in thee, that they also may be one in us: that the world may believe that thou hast sent me.',
  emphasis: 'that they all may be one'
}];

// Styled phrase components with amber, blue, teal colors

const OneSonOfManyPhrase = ({
  className = ""
}: {
  className?: string;
}) => <span className={`font-bold italic text-[#F59E0B] text-glow-amber ${className}`}>
    "One "Son" of many..."<sup>©</sup>
  </span>;





const WeArePhrase = ({
  className = ""
}: {
  className?: string;
}) => <span className={`font-bold italic text-[#FCD34D] text-glow-amber ${className}`}>...WE  ARE </span>;
const SonsOfTheOnePhrase = ({
  className = ""
}: {
  className?: string;
}) => <span className={`font-bold italic text-[#14B8A6] text-glow-teal ${className}`}>
    Sons' of The One...
  </span>;
const GodAlmightyPhrase = ({
  className = ""
}: {
  className?: string;
}) => <span className={`font-bold italic text-[#F59E0B] text-glow-amber ${className}`}>
    God Almighty!!! WE ARE!!!
  </span>;





const OneSonOfMany: React.FC<OneSonOfManyProps> = ({
  onReadVerse
}) => {
  const [userName, setUserName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const handleJoin = () => {
    if (userName.trim()) {
      setHasJoined(true);
    }
  };
  return <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #F59E0B 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#F59E0B]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#14B8A6]/10 rounded-full blur-3xl animate-pulse" style={{
      animationDelay: '1s'
    }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-3xl animate-pulse" style={{
      animationDelay: '2s'
    }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#14B8A6]/20 to-[#F59E0B]/20 rounded-full mb-6 border border-[#14B8A6]/30">
            <Users className="w-5 h-5 text-[#14B8A6]" />
            <span className="text-[#14B8A6] font-medium">The Identifying Characteristic</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
            I am Robert
          </h2>

          
          <div className="max-w-3xl mx-auto">
            <p className="text-xl sm:text-2xl text-white font-serif mb-4">
              <OneSonOfManyPhrase />
            </p>
            <p className="text-lg text-white/70"><br />Jesus Christ being the firstborn among many brethren. Through Him, we are united as</p>
          </div>

        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Left: The Declaration */}
          <div className="bg-gradient-to-br from-[#F59E0B]/20 via-[#14B8A6]/10 to-[#3B82F6]/10 rounded-3xl p-8 sm:p-10 border border-[#F59E0B]/30">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center glow-amber">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-white">The Declaration</h3>
                <p className="text-white/60 text-sm">Our Identity in Christ</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Robert's Declaration */}
              <div className="bg-[#0c1929]/50 rounded-2xl p-6 border border-[#14B8A6]/20">
                <p className="text-white/80 text-lg leading-relaxed mb-2">
                  "I am <span className="text-[#F59E0B] font-bold">Robert...</span>
                </p>
                <p className="text-white text-lg leading-relaxed mb-4">
                  <OneSonOfManyPhrase />"
                </p>
                <p className="text-white/60 text-sm">
                  — A declaration of identity within the family of God
                </p>
              </div>

              {/* Join the Declaration */}
              {!hasJoined ? <div className="space-y-4">
                  <p className="text-white/80">
                    Are you one of <WeArePhrase />? 
                    Make your declaration:
                  </p>
                  <p className="text-white/80 text-lg">
                    <span className="font-bold italic text-[#FCD34D] text-glow-amber">WE ARE</span>...walk in <span className="font-bold italic text-[#FCD34D] text-glow-amber">Spirit</span> and not of the flesh... Amen 🙏
                  </p>



                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Enter your name" className="flex-1 px-4 py-3 bg-[#0c1929] border border-[#14B8A6]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all" />
                    <button onClick={handleJoin} disabled={!userName.trim()} className="px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-bold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-teal">
                      Declare
                    </button>
                  </div>
                </div> : <div className="bg-[#0c1929]/50 rounded-2xl p-6 border border-[#F59E0B]/40">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                    <span className="text-[#F59E0B] font-medium">Your Declaration</span>
                  </div>
                  <p className="text-white text-xl leading-relaxed">
                    "I am <span className="text-[#F59E0B] font-bold">{userName}</span>
                  </p>
                  <p className="text-white text-xl leading-relaxed">
                    <OneSonOfManyPhrase />"
                  </p>
                  <p className="text-white/60 text-sm mt-3">
                    Welcome to the family, {userName}.<br />
                    --<SonsOfTheOnePhrase /> <GodAlmightyPhrase />
                  </p>

                </div>}

              {/* The WE ARE Statement */}
              {/* The WE ARE Statement */}
              <div className="pt-4 border-t border-[#14B8A6]/20">
                <p className="text-2xl sm:text-3xl font-serif text-white text-center">
                  --<SonsOfTheOnePhrase /> <GodAlmightyPhrase />
                </p>
              </div>
            </div>
          </div>


          {/* Right: The Truth */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#3B82F6]/10 via-[#14B8A6]/10 to-[#F59E0B]/5 rounded-3xl p-8 border border-[#3B82F6]/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center glow-blue">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">The Truth</h3>
                  <p className="text-white/60 text-sm">
                    Unity in <span className="font-bold italic text-[#F59E0B]">Sonship</span> & <span className="font-bold italic text-[#14B8A6]">Discipleship</span>

                  </p>

                </div>
              </div>

              <div className="space-y-4 text-white/80">
                <p className="leading-relaxed">
                  Jesus Christ, the <strong className="text-[#F59E0B]">Only Begotten Son</strong>, 
                  became the <strong className="text-[#14B8A6]">Firstborn among many brethren</strong> 
                  so that we might be united with Him and with one another.
                </p>
                <p className="leading-relaxed">
                  Through baptism, we died with Christ and rose as <strong className="text-[#3B82F6]">new creations</strong>—
                  individual sons joined together as <strong className="text-[#14B8A6]">one body</strong>.
                </p>
                <p className="leading-relaxed">
                  This is the mystery: <em>"I am"</em> becomes <em><WeArePhrase /></em> 
                  without losing individual identity. Many sons, one family. Many members, one body.
                </p>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-[#F59E0B]/10 to-[#14B8A6]/10 rounded-xl border border-[#F59E0B]/20">
                <p className="text-white font-serif italic text-center">
                  "For both he that sanctifieth and they who are sanctified are all of one: 
                  for which cause he is not ashamed to call them brethren."
                </p>
                <p className="text-[#14B8A6] text-sm text-center mt-2">— Hebrews 2:11 (KJV 1611)</p>
              </div>

            </div>
          </div>
        </div>

        {/* Unity Scriptures */}
        <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#3B82F6]/10 to-[#F59E0B]/5 rounded-3xl p-8 sm:p-10 border border-[#14B8A6]/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
              Scriptures of Unity
            </h3>
            <p className="text-white/60">
              The Word of God declares our oneness in Christ
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unityVerses.map(verse => <button key={verse.reference} onClick={() => onReadVerse(verse.reference)} className="group text-left p-5 bg-[#0c1929]/50 rounded-2xl border border-[#14B8A6]/20 hover:border-[#F59E0B]/50 hover:bg-[#0c1929]/70 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[#F59E0B] font-bold">{verse.reference}</span>
                  <BookOpen className="w-4 h-4 text-white/30 group-hover:text-[#14B8A6] transition-colors" />
                </div>
                <p className="text-white/60 text-sm leading-relaxed line-clamp-3">
                  "{verse.text.substring(0, 120)}..."
                </p>
                <div className="mt-3 flex items-center text-[#14B8A6] text-sm">
                  <span className="font-medium">"{verse.emphasis}"</span>

                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>)}
          </div>
        </div>


      </div>
    </section>;
};
export default OneSonOfMany;