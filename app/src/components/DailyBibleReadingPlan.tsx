import React, { useState, useEffect } from 'react';
import { useSyncedState } from '@/hooks/useSyncedState';
import { 
  Calendar, 
  BookOpen, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Trophy, 
  Clock, 
  Target,
  Bell,
  Play,
  Pause,
  RotateCcw,
  CalendarDays,
  BookMarked,
  ScrollText,
  Heart,
  Sparkles,
  Sun,
  Moon,
  Star
} from 'lucide-react';

interface DailyBibleReadingPlanProps {
  user: any;
  onOpenAuth: () => void;
  onReadVerse: (reference: string) => void;
}

interface ReadingDay {
  day: number;
  date: string;
  readings: {
    reference: string;
    title: string;
  }[];
  completed: boolean;
}

interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  totalDays: number;
  readings: ReadingDay[];
}

// Generate chronological reading plan (365 days)
const generateChronologicalPlan = (): ReadingDay[] => {
  const readings = [
    { day: 1, readings: [{ reference: 'Genesis 1-3', title: 'Creation & The Fall' }] },
    { day: 2, readings: [{ reference: 'Genesis 4-7', title: 'Cain, Abel & Noah' }] },
    { day: 3, readings: [{ reference: 'Genesis 8-11', title: 'The Flood & Tower of Babel' }] },
    { day: 4, readings: [{ reference: 'Genesis 12-15', title: 'Call of Abram' }] },
    { day: 5, readings: [{ reference: 'Genesis 16-18', title: 'Ishmael & Isaac Promised' }] },
    { day: 6, readings: [{ reference: 'Genesis 19-21', title: 'Sodom & Isaac Born' }] },
    { day: 7, readings: [{ reference: 'Genesis 22-24', title: 'Abraham\'s Faith Tested' }] },
    { day: 8, readings: [{ reference: 'Genesis 25-26', title: 'Jacob & Esau' }] },
    { day: 9, readings: [{ reference: 'Genesis 27-29', title: 'Jacob\'s Deception' }] },
    { day: 10, readings: [{ reference: 'Genesis 30-31', title: 'Jacob\'s Family Grows' }] },
    { day: 11, readings: [{ reference: 'Genesis 32-34', title: 'Jacob Wrestles with God' }] },
    { day: 12, readings: [{ reference: 'Genesis 35-37', title: 'Joseph\'s Dreams' }] },
    { day: 13, readings: [{ reference: 'Genesis 38-40', title: 'Joseph in Egypt' }] },
    { day: 14, readings: [{ reference: 'Genesis 41-42', title: 'Joseph Interprets Dreams' }] },
    { day: 15, readings: [{ reference: 'Genesis 43-45', title: 'Joseph Reveals Himself' }] },
    { day: 16, readings: [{ reference: 'Genesis 46-47', title: 'Israel Moves to Egypt' }] },
    { day: 17, readings: [{ reference: 'Genesis 48-50', title: 'Jacob Blesses His Sons' }] },
    { day: 18, readings: [{ reference: 'Job 1-3', title: 'Job\'s Suffering Begins' }] },
    { day: 19, readings: [{ reference: 'Job 4-7', title: 'Eliphaz Speaks' }] },
    { day: 20, readings: [{ reference: 'Job 8-10', title: 'Bildad Speaks' }] },
    { day: 21, readings: [{ reference: 'Job 11-13', title: 'Zophar Speaks' }] },
    { day: 22, readings: [{ reference: 'Job 14-16', title: 'Job\'s Response' }] },
    { day: 23, readings: [{ reference: 'Job 17-20', title: 'Continued Dialogue' }] },
    { day: 24, readings: [{ reference: 'Job 21-23', title: 'Job\'s Defense' }] },
    { day: 25, readings: [{ reference: 'Job 24-28', title: 'Wisdom\'s Source' }] },
    { day: 26, readings: [{ reference: 'Job 29-31', title: 'Job\'s Final Defense' }] },
    { day: 27, readings: [{ reference: 'Job 32-34', title: 'Elihu Speaks' }] },
    { day: 28, readings: [{ reference: 'Job 35-37', title: 'Elihu Continues' }] },
    { day: 29, readings: [{ reference: 'Job 38-39', title: 'God Speaks' }] },
    { day: 30, readings: [{ reference: 'Job 40-42', title: 'Job\'s Restoration' }] },
    // Continue with Exodus
    { day: 31, readings: [{ reference: 'Exodus 1-3', title: 'Moses\' Birth & Calling' }] },
    { day: 32, readings: [{ reference: 'Exodus 4-6', title: 'Moses Returns to Egypt' }] },
    { day: 33, readings: [{ reference: 'Exodus 7-9', title: 'The Plagues Begin' }] },
    { day: 34, readings: [{ reference: 'Exodus 10-12', title: 'The Passover' }] },
    { day: 35, readings: [{ reference: 'Exodus 13-15', title: 'Crossing the Red Sea' }] },
    { day: 36, readings: [{ reference: 'Exodus 16-18', title: 'Manna & Water' }] },
    { day: 37, readings: [{ reference: 'Exodus 19-21', title: 'The Ten Commandments' }] },
    { day: 38, readings: [{ reference: 'Exodus 22-24', title: 'Laws & Covenant' }] },
    { day: 39, readings: [{ reference: 'Exodus 25-27', title: 'Tabernacle Instructions' }] },
    { day: 40, readings: [{ reference: 'Exodus 28-29', title: 'Priestly Garments' }] },
    { day: 41, readings: [{ reference: 'Exodus 30-32', title: 'The Golden Calf' }] },
    { day: 42, readings: [{ reference: 'Exodus 33-35', title: 'Moses Sees God\'s Glory' }] },
    { day: 43, readings: [{ reference: 'Exodus 36-38', title: 'Building the Tabernacle' }] },
    { day: 44, readings: [{ reference: 'Exodus 39-40', title: 'Tabernacle Completed' }] },
    // Leviticus
    { day: 45, readings: [{ reference: 'Leviticus 1-4', title: 'Offerings' }] },
    { day: 46, readings: [{ reference: 'Leviticus 5-7', title: 'More Offerings' }] },
    { day: 47, readings: [{ reference: 'Leviticus 8-10', title: 'Aaron\'s Priesthood' }] },
    { day: 48, readings: [{ reference: 'Leviticus 11-13', title: 'Clean & Unclean' }] },
    { day: 49, readings: [{ reference: 'Leviticus 14-15', title: 'Purification Laws' }] },
    { day: 50, readings: [{ reference: 'Leviticus 16-18', title: 'Day of Atonement' }] },
    // Continue through the Bible...
    { day: 51, readings: [{ reference: 'Leviticus 19-21', title: 'Holiness Laws' }] },
    { day: 52, readings: [{ reference: 'Leviticus 22-23', title: 'Feasts of the Lord' }] },
    { day: 53, readings: [{ reference: 'Leviticus 24-25', title: 'Sabbath Year & Jubilee' }] },
    { day: 54, readings: [{ reference: 'Leviticus 26-27', title: 'Blessings & Curses' }] },
    // Numbers
    { day: 55, readings: [{ reference: 'Numbers 1-2', title: 'Census of Israel' }] },
    { day: 56, readings: [{ reference: 'Numbers 3-4', title: 'Levites\' Duties' }] },
    { day: 57, readings: [{ reference: 'Numbers 5-6', title: 'Nazirite Vow' }] },
    { day: 58, readings: [{ reference: 'Numbers 7', title: 'Offerings of Leaders' }] },
    { day: 59, readings: [{ reference: 'Numbers 8-10', title: 'Levites Set Apart' }] },
    { day: 60, readings: [{ reference: 'Numbers 11-13', title: 'Spies Sent Out' }] },
  ];

  // Generate remaining days with placeholder readings
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  const fullReadings: ReadingDay[] = [];
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const existingReading = readings.find(r => r.day === i + 1);
    fullReadings.push({
      day: i + 1,
      date: date.toISOString().split('T')[0],
      readings: existingReading?.readings || [{ 
        reference: `Day ${i + 1} Reading`, 
        title: 'Continue Your Journey' 
      }],
      completed: false
    });
  }
  
  return fullReadings;
};

// Generate Old & New Testament Parallel plan
const generateParallelPlan = (): ReadingDay[] => {
  const readings = [
    { day: 1, readings: [
      { reference: 'Genesis 1-2', title: 'Creation' },
      { reference: 'Matthew 1', title: 'Genealogy of Jesus' }
    ]},
    { day: 2, readings: [
      { reference: 'Genesis 3-4', title: 'The Fall' },
      { reference: 'Matthew 2', title: 'Birth of Jesus' }
    ]},
    { day: 3, readings: [
      { reference: 'Genesis 5-7', title: 'Noah' },
      { reference: 'Matthew 3', title: 'John the Baptist' }
    ]},
    { day: 4, readings: [
      { reference: 'Genesis 8-10', title: 'After the Flood' },
      { reference: 'Matthew 4', title: 'Temptation of Jesus' }
    ]},
    { day: 5, readings: [
      { reference: 'Genesis 11-13', title: 'Call of Abram' },
      { reference: 'Matthew 5', title: 'Sermon on the Mount' }
    ]},
    { day: 6, readings: [
      { reference: 'Genesis 14-16', title: 'Melchizedek' },
      { reference: 'Matthew 6', title: 'Lord\'s Prayer' }
    ]},
    { day: 7, readings: [
      { reference: 'Genesis 17-18', title: 'Covenant with Abraham' },
      { reference: 'Matthew 7', title: 'Judge Not' }
    ]},
    { day: 8, readings: [
      { reference: 'Genesis 19-20', title: 'Sodom & Gomorrah' },
      { reference: 'Matthew 8', title: 'Jesus Heals' }
    ]},
    { day: 9, readings: [
      { reference: 'Genesis 21-23', title: 'Isaac Born' },
      { reference: 'Matthew 9', title: 'Matthew Called' }
    ]},
    { day: 10, readings: [
      { reference: 'Genesis 24', title: 'Wife for Isaac' },
      { reference: 'Matthew 10', title: 'Twelve Apostles' }
    ]},
    { day: 11, readings: [
      { reference: 'Genesis 25-26', title: 'Jacob & Esau' },
      { reference: 'Matthew 11', title: 'John\'s Question' }
    ]},
    { day: 12, readings: [
      { reference: 'Genesis 27-28', title: 'Jacob\'s Ladder' },
      { reference: 'Matthew 12', title: 'Lord of Sabbath' }
    ]},
    { day: 13, readings: [
      { reference: 'Genesis 29-30', title: 'Jacob\'s Wives' },
      { reference: 'Matthew 13', title: 'Parables' }
    ]},
    { day: 14, readings: [
      { reference: 'Genesis 31-32', title: 'Jacob Wrestles' },
      { reference: 'Matthew 14', title: 'Feeding 5000' }
    ]},
    { day: 15, readings: [
      { reference: 'Psalms 1-3', title: 'Blessed is the Man' },
      { reference: 'Matthew 15', title: 'Clean & Unclean' }
    ]},
  ];

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  const fullReadings: ReadingDay[] = [];
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const existingReading = readings.find(r => r.day === i + 1);
    fullReadings.push({
      day: i + 1,
      date: date.toISOString().split('T')[0],
      readings: existingReading?.readings || [
        { reference: `OT Day ${i + 1}`, title: 'Old Testament' },
        { reference: `NT Day ${i + 1}`, title: 'New Testament' }
      ],
      completed: false
    });
  }
  
  return fullReadings;
};

// Generate Gospels-focused plan
const generateGospelsPlan = (): ReadingDay[] => {
  const readings = [
    { day: 1, readings: [{ reference: 'Matthew 1', title: 'The Genealogy of Jesus' }] },
    { day: 2, readings: [{ reference: 'Matthew 2', title: 'The Magi Visit' }] },
    { day: 3, readings: [{ reference: 'Matthew 3', title: 'John Baptizes Jesus' }] },
    { day: 4, readings: [{ reference: 'Matthew 4', title: 'Temptation & Ministry Begins' }] },
    { day: 5, readings: [{ reference: 'Matthew 5', title: 'Sermon on the Mount I' }] },
    { day: 6, readings: [{ reference: 'Matthew 6', title: 'Sermon on the Mount II' }] },
    { day: 7, readings: [{ reference: 'Matthew 7', title: 'Sermon on the Mount III' }] },
    { day: 8, readings: [{ reference: 'Matthew 8', title: 'Jesus Heals Many' }] },
    { day: 9, readings: [{ reference: 'Matthew 9', title: 'More Healings & Callings' }] },
    { day: 10, readings: [{ reference: 'Matthew 10', title: 'Sending the Twelve' }] },
    { day: 11, readings: [{ reference: 'Matthew 11', title: 'Jesus & John the Baptist' }] },
    { day: 12, readings: [{ reference: 'Matthew 12', title: 'Lord of the Sabbath' }] },
    { day: 13, readings: [{ reference: 'Matthew 13', title: 'Parables of the Kingdom' }] },
    { day: 14, readings: [{ reference: 'Matthew 14', title: 'Feeding the 5000' }] },
    { day: 15, readings: [{ reference: 'Matthew 15', title: 'Clean & Unclean' }] },
    { day: 16, readings: [{ reference: 'Matthew 16', title: 'Peter\'s Confession' }] },
    { day: 17, readings: [{ reference: 'Matthew 17', title: 'The Transfiguration' }] },
    { day: 18, readings: [{ reference: 'Matthew 18', title: 'The Greatest in the Kingdom' }] },
    { day: 19, readings: [{ reference: 'Matthew 19', title: 'Marriage & Riches' }] },
    { day: 20, readings: [{ reference: 'Matthew 20', title: 'Workers in the Vineyard' }] },
    { day: 21, readings: [{ reference: 'Matthew 21', title: 'Triumphal Entry' }] },
    { day: 22, readings: [{ reference: 'Matthew 22', title: 'Parables & Questions' }] },
    { day: 23, readings: [{ reference: 'Matthew 23', title: 'Woes to the Pharisees' }] },
    { day: 24, readings: [{ reference: 'Matthew 24', title: 'Signs of the End' }] },
    { day: 25, readings: [{ reference: 'Matthew 25', title: 'Parables of Readiness' }] },
    { day: 26, readings: [{ reference: 'Matthew 26', title: 'The Last Supper' }] },
    { day: 27, readings: [{ reference: 'Matthew 27', title: 'The Crucifixion' }] },
    { day: 28, readings: [{ reference: 'Matthew 28', title: 'The Resurrection' }] },
    // Mark
    { day: 29, readings: [{ reference: 'Mark 1', title: 'Beginning of the Gospel' }] },
    { day: 30, readings: [{ reference: 'Mark 2', title: 'Jesus Heals & Calls' }] },
    { day: 31, readings: [{ reference: 'Mark 3', title: 'The Twelve Appointed' }] },
    { day: 32, readings: [{ reference: 'Mark 4', title: 'Parables' }] },
    { day: 33, readings: [{ reference: 'Mark 5', title: 'Demons & Healing' }] },
    { day: 34, readings: [{ reference: 'Mark 6', title: 'Rejection & Mission' }] },
    { day: 35, readings: [{ reference: 'Mark 7', title: 'Traditions & Faith' }] },
    { day: 36, readings: [{ reference: 'Mark 8', title: 'Who Do You Say I Am?' }] },
    { day: 37, readings: [{ reference: 'Mark 9', title: 'Transfiguration' }] },
    { day: 38, readings: [{ reference: 'Mark 10', title: 'Teaching on the Way' }] },
    { day: 39, readings: [{ reference: 'Mark 11', title: 'Jerusalem Entry' }] },
    { day: 40, readings: [{ reference: 'Mark 12', title: 'Parables & Questions' }] },
    { day: 41, readings: [{ reference: 'Mark 13', title: 'The Olivet Discourse' }] },
    { day: 42, readings: [{ reference: 'Mark 14', title: 'Betrayal & Trial' }] },
    { day: 43, readings: [{ reference: 'Mark 15', title: 'Crucifixion' }] },
    { day: 44, readings: [{ reference: 'Mark 16', title: 'Resurrection' }] },
    // Luke
    { day: 45, readings: [{ reference: 'Luke 1', title: 'Birth Announcements' }] },
    { day: 46, readings: [{ reference: 'Luke 2', title: 'Birth of Jesus' }] },
    { day: 47, readings: [{ reference: 'Luke 3', title: 'John\'s Ministry' }] },
    { day: 48, readings: [{ reference: 'Luke 4', title: 'Temptation & Nazareth' }] },
    { day: 49, readings: [{ reference: 'Luke 5', title: 'Calling Disciples' }] },
    { day: 50, readings: [{ reference: 'Luke 6', title: 'Sermon on the Plain' }] },
    { day: 51, readings: [{ reference: 'Luke 7', title: 'Faith & Forgiveness' }] },
    { day: 52, readings: [{ reference: 'Luke 8', title: 'Parables & Miracles' }] },
    { day: 53, readings: [{ reference: 'Luke 9', title: 'Mission & Transfiguration' }] },
    { day: 54, readings: [{ reference: 'Luke 10', title: 'The Seventy-Two' }] },
    { day: 55, readings: [{ reference: 'Luke 11', title: 'Prayer & Woes' }] },
    { day: 56, readings: [{ reference: 'Luke 12', title: 'Warnings & Parables' }] },
    { day: 57, readings: [{ reference: 'Luke 13', title: 'Repentance' }] },
    { day: 58, readings: [{ reference: 'Luke 14', title: 'Cost of Discipleship' }] },
    { day: 59, readings: [{ reference: 'Luke 15', title: 'Lost & Found' }] },
    { day: 60, readings: [{ reference: 'Luke 16', title: 'Stewardship' }] },
  ];

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  const fullReadings: ReadingDay[] = [];
  for (let i = 0; i < 120; i++) { // 120 days for Gospels-focused
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const existingReading = readings.find(r => r.day === i + 1);
    fullReadings.push({
      day: i + 1,
      date: date.toISOString().split('T')[0],
      readings: existingReading?.readings || [{ 
        reference: `Gospel Day ${i + 1}`, 
        title: 'Walk with Jesus' 
      }],
      completed: false
    });
  }
  
  return fullReadings;
};

const DailyBibleReadingPlan: React.FC<DailyBibleReadingPlanProps> = ({
  user,
  onOpenAuth,
  onReadVerse
}) => {
  // State
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(() => {
    return localStorage.getItem('daily-reading-plan-id') || null;
  });
  
  const [completedDays, setCompletedDays] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem('daily-reading-completed');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [currentStreak, setCurrentStreak] = useState<number>(() => {
    const saved = localStorage.getItem('daily-reading-streak');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [longestStreak, setLongestStreak] = useState<number>(() => {
    const saved = localStorage.getItem('daily-reading-longest-streak');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [lastReadDate, setLastReadDate] = useState<string | null>(() => {
    return localStorage.getItem('daily-reading-last-date') || null;
  });
  
  const [planStartDate, setPlanStartDate] = useState<string | null>(() => {
    return localStorage.getItem('daily-reading-start-date') || null;
  });
  
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('daily-reading-reminder');
    return saved === 'true';
  });
  
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem('daily-reading-reminder-time') || '08:00';
  });

  const [showScripture, setShowScripture] = useState<boolean>(false);
  const [selectedReading, setSelectedReading] = useState<{ reference: string; title: string } | null>(null);
  const [scriptureContent, setScriptureContent] = useState<string>('');
  const [loadingScripture, setLoadingScripture] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Reading plans
  const plans: ReadingPlan[] = [
    {
      id: 'chronological',
      name: 'Chronological',
      description: 'Read the Bible in the order events occurred historically',
      icon: <Clock className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-600',
      totalDays: 365,
      readings: generateChronologicalPlan()
    },
    {
      id: 'parallel',
      name: 'Old & New Testament Parallel',
      description: 'Read from both testaments each day to see connections',
      icon: <BookMarked className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-600',
      totalDays: 365,
      readings: generateParallelPlan()
    },
    {
      id: 'gospels',
      name: 'Gospels-Focused',
      description: 'Deep dive into the life and teachings of Jesus',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-rose-500 to-pink-600',
      totalDays: 120,
      readings: generateGospelsPlan()
    }
  ];

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  // Calculate today's day number in the plan
  const getTodaysDayNumber = (): number => {
    if (!planStartDate) return 1;
    const start = new Date(planStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(diffDays + 1, selectedPlan?.totalDays || 365));
  };

  const todaysDayNumber = getTodaysDayNumber();
  const todaysReading = selectedPlan?.readings.find(r => r.day === todaysDayNumber);

  // Persistence.
  //
  // These eight values were eight separate localStorage keys and eight write
  // effects, so they never left the browser. They are synced to the database as
  // a single reading_plan object on user_data: one row, one round trip, and the
  // values only make sense together anyway. localStorage is still written as an
  // offline cache, which is what the useState initialisers above read.
  const readingState = React.useMemo(() => ({
    planId: selectedPlanId,
    completedDays,
    currentStreak,
    longestStreak,
    lastReadDate,
    planStartDate,
    reminderEnabled,
    reminderTime,
  }), [selectedPlanId, completedDays, currentStreak, longestStreak,
       lastReadDate, planStartDate, reminderEnabled, reminderTime]);

  const [syncedReading, setSyncedReading] = useSyncedState<typeof readingState>(
    'daily-reading-state', 'reading_plan', readingState, user);

  // Hydrate the individual pieces once, when the database answers with data
  // that is newer than this device's cache.
  const hydrated = React.useRef(false);
  useEffect(() => {
    if (hydrated.current || !syncedReading) return;
    const r = syncedReading;
    const hasData = r.planId || (r.completedDays && Object.keys(r.completedDays).length > 0);
    if (!hasData) return;
    hydrated.current = true;
    if (r.planId !== undefined) setSelectedPlanId(r.planId);
    if (r.completedDays) setCompletedDays(r.completedDays);
    if (typeof r.currentStreak === 'number') setCurrentStreak(r.currentStreak);
    if (typeof r.longestStreak === 'number') setLongestStreak(r.longestStreak);
    if (r.lastReadDate !== undefined) setLastReadDate(r.lastReadDate);
    if (r.planStartDate !== undefined) setPlanStartDate(r.planStartDate);
    if (typeof r.reminderEnabled === 'boolean') setReminderEnabled(r.reminderEnabled);
    if (r.reminderTime) setReminderTime(r.reminderTime);
  }, [syncedReading]);

  // Push local edits up. Skipped until hydration has had its chance, so a fresh
  // device cannot overwrite good server data with its empty defaults.
  useEffect(() => {
    if (!hydrated.current && user) {
      // Allow the first write only once there is something worth saving.
      const hasLocal = selectedPlanId || Object.keys(completedDays).length > 0;
      if (!hasLocal) return;
      hydrated.current = true;
    }
    setSyncedReading(readingState);
  }, [readingState, user, setSyncedReading, selectedPlanId, completedDays]);

  // Individual cache keys are still written so existing installs keep working
  // and the values survive a reload before the first sync completes.
  useEffect(() => {
    if (selectedPlanId) localStorage.setItem('daily-reading-plan-id', selectedPlanId);
    localStorage.setItem('daily-reading-completed', JSON.stringify(completedDays));
    localStorage.setItem('daily-reading-streak', currentStreak.toString());
    localStorage.setItem('daily-reading-longest-streak', longestStreak.toString());
    if (lastReadDate) localStorage.setItem('daily-reading-last-date', lastReadDate);
    if (planStartDate) localStorage.setItem('daily-reading-start-date', planStartDate);
    localStorage.setItem('daily-reading-reminder', reminderEnabled.toString());
    localStorage.setItem('daily-reading-reminder-time', reminderTime);
  }, [selectedPlanId, completedDays, currentStreak, longestStreak,
      lastReadDate, planStartDate, reminderEnabled, reminderTime]);

  // Check and update streak
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (lastReadDate === today) {
      // Already read today, streak is current
    } else if (lastReadDate === yesterday) {
      // Read yesterday, streak continues if we read today
    } else if (lastReadDate && lastReadDate !== today && lastReadDate !== yesterday) {
      // Missed a day, reset streak
      setCurrentStreak(0);
    }
  }, [lastReadDate]);

  // Start a plan
  const handleStartPlan = (planId: string) => {
    setSelectedPlanId(planId);
    const today = new Date().toISOString().split('T')[0];
    setPlanStartDate(today);
    setCompletedDays(prev => ({ ...prev, [planId]: [] }));
  };

  // Complete a day's reading
  const handleCompleteDay = (day: number) => {
    if (!selectedPlanId) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    setCompletedDays(prev => {
      const planCompleted = prev[selectedPlanId] || [];
      if (planCompleted.includes(day)) return prev;
      return {
        ...prev,
        [selectedPlanId]: [...planCompleted, day]
      };
    });
    
    // Update streak
    if (lastReadDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastReadDate === yesterday || !lastReadDate) {
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        if (newStreak > longestStreak) {
          setLongestStreak(newStreak);
        }
      } else {
        setCurrentStreak(1);
      }
      setLastReadDate(today);
    }
  };

  // Load scripture content
  const handleReadScripture = async (reading: { reference: string; title: string }) => {
    setSelectedReading(reading);
    setShowScripture(true);
    setLoadingScripture(true);
    
    // Simulate loading scripture (in production, this would call an API)
    setTimeout(() => {
      // Sample scripture content based on reference
      const sampleContent = getSampleScripture(reading.reference);
      setScriptureContent(sampleContent);
      setLoadingScripture(false);
    }, 500);
  };

  // Get sample scripture content
  const getSampleScripture = (reference: string): string => {
    const scriptures: Record<string, string> = {
      'Genesis 1-3': `GENESIS 1

1 In the beginning God created the heavens and the earth.
2 The earth was formless and void, and darkness was over the surface of the deep, and the Spirit of God was moving over the surface of the waters.
3 Then God said, "Let there be light"; and there was light.
4 God saw that the light was good; and God separated the light from the darkness.
5 God called the light day, and the darkness He called night. And there was evening and there was morning, one day.

26 Then God said, "Let Us make man in Our image, according to Our likeness; and let them rule over the fish of the sea and over the birds of the sky and over the cattle and over all the earth, and over every creeping thing that creeps on the earth."
27 God created man in His own image, in the image of God He created him; male and female He created them.
28 God blessed them; and God said to them, "Be fruitful and multiply, and fill the earth, and subdue it."

31 God saw all that He had made, and behold, it was very good. And there was evening and there was morning, the sixth day.`,
      'Matthew 1': `MATTHEW 1

1 The book of the generation of Jesus Christ, the son of David, the son of Abraham.
2 Abraham begat Isaac; and Isaac begat Jacob; and Jacob begat Judas and his brethren;

18 Now the birth of Jesus Christ was on this wise: When as his mother Mary was espoused to Joseph, before they came together, she was found with child of the Holy Ghost.
19 Then Joseph her husband, being a just man, and not willing to make her a publick example, was minded to put her away privily.
20 But while he thought on these things, behold, the angel of the Lord appeared unto him in a dream, saying, Joseph, thou son of David, fear not to take unto thee Mary thy wife: for that which is conceived in her is of the Holy Ghost.
21 And she shall bring forth a son, and thou shalt call his name JESUS: for he shall save his people from their sins.

23 Behold, a virgin shall be with child, and shall bring forth a son, and they shall call his name Emmanuel, which being interpreted is, God with us.

25 And knew her not till she had brought forth her firstborn son: and he called his name JESUS.`,
    };
    

    
    return scriptures[reference] || `Scripture content for ${reference}\n\nThis reading covers important passages that will deepen your understanding of God's Word. Take time to meditate on these verses and let them transform your heart.\n\n"Your word is a lamp to my feet and a light to my path." - Psalm 119:105`;
  };

  // Calculate progress
  const getProgress = (): number => {
    if (!selectedPlanId || !selectedPlan) return 0;
    const completed = completedDays[selectedPlanId]?.length || 0;
    return Math.round((completed / selectedPlan.totalDays) * 100);
  };

  // Check if a day is completed
  const isDayCompleted = (day: number): boolean => {
    if (!selectedPlanId) return false;
    return completedDays[selectedPlanId]?.includes(day) || false;
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      const isToday = dateStr === today;
      
      // Find the day number in the plan for this date
      let planDay: number | null = null;
      if (planStartDate) {
        const start = new Date(planStartDate);
        start.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        const diffTime = date.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < (selectedPlan?.totalDays || 365)) {
          planDay = diffDays + 1;
        }
      }
      
      const isCompleted = planDay ? isDayCompleted(planDay) : false;
      
      days.push(
        <div
          key={day}
          className={`h-10 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-all ${
            isToday
              ? 'bg-[#c9a227] text-[#1a1510] ring-2 ring-[#c9a227]/50'
              : isCompleted
              ? 'bg-green-500/20 text-green-400'
              : planDay
              ? 'bg-white/5 text-[#f5f0e6] hover:bg-white/10'
              : 'text-[#f5f0e6]/30'
          }`}
          onClick={() => {
            if (planDay && selectedPlan) {
              const reading = selectedPlan.readings.find(r => r.day === planDay);
              if (reading && reading.readings[0]) {
                handleReadScripture(reading.readings[0]);
              }
            }
          }}
        >
          {isCompleted ? <Check className="w-4 h-4" /> : day}
        </div>
      );
    }
    
    return days;
  };

  // Reset plan
  const handleResetPlan = () => {
    if (!selectedPlanId) return;
    const today = new Date().toISOString().split('T')[0];
    setPlanStartDate(today);
    setCompletedDays(prev => ({ ...prev, [selectedPlanId]: [] }));
    setCurrentStreak(0);
    setLastReadDate(null);
  };

  // Plan selection view
  if (!selectedPlanId) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a227]/30 to-[#c9a227]/10 mb-6">
            <CalendarDays className="w-10 h-10 text-[#c9a227]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5f0e6] mb-4">
            Daily Bible Reading Plans
          </h1>
          <p className="text-lg text-[#f5f0e6]/70 max-w-2xl mx-auto">
            Choose a reading plan to guide you through Scripture. Track your progress, 
            build a daily habit, and grow in your knowledge of God's Word.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-[#2a3540] rounded-2xl border border-[#c9a227]/20 overflow-hidden hover:border-[#c9a227]/50 transition-all group"
            >
              <div className={`h-32 bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white">
                  {plan.icon}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-[#f5f0e6] mb-2 group-hover:text-[#c9a227] transition-colors">
                  {plan.name}
                </h3>
                <p className="text-[#f5f0e6]/60 text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-center justify-between text-sm text-[#f5f0e6]/50 mb-4">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{plan.totalDays} days</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{plan.readings.length} readings</span>
                  </span>
                </div>
                <button
                  onClick={() => handleStartPlan(plan.id)}
                  className="w-full py-3 bg-[#c9a227] text-[#1a1510] font-semibold rounded-xl hover:bg-[#d4b82e] transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Plan</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#c9a227]/20 flex items-center justify-center">
              <Flame className="w-7 h-7 text-[#c9a227]" />
            </div>
            <h4 className="text-lg font-semibold text-[#f5f0e6] mb-2">Build a Streak</h4>
            <p className="text-[#f5f0e6]/60 text-sm">
              Track consecutive days of reading and build a lasting habit of daily Scripture study.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#c9a227]/20 flex items-center justify-center">
              <Target className="w-7 h-7 text-[#c9a227]" />
            </div>
            <h4 className="text-lg font-semibold text-[#f5f0e6] mb-2">Track Progress</h4>
            <p className="text-[#f5f0e6]/60 text-sm">
              See your journey through the Bible with visual progress tracking and completion markers.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#c9a227]/20 flex items-center justify-center">
              <Bell className="w-7 h-7 text-[#c9a227]" />
            </div>
            <h4 className="text-lg font-semibold text-[#f5f0e6] mb-2">Gentle Reminders</h4>
            <p className="text-[#f5f0e6]/60 text-sm">
              Set daily reminders to help you stay consistent with your reading plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active plan view
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Scripture Modal */}
      {showScripture && selectedReading && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#2a3540] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-[#c9a227]/20 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#c9a227]">
                  {selectedReading.reference}
                </h3>
                <p className="text-[#f5f0e6]/60 text-sm">{selectedReading.title}</p>
              </div>
              <button
                onClick={() => setShowScripture(false)}
                className="p-2 text-[#f5f0e6]/60 hover:text-[#f5f0e6] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingScripture ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-serif text-[#f5f0e6] text-lg leading-relaxed">
                    {scriptureContent}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-[#c9a227]/20 flex items-center justify-between">
              <button
                onClick={() => {
                  onReadVerse(selectedReading.reference);
                  setShowScripture(false);
                }}
                className="px-4 py-2 text-[#c9a227] hover:bg-[#c9a227]/10 rounded-lg transition-colors flex items-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Open in Bible Reader</span>
              </button>
              <button
                onClick={() => {
                  const dayNum = selectedPlan?.readings.findIndex(r => 
                    r.readings.some(rd => rd.reference === selectedReading.reference)
                  );
                  if (dayNum !== undefined && dayNum >= 0) {
                    handleCompleteDay(dayNum + 1);
                  }
                  setShowScripture(false);
                }}
                className="px-6 py-2 bg-[#c9a227] text-[#1a1510] font-semibold rounded-lg hover:bg-[#d4b82e] transition-colors flex items-center space-x-2"
              >
                <Check className="w-5 h-5" />
                <span>Mark as Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Plan Info */}
      <div className="bg-[#2a3540] rounded-2xl border border-[#c9a227]/20 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedPlan?.color} flex items-center justify-center text-white`}>
              {selectedPlan?.icon}
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#f5f0e6]">
                {selectedPlan?.name}
              </h1>
              <p className="text-[#f5f0e6]/60">{selectedPlan?.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedPlanId(null)}
              className="px-4 py-2 text-[#f5f0e6]/60 hover:text-[#f5f0e6] hover:bg-white/5 rounded-lg transition-colors"
            >
              Change Plan
            </button>
            <button
              onClick={handleResetPlan}
              className="px-4 py-2 text-[#f5f0e6]/60 hover:text-[#f5f0e6] hover:bg-white/5 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#f5f0e6]/60">Overall Progress</span>
            <span className="text-[#c9a227] font-medium">{getProgress()}% Complete</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#c9a227] to-[#d4b82e] transition-all duration-500"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#f5f0e6]/50 mt-2">
            <span>{completedDays[selectedPlanId]?.length || 0} days completed</span>
            <span>{selectedPlan?.totalDays} total days</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#2a3540] rounded-xl border border-[#c9a227]/20 p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-[#f5f0e6]">{currentStreak}</div>
          <div className="text-xs text-[#f5f0e6]/60">Current Streak</div>
        </div>
        <div className="bg-[#2a3540] rounded-xl border border-[#c9a227]/20 p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-[#f5f0e6]">{longestStreak}</div>
          <div className="text-xs text-[#f5f0e6]/60">Longest Streak</div>
        </div>
        <div className="bg-[#2a3540] rounded-xl border border-[#c9a227]/20 p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-[#f5f0e6]">{completedDays[selectedPlanId]?.length || 0}</div>
          <div className="text-xs text-[#f5f0e6]/60">Days Completed</div>
        </div>
        <div className="bg-[#2a3540] rounded-xl border border-[#c9a227]/20 p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-[#f5f0e6]">Day {todaysDayNumber}</div>
          <div className="text-xs text-[#f5f0e6]/60">Current Day</div>
        </div>
      </div>

      {/* Today's Reading */}
      {todaysReading && (
        <div className="bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 rounded-2xl border border-[#c9a227]/30 p-6 mb-8">
          <div className="flex items-center space-x-2 text-[#c9a227] mb-4">
            <Sun className="w-5 h-5" />
            <span className="font-semibold">Today's Reading - Day {todaysDayNumber}</span>
          </div>
          <div className="space-y-3">
            {todaysReading.readings.map((reading, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-[#2a3540] rounded-xl p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDayCompleted(todaysDayNumber) 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-[#c9a227]/20 text-[#c9a227]'
                  }`}>
                    {isDayCompleted(todaysDayNumber) ? <Check className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#f5f0e6]">{reading.reference}</h4>
                    <p className="text-sm text-[#f5f0e6]/60">{reading.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleReadScripture(reading)}
                  className="px-4 py-2 bg-[#c9a227] text-[#1a1510] font-semibold rounded-lg hover:bg-[#d4b82e] transition-colors"
                >
                  Read Now
                </button>
              </div>
            ))}
          </div>
          {!isDayCompleted(todaysDayNumber) && (
            <button
              onClick={() => handleCompleteDay(todaysDayNumber)}
              className="mt-4 w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>Mark Today as Complete</span>
            </button>
          )}
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif font-bold text-[#f5f0e6]">Reading Schedule</h2>
        <div className="flex items-center bg-[#2a3540] rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar' 
                ? 'bg-[#c9a227] text-[#1a1510]' 
                : 'text-[#f5f0e6]/60 hover:text-[#f5f0e6]'
            }`}
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-[#c9a227] text-[#1a1510]' 
                : 'text-[#f5f0e6]/60 hover:text-[#f5f0e6]'
            }`}
          >
            <ScrollText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-[#2a3540] rounded-2xl border border-[#c9a227]/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 text-[#f5f0e6]/60 hover:text-[#f5f0e6] hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-[#f5f0e6]">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 text-[#f5f0e6]/60 hover:text-[#f5f0e6] hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-[#f5f0e6]/50 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>

          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-[#c9a227]" />
              <span className="text-[#f5f0e6]/60">Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-green-400" />
              </div>
              <span className="text-[#f5f0e6]/60">Completed</span>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-[#2a3540] rounded-2xl border border-[#c9a227]/20 overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            {selectedPlan?.readings.slice(0, 60).map((day) => {
              const isCompleted = isDayCompleted(day.day);
              const isToday = day.day === todaysDayNumber;
              
              return (
                <div
                  key={day.day}
                  className={`flex items-center justify-between p-4 border-b border-[#c9a227]/10 last:border-b-0 ${
                    isToday ? 'bg-[#c9a227]/10' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCompleted 
                        ? 'bg-green-500/20 text-green-400' 
                        : isToday
                        ? 'bg-[#c9a227] text-[#1a1510]'
                        : 'bg-white/10 text-[#f5f0e6]/60'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : day.day}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-medium ${isCompleted ? 'text-green-400' : 'text-[#f5f0e6]'}`}>
                          {day.readings.map(r => r.reference).join(' + ')}
                        </h4>
                        {isToday && (
                          <span className="px-2 py-0.5 bg-[#c9a227] text-[#1a1510] text-xs font-bold rounded">
                            TODAY
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#f5f0e6]/50">
                        {day.readings.map(r => r.title).join(' • ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReadScripture(day.readings[0])}
                      className="p-2 text-[#f5f0e6]/60 hover:text-[#c9a227] transition-colors"
                      title="Read"
                    >
                      <BookOpen className="w-5 h-5" />
                    </button>
                    {!isCompleted && (
                      <button
                        onClick={() => handleCompleteDay(day.day)}
                        className="p-2 bg-[#c9a227] text-[#1a1510] rounded-lg hover:bg-[#d4b82e] transition-colors"
                        title="Mark Complete"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reminder Settings */}
      <div className="mt-8 bg-[#2a3540] rounded-2xl border border-[#c9a227]/20 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="w-5 h-5 text-[#c9a227]" />
          <h3 className="text-lg font-semibold text-[#f5f0e6]">Daily Reminder</h3>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-[#f5f0e6]/60 text-sm">
            Get a gentle reminder to complete your daily reading
          </p>
          <div className="flex items-center space-x-4">
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-[#c9a227]/20 rounded-lg text-[#f5f0e6] focus:outline-none focus:border-[#c9a227]"
              disabled={!reminderEnabled}
            />
            <button
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                reminderEnabled ? 'bg-[#c9a227]' : 'bg-white/20'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                reminderEnabled ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
        {reminderEnabled && (
          <p className="mt-3 text-sm text-[#c9a227]">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Reminder set for {reminderTime} daily
          </p>
        )}
      </div>
    </div>
  );
};

export default DailyBibleReadingPlan;
