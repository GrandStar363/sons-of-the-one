import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Heart, 
  Send, 
  Save,
  Bell,
  Globe,
  Calendar,
  CheckCircle,
  Loader2,
  ArrowRight,
  Trophy,
  Users,
  Swords,
  Target,
  Flame,
  Zap,
  Crown,
  Share2,
  Gift,
  Star,
  Brain
} from 'lucide-react';

interface DailyRemindersProps {
  user: User | null;
  onOpenAuth: () => void;
}

interface ReminderPreferences {
  remindersEnabled: boolean;
  continueReadingEnabled: boolean;
  newStudySuggestions: boolean;
  encouragementEnabled: boolean;
  triviaChallengeEnabled: boolean;
  competitionInvitesEnabled: boolean;
  leaderboardUpdatesEnabled: boolean;
  reminderTime: string;
  timezone: string;
  frequency: string;
  email: string;
  displayName: string;
}

const defaultPreferences: ReminderPreferences = {
  remindersEnabled: true,
  continueReadingEnabled: true,
  newStudySuggestions: true,
  encouragementEnabled: true,
  triviaChallengeEnabled: true,
  competitionInvitesEnabled: true,
  leaderboardUpdatesEnabled: true,
  reminderTime: '07:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
  frequency: 'daily',
  email: '',
  displayName: ''
};

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC'
];

// Daily trivia topics for email
const triviaTopics = [
  { topic: "Old Testament Heroes", difficulty: "beginner", questions: 10 },
  { topic: "Parables of Jesus", difficulty: "intermediate", questions: 8 },
  { topic: "Books of the Bible", difficulty: "beginner", questions: 12 },
  { topic: "Miracles in Scripture", difficulty: "intermediate", questions: 10 },
  { topic: "Prophecy & Fulfillment", difficulty: "advanced", questions: 8 },
  { topic: "Biblical Geography", difficulty: "advanced", questions: 10 },
  { topic: "Women of Faith", difficulty: "intermediate", questions: 8 },
  { topic: "Kings & Kingdoms", difficulty: "expert", questions: 10 }
];

// Competition challenge messages
const challengeMessages = [
  "Iron sharpens iron! Challenge a friend to test their Bible knowledge today.",
  "Who knows Scripture better? Find out by challenging someone to a trivia duel!",
  "Grow together in faith! Invite a friend to compete in today's Bible challenge.",
  "Two are better than one! Challenge a fellow believer to sharpen your knowledge.",
  "Make learning fun! See who can score higher in today's trivia challenge."
];

const DailyReminders: React.FC<DailyRemindersProps> = ({ user, onOpenAuth }) => {
  const [preferences, setPreferences] = useState<ReminderPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [lastActivity, setLastActivity] = useState<{ lastBook?: string; lastChapter?: number } | null>(null);
  const [todaysTopic, setTodaysTopic] = useState(triviaTopics[0]);
  const [challengeMessage, setChallengeMessage] = useState(challengeMessages[0]);

  // Set random topic and message on mount
  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setTodaysTopic(triviaTopics[dayOfYear % triviaTopics.length]);
    setChallengeMessage(challengeMessages[dayOfYear % challengeMessages.length]);
  }, []);

  // Load preferences on mount
  useEffect(() => {
    if (user) {
      loadPreferences();
      loadLastActivity();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-daily-reminders', {
        body: {
          action: 'get-preferences',
          userId: user.id
        }
      });

      if (error) throw error;

      if (data?.preferences) {
        setPreferences({
          remindersEnabled: data.preferences.reminders_enabled ?? true,
          continueReadingEnabled: data.preferences.continue_reading_enabled ?? true,
          newStudySuggestions: data.preferences.new_study_suggestions ?? true,
          encouragementEnabled: data.preferences.encouragement_enabled ?? true,
          triviaChallengeEnabled: data.preferences.trivia_challenge_enabled ?? true,
          competitionInvitesEnabled: data.preferences.competition_invites_enabled ?? true,
          leaderboardUpdatesEnabled: data.preferences.leaderboard_updates_enabled ?? true,
          reminderTime: data.preferences.reminder_time?.substring(0, 5) || '07:00',
          timezone: data.preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          frequency: data.preferences.frequency || 'daily',
          email: data.preferences.email || user.email || '',
          displayName: data.preferences.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || ''
        });
      } else {
        // Set defaults from user data
        setPreferences(prev => ({
          ...prev,
          email: user.email || '',
          displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || ''
        }));
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLastActivity = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('last_book, last_chapter')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setLastActivity({
          lastBook: data.last_book,
          lastChapter: data.last_chapter
        });
      }
    } catch (err) {
      console.error('Error loading activity:', err);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke('send-daily-reminders', {
        body: {
          action: 'save-preferences',
          userId: user.id,
          email: preferences.email,
          preferences: {
            displayName: preferences.displayName,
            remindersEnabled: preferences.remindersEnabled,
            continueReadingEnabled: preferences.continueReadingEnabled,
            newStudySuggestions: preferences.newStudySuggestions,
            encouragementEnabled: preferences.encouragementEnabled,
            triviaChallengeEnabled: preferences.triviaChallengeEnabled,
            competitionInvitesEnabled: preferences.competitionInvitesEnabled,
            leaderboardUpdatesEnabled: preferences.leaderboardUpdatesEnabled,
            reminderTime: preferences.reminderTime + ':00',
            timezone: preferences.timezone,
            frequency: preferences.frequency
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your daily reminder preferences have been updated.",
      });
    } catch (err) {
      console.error('Error saving preferences:', err);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const sendTestReminder = async () => {
    if (!user || !preferences.email) return;

    setSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-daily-reminders', {
        body: {
          action: 'test-reminder',
          userId: user.id,
          email: preferences.email,
          preferences: {
            displayName: preferences.displayName || 'Friend',
            lastBook: lastActivity?.lastBook,
            lastChapter: lastActivity?.lastChapter,
            triviaChallengeEnabled: preferences.triviaChallengeEnabled,
            competitionInvitesEnabled: preferences.competitionInvitesEnabled,
            leaderboardUpdatesEnabled: preferences.leaderboardUpdatesEnabled
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent!",
        description: `A preview email has been sent to ${preferences.email}`,
      });
    } catch (err) {
      console.error('Error sending test:', err);
      toast({
        title: "Error",
        description: "Failed to send test email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSendingTest(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#F59E0B]/10 border border-[#14B8A6]/30 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#14B8A6]/20 to-[#F59E0B]/20 flex items-center justify-center">
            <Mail className="w-10 h-10 text-[#14B8A6]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Daily Spiritual Reminders
          </h2>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            Sign in to receive personalized daily reminders to continue your Bible study journey, 
            explore new topics, challenge friends to trivia, and receive encouragement for spiritual growth.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all shadow-lg shadow-teal-500/25"
          >
            Sign In to Enable Reminders
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#F59E0B]/10 border border-[#14B8A6]/30 rounded-2xl p-8 text-center">
          <Loader2 className="w-8 h-8 text-[#14B8A6] animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#14B8A6]/20 to-[#F59E0B]/20 mb-4">
          <Bell className="w-8 h-8 text-[#14B8A6]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2">
          Daily Spiritual Reminders
        </h1>
        <p className="text-white/70 max-w-lg mx-auto">
          Receive personalized emails to continue your journey, challenge friends to trivia, and grow in faith together.
        </p>
      </div>

      {/* Challenge Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-[#F59E0B]/20 via-[#EF4444]/20 to-[#8B5CF6]/20 border border-[#F59E0B]/30 rounded-2xl">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#EF4444] flex items-center justify-center flex-shrink-0">
            <Swords className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center">
              <span>Challenge Friends to Grow Together!</span>
              <Flame className="w-5 h-5 ml-2 text-[#F59E0B]" />
            </h3>
            <p className="text-white/80 mb-3">
              {challengeMessage}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[#14B8A6]/20 text-[#14B8A6] rounded-full text-sm font-medium flex items-center">
                <Trophy className="w-4 h-4 mr-1" /> Leaderboard Rankings
              </span>
              <span className="px-3 py-1 bg-[#F59E0B]/20 text-[#F59E0B] rounded-full text-sm font-medium flex items-center">
                <Brain className="w-4 h-4 mr-1" /> Daily Trivia
              </span>
              <span className="px-3 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full text-sm font-medium flex items-center">
                <Users className="w-4 h-4 mr-1" /> Friend Challenges
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#F59E0B]/10 border border-[#14B8A6]/30 rounded-2xl overflow-hidden">
        
        {/* Master Toggle */}
        <div className="p-6 border-b border-[#14B8A6]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Enable Daily Reminders</h3>
                <p className="text-sm text-white/60">Receive emails to continue your spiritual journey</p>
              </div>
            </div>
            <Switch
              checked={preferences.remindersEnabled}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, remindersEnabled: checked }))}
            />
          </div>
        </div>

        {preferences.remindersEnabled && (
          <>
            {/* Email & Name */}
            <div className="p-6 border-b border-[#14B8A6]/20">
              <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
                <Mail className="w-5 h-5 text-[#14B8A6]" />
                <span>Your Information</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName" className="text-sm text-white/70">Your Name</Label>
                  <Input
                    id="displayName"
                    value={preferences.displayName}
                    onChange={(e) => setPreferences(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="How should we address you?"
                    className="mt-1 bg-white/5 border-[#14B8A6]/30 text-white placeholder-white/40 focus:border-[#14B8A6]"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm text-white/70">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={preferences.email}
                    onChange={(e) => setPreferences(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="mt-1 bg-white/5 border-[#14B8A6]/30 text-white placeholder-white/40 focus:border-[#14B8A6]"
                  />
                </div>
              </div>
            </div>

            {/* Study Content Options */}
            <div className="p-6 border-b border-[#14B8A6]/20">
              <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-[#14B8A6]" />
                <span>Study Reminders</span>
              </h3>
              
              <div className="space-y-4">
                {/* Continue Reading */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-[#14B8A6]/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#14B8A6]/20 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[#14B8A6]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Continue Where You Left Off</p>
                      <p className="text-xs text-white/60">
                        {lastActivity?.lastBook 
                          ? `Currently: ${lastActivity.lastBook} ${lastActivity.lastChapter}`
                          : 'Reminds you of your last reading location'
                        }
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.continueReadingEnabled}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, continueReadingEnabled: checked }))}
                  />
                </div>

                {/* New Study Suggestions */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-[#F59E0B]/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">New Study Suggestions</p>
                      <p className="text-xs text-white/60">Discover new topics and areas to explore</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.newStudySuggestions}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, newStudySuggestions: checked }))}
                  />
                </div>

                {/* Encouragement */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-[#A855F7]/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#A855F7]/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-[#A855F7]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Daily Encouragement</p>
                      <p className="text-xs text-white/60">Inspirational verses and messages for growth</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.encouragementEnabled}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, encouragementEnabled: checked }))}
                  />
                </div>
              </div>
            </div>

            {/* Challenge & Competition Options */}
            <div className="p-6 border-b border-[#14B8A6]/20">
              <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-[#F59E0B]" />
                <span>Challenges & Competition</span>
              </h3>
              <p className="text-sm text-white/60 mb-4">
                Grow together with friends through friendly competition and trivia challenges!
              </p>
              
              <div className="space-y-4">
                {/* Daily Trivia Challenge */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F59E0B]/10 to-[#EF4444]/10 rounded-xl border border-[#F59E0B]/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#EF4444] flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white flex items-center">
                        Daily Trivia Challenge
                        <Zap className="w-4 h-4 ml-2 text-[#F59E0B]" />
                      </p>
                      <p className="text-xs text-white/60">
                        Today's topic: <span className="text-[#F59E0B] font-medium">{todaysTopic.topic}</span> ({todaysTopic.questions} questions)
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.triviaChallengeEnabled}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, triviaChallengeEnabled: checked }))}
                  />
                </div>

                {/* Challenge Friends */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#EC4899]/10 rounded-xl border border-[#8B5CF6]/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center">
                      <Swords className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white flex items-center">
                        Challenge Friends Invitations
                        <Users className="w-4 h-4 ml-2 text-[#8B5CF6]" />
                      </p>
                      <p className="text-xs text-white/60">
                        Get reminders to invite friends to compete in trivia
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.competitionInvitesEnabled}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, competitionInvitesEnabled: checked }))}
                  />
                </div>

                {/* Leaderboard Updates */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#14B8A6]/10 to-[#3B82F6]/10 rounded-xl border border-[#14B8A6]/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#14B8A6] to-[#3B82F6] flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white flex items-center">
                        Leaderboard Updates
                        <Target className="w-4 h-4 ml-2 text-[#14B8A6]" />
                      </p>
                      <p className="text-xs text-white/60">
                        See your ranking and celebrate community achievements
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.leaderboardUpdatesEnabled}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, leaderboardUpdatesEnabled: checked }))}
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="p-6 border-b border-[#14B8A6]/20">
              <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#14B8A6]" />
                <span>Schedule</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Time */}
                <div>
                  <Label htmlFor="time" className="text-sm text-white/70">Reminder Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={preferences.reminderTime}
                    onChange={(e) => setPreferences(prev => ({ ...prev, reminderTime: e.target.value }))}
                    className="mt-1 bg-white/5 border-[#14B8A6]/30 text-white focus:border-[#14B8A6]"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <Label htmlFor="frequency" className="text-sm text-white/70">Frequency</Label>
                  <Select
                    value={preferences.frequency}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger className="mt-1 bg-white/5 border-[#14B8A6]/30 text-white focus:border-[#14B8A6]">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekdays">Weekdays Only</SelectItem>
                      <SelectItem value="weekends">Weekends Only</SelectItem>
                      <SelectItem value="weekly">Weekly (Sundays)</SelectItem>
                      <SelectItem value="twice-weekly">Twice Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timezone */}
                <div>
                  <Label htmlFor="timezone" className="text-sm text-white/70">Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger className="mt-1 bg-white/5 border-[#14B8A6]/30 text-white focus:border-[#14B8A6]">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Schedule Preview */}
              <div className="mt-4 p-3 bg-[#14B8A6]/10 rounded-xl border border-[#14B8A6]/20">
                <p className="text-sm text-white">
                  <Calendar className="w-4 h-4 inline mr-2 text-[#14B8A6]" />
                  <span className="font-medium">Your schedule:</span>{' '}
                  {preferences.frequency === 'daily' && 'Every day'}
                  {preferences.frequency === 'weekdays' && 'Monday through Friday'}
                  {preferences.frequency === 'weekends' && 'Saturday and Sunday'}
                  {preferences.frequency === 'weekly' && 'Every Sunday'}
                  {preferences.frequency === 'twice-weekly' && 'Wednesday and Sunday'}
                  {' at '}
                  {new Date(`2000-01-01T${preferences.reminderTime}`).toLocaleTimeString([], { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                  {' '}
                  ({preferences.timezone.replace(/_/g, ' ')})
                </p>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="p-6 bg-white/5">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={savePreferences}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>

            {preferences.remindersEnabled && preferences.email && (
              <button
                onClick={sendTestReminder}
                disabled={sendingTest}
                className="px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/25"
              >
                {sendingTest ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Persuasive Challenge Card */}
      <div className="mt-6 p-6 bg-gradient-to-br from-[#8B5CF6]/20 via-[#0f2942] to-[#EC4899]/20 border border-[#8B5CF6]/30 rounded-2xl">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              Why Challenge Others?
            </h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li className="flex items-start space-x-2">
                <Star className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                <span><strong className="text-[#F59E0B]">Iron sharpens iron</strong> — Grow stronger together through friendly competition</span>
              </li>
              <li className="flex items-start space-x-2">
                <Star className="w-4 h-4 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                <span><strong className="text-[#14B8A6]">Accountability</strong> — Stay motivated with friends on the same journey</span>
              </li>
              <li className="flex items-start space-x-2">
                <Star className="w-4 h-4 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                <span><strong className="text-[#8B5CF6]">Learn together</strong> — Discover new insights through shared trivia challenges</span>
              </li>
              <li className="flex items-start space-x-2">
                <Star className="w-4 h-4 text-[#EC4899] mt-0.5 flex-shrink-0" />
                <span><strong className="text-[#EC4899]">Spread the Word</strong> — Invite others to grow in their knowledge of Scripture</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#F59E0B]/10 to-[#14B8A6]/10 border border-[#F59E0B]/30 rounded-xl">
        <div className="flex items-start space-x-3">
          <Heart className="w-5 h-5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-white/80">
              <span className="font-semibold text-[#F59E0B]">Daily Encouragement:</span>{' '}
              Each reminder is crafted to help you grow as a{' '}
              <span className="font-bold italic text-[#F59E0B]">Son of God</span>,{' '}
              with personalized suggestions based on your reading history, trivia challenges to test your knowledge, 
              and invitations to challenge friends in friendly competition!
            </p>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {preferences.remindersEnabled && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <ArrowRight className="w-5 h-5 text-[#14B8A6]" />
            <span>What Your Email Will Include</span>
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {preferences.continueReadingEnabled && (
              <div className="bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-xl p-3 text-center">
                <BookOpen className="w-6 h-6 text-[#14B8A6] mx-auto mb-2" />
                <p className="text-xs font-medium text-white">Continue Reading</p>
              </div>
            )}
            
            {preferences.newStudySuggestions && (
              <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-3 text-center">
                <Sparkles className="w-6 h-6 text-[#F59E0B] mx-auto mb-2" />
                <p className="text-xs font-medium text-white">New Topics</p>
              </div>
            )}
            
            {preferences.encouragementEnabled && (
              <div className="bg-[#A855F7]/10 border border-[#A855F7]/30 rounded-xl p-3 text-center">
                <Heart className="w-6 h-6 text-[#A855F7] mx-auto mb-2" />
                <p className="text-xs font-medium text-white">Daily Verse</p>
              </div>
            )}

            {preferences.triviaChallengeEnabled && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-3 text-center">
                <Brain className="w-6 h-6 text-[#EF4444] mx-auto mb-2" />
                <p className="text-xs font-medium text-white">Trivia Challenge</p>
              </div>
            )}

            {preferences.competitionInvitesEnabled && (
              <div className="bg-[#EC4899]/10 border border-[#EC4899]/30 rounded-xl p-3 text-center">
                <Swords className="w-6 h-6 text-[#EC4899] mx-auto mb-2" />
                <p className="text-xs font-medium text-white">Challenge Friends</p>
              </div>
            )}

            {preferences.leaderboardUpdatesEnabled && (
              <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-xl p-3 text-center">
                <Crown className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
                <p className="text-xs font-medium text-white">Leaderboard</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Invitation */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[#14B8A6]/10 to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl text-center">
        <Share2 className="w-10 h-10 text-[#14B8A6] mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">Invite Friends to Join!</h3>
        <p className="text-white/70 mb-4 max-w-md mx-auto">
          Know someone who would love to grow in their Bible knowledge? 
          Share this app and challenge them to a trivia competition!
        </p>
        <p className="text-sm text-[#14B8A6] italic">
          "As iron sharpens iron, so one person sharpens another." — Proverbs 27:17
        </p>
      </div>
    </div>
  );
};

export default DailyReminders;
