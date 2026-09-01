import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, Users, Trophy, Swords, Clock, CheckCircle, XCircle, 
  Loader2, Crown, Zap, ArrowLeft, Radio, Wifi, Timer,
  Play, User, TrendingUp, RefreshCw
} from 'lucide-react';

interface LiveMatch {
  id: string;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  current_question: number;
  total_questions: number;
  status: string;
  category: string;
  started_at: string;
  spectator_count: number;
}

interface SpectatorMatch {
  id: string;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  player1_answered: boolean;
  player2_answered: boolean;
  current_question: number;
  total_questions: number;
  status: string;
  winner_id: string | null;
  winner_name: string | null;
  spectator_count: number;
  time_per_question: number;
  current_question_start: string;
}

interface CurrentQuestion {
  question: string;
  options: { text: string; isCorrect?: boolean }[];
}

interface AnswerFeedItem {
  playerName: string;
  playerId: string;
  questionIndex: number;
  isCorrect: boolean;
  points: number;
  timeRemaining: number;
  answeredAt: string;
}

export function SpectatorMode() {
  const [view, setView] = useState<'list' | 'watching'>('list');
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [spectatingMatch, setSpectatingMatch] = useState<SpectatorMatch | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
  const [answerFeed, setAnswerFeed] = useState<AnswerFeedItem[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load live matches
  const loadLiveMatches = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('multiplayer-trivia', {
        body: { action: 'get_live_matches' }
      });

      if (error) throw error;
      setLiveMatches(data.matches || []);
    } catch (error: any) {
      console.error('Error loading live matches:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial load and auto-refresh
  useEffect(() => {
    loadLiveMatches();
    
    const refreshInterval = setInterval(() => {
      if (view === 'list') {
        loadLiveMatches();
      }
    }, 5000);

    return () => clearInterval(refreshInterval);
  }, [view]);

  // Join as spectator
  const joinSpectate = async (matchId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('multiplayer-trivia', {
        body: { action: 'join_spectate', matchId }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Failed to join match');
      }

      setView('watching');
      startSpectating(matchId);
      
      toast({
        title: "Joined as Spectator",
        description: "You're now watching this match live!"
      });
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

  // Start spectating - poll for updates
  const startSpectating = (matchId: string) => {
    const pollSpectatorState = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('multiplayer-trivia', {
          body: { action: 'get_spectator_state', matchId }
        });

        if (error || !data.success) {
          console.error('Error polling spectator state:', error);
          return;
        }

        setSpectatingMatch(data.match);
        setCurrentQuestion(data.currentQuestion);
        setAnswerFeed(data.answerFeed || []);

        // Calculate time remaining
        if (data.match.current_question_start && data.match.status === 'playing') {
          const startTime = new Date(data.match.current_question_start).getTime();
          const elapsed = (Date.now() - startTime) / 1000;
          const remaining = Math.max(0, data.match.time_per_question - elapsed);
          setTimeLeft(Math.round(remaining));
        }

        // Check if match ended
        if (data.match.status === 'completed') {
          if (pollRef.current) {
            clearInterval(pollRef.current);
          }
        }
      } catch (error) {
        console.error('Error polling:', error);
      }
    };

    // Initial poll
    pollSpectatorState();

    // Set up polling interval
    pollRef.current = setInterval(pollSpectatorState, 1000);
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!spectatingMatch?.id || view !== 'watching') return;

    const channel = supabase
      .channel(`spectate-${spectatingMatch.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trivia_matches',
          filter: `id=eq.${spectatingMatch.id}`
        },
        (payload) => {
          const updated = payload.new as any;
          setSpectatingMatch(prev => prev ? {
            ...prev,
            player1_score: updated.player1_score,
            player2_score: updated.player2_score,
            player1_answered: updated.player1_answered,
            player2_answered: updated.player2_answered,
            current_question: updated.current_question,
            status: updated.status,
            winner_id: updated.winner_id,
            winner_name: updated.winner_name,
            spectator_count: updated.spectator_count,
            current_question_start: updated.current_question_start
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spectatingMatch?.id, view]);

  // Leave spectating
  const leaveSpectating = async () => {
    if (spectatingMatch?.id) {
      await supabase.functions.invoke('multiplayer-trivia', {
        body: { action: 'leave_spectate', matchId: spectatingMatch.id }
      });
    }

    if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    setSpectatingMatch(null);
    setCurrentQuestion(null);
    setAnswerFeed([]);
    setView('list');
    loadLiveMatches();
  };

  // Timer countdown effect
  useEffect(() => {
    if (view !== 'watching' || !spectatingMatch || spectatingMatch.status !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [view, spectatingMatch?.current_question, spectatingMatch?.status]);

  // Render match list
  const renderMatchList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Eye className="w-10 h-10 text-purple-400" />
          <h1 className="text-4xl font-bold text-white">Spectator Mode</h1>
        </div>
        <div className="flex items-center justify-center gap-2 text-purple-200">
          <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          <span>Watch live trivia battles in real-time</span>
        </div>
      </div>

      {/* Live Matches */}
      <Card className="bg-white/10 border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-green-400" />
            Live Matches
            <Badge className="bg-red-500/20 text-red-400 border-red-500/50 ml-2">
              {liveMatches.length} LIVE
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadLiveMatches(true)}
            disabled={isRefreshing}
            className="text-purple-200 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {liveMatches.length === 0 ? (
            <div className="text-center py-12">
              <Swords className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
              <h3 className="text-xl font-semibold mb-2">No Live Matches</h3>
              <p className="text-purple-200 mb-4">
                There are no active battles right now. Check back soon!
              </p>
              <Button
                onClick={() => loadLiveMatches(true)}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Check Again
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {liveMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-lg p-4 border border-white/10 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={match.status === 'playing' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                        {match.status === 'playing' ? 'IN PROGRESS' : 'STARTING'}
                      </Badge>
                      <span className="text-xs text-purple-300">
                        Q{match.current_question + 1}/{match.total_questions}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-200 text-sm">
                      <Eye className="w-4 h-4" />
                      {match.spectator_count || 0}
                    </div>
                  </div>

                  {/* Players */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold">{match.player1_name[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{match.player1_name}</div>
                        <div className="text-2xl font-bold text-blue-400">{match.player1_score}</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Swords className="w-8 h-8 text-yellow-400 mx-auto mb-1" />
                      <span className="text-xs text-purple-300">VS</span>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="font-semibold">{match.player2_name}</div>
                        <div className="text-2xl font-bold text-red-400">{match.player2_score}</div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold">{match.player2_name[0]?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Watch Button */}
                  <Button
                    onClick={() => joinSpectate(match.id)}
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    Watch Live
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Render spectating view
  const renderSpectating = () => {
    if (!spectatingMatch) return null;

    const isCompleted = spectatingMatch.status === 'completed';
    const player1Leading = spectatingMatch.player1_score > spectatingMatch.player2_score;
    const player2Leading = spectatingMatch.player2_score > spectatingMatch.player1_score;

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={leaveSpectating}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Matches
          </Button>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
              LIVE
            </Badge>
            <div className="flex items-center gap-1 text-purple-200 text-sm ml-2">
              <Eye className="w-4 h-4" />
              {spectatingMatch.spectator_count || 1} watching
            </div>
          </div>
        </div>

        {/* Scoreboard */}
        <Card className="bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-red-900/50 border-white/20 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {/* Player 1 */}
              <div className="text-center flex-1">
                <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center relative ${
                  player1Leading ? 'bg-gradient-to-br from-yellow-500 to-orange-500 ring-4 ring-yellow-400/50' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                }`}>
                  <span className="text-2xl font-bold">{spectatingMatch.player1_name[0]?.toUpperCase()}</span>
                  {player1Leading && !isCompleted && (
                    <Crown className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />
                  )}
                  {spectatingMatch.player1_answered && !isCompleted && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="font-semibold text-lg">{spectatingMatch.player1_name}</div>
                <div className="text-4xl font-bold text-blue-400 mt-1">{spectatingMatch.player1_score}</div>
                {spectatingMatch.player1_answered && !isCompleted && (
                  <Badge className="bg-green-500/20 text-green-400 mt-2">Answered</Badge>
                )}
              </div>

              {/* VS / Status */}
              <div className="text-center px-6">
                {isCompleted ? (
                  <div>
                    <Trophy className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
                    <div className="text-sm text-purple-200">MATCH ENDED</div>
                  </div>
                ) : (
                  <div>
                    <Swords className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
                    <div className="text-sm text-purple-200">
                      Question {spectatingMatch.current_question + 1}/{spectatingMatch.total_questions}
                    </div>
                  </div>
                )}
              </div>

              {/* Player 2 */}
              <div className="text-center flex-1">
                <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center relative ${
                  player2Leading ? 'bg-gradient-to-br from-yellow-500 to-orange-500 ring-4 ring-yellow-400/50' : 'bg-gradient-to-br from-red-500 to-orange-500'
                }`}>
                  <span className="text-2xl font-bold">{spectatingMatch.player2_name[0]?.toUpperCase()}</span>
                  {player2Leading && !isCompleted && (
                    <Crown className="absolute -top-2 -left-2 w-6 h-6 text-yellow-400" />
                  )}
                  {spectatingMatch.player2_answered && !isCompleted && (
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="font-semibold text-lg">{spectatingMatch.player2_name}</div>
                <div className="text-4xl font-bold text-red-400 mt-1">{spectatingMatch.player2_score}</div>
                {spectatingMatch.player2_answered && !isCompleted && (
                  <Badge className="bg-green-500/20 text-green-400 mt-2">Answered</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timer */}
        {!isCompleted && (
          <div className="relative">
            <Progress 
              value={(timeLeft / spectatingMatch.time_per_question) * 100} 
              className={`h-4 bg-white/20 ${timeLeft <= 5 ? 'animate-pulse' : ''}`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold flex items-center gap-1 ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                <Timer className="w-4 h-4" />
                {timeLeft}s
              </span>
            </div>
          </div>
        )}

        {/* Current Question */}
        {!isCompleted && currentQuestion && (
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-center text-xl">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQuestion.options.map((option, index) => {
                  const showCorrect = spectatingMatch.player1_answered && spectatingMatch.player2_answered;
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg flex items-center gap-3 transition-all ${
                        showCorrect && option.isCorrect
                          ? 'bg-green-500/30 border-2 border-green-400'
                          : 'bg-white/10 border border-white/20'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option.text}</span>
                      {showCorrect && option.isCorrect && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Completed */}
        {isCompleted && (
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-white">
            <CardContent className="p-8 text-center">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-3xl font-bold mb-2">Match Complete!</h2>
              {spectatingMatch.winner_name ? (
                <p className="text-xl text-purple-200">
                  <span className="text-yellow-400 font-bold">{spectatingMatch.winner_name}</span> wins!
                </p>
              ) : (
                <p className="text-xl text-purple-200">It's a draw!</p>
              )}
              <div className="mt-6">
                <Button onClick={leaveSpectating} className="bg-purple-600 hover:bg-purple-700">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Matches
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Answer Feed */}
        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Live Answer Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              {answerFeed.length === 0 ? (
                <div className="text-center py-8 text-purple-200">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Waiting for answers...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {answerFeed.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        item.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {item.isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <XCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{item.playerName}</div>
                          <div className="text-xs text-purple-300">
                            Question {item.questionIndex + 1} • {item.timeRemaining}s remaining
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {item.isCorrect ? (
                          <Badge className="bg-green-500/30 text-green-400">
                            <Zap className="w-3 h-3 mr-1" />
                            +{item.points}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/30 text-red-400">
                            Incorrect
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        {view === 'list' ? renderMatchList() : renderSpectating()}
      </div>
    </div>
  );
}

export default SpectatorMode;
