import React, { useState, useEffect } from 'react';
import { Brain, Trophy, Flame, Calendar, Star, ChevronRight, Zap, Target, Award, Swords, Users, Crown, Eye, Radio } from 'lucide-react';

interface TriviaSectionProps {
  onNavigateToTrivia: () => void;
  onNavigateToDailyChallenge: () => void;
  onNavigateToMultiplayer?: () => void;
  onNavigateToTournament?: () => void;
  onNavigateToSpectator?: () => void;
}

const TriviaSection: React.FC<TriviaSectionProps> = ({
  onNavigateToTrivia,
  onNavigateToDailyChallenge,
  onNavigateToMultiplayer,
  onNavigateToTournament,
  onNavigateToSpectator,
}) => {


  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [sampleQuestion, setSampleQuestion] = useState({
    question: "How many days did it rain during the great flood?",
    options: ["7 days", "40 days", "100 days", "150 days"],
    correctIndex: 1,
    reference: "Genesis 7:12"
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Load streak from localStorage
  useEffect(() => {
    const savedStreak = localStorage.getItem('daily-trivia-streak');
    if (savedStreak) {
      setCurrentStreak(parseInt(savedStreak, 10));
    }
    const savedTotal = localStorage.getItem('trivia-total-questions');
    if (savedTotal) {
      setTotalQuestions(parseInt(savedTotal, 10));
    }
  }, []);

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
  };

  const resetSample = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const difficultyLevels = [
    { name: 'Beginner', color: 'from-green-500 to-emerald-600', icon: Star },
    { name: 'Intermediate', color: 'from-blue-500 to-indigo-600', icon: Target },
    { name: 'Advanced', color: 'from-purple-500 to-violet-600', icon: Zap },
    { name: 'Expert', color: 'from-red-500 to-rose-600', icon: Trophy },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c1929] via-[#14B8A6]/5 to-[#0c1929]" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#F59E0B]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#14B8A6]/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#F59E0B]/20 to-[#14B8A6]/20 border border-[#F59E0B]/30 rounded-full mb-6">
            <Brain className="w-5 h-5 text-[#F59E0B]" />
            <span className="text-[#F59E0B] font-medium">Test Your Knowledge</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
            Bible <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#14B8A6]">Trivia</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Challenge yourself with questions from Scripture. From beginner to expert, 
            grow in your knowledge of God's Word while having fun!
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Sample Question */}
          <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-[#F59E0B]" />
                <span>Try a Sample Question</span>
              </h3>
              {showResult && (
                <button
                  onClick={resetSample}
                  className="text-sm text-[#14B8A6] hover:text-[#14B8A6]/80 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>

            <p className="text-white text-lg mb-6">{sampleQuestion.question}</p>

            <div className="space-y-3 mb-6">
              {sampleQuestion.options.map((option, index) => {
                const isCorrect = index === sampleQuestion.correctIndex;
                const isSelected = selectedAnswer === index;
                
                let buttonClass = "w-full p-4 rounded-xl text-left transition-all ";
                
                if (showResult) {
                  if (isCorrect) {
                    buttonClass += "bg-green-500/20 border-2 border-green-500 text-green-400";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "bg-red-500/20 border-2 border-red-500 text-red-400";
                  } else {
                    buttonClass += "bg-white/5 border border-white/10 text-white/50";
                  }
                } else {
                  buttonClass += "bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-[#14B8A6]/50";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <span className="flex items-center space-x-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        showResult && isCorrect ? 'bg-green-500 text-white' :
                        showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                        'bg-white/10 text-white/70'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className={`p-4 rounded-xl ${
                selectedAnswer === sampleQuestion.correctIndex 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-red-500/10 border border-red-500/30'
              }`}>
                <p className={`font-medium ${
                  selectedAnswer === sampleQuestion.correctIndex ? 'text-green-400' : 'text-red-400'
                }`}>
                  {selectedAnswer === sampleQuestion.correctIndex ? 'Correct!' : 'Not quite!'}
                </p>
                <p className="text-white/70 text-sm mt-1">
                  The answer is <span className="text-[#F59E0B] font-medium">{sampleQuestion.options[sampleQuestion.correctIndex]}</span>.
                  <span className="text-white/50 ml-1">({sampleQuestion.reference})</span>
                </p>
              </div>
            )}

            <button
              onClick={onNavigateToTrivia}
              className="mt-6 w-full py-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-bold rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all flex items-center justify-center space-x-2 glow-amber"
            >
              <Brain className="w-5 h-5" />
              <span>Play Full Trivia Game</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Column - Daily Challenge & Stats */}
          <div className="space-y-6">
            {/* Daily Challenge Card */}
            <div className="bg-gradient-to-br from-[#F59E0B]/20 via-[#0f2942] to-[#F59E0B]/10 border border-[#F59E0B]/40 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/20 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-6 h-6 text-[#F59E0B]" />
                      <h3 className="text-xl font-bold text-white">Daily Challenge</h3>
                    </div>
                    <p className="text-white/70">5 new questions every day!</p>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#F59E0B]/20 rounded-full">
                    <Flame className="w-4 h-4 text-[#F59E0B]" />
                    <span className="text-[#F59E0B] font-bold">{currentStreak} day streak</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-2xl font-bold text-[#14B8A6]">50</p>
                    <p className="text-white/50 text-xs">Bonus Points</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-2xl font-bold text-[#F59E0B]">5</p>
                    <p className="text-white/50 text-xs">Questions</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-2xl font-bold text-purple-400">8</p>
                    <p className="text-white/50 text-xs">Achievements</p>
                  </div>
                </div>

                <button
                  onClick={onNavigateToDailyChallenge}
                  className="w-full py-4 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-bold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all flex items-center justify-center space-x-2 glow-teal"
                >
                  <Flame className="w-5 h-5" />
                  <span>Start Today's Challenge</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Multiplayer Battle Mode Card */}
            {onNavigateToMultiplayer && (
              <div className="bg-gradient-to-br from-purple-600/20 via-[#0f2942] to-indigo-600/20 border border-purple-500/40 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Swords className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-bold text-white">Battle Mode</h3>
                        <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs font-bold rounded-full">NEW</span>
                      </div>
                      <p className="text-white/70">Challenge friends in real-time!</p>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500/20 rounded-full">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300 font-bold">1v1</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-purple-400">10</p>
                      <p className="text-white/50 text-xs">Questions</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-yellow-400">15s</p>
                      <p className="text-white/50 text-xs">Per Question</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-green-400">ELO</p>
                      <p className="text-white/50 text-xs">Rankings</p>
                    </div>
                  </div>

                  <button
                    onClick={onNavigateToMultiplayer}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25"
                  >
                    <Swords className="w-5 h-5" />
                    <span>Find Opponent</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Tournament of Disciples Card */}
            {onNavigateToTournament && (
              <div className="bg-gradient-to-br from-[#F59E0B]/20 via-[#0f2942] to-pink-600/20 border border-[#F59E0B]/40 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/20 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown className="w-6 h-6 text-[#F59E0B]" />
                        <h3 className="text-xl font-bold text-white">Tournament of Disciples</h3>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-[#F59E0B]/30 to-pink-500/30 text-[#F59E0B] text-xs font-bold rounded-full">HOT</span>
                      </div>
                      <p className="text-white/70">Bracket-style competitions!</p>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#F59E0B]/20 rounded-full">
                      <Trophy className="w-4 h-4 text-[#F59E0B]" />
                      <span className="text-[#F59E0B] font-bold">8-32</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-[#F59E0B]">Daily</p>
                      <p className="text-white/50 text-xs">Tournaments</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-pink-400">Weekly</p>
                      <p className="text-white/50 text-xs">Championships</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-purple-400">Grand</p>
                      <p className="text-white/50 text-xs">Events</p>
                    </div>
                  </div>

                  <button
                    onClick={onNavigateToTournament}
                    className="w-full py-4 bg-gradient-to-r from-[#F59E0B] to-pink-500 text-white font-bold rounded-xl hover:from-[#D97706] hover:to-pink-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#F59E0B]/25"
                  >
                    <Crown className="w-5 h-5" />
                    <span>Enter Tournament</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Spectator Mode Card */}
            {onNavigateToSpectator && (
              <div className="bg-gradient-to-br from-cyan-600/20 via-[#0f2942] to-blue-600/20 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Eye className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-xl font-bold text-white">Spectator Mode</h3>
                        <span className="px-2 py-0.5 bg-red-500/30 text-red-300 text-xs font-bold rounded-full flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-pulse" /> LIVE
                        </span>
                      </div>
                      <p className="text-white/70">Watch live battles in real-time!</p>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-500/20 rounded-full">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300 font-bold">Watch</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-cyan-400">Live</p>
                      <p className="text-white/50 text-xs">Matches</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-green-400">Real</p>
                      <p className="text-white/50 text-xs">Time</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-yellow-400">Feed</p>
                      <p className="text-white/50 text-xs">Answers</p>
                    </div>
                  </div>

                  <button
                    onClick={onNavigateToSpectator}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Watch Live Matches</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}


            {/* Difficulty Levels */}
            <div className="bg-gradient-to-br from-[#3B82F6]/10 via-[#0f2942] to-[#14B8A6]/10 border border-[#3B82F6]/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5 text-[#3B82F6]" />
                <span>Difficulty Levels</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {difficultyLevels.map((level, index) => {
                  const Icon = level.icon;
                  return (
                    <div
                      key={level.name}
                      className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                      onClick={onNavigateToTrivia}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{level.name}</p>
                          <p className="text-white/50 text-xs">{(index + 1) * 10} pts/question</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements Preview */}
            <div className="bg-gradient-to-br from-purple-500/10 via-[#0f2942] to-[#F59E0B]/10 border border-purple-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                <span>Earn Achievements</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: '7 Day Streak', icon: '🔥' },
                  { name: '30 Day Streak', icon: '⭐' },
                  { name: '365 Day Streak', icon: '👑' },
                  { name: 'Perfect Score', icon: '💯' },
                  { name: 'Scholar', icon: '📚' },
                ].map((achievement) => (
                  <div
                    key={achievement.name}
                    className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center space-x-2"
                  >
                    <span>{achievement.icon}</span>
                    <span className="text-white/70 text-sm">{achievement.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TriviaSection;
