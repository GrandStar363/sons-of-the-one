import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  Flame,
  BookOpen,
  Brain,
  Target,
  Users,
  Eye,
  EyeOff,
  TrendingUp,
  Calendar,
  Shield,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Minus,
  RefreshCw,
  Settings,
  CheckCircle,
  Lock,
  Globe,
  User as UserIcon
} from 'lucide-react';
import { getEarnedCertificates } from './CertificateSystem';
import { useSyncedState } from '@/hooks/useSyncedState';

interface CommunityLeaderboardProps {
  user: User | null;
  onOpenAuth: () => void;
}

interface LeaderboardUser {
  id: string;
  rank: number;
  previousRank: number | null;
  displayName: string;
  avatar: string;
  totalPoints: number;
  lessonsCompleted: number;
  certificatesEarned: number;
  versesMemorized: number;
  currentStreak: number;
  isCurrentUser: boolean;
  badges: string[];
  joinedDate: string;
}

interface UserStats {
  lessonsCompleted: number;
  certificatesEarned: number;
  versesMemorized: number;
  currentStreak: number;
  totalPoints: number;
  weeklyPoints: number;
}

// Calculate points based on achievements
const calculatePoints = (stats: Partial<UserStats>): number => {
  const lessonPoints = (stats.lessonsCompleted || 0) * 50;
  const certPoints = (stats.certificatesEarned || 0) * 500;
  const versePoints = (stats.versesMemorized || 0) * 100;
  const streakBonus = Math.min((stats.currentStreak || 0) * 10, 300);
  return lessonPoints + certPoints + versePoints + streakBonus;
};

// Mock leaderboard data (in production, this would come from Supabase)
const generateMockLeaderboard = (currentUserStats: UserStats | null, currentUserName: string): LeaderboardUser[] => {
  const mockUsers: Omit<LeaderboardUser, 'rank' | 'previousRank'>[] = [
    {
      id: '1',
      displayName: 'GraceWalker',
      avatar: 'G',
      totalPoints: 4850,
      lessonsCompleted: 24,
      certificatesEarned: 6,
      versesMemorized: 15,
      currentStreak: 45,
      isCurrentUser: false,
      badges: ['champion', 'dedicated', 'scholar'],
      joinedDate: '2025-06-15'
    },
    {
      id: '2',
      displayName: 'FaithfulServant',
      avatar: 'F',
      totalPoints: 4200,
      lessonsCompleted: 22,
      certificatesEarned: 5,
      versesMemorized: 12,
      currentStreak: 30,
      isCurrentUser: false,
      badges: ['dedicated', 'memorizer'],
      joinedDate: '2025-07-01'
    },
    {
      id: '3',
      displayName: 'SpiritLed',
      avatar: 'S',
      totalPoints: 3750,
      lessonsCompleted: 20,
      certificatesEarned: 4,
      versesMemorized: 18,
      currentStreak: 21,
      isCurrentUser: false,
      badges: ['memorizer', 'scholar'],
      joinedDate: '2025-08-10'
    },
    {
      id: '4',
      displayName: 'TruthSeeker',
      avatar: 'T',
      totalPoints: 3400,
      lessonsCompleted: 18,
      certificatesEarned: 4,
      versesMemorized: 10,
      currentStreak: 14,
      isCurrentUser: false,
      badges: ['dedicated'],
      joinedDate: '2025-09-01'
    },
    {
      id: '5',
      displayName: 'HopeBearer',
      avatar: 'H',
      totalPoints: 3100,
      lessonsCompleted: 16,
      certificatesEarned: 3,
      versesMemorized: 14,
      currentStreak: 28,
      isCurrentUser: false,
      badges: ['dedicated', 'memorizer'],
      joinedDate: '2025-09-15'
    },
    {
      id: '6',
      displayName: 'LightShiner',
      avatar: 'L',
      totalPoints: 2800,
      lessonsCompleted: 14,
      certificatesEarned: 3,
      versesMemorized: 8,
      currentStreak: 10,
      isCurrentUser: false,
      badges: ['scholar'],
      joinedDate: '2025-10-01'
    },
    {
      id: '7',
      displayName: 'PeaceMaker',
      avatar: 'P',
      totalPoints: 2500,
      lessonsCompleted: 12,
      certificatesEarned: 2,
      versesMemorized: 11,
      currentStreak: 7,
      isCurrentUser: false,
      badges: ['memorizer'],
      joinedDate: '2025-10-15'
    },
    {
      id: '8',
      displayName: 'JoyfulHeart',
      avatar: 'J',
      totalPoints: 2200,
      lessonsCompleted: 10,
      certificatesEarned: 2,
      versesMemorized: 6,
      currentStreak: 12,
      isCurrentUser: false,
      badges: ['dedicated'],
      joinedDate: '2025-11-01'
    },
    {
      id: '9',
      displayName: 'KindnessGiver',
      avatar: 'K',
      totalPoints: 1900,
      lessonsCompleted: 8,
      certificatesEarned: 2,
      versesMemorized: 5,
      currentStreak: 5,
      isCurrentUser: false,
      badges: [],
      joinedDate: '2025-11-15'
    },
    {
      id: '10',
      displayName: 'WisdomSeeker',
      avatar: 'W',
      totalPoints: 1600,
      lessonsCompleted: 6,
      certificatesEarned: 1,
      versesMemorized: 7,
      currentStreak: 3,
      isCurrentUser: false,
      badges: ['memorizer'],
      joinedDate: '2025-12-01'
    }
  ];

  // Add current user if they have stats
  if (currentUserStats) {
    const currentUserEntry: Omit<LeaderboardUser, 'rank' | 'previousRank'> = {
      id: 'current',
      displayName: currentUserName,
      avatar: currentUserName.charAt(0).toUpperCase(),
      totalPoints: currentUserStats.totalPoints,
      lessonsCompleted: currentUserStats.lessonsCompleted,
      certificatesEarned: currentUserStats.certificatesEarned,
      versesMemorized: currentUserStats.versesMemorized,
      currentStreak: currentUserStats.currentStreak,
      isCurrentUser: true,
      badges: currentUserStats.certificatesEarned >= 3 ? ['dedicated'] : [],
      joinedDate: new Date().toISOString().split('T')[0]
    };
    mockUsers.push(currentUserEntry);
  }

  // Sort by points and assign ranks
  const sorted = mockUsers.sort((a, b) => b.totalPoints - a.totalPoints);
  return sorted.map((user, index) => ({
    ...user,
    rank: index + 1,
    previousRank: Math.random() > 0.5 ? index + Math.floor(Math.random() * 3) : index - Math.floor(Math.random() * 2)
  }));
};

// Badge definitions
const badgeDefinitions: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  champion: { name: 'Champion', icon: <Crown className="w-4 h-4" />, color: 'text-amber-400' },
  dedicated: { name: 'Dedicated', icon: <Flame className="w-4 h-4" />, color: 'text-orange-400' },
  scholar: { name: 'Scholar', icon: <BookOpen className="w-4 h-4" />, color: 'text-blue-400' },
  memorizer: { name: 'Memorizer', icon: <Brain className="w-4 h-4" />, color: 'text-purple-400' }
};

const CommunityLeaderboard: React.FC<CommunityLeaderboardProps> = ({ user, onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'allTime'>('allTime');
  // Persisted to user_data; localStorage is an offline cache.
  const [isPublic, setIsPublic] = useSyncedState<boolean>(
    'sog-leaderboard-public', 'leaderboard_public', true, user);
  const [showSettings, setShowSettings] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Guest';

  // Load user stats from localStorage
  useEffect(() => {
    const loadUserStats = () => {
      // Get completed lessons
      const completedLessons = JSON.parse(localStorage.getItem('sog-completed-lessons') || '[]');
      
      // Get earned certificates
      const earnedCerts = getEarnedCertificates();
      const certificatesCount = Object.keys(earnedCerts).length;
      
      // Get memory verses (mock - in production would come from database)
      const memoryVerses = parseInt(localStorage.getItem('sog-memory-verses-count') || '0');
      
      // Get streak data (mock)
      const streakData = JSON.parse(localStorage.getItem('sog-memory-streak') || '{"current_streak": 0}');
      
      const stats: UserStats = {
        lessonsCompleted: completedLessons.length,
        certificatesEarned: certificatesCount,
        versesMemorized: memoryVerses,
        currentStreak: streakData.current_streak || 0,
        totalPoints: 0,
        weeklyPoints: 0
      };
      
      stats.totalPoints = calculatePoints(stats);
      stats.weeklyPoints = Math.floor(stats.totalPoints * 0.3); // Mock weekly points
      
      setUserStats(stats);
      
      // Generate leaderboard with user stats
      const leaderboardData = generateMockLeaderboard(
        isPublic ? stats : null,
        userName
      );
      setLeaderboard(leaderboardData);
      setLoading(false);
    };

    loadUserStats();
  }, [isPublic, userName]);

  const getRankChange = (current: number, previous: number | null): React.ReactNode => {
    if (previous === null) return <Minus className="w-4 h-4 text-white/40" />;
    const diff = previous - current;
    if (diff > 0) {
      return (
        <span className="flex items-center text-green-400 text-sm">
          <ChevronUp className="w-4 h-4" />
          {diff}
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="flex items-center text-red-400 text-sm">
          <ChevronDown className="w-4 h-4" />
          {Math.abs(diff)}
        </span>
      );
    }
    return <Minus className="w-4 h-4 text-white/40" />;
  };

  const getRankIcon = (rank: number): React.ReactNode => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Trophy className="w-5 h-5 text-white" />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg">
            <Medal className="w-5 h-5 text-white" />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white/80 font-bold">{rank}</span>
          </div>
        );
    }
  };

  const currentUserRank = leaderboard.find(u => u.isCurrentUser)?.rank;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#14B8A6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/10 via-transparent to-[#F59E0B]/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#14B8A6]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#14B8A6]/20 border border-[#14B8A6]/30 rounded-full mb-6">
              <Trophy className="w-5 h-5 text-[#14B8A6]" />
              <span className="text-[#14B8A6] font-medium">Community Leaderboard</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
              Spiritual Growth <span className="text-[#F59E0B]">Champions</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 mb-8">
              Celebrate your spiritual journey alongside fellow believers. 
              Track your progress and inspire others in their walk with God.
            </p>

            {/* User Stats Summary */}
            {user && userStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="w-6 h-6 text-[#14B8A6]" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userStats.lessonsCompleted}</p>
                  <p className="text-white/50 text-sm">Lessons</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="w-6 h-6 text-[#F59E0B]" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userStats.certificatesEarned}</p>
                  <p className="text-white/50 text-sm">Certificates</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Brain className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userStats.versesMemorized}</p>
                  <p className="text-white/50 text-sm">Verses</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Flame className="w-6 h-6 text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userStats.currentStreak}</p>
                  <p className="text-white/50 text-sm">Day Streak</p>
                </div>
              </div>
            )}

            {!user && (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all"
              >
                <UserIcon className="w-5 h-5" />
                <span>Sign In to Join the Leaderboard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'weekly'
                  ? 'bg-[#14B8A6] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>This Week</span>
            </button>
            <button
              onClick={() => setActiveTab('allTime')}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'allTime'
                  ? 'bg-[#14B8A6] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>All Time</span>
            </button>
          </div>

          {/* Privacy Settings */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Privacy</span>
              </button>

              {showSettings && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSettings(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-[#0f2942] border border-[#14B8A6]/30 rounded-xl shadow-xl z-50 p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#14B8A6]" />
                      Leaderboard Privacy
                    </h4>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setIsPublic(true);
                          setShowSettings(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isPublic
                            ? 'bg-[#14B8A6]/20 border-[#14B8A6]/50 text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5" />
                          <div className="text-left">
                            <p className="font-medium">Public</p>
                            <p className="text-xs text-white/50">Visible on leaderboard</p>
                          </div>
                        </div>
                        {isPublic && <CheckCircle className="w-5 h-5 text-[#14B8A6]" />}
                      </button>

                      <button
                        onClick={() => {
                          setIsPublic(false);
                          setShowSettings(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          !isPublic
                            ? 'bg-[#14B8A6]/20 border-[#14B8A6]/50 text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Lock className="w-5 h-5" />
                          <div className="text-left">
                            <p className="font-medium">Private</p>
                            <p className="text-xs text-white/50">Hidden from others</p>
                          </div>
                        </div>
                        {!isPublic && <CheckCircle className="w-5 h-5 text-[#14B8A6]" />}
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-white/40">
                      Your progress is always tracked, but you can choose whether to appear on the public leaderboard.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Current User Rank Card (if not in top 10) */}
        {user && isPublic && currentUserRank && currentUserRank > 10 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-[#14B8A6]/20 to-[#3B82F6]/20 border border-[#14B8A6]/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">Your Rank</p>
                  <p className="text-white/60 text-sm">Keep going! You're making great progress.</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#14B8A6]">#{currentUserRank}</p>
                <p className="text-white/50 text-sm">{userStats?.totalPoints.toLocaleString()} pts</p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        {user && !isPublic && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">You're in Private Mode</p>
              <p className="text-white/60 text-sm">Your progress is hidden from the public leaderboard. Change this in Privacy settings.</p>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 border-b border-white/10 text-white/60 text-sm font-medium">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5 sm:col-span-4">User</div>
            <div className="col-span-2 text-center hidden sm:block">Lessons</div>
            <div className="col-span-2 text-center hidden sm:block">Certs</div>
            <div className="col-span-6 sm:col-span-3 text-right">Points</div>
          </div>

          {/* Leaderboard Rows */}
          <div className="divide-y divide-white/5">
            {leaderboard.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-gradient-to-r from-[#14B8A6]/10 to-[#3B82F6]/10 border-l-4 border-[#14B8A6]'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center space-x-2">
                  {getRankIcon(entry.rank)}
                </div>

                {/* User Info */}
                <div className="col-span-5 sm:col-span-4 flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    entry.isCurrentUser
                      ? 'bg-gradient-to-br from-[#14B8A6] to-[#0D9488]'
                      : 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB]'
                  }`}>
                    {entry.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`font-semibold truncate ${entry.isCurrentUser ? 'text-[#14B8A6]' : 'text-white'}`}>
                        {entry.displayName}
                        {entry.isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                      </p>
                    </div>
                    {/* Badges */}
                    <div className="flex items-center space-x-1 mt-1">
                      {entry.badges.slice(0, 3).map((badge) => (
                        <span
                          key={badge}
                          className={`${badgeDefinitions[badge]?.color || 'text-white/50'}`}
                          title={badgeDefinitions[badge]?.name}
                        >
                          {badgeDefinitions[badge]?.icon}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lessons - Desktop */}
                <div className="col-span-2 text-center hidden sm:flex items-center justify-center space-x-1">
                  <BookOpen className="w-4 h-4 text-[#14B8A6]" />
                  <span className="text-white">{entry.lessonsCompleted}</span>
                </div>

                {/* Certificates - Desktop */}
                <div className="col-span-2 text-center hidden sm:flex items-center justify-center space-x-1">
                  <Award className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-white">{entry.certificatesEarned}</span>
                </div>

                {/* Points & Rank Change */}
                <div className="col-span-6 sm:col-span-3 flex items-center justify-end space-x-3">
                  <div className="text-right">
                    <p className="text-white font-bold">{entry.totalPoints.toLocaleString()}</p>
                    <p className="text-white/50 text-xs">points</p>
                  </div>
                  <div className="w-8">
                    {getRankChange(entry.rank, entry.previousRank)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Point System Explanation */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            How Points Are Calculated
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-5 h-5 text-[#14B8A6]" />
                <span className="text-white font-medium">Lessons</span>
              </div>
              <p className="text-2xl font-bold text-[#14B8A6]">50 pts</p>
              <p className="text-white/50 text-sm">per lesson completed</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-5 h-5 text-[#F59E0B]" />
                <span className="text-white font-medium">Certificates</span>
              </div>
              <p className="text-2xl font-bold text-[#F59E0B]">500 pts</p>
              <p className="text-white/50 text-sm">per certificate earned</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-5 h-5 text-[#8B5CF6]" />
                <span className="text-white font-medium">Verses</span>
              </div>
              <p className="text-2xl font-bold text-[#8B5CF6]">100 pts</p>
              <p className="text-white/50 text-sm">per verse memorized</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-white font-medium">Streak Bonus</span>
              </div>
              <p className="text-2xl font-bold text-orange-400">10 pts</p>
              <p className="text-white/50 text-sm">per day (max 300)</p>
            </div>
          </div>
        </div>

        {/* Encouragement Section */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-full text-white/60">
            <Users className="w-4 h-4" />
            <span>Join {leaderboard.length}+ believers on their spiritual journey</span>
          </div>
          <p className="mt-4 text-white/50 text-sm max-w-xl mx-auto">
            "Wherefore comfort yourselves together, and edify one another, even as also ye do." 
            <span className="text-[#14B8A6]"> — 1 Thessalonians 5:11 (KJV 1611)</span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default CommunityLeaderboard;
