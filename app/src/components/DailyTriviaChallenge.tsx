import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Calendar, Trophy, Flame, Star, Award, Clock, CheckCircle, XCircle, Loader2, Bell, BellOff, ChevronLeft, ChevronRight, Sparkles, Target, Zap, Crown, Medal, Gift } from 'lucide-react';

interface DailyTriviaChallengeProps {
  user: User | null;
  onOpenAuth: () => void;
  onReadVerse: (reference: string) => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  difficulty: string;
  category: string;
  reference: string;
  questionNumber: number;
}

interface ChallengeData {
  id: string;
  questions: Question[];
  answers: Array<{ questionIndex: number; selectedAnswer: number; isCorrect: boolean; pointsEarned: number }>;
  score: number;
  completed: boolean;
  perfect_score: boolean;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_days_completed: number;
  total_points: number;
  perfect_days: number;
  last_completed_date: string | null;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type?: string;
  unlocked_at?: string;
}

interface CalendarDay {
  date: string;
  completed: boolean;
  perfect_score: boolean;
  score: number;
}

const achievementIcons: Record<string, React.ReactNode> = {
  'first_day': <Star className="w-6 h-6" />,
  'week_streak': <Flame className="w-6 h-6" />,
  'two_week_streak': <Zap className="w-6 h-6" />,
  'month_streak': <Trophy className="w-6 h-6" />,
  'quarter_streak': <Crown className="w-6 h-6" />,
  'year_streak': <Sparkles className="w-6 h-6" />,
  'perfect_5': <Target className="w-6 h-6" />,
  'perfect_25': <Medal className="w-6 h-6" />,
  'perfect_100': <Award className="w-6 h-6" />,
  'total_50': <Gift className="w-6 h-6" />,
  'total_100': <Trophy className="w-6 h-6" />,
  'total_500': <Crown className="w-6 h-6" />,
};

const difficultyColors: Record<string, string> = {
  beginner: 'from-green-500 to-emerald-600',
  intermediate: 'from-blue-500 to-cyan-600',
  advanced: 'from-purple-500 to-violet-600',
  expert: 'from-red-500 to-rose-600',
};

const DailyTriviaChallenge: React.FC<DailyTriviaChallengeProps> = ({ user, onOpenAuth, onReadVerse }) => {
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [difficulty, setDifficulty] = useState('beginner');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'challenge' | 'achievements' | 'calendar' | 'leaderboard'>('challenge');

  // Generate a consistent user ID for guests
  const getUserId = () => {
    if (user) return user.id;
    let guestId = localStorage.getItem('daily-trivia-guest-id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('daily-trivia-guest-id', guestId);
    }
    return guestId;
  };

  // Load daily challenge
  useEffect(() => {
    loadDailyChallenge();
    checkNotificationPermission();
  }, [user]);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        // Schedule daily reminder
        scheduleNotification();
      }
    }
  };

  const scheduleNotification = () => {
    // Store preference in localStorage
    localStorage.setItem('daily-trivia-notifications', 'enabled');
  };

  const loadDailyChallenge = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-trivia', {
        body: {
          action: 'get_daily_challenge',
          userId: getUserId(),
        },
      });

      if (error) throw error;

      if (data.success) {
        setChallenge(data.challenge);
        setStreak(data.streak);
        setAchievements(data.achievements || []);
        setAllAchievements(data.allAchievements || []);
        setCalendar(data.calendar || []);
        setDifficulty(data.difficulty);

        // Set current question index based on answers
        if (data.challenge.answers && data.challenge.answers.length > 0 && !data.challenge.completed) {
          setCurrentQuestionIndex(data.challenge.answers.length);
        }
      }
    } catch (err) {
      console.error('Error loading daily challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult || submitting) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || submitting) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-trivia', {
        body: {
          action: 'submit_answer',
          userId: getUserId(),
          answers: {
            questionIndex: currentQuestionIndex,
            selectedAnswer,
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        setIsCorrect(data.isCorrect);
        setExplanation(data.explanation);
        setShowResult(true);

        // Update challenge state
        if (challenge) {
          const newAnswers = [
            ...challenge.answers,
            {
              questionIndex: currentQuestionIndex,
              selectedAnswer,
              isCorrect: data.isCorrect,
              pointsEarned: data.pointsEarned,
            },
          ];
          setChallenge({
            ...challenge,
            answers: newAnswers,
            score: data.totalScore,
            completed: data.isCompleted,
            perfect_score: data.isPerfect,
          });
        }

        // Update streak if completed
        if (data.streak) {
          setStreak(data.streak);
        }

        // Show new achievements
        if (data.newAchievements && data.newAchievements.length > 0) {
          setNewAchievements(data.newAchievements);
          setShowAchievementModal(true);
          // Add to achievements list
          setAchievements(prev => [...prev, ...data.newAchievements]);
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return achievements.some(a => a.achievement_id === achievementId || a.id === achievementId);
  };

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (CalendarDay | null)[] = [];

    // Add empty days for alignment
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = calendar.find(c => c.date === dateStr);
      days.push(dayData || { date: dateStr, completed: false, perfect_score: false, score: 0 });
    }

    return days;
  };

  const currentQuestion = challenge?.questions?.[currentQuestionIndex];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#14B8A6] animate-spin mb-4" />
          <p className="text-white/60">Loading today's challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#14B8A6]/20 mb-4">
          <Calendar className="w-8 h-8 text-[#F59E0B]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2">
          Daily <span className="text-[#F59E0B]">Trivia</span> Challenge
        </h1>
        <p className="text-white/60">5 new questions every day - build your streak!</p>
      </div>

      {/* Streak & Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-1">
            <Flame className="w-5 h-5 text-orange-400 mr-1" />
            <span className="text-2xl font-bold text-orange-400">{streak?.current_streak || 0}</span>
          </div>
          <p className="text-white/60 text-xs">Day Streak</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-1">
            <Trophy className="w-5 h-5 text-purple-400 mr-1" />
            <span className="text-2xl font-bold text-purple-400">{streak?.longest_streak || 0}</span>
          </div>
          <p className="text-white/60 text-xs">Best Streak</p>
        </div>
        <div className="bg-gradient-to-br from-[#14B8A6]/20 to-[#0D9488]/20 border border-[#14B8A6]/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-1">
            <Star className="w-5 h-5 text-[#14B8A6] mr-1" />
            <span className="text-2xl font-bold text-[#14B8A6]">{streak?.total_points || 0}</span>
          </div>
          <p className="text-white/60 text-xs">Total Points</p>
        </div>
        <div className="bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/20 border border-[#F59E0B]/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-1">
            <Award className="w-5 h-5 text-[#F59E0B] mr-1" />
            <span className="text-2xl font-bold text-[#F59E0B]">{streak?.perfect_days || 0}</span>
          </div>
          <p className="text-white/60 text-xs">Perfect Days</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'challenge', label: "Today's Challenge", icon: Target },
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Challenge Tab */}
      {activeTab === 'challenge' && (
        <div className="space-y-6">
          {/* Difficulty Badge */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${difficultyColors[difficulty]} text-white font-medium`}>
              <Zap className="w-4 h-4 mr-2" />
              Today's Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </div>
            <div className="text-white/60 text-sm">
              Question {currentQuestionIndex + 1} of 5
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#14B8A6] to-[#3B82F6] transition-all duration-300"
              style={{ width: `${((challenge?.answers?.length || 0) / 5) * 100}%` }}
            />
          </div>

          {challenge?.completed ? (
            /* Completion Screen */
            <div className="bg-gradient-to-br from-[#F59E0B]/20 via-[#0f2942] to-[#14B8A6]/20 border border-[#F59E0B]/30 rounded-2xl p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                {challenge.perfect_score ? (
                  <Sparkles className="w-12 h-12 text-white" />
                ) : (
                  <CheckCircle className="w-12 h-12 text-white" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {challenge.perfect_score ? 'Perfect Score!' : 'Challenge Complete!'}
              </h2>
              <p className="text-white/60 mb-6">
                {challenge.perfect_score
                  ? "Amazing! You got all 5 questions correct!"
                  : "Great job completing today's challenge!"}
              </p>

              <div className="text-5xl font-bold text-[#F59E0B] mb-2">{challenge.score}</div>
              <p className="text-white/60 mb-6">Points Earned Today</p>

              {challenge.perfect_score && (
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 border border-[#F59E0B]/30 rounded-full text-[#F59E0B] mb-6">
                  <Star className="w-5 h-5 mr-2" />
                  +50 Perfect Bonus!
                </div>
              )}

              <div className="grid grid-cols-5 gap-2 mb-6">
                {challenge.answers.map((answer, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      answer.isCorrect
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-red-500/20 border border-red-500/30'
                    }`}
                  >
                    {answer.isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 mx-auto" />
                    )}
                  </div>
                ))}
              </div>

              <p className="text-white/60 text-sm">
                Come back tomorrow for a new challenge!
              </p>
            </div>
          ) : currentQuestion ? (
            /* Question Card */
            <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/70">
                  {currentQuestion.category}
                </span>
                <span className="text-white/60 text-sm">
                  +20 points
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Answer Options */}
              <div className="grid gap-3 mb-6">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.correct;

                  let buttonClass = 'bg-white/5 border-white/20 hover:border-[#14B8A6]/50 hover:bg-white/10';
                  if (showResult) {
                    if (isCorrectAnswer) {
                      buttonClass = 'bg-green-500/20 border-green-500 text-green-400';
                    } else if (isSelected && !isCorrectAnswer) {
                      buttonClass = 'bg-red-500/20 border-red-500 text-red-400';
                    } else {
                      buttonClass = 'bg-white/5 border-white/10 opacity-50';
                    }
                  } else if (isSelected) {
                    buttonClass = 'bg-[#14B8A6]/20 border-[#14B8A6] text-[#14B8A6]';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${buttonClass} ${
                        !showResult ? 'text-white' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold ${
                          showResult && isCorrectAnswer ? 'bg-green-500 text-white' :
                          showResult && isSelected && !isCorrectAnswer ? 'bg-red-500 text-white' :
                          isSelected ? 'bg-[#14B8A6] text-white' :
                          'bg-white/10 text-white/60'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {showResult && isCorrectAnswer && (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        )}
                        {showResult && isSelected && !isCorrectAnswer && (
                          <XCircle className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showResult && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </p>
                      <p className="text-white/80 text-sm">Scripture Reference: {explanation}</p>
                      <button
                        onClick={() => onReadVerse(explanation)}
                        className="mt-2 text-[#14B8A6] text-sm hover:underline flex items-center"
                      >
                        Read this passage
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center">
                {!showResult ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null || submitting}
                    className={`px-8 py-3 font-bold rounded-xl transition-all flex items-center ${
                      selectedAnswer === null
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white hover:from-[#0D9488] hover:to-[#0F766E] glow-teal'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Submit Answer'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-8 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-bold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all glow-teal flex items-center"
                  >
                    {currentQuestionIndex < 4 ? (
                      <>
                        Next Question
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      <>
                        See Results
                        <Trophy className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Notification Toggle */}
          <div className="bg-gradient-to-br from-[#3B82F6]/10 via-[#0f2942] to-[#14B8A6]/10 border border-[#3B82F6]/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {notificationsEnabled ? (
                  <Bell className="w-6 h-6 text-[#3B82F6]" />
                ) : (
                  <BellOff className="w-6 h-6 text-white/40" />
                )}
                <div>
                  <h3 className="text-white font-medium">Daily Reminders</h3>
                  <p className="text-white/60 text-sm">
                    {notificationsEnabled
                      ? "You'll be reminded to complete your daily challenge"
                      : 'Enable notifications to never miss a day'}
                  </p>
                </div>
              </div>
              <button
                onClick={requestNotificationPermission}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  notificationsEnabled
                    ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'
                    : 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white'
                }`}
              >
                {notificationsEnabled ? 'Enabled' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#F59E0B]/10 via-[#0f2942] to-[#14B8A6]/10 border border-[#F59E0B]/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-[#F59E0B]" />
              Your Achievements
            </h2>
            <p className="text-white/60 mb-6">
              {achievements.length} of {allAchievements.length} achievements unlocked
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allAchievements.map((achievement) => {
                const unlocked = isAchievementUnlocked(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      unlocked
                        ? 'bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/20 border-[#F59E0B]/50'
                        : 'bg-white/5 border-white/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        unlocked
                          ? 'bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white'
                          : 'bg-white/10 text-white/40'
                      }`}>
                        {achievementIcons[achievement.id] || <Award className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold ${unlocked ? 'text-[#F59E0B]' : 'text-white/60'}`}>
                          {achievement.name}
                        </h3>
                        <p className="text-white/60 text-sm">{achievement.description}</p>
                        {!unlocked && (
                          <div className="mt-2 text-xs text-white/40">
                            {achievement.type === 'perfect'
                              ? `${streak?.perfect_days || 0}/${achievement.requirement} perfect days`
                              : achievement.type === 'total'
                              ? `${streak?.total_days_completed || 0}/${achievement.requirement} days completed`
                              : `${streak?.current_streak || 0}/${achievement.requirement} day streak`}
                          </div>
                        )}
                      </div>
                      {unlocked && (
                        <CheckCircle className="w-6 h-6 text-[#F59E0B]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-white">
                {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-white/40 text-xs font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getCalendarDays().map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const isToday = day.date === new Date().toISOString().split('T')[0];
                const isFuture = new Date(day.date) > new Date();

                return (
                  <div
                    key={day.date}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
                      day.completed
                        ? day.perfect_score
                          ? 'bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white'
                          : 'bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white'
                        : isToday
                        ? 'bg-white/20 border-2 border-[#14B8A6] text-white'
                        : isFuture
                        ? 'bg-white/5 text-white/30'
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    <span className="font-medium">{parseInt(day.date.split('-')[2])}</span>
                    {day.completed && (
                      <span className="text-[10px] mt-0.5">
                        {day.perfect_score ? '★' : '✓'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-[#14B8A6] to-[#0D9488]" />
                <span className="text-white/60">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-[#F59E0B] to-[#D97706]" />
                <span className="text-white/60">Perfect</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-white/5 border border-white/20" />
                <span className="text-white/60">Missed</span>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="bg-gradient-to-br from-[#3B82F6]/10 via-[#0f2942] to-[#14B8A6]/10 border border-[#3B82F6]/30 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Your Journey</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#14B8A6]">{streak?.total_days_completed || 0}</div>
                <p className="text-white/60 text-sm">Total Days</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#F59E0B]">{streak?.perfect_days || 0}</div>
                <p className="text-white/60 text-sm">Perfect Days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Unlock Modal */}
      {showAchievementModal && newAchievements.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-[#F59E0B]/50 rounded-2xl p-8 max-w-md w-full text-center animate-bounce-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#F59E0B] mb-2">Achievement Unlocked!</h2>
            {newAchievements.map((achievement) => (
              <div key={achievement.id} className="mb-4">
                <h3 className="text-xl font-bold text-white">{achievement.name}</h3>
                <p className="text-white/60">{achievement.description}</p>
              </div>
            ))}
            <button
              onClick={() => setShowAchievementModal(false)}
              className="px-8 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-bold rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Sign In Prompt for Sync */}
      {!user && (
        <div className="mt-6 p-4 bg-gradient-to-r from-[#14B8A6]/10 to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-xl text-center">
          <p className="text-white/80 mb-3">
            Sign in to sync your progress across all your devices and never lose your streak!
          </p>
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-medium rounded-lg hover:from-[#0D9488] hover:to-[#0F766E] transition-all glow-teal"
          >
            Sign In to Sync
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyTriviaChallenge;
