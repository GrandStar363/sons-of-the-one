import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Trophy, Crown, Swords, Users, Clock, CheckCircle, XCircle,
  Loader2, Medal, Target, Zap, History, Calendar, Shield,
  ArrowLeft, Play, Star, Flame, Award, ChevronRight, Lock,
  Gift, Sparkles, RefreshCw, Circle, AlertCircle, Timer, Wifi
} from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  prize_pool: number;
  start_time: string;
  end_time?: string;
  current_round: number;
  total_rounds: number;
  category: string;
  difficulty: string;
  created_at: string;
}

interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  seed: number;
  status: string;
  current_round: number;
  total_score: number;
  matches_won: number;
  matches_lost: number;
  registered_at: string;
  tournaments?: Tournament;
}

interface TournamentMatch {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number;
  player2_score: number;
  player1_answers: any[];
  player2_answers: any[];
  player1_ready: boolean;
  player2_ready: boolean;
  player1_current_answer: number | null;
  player2_current_answer: number | null;
  winner_id: string | null;
  status: string;
  questions: any[];
  current_question: number;
  question_start_time: string | null;
  time_per_question: number;
  started_at?: string;
  completed_at?: string;
}

interface MatchQuestion {
  question: string;
  options: string[];
  correct: number;
}

export function TournamentOfDisciples() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [activeTab, setActiveTab] = useState('tournaments');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<TournamentRegistration[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [bracketData, setBracketData] = useState<{
    tournament: Tournament | null;
    registrations: TournamentRegistration[];
    matches: TournamentMatch[];
  } | null>(null);
  const [activeMatch, setActiveMatch] = useState<TournamentMatch | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [userRegistrationId, setUserRegistrationId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(15000);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [matchPhase, setMatchPhase] = useState<'waiting' | 'ready' | 'playing' | 'results'>('waiting');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || 'Disciple');
      }
    };
    getUser();
  }, []);

  // Fetch tournaments
  const fetchTournaments = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('tournament-system', {
        body: { action: 'get_active_tournaments' }
      });
      
      if (error) throw error;
      if (data?.data) {
        setTournaments(data.data);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  }, []);

  // Fetch user's tournament registrations
  const fetchUserRegistrations = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('tournament-system', {
        body: { action: 'get_user_tournaments', user_id: user.id }
      });
      
      if (error) throw error;
      if (data?.data) {
        setUserRegistrations(data.data);
      }
    } catch (error) {
      console.error('Error fetching user registrations:', error);
    }
  }, [user]);

  // Fetch bracket data for a tournament
  const fetchBracket = useCallback(async (tournamentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('tournament-system', {
        body: { action: 'get_bracket', tournament_id: tournamentId }
      });
      
      if (error) throw error;
      if (data?.data) {
        setBracketData(data.data);
        
        // Find user's registration ID
        if (user) {
          const userReg = data.data.registrations?.find(
            (r: TournamentRegistration) => r.user_id === user.id
          );
          if (userReg) {
            setUserRegistrationId(userReg.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching bracket:', error);
    }
  }, [user]);

  // Initial data fetch
  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  useEffect(() => {
    if (user) {
      fetchUserRegistrations();
    }
  }, [user, fetchUserRegistrations]);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to tournament updates
    const tournamentChannel = supabase
      .channel('tournaments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        (payload) => {
          console.log('Tournament update:', payload);
          fetchTournaments();
          if (selectedTournament?.id) {
            fetchBracket(selectedTournament.id);
          }
        }
      )
      .subscribe();

    // Subscribe to match updates for real-time gameplay
    const matchChannel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_matches' },
        (payload) => {
          console.log('Match update:', payload);
          if (selectedTournament?.id) {
            fetchBracket(selectedTournament.id);
          }
          // Update active match if it's the one that changed
          if (activeMatch && payload.new && (payload.new as any).id === activeMatch.id) {
            const updatedMatch = payload.new as TournamentMatch;
            setActiveMatch(updatedMatch);
            
            // Check if opponent answered
            const isPlayer1 = updatedMatch.player1_id === userRegistrationId;
            if (isPlayer1) {
              setOpponentAnswered(updatedMatch.player2_current_answer !== null);
            } else {
              setOpponentAnswered(updatedMatch.player1_current_answer !== null);
            }
            
            // Check if both ready and match started
            if (updatedMatch.status === 'in_progress' && matchPhase === 'waiting') {
              setMatchPhase('playing');
              setCurrentQuestion(updatedMatch.current_question || 0);
              if (updatedMatch.question_start_time) {
                setQuestionStartTime(new Date(updatedMatch.question_start_time).getTime());
              }
            }
            
            // Check if question advanced
            if (updatedMatch.current_question !== currentQuestion && updatedMatch.status === 'in_progress') {
              setCurrentQuestion(updatedMatch.current_question);
              setSelectedAnswer(null);
              setAnswerSubmitted(false);
              setOpponentAnswered(false);
              if (updatedMatch.question_start_time) {
                setQuestionStartTime(new Date(updatedMatch.question_start_time).getTime());
              }
            }
            
            // Check if match completed
            if (updatedMatch.status === 'completed') {
              setMatchPhase('results');
            }
          }
        }
      )
      .subscribe();

    // Subscribe to registration updates
    const regChannel = supabase
      .channel('registrations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_registrations' },
        (payload) => {
          console.log('Registration update:', payload);
          fetchTournaments();
          fetchUserRegistrations();
          if (selectedTournament?.id) {
            fetchBracket(selectedTournament.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tournamentChannel);
      supabase.removeChannel(matchChannel);
      supabase.removeChannel(regChannel);
    };
  }, [selectedTournament, activeMatch, userRegistrationId, currentQuestion, matchPhase, fetchTournaments, fetchUserRegistrations, fetchBracket]);

  // Countdown timer for questions
  useEffect(() => {
    if (activeMatch && matchPhase === 'playing' && questionStartTime > 0) {
      const updateTimer = () => {
        const elapsed = Date.now() - questionStartTime;
        const remaining = Math.max(0, (activeMatch.time_per_question || 15000) - elapsed);
        setTimeRemaining(remaining);
        
        // Auto-submit if time runs out
        if (remaining <= 0 && !answerSubmitted) {
          handleTimeExpired();
        }
      };
      
      updateTimer();
      timerRef.current = setInterval(updateTimer, 100);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [activeMatch, matchPhase, questionStartTime, answerSubmitted]);

  // Poll for match state when waiting for opponent
  useEffect(() => {
    if (activeMatch && waitingForOpponent && matchPhase === 'waiting') {
      const pollMatchState = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('tournament-system', {
            body: { action: 'get_match_state', match_id: activeMatch.id }
          });
          
          if (data?.data?.match?.status === 'in_progress') {
            setActiveMatch(data.data.match);
            setMatchPhase('playing');
            setWaitingForOpponent(false);
            if (data.data.match.question_start_time) {
              setQuestionStartTime(new Date(data.data.match.question_start_time).getTime());
            }
          }
        } catch (error) {
          console.error('Error polling match state:', error);
        }
      };
      
      pollRef.current = setInterval(pollMatchState, 2000);
      
      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
        }
      };
    }
  }, [activeMatch, waitingForOpponent, matchPhase]);

  // Handle time expired
  const handleTimeExpired = async () => {
    if (!activeMatch || answerSubmitted) return;
    
    setAnswerSubmitted(true);
    
    try {
      await supabase.functions.invoke('tournament-system', {
        body: {
          action: 'submit_answer',
          match_id: activeMatch.id,
          player_registration_id: userRegistrationId,
          question_index: currentQuestion,
          answer: -1, // Invalid answer for timeout
          time_taken: activeMatch.time_per_question || 15000
        }
      });
    } catch (error) {
      console.error('Error submitting timeout:', error);
    }
  };

  // Register for tournament
  const handleRegister = async (tournament: Tournament) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to register for tournaments",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('tournament-system', {
        body: {
          action: 'register',
          tournament_id: tournament.id,
          user_id: user.id,
          user_name: displayName,
          user_avatar: user.user_metadata?.avatar_url
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Registration failed');

      toast({
        title: "Registration Successful!",
        description: `You're registered for ${tournament.name}. Good luck, disciple!`,
      });

      fetchTournaments();
      fetchUserRegistrations();
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not register for tournament",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start a match (signal ready)
  const handleStartMatch = async (match: TournamentMatch) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('tournament-system', {
        body: { 
          action: 'start_match', 
          match_id: match.id,
          player_registration_id: userRegistrationId
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to start match');

      setActiveMatch(data.data.match || data.data);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setOpponentAnswered(false);
      
      // Check if waiting for opponent or match started
      if (data.data.waiting_for_opponent) {
        setMatchPhase('waiting');
        setWaitingForOpponent(true);
        toast({
          title: "Waiting for Opponent",
          description: "Your opponent will join shortly. Get ready!",
        });
      } else if (data.data.both_ready || data.data.match?.status === 'in_progress') {
        setMatchPhase('playing');
        setWaitingForOpponent(false);
        if (data.data.match?.question_start_time) {
          setQuestionStartTime(new Date(data.data.match.question_start_time).getTime());
        }
        toast({
          title: "Match Started!",
          description: "Answer quickly - speed matters!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not start match",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!activeMatch || selectedAnswer === null || !userRegistrationId || answerSubmitted) return;

    setAnswerSubmitted(true);
    const timeTaken = Date.now() - questionStartTime;

    try {
      const { data, error } = await supabase.functions.invoke('tournament-system', {
        body: {
          action: 'submit_answer',
          match_id: activeMatch.id,
          player_registration_id: userRegistrationId,
          question_index: currentQuestion,
          answer: selectedAnswer,
          time_taken: timeTaken
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to submit answer');

      setMatchResult(data.data);

      if (data.data.match_completed) {
        setMatchPhase('results');
        toast({
          title: "Match Complete!",
          description: data.data.match.winner_id === userRegistrationId 
            ? "Congratulations! You won the match!" 
            : "Match ended. Better luck next time!",
        });
      } else if (data.data.waiting_for_opponent) {
        // Wait for opponent to answer
        setOpponentAnswered(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not submit answer",
        variant: "destructive"
      });
      setAnswerSubmitted(false);
    }
  };

  // Exit match
  const handleExitMatch = () => {
    setActiveMatch(null);
    setMatchPhase('waiting');
    setWaitingForOpponent(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setOpponentAnswered(false);
    setMatchResult(null);
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    if (selectedTournament?.id) {
      fetchBracket(selectedTournament.id);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchTournaments(),
      fetchUserRegistrations(),
      selectedTournament?.id ? fetchBracket(selectedTournament.id) : Promise.resolve()
    ]);
    setIsRefreshing(false);
  };

  // Create sample tournament (for demo purposes)
  const handleCreateSampleTournament = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('tournament-system', {
        body: {
          action: 'create_tournament',
          name: 'Real-Time Disciples Duel',
          description: 'Live head-to-head battles! Answer questions in real-time against your opponent.',
          type: 'daily',
          max_participants: 8,
          entry_fee: 0,
          prize_pool: 100,
          start_time: new Date(Date.now() + 3600000).toISOString(),
          category: 'general',
          difficulty: 'mixed'
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to create tournament');

      toast({
        title: "Tournament Created!",
        description: "A new real-time tournament is now available for registration.",
      });

      fetchTournaments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not create tournament",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Started';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const getTournamentTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'from-green-500 to-emerald-600';
      case 'weekly': return 'from-blue-500 to-indigo-600';
      case 'championship': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTournamentBadgeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'weekly': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'championship': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registration':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Open</Badge>;
      case 'active':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Completed</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Upcoming</Badge>;
    }
  };

  const isUserRegistered = (tournamentId: string) => {
    return userRegistrations.some(r => r.tournament_id === tournamentId);
  };

  // Find user's current match in bracket
  const findUserMatch = () => {
    if (!bracketData || !userRegistrationId) return null;
    return bracketData.matches.find(
      m => (m.player1_id === userRegistrationId || m.player2_id === userRegistrationId) &&
           (m.status === 'pending' || m.status === 'in_progress')
    );
  };

  // Get player name from registration ID
  const getPlayerName = (registrationId: string | null) => {
    if (!registrationId || !bracketData) return 'TBD';
    const reg = bracketData.registrations.find(r => r.id === registrationId);
    return reg?.user_name || 'Unknown';
  };

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  // Get timer color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining > 10000) return 'text-green-400';
    if (timeRemaining > 5000) return 'text-yellow-400';
    return 'text-red-400 animate-pulse';
  };

  // Render waiting for opponent screen
  if (activeMatch && matchPhase === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1929] via-[#0f2942] to-[#0c1929] p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-[#14B8A6]/20 rounded-full flex items-center justify-center mb-4">
                  <Wifi className="w-10 h-10 text-[#14B8A6] animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Waiting for Opponent</h2>
                <p className="text-white/60">Your opponent is connecting...</p>
              </div>
              
              <div className="flex items-center justify-center gap-8 my-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#14B8A6]/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl font-bold text-[#14B8A6]">{displayName[0]?.toUpperCase()}</span>
                  </div>
                  <p className="text-white font-medium">{displayName}</p>
                  <Badge className="bg-green-500/20 text-green-400 mt-1">Ready</Badge>
                </div>
                
                <Swords className="w-8 h-8 text-[#F59E0B]" />
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                    <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                  </div>
                  <p className="text-white/50 font-medium">
                    {activeMatch.player1_id === userRegistrationId 
                      ? getPlayerName(activeMatch.player2_id)
                      : getPlayerName(activeMatch.player1_id)}
                  </p>
                  <Badge className="bg-yellow-500/20 text-yellow-400 mt-1">Connecting...</Badge>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-white/60">
                  <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
                  <span>Real-Time Mode Active</span>
                </div>
                <p className="text-white/40 text-sm mt-2">
                  Both players answer the same question simultaneously. Speed matters!
                </p>
              </div>
              
              <Button
                variant="ghost"
                onClick={handleExitMatch}
                className="text-white/70 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render active match gameplay
  if (activeMatch && activeMatch.questions && activeMatch.questions.length > 0 && matchPhase === 'playing') {
    const question = activeMatch.questions[currentQuestion] as MatchQuestion;
    const isCorrect = matchResult?.answer_result?.is_correct;
    const isPlayer1 = activeMatch.player1_id === userRegistrationId;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1929] via-[#0f2942] to-[#0c1929] p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Match Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={handleExitMatch}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Match
            </Button>
            <div className="text-center">
              <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30">
                <Wifi className="w-3 h-3 mr-1" />
                LIVE - Round {activeMatch.round}
              </Badge>
            </div>
            <div className="text-white/70 text-sm">
              Question {currentQuestion + 1}/{activeMatch.questions.length}
            </div>
          </div>

          {/* Real-Time Timer */}
          <Card className="bg-gradient-to-r from-red-500/10 via-[#0f2942] to-red-500/10 border border-red-500/30 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                <Timer className={`w-6 h-6 ${getTimerColor()}`} />
                <span className={`text-3xl font-bold ${getTimerColor()}`}>
                  {formatTimeRemaining(timeRemaining)}
                </span>
                <div className="flex-1 max-w-xs">
                  <Progress 
                    value={(timeRemaining / (activeMatch.time_per_question || 15000)) * 100}
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Display */}
          <Card className="bg-white/5 border border-white/10 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <p className="text-white font-semibold">{displayName}</p>
                    {answerSubmitted && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-[#14B8A6]">
                    {isPlayer1 ? activeMatch.player1_score : activeMatch.player2_score}
                  </p>
                  {answerSubmitted && (
                    <Badge className="bg-green-500/20 text-green-400 text-xs mt-1">Answered</Badge>
                  )}
                </div>
                
                <div className="px-4 flex flex-col items-center">
                  <Swords className="w-8 h-8 text-[#F59E0B]" />
                  <span className="text-white/30 text-xs mt-1">VS</span>
                </div>
                
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <p className="text-white font-semibold">
                      {isPlayer1 ? getPlayerName(activeMatch.player2_id) : getPlayerName(activeMatch.player1_id)}
                    </p>
                    {opponentAnswered && (
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-purple-400">
                    {isPlayer1 ? activeMatch.player2_score : activeMatch.player1_score}
                  </p>
                  {opponentAnswered ? (
                    <Badge className="bg-purple-500/20 text-purple-400 text-xs mt-1">Answered</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400 text-xs mt-1 animate-pulse">Thinking...</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20">
            <CardHeader>
              <Progress 
                value={((currentQuestion + 1) / activeMatch.questions.length) * 100}
                className="h-2 mb-4"
              />
              <CardTitle className="text-white text-xl text-center">
                {question?.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {question?.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left rounded-xl border transition-all ";
                
                if (answerSubmitted) {
                  if (index === question.correct) {
                    buttonClass += "bg-green-500/20 border-green-500/50 text-green-400";
                  } else if (index === selectedAnswer && index !== question.correct) {
                    buttonClass += "bg-red-500/20 border-red-500/50 text-red-400";
                  } else {
                    buttonClass += "bg-white/5 border-white/10 text-white/50";
                  }
                } else if (selectedAnswer === index) {
                  buttonClass += "bg-[#14B8A6]/20 border-[#14B8A6]/50 text-[#14B8A6]";
                } else {
                  buttonClass += "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20";
                }

                return (
                  <button
                    key={index}
                    onClick={() => !answerSubmitted && setSelectedAnswer(index)}
                    disabled={answerSubmitted}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {answerSubmitted && index === question.correct && (
                        <CheckCircle className="w-5 h-5 ml-auto text-green-400" />
                      )}
                      {answerSubmitted && index === selectedAnswer && index !== question.correct && (
                        <XCircle className="w-5 h-5 ml-auto text-red-400" />
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Submit Button */}
              {!answerSubmitted && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full mt-4 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] hover:opacity-90"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Lock In Answer
                </Button>
              )}

              {/* Result Display */}
              {answerSubmitted && matchResult?.answer_result && (
                <div className={`p-4 rounded-xl text-center ${
                  isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  <p className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? `Correct! +${matchResult.answer_result.points} points` : 'Incorrect!'}
                  </p>
                  {!opponentAnswered && (
                    <p className="text-white/50 text-sm mt-2 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Waiting for opponent...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render match results
  if (activeMatch && matchPhase === 'results') {
    const isPlayer1 = activeMatch.player1_id === userRegistrationId;
    const userScore = isPlayer1 ? activeMatch.player1_score : activeMatch.player2_score;
    const opponentScore = isPlayer1 ? activeMatch.player2_score : activeMatch.player1_score;
    const isWinner = activeMatch.winner_id === userRegistrationId;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1929] via-[#0f2942] to-[#0c1929] p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className={`bg-gradient-to-br ${isWinner ? 'from-[#F59E0B]/20 to-green-500/10 border-[#F59E0B]/30' : 'from-purple-500/20 to-blue-500/10 border-purple-500/30'} border`}>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                {isWinner ? (
                  <>
                    <Crown className="w-20 h-20 text-[#F59E0B] mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-[#F59E0B] mb-2">Victory!</h2>
                    <p className="text-white/70">You've advanced to the next round!</p>
                  </>
                ) : (
                  <>
                    <Shield className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-purple-400 mb-2">Defeated</h2>
                    <p className="text-white/70">Better luck next time, disciple.</p>
                  </>
                )}
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-white font-semibold mb-2">{displayName}</p>
                    <p className={`text-4xl font-bold ${isWinner ? 'text-[#F59E0B]' : 'text-white'}`}>{userScore}</p>
                  </div>
                  <div className="px-4">
                    <span className="text-white/30 text-2xl">-</span>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-white font-semibold mb-2">
                      {isPlayer1 ? getPlayerName(activeMatch.player2_id) : getPlayerName(activeMatch.player1_id)}
                    </p>
                    <p className={`text-4xl font-bold ${!isWinner ? 'text-purple-400' : 'text-white'}`}>{opponentScore}</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleExitMatch}
                className="bg-gradient-to-r from-[#14B8A6] to-[#0D9488]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Tournament
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1929] via-[#0f2942] to-[#0c1929] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#F59E0B]/20 to-purple-500/20 border border-[#F59E0B]/30 rounded-full mb-6">
            <Crown className="w-5 h-5 text-[#F59E0B]" />
            <span className="text-[#F59E0B] font-medium">Real-Time Bible Trivia</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Swords className="w-10 h-10 text-[#F59E0B]" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white">
              Tournament of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-purple-400">Disciples</span>
            </h1>
            <Swords className="w-10 h-10 text-[#F59E0B] transform scale-x-[-1]" />
          </div>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Compete in <span className="text-[#14B8A6] font-semibold">real-time</span> bracket-style tournaments against fellow disciples. Answer simultaneously - speed matters!
          </p>
          
          {/* Refresh Button */}
          <Button
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mt-4 text-white/70 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Real-time Status Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
          <span className="text-green-400 text-sm">Real-Time Mode Active</span>
          <Badge className="bg-[#14B8A6]/20 text-[#14B8A6] border-[#14B8A6]/30 ml-2">
            <Wifi className="w-3 h-3 mr-1" />
            Live Matches
          </Badge>
        </div>

        {/* User Stats Banner */}
        {user && (
          <Card className="bg-gradient-to-r from-[#14B8A6]/10 via-[#0f2942] to-[#F59E0B]/10 border border-[#14B8A6]/30 mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F59E0B] to-purple-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{displayName[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{displayName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30">
                        <Trophy className="w-3 h-3 mr-1" />
                        {userRegistrations.filter(r => r.status === 'winner').length} Wins
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        <Users className="w-3 h-3 mr-1" />
                        {userRegistrations.length} Tournaments
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#14B8A6]">{userRegistrations.length}</p>
                    <p className="text-white/50 text-xs">Joined</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#F59E0B]">
                      {userRegistrations.filter(r => r.status === 'winner').length}
                    </p>
                    <p className="text-white/50 text-xs">Won</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">
                      {userRegistrations.reduce((sum, r) => sum + r.matches_won, 0)}
                    </p>
                    <p className="text-white/50 text-xs">Matches</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 rounded-xl p-1 mb-8">
            <TabsTrigger value="tournaments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F59E0B] data-[state=active]:to-[#D97706] rounded-lg">
              <Trophy className="w-4 h-4 mr-2" /> Tournaments
            </TabsTrigger>
            <TabsTrigger value="bracket" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#14B8A6] data-[state=active]:to-[#0D9488] rounded-lg">
              <Target className="w-4 h-4 mr-2" /> My Bracket
            </TabsTrigger>
            <TabsTrigger value="champions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 rounded-lg">
              <Crown className="w-4 h-4 mr-2" /> Champions
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 rounded-lg">
              <Gift className="w-4 h-4 mr-2" /> Rewards
            </TabsTrigger>
          </TabsList>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-6">
            {/* Create Tournament Button (for demo) */}
            {tournaments.length === 0 && (
              <Card className="bg-white/5 border border-white/10 border-dashed">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No Active Tournaments</h3>
                  <p className="text-white/60 mb-4">Create a real-time tournament to get started!</p>
                  <Button
                    onClick={handleCreateSampleTournament}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-[#F59E0B] to-[#D97706]"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Create Real-Time Tournament
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Tournament List */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                Available Tournaments
                <Badge className="bg-[#14B8A6]/20 text-[#14B8A6] ml-2">
                  <Wifi className="w-3 h-3 mr-1" />
                  Real-Time
                </Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament) => {
                  const registered = isUserRegistered(tournament.id);
                  const spotsLeft = tournament.max_participants - tournament.current_participants;
                  
                  return (
                    <Card 
                      key={tournament.id} 
                      className={`bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all overflow-hidden ${
                        registered ? 'ring-2 ring-[#14B8A6]/50' : ''
                      }`}
                    >
                      {/* Tournament Type Banner */}
                      <div className={`h-2 bg-gradient-to-r ${getTournamentTypeColor(tournament.type)}`} />
                      
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getTournamentBadgeColor(tournament.type)}>
                                {tournament.type.charAt(0).toUpperCase() + tournament.type.slice(1)}
                              </Badge>
                              {getStatusBadge(tournament.status)}
                            </div>
                            <CardTitle className="text-white text-lg">{tournament.name}</CardTitle>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-[#F59E0B]">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-medium">{formatTimeUntil(tournament.start_time)}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-white/60 text-sm">{tournament.description || 'Compete against other disciples in real-time!'}</p>
                        
                        {/* Tournament Info */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2 bg-white/5 rounded-lg text-center">
                            <Users className="w-4 h-4 text-[#14B8A6] mx-auto mb-1" />
                            <p className="text-white font-medium text-sm">{tournament.max_participants} Players</p>
                          </div>
                          <div className="p-2 bg-white/5 rounded-lg text-center">
                            <Target className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                            <p className="text-white font-medium text-sm">{spotsLeft} Spots Left</p>
                          </div>
                        </div>
                        
                        {/* Registration Progress */}
                        <div>
                          <div className="flex justify-between text-xs text-white/50 mb-1">
                            <span>Registration</span>
                            <span>{tournament.current_participants}/{tournament.max_participants}</span>
                          </div>
                          <Progress 
                            value={(tournament.current_participants / tournament.max_participants) * 100} 
                            className="h-2 bg-white/10"
                          />
                        </div>
                        
                        {/* Prize */}
                        <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-[#F59E0B]" />
                            <span className="text-[#F59E0B] text-sm font-medium">Prize Pool:</span>
                          </div>
                          <p className="text-white/70 text-sm mt-1">{tournament.prize_pool} Points</p>
                        </div>
                        
                        {/* Register/View Button */}
                        <Button
                          onClick={() => {
                            if (registered || tournament.status === 'active') {
                              setSelectedTournament(tournament);
                              fetchBracket(tournament.id);
                              setActiveTab('bracket');
                            } else {
                              handleRegister(tournament);
                            }
                          }}
                          disabled={isLoading || (tournament.status !== 'registration' && !registered)}
                          className={`w-full ${
                            registered 
                              ? 'bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/30 hover:bg-[#14B8A6]/30' 
                              : `bg-gradient-to-r ${getTournamentTypeColor(tournament.type)} hover:opacity-90`
                          }`}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : registered ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              View Bracket
                            </>
                          ) : tournament.status === 'active' ? (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              View Tournament
                            </>
                          ) : tournament.status === 'registration' ? (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Register Now
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              Coming Soon
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Bracket Tab */}
          <TabsContent value="bracket" className="space-y-6">
            {selectedTournament && bracketData ? (
              <Card className="bg-white/5 border border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#14B8A6]" />
                      {selectedTournament.name} - Bracket
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedTournament.status)}
                      <Badge className="bg-white/10 text-white/70">
                        Round {selectedTournament.current_round}/{selectedTournament.total_rounds}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Bracket Visualization */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px] p-4">
                      {/* Round Labels */}
                      <div className="flex justify-between mb-4 px-4">
                        {Array.from({ length: selectedTournament.total_rounds }, (_, i) => (
                          <span key={i} className={`text-sm font-medium ${
                            i + 1 === selectedTournament.current_round ? 'text-[#F59E0B]' : 'text-white/50'
                          }`}>
                            {i === selectedTournament.total_rounds - 1 ? 'Finals' : 
                             i === selectedTournament.total_rounds - 2 ? 'Semi Finals' : 
                             `Round ${i + 1}`}
                          </span>
                        ))}
                        <span className="text-[#F59E0B] text-sm font-medium">Champion</span>
                      </div>
                      
                      {/* Matches by Round */}
                      <div className="flex items-start justify-between gap-4">
                        {Array.from({ length: selectedTournament.total_rounds }, (_, roundIndex) => {
                          const roundMatches = bracketData.matches.filter(m => m.round === roundIndex + 1);
                          const matchSpacing = roundIndex === 0 ? 'space-y-4' : `space-y-${8 * (roundIndex + 1)}`;
                          
                          return (
                            <div key={roundIndex} className={`flex-1 ${matchSpacing}`}>
                              {roundMatches.length > 0 ? (
                                roundMatches.map((match) => {
                                  const isUserMatch = match.player1_id === userRegistrationId || 
                                                     match.player2_id === userRegistrationId;
                                  
                                  return (
                                    <div 
                                      key={match.id} 
                                      className={`p-3 rounded-lg border ${
                                        isUserMatch 
                                          ? 'bg-[#14B8A6]/10 border-[#14B8A6]/30' 
                                          : 'bg-white/5 border-white/10'
                                      }`}
                                    >
                                      {/* Player 1 */}
                                      <div className={`p-2 rounded ${
                                        match.winner_id === match.player1_id 
                                          ? 'bg-green-500/20 border border-green-500/30' 
                                          : match.player1_id === userRegistrationId
                                            ? 'bg-[#14B8A6]/20'
                                            : 'bg-white/5'
                                      }`}>
                                        <div className="flex items-center justify-between">
                                          <span className="text-white text-sm truncate">
                                            {getPlayerName(match.player1_id)}
                                          </span>
                                          {match.status !== 'pending' && (
                                            <span className="text-white/70 text-sm font-medium">
                                              {match.player1_score}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="text-center text-white/30 text-xs my-1">vs</div>
                                      
                                      {/* Player 2 */}
                                      <div className={`p-2 rounded ${
                                        match.winner_id === match.player2_id 
                                          ? 'bg-green-500/20 border border-green-500/30' 
                                          : match.player2_id === userRegistrationId
                                            ? 'bg-[#14B8A6]/20'
                                            : 'bg-white/5'
                                      }`}>
                                        <div className="flex items-center justify-between">
                                          <span className="text-white/70 text-sm truncate">
                                            {match.player2_id ? getPlayerName(match.player2_id) : 'BYE'}
                                          </span>
                                          {match.status !== 'pending' && match.player2_id && (
                                            <span className="text-white/70 text-sm font-medium">
                                              {match.player2_score}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Match Status */}
                                      <div className="mt-2 text-center">
                                        {match.status === 'completed' ? (
                                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                                            Complete
                                          </Badge>
                                        ) : match.status === 'in_progress' ? (
                                          <Badge className="bg-yellow-500/20 text-yellow-400 text-xs animate-pulse">
                                            <Wifi className="w-3 h-3 mr-1" />
                                            Live
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-white/10 text-white/50 text-xs">
                                            Pending
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                                  <span className="text-white/30 text-sm">TBD</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Champion Display */}
                        <div className="flex-1">
                          <div className="p-4 bg-gradient-to-br from-[#F59E0B]/20 to-purple-500/20 border border-[#F59E0B]/30 rounded-xl text-center">
                            <Crown className="w-8 h-8 text-[#F59E0B] mx-auto mb-2" />
                            {bracketData.registrations.find(r => r.status === 'winner') ? (
                              <span className="text-[#F59E0B] font-semibold">
                                {bracketData.registrations.find(r => r.status === 'winner')?.user_name}
                              </span>
                            ) : (
                              <span className="text-white/50 text-sm">Champion</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* User's Next Match */}
                  {(() => {
                    const userMatch = findUserMatch();
                    if (userMatch && userMatch.status === 'pending') {
                      return (
                        <div className="mt-6 p-4 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-xl">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                              <h4 className="text-white font-semibold flex items-center gap-2">
                                <Swords className="w-4 h-4 text-[#14B8A6]" />
                                Your Next Match
                                <Badge className="bg-[#14B8A6]/20 text-[#14B8A6]">
                                  <Wifi className="w-3 h-3 mr-1" />
                                  Real-Time
                                </Badge>
                              </h4>
                              <p className="text-white/60 text-sm mt-1">
                                Round {userMatch.round} - Match {userMatch.match_number}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/50 text-sm">Opponent</p>
                              <p className="text-white font-medium">
                                {userMatch.player1_id === userRegistrationId 
                                  ? getPlayerName(userMatch.player2_id)
                                  : getPlayerName(userMatch.player1_id)}
                              </p>
                            </div>
                            <Button 
                              onClick={() => handleStartMatch(userMatch)}
                              disabled={isLoading}
                              className="bg-gradient-to-r from-[#14B8A6] to-[#0D9488]"
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4 mr-2" />
                              )}
                              Start Real-Time Match
                            </Button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </CardContent>
              </Card>
            ) : userRegistrations.length > 0 ? (
              <Card className="bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-[#14B8A6]" />
                    Your Tournament History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userRegistrations.map((reg) => (
                      <div 
                        key={reg.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-all"
                        onClick={() => {
                          if (reg.tournaments) {
                            setSelectedTournament(reg.tournaments);
                            fetchBracket(reg.tournament_id);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            reg.status === 'winner' 
                              ? 'bg-[#F59E0B]/20' 
                              : reg.status === 'eliminated'
                                ? 'bg-red-500/20'
                                : 'bg-[#14B8A6]/20'
                          }`}>
                            {reg.status === 'winner' ? (
                              <Crown className="w-5 h-5 text-[#F59E0B]" />
                            ) : reg.status === 'eliminated' ? (
                              <XCircle className="w-5 h-5 text-red-400" />
                            ) : (
                              <Swords className="w-5 h-5 text-[#14B8A6]" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {reg.tournaments?.name || 'Tournament'}
                            </p>
                            <p className="text-white/50 text-sm">
                              Round {reg.current_round} • {reg.matches_won} wins
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={
                            reg.status === 'winner' 
                              ? 'bg-[#F59E0B]/20 text-[#F59E0B]' 
                              : reg.status === 'eliminated'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-[#14B8A6]/20 text-[#14B8A6]'
                          }>
                            {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-white/30" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Active Tournaments</h3>
                  <p className="text-white/60 mb-6">Register for a tournament to see your bracket here!</p>
                  <Button 
                    onClick={() => setActiveTab('tournaments')}
                    className="bg-gradient-to-r from-[#F59E0B] to-[#D97706]"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Browse Tournaments
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Champions Tab */}
          <TabsContent value="champions" className="space-y-6">
            <Card className="bg-white/5 border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#F59E0B]" />
                  Hall of Champions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Grand Champions */}
                  <div className="mb-6">
                    <h3 className="text-white/70 text-sm font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Grand Champions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { name: 'TruthSeeker', wins: 5, avatar: 'T' },
                        { name: 'FaithfulServant', wins: 4, avatar: 'F' },
                        { name: 'WordWarrior', wins: 3, avatar: 'W' },
                      ].map((champion, index) => (
                        <div 
                          key={champion.name}
                          className={`p-4 rounded-xl border ${
                            index === 0 
                              ? 'bg-gradient-to-br from-[#F59E0B]/20 to-yellow-600/10 border-[#F59E0B]/30' 
                              : index === 1 
                                ? 'bg-gradient-to-br from-gray-400/20 to-gray-500/10 border-gray-400/30'
                                : 'bg-gradient-to-br from-orange-600/20 to-orange-700/10 border-orange-600/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                              index === 0 ? 'bg-[#F59E0B] text-black' :
                              index === 1 ? 'bg-gray-400 text-black' :
                              'bg-orange-600 text-white'
                            }`}>
                              {champion.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold">{champion.name}</span>
                                {index === 0 && <Crown className="w-4 h-4 text-[#F59E0B]" />}
                              </div>
                              <p className="text-white/50 text-sm">{champion.wins} Championship Wins</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recent Winners from Database */}
                  <div>
                    <h3 className="text-white/70 text-sm font-medium mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-blue-400" />
                      Recent Tournament Winners
                    </h3>
                    {userRegistrations.filter(r => r.status === 'winner').length > 0 ? (
                      <div className="space-y-2">
                        {userRegistrations.filter(r => r.status === 'winner').map((winner) => (
                          <div key={winner.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Medal className="w-5 h-5 text-[#F59E0B]" />
                              <div>
                                <span className="text-white font-medium">{winner.user_name}</span>
                                <p className="text-white/50 text-xs">{winner.tournaments?.name}</p>
                              </div>
                            </div>
                            <span className="text-white/50 text-sm">
                              {new Date(winner.registered_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/50 text-center py-4">No winners yet. Be the first champion!</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Badges */}
              <Card className="bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    Tournament Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: 'First Win', icon: Trophy, color: 'text-green-400', unlocked: userRegistrations.some(r => r.matches_won > 0) },
                      { name: 'Daily Champ', icon: Star, color: 'text-[#F59E0B]', unlocked: userRegistrations.some(r => r.status === 'winner') },
                      { name: 'Weekly Champ', icon: Crown, color: 'text-blue-400', unlocked: false },
                      { name: 'Grand Champ', icon: Sparkles, color: 'text-purple-400', unlocked: false },
                      { name: '5 Win Streak', icon: Flame, color: 'text-orange-400', unlocked: false },
                      { name: 'Undefeated', icon: Shield, color: 'text-red-400', unlocked: false },
                    ].map((badge) => {
                      const Icon = badge.icon;
                      return (
                        <div 
                          key={badge.name}
                          className={`p-4 rounded-xl text-center ${
                            badge.unlocked 
                              ? 'bg-white/10 border border-white/20' 
                              : 'bg-white/5 border border-white/10 opacity-50'
                          }`}
                        >
                          <Icon className={`w-8 h-8 mx-auto mb-2 ${badge.unlocked ? badge.color : 'text-white/30'}`} />
                          <p className={`text-xs ${badge.unlocked ? 'text-white' : 'text-white/50'}`}>{badge.name}</p>
                          {!badge.unlocked && <Lock className="w-3 h-3 mx-auto mt-1 text-white/30" />}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Point Rewards */}
              <Card className="bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#F59E0B]" />
                    Point Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Daily Tournament Win</p>
                            <p className="text-white/50 text-sm">Win a daily tournament</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-bold">+100 pts</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Weekly Tournament Win</p>
                            <p className="text-white/50 text-sm">Win a weekly tournament</p>
                          </div>
                        </div>
                        <span className="text-blue-400 font-bold">+500 pts</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Grand Championship Win</p>
                            <p className="text-white/50 text-sm">Win the monthly championship</p>
                          </div>
                        </div>
                        <span className="text-purple-400 font-bold">+2000 pts</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Your Rewards Summary */}
            <Card className="bg-gradient-to-r from-[#F59E0B]/10 via-[#0f2942] to-purple-500/10 border border-[#F59E0B]/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg">Your Tournament Rewards</h3>
                    <p className="text-white/60">Keep competing to earn more!</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-[#F59E0B]">
                      {userRegistrations.reduce((sum, r) => sum + r.total_score, 0)}
                    </p>
                    <p className="text-white/50 text-sm">Total Points Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default TournamentOfDisciples;
