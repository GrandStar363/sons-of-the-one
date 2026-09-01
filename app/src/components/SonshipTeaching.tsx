import React, { useState } from 'react';
import { Crown, ChevronRight, ChevronDown, BookOpen, Heart, Users, Sparkles, Shield, Gift } from 'lucide-react';

interface SonshipTeachingProps {
  onReadVerse: (reference: string) => void;
}

const teachings = [
  {
    id: 'baptism-new-life',
    title: 'Baptism: The Change That Transforms',
    subtitle: 'Raised to Walk in Newness of Life',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    content: `"Want equals change... Salvation IS that change!" Through baptism, we are buried with Christ and raised to walk in newness of life. The old man is crucified, and the new man emerges—born of water and Spirit.

Romans 6:3-4 declares: "Or do you not know that all of us who have been baptized into Christ Jesus have been baptized into His death? Therefore we have been buried with Him through baptism into death, so that as Christ was raised from the dead through the glory of the Father, so we too might walk in newness of life."

This is not mere ritual—it is spiritual transformation:
• The old self is buried with Christ
• We rise as new creations
• Sin's power is broken
• We walk in resurrection life

BE THAT MAN... the one raised in Christ, walking in newness of life!`,
    keyVerses: [
      { reference: 'Romans 6:3-4', text: '...buried with Him through baptism into death, so that as Christ was raised from the dead...so we too might walk in newness of life.' },
      { reference: 'Romans 6:6', text: 'knowing this, that our old self was crucified with Him, in order that our body of sin might be done away with...' },
      { reference: 'Colossians 2:12', text: 'having been buried with Him in baptism, in which you were also raised up with Him through faith...' },
      { reference: '2 Corinthians 5:17', text: 'Therefore if anyone is in Christ, he is a new creature; the old things passed away; behold, new things have come.' },
    ],
  },
  {
    id: 'wwjd',
    title: 'WWJD - What Would Jesus Do?',
    subtitle: 'Walking as He Walked',
    icon: Heart,
    color: 'from-rose-500 to-pink-500',
    content: `As sons of God raised to new life, we are called to walk as Jesus walked. In every situation, every decision, every moment—ask yourself: "What Would Jesus Do?"

1 John 2:6 instructs us: "the one who says he abides in Him ought himself to walk in the same manner as He walked."

This is the daily practice of sonship:
• In temptation - WWJD?
• In conflict - WWJD?
• In opportunity to serve - WWJD?
• In moments of fear - WWJD?
• In times of blessing - WWJD?

Christ lives IN you (Galatians 2:20). Let His life flow through you. Be that man—the one who reflects the Father in all things.`,
    keyVerses: [
      { reference: '1 John 2:6', text: 'the one who says he abides in Him ought himself to walk in the same manner as He walked.' },
      { reference: 'John 13:15', text: 'For I gave you an example that you also should do as I did to you.' },
      { reference: 'Philippians 2:5', text: 'Have this attitude in yourselves which was also in Christ Jesus.' },
      { reference: '1 Peter 2:21', text: 'For you have been called for this purpose, since Christ also suffered for you, leaving you an example for you to follow in His steps.' },
    ],
  },
  {
    id: 'firstborn',
    title: 'Jesus Christ - The Only Begotten Son',
    subtitle: 'The Firstborn Among Many Brethren',
    icon: Crown,
    color: 'from-[#d4af37] to-[#b8962e]',
    content: `Jesus Christ holds a unique position as the "only begotten Son" of God (John 3:16). This term speaks to His eternal relationship with the Father - He is God of God, Light of Light, true God of true God. Yet in His incarnation and resurrection, He became "the firstborn among many brethren" (Romans 8:29).

This means that while Jesus is uniquely the Son of God by nature, through His redemptive work, He has made it possible for us to become sons of God by adoption and grace. He is the pattern, the prototype, the elder brother who leads the way.`,
    keyVerses: [
      { reference: 'John 3:16', text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
      { reference: 'Romans 8:29', text: 'For whom he did foreknow, he also did predestinate to be conformed to the image of his Son, that he might be the firstborn among many brethren.' },
      { reference: 'Colossians 1:15', text: 'Who is the image of the invisible God, the firstborn of every creature:' },
      { reference: 'Hebrews 1:6', text: 'And again, when he bringeth in the firstbegotten into the world, he saith, And let all the angels of God worship him.' },
    ],

  },
  {
    id: 'led-by-spirit',
    title: 'Led by the Spirit of God',
    subtitle: 'The Mark of True Sonship',
    icon: Sparkles,
    color: 'from-blue-500 to-blue-600',
    content: `Romans 8:14 declares a profound truth: "For all who are being led by the Spirit of God, these are sons of God." This is not merely a theological statement but a practical reality for every believer.

Being led by the Spirit means:
• Walking in step with God's guidance
• Allowing the Spirit to direct our decisions
• Living by the Spirit's power, not our own strength
• Bearing the fruit of the Spirit in our character

This leading is the evidence of our sonship - not our perfection, but our responsiveness to God's Spirit.`,
    keyVerses: [
      { reference: 'Romans 8:14', text: 'For all who are being led by the Spirit of God, these are sons of God.' },
      { reference: 'Galatians 5:18', text: 'But if you are led by the Spirit, you are not under the Law.' },
      { reference: 'Galatians 5:25', text: 'If we live by the Spirit, let us also walk by the Spirit.' },
    ],
  },
  {
    id: 'adoption',
    title: 'The Spirit of Adoption',
    subtitle: 'From Slaves to Sons',
    icon: Heart,
    color: 'from-rose-500 to-rose-600',
    content: `We have not received a spirit of slavery leading to fear, but a spirit of adoption as sons by which we cry out, "Abba! Father!" (Romans 8:15). This intimate cry - "Abba" - was the word Jesus Himself used when addressing His Father.

Through adoption, we receive:
• A new identity as children of God
• Full legal rights as heirs
• Intimate access to the Father
• The family name and inheritance

This adoption is not second-class sonship. In Roman law, an adopted son had the same rights as a natural-born son. We are fully sons, fully heirs, fully loved.`,
    keyVerses: [
      { reference: 'Romans 8:15', text: 'For you have not received a spirit of slavery leading to fear again, but you have received a spirit of adoption as sons by which we cry out, "Abba! Father!"' },
      { reference: 'Galatians 4:5-6', text: '...so that He might redeem those who were under the Law, that we might receive the adoption as sons.' },
      { reference: 'Ephesians 1:5', text: 'He predestined us to adoption as sons through Jesus Christ to Himself...' },
    ],
  },
  {
    id: 'heirs',
    title: 'Heirs of God',
    subtitle: 'Fellow Heirs with Christ',
    icon: Gift,
    color: 'from-purple-500 to-purple-600',
    content: `If we are children, then we are heirs—heirs of God and fellow heirs with Christ (Romans 8:17). Consider the magnitude of this truth: everything that belongs to Christ by right belongs to us by grace.

Our inheritance includes:
• Eternal life
• The kingdom of God
• Glory with Christ
• All spiritual blessings
• The fullness of God's promises

This inheritance is not earned but received. It is not temporary but eternal. It is not partial but complete.`,
    keyVerses: [
      { reference: 'Romans 8:17', text: '...and if children, heirs also, heirs of God and fellow heirs with Christ...' },
      { reference: 'Galatians 3:29', text: 'And if you belong to Christ, then you are Abraham\'s descendants, heirs according to promise.' },
      { reference: 'Titus 3:7', text: '...so that being justified by His grace we would be made heirs according to the hope of eternal life.' },
    ],
  },
  {
    id: 'we-are',
    title: 'WE ARE... Sons of God',
    subtitle: 'Our Collective Identity in Christ',
    icon: Users,
    color: 'from-emerald-500 to-emerald-600',
    content: `This is not pride but proclamation. This is not boasting but believing. When we declare our identity as sons of God, we are simply agreeing with what God has already declared about us.

1 John 3:1 exclaims: "See how great a love the Father has bestowed on us, that we would be called children of God; and such we are."

Notice: "and such we ARE." Not "such we hope to be" or "such we might become." WE ARE children of God—right now, in this moment, by faith in Christ Jesus.

Together, as the family of God, we stand united in this glorious identity.`,

    keyVerses: [
      { reference: '1 John 3:1', text: 'See how great a love the Father has bestowed on us, that we would be called children of God; and such we are.' },
      { reference: 'Galatians 3:26', text: 'For you are all sons of God through faith in Christ Jesus.' },
      { reference: 'John 1:12', text: 'But as many as received Him, to them He gave the right to become children of God...' },
    ],
  },

  {

    id: 'glory',
    title: 'Many Sons to Glory',
    subtitle: 'God\'s Ultimate Purpose',
    icon: Shield,
    color: 'from-amber-500 to-amber-600',
    content: `Hebrews 2:10 reveals God's magnificent purpose: "For it was fitting for Him, for whom are all things, and through whom are all things, in bringing many sons to glory, to perfect the author of their salvation through sufferings."

God's plan from eternity has been to have a family—many sons brought to glory. Jesus, the author of our salvation, went through suffering to open the way. Now He leads us, His brothers and sisters, into the same glory He shares with the Father.

The creation itself waits eagerly for the revealing of the sons of God (Romans 8:19). Our glorification is not just for us—it's for the redemption of all creation.

I am Robert
One "Son" of many... I am but WE ARE!!!`,

    keyVerses: [
      { reference: 'Hebrews 2:10', text: 'For it was fitting for Him...in bringing many sons to glory...' },
      { reference: 'Romans 8:19', text: 'For the anxious longing of the creation waits eagerly for the revealing of the sons of God.' },
      { reference: 'Romans 8:30', text: '...and these whom He justified, He also glorified.' },
    ],
  },
];




const SonshipTeaching: React.FC<SonshipTeachingProps> = ({ onReadVerse }) => {
  const [expandedTeaching, setExpandedTeaching] = useState<string | null>('baptism-new-life');


  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#f5f1e8] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1a2332] rounded-full mb-6">
            <Crown className="w-5 h-5 text-[#d4af37]" />
            <span className="text-[#d4af37] font-medium">Core Teaching</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1a2332] mb-4">
            Understanding Our Identity as
            <br />
            <span className="text-[#d4af37]">Sons of God</span>
          </h2>
          <p className="text-lg text-[#1a2332]/70 max-w-2xl mx-auto">
            Explore the profound biblical truth of our adoption and inheritance in Christ Jesus, 
            the firstborn among many brethren.
          </p>
        </div>

        {/* Teaching Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {teachings.map((teaching) => {
            const isExpanded = expandedTeaching === teaching.id;
            const IconComponent = teaching.icon;

            return (
              <div
                key={teaching.id}
                className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  isExpanded ? 'border-[#d4af37] shadow-lg' : 'border-[#d4af37]/20 hover:border-[#d4af37]/40'
                }`}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedTeaching(isExpanded ? null : teaching.id)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${teaching.color} flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1a2332]">
                        {teaching.title}
                      </h3>
                      <p className="text-sm text-[#1a2332]/60">{teaching.subtitle}</p>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-[#d4af37]/20' : 'bg-[#1a2332]/5'}`}>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[#d4af37]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#1a2332]/40" />
                    )}
                  </div>
                </button>

                {/* Content */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 border-t border-[#d4af37]/20">
                    <div className="pt-6 prose prose-lg max-w-none">
                      {teaching.content.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="text-[#1a2332]/80 leading-relaxed mb-4 whitespace-pre-line">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {/* Key Verses */}
                    <div className="mt-6 bg-[#f5f1e8] rounded-xl p-4 sm:p-6">
                      <h4 className="text-sm font-semibold text-[#1a2332] uppercase tracking-wider mb-4">
                        Key Scriptures
                      </h4>
                      <div className="space-y-3">
                        {teaching.keyVerses.map((verse) => (
                          <button
                            key={verse.reference}
                            onClick={() => onReadVerse(verse.reference)}
                            className="w-full text-left p-3 bg-white rounded-lg hover:bg-[#d4af37]/10 transition-colors group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <span className="text-[#d4af37] font-semibold">{verse.reference}</span>
                                <p className="text-sm text-[#1a2332]/70 mt-1 italic">"{verse.text}"</p>
                              </div>
                              <BookOpen className="w-4 h-4 text-[#1a2332]/30 group-hover:text-[#d4af37] transition-colors ml-3 flex-shrink-0 mt-1" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-[#1a2332] rounded-2xl p-8 sm:p-10 max-w-2xl">
            <p className="text-[#f5f1e8]/70 mb-2">
              I am Robert
            </p>
            <p className="text-[#f5f1e8] mb-4">
              <span className="font-bold italic text-[#c9a227] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">"One "Son" of many..."©</span>
            </p>
            <p className="text-xl font-serif mb-6">
              "I am but <span className="font-bold italic text-[#c9a227] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">WE ARE</span>"
            </p>
            <p className="text-[#f5f1e8]/60 text-sm">
              Are you one of <span className="font-bold italic text-[#c9a227]">WE</span>? Through baptism, the old man dies and the new man rises.
            </p>
            <p className="text-sm mt-2">
              <span className="text-[#FFD700] font-bold">BE THAT MAN...</span> always asking <span className="text-[#FFD700] font-bold">WWJD</span>?
            </p>


          </div>
        </div>

      </div>
    </section>
  );
};

export default SonshipTeaching;
