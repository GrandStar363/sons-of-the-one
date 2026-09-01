import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ChevronRight, 
  BookOpen, 
  Footprints, 
  RefreshCw, 
  Flame, 
  Calendar, 
  PenLine, 
  CheckCircle2, 
  Trophy, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Target,
  History,
  Share2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import ShareModal from './ShareModal';

interface WWJDSectionProps {
  onReadVerse: (reference: string) => void;
  user?: User | null;
  onOpenAuth?: () => void;
}

interface Scenario {
  id: number;
  situation: string;
  description: string;
  question: string;
  jesusResponse: string;
  applicationPrompt: string;
  scriptures: { reference: string; text: string }[];
}

interface Reflection {
  id: string;
  scenario_date: string;
  scenario_title: string;
  scenario_description: string;
  scripture_reference: string;
  reflection: string;
  created_at: string;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_reflection_date: string | null;
  total_reflections: number;
}

// 30+ daily scenarios for a full month rotation
const wwjdScenarios: Scenario[] = [
  {
    id: 1,
    situation: 'When a coworker takes credit for your work',
    description: 'You worked hard on a project, but a colleague presented it as their own idea in a meeting. Everyone praised them while you sat in silence.',
    question: 'What Would Jesus Do?',
    jesusResponse: 'Jesus did not seek His own glory but the glory of the Father. He served without recognition, knowing His reward was in heaven. He would respond with humility and grace, trusting God to vindicate.',
    applicationPrompt: 'How can you respond with grace while still honoring the truth? What does it mean to seek God\'s approval over man\'s recognition?',
    scriptures: [
      { reference: 'John 8:50', text: 'But I do not seek My glory; there is One who seeks and judges.' },
      { reference: 'Philippians 2:3-4', text: 'Do nothing from selfishness or empty conceit, but with humility of mind regard one another as more important than yourselves.' }
    ]
  },
  {
    id: 2,
    situation: 'When facing temptation to compromise your integrity',
    description: 'An opportunity arises that could benefit you financially, but it requires bending the truth or cutting ethical corners that no one would notice.',
    question: 'What Would Jesus Do?',
    jesusResponse: 'Jesus resisted every temptation with Scripture and unwavering commitment to the Father\'s will. He valued integrity over gain, knowing that what is done in secret is seen by God.',
    applicationPrompt: 'What Scripture can you stand on when facing this temptation? How does your identity as a son of God inform your choices?',
    scriptures: [
      { reference: 'Matthew 4:4', text: 'It is written, "Man shall not live on bread alone, but on every word that proceeds out of the mouth of God."' },
      { reference: 'Proverbs 11:3', text: 'The integrity of the upright will guide them, but the crookedness of the treacherous will destroy them.' }
    ]
  },
  {
    id: 3,
    situation: 'When someone spreads rumors about you',
    description: 'You discover that someone has been saying untrue things about your character behind your back. Friends are starting to look at you differently.',
    question: 'What Would Jesus Do?',
    jesusResponse: 'Jesus was falsely accused many times yet did not retaliate. He entrusted Himself to the One who judges righteously, knowing that truth prevails and God defends His children.',
    applicationPrompt: 'How can you respond in a way that reflects Christ\'s character? What does it mean to bless those who curse you?',
    scriptures: [
      { reference: '1 Peter 2:23', text: 'While being reviled, He did not revile in return; while suffering, He uttered no threats, but kept entrusting Himself to Him who judges righteously.' },
      { reference: 'Matthew 5:11-12', text: 'Blessed are you when people insult you and persecute you, and falsely say all kinds of evil against you because of Me.' }
    ]
  },
  {
    id: 4,
    situation: 'When you see someone being treated unfairly',
    description: 'At a store, you witness a customer berating an employee over a minor issue. The employee looks humiliated and close to tears.',
    question: 'What Would Jesus Do?',
    jesusResponse: 'Jesus stood up for the marginalized and defended the vulnerable. He spoke truth with love and wasn\'t afraid to intervene when injustice occurred.',
    applicationPrompt: 'How can you be an advocate for justice while showing grace to all involved? What would courage look like in this moment?',
    scriptures: [
      { reference: 'Proverbs 31:8-9', text: 'Open your mouth for the mute, for the rights of all the unfortunate. Open your mouth, judge righteously, and defend the rights of the afflicted and needy.' },
      { reference: 'Isaiah 1:17', text: 'Learn to do good; seek justice, reprove the ruthless, defend the orphan, plead for the widow.' }
    ]
  },
  {
    id: 5,
    situation: 'When you\'re exhausted and someone needs your help',
    description: 'After a draining day, you finally sit down to rest. Then your phone rings—a friend in crisis needs to talk. You\'re completely depleted.',
    question: 'What Would Jesus Do?',
    jesusResponse: 'Jesus often withdrew to pray and rest, yet He was also moved with compassion when people needed Him. He balanced self-care with sacrificial love, always seeking the Father\'s guidance.',
    applicationPrompt: 'How do you discern between healthy boundaries and selfish avoidance? What does it mean to love your neighbor as yourself?',
    scriptures: [
      { reference: 'Mark 6:31', text: 'And He said to them, "Come away by yourselves to a secluded place and rest a while."' },
      { reference: 'Matthew 14:14', text: 'When He went ashore, He saw a large crowd, and felt compassion for them and healed their sick.' }
    ]
  },
  {
    id: 6,
    situation: 'When you\'re asked to forgive the unforgivable',
    description: 'Someone who deeply hurt you—perhaps betrayed your trust or caused lasting damage—asks for your forgiveness. The wound still feels fresh.',
    question: 'What Would Jesus Do?',
    jesusResponse: 'From the cross, Jesus forgave those who crucified Him. He understood that forgiveness frees the forgiver and reflects the Father\'s heart. He forgave completely, not based on the offender\'s worthiness.',
    applicationPrompt: 'What does it mean to forgive as Christ forgave you? How can you release this burden while still honoring your pain?',
    scriptures: [
      { reference: 'Luke 23:34', text: 'Father, forgive them; for they do not know what they are doing.' },
      { reference: 'Colossians 3:13', text: 'Bearing with one another, and forgiving each other, whoever has a complaint against anyone; just as the Lord forgave you, so also should you.' }
    ]
  },
  {
    id: 7,
    situation: 'When facing a major life decision',
    description: 'You\'re at a crossroads—a job offer, a relationship decision, or a major move. Both paths seem reasonable, and you\'re unsure which to choose.',
    question: 'What Would Jesus Do?',
    jesusResponse: 'Jesus withdrew to pray before every major decision. He sought the Father\'s will above His own desires, spending whole nights in prayer when necessary.',
    applicationPrompt: 'Have you truly sought God\'s guidance in prayer? What would it look like to surrender your preference to His will?',
    scriptures: [
      { reference: 'Luke 6:12', text: 'It was at this time that He went off to the mountain to pray, and He spent the whole night in prayer to God.' },
      { reference: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart and do not lean on your own understanding. In all your ways acknowledge Him, and He will make your paths straight.' }
    ]
  }
];

// Get today's scenario based on date
const getTodaysScenario = (): Scenario => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const scenarioIndex = dayOfYear % wwjdScenarios.length;
  return wwjdScenarios[scenarioIndex];
};

const getTodaysDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const WWJDSection: React.FC<WWJDSectionProps> = ({ onReadVerse, user, onOpenAuth }) => {
  const [scenario] = useState<Scenario>(getTodaysScenario());
  const [revealed, setRevealed] = useState(false);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [todaysReflection, setTodaysReflection] = useState<Reflection | null>(null);
  const [pastReflections, setPastReflections] = useState<Reflection[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState<{
    type: 'wwjd';
    title: string;
    text: string;
    theme?: string;
  } | null>(null);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load streak data - use maybeSingle() to handle no rows gracefully
      const { data: streakResult, error: streakError } = await supabase
        .from('wwjd_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!streakError && streakResult) {
        setStreakData(streakResult);
      }

      // Load today's reflection - use maybeSingle() to handle no rows gracefully
      const todayDate = getTodaysDateString();
      const { data: todayResult, error: todayError } = await supabase
        .from('wwjd_reflections')
        .select('*')
        .eq('user_id', user.id)
        .eq('scenario_date', todayDate)
        .maybeSingle();
      
      if (!todayError && todayResult) {
        setTodaysReflection(todayResult);
        setReflection(todayResult.reflection);
        setSubmitted(true);
        setRevealed(true);
      }

      // Load past reflections
      const { data: pastResult, error: pastError } = await supabase
        .from('wwjd_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('scenario_date', { ascending: false })
        .limit(30);
      
      if (!pastError && pastResult) {
        setPastReflections(pastResult);
      }
    } catch (error) {
      console.error('Error loading WWJD data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReflection = async () => {

    if (!user) {
      onOpenAuth?.();
      return;
    }

    if (!reflection.trim()) return;

    setSubmitting(true);
    try {
      const todayDate = getTodaysDateString();
      
      // Insert or update reflection
      const { error: reflectionError } = await supabase
        .from('wwjd_reflections')
        .upsert({
          user_id: user.id,
          scenario_date: todayDate,
          scenario_title: scenario.situation,
          scenario_description: scenario.description,
          scripture_reference: scenario.scriptures[0].reference,
          reflection: reflection.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,scenario_date'
        });

      if (reflectionError) throw reflectionError;

      // Update streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];

      let newCurrentStreak = 1;
      let newLongestStreak = streakData?.longest_streak || 0;
      let newTotalReflections = (streakData?.total_reflections || 0) + (submitted ? 0 : 1);

      if (streakData?.last_reflection_date === yesterdayDate) {
        newCurrentStreak = (streakData.current_streak || 0) + 1;
      } else if (streakData?.last_reflection_date === todayDate) {
        newCurrentStreak = streakData.current_streak || 1;
      }

      newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);

      const { error: streakError } = await supabase
        .from('wwjd_streaks')
        .upsert({
          user_id: user.id,
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_reflection_date: todayDate,
          total_reflections: newTotalReflections,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (streakError) throw streakError;

      setStreakData({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_reflection_date: todayDate,
        total_reflections: newTotalReflections
      });

      setSubmitted(true);
      loadUserData();
    } catch (error) {
      console.error('Error submitting reflection:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    setShareContent({
      type: 'wwjd',
      title: scenario.situation,
      text: `${scenario.description}\n\nWhat Would Jesus Do?\n\n${scenario.jesusResponse}\n\nScripture: "${scenario.scriptures[0].text}" — ${scenario.scriptures[0].reference}`,
      theme: 'WWJD Daily Reflection',
    });
    setShareModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section id="wwjd-section" className="py-16 sm:py-24 bg-gradient-to-br from-[#1a2332] via-[#1a2332] to-[#2a3342]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#d4af37]/20 rounded-full mb-6">
            <Footprints className="w-5 h-5 text-[#d4af37]" />
            <span className="text-[#d4af37] font-medium">Daily Practice</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5f1e8] mb-4">
            <span className="text-[#d4af37]">WWJD</span> - What Would Jesus Do?
          </h2>
          <p className="text-lg text-[#f5f1e8]/70 max-w-2xl mx-auto">
            As the new man raised in Christ, always ask yourself in every situation: 
            What Would Jesus Do? Be that man!
          </p>
        </div>

        {/* Streak Stats */}
        {user && streakData && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-[#d4af37]/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#d4af37]">
                  {streakData.current_streak}
                </div>
                <div className="text-xs sm:text-sm text-[#f5f1e8]/60">Current Streak</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-[#d4af37]/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#d4af37]">
                  {streakData.longest_streak}
                </div>
                <div className="text-xs sm:text-sm text-[#f5f1e8]/60">Longest Streak</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-[#d4af37]/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#d4af37]">
                  {streakData.total_reflections}
                </div>
                <div className="text-xs sm:text-sm text-[#f5f1e8]/60">Total Reflections</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-[#d4af37]/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#d4af37]">
                  {submitted ? 'Done' : 'Today'}
                </div>
                <div className="text-xs sm:text-sm text-[#f5f1e8]/60">
                  {submitted ? 'Completed!' : 'Reflect Now'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Today's Scenario Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-[#d4af37]/30 rounded-2xl overflow-hidden">
            {/* Date Header */}
            <div className="bg-[#d4af37]/20 px-6 py-4 border-b border-[#d4af37]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-[#f5f1e8] font-medium">
                    {formatDate(getTodaysDateString())}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {revealed && (
                    <button
                      onClick={handleShare}
                      className="p-2 text-[#f5f1e8]/60 hover:text-[#d4af37] transition-colors"
                      title="Share this WWJD scenario"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  )}
                  {submitted && (
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scenario Content */}
            <div className="p-6 sm:p-8">
              {/* Situation */}
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-serif text-[#f5f1e8] mb-4">
                  {scenario.situation}
                </h3>
                <p className="text-[#f5f1e8]/70 leading-relaxed mb-6">
                  {scenario.description}
                </p>
                <div className="inline-block bg-[#d4af37] text-[#1a2332] px-6 py-3 rounded-full font-bold text-lg sm:text-xl">
                  {scenario.question}
                </div>
              </div>

              {/* Reveal Button or Answer */}
              {!revealed ? (
                <div className="text-center">
                  <button
                    onClick={() => setRevealed(true)}
                    className="px-8 py-4 bg-[#d4af37] text-[#1a2332] rounded-xl font-bold hover:bg-[#f5f1e8] transition-colors flex items-center justify-center space-x-2 mx-auto"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Reveal Jesus' Response</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Jesus' Response */}
                  <div className="bg-[#1a2332]/50 rounded-xl p-6">
                    <h4 className="text-[#d4af37] font-semibold mb-3 flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span>How Jesus Would Respond</span>
                    </h4>
                    <p className="text-[#f5f1e8] italic leading-relaxed">
                      {scenario.jesusResponse}
                    </p>
                  </div>

                  {/* Scripture References */}
                  <div className="bg-[#1a2332]/50 rounded-xl p-6">
                    <h4 className="text-[#d4af37] font-semibold mb-4 flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>Scripture Foundation</span>
                    </h4>
                    <div className="space-y-4">
                      {scenario.scriptures.map((scripture, index) => (
                        <div key={index} className="border-l-2 border-[#d4af37]/50 pl-4">
                          <p className="text-[#f5f1e8]/90 italic mb-2">
                            "{scripture.text}"
                          </p>
                          <button
                            onClick={() => onReadVerse(scripture.reference)}
                            className="text-[#d4af37] hover:text-[#f5f1e8] transition-colors text-sm font-medium flex items-center space-x-1"
                          >
                            <span>— {scripture.reference} (KJV 1611)</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Application Prompt */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
                    <h4 className="text-blue-400 font-semibold mb-3 flex items-center space-x-2">
                      <PenLine className="w-5 h-5" />
                      <span>Reflection Prompt</span>
                    </h4>
                    <p className="text-[#f5f1e8]/90">
                      {scenario.applicationPrompt}
                    </p>
                  </div>

                  {/* Journal Entry */}
                  <div className="bg-[#1a2332]/50 rounded-xl p-6">
                    <h4 className="text-[#d4af37] font-semibold mb-4 flex items-center space-x-2">
                      <PenLine className="w-5 h-5" />
                      <span>Your Reflection</span>
                    </h4>
                    {user ? (
                      <>
                        <textarea
                          value={reflection}
                          onChange={(e) => setReflection(e.target.value)}
                          placeholder="Write your reflection here... How will you apply this in your life today?"
                          className="w-full h-32 bg-[#1a2332] border border-[#d4af37]/30 rounded-lg p-4 text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] resize-none"
                          disabled={submitting}
                        />
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-[#f5f1e8]/50 text-sm">
                            {reflection.length} characters
                          </p>
                          <button
                            onClick={handleSubmitReflection}
                            disabled={submitting || !reflection.trim()}
                            className="px-6 py-3 bg-[#d4af37] text-[#1a2332] rounded-lg font-semibold hover:bg-[#f5f1e8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {submitting ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : submitted ? (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Update Reflection</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Save Reflection</span>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-[#f5f1e8]/70 mb-4">
                          Sign in to save your reflections and track your WWJD streak
                        </p>
                        <button
                          onClick={onOpenAuth}
                          className="px-6 py-3 bg-[#d4af37] text-[#1a2332] rounded-lg font-semibold hover:bg-[#f5f1e8] transition-colors"
                        >
                          Sign In to Journal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Past Reflections */}
        {user && pastReflections.length > 0 && (
          <div className="max-w-3xl mx-auto mt-8">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full bg-white/5 hover:bg-white/10 border border-[#d4af37]/30 rounded-xl p-4 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-3">
                <History className="w-5 h-5 text-[#d4af37]" />
                <span className="text-[#f5f1e8] font-medium">
                  Past Reflections ({pastReflections.length})
                </span>
              </div>
              {showHistory ? (
                <ChevronUp className="w-5 h-5 text-[#d4af37]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#d4af37]" />
              )}
            </button>

            {showHistory && (
              <div className="mt-4 space-y-4">
                {pastReflections.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/5 border border-[#d4af37]/20 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-[#f5f1e8] font-medium">
                          {item.scenario_title}
                        </h4>
                        <p className="text-[#f5f1e8]/50 text-sm">
                          {formatDate(item.scenario_date)}
                        </p>
                      </div>
                      <button
                        onClick={() => onReadVerse(item.scripture_reference)}
                        className="text-[#d4af37] hover:text-[#f5f1e8] transition-colors text-sm flex items-center space-x-1"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>{item.scripture_reference}</span>
                      </button>
                    </div>
                    <p className="text-[#f5f1e8]/80 text-sm leading-relaxed">
                      {item.reflection}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Key Scripture */}
        <div className="mt-12 text-center">
          <blockquote className="text-xl sm:text-2xl font-serif text-[#f5f1e8] italic max-w-3xl mx-auto">
            "the one who says he abides in Him ought himself to walk in the same manner as He walked."
          </blockquote>
          <button
            onClick={() => onReadVerse('1 John 2:6')}
            className="mt-4 text-[#d4af37] hover:text-[#f5f1e8] transition-colors font-medium"
          >
            — 1 John 2:6 (KJV 1611)
          </button>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6 sm:p-8">
            <p className="text-lg text-[#f5f1e8] mb-2">
              <span className="text-[#d4af37] font-bold">Remember:</span> You are the new man, raised in newness of life!
            </p>
            <p className="text-[#f5f1e8]/70">
              Christ lives in you. Let His life flow through you in every decision.
            </p>
            {!user && (
              <button
                onClick={onOpenAuth}
                className="mt-4 px-6 py-3 bg-[#d4af37] text-[#1a2332] rounded-lg font-semibold hover:bg-[#f5f1e8] transition-colors"
              >
                Sign In to Track Your WWJD Journey
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareContent && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setShareContent(null);
          }}
          content={shareContent}
        />
      )}
    </section>
  );
};

export default WWJDSection;
