import React, { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { 
  Brain, BookOpen, Trophy, Star, Flame, Target, CheckCircle, 
  XCircle, RotateCcw, Plus, Trash2, ChevronRight, ChevronLeft,
  Sparkles, Crown, Award, Zap, Heart, Users, Clock, TrendingUp,
  Eye, EyeOff, RefreshCw, Filter, Search, Volume2, VolumeX, 
  Share2, Play, Pause, SkipForward, Edit3, Type, Shuffle, ArrowUp, ArrowDown
} from 'lucide-react';
import ShareModal from './ShareModal';

interface ScriptureMemoryProps {
  user: User | null;
  onOpenAuth: () => void;
  onReadVerse: (reference: string) => void;
}

interface MemoryVerse {
  id: string;
  reference: string;
  verse_text: string;
  category: string;
  created_at: string;
  progress?: MemoryProgress;
}

interface MemoryProgress {
  id: string;
  verse_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at: string | null;
  times_correct: number;
  times_incorrect: number;
  mastered: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: string;
  earned?: boolean;
  earned_at?: string;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_practice_date: string | null;
  total_reviews: number;
}

interface BlankWord {
  index: number;
  word: string;
  userInput: string;
  revealed: boolean;
}

interface ScrambledWord {
  id: number;
  word: string;
  originalIndex: number;
}

// Pre-defined verses organized by category
const suggestedVerses = {
  sonship: [
    { reference: 'Romans 8:14', text: 'For all who are being led by the Spirit of God, these are sons of God.' },
    { reference: 'Romans 8:15', text: 'For you have not received a spirit of slavery leading to fear again, but you have received a spirit of adoption as sons by which we cry out, "Abba! Father!"' },
    { reference: 'Romans 8:16-17', text: 'The Spirit Himself testifies with our spirit that we are children of God, and if children, heirs also, heirs of God and fellow heirs with Christ.' },
    { reference: 'Galatians 3:26', text: 'For you are all sons of God through faith in Christ Jesus.' },
    { reference: 'Galatians 4:6-7', text: 'Because you are sons, God has sent forth the Spirit of His Son into our hearts, crying, "Abba! Father!" Therefore you are no longer a slave, but a son; and if a son, then an heir through God.' },
    { reference: 'John 1:12', text: 'But as many as received Him, to them He gave the right to become children of God, even to those who believe in His name.' },
    { reference: '1 John 3:1', text: 'See how great a love the Father has bestowed on us, that we would be called children of God; and such we are.' },
    { reference: '1 John 3:2', text: 'Beloved, now we are children of God, and it has not appeared as yet what we will be. We know that when He appears, we will be like Him, because we will see Him just as He is.' },
    { reference: 'Ephesians 1:5', text: 'He predestined us to adoption as sons through Jesus Christ to Himself, according to the kind intention of His will.' },
    { reference: 'Hebrews 2:10', text: 'For it was fitting for Him, for whom are all things, and through whom are all things, in bringing many sons to glory, to perfect the author of their salvation through sufferings.' },
  ],
  wwjd: [
    { reference: 'John 13:15', text: 'For I gave you an example that you also should do as I did to you.' },
    { reference: '1 Peter 2:21', text: 'For you have been called for this purpose, since Christ also suffered for you, leaving you an example for you to follow in His steps.' },
    { reference: 'Philippians 2:5', text: 'Have this attitude in yourselves which was also in Christ Jesus.' },
    { reference: '1 John 2:6', text: 'The one who says he abides in Him ought himself to walk in the same manner as He walked.' },
    { reference: 'Matthew 5:44', text: 'But I say to you, love your enemies and pray for those who persecute you.' },
    { reference: 'Matthew 7:12', text: 'In everything, therefore, treat people the same way you want them to treat you, for this is the Law and the Prophets.' },
    { reference: 'Luke 6:31', text: 'Treat others the same way you want them to treat you.' },
    { reference: 'Colossians 3:13', text: 'Bearing with one another, and forgiving each other, whoever has a complaint against anyone; just as the Lord forgave you, so also should you.' },
    { reference: 'Ephesians 4:32', text: 'Be kind to one another, tender-hearted, forgiving each other, just as God in Christ also has forgiven you.' },
    { reference: 'Romans 12:21', text: 'Do not be overcome by evil, but overcome evil with good.' },
  ],
  baptism: [
    { reference: 'Romans 6:3-4', text: 'Or do you not know that all of us who have been baptized into Christ Jesus have been baptized into His death? Therefore we have been buried with Him through baptism into death, so that as Christ was raised from the dead through the glory of the Father, so we too might walk in newness of life.' },
    { reference: 'Colossians 2:12', text: 'Having been buried with Him in baptism, in which you were also raised up with Him through faith in the working of God, who raised Him from the dead.' },
    { reference: 'Galatians 3:27', text: 'For all of you who were baptized into Christ have clothed yourselves with Christ.' },
    { reference: 'Acts 2:38', text: 'Then Peter said unto them, Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive the gift of the Holy Ghost.' },
    { reference: '1 Peter 3:21', text: 'Corresponding to that, baptism now saves you—not the removal of dirt from the flesh, but an appeal to God for a good conscience—through the resurrection of Jesus Christ.' },
    { reference: 'Mark 16:16', text: 'He who has believed and has been baptized shall be saved; but he who has disbelieved shall be condemned.' },
  ],
  faith: [
    { reference: 'Hebrews 11:1', text: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
    { reference: 'Romans 10:17', text: 'So then faith cometh by hearing, and hearing by the word of God.' },
    { reference: 'Ephesians 2:8-9', text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.' },
    { reference: 'James 2:17', text: 'Even so faith, if it hath not works, is dead, being alone.' },
    { reference: '2 Corinthians 5:7', text: 'For we walk by faith, not by sight.' },
    { reference: 'Hebrews 11:6', text: 'But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him.' },
  ],
  love: [
    { reference: '1 Corinthians 13:4-5', text: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil.' },
    { reference: '1 John 4:8', text: 'He that loveth not knoweth not God; for God is love.' },
    { reference: 'John 15:13', text: 'Greater love hath no man than this, that a man lay down his life for his friends.' },
    { reference: 'Romans 5:8', text: 'But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.' },
    { reference: '1 John 4:19', text: 'We love him, because he first loved us.' },
    { reference: 'John 3:16', text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
  ],
};

const achievementsList: Achievement[] = [
  { id: 'first_verse', title: 'First Steps', description: 'Add your first verse to memorize', icon: <Star className="w-6 h-6" />, requirement: 'Add 1 verse' },
  { id: 'five_verses', title: 'Growing Library', description: 'Add 5 verses to your memory list', icon: <BookOpen className="w-6 h-6" />, requirement: 'Add 5 verses' },
  { id: 'ten_verses', title: 'Scripture Scholar', description: 'Add 10 verses to your memory list', icon: <Brain className="w-6 h-6" />, requirement: 'Add 10 verses' },
  { id: 'first_mastery', title: 'First Mastery', description: 'Master your first verse', icon: <Trophy className="w-6 h-6" />, requirement: 'Master 1 verse' },
  { id: 'five_mastered', title: 'Word Warrior', description: 'Master 5 verses', icon: <Award className="w-6 h-6" />, requirement: 'Master 5 verses' },
  { id: 'ten_mastered', title: 'Scripture Sage', description: 'Master 10 verses', icon: <Crown className="w-6 h-6" />, requirement: 'Master 10 verses' },
  { id: 'sonship_complete', title: 'Son of God', description: 'Memorize all sonship verses', icon: <Users className="w-6 h-6" />, requirement: 'Complete sonship category' },
  { id: 'wwjd_complete', title: 'Christ-Like', description: 'Memorize all WWJD verses', icon: <Heart className="w-6 h-6" />, requirement: 'Complete WWJD category' },
  { id: 'week_streak', title: 'Faithful Week', description: 'Practice for 7 days in a row', icon: <Flame className="w-6 h-6" />, requirement: '7-day streak' },
  { id: 'month_streak', title: 'Devoted Disciple', description: 'Practice for 30 days in a row', icon: <Zap className="w-6 h-6" />, requirement: '30-day streak' },
  { id: 'perfect_session', title: 'Perfect Memory', description: 'Get all verses correct in a session', icon: <Target className="w-6 h-6" />, requirement: 'Perfect practice session' },
  { id: 'hundred_reviews', title: 'Persistent Learner', description: 'Complete 100 verse reviews', icon: <TrendingUp className="w-6 h-6" />, requirement: '100 total reviews' },
  { id: 'scramble_master', title: 'Unscrambler', description: 'Complete 10 word scramble challenges', icon: <Shuffle className="w-6 h-6" />, requirement: '10 scramble completions' },
];

const ScriptureMemory: React.FC<ScriptureMemoryProps> = ({ user, onOpenAuth, onReadVerse }) => {
  const [activeTab, setActiveTab] = useState<'practice' | 'verses' | 'achievements'>('practice');
  const [verses, setVerses] = useState<MemoryVerse[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Practice state
  const [practiceMode, setPracticeMode] = useState<'idle' | 'flashcard' | 'quiz' | 'fillblank' | 'scramble' | 'results'>('idle');
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceVerses, setPracticeVerses] = useState<MemoryVerse[]>([]);
  const [sessionResults, setSessionResults] = useState<{ correct: number; incorrect: number }>({ correct: 0, incorrect: 0 });
  const [userInput, setUserInput] = useState('');
  
  // Fill-in-the-blank state
  const [blankWords, setBlankWords] = useState<BlankWord[]>([]);
  const [blankDifficulty, setBlankDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0);
  const [blankInput, setBlankInput] = useState('');
  const [blankFeedback, setBlankFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
  // Word Scramble state
  const [scrambledWords, setScrambledWords] = useState<ScrambledWord[]>([]);
  const [userArrangement, setUserArrangement] = useState<ScrambledWord[]>([]);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [scrambleComplete, setScrambleComplete] = useState(false);
  const [scrambleScore, setScrambleScore] = useState(0);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Share state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareVerse, setShareVerse] = useState<MemoryVerse | null>(null);
  
  // Add verse state
  const [showAddVerse, setShowAddVerse] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('sonship');
  const [customReference, setCustomReference] = useState('');
  const [customText, setCustomText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const loadUserData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    
    try {
      const { data: versesData, error: versesError } = await supabase
        .from('memory_verses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (versesError) throw versesError;

      const { data: progressData, error: progressError } = await supabase
        .from('memory_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      const versesWithProgress = (versesData || []).map(verse => ({
        ...verse,
        progress: progressData?.find(p => p.verse_id === verse.id)
      }));

      setVerses(versesWithProgress);

      const { data: achievementsData } = await supabase
        .from('memory_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      setAchievements((achievementsData || []).map(a => a.achievement_id));

      const { data: streakDataResult } = await supabase
        .from('memory_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setStreakData(streakDataResult || {
        current_streak: 0,
        longest_streak: 0,
        last_practice_date: null,
        total_reviews: 0
      });

    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Audio playback functions
  const speakVerse = (text: string, reference: string) => {
    if (!audioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(`${reference}. ${text}`);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) 
      || voices.find(v => v.lang.startsWith('en-US'))
      || voices.find(v => v.lang.startsWith('en'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopSpeaking();
    }
    setAudioEnabled(!audioEnabled);
  };

  // Fill-in-the-blank functions
  const generateBlanks = (text: string, difficulty: 'easy' | 'medium' | 'hard'): BlankWord[] => {
    const words = text.split(/\s+/);
    const blanks: BlankWord[] = [];
    
    const blankPercentage = difficulty === 'easy' ? 0.2 : difficulty === 'medium' ? 0.35 : 0.5;
    const numBlanks = Math.max(2, Math.floor(words.length * blankPercentage));
    
    const eligibleIndices = words
      .map((word, index) => ({ word: word.replace(/[.,;:!?"']/g, ''), index }))
      .filter(w => w.word.length >= 3);
    
    const selectedIndices = new Set<number>();
    const shuffled = [...eligibleIndices].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(numBlanks, shuffled.length); i++) {
      selectedIndices.add(shuffled[i].index);
    }
    
    Array.from(selectedIndices).sort((a, b) => a - b).forEach(index => {
      const word = words[index].replace(/[.,;:!?"']/g, '');
      blanks.push({
        index,
        word,
        userInput: '',
        revealed: false
      });
    });
    
    return blanks;
  };

  // Word Scramble functions
  const generateScramble = (text: string): ScrambledWord[] => {
    const words = text.split(/\s+/).map((word, index) => ({
      id: index,
      word: word,
      originalIndex: index
    }));
    
    // Shuffle the words
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    
    // Make sure it's actually scrambled
    let attempts = 0;
    while (shuffled.every((w, i) => w.originalIndex === i) && attempts < 10) {
      shuffled.sort(() => Math.random() - 0.5);
      attempts++;
    }
    
    return shuffled;
  };

  const moveWord = (wordId: number, direction: 'up' | 'down') => {
    const currentIndex = userArrangement.findIndex(w => w.id === wordId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= userArrangement.length) return;
    
    const newArrangement = [...userArrangement];
    [newArrangement[currentIndex], newArrangement[newIndex]] = [newArrangement[newIndex], newArrangement[currentIndex]];
    setUserArrangement(newArrangement);
  };

  const checkScrambleAnswer = () => {
    const isCorrect = userArrangement.every((word, index) => word.originalIndex === index);
    setScrambleComplete(true);
    
    // Calculate score based on how many words are in correct position
    const correctPositions = userArrangement.filter((word, index) => word.originalIndex === index).length;
    const score = Math.round((correctPositions / userArrangement.length) * 100);
    setScrambleScore(score);
    
    return isCorrect || score >= 70;
  };

  const renderVerseWithBlanks = (text: string, blanks: BlankWord[], currentIdx: number) => {
    const words = text.split(/\s+/);
    
    return (
      <p className="text-lg text-[#f5f1e8] leading-relaxed font-serif">
        {words.map((word, index) => {
          const blankInfo = blanks.find(b => b.index === index);
          const punctuation = word.match(/[.,;:!?"']+$/)?.[0] || '';
          
          if (blankInfo) {
            const blankIdx = blanks.findIndex(b => b.index === index);
            const isActive = blankIdx === currentIdx;
            const isCorrect = blankInfo.revealed && blankInfo.userInput.toLowerCase() === blankInfo.word.toLowerCase();
            const isIncorrect = blankInfo.revealed && blankInfo.userInput.toLowerCase() !== blankInfo.word.toLowerCase();
            
            return (
              <span key={index} className="inline">
                {blankInfo.revealed ? (
                  <span className={`inline-block px-2 py-1 rounded mx-1 ${
                    isCorrect ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400 line-through'
                  }`}>
                    {blankInfo.userInput || '___'}
                  </span>
                ) : (
                  <span className={`inline-block px-3 py-1 rounded mx-1 border-2 border-dashed ${
                    isActive 
                      ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#d4af37]' 
                      : 'border-[#f5f1e8]/30 bg-[#1a2332]'
                  }`}>
                    {'_'.repeat(Math.max(3, blankInfo.word.length))}
                  </span>
                )}
                {isIncorrect && blankInfo.revealed && (
                  <span className="text-green-400 mx-1">({blankInfo.word})</span>
                )}
                {punctuation}{' '}
              </span>
            );
          }
          
          return <span key={index}>{word} </span>;
        })}
      </p>
    );
  };

  const handleBlankSubmit = () => {
    if (!blankInput.trim()) return;
    
    const updatedBlanks = [...blankWords];
    updatedBlanks[currentBlankIndex] = {
      ...updatedBlanks[currentBlankIndex],
      userInput: blankInput.trim(),
      revealed: true
    };
    setBlankWords(updatedBlanks);
    
    const isCorrect = blankInput.trim().toLowerCase() === updatedBlanks[currentBlankIndex].word.toLowerCase();
    setBlankFeedback(isCorrect ? 'correct' : 'incorrect');
    
    setTimeout(() => {
      setBlankFeedback(null);
      setBlankInput('');
      
      if (currentBlankIndex < blankWords.length - 1) {
        setCurrentBlankIndex(currentBlankIndex + 1);
      } else {
        setShowAnswer(true);
      }
    }, 1000);
  };

  const startPractice = (mode: 'flashcard' | 'quiz' | 'fillblank' | 'scramble') => {
    const today = new Date().toISOString().split('T')[0];
    let dueVerses = verses.filter(v => 
      v.progress && v.progress.next_review_date <= today
    );

    if (dueVerses.length === 0) {
      dueVerses = verses.filter(v => !v.progress?.mastered);
    }

    if (dueVerses.length === 0) {
      dueVerses = verses;
    }

    const shuffled = [...dueVerses].sort(() => Math.random() - 0.5).slice(0, 10);
    
    setPracticeVerses(shuffled);
    setCurrentVerseIndex(0);
    setShowAnswer(false);
    setSessionResults({ correct: 0, incorrect: 0 });
    setUserInput('');
    setBlankInput('');
    setCurrentBlankIndex(0);
    setBlankFeedback(null);
    setScrambleComplete(false);
    setScrambleScore(0);
    
    if (mode === 'fillblank' && shuffled.length > 0) {
      setBlankWords(generateBlanks(shuffled[0].verse_text, blankDifficulty));
    }
    
    if (mode === 'scramble' && shuffled.length > 0) {
      const scrambled = generateScramble(shuffled[0].verse_text);
      setScrambledWords(scrambled);
      setUserArrangement([...scrambled]);
    }
    
    setPracticeMode(mode);
  };

  const handleAnswer = async (correct: boolean) => {
    if (!user) return;

    const currentVerse = practiceVerses[currentVerseIndex];
    
    // Handle case where progress doesn't exist yet
    if (!currentVerse.progress) {
      // Create progress record first
      try {
        const { data: progressData, error: progressError } = await supabase
          .from('memory_progress')
          .insert({
            user_id: user.id,
            verse_id: currentVerse.id
          })
          .select()
          .single();
        
        if (progressError) throw progressError;
        
        currentVerse.progress = progressData;
      } catch (err) {
        console.error('Error creating progress:', err);
        return;
      }
    }

    let { ease_factor, interval_days, repetitions } = currentVerse.progress;
    
    if (correct) {
      if (repetitions === 0) {
        interval_days = 1;
      } else if (repetitions === 1) {
        interval_days = 6;
      } else {
        interval_days = Math.round(interval_days * ease_factor);
      }
      repetitions += 1;
      ease_factor = Math.max(1.3, ease_factor + 0.1);
    } else {
      repetitions = 0;
      interval_days = 1;
      ease_factor = Math.max(1.3, ease_factor - 0.2);
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval_days);
    const mastered = repetitions >= 5 && interval_days >= 21;

    try {
      await supabase
        .from('memory_progress')
        .update({
          ease_factor,
          interval_days,
          repetitions,
          next_review_date: nextReviewDate.toISOString().split('T')[0],
          last_reviewed_at: new Date().toISOString(),
          times_correct: currentVerse.progress.times_correct + (correct ? 1 : 0),
          times_incorrect: currentVerse.progress.times_incorrect + (correct ? 0 : 1),
          mastered,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentVerse.progress.id);

      setVerses(prev => prev.map(v => 
        v.id === currentVerse.id 
          ? { 
              ...v, 
              progress: { 
                ...v.progress!, 
                ease_factor, 
                interval_days, 
                repetitions, 
                next_review_date: nextReviewDate.toISOString().split('T')[0],
                times_correct: v.progress!.times_correct + (correct ? 1 : 0),
                times_incorrect: v.progress!.times_incorrect + (correct ? 0 : 1),
                mastered
              } 
            }
          : v
      ));

      setSessionResults(prev => ({
        correct: prev.correct + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1)
      }));

      if (currentVerseIndex < practiceVerses.length - 1) {
        const nextIndex = currentVerseIndex + 1;
        setCurrentVerseIndex(nextIndex);
        setShowAnswer(false);
        setUserInput('');
        setBlankInput('');
        setCurrentBlankIndex(0);
        setBlankFeedback(null);
        setScrambleComplete(false);
        setScrambleScore(0);
        
        if (practiceMode === 'fillblank') {
          setBlankWords(generateBlanks(practiceVerses[nextIndex].verse_text, blankDifficulty));
        }
        
        if (practiceMode === 'scramble') {
          const scrambled = generateScramble(practiceVerses[nextIndex].verse_text);
          setScrambledWords(scrambled);
          setUserArrangement([...scrambled]);
        }
      } else {
        await updateStreak();
        setPracticeMode('results');
      }

    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = 1;
    let newLongest = streakData?.longest_streak || 0;
    let totalReviews = (streakData?.total_reviews || 0) + practiceVerses.length;

    if (streakData?.last_practice_date === yesterday) {
      newStreak = (streakData.current_streak || 0) + 1;
    } else if (streakData?.last_practice_date === today) {
      newStreak = streakData.current_streak;
    }

    newLongest = Math.max(newLongest, newStreak);

    try {
      await supabase
        .from('memory_streaks')
        .upsert({
          user_id: user.id,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_practice_date: today,
          total_reviews: totalReviews,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      setStreakData({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_practice_date: today,
        total_reviews: totalReviews
      });

      checkAchievements(verses, newStreak, totalReviews);

    } catch (err) {
      console.error('Error updating streak:', err);
    }
  };

  const checkAchievements = async (
    currentVerses: MemoryVerse[] = verses, 
    streak: number = streakData?.current_streak || 0,
    totalReviews: number = streakData?.total_reviews || 0
  ) => {
    if (!user) return;

    const newAchievements: string[] = [];
    const masteredCount = currentVerses.filter(v => v.progress?.mastered).length;
    const sonshipVerses = currentVerses.filter(v => v.category === 'sonship');
    const wwjdVerses = currentVerses.filter(v => v.category === 'wwjd');

    if (currentVerses.length >= 1 && !achievements.includes('first_verse')) {
      newAchievements.push('first_verse');
    }
    if (currentVerses.length >= 5 && !achievements.includes('five_verses')) {
      newAchievements.push('five_verses');
    }
    if (currentVerses.length >= 10 && !achievements.includes('ten_verses')) {
      newAchievements.push('ten_verses');
    }
    if (masteredCount >= 1 && !achievements.includes('first_mastery')) {
      newAchievements.push('first_mastery');
    }
    if (masteredCount >= 5 && !achievements.includes('five_mastered')) {
      newAchievements.push('five_mastered');
    }
    if (masteredCount >= 10 && !achievements.includes('ten_mastered')) {
      newAchievements.push('ten_mastered');
    }
    if (sonshipVerses.length >= 10 && sonshipVerses.every(v => v.progress?.mastered) && !achievements.includes('sonship_complete')) {
      newAchievements.push('sonship_complete');
    }
    if (wwjdVerses.length >= 10 && wwjdVerses.every(v => v.progress?.mastered) && !achievements.includes('wwjd_complete')) {
      newAchievements.push('wwjd_complete');
    }
    if (streak >= 7 && !achievements.includes('week_streak')) {
      newAchievements.push('week_streak');
    }
    if (streak >= 30 && !achievements.includes('month_streak')) {
      newAchievements.push('month_streak');
    }
    if (totalReviews >= 100 && !achievements.includes('hundred_reviews')) {
      newAchievements.push('hundred_reviews');
    }

    for (const achievementId of newAchievements) {
      try {
        await supabase
          .from('memory_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievementId
          });
      } catch (err) {
        console.error('Error saving achievement:', err);
      }
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  const addVerse = async (reference: string, text: string, category: string) => {
    if (!user) return;

    try {
      const existingVerse = verses.find(v => v.reference === reference);
      if (existingVerse) {
        alert('This verse is already in your memory list!');
        return;
      }

      const { data: verseData, error: verseError } = await supabase
        .from('memory_verses')
        .insert({
          user_id: user.id,
          reference,
          verse_text: text,
          category
        })
        .select()
        .single();

      if (verseError) throw verseError;

      const { data: progressData, error: progressError } = await supabase
        .from('memory_progress')
        .insert({
          user_id: user.id,
          verse_id: verseData.id
        })
        .select()
        .single();

      if (progressError) throw progressError;

      const newVerse: MemoryVerse = {
        ...verseData,
        progress: progressData
      };

      setVerses(prev => [newVerse, ...prev]);
      setShowAddVerse(false);
      setCustomReference('');
      setCustomText('');

      checkAchievements([newVerse, ...verses]);

    } catch (err) {
      console.error('Error adding verse:', err);
    }
  };

  const removeVerse = async (verseId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('memory_verses')
        .delete()
        .eq('id', verseId);

      setVerses(prev => prev.filter(v => v.id !== verseId));
    } catch (err) {
      console.error('Error removing verse:', err);
    }
  };

  const handleShareVerse = (verse: MemoryVerse) => {
    setShareVerse(verse);
    setShareModalOpen(true);
  };

  const filteredVerses = verses.filter(v => {
    const matchesCategory = filterCategory === 'all' || v.category === filterCategory;
    const matchesSearch = searchTerm === '' || 
      v.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.verse_text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const dueForReview = verses.filter(v => {
    if (!v.progress) return true;
    const today = new Date().toISOString().split('T')[0];
    return v.progress.next_review_date <= today && !v.progress.mastered;
  }).length;

  const masteredCount = verses.filter(v => v.progress?.mastered).length;

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-[#243447] to-[#1a2332] rounded-2xl p-8 sm:p-12 text-center border border-[#d4af37]/20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
            <Brain className="w-10 h-10 text-[#d4af37]" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#f5f1e8] mb-4">
            Scripture Memory System
          </h2>
          <p className="text-[#f5f1e8]/70 mb-8 max-w-lg mx-auto">
            Memorize God's Word with flashcards, fill-in-the-blank, word scramble, and typing challenges. 
            Sign in to start hiding Scripture in your heart.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-8 py-4 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors"
          >
            Sign In to Begin
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-[#d4af37] animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadUserData}
            className="px-6 py-2 bg-[#d4af37] text-[#1a2332] font-semibold rounded-lg hover:bg-[#d4af37]/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Share Modal */}
      {shareVerse && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setShareVerse(null);
          }}
          content={{
            type: 'verse',
            title: shareVerse.reference,
            text: shareVerse.verse_text,
            reference: shareVerse.reference,
            theme: `Memorized - ${shareVerse.category.charAt(0).toUpperCase() + shareVerse.category.slice(1)}`
          }}
        />
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#d4af37]/20 rounded-full mb-4">
          <Brain className="w-5 h-5 text-[#d4af37]" />
          <span className="text-[#d4af37] font-medium">Scripture Memory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5f1e8] mb-4">
          Hide God's Word in Your Heart
        </h1>
        <p className="text-[#f5f1e8]/70 max-w-2xl mx-auto">
          "Your word I have treasured in my heart, that I may not sin against You." — Psalm 119:11
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#243447] rounded-xl p-4 border border-[#d4af37]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#f5f1e8]">{verses.length}</p>
              <p className="text-xs text-[#f5f1e8]/50">Total Verses</p>
            </div>
          </div>
        </div>
        <div className="bg-[#243447] rounded-xl p-4 border border-[#d4af37]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#f5f1e8]">{masteredCount}</p>
              <p className="text-xs text-[#f5f1e8]/50">Mastered</p>
            </div>
          </div>
        </div>
        <div className="bg-[#243447] rounded-xl p-4 border border-[#d4af37]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#f5f1e8]">{streakData?.current_streak || 0}</p>
              <p className="text-xs text-[#f5f1e8]/50">Day Streak</p>
            </div>
          </div>
        </div>
        <div className="bg-[#243447] rounded-xl p-4 border border-[#d4af37]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#f5f1e8]">{dueForReview}</p>
              <p className="text-xs text-[#f5f1e8]/50">Due Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'practice', label: 'Practice', icon: Brain },
          { id: 'verses', label: 'My Verses', icon: BookOpen },
          { id: 'achievements', label: 'Achievements', icon: Trophy },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#d4af37] text-[#1a2332]'
                : 'bg-[#243447] text-[#f5f1e8]/70 hover:bg-[#243447]/80'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Practice Tab */}
      {activeTab === 'practice' && (
        <div>
          {practiceMode === 'idle' && (
            <div className="space-y-6">
              {verses.length === 0 ? (
                <div className="bg-[#243447] rounded-2xl p-8 text-center border border-[#d4af37]/20">
                  <BookOpen className="w-12 h-12 text-[#d4af37]/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#f5f1e8] mb-2">No Verses Yet</h3>
                  <p className="text-[#f5f1e8]/60 mb-6">
                    Add some verses to your memory list to start practicing!
                  </p>
                  <button
                    onClick={() => setActiveTab('verses')}
                    className="px-6 py-3 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors"
                  >
                    Add Your First Verse
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Flashcard Mode */}
                    <div className="bg-gradient-to-br from-[#243447] to-[#1a2332] rounded-2xl p-6 border border-[#d4af37]/20">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                        <RotateCcw className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#f5f1e8] mb-2">Flashcards</h3>
                      <p className="text-[#f5f1e8]/60 mb-4 text-sm">
                        See reference, recall verse. Flip to check.
                      </p>
                      <button
                        onClick={() => startPractice('flashcard')}
                        className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        Start
                      </button>
                    </div>

                    {/* Fill-in-the-Blank Mode */}
                    <div className="bg-gradient-to-br from-[#243447] to-[#1a2332] rounded-2xl p-6 border border-[#d4af37]/20">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                        <Edit3 className="w-6 h-6 text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#f5f1e8] mb-2">Fill-in-Blank</h3>
                      <p className="text-[#f5f1e8]/60 mb-3 text-sm">
                        Complete verses with missing words.
                      </p>
                      <div className="flex gap-1 mb-3">
                        {(['easy', 'medium', 'hard'] as const).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setBlankDifficulty(diff)}
                            className={`flex-1 px-2 py-1 rounded text-xs font-medium capitalize transition-colors ${
                              blankDifficulty === diff
                                ? 'bg-green-500 text-white'
                                : 'bg-[#1a2332] text-[#f5f1e8]/60 hover:bg-[#1a2332]/80'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => startPractice('fillblank')}
                        className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                      >
                        Start
                      </button>
                    </div>

                    {/* Word Scramble Mode */}
                    <div className="bg-gradient-to-br from-[#243447] to-[#1a2332] rounded-2xl p-6 border border-[#d4af37]/20">
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                        <Shuffle className="w-6 h-6 text-orange-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#f5f1e8] mb-2">Word Scramble</h3>
                      <p className="text-[#f5f1e8]/60 mb-4 text-sm">
                        Arrange scrambled words in order.
                      </p>
                      <button
                        onClick={() => startPractice('scramble')}
                        className="w-full px-4 py-2 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                      >
                        Start
                      </button>
                    </div>

                    {/* Quiz Mode */}
                    <div className="bg-gradient-to-br from-[#243447] to-[#1a2332] rounded-2xl p-6 border border-[#d4af37]/20">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                        <Type className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#f5f1e8] mb-2">Typing Challenge</h3>
                      <p className="text-[#f5f1e8]/60 mb-4 text-sm">
                        Type the entire verse from memory.
                      </p>
                      <button
                        onClick={() => startPractice('quiz')}
                        className="w-full px-4 py-2 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 transition-colors"
                      >
                        Start
                      </button>
                    </div>
                  </div>

                  {/* Due for Review */}
                  {dueForReview > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-6 h-6 text-orange-400" />
                        <div>
                          <p className="text-[#f5f1e8] font-medium">
                            {dueForReview} verse{dueForReview !== 1 ? 's' : ''} due for review today!
                          </p>
                          <p className="text-[#f5f1e8]/60 text-sm">
                            Regular review helps move verses into long-term memory.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Flashcard Practice */}
          {practiceMode === 'flashcard' && practiceVerses.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[#f5f1e8]/60">
                  Verse {currentVerseIndex + 1} of {practiceVerses.length}
                </span>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-lg transition-colors ${
                      audioEnabled ? 'text-[#d4af37] bg-[#d4af37]/20' : 'text-[#f5f1e8]/40 bg-[#243447]'
                    }`}
                  >
                    {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setPracticeMode('idle')}
                    className="text-[#f5f1e8]/60 hover:text-[#f5f1e8] transition-colors"
                  >
                    Exit
                  </button>
                </div>
              </div>

              <div 
                className={`bg-gradient-to-br from-[#243447] to-[#1a2332] rounded-2xl p-8 border border-[#d4af37]/20 min-h-[300px] flex flex-col justify-center cursor-pointer transition-all ${
                  showAnswer ? 'ring-2 ring-[#d4af37]/50' : ''
                }`}
                onClick={() => setShowAnswer(!showAnswer)}
              >
                <div className="text-center">
                  <p className="text-[#d4af37] font-medium mb-4">
                    {practiceVerses[currentVerseIndex].reference}
                  </p>
                  
                  {showAnswer ? (
                    <div className="animate-fade-in">
                      <p className="text-xl text-[#f5f1e8] leading-relaxed font-serif">
                        "{practiceVerses[currentVerseIndex].verse_text}"
                      </p>
                      {audioEnabled && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPlaying) {
                              stopSpeaking();
                            } else {
                              speakVerse(
                                practiceVerses[currentVerseIndex].verse_text,
                                practiceVerses[currentVerseIndex].reference
                              );
                            }
                          }}
                          className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-[#d4af37]/20 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/30 transition-colors"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span>{isPlaying ? 'Stop' : 'Listen'}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <Eye className="w-12 h-12 text-[#f5f1e8]/30" />
                      <p className="text-[#f5f1e8]/50">Tap to reveal verse</p>
                    </div>
                  )}
                </div>
              </div>

              {showAnswer && (
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => handleAnswer(false)}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Needs Work</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(true)}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-green-500/20 text-green-400 font-semibold rounded-xl hover:bg-green-500/30 transition-colors border border-green-500/30"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Got It!</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Fill-in-the-Blank Practice */}
          {practiceMode === 'fillblank' && practiceVerses.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[#f5f1e8]/60">
                  Verse {currentVerseIndex + 1} of {practiceVerses.length}
                </span>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-lg transition-colors ${
                      audioEnabled ? 'text-[#d4af37] bg-[#d4af37]/20' : 'text-[#f5f1e8]/40 bg-[#243447]'
                    }`}
                  >
                    {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setPracticeMode('idle')}
                    className="text-[#f5f1e8]/60 hover:text-[#f5f1e8] transition-colors"
                  >
                    Exit
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#243447] to-[#1a2332] rounded-2xl p-8 border border-[#d4af37]/20">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[#d4af37] font-medium">
                    {practiceVerses[currentVerseIndex].reference}
                  </p>
                  <span className="px-3 py-1 bg-[#d4af37]/20 text-[#d4af37] text-sm rounded-full capitalize">
                    {blankDifficulty}
                  </span>
                </div>
                
                <div className="mb-6">
                  {renderVerseWithBlanks(
                    practiceVerses[currentVerseIndex].verse_text,
                    blankWords,
                    currentBlankIndex
                  )}
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  {blankWords.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        idx < currentBlankIndex 
                          ? blankWords[idx].userInput.toLowerCase() === blankWords[idx].word.toLowerCase()
                            ? 'bg-green-500'
                            : 'bg-red-500'
                          : idx === currentBlankIndex
                            ? 'bg-[#d4af37]'
                            : 'bg-[#1a2332]'
                      }`}
                    />
                  ))}
                </div>

                {!showAnswer ? (
                  <>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={blankInput}
                        onChange={(e) => setBlankInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleBlankSubmit()}
                        placeholder={`Fill in blank ${currentBlankIndex + 1} of ${blankWords.length}...`}
                        className={`flex-1 px-4 py-3 bg-[#1a2332] border rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/30 focus:outline-none transition-colors ${
                          blankFeedback === 'correct' 
                            ? 'border-green-500 bg-green-500/10' 
                            : blankFeedback === 'incorrect'
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-[#d4af37]/30 focus:border-[#d4af37]'
                        }`}
                        autoFocus
                      />
                      <button
                        onClick={handleBlankSubmit}
                        disabled={!blankInput.trim()}
                        className="px-6 py-3 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {blankFeedback && (
                      <div className={`mt-3 flex items-center space-x-2 ${
                        blankFeedback === 'correct' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {blankFeedback === 'correct' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        <span>{blankFeedback === 'correct' ? 'Correct!' : 'Not quite...'}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="bg-[#1a2332] rounded-xl p-4 mb-4">
                      <p className="text-[#f5f1e8]/50 text-sm mb-2">Complete Verse:</p>
                      <p className="text-[#f5f1e8] font-serif">
                        "{practiceVerses[currentVerseIndex].verse_text}"
                      </p>
                    </div>

                    <div className="bg-[#d4af37]/10 rounded-xl p-4 mb-4">
                      <p className="text-[#d4af37] font-medium">
                        Score: {blankWords.filter(b => b.userInput.toLowerCase() === b.word.toLowerCase()).length} / {blankWords.length} correct
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleAnswer(false)}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Needs Work</span>
                      </button>
                      <button
                        onClick={() => handleAnswer(true)}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-green-500/20 text-green-400 font-semibold rounded-xl hover:bg-green-500/30 transition-colors border border-green-500/30"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Got It!</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Word Scramble Practice */}
          {practiceMode === 'scramble' && practiceVerses.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[#f5f1e8]/60">
                  Verse {currentVerseIndex + 1} of {practiceVerses.length}
                </span>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-lg transition-colors ${
                      audioEnabled ? 'text-[#d4af37] bg-[#d4af37]/20' : 'text-[#f5f1e8]/40 bg-[#243447]'
                    }`}
                  >
                    {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setPracticeMode('idle')}
                    className="text-[#f5f1e8]/60 hover:text-[#f5f1e8] transition-colors"
                  >
                    Exit
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#243447] to-[#1a2332] rounded-2xl p-6 border border-[#d4af37]/20">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[#d4af37] font-medium">
                    {practiceVerses[currentVerseIndex].reference}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Shuffle className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 text-sm">Word Scramble</span>
                  </div>
                </div>

                <p className="text-[#f5f1e8]/60 text-sm mb-4">
                  Arrange the words in the correct order:
                </p>

                {/* Scrambled Words */}
                <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto">
                  {userArrangement.map((word, index) => {
                    const isCorrectPosition = scrambleComplete && word.originalIndex === index;
                    const isWrongPosition = scrambleComplete && word.originalIndex !== index;
                    
                    return (
                      <div
                        key={word.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                          selectedWordId === word.id
                            ? 'bg-[#d4af37]/20 border border-[#d4af37]'
                            : isCorrectPosition
                              ? 'bg-green-500/20 border border-green-500/50'
                              : isWrongPosition
                                ? 'bg-red-500/20 border border-red-500/50'
                                : 'bg-[#1a2332] border border-transparent hover:border-[#d4af37]/30'
                        }`}
                        onClick={() => !scrambleComplete && setSelectedWordId(selectedWordId === word.id ? null : word.id)}
                      >
                        <span className="text-[#f5f1e8]/40 text-sm w-6">{index + 1}.</span>
                        <span className={`flex-1 ${
                          isCorrectPosition ? 'text-green-400' : isWrongPosition ? 'text-red-400' : 'text-[#f5f1e8]'
                        }`}>
                          {word.word}
                        </span>
                        {!scrambleComplete && (
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveWord(word.id, 'up');
                              }}
                              disabled={index === 0}
                              className="p-1 text-[#f5f1e8]/40 hover:text-[#d4af37] disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveWord(word.id, 'down');
                              }}
                              disabled={index === userArrangement.length - 1}
                              className="p-1 text-[#f5f1e8]/40 hover:text-[#d4af37] disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!scrambleComplete ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        const scrambled = generateScramble(practiceVerses[currentVerseIndex].verse_text);
                        setScrambledWords(scrambled);
                        setUserArrangement([...scrambled]);
                      }}
                      className="flex-1 px-4 py-3 bg-[#1a2332] text-[#f5f1e8]/70 font-medium rounded-xl hover:bg-[#1a2332]/80 transition-colors border border-[#d4af37]/20"
                    >
                      <RefreshCw className="w-5 h-5 inline mr-2" />
                      Reshuffle
                    </button>
                    <button
                      onClick={checkScrambleAnswer}
                      className="flex-1 px-4 py-3 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors"
                    >
                      Check Answer
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#1a2332] rounded-xl p-4 mb-4">
                      <p className="text-[#f5f1e8]/50 text-sm mb-2">Correct Order:</p>
                      <p className="text-[#f5f1e8] font-serif">
                        "{practiceVerses[currentVerseIndex].verse_text}"
                      </p>
                    </div>

                    <div className={`rounded-xl p-4 mb-4 ${
                      scrambleScore >= 70 ? 'bg-green-500/10' : 'bg-orange-500/10'
                    }`}>
                      <p className={`font-medium ${
                        scrambleScore >= 70 ? 'text-green-400' : 'text-orange-400'
                      }`}>
                        Score: {scrambleScore}% correct positions
                      </p>
                    </div>

                    {audioEnabled && (
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            stopSpeaking();
                          } else {
                            speakVerse(
                              practiceVerses[currentVerseIndex].verse_text,
                              practiceVerses[currentVerseIndex].reference
                            );
                          }
                        }}
                        className="w-full mb-4 flex items-center justify-center space-x-2 px-4 py-3 bg-[#d4af37]/20 text-[#d4af37] rounded-xl hover:bg-[#d4af37]/30 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        <span>{isPlaying ? 'Stop Audio' : 'Listen to Verse'}</span>
                      </button>
                    )}

                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleAnswer(false)}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Needs Work</span>
                      </button>
                      <button
                        onClick={() => handleAnswer(scrambleScore >= 70)}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-green-500/20 text-green-400 font-semibold rounded-xl hover:bg-green-500/30 transition-colors border border-green-500/30"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Got It!</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quiz Practice */}
          {practiceMode === 'quiz' && practiceVerses.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[#f5f1e8]/60">
                  Verse {currentVerseIndex + 1} of {practiceVerses.length}
                </span>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-lg transition-colors ${
                      audioEnabled ? 'text-[#d4af37] bg-[#d4af37]/20' : 'text-[#f5f1e8]/40 bg-[#243447]'
                    }`}
                  >
                    {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setPracticeMode('idle')}
                    className="text-[#f5f1e8]/60 hover:text-[#f5f1e8] transition-colors"
                  >
                    Exit
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#243447] to-[#1a2332] rounded-2xl p-8 border border-[#d4af37]/20">
                <p className="text-[#d4af37] font-medium mb-4 text-center">
                  {practiceVerses[currentVerseIndex].reference}
                </p>
                
                <p className="text-[#f5f1e8]/60 text-center mb-6">
                  Type the verse from memory:
                </p>

                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Start typing the verse..."
                  className="w-full h-40 px-4 py-3 bg-[#1a2332] border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/30 focus:outline-none focus:border-[#d4af37] resize-none"
                  disabled={showAnswer}
                />

                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full mt-4 px-6 py-3 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors"
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className="mt-6">
                    <div className="bg-[#1a2332] rounded-xl p-4 mb-4">
                      <p className="text-[#f5f1e8]/50 text-sm mb-2">Correct Answer:</p>
                      <p className="text-[#f5f1e8] font-serif">
                        "{practiceVerses[currentVerseIndex].verse_text}"
                      </p>
                    </div>

                    {audioEnabled && (
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            stopSpeaking();
                          } else {
                            speakVerse(
                              practiceVerses[currentVerseIndex].verse_text,
                              practiceVerses[currentVerseIndex].reference
                            );
                          }
                        }}
                        className="w-full mb-4 flex items-center justify-center space-x-2 px-4 py-3 bg-[#d4af37]/20 text-[#d4af37] rounded-xl hover:bg-[#d4af37]/30 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        <span>{isPlaying ? 'Stop Audio' : 'Listen to Verse'}</span>
                      </button>
                    )}

                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleAnswer(false)}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Needs Work</span>
                      </button>
                      <button
                        onClick={() => handleAnswer(true)}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-green-500/20 text-green-400 font-semibold rounded-xl hover:bg-green-500/30 transition-colors border border-green-500/30"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Got It!</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {practiceMode === 'results' && (
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-gradient-to-br from-[#243447] to-[#1a2332] rounded-2xl p-8 border border-[#d4af37]/20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-[#d4af37]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#f5f1e8] mb-2">
                  Practice Complete!
                </h3>
                <p className="text-[#f5f1e8]/60 mb-6">
                  Great job hiding God's Word in your heart!
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                    <p className="text-3xl font-bold text-green-400">{sessionResults.correct}</p>
                    <p className="text-green-400/70 text-sm">Correct</p>
                  </div>
                  <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                    <p className="text-3xl font-bold text-red-400">{sessionResults.incorrect}</p>
                    <p className="text-red-400/70 text-sm">Needs Review</p>
                  </div>
                </div>

                {streakData && streakData.current_streak > 0 && (
                  <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30 mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Flame className="w-6 h-6 text-orange-400" />
                      <span className="text-orange-400 font-semibold">
                        {streakData.current_streak} Day Streak!
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setPracticeMode('idle')}
                  className="w-full px-6 py-3 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verses Tab */}
      {activeTab === 'verses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f5f1e8]/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search verses..."
                  className="pl-10 pr-4 py-2 bg-[#243447] border border-[#d4af37]/20 rounded-lg text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] w-48"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-[#243447] border border-[#d4af37]/20 rounded-lg text-[#f5f1e8] focus:outline-none focus:border-[#d4af37]"
              >
                <option value="all">All Categories</option>
                <option value="sonship">Sonship</option>
                <option value="wwjd">WWJD</option>
                <option value="baptism">Baptism</option>
                <option value="faith">Faith</option>
                <option value="love">Love</option>
                <option value="general">General</option>
              </select>
            </div>
            <button
              onClick={() => setShowAddVerse(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Verse</span>
            </button>
          </div>

          {/* Add Verse Modal */}
          {showAddVerse && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-[#1a2332] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#d4af37]/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[#f5f1e8]">Add Verse to Memorize</h3>
                  <button
                    onClick={() => setShowAddVerse(false)}
                    className="text-[#f5f1e8]/60 hover:text-[#f5f1e8]"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.keys(suggestedVerses).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                        selectedCategory === cat
                          ? 'bg-[#d4af37] text-[#1a2332]'
                          : 'bg-[#243447] text-[#f5f1e8]/70 hover:bg-[#243447]/80'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {suggestedVerses[selectedCategory as keyof typeof suggestedVerses]?.map((verse) => {
                    const isAdded = verses.some(v => v.reference === verse.reference);
                    return (
                      <div
                        key={verse.reference}
                        className={`p-4 rounded-xl border transition-colors ${
                          isAdded 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-[#243447] border-[#d4af37]/20 hover:border-[#d4af37]/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-[#d4af37] font-medium text-sm mb-1">{verse.reference}</p>
                            <p className="text-[#f5f1e8]/80 text-sm line-clamp-2">{verse.text}</p>
                          </div>
                          {isAdded ? (
                            <span className="flex items-center space-x-1 text-green-400 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              <span>Added</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => addVerse(verse.reference, verse.text, selectedCategory)}
                              className="px-3 py-1 bg-[#d4af37] text-[#1a2332] text-sm font-medium rounded-lg hover:bg-[#d4af37]/90 transition-colors"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#d4af37]/20 pt-6">
                  <h4 className="text-[#f5f1e8] font-medium mb-4">Or Add a Custom Verse</h4>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={customReference}
                      onChange={(e) => setCustomReference(e.target.value)}
                      placeholder="Reference (e.g., John 3:16)"
                      className="w-full px-4 py-3 bg-[#243447] border border-[#d4af37]/20 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37]"
                    />
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Verse text..."
                      rows={3}
                      className="w-full px-4 py-3 bg-[#243447] border border-[#d4af37]/20 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] resize-none"
                    />
                    <button
                      onClick={() => {
                        if (customReference && customText) {
                          addVerse(customReference, customText, 'general');
                        }
                      }}
                      disabled={!customReference || !customText}
                      className="w-full px-4 py-3 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Custom Verse
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filteredVerses.length === 0 ? (
            <div className="bg-[#243447] rounded-2xl p-8 text-center border border-[#d4af37]/20">
              <BookOpen className="w-12 h-12 text-[#d4af37]/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#f5f1e8] mb-2">
                {verses.length === 0 ? 'No Verses Yet' : 'No Matching Verses'}
              </h3>
              <p className="text-[#f5f1e8]/60">
                {verses.length === 0 
                  ? 'Click "Add Verse" to start building your memory list!'
                  : 'Try adjusting your search or filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVerses.map((verse) => (
                <div
                  key={verse.id}
                  className="bg-[#243447] rounded-xl p-4 border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <button
                          onClick={() => onReadVerse(verse.reference)}
                          className="text-[#d4af37] font-medium hover:underline"
                        >
                          {verse.reference}
                        </button>
                        <span className="px-2 py-0.5 bg-[#d4af37]/20 text-[#d4af37] text-xs rounded-full capitalize">
                          {verse.category}
                        </span>
                        {verse.progress?.mastered && (
                          <span className="flex items-center space-x-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                            <Crown className="w-3 h-3" />
                            <span>Mastered</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[#f5f1e8]/80 text-sm line-clamp-2 mb-3">
                        "{verse.verse_text}"
                      </p>
                      
                      {verse.progress && (
                        <div className="flex items-center space-x-4 text-xs text-[#f5f1e8]/50">
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span>{verse.progress.times_correct} correct</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <XCircle className="w-3 h-3 text-red-400" />
                            <span>{verse.progress.times_incorrect} missed</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              Next: {new Date(verse.progress.next_review_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            stopSpeaking();
                          } else {
                            speakVerse(verse.verse_text, verse.reference);
                          }
                        }}
                        className="p-2 text-[#f5f1e8]/40 hover:text-[#d4af37] transition-colors"
                        title="Listen to verse"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      
                      <button
                        onClick={() => handleShareVerse(verse)}
                        className="p-2 text-[#f5f1e8]/40 hover:text-[#d4af37] transition-colors"
                        title="Share verse"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => removeVerse(verse.id)}
                        className="p-2 text-[#f5f1e8]/40 hover:text-red-400 transition-colors"
                        title="Remove verse"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievementsList.map((achievement) => {
            const earned = achievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`rounded-xl p-6 border transition-all ${
                  earned
                    ? 'bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border-[#d4af37]/40'
                    : 'bg-[#243447] border-[#d4af37]/10 opacity-60'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                  earned ? 'bg-[#d4af37]/30 text-[#d4af37]' : 'bg-[#1a2332] text-[#f5f1e8]/30'
                }`}>
                  {achievement.icon}
                </div>
                <h3 className={`font-semibold mb-1 ${
                  earned ? 'text-[#f5f1e8]' : 'text-[#f5f1e8]/50'
                }`}>
                  {achievement.title}
                </h3>
                <p className={`text-sm mb-2 ${
                  earned ? 'text-[#f5f1e8]/70' : 'text-[#f5f1e8]/40'
                }`}>
                  {achievement.description}
                </p>
                <p className={`text-xs ${
                  earned ? 'text-[#d4af37]' : 'text-[#f5f1e8]/30'
                }`}>
                  {earned ? 'Earned!' : achievement.requirement}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScriptureMemory;
