import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  Sun,
  Moon,
  Sunrise,
  Coffee,
  BookMarked,
  MessageCircle,
  Flame,
  Cross,
  HandHeart,
  Star,
  Zap,
  Gift,
  Users,
  ChevronRight
} from 'lucide-react';

interface EmailDevotionalSubscriptionProps {
  user: User | null;
  onOpenAuth: () => void;
}

interface DevotionalPreferences {
  subscriptionEnabled: boolean;
  email: string;
  displayName: string;
  deliveryTime: string;
  timezone: string;
  frequency: 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'custom';
  customDays: string[];
  // Content Types
  verseOfTheDay: boolean;
  fullDevotional: boolean;
  prayerFocus: boolean;
  scriptureMemory: boolean;
  wwjdScenario: boolean;
  sonshipTeaching: boolean;
  // Additional preferences
  includeReflectionQuestions: boolean;
  includePrayerPrompts: boolean;
  includeActionSteps: boolean;
}

const defaultPreferences: DevotionalPreferences = {
  subscriptionEnabled: false,
  email: '',
  displayName: '',
  deliveryTime: '06:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
  frequency: 'daily',
  customDays: [],
  verseOfTheDay: true,
  fullDevotional: true,
  prayerFocus: true,
  scriptureMemory: false,
  wwjdScenario: false,
  sonshipTeaching: true,
  includeReflectionQuestions: true,
  includePrayerPrompts: true,
  includeActionSteps: false,
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
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Africa/Lagos',
  'Africa/Johannesburg',
  'America/Sao_Paulo',
  'America/Mexico_City',
  'UTC'
];

const weekDays = [
  { id: 'sunday', label: 'Sun', fullLabel: 'Sunday' },
  { id: 'monday', label: 'Mon', fullLabel: 'Monday' },
  { id: 'tuesday', label: 'Tue', fullLabel: 'Tuesday' },
  { id: 'wednesday', label: 'Wed', fullLabel: 'Wednesday' },
  { id: 'thursday', label: 'Thu', fullLabel: 'Thursday' },
  { id: 'friday', label: 'Fri', fullLabel: 'Friday' },
  { id: 'saturday', label: 'Sat', fullLabel: 'Saturday' },
];

const deliveryTimePresets = [
  { value: '05:00', label: 'Early Morning (5:00 AM)', icon: Moon },
  { value: '06:00', label: 'Dawn (6:00 AM)', icon: Sunrise },
  { value: '07:00', label: 'Morning (7:00 AM)', icon: Sun },
  { value: '08:00', label: 'Breakfast (8:00 AM)', icon: Coffee },
  { value: '12:00', label: 'Noon (12:00 PM)', icon: Sun },
  { value: '18:00', label: 'Evening (6:00 PM)', icon: Sunrise },
  { value: '21:00', label: 'Night (9:00 PM)', icon: Moon },
];

const EmailDevotionalSubscription: React.FC<EmailDevotionalSubscriptionProps> = ({ user, onOpenAuth }) => {
  const [preferences, setPreferences] = useState<DevotionalPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'content' | 'extras'>('schedule');

  // Load preferences on mount
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-devotional-email', {
        body: {
          action: 'get-preferences',
          userId: user.id
        }
      });

      if (error) throw error;

      if (data?.preferences) {
        setPreferences({
          subscriptionEnabled: data.preferences.subscription_enabled ?? false,
          email: data.preferences.email || user.email || '',
          displayName: data.preferences.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || '',
          deliveryTime: data.preferences.delivery_time?.substring(0, 5) || '06:00',
          timezone: data.preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          frequency: data.preferences.frequency || 'daily',
          customDays: data.preferences.custom_days || [],
          verseOfTheDay: data.preferences.verse_of_the_day ?? true,
          fullDevotional: data.preferences.full_devotional ?? true,
          prayerFocus: data.preferences.prayer_focus ?? true,
          scriptureMemory: data.preferences.scripture_memory ?? false,
          wwjdScenario: data.preferences.wwjd_scenario ?? false,
          sonshipTeaching: data.preferences.sonship_teaching ?? true,
          includeReflectionQuestions: data.preferences.include_reflection_questions ?? true,
          includePrayerPrompts: data.preferences.include_prayer_prompts ?? true,
          includeActionSteps: data.preferences.include_action_steps ?? false,
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
      // Set defaults from user data on error
      setPreferences(prev => ({
        ...prev,
        email: user.email || '',
        displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || ''
      }));
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke('send-devotional-email', {
        body: {
          action: 'save-preferences',
          userId: user.id,
          email: preferences.email,
          preferences: {
            displayName: preferences.displayName,
            subscriptionEnabled: preferences.subscriptionEnabled,
            deliveryTime: preferences.deliveryTime + ':00',
            timezone: preferences.timezone,
            frequency: preferences.frequency,
            customDays: preferences.customDays,
            verseOfTheDay: preferences.verseOfTheDay,
            fullDevotional: preferences.fullDevotional,
            prayerFocus: preferences.prayerFocus,
            scriptureMemory: preferences.scriptureMemory,
            wwjdScenario: preferences.wwjdScenario,
            sonshipTeaching: preferences.sonshipTeaching,
            includeReflectionQuestions: preferences.includeReflectionQuestions,
            includePrayerPrompts: preferences.includePrayerPrompts,
            includeActionSteps: preferences.includeActionSteps,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Preferences Saved!",
        description: preferences.subscriptionEnabled 
          ? "You're now subscribed to daily devotional emails." 
          : "Your preferences have been updated.",
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

  const sendTestEmail = async () => {
    if (!user || !preferences.email) return;

    setSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke('send-devotional-email', {
        body: {
          action: 'send-test',
          userId: user.id,
          email: preferences.email,
          preferences: {
            displayName: preferences.displayName || 'Friend',
            verseOfTheDay: preferences.verseOfTheDay,
            fullDevotional: preferences.fullDevotional,
            prayerFocus: preferences.prayerFocus,
            scriptureMemory: preferences.scriptureMemory,
            wwjdScenario: preferences.wwjdScenario,
            sonshipTeaching: preferences.sonshipTeaching,
            includeReflectionQuestions: preferences.includeReflectionQuestions,
            includePrayerPrompts: preferences.includePrayerPrompts,
            includeActionSteps: preferences.includeActionSteps,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent!",
        description: `A preview devotional has been sent to ${preferences.email}`,
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

  const toggleCustomDay = (dayId: string) => {
    setPreferences(prev => ({
      ...prev,
      customDays: prev.customDays.includes(dayId)
        ? prev.customDays.filter(d => d !== dayId)
        : [...prev.customDays, dayId]
    }));
  };

  const getScheduleDescription = () => {
    const time = new Date(`2000-01-01T${preferences.deliveryTime}`).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    switch (preferences.frequency) {
      case 'daily':
        return `Every day at ${time}`;
      case 'weekdays':
        return `Monday through Friday at ${time}`;
      case 'weekends':
        return `Saturday and Sunday at ${time}`;
      case 'weekly':
        return `Every Sunday at ${time}`;
      case 'custom':
        if (preferences.customDays.length === 0) return 'No days selected';
        const dayNames = preferences.customDays
          .map(d => weekDays.find(w => w.id === d)?.fullLabel)
          .filter(Boolean)
          .join(', ');
        return `${dayNames} at ${time}`;
      default:
        return `At ${time}`;
    }
  };

  const getSelectedContentCount = () => {
    let count = 0;
    if (preferences.verseOfTheDay) count++;
    if (preferences.fullDevotional) count++;
    if (preferences.prayerFocus) count++;
    if (preferences.scriptureMemory) count++;
    if (preferences.wwjdScenario) count++;
    if (preferences.sonshipTeaching) count++;
    return count;
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#F59E0B]/10 border border-[#14B8A6]/30 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#14B8A6]/20 to-[#F59E0B]/20 flex items-center justify-center">
            <Mail className="w-10 h-10 text-[#14B8A6]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Daily Devotional Emails
          </h2>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            Sign in to receive personalized daily devotionals, scripture readings, prayer prompts, 
            and spiritual encouragement delivered directly to your inbox.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all shadow-lg shadow-teal-500/25"
          >
            Sign In to Subscribe
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
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#14B8A6]/30 to-[#F59E0B]/30 mb-4 relative">
          <Mail className="w-10 h-10 text-[#14B8A6]" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2">
          Daily Devotional Emails
        </h1>
        <p className="text-white/70 max-w-lg mx-auto">
          Start each day with God's Word. Customize your devotional experience with scripture, 
          prayer prompts, and spiritual teachings delivered to your inbox.
        </p>
      </div>

      {/* Subscription Preview Banner */}
      {!preferences.subscriptionEnabled && (
        <div className="mb-8 p-6 bg-gradient-to-r from-[#F59E0B]/20 via-[#14B8A6]/10 to-[#8B5CF6]/20 border border-[#F59E0B]/30 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center flex-shrink-0">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-xl font-bold text-white mb-1">
                Subscribe to Daily Devotionals
              </h3>
              <p className="text-white/70 text-sm">
                Join thousands of believers receiving daily spiritual nourishment. 
                Customize exactly what content you want to receive.
              </p>
            </div>
            <button
              onClick={() => setPreferences(prev => ({ ...prev, subscriptionEnabled: true }))}
              className="px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all shadow-lg shadow-amber-500/25 flex items-center space-x-2"
            >
              <span>Subscribe Now</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#F59E0B]/10 border border-[#14B8A6]/30 rounded-2xl overflow-hidden">
        
        {/* Master Toggle */}
        <div className="p-6 border-b border-[#14B8A6]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                preferences.subscriptionEnabled 
                  ? 'bg-gradient-to-br from-[#14B8A6] to-[#0D9488]' 
                  : 'bg-white/10'
              }`}>
                <Bell className={`w-7 h-7 ${preferences.subscriptionEnabled ? 'text-white' : 'text-white/50'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Email Subscription</h3>
                <p className="text-sm text-white/60">
                  {preferences.subscriptionEnabled 
                    ? `Receiving ${getSelectedContentCount()} content types` 
                    : 'Enable to receive daily devotionals'}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.subscriptionEnabled}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, subscriptionEnabled: checked }))}
            />
          </div>
        </div>

        {preferences.subscriptionEnabled && (
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

            {/* Tab Navigation */}
            <div className="border-b border-[#14B8A6]/20">
              <div className="flex">
                {[
                  { id: 'schedule', label: 'Schedule', icon: Clock },
                  { id: 'content', label: 'Content', icon: BookOpen },
                  { id: 'extras', label: 'Extras', icon: Sparkles },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-4 flex items-center justify-center space-x-2 transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#14B8A6]/20 text-[#5EEAD4] border-b-2 border-[#14B8A6]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="p-6 space-y-6">
                {/* Delivery Time */}
                <div>
                  <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#F59E0B]" />
                    <span>Delivery Time</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {deliveryTimePresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => {
                          setPreferences(prev => ({ ...prev, deliveryTime: preset.value }));
                          setShowCustomTime(false);
                        }}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center space-y-1 ${
                          preferences.deliveryTime === preset.value && !showCustomTime
                            ? 'bg-[#14B8A6]/20 border-[#14B8A6] text-[#5EEAD4]'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-[#14B8A6]/50'
                        }`}
                      >
                        <preset.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{preset.label.split(' ')[0]}</span>
                        <span className="text-xs opacity-60">{preset.label.match(/\(([^)]+)\)/)?.[1]}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowCustomTime(!showCustomTime)}
                    className="text-sm text-[#14B8A6] hover:text-[#5EEAD4] transition-colors"
                  >
                    {showCustomTime ? 'Use preset time' : 'Set custom time'}
                  </button>

                  {showCustomTime && (
                    <div className="mt-3">
                      <Input
                        type="time"
                        value={preferences.deliveryTime}
                        onChange={(e) => setPreferences(prev => ({ ...prev, deliveryTime: e.target.value }))}
                        className="bg-white/5 border-[#14B8A6]/30 text-white focus:border-[#14B8A6] w-40"
                      />
                    </div>
                  )}
                </div>

                {/* Frequency */}
                <div>
                  <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#F59E0B]" />
                    <span>Frequency</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { value: 'daily', label: 'Daily', desc: 'Every day' },
                      { value: 'weekdays', label: 'Weekdays', desc: 'Mon-Fri' },
                      { value: 'weekends', label: 'Weekends', desc: 'Sat-Sun' },
                      { value: 'weekly', label: 'Weekly', desc: 'Sundays' },
                      { value: 'custom', label: 'Custom', desc: 'Pick days' },
                    ].map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => setPreferences(prev => ({ ...prev, frequency: freq.value as any }))}
                        className={`p-3 rounded-xl border transition-all text-center ${
                          preferences.frequency === freq.value
                            ? 'bg-[#14B8A6]/20 border-[#14B8A6] text-[#5EEAD4]'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-[#14B8A6]/50'
                        }`}
                      >
                        <span className="block font-medium text-sm">{freq.label}</span>
                        <span className="block text-xs opacity-60">{freq.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Days Selector */}
                  {preferences.frequency === 'custom' && (
                    <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm text-white/70 mb-3">Select which days to receive devotionals:</p>
                      <div className="flex flex-wrap gap-2">
                        {weekDays.map((day) => (
                          <button
                            key={day.id}
                            onClick={() => toggleCustomDay(day.id)}
                            className={`w-12 h-12 rounded-xl border transition-all flex items-center justify-center font-medium ${
                              preferences.customDays.includes(day.id)
                                ? 'bg-[#14B8A6] border-[#14B8A6] text-white'
                                : 'bg-white/5 border-white/20 text-white/60 hover:border-[#14B8A6]/50'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Timezone */}
                <div>
                  <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-[#F59E0B]" />
                    <span>Timezone</span>
                  </h4>
                  
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger className="bg-white/5 border-[#14B8A6]/30 text-white focus:border-[#14B8A6]">
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

                {/* Schedule Preview */}
                <div className="p-4 bg-[#14B8A6]/10 rounded-xl border border-[#14B8A6]/30">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#14B8A6]" />
                    <div>
                      <p className="font-medium text-white">Your Schedule</p>
                      <p className="text-sm text-white/70">{getScheduleDescription()}</p>
                      <p className="text-xs text-white/50 mt-1">({preferences.timezone.replace(/_/g, ' ')})</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="p-6 space-y-4">
                <p className="text-white/70 text-sm mb-4">
                  Choose what content to include in your daily devotional emails:
                </p>

                {/* Verse of the Day */}
                <div className={`p-4 rounded-xl border transition-all ${
                  preferences.verseOfTheDay 
                    ? 'bg-[#14B8A6]/10 border-[#14B8A6]/40' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        preferences.verseOfTheDay ? 'bg-[#14B8A6]/30' : 'bg-white/10'
                      }`}>
                        <BookOpen className={`w-5 h-5 ${preferences.verseOfTheDay ? 'text-[#14B8A6]' : 'text-white/50'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">Verse of the Day</p>
                        <p className="text-xs text-white/60">A featured scripture with brief reflection</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.verseOfTheDay}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, verseOfTheDay: checked }))}
                    />
                  </div>
                </div>

                {/* Full Devotional */}
                <div className={`p-4 rounded-xl border transition-all ${
                  preferences.fullDevotional 
                    ? 'bg-[#F59E0B]/10 border-[#F59E0B]/40' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        preferences.fullDevotional ? 'bg-[#F59E0B]/30' : 'bg-white/10'
                      }`}>
                        <BookMarked className={`w-5 h-5 ${preferences.fullDevotional ? 'text-[#F59E0B]' : 'text-white/50'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">Full Devotional</p>
                        <p className="text-xs text-white/60">In-depth teaching with scripture exploration</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.fullDevotional}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, fullDevotional: checked }))}
                    />
                  </div>
                </div>

                {/* Prayer Focus */}
                <div className={`p-4 rounded-xl border transition-all ${
                  preferences.prayerFocus 
                    ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/40' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        preferences.prayerFocus ? 'bg-[#8B5CF6]/30' : 'bg-white/10'
                      }`}>
                        <HandHeart className={`w-5 h-5 ${preferences.prayerFocus ? 'text-[#8B5CF6]' : 'text-white/50'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">Prayer Focus</p>
                        <p className="text-xs text-white/60">Daily prayer prompts and intercession topics</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.prayerFocus}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, prayerFocus: checked }))}
                    />
                  </div>
                </div>

                {/* Sonship Teaching */}
                <div className={`p-4 rounded-xl border transition-all ${
                  preferences.sonshipTeaching 
                    ? 'bg-[#EC4899]/10 border-[#EC4899]/40' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        preferences.sonshipTeaching ? 'bg-[#EC4899]/30' : 'bg-white/10'
                      }`}>
                        <Flame className={`w-5 h-5 ${preferences.sonshipTeaching ? 'text-[#EC4899]' : 'text-white/50'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">Sonship Teaching</p>
                        <p className="text-xs text-white/60">Understanding your identity as a Son of God</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.sonshipTeaching}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, sonshipTeaching: checked }))}
                    />
                  </div>
                </div>

                {/* Scripture Memory */}
                <div className={`p-4 rounded-xl border transition-all ${
                  preferences.scriptureMemory 
                    ? 'bg-[#3B82F6]/10 border-[#3B82F6]/40' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        preferences.scriptureMemory ? 'bg-[#3B82F6]/30' : 'bg-white/10'
                      }`}>
                        <Star className={`w-5 h-5 ${preferences.scriptureMemory ? 'text-[#3B82F6]' : 'text-white/50'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">Scripture Memory Verse</p>
                        <p className="text-xs text-white/60">A verse to memorize throughout the week</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.scriptureMemory}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, scriptureMemory: checked }))}
                    />
                  </div>
                </div>

                {/* WWJD Scenario */}
                <div className={`p-4 rounded-xl border transition-all ${
                  preferences.wwjdScenario 
                    ? 'bg-[#10B981]/10 border-[#10B981]/40' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        preferences.wwjdScenario ? 'bg-[#10B981]/30' : 'bg-white/10'
                      }`}>
                        <MessageCircle className={`w-5 h-5 ${preferences.wwjdScenario ? 'text-[#10B981]' : 'text-white/50'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">WWJD Scenario</p>
                        <p className="text-xs text-white/60">Real-life situations with biblical guidance</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.wwjdScenario}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, wwjdScenario: checked }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Extras Tab */}
            {activeTab === 'extras' && (
              <div className="p-6 space-y-4">
                <p className="text-white/70 text-sm mb-4">
                  Additional elements to enhance your devotional experience:
                </p>

                {/* Reflection Questions */}
                <div className={`p-4 rounded-xl border transition-all ${
                  preferences.includeReflectionQuestions 
                    ? 'bg-[#14B8A6]/10 border-[#14B8A6]/40' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        preferences.includeReflectionQuestions ? 'bg-[#14B8A6]/30' : 'bg-white/10'
                      }`}>
                        <MessageCircle className={`w-5 h-5 ${preferences.includeReflectionQuestions ? 'text-[#14B8A6]' : 'text-white/50'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">Reflection Questions</p>
                        <p className="text-xs text-white/60">Thought-provoking questions for deeper study</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.includeReflectionQuestions}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, includeReflectionQuestions: checked }))}
                    />
                  </div>
                </div>

                {/* Prayer Prompts */}
                <div className={`p-4 rounded-xl border transition-all ${
                  preferences.includePrayerPrompts 
                    ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/40' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        preferences.includePrayerPrompts ? 'bg-[#8B5CF6]/30' : 'bg-white/10'
                      }`}>
                        <Heart className={`w-5 h-5 ${preferences.includePrayerPrompts ? 'text-[#8B5CF6]' : 'text-white/50'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">Prayer Prompts</p>
                        <p className="text-xs text-white/60">Guided prayer starters based on the devotional</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.includePrayerPrompts}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, includePrayerPrompts: checked }))}
                    />
                  </div>
                </div>

                {/* Action Steps */}
                <div className={`p-4 rounded-xl border transition-all ${
                  preferences.includeActionSteps 
                    ? 'bg-[#F59E0B]/10 border-[#F59E0B]/40' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        preferences.includeActionSteps ? 'bg-[#F59E0B]/30' : 'bg-white/10'
                      }`}>
                        <Zap className={`w-5 h-5 ${preferences.includeActionSteps ? 'text-[#F59E0B]' : 'text-white/50'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">Action Steps</p>
                        <p className="text-xs text-white/60">Practical ways to apply the teaching today</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.includeActionSteps}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, includeActionSteps: checked }))}
                    />
                  </div>
                </div>

                {/* Content Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-[#14B8A6]/10 to-[#F59E0B]/10 rounded-xl border border-[#14B8A6]/30">
                  <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                    <span>Your Devotional Will Include:</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {preferences.verseOfTheDay && (
                      <span className="px-3 py-1 bg-[#14B8A6]/20 text-[#5EEAD4] rounded-full text-xs font-medium">
                        Verse of the Day
                      </span>
                    )}
                    {preferences.fullDevotional && (
                      <span className="px-3 py-1 bg-[#F59E0B]/20 text-[#FCD34D] rounded-full text-xs font-medium">
                        Full Devotional
                      </span>
                    )}
                    {preferences.prayerFocus && (
                      <span className="px-3 py-1 bg-[#8B5CF6]/20 text-[#C4B5FD] rounded-full text-xs font-medium">
                        Prayer Focus
                      </span>
                    )}
                    {preferences.sonshipTeaching && (
                      <span className="px-3 py-1 bg-[#EC4899]/20 text-[#F9A8D4] rounded-full text-xs font-medium">
                        Sonship Teaching
                      </span>
                    )}
                    {preferences.scriptureMemory && (
                      <span className="px-3 py-1 bg-[#3B82F6]/20 text-[#93C5FD] rounded-full text-xs font-medium">
                        Memory Verse
                      </span>
                    )}
                    {preferences.wwjdScenario && (
                      <span className="px-3 py-1 bg-[#10B981]/20 text-[#6EE7B7] rounded-full text-xs font-medium">
                        WWJD Scenario
                      </span>
                    )}
                    {preferences.includeReflectionQuestions && (
                      <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs font-medium">
                        + Reflection Questions
                      </span>
                    )}
                    {preferences.includePrayerPrompts && (
                      <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs font-medium">
                        + Prayer Prompts
                      </span>
                    )}
                    {preferences.includeActionSteps && (
                      <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs font-medium">
                        + Action Steps
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="p-6 bg-white/5 border-t border-[#14B8A6]/20">
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

            {preferences.subscriptionEnabled && preferences.email && (
              <button
                onClick={sendTestEmail}
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

      {/* Benefits Section */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-[#14B8A6]/10 to-transparent border border-[#14B8A6]/30 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-[#14B8A6]/20 flex items-center justify-center mb-3">
            <Sun className="w-6 h-6 text-[#14B8A6]" />
          </div>
          <h4 className="font-semibold text-white mb-1">Start Your Day Right</h4>
          <p className="text-sm text-white/60">
            Begin each morning with God's Word and spiritual nourishment.
          </p>
        </div>

        <div className="p-5 bg-gradient-to-br from-[#F59E0B]/10 to-transparent border border-[#F59E0B]/30 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-[#F59E0B]/20 flex items-center justify-center mb-3">
            <Heart className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <h4 className="font-semibold text-white mb-1">Personalized Content</h4>
          <p className="text-sm text-white/60">
            Choose exactly what content speaks to your spiritual journey.
          </p>
        </div>

        <div className="p-5 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/30 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-[#8B5CF6]" />
          </div>
          <h4 className="font-semibold text-white mb-1">Join the Community</h4>
          <p className="text-sm text-white/60">
            Thousands of believers growing together in faith daily.
          </p>
        </div>
      </div>

      {/* Scripture Quote */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[#F59E0B]/10 to-[#14B8A6]/10 border border-[#F59E0B]/30 rounded-2xl text-center">
        <p className="text-white/80 italic text-lg mb-2">
          "Your word is a lamp to my feet and a light to my path."
        </p>
        <p className="text-[#F59E0B] font-semibold">— Psalm 119:105</p>
      </div>
    </div>
  );
};

export default EmailDevotionalSubscription;
