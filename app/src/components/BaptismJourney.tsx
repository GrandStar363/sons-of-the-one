import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Heart,
  Target,
  Award,
  PenLine,
  Save,
  RefreshCw,
  Lock,
  ArrowRight,
  Star,
  Users,
  Flame
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface BaptismJourneyProps {
  user: User | null;
  onOpenAuth: () => void;
  onReadVerse: (reference: string) => void;
}

interface StudyLesson {
  id: string;
  title: string;
  description: string;
  scriptures: { reference: string; text: string }[];
  reflection: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  scripture: string;
}

interface BaptismData {
  baptism_date: string | null;
  baptism_status: 'preparing' | 'scheduled' | 'baptized';
  testimony: string;
  old_man_description: string;
  new_man_description: string;
}

interface StudyProgress {
  [lessonId: string]: { completed: boolean; notes: string };
}

interface MilestoneProgress {
  [milestoneId: string]: { completed: boolean; reflection: string };
}

const studyLessons: StudyLesson[] = [
  {
    id: 'lesson-1',
    title: 'The Meaning of Baptism',
    description: 'Understanding baptism as death, burial, and resurrection with Christ',
    scriptures: [
      { reference: 'Romans 6:3-4', text: 'Or do you not know that all of us who have been baptized into Christ Jesus have been baptized into His death? Therefore we have been buried with Him through baptism into death, so that as Christ was raised from the dead through the glory of the Father, so we too might walk in newness of life.' },
      { reference: 'Colossians 2:12', text: 'Having been buried with Him in baptism, in which you were also raised up with Him through faith in the working of God, who raised Him from the dead.' }
    ],
    reflection: 'What does it mean to you to be "buried with Christ" and "raised to walk in newness of life"?'
  },
  {
    id: 'lesson-2',
    title: 'Repentance Before Baptism',
    description: 'The heart change that precedes the outward act',
    scriptures: [
      { reference: 'Acts 2:38', text: 'Then Peter said unto them, Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive the gift of the Holy Ghost.' },
      { reference: 'Acts 3:19', text: 'Repent ye therefore, and be converted, that your sins may be blotted out, when the times of refreshing shall come from the presence of the Lord.' }

    ],
    reflection: 'What areas of your life is God calling you to turn away from?'
  },
  {
    id: 'lesson-3',
    title: 'Faith and Confession',
    description: 'Believing in your heart and confessing with your mouth',
    scriptures: [
      { reference: 'Romans 10:9-10', text: 'That if you confess with your mouth Jesus as Lord, and believe in your heart that God raised Him from the dead, you will be saved; for with the heart a person believes, resulting in righteousness, and with the mouth he confesses, resulting in salvation.' },
      { reference: 'Acts 8:36-38', text: 'As they went along the road they came to some water; and the eunuch said, "Look! Water! What prevents me from being baptized?" And Philip said, "If you believe with all your heart, you may." And he answered and said, "I believe that Jesus Christ is the Son of God."' }
    ],
    reflection: 'How would you express your faith in Jesus Christ in your own words?'
  },
  {
    id: 'lesson-4',
    title: 'Putting Off the Old Man',
    description: 'Leaving behind the old self and its practices',
    scriptures: [
      { reference: 'Ephesians 4:22-24', text: 'That, in reference to your former manner of life, you lay aside the old self, which is being corrupted in accordance with the lusts of deceit, and that you be renewed in the spirit of your mind, and put on the new self, which in the likeness of God has been created in righteousness and holiness of the truth.' },
      { reference: 'Colossians 3:9-10', text: 'Do not lie to one another, since you laid aside the old self with its evil practices, and have put on the new self who is being renewed to a true knowledge according to the image of the One who created him.' }
    ],
    reflection: 'What characteristics of your "old man" do you want to leave behind in the waters of baptism?'
  },
  {
    id: 'lesson-5',
    title: 'Becoming a Son of God',
    description: 'Your new identity as a child of God through faith',
    scriptures: [
      { reference: 'Galatians 3:26-27', text: 'For you are all sons of God through faith in Christ Jesus. For all of you who were baptized into Christ have clothed yourselves with Christ.' },
      { reference: 'Romans 8:14-16', text: 'For all who are being led by the Spirit of God, these are sons of God. For you have not received a spirit of slavery leading to fear again, but you have received a spirit of adoption as sons by which we cry out, "Abba! Father!" The Spirit Himself testifies with our spirit that we are children of God.' }
    ],
    reflection: 'What does it mean to you to be called a "son of God"?'
  },
  {
    id: 'lesson-6',
    title: 'Walking in Newness of Life',
    description: 'Living as a new creation in Christ',
    scriptures: [
      { reference: '2 Corinthians 5:17', text: 'Therefore if anyone is in Christ, he is a new creature; the old things passed away; behold, new things have come.' },
      { reference: 'Galatians 2:20', text: 'I have been crucified with Christ; and it is no longer I who live, but Christ lives in me; and the life which I now live in the flesh I live by faith in the Son of God, who loved me and gave Himself up for me.' }
    ],
    reflection: 'How do you envision your life being different after baptism?'
  }
];

const postBaptismMilestones: Milestone[] = [
  {
    id: 'milestone-1',
    title: 'First Week of New Life',
    description: 'Celebrate your first week walking as a new creation in Christ',
    icon: Sparkles,
    scripture: '2 Corinthians 5:17'
  },
  {
    id: 'milestone-2',
    title: 'Daily Prayer Habit',
    description: 'Establish a consistent daily conversation with your Father',
    icon: Heart,
    scripture: '1 Thessalonians 5:17'
  },
  {
    id: 'milestone-3',
    title: 'Scripture Reading Plan',
    description: 'Begin reading God\'s Word daily to know Him more',
    icon: BookOpen,
    scripture: 'Psalm 119:105'
  },
  {
    id: 'milestone-4',
    title: 'Share Your Testimony',
    description: 'Tell someone about your transformation in Christ',
    icon: Users,
    scripture: 'Mark 5:19'
  },
  {
    id: 'milestone-5',
    title: 'Join a Fellowship',
    description: 'Connect with other believers for encouragement and growth',
    icon: Users,
    scripture: 'Hebrews 10:24-25'
  },
  {
    id: 'milestone-6',
    title: 'First Month Anniversary',
    description: 'Reflect on one month of walking in your new identity',
    icon: Calendar,
    scripture: 'Philippians 1:6'
  },
  {
    id: 'milestone-7',
    title: 'Serve Others',
    description: 'Use your gifts to serve in the body of Christ',
    icon: Target,
    scripture: '1 Peter 4:10'
  },
  {
    id: 'milestone-8',
    title: 'Lead Someone to Christ',
    description: 'Share the gospel and help someone else begin their journey',
    icon: Flame,
    scripture: 'Matthew 28:19-20'
  },
  {
    id: 'milestone-9',
    title: 'One Year Anniversary',
    description: 'Celebrate a full year of transformation and growth',
    icon: Award,
    scripture: 'Philippians 3:14'
  }
];

const BaptismJourney: React.FC<BaptismJourneyProps> = ({ user, onOpenAuth, onReadVerse }) => {
  const [activeTab, setActiveTab] = useState<'study' | 'journey' | 'milestones'>('study');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Baptism data
  const [baptismData, setBaptismData] = useState<BaptismData>({
    baptism_date: null,
    baptism_status: 'preparing',
    testimony: '',
    old_man_description: '',
    new_man_description: ''
  });
  
  // Study progress
  const [studyProgress, setStudyProgress] = useState<StudyProgress>({});
  const [lessonNotes, setLessonNotes] = useState<{ [key: string]: string }>({});
  
  // Milestone progress
  const [milestoneProgress, setMilestoneProgress] = useState<MilestoneProgress>({});
  const [milestoneReflections, setMilestoneReflections] = useState<{ [key: string]: string }>({});

  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Load baptism journey data
      const { data: journeyData } = await supabase
        .from('baptism_journeys')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (journeyData) {
        setBaptismData({
          baptism_date: journeyData.baptism_date,
          baptism_status: journeyData.baptism_status,
          testimony: journeyData.testimony || '',
          old_man_description: journeyData.old_man_description || '',
          new_man_description: journeyData.new_man_description || ''
        });
      }
      
      // Load study progress
      const { data: studyData } = await supabase
        .from('baptism_study_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (studyData) {
        const progress: StudyProgress = {};
        const notes: { [key: string]: string } = {};
        studyData.forEach(item => {
          progress[item.lesson_id] = { completed: item.completed, notes: item.notes || '' };
          notes[item.lesson_id] = item.notes || '';
        });
        setStudyProgress(progress);
        setLessonNotes(notes);
      }
      
      // Load milestones
      const { data: milestoneData } = await supabase
        .from('baptism_milestones')
        .select('*')
        .eq('user_id', user.id);
      
      if (milestoneData) {
        const progress: MilestoneProgress = {};
        const reflections: { [key: string]: string } = {};
        milestoneData.forEach(item => {
          progress[item.milestone_id] = { completed: item.completed, reflection: item.reflection || '' };
          reflections[item.milestone_id] = item.reflection || '';
        });
        setMilestoneProgress(progress);
        setMilestoneReflections(reflections);
      }
    } catch (error) {
      console.error('Error loading baptism data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBaptismData = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('baptism_journeys')
        .upsert({
          user_id: user.id,
          baptism_date: baptismData.baptism_date,
          baptism_status: baptismData.baptism_status,
          testimony: baptismData.testimony,
          old_man_description: baptismData.old_man_description,
          new_man_description: baptismData.new_man_description,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving baptism data:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleLessonComplete = async (lessonId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    
    const currentStatus = studyProgress[lessonId]?.completed || false;
    const newProgress = {
      ...studyProgress,
      [lessonId]: { completed: !currentStatus, notes: lessonNotes[lessonId] || '' }
    };
    setStudyProgress(newProgress);
    
    try {
      await supabase
        .from('baptism_study_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: !currentStatus,
          notes: lessonNotes[lessonId] || '',
          completed_at: !currentStatus ? new Date().toISOString() : null
        }, { onConflict: 'user_id,lesson_id' });
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  };

  const saveLessonNotes = async (lessonId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('baptism_study_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: studyProgress[lessonId]?.completed || false,
          notes: lessonNotes[lessonId] || ''
        }, { onConflict: 'user_id,lesson_id' });
    } catch (error) {
      console.error('Error saving lesson notes:', error);
    }
  };

  const toggleMilestoneComplete = async (milestoneId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    
    const currentStatus = milestoneProgress[milestoneId]?.completed || false;
    const newProgress = {
      ...milestoneProgress,
      [milestoneId]: { completed: !currentStatus, reflection: milestoneReflections[milestoneId] || '' }
    };
    setMilestoneProgress(newProgress);
    
    try {
      await supabase
        .from('baptism_milestones')
        .upsert({
          user_id: user.id,
          milestone_id: milestoneId,
          completed: !currentStatus,
          reflection: milestoneReflections[milestoneId] || '',
          completed_at: !currentStatus ? new Date().toISOString() : null
        }, { onConflict: 'user_id,milestone_id' });
    } catch (error) {
      console.error('Error saving milestone:', error);
    }
  };

  const saveMilestoneReflection = async (milestoneId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('baptism_milestones')
        .upsert({
          user_id: user.id,
          milestone_id: milestoneId,
          completed: milestoneProgress[milestoneId]?.completed || false,
          reflection: milestoneReflections[milestoneId] || ''
        }, { onConflict: 'user_id,milestone_id' });
    } catch (error) {
      console.error('Error saving milestone reflection:', error);
    }
  };

  const completedLessons = Object.values(studyProgress).filter(p => p.completed).length;
  const completedMilestones = Object.values(milestoneProgress).filter(p => p.completed).length;
  const studyProgressPercent = Math.round((completedLessons / studyLessons.length) * 100);

  const getDaysUntilBaptism = () => {
    if (!baptismData.baptism_date) return null;
    const baptismDate = new Date(baptismData.baptism_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    baptismDate.setHours(0, 0, 0, 0);
    const diffTime = baptismDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysSinceBaptism = () => {
    if (!baptismData.baptism_date) return null;
    const baptismDate = new Date(baptismData.baptism_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    baptismDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - baptismDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilBaptism();
  const daysSince = getDaysSinceBaptism();

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-[#1a2332] to-[#243044]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 mb-4">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5f1e8] mb-3">
            Baptism Journey
          </h2>
          <p className="text-xl font-semibold mb-2">
            <span className="text-cyan-400">"The Change </span>
            <span className="text-[#d4af37] font-bold">That</span>


            <span className="text-cyan-400"> Transforms"</span>
          </p>

          <p className="text-lg font-medium mb-3">
            <span className="text-cyan-400">Want equals change... Salvation </span>
            <span className="text-[#d4af37] font-bold">"IS"</span>
            <span className="text-cyan-400"> that change!</span>
          </p>
          <p className="text-[#f5f1e8]/70 max-w-2xl mx-auto">
            Prepare for or celebrate your baptism — the powerful act of dying to your old self 
            and rising as a new creation in Christ Jesus.
          </p>
        </div>

        {!user && (

          <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-6 mb-8 text-center">
            <Lock className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#f5f1e8] mb-2">
              Sign In to Track Your Journey
            </h3>
            <p className="text-[#f5f1e8]/70 mb-4">
              Create an account to save your study progress, set your baptism date, and record your testimony.
            </p>
            <button
              onClick={onOpenAuth}
              className="px-6 py-3 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors"
            >
              Sign In to Begin
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'study', label: 'Pre-Baptism Study', icon: BookOpen },
            { id: 'journey', label: 'My Journey', icon: Calendar },
            { id: 'milestones', label: 'Growth Milestones', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg'
                  : 'bg-white/5 text-[#f5f1e8]/70 hover:bg-white/10 hover:text-[#f5f1e8]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-[#d4af37] animate-spin" />
          </div>
        )}

        {/* Pre-Baptism Study Tab */}
        {!loading && activeTab === 'study' && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="bg-white/5 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-[#f5f1e8]">Study Progress</h3>
                <span className="text-[#d4af37] font-bold">{completedLessons}/{studyLessons.length} Lessons</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${studyProgressPercent}%` }}
                />
              </div>
              {studyProgressPercent === 100 && (
                <p className="text-green-400 text-sm mt-2 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Congratulations! You've completed the pre-baptism study!
                </p>
              )}
            </div>

            {/* Lessons */}
            {studyLessons.map((lesson, index) => {
              const isCompleted = studyProgress[lesson.id]?.completed || false;
              const isExpanded = expandedLesson === lesson.id;
              
              return (
                <div
                  key={lesson.id}
                  className={`bg-white/5 rounded-2xl overflow-hidden transition-all ${
                    isCompleted ? 'border border-green-500/30' : 'border border-transparent'
                  }`}
                >
                  {/* Lesson Header */}
                  <button
                    onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-[#f5f1e8]">{lesson.title}</h4>
                        <p className="text-sm text-[#f5f1e8]/60">{lesson.description}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#f5f1e8]/60" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#f5f1e8]/60" />
                    )}
                  </button>

                  {/* Lesson Content */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-6 space-y-6">
                      {/* Scriptures */}
                      <div className="space-y-4">
                        <h5 className="text-[#d4af37] font-semibold flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Key Scriptures
                        </h5>
                        {lesson.scriptures.map((scripture) => (
                          <div key={scripture.reference} className="bg-[#1a2332]/50 rounded-xl p-4">
                            <button
                              onClick={() => onReadVerse(scripture.reference)}
                              className="text-[#d4af37] font-medium hover:underline mb-2 flex items-center"
                            >
                              {scripture.reference}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </button>
                            <p className="text-[#f5f1e8]/80 text-sm italic leading-relaxed">
                              "{scripture.text}"
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Reflection */}
                      <div>
                        <h5 className="text-[#d4af37] font-semibold flex items-center mb-3">
                          <PenLine className="w-4 h-4 mr-2" />
                          Reflection Question
                        </h5>
                        <p className="text-[#f5f1e8]/80 mb-3 italic">"{lesson.reflection}"</p>
                        
                        {user ? (
                          <div className="space-y-3">
                            <textarea
                              value={lessonNotes[lesson.id] || ''}
                              onChange={(e) => setLessonNotes({ ...lessonNotes, [lesson.id]: e.target.value })}
                              placeholder="Write your thoughts here..."
                              className="w-full h-24 px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] resize-none"
                            />
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => saveLessonNotes(lesson.id)}
                                className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-[#f5f1e8] rounded-lg hover:bg-white/20 transition-colors text-sm"
                              >
                                <Save className="w-4 h-4" />
                                <span>Save Notes</span>
                              </button>
                              <button
                                onClick={() => toggleLessonComplete(lesson.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                                  isCompleted
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                }`}
                              >
                                {isCompleted ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Completed</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle className="w-4 h-4" />
                                    <span>Mark Complete</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={onOpenAuth}
                            className="text-[#d4af37] text-sm hover:underline"
                          >
                            Sign in to save your reflections
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* My Journey Tab */}
        {!loading && activeTab === 'journey' && (
          <div className="space-y-6">
            {/* Baptism Status */}
            <div className="bg-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#f5f1e8] mb-4">Baptism Status</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { id: 'preparing', label: 'Preparing', icon: BookOpen },
                  { id: 'scheduled', label: 'Scheduled', icon: Calendar },
                  { id: 'baptized', label: 'Baptized!', icon: Sparkles }
                ].map((status) => (
                  <button
                    key={status.id}
                    onClick={() => {
                      if (!user) {
                        onOpenAuth();
                        return;
                      }
                      setBaptismData({ ...baptismData, baptism_status: status.id as any });
                    }}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                      baptismData.baptism_status === status.id
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                        : 'bg-white/10 text-[#f5f1e8]/70 hover:bg-white/20'
                    }`}
                  >
                    <status.icon className="w-4 h-4" />
                    <span>{status.label}</span>
                  </button>
                ))}
              </div>

              {/* Date Picker */}
              <div className="mb-6">
                <label className="block text-[#f5f1e8]/80 text-sm mb-2">
                  {baptismData.baptism_status === 'baptized' ? 'Baptism Date' : 'Planned Baptism Date'}
                </label>
                <input
                  type="date"
                  value={baptismData.baptism_date || ''}
                  onChange={(e) => {
                    if (!user) {
                      onOpenAuth();
                      return;
                    }
                    setBaptismData({ ...baptismData, baptism_date: e.target.value });
                  }}
                  className="w-full sm:w-auto px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Days Counter */}
              {baptismData.baptism_date && (
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-xl p-6 text-center">
                  {baptismData.baptism_status === 'baptized' && daysSince !== null && daysSince >= 0 ? (
                    <>
                      <p className="text-4xl font-bold text-cyan-400 mb-2">{daysSince}</p>
                      <p className="text-[#f5f1e8]/80">
                        {daysSince === 0 ? 'Today is your baptism day!' : daysSince === 1 ? 'day since your baptism' : 'days walking in newness of life'}
                      </p>
                    </>
                  ) : daysUntil !== null && daysUntil > 0 ? (
                    <>
                      <p className="text-4xl font-bold text-blue-400 mb-2">{daysUntil}</p>
                      <p className="text-[#f5f1e8]/80">
                        {daysUntil === 1 ? 'day until your baptism!' : 'days until your baptism!'}
                      </p>
                    </>
                  ) : daysUntil === 0 ? (
                    <>
                      <Sparkles className="w-12 h-12 text-[#d4af37] mx-auto mb-2" />
                      <p className="text-xl font-bold text-[#d4af37]">Today is the day!</p>
                      <p className="text-[#f5f1e8]/80">Your baptism day has arrived!</p>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Transformation Testimony */}
            <div className="bg-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#f5f1e8] mb-4 flex items-center">
                <Star className="w-5 h-5 text-[#d4af37] mr-2" />
                My Transformation Story
              </h3>
              <p className="text-[#f5f1e8]/60 text-sm mb-6">
                Record your journey from the old man to the new man in Christ.
              </p>

              {/* Old Man */}
              <div className="mb-6">
                <label className="block text-red-400 font-medium mb-2">
                  The Old Man (Who I Was)
                </label>
                <textarea
                  value={baptismData.old_man_description}
                  onChange={(e) => {
                    if (!user) {
                      onOpenAuth();
                      return;
                    }
                    setBaptismData({ ...baptismData, old_man_description: e.target.value });
                  }}
                  placeholder="Describe who you were before Christ... your struggles, your identity, your way of life..."
                  className="w-full h-28 px-4 py-3 bg-red-500/5 border border-red-500/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-red-400 resize-none"
                />
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center my-4">
                <div className="flex items-center space-x-2 text-[#d4af37]">
                  <Droplets className="w-6 h-6" />
                  <span className="font-serif italic">Buried in Baptism</span>
                  <Droplets className="w-6 h-6" />
                </div>
              </div>

              {/* New Man */}
              <div className="mb-6">
                <label className="block text-green-400 font-medium mb-2">
                  The New Man (Who I Am in Christ)
                </label>
                <textarea
                  value={baptismData.new_man_description}
                  onChange={(e) => {
                    if (!user) {
                      onOpenAuth();
                      return;
                    }
                    setBaptismData({ ...baptismData, new_man_description: e.target.value });
                  }}
                  placeholder="Describe who you are now in Christ... your new identity, your hope, your transformation..."
                  className="w-full h-28 px-4 py-3 bg-green-500/5 border border-green-500/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-green-400 resize-none"
                />
              </div>

              {/* Full Testimony */}
              <div className="mb-6">
                <label className="block text-[#d4af37] font-medium mb-2">
                  My Full Testimony
                </label>
                <textarea
                  value={baptismData.testimony}
                  onChange={(e) => {
                    if (!user) {
                      onOpenAuth();
                      return;
                    }
                    setBaptismData({ ...baptismData, testimony: e.target.value });
                  }}
                  placeholder="Share your complete story of transformation... how you came to faith, what baptism means to you, and how God has changed your life..."
                  className="w-full h-40 px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              {user && (
                <button
                  onClick={saveBaptismData}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save My Journey</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Scripture Reference */}
            <div className="bg-gradient-to-r from-[#d4af37]/10 to-[#d4af37]/5 rounded-2xl p-6 text-center">
              <p className="text-[#f5f1e8] italic mb-2">
                "Therefore if anyone is in Christ, he is a new creature; the old things passed away; behold, new things have come."
              </p>
              <button
                onClick={() => onReadVerse('2 Corinthians 5:17')}
                className="text-[#d4af37] font-medium hover:underline"
              >
                — 2 Corinthians 5:17
              </button>
            </div>
          </div>
        )}

        {/* Growth Milestones Tab */}
        {!loading && activeTab === 'milestones' && (
          <div className="space-y-4">
            {/* Progress Summary */}
            <div className="bg-white/5 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-[#f5f1e8]">Growth Progress</h3>
                <span className="text-[#d4af37] font-bold">{completedMilestones}/{postBaptismMilestones.length} Milestones</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#d4af37] to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${(completedMilestones / postBaptismMilestones.length) * 100}%` }}
                />
              </div>
              {baptismData.baptism_status !== 'baptized' && (
                <p className="text-[#f5f1e8]/60 text-sm mt-3 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  These milestones are designed for after your baptism, but feel free to explore!
                </p>
              )}
            </div>

            {/* Milestones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {postBaptismMilestones.map((milestone) => {
                const isCompleted = milestoneProgress[milestone.id]?.completed || false;
                const isExpanded = expandedMilestone === milestone.id;
                const IconComponent = milestone.icon;
                
                return (
                  <div
                    key={milestone.id}
                    className={`bg-white/5 rounded-2xl overflow-hidden transition-all ${
                      isCompleted ? 'border border-[#d4af37]/50 bg-[#d4af37]/5' : 'border border-transparent'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                      className="w-full p-4 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted 
                            ? 'bg-[#d4af37]/20 text-[#d4af37]' 
                            : 'bg-white/10 text-[#f5f1e8]/60'
                        }`}>
                          {isCompleted ? (
                            <Award className="w-5 h-5" />
                          ) : (
                            <IconComponent className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold ${isCompleted ? 'text-[#d4af37]' : 'text-[#f5f1e8]'}`}>
                            {milestone.title}
                          </h4>
                          <p className="text-sm text-[#f5f1e8]/60 line-clamp-2">{milestone.description}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#f5f1e8]/40 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#f5f1e8]/40 flex-shrink-0" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4">
                        <button
                          onClick={() => onReadVerse(milestone.scripture)}
                          className="text-sm text-[#d4af37] hover:underline flex items-center"
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          {milestone.scripture}
                        </button>

                        {user ? (
                          <>
                            <textarea
                              value={milestoneReflections[milestone.id] || ''}
                              onChange={(e) => setMilestoneReflections({ 
                                ...milestoneReflections, 
                                [milestone.id]: e.target.value 
                              })}
                              placeholder="Reflect on this milestone..."
                              className="w-full h-20 px-3 py-2 bg-white/5 border border-[#d4af37]/30 rounded-lg text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] resize-none text-sm"
                            />
                            <div className="flex items-center justify-between gap-2">
                              <button
                                onClick={() => saveMilestoneReflection(milestone.id)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 text-[#f5f1e8] rounded-lg hover:bg-white/20 transition-colors text-xs"
                              >
                                <Save className="w-3 h-3" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => toggleMilestoneComplete(milestone.id)}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors text-xs ${
                                  isCompleted
                                    ? 'bg-[#d4af37]/20 text-[#d4af37]'
                                    : 'bg-white/10 text-[#f5f1e8] hover:bg-white/20'
                                }`}
                              >
                                {isCompleted ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Completed</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle className="w-3 h-3" />
                                    <span>Complete</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={onOpenAuth}
                            className="text-[#d4af37] text-sm hover:underline"
                          >
                            Sign in to track milestones
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Encouragement */}
            <div className="bg-gradient-to-r from-[#d4af37]/10 to-[#d4af37]/5 rounded-2xl p-6 text-center mt-8">
              <Flame className="w-10 h-10 text-[#d4af37] mx-auto mb-3" />
              <p className="text-[#f5f1e8] italic mb-2">
                "Being confident of this very thing, that He who has begun a good work in you will complete it until the day of Jesus Christ."
              </p>
              <button
                onClick={() => onReadVerse('Philippians 1:6')}
                className="text-[#d4af37] font-medium hover:underline"
              >
                — Philippians 1:6
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BaptismJourney;
