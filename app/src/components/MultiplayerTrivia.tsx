import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Trophy, Swords, Clock, CheckCircle, XCircle, 
  Loader2, Crown, Medal, Target, Zap, History, BarChart3,
  ArrowLeft, Play, Shield, Wifi, Timer, Eye
} from 'lucide-react';
import SocialShareButtons from './SocialShareButtons';


interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  player1_answers: any[];
  player2_answers: any[];
  questions: any[];
  current_question: number;
  total_questions: number;
  status: string;
  winner_id: string | null;
  winner_name: string | null;
  player1_ready: boolean;
  player2_ready: boolean;
  player1_answered: boolean;
  player2_answered: boolean;
  time_per_question: number;
  current_question_start: string;
  realtime_mode: boolean;
}

interface PlayerStats {
  id: string;
  user_id: string;
  display_name: string;
  wins: number;
  losses: number;
  draws: number;
  total_matches: number;
  total_points_scored: number;
  ranking_points: number;
  win_streak: number;
  best_win_streak: number;
}

interface MatchHistory {
  id: string;
  opponent_name: string;
  user_score: number;
  opponent_score: number;
  result: string;
  ranking_change: number;
  played_at: string;
}

export function MultiplayerTrivia() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [gameState, setGameState] = useState<'menu' | 'queue' | 'ready' | 'playing' | 'results'>('menu');
  const [match, setMatch] = useState<Match | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('play');
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player');
        loadPlayerStats(user.id);
      }
    };
    getUser();
  }, []);

  // Load player stats
  const loadPlayerStats = async (userId: string) => {
    try {
      const { data } = await supabase.functions.invoke('multiplayer-trivia', {
        body: { action: 'get_stats', userId, displayName }
      });
      if (data?.success) {
        setPlayerStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load leaderboard
  const loadLeaderboard = async () => {
    try {
      const { data } = await supabase.functions.invoke('multiplayer-trivia', {
        body: { action: 'get_leaderboard' }
      });
      if (data?.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  // Load match history
  const loadMatchHistory = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.functions.invoke('multiplayer-trivia', {
        body: { action: 'get_history', userId: user.id }
      });
      if (data?.success) {
        setMatchHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // Subscribe to match updates for real-time sync
  useEffect(() => {
    if (!match?.id) return;

    const channel = supabase
      .channel(`match-realtime-${match.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trivia_matches',
          filter: `id=eq.${match.id}`
        },
        (payload) => {
          const updatedMatch = payload.new as Match;
          setMatch(updatedMatch);
          
          // Update opponent answered status
          const isPlayer1 = updatedMatch.player1_id === user?.id;
          setOpponentAnswered(isPlayer1 ? updatedMatch.player2_answered : updatedMatch.player1_answered);
          
          // Handle state transitions
          if (updatedMatch.status === 'playing' && gameState === 'ready') {
            setGameState('playing');
            setTimeLeft(updatedMatch.time_per_question);
            setAnswerSubmitted(false);
            setSelectedAnswer(null);
            setOpponentAnswered(false);
            setShowCorrectAnswer(false);
          }
          
          if (updatedMatch.status === 'completed') {
            setGameState('results');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match?.id, gameState, user?.id]);

  // Real-time countdown timer
  useEffect(() => {
    if (gameState !== 'playing' || !match) return;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto-submit if not answered
          if (!answerSubmitted) {
            handleSubmitAnswer(-1);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, match?.current_question, answerSubmitted]);

  // Poll for match state updates (backup for real-time)
  useEffect(() => {
    if (gameState !== 'playing' || !match?.id || !user) return;

    const pollMatchState = async () => {
      try {
        const { data } = await supabase.functions.invoke('multiplayer-trivia', {
          body: { action: 'get_match_state', matchId: match.id, userId: user.id }
        });
        
        if (data?.success) {
          setOpponentAnswered(data.opponentAnswered);
          
          // If both answered, show results briefly then advance
          if (data.bothAnswered && answerSubmitted && !showCorrectAnswer) {
            setShowCorrectAnswer(true);
            setTimeout(() => advanceToNextQuestion(), 2500);
          }
        }
      } catch (error) {
        console.error('Error polling match state:', error);
      }
    };

    pollRef.current = setInterval(pollMatchState, 1500);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [gameState, match?.id, user, answerSubmitted, showCorrectAnswer]);

  // Join matchmaking queue
  const joinQueue = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to play real-time trivia battles",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('multiplayer-trivia', {
        body: {
          action: 'join_queue',
          userId: user.id,
          displayName,
          category: 'general'
        }
      });

      if (error) throw error;

      if (data.matched) {
        setMatch(data.match);
        setGameState('ready');
        toast({
          title: "Match Found!",
          description: `Real-time battle against ${data.match.player1_id === user.id ? data.match.player2_name : data.match.player1_name}`
        });
      } else {
        setGameState('queue');
        toast({
          title: "Searching for Opponent",
          description: "Waiting for another player to join..."
        });
        pollForMatch();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for match when in queue
  const pollForMatch = useCallback(async () => {
    if (!user) return;

    const checkForMatch = async () => {
      const { data: matches } = await supabase
        .from('trivia_matches')
        .select('*')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .eq('status', 'ready')
        .order('created_at', { ascending: false })
        .limit(1);

      if (matches && matches.length > 0) {
        setMatch(matches[0]);
        setGameState('ready');
        return true;
      }
      return false;
    };

    const interval = setInterval(async () => {
      const found = await checkForMatch();
      if (found) {
        clearInterval(interval);
      }
    }, 2000);

    // Stop polling after 60 seconds
    setTimeout(() => {
      clearInterval(interval);
      if (gameState === 'queue') {
        leaveQueue();
        toast({
          title: "No Match Found",
          description: "No opponents available. Try again later.",
          variant: "destructive"
        });
      }
    }, 60000);
  }, [user, gameState]);

  // Leave queue
  const leaveQueue = async () => {
    if (!user) return;
    
    try {
      await supabase.functions.invoke('multiplayer-trivia', {
        body: { action: 'leave_queue', userId: user.id }
      });
      setGameState('menu');
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };

  // Player ready
  const playerReady = async () => {
    if (!user || !match) return;

    try {
      const { data } = await supabase.functions.invoke('multiplayer-trivia', {
        body: {
          action: 'player_ready',
          userId: user.id,
          matchId: match.id
        }
      });

      if (data.bothReady) {
        setGameState('playing');
        setTimeLeft(match.time_per_question);
        setAnswerSubmitted(false);
        setOpponentAnswered(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Submit answer with speed bonus
  const handleSubmitAnswer = async (answerIndex: number) => {
    if (!user || !match || answerSubmitted) return;

    setAnswerSubmitted(true);
    setSelectedAnswer(answerIndex);

    try {
      const { data } = await supabase.functions.invoke('multiplayer-trivia', {
        body: {
          action: 'submit_answer',
          userId: user.id,
          matchId: match.id,
          questionIndex: match.current_question,
          answer: answerIndex,
          timeRemaining: timeLeft
        }
      });

      if (data?.success) {
        setLastPointsEarned(data.points || 0);
        
        // If both players have answered, show results
        if (data.bothAnswered) {
          setShowCorrectAnswer(true);
          setTimeout(() => advanceToNextQuestion(), 2500);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Advance to next question
  const advanceToNextQuestion = async () => {
    if (!user || !match) return;

    try {
      const { data } = await supabase.functions.invoke('multiplayer-trivia', {
        body: {
          action: 'next_question',
          userId: user.id,
          matchId: match.id
        }
      });

      if (data.gameOver) {
        setGameState('results');
        loadPlayerStats(user.id);
      } else {
        setSelectedAnswer(null);
        setAnswerSubmitted(false);
        setOpponentAnswered(false);
        setShowCorrectAnswer(false);
        setTimeLeft(match.time_per_question);
      }
    } catch (error: any) {
      console.error('Error advancing question:', error);
    }
  };

  // Reset game
  const resetGame = () => {
    setMatch(null);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setTimeLeft(15);
    setGameState('menu');
    setOpponentAnswered(false);
    setShowCorrectAnswer(false);
    loadPlayerStats(user?.id);
    loadLeaderboard();
    loadMatchHistory();
  };

  // Load data on tab change
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    } else if (activeTab === 'history') {
      loadMatchHistory();
    }
  }, [activeTab]);

  const isPlayer1 = match?.player1_id === user?.id;
  const myScore = isPlayer1 ? match?.player1_score : match?.player2_score;
  const opponentScore = isPlayer1 ? match?.player2_score : match?.player1_score;
  const opponentName = isPlayer1 ? match?.player2_name : match?.player1_name;
  const myReady = isPlayer1 ? match?.player1_ready : match?.player2_ready;
  const opponentReady = isPlayer1 ? match?.player2_ready : match?.player1_ready;
  const iWon = match?.winner_id === user?.id;
  const isDraw = match?.status === 'completed' && !match?.winner_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Swords className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Real-Time Battle</h1>
            <Swords className="w-10 h-10 text-yellow-400 transform scale-x-[-1]" />
          </div>
          <div className="flex items-center justify-center gap-2 text-purple-200">
            <Wifi className="w-4 h-4 text-green-400 animate-pulse" />
            <span>Live synchronized gameplay</span>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">LIVE</Badge>
          </div>
        </div>

        {gameState === 'menu' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/10">
              <TabsTrigger value="play" className="data-[state=active]:bg-purple-600">
                <Play className="w-4 h-4 mr-2" /> Play
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-600">
                <Trophy className="w-4 h-4 mr-2" /> Leaderboard
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
                <History className="w-4 h-4 mr-2" /> History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="play" className="mt-6">
              {/* Player Stats Card */}
              {playerStats && (
                <Card className="bg-white/10 border-white/20 text-white mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-yellow-400" />
                      Your Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">{playerStats.ranking_points}</div>
                        <div className="text-sm text-purple-200">Rating</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{playerStats.wins}</div>
                        <div className="text-sm text-purple-200">Wins</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-red-400">{playerStats.losses}</div>
                        <div className="text-sm text-purple-200">Losses</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-orange-400">{playerStats.win_streak}</div>
                        <div className="text-sm text-purple-200">Win Streak</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Play Button */}
              <Card className="bg-gradient-to-br from-purple-600 to-indigo-600 border-0 text-white">
                <CardContent className="p-8 text-center">
                  <div className="relative inline-block mb-4">
                    <Swords className="w-16 h-16 text-yellow-400" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Wifi className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Real-Time Battle Mode</h2>
                  <p className="text-purple-200 mb-4">
                    Compete head-to-head in synchronized gameplay!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <Badge className="bg-white/20"><Timer className="w-3 h-3 mr-1" /> 15s per question</Badge>
                    <Badge className="bg-white/20"><Zap className="w-3 h-3 mr-1" /> Speed bonus points</Badge>
                    <Badge className="bg-white/20"><Eye className="w-3 h-3 mr-1" /> See opponent status</Badge>
                  </div>
                  <Button
                    size="lg"
                    onClick={joinQueue}
                    disabled={isLoading || !user}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 text-lg"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Users className="w-5 h-5 mr-2" />
                    )}
                    Find Opponent
                  </Button>
                  {!user && (
                    <p className="text-yellow-300 mt-4 text-sm">Please sign in to play real-time battles</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-6">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Global Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboard.length === 0 ? (
                    <p className="text-center text-purple-200 py-8">No players yet. Be the first!</p>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard.map((player, index) => (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            player.user_id === user?.id ? 'bg-purple-600/50' : 'bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-yellow-500 text-black' :
                              index === 1 ? 'bg-gray-300 text-black' :
                              index === 2 ? 'bg-orange-600 text-white' :
                              'bg-white/20 text-white'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                {player.display_name}
                                {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                              </div>
                              <div className="text-xs text-purple-300">
                                {player.wins}W - {player.losses}L - {player.draws}D
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-yellow-400">{player.ranking_points}</div>
                            <div className="text-xs text-purple-300">Rating</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-400" />
                    Match History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {matchHistory.length === 0 ? (
                    <p className="text-center text-purple-200 py-8">No matches played yet</p>
                  ) : (
                    <div className="space-y-2">
                      {matchHistory.map((historyMatch) => (
                        <div
                          key={historyMatch.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              historyMatch.result === 'win' ? 'bg-green-500/20' :
                              historyMatch.result === 'loss' ? 'bg-red-500/20' :
                              'bg-yellow-500/20'
                            }`}>
                              {historyMatch.result === 'win' ? (
                                <Trophy className="w-5 h-5 text-green-400" />
                              ) : historyMatch.result === 'loss' ? (
                                <XCircle className="w-5 h-5 text-red-400" />
                              ) : (
                                <Target className="w-5 h-5 text-yellow-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">vs {historyMatch.opponent_name}</div>
                              <div className="text-xs text-purple-300">
                                {new Date(historyMatch.played_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {historyMatch.user_score} - {historyMatch.opponent_score}
                            </div>
                            <div className={`text-sm ${
                              historyMatch.ranking_change > 0 ? 'text-green-400' :
                              historyMatch.ranking_change < 0 ? 'text-red-400' :
                              'text-gray-400'
                            }`}>
                              {historyMatch.ranking_change > 0 ? '+' : ''}{historyMatch.ranking_change} pts
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Queue State */}
        {gameState === 'queue' && (
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Finding Opponent...</h2>
              <p className="text-purple-200 mb-6">
                Searching for a worthy challenger for real-time battle.
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <Button variant="outline" onClick={leaveQueue} className="border-white/30 text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ready State */}
        {gameState === 'ready' && match && (
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wifi className="w-5 h-5 text-green-400 animate-pulse" />
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">REAL-TIME MODE</Badge>
                </div>
                <h2 className="text-2xl font-bold mb-2">Match Found!</h2>
                <p className="text-purple-200">Both players must be ready to start</p>
              </div>

              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-2 relative">
                    <span className="text-2xl font-bold">{displayName[0]?.toUpperCase()}</span>
                    {myReady && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="font-semibold">{displayName}</div>
                  <Badge className={myReady ? 'bg-green-500' : 'bg-gray-500'}>
                    {myReady ? 'Ready' : 'Not Ready'}
                  </Badge>
                </div>

                <div className="text-4xl font-bold text-yellow-400">VS</div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-2 relative">
                    <span className="text-2xl font-bold">{opponentName?.[0]?.toUpperCase()}</span>
                    {opponentReady && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="font-semibold">{opponentName}</div>
                  <Badge className={opponentReady ? 'bg-green-500' : 'bg-gray-500'}>
                    {opponentReady ? 'Ready' : 'Waiting...'}
                  </Badge>
                </div>
              </div>

              <div className="text-center">
                {!myReady ? (
                  <Button
                    size="lg"
                    onClick={playerReady}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold px-8"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" /> I'm Ready!
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-purple-200">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Waiting for opponent to be ready...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Playing State - Real-Time */}
        {gameState === 'playing' && match && (
          <div className="space-y-4">
            {/* Live indicator */}
            <div className="flex items-center justify-center gap-2">
              <Wifi className="w-4 h-4 text-green-400 animate-pulse" />
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">LIVE</Badge>
            </div>

            {/* Score Header */}
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-sm text-purple-200">{displayName}</div>
                    <div className="text-3xl font-bold text-blue-400">{myScore}</div>
                    {answerSubmitted && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs mt-1">Answered</Badge>
                    )}
                  </div>
                  <div className="text-center px-4">
                    <div className="text-sm text-purple-200">Question</div>
                    <div className="text-xl font-bold">{match.current_question + 1}/{match.total_questions}</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-sm text-purple-200">{opponentName}</div>
                    <div className="text-3xl font-bold text-red-400">{opponentScore}</div>
                    {opponentAnswered && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs mt-1">Answered</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <div className="relative">
              <Progress 
                value={(timeLeft / match.time_per_question) * 100} 
                className={`h-4 bg-white/20 ${timeLeft <= 5 ? 'animate-pulse' : ''}`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-bold flex items-center gap-1 ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                  <Clock className="w-4 h-4" />
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Question */}
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6 text-center">
                  {match.questions[match.current_question]?.question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {match.questions[match.current_question]?.options.map((option: any, index: number) => {
                    const isSelected = selectedAnswer === index;
                    const showResult = showCorrectAnswer;
                    const isCorrect = option.isCorrect;

                    return (
                      <Button
                        key={index}
                        onClick={() => !answerSubmitted && handleSubmitAnswer(index)}
                        disabled={answerSubmitted}
                        className={`p-4 h-auto text-left justify-start transition-all ${
                          showResult
                            ? isCorrect
                              ? 'bg-green-500 hover:bg-green-500 ring-2 ring-green-300'
                              : isSelected
                                ? 'bg-red-500 hover:bg-red-500'
                                : 'bg-white/10 hover:bg-white/10'
                            : isSelected
                              ? 'bg-purple-600 hover:bg-purple-600 ring-2 ring-purple-300'
                              : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3 flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option.text}</span>
                        {showResult && isCorrect && (
                          <CheckCircle className="w-5 h-5 text-white ml-2" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-white ml-2" />
                        )}
                      </Button>
                    );
                  })}
                </div>

                {/* Answer feedback */}
                {answerSubmitted && !showCorrectAnswer && (
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-purple-200">
                      {opponentAnswered ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Both answered! Showing results...
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Waiting for opponent...
                        </>
                      )}
                    </div>
                  </div>
                )}

                {showCorrectAnswer && lastPointsEarned > 0 && (
                  <div className="mt-4 text-center">
                    <Badge className="bg-green-500/20 text-green-400 text-lg px-4 py-2">
                      <Zap className="w-4 h-4 mr-1 inline" />
                      +{lastPointsEarned} points!
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results State */}
        {gameState === 'results' && match && (
          <Card className="bg-white/10 border-white/20 text-white overflow-hidden">
            <div className={`p-6 text-center ${
              iWon ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30' :
              isDraw ? 'bg-gradient-to-r from-gray-500/30 to-gray-600/30' :
              'bg-gradient-to-r from-red-500/30 to-pink-500/30'
            }`}>
              {iWon ? (
                <>
                  <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
                  <h2 className="text-3xl font-bold mb-2">Victory!</h2>
                  <p className="text-purple-200">Congratulations, you won the real-time battle!</p>
                </>
              ) : isDraw ? (
                <>
                  <Target className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-3xl font-bold mb-2">It's a Draw!</h2>
                  <p className="text-purple-200">A close match - you're evenly matched!</p>
                </>
              ) : (
                <>
                  <Medal className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-3xl font-bold mb-2">Defeat</h2>
                  <p className="text-purple-200">Better luck next time!</p>
                </>
              )}
            </div>

            <CardContent className="p-6">
              {/* Final Scores */}
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                    iWon ? 'bg-yellow-500/30 ring-2 ring-yellow-400' : 'bg-white/10'
                  }`}>
                    <span className="text-xl font-bold">{displayName[0]?.toUpperCase()}</span>
                  </div>
                  <div className="font-semibold">{displayName}</div>
                  <div className="text-3xl font-bold text-blue-400">{myScore}</div>
                </div>

                <div className="text-2xl font-bold text-gray-400">-</div>

                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                    !iWon && !isDraw ? 'bg-yellow-500/30 ring-2 ring-yellow-400' : 'bg-white/10'
                  }`}>
                    <span className="text-xl font-bold">{opponentName?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="font-semibold">{opponentName}</div>
                  <div className="text-3xl font-bold text-red-400">{opponentScore}</div>
                </div>
              </div>

              {/* Share Results */}
              <div className="mb-6">
                <h3 className="text-center text-sm text-purple-200 mb-3">Share your result</h3>
                <SocialShareButtons
                  type="trivia_score"
                  title="Share your result"
                  score={myScore || 0}
                  maxScore={match.total_questions * 15}
                  userId={user?.id}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={joinQueue}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Zap className="w-4 h-4 mr-2" /> Play Again
                </Button>
                <Button
                  variant="outline"
                  onClick={resetGame}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default MultiplayerTrivia;
