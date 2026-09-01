import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NotificationSettingsProps {
  user: User | null;
  onOpenAuth: () => void;
  onClose?: () => void;
}

interface NotificationPreferences {
  notifications_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  notification_time: string;
  frequency: string;
  include_daily_verse: boolean;
  include_wwjd: boolean;
  email: string;
  timezone: string;
}

const defaultPreferences: NotificationPreferences = {
  notifications_enabled: true,
  push_enabled: false,
  email_enabled: true,
  notification_time: '07:00',
  frequency: 'daily',
  include_daily_verse: true,
  include_wwjd: true,
  email: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
};

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ user, onOpenAuth, onClose }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingSend, setTestingSend] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  // Check push notification support
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
    }
  }, []);

  // Load user preferences
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          notifications_enabled: data.notifications_enabled ?? true,
          push_enabled: data.push_enabled ?? false,
          email_enabled: data.email_enabled ?? true,
          notification_time: data.notification_time?.substring(0, 5) || '07:00',
          frequency: data.frequency || 'daily',
          include_daily_verse: data.include_daily_verse ?? true,
          include_wwjd: data.include_wwjd ?? true,
          email: data.email || user.email || '',
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        });
      } else {
        // Set email from user if available
        setPreferences(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  };


  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          notifications_enabled: preferences.notifications_enabled,
          push_enabled: preferences.push_enabled,
          email_enabled: preferences.email_enabled,
          notification_time: preferences.notification_time + ':00',
          frequency: preferences.frequency,
          include_daily_verse: preferences.include_daily_verse,
          include_wwjd: preferences.include_wwjd,
          email: preferences.email,
          timezone: preferences.timezone,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
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

  const requestPushPermission = async () => {
    if (!pushSupported) return;

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission === 'granted') {
        setPreferences(prev => ({ ...prev, push_enabled: true }));
        toast({
          title: "Push Notifications Enabled",
          description: "You'll receive push notifications for daily inspiration.",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Push notifications were not enabled. You can enable them in your browser settings.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error requesting push permission:', err);
    }
  };

  const sendTestNotification = async () => {
    setTestingSend(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-daily-notification', {
        body: {
          action: 'test-notification',
          email: preferences.email,
          preferences: {
            include_daily_verse: preferences.include_daily_verse,
            include_wwjd: preferences.include_wwjd
          }
        }
      });

      if (error) throw error;

      // Show browser notification if enabled
      if (preferences.push_enabled && pushPermission === 'granted') {
        new Notification("Sons of God - Daily Inspiration", {
          body: data.content?.verse?.text || "Your daily verse is ready!",
          icon: '/favicon.ico',
          tag: 'daily-verse-test'
        });
      }

      toast({
        title: "Test Notification Sent",
        description: preferences.email_enabled 
          ? `A preview has been generated for ${preferences.email}`
          : "Push notification sent!",
      });
    } catch (err) {
      console.error('Error sending test:', err);
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive"
      });
    } finally {
      setTestingSend(false);
    }
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

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-[#f5f0e6] rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#7c9a7a]/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-[#7c9a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3d4a4a] mb-4">
            Daily Inspiration Notifications
          </h2>
          <p className="text-[#5c4f42]/70 mb-6">
            Sign in to set up daily verse notifications and WWJD reminders delivered to your inbox or device.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-6 py-3 bg-[#7c9a7a] text-[#f5f0e6] font-semibold rounded-xl hover:bg-[#7c9a7a]/90 transition-colors"
          >
            Sign In to Enable Notifications
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-[#f5f0e6] rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#7c9a7a] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#5c4f42]/70">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#7c9a7a]/20 mb-4">
          <svg className="w-8 h-8 text-[#7c9a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5f0e6] mb-2">
          Daily Inspiration Notifications
        </h1>
        <p className="text-[#f5f0e6]/70 max-w-lg mx-auto">
          Start each day with God's Word. Receive the daily featured verse and WWJD scenarios delivered right to you.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-[#f5f0e6] rounded-2xl shadow-xl overflow-hidden">
        {/* Master Toggle */}
        <div className="p-6 border-b border-[#5c4f42]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#7c9a7a]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#7c9a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#3d4a4a]">Enable Notifications</h3>
                <p className="text-sm text-[#5c4f42]/60">Receive daily inspirational content</p>
              </div>
            </div>
            <Switch
              checked={preferences.notifications_enabled}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notifications_enabled: checked }))}
            />
          </div>
        </div>

        {preferences.notifications_enabled && (
          <>
            {/* Delivery Methods */}
            <div className="p-6 border-b border-[#5c4f42]/10">
              <h3 className="font-semibold text-[#3d4a4a] mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-[#7c9a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Delivery Methods</span>
              </h3>
              
              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="bg-[#3d4a4a]/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-[#6b9a9a]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#6b9a9a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-[#3d4a4a]">Email Notifications</p>
                        <p className="text-xs text-[#5c4f42]/60">Receive daily email with verse & WWJD</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.email_enabled}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, email_enabled: checked }))}
                    />
                  </div>
                  
                  {preferences.email_enabled && (
                    <div className="mt-3">
                      <Label htmlFor="email" className="text-sm text-[#5c4f42]/70">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={preferences.email}
                        onChange={(e) => setPreferences(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="mt-1 bg-white border-[#5c4f42]/20 focus:border-[#7c9a7a] focus:ring-[#7c9a7a]"
                      />
                    </div>
                  )}
                </div>

                {/* Push Notifications */}
                <div className="bg-[#3d4a4a]/5 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-[#c9a227]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-[#3d4a4a]">Push Notifications</p>
                        <p className="text-xs text-[#5c4f42]/60">
                          {pushSupported 
                            ? pushPermission === 'granted' 
                              ? 'Browser notifications enabled'
                              : 'Get instant browser notifications'
                            : 'Not supported in this browser'
                          }
                        </p>
                      </div>
                    </div>
                    {pushSupported ? (
                      pushPermission === 'granted' ? (
                        <Switch
                          checked={preferences.push_enabled}
                          onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, push_enabled: checked }))}
                        />
                      ) : (
                        <button
                          onClick={requestPushPermission}
                          className="px-3 py-1.5 text-sm bg-[#c9a227] text-white rounded-lg hover:bg-[#c9a227]/90 transition-colors"
                        >
                          Enable
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-[#5c4f42]/40 px-2 py-1 bg-[#5c4f42]/10 rounded">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Selection */}
            <div className="p-6 border-b border-[#5c4f42]/10">
              <h3 className="font-semibold text-[#3d4a4a] mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-[#7c9a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Content to Include</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#3d4a4a]/5 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#7c9a7a]/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#7c9a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-[#3d4a4a]">Daily Featured Verse</p>
                      <p className="text-xs text-[#5c4f42]/60">Scripture focused on sonship</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.include_daily_verse}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, include_daily_verse: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#3d4a4a]/5 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#6b9a9a]/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#6b9a9a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-[#3d4a4a]">WWJD Scenario</p>
                      <p className="text-xs text-[#5c4f42]/60">Daily life application guidance</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.include_wwjd}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, include_wwjd: checked }))}
                  />
                </div>
              </div>
            </div>

            {/* Schedule Settings */}
            <div className="p-6 border-b border-[#5c4f42]/10">
              <h3 className="font-semibold text-[#3d4a4a] mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-[#7c9a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Schedule</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Time */}
                <div>
                  <Label htmlFor="time" className="text-sm text-[#5c4f42]/70">Notification Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={preferences.notification_time}
                    onChange={(e) => setPreferences(prev => ({ ...prev, notification_time: e.target.value }))}
                    className="mt-1 bg-white border-[#5c4f42]/20 focus:border-[#7c9a7a] focus:ring-[#7c9a7a]"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <Label htmlFor="frequency" className="text-sm text-[#5c4f42]/70">Frequency</Label>
                  <Select
                    value={preferences.frequency}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger className="mt-1 bg-white border-[#5c4f42]/20 focus:border-[#7c9a7a] focus:ring-[#7c9a7a]">
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
                  <Label htmlFor="timezone" className="text-sm text-[#5c4f42]/70">Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger className="mt-1 bg-white border-[#5c4f42]/20 focus:border-[#7c9a7a] focus:ring-[#7c9a7a]">
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
              <div className="mt-4 p-3 bg-[#7c9a7a]/10 rounded-xl">
                <p className="text-sm text-[#3d4a4a]">
                  <span className="font-medium">Your schedule:</span>{' '}
                  {preferences.frequency === 'daily' && 'Every day'}
                  {preferences.frequency === 'weekdays' && 'Monday through Friday'}
                  {preferences.frequency === 'weekends' && 'Saturday and Sunday'}
                  {preferences.frequency === 'weekly' && 'Every Sunday'}
                  {preferences.frequency === 'twice-weekly' && 'Wednesday and Sunday'}
                  {' at '}
                  {new Date(`2000-01-01T${preferences.notification_time}`).toLocaleTimeString([], { 
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
        <div className="p-6 bg-[#3d4a4a]/5">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={savePreferences}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-[#7c9a7a] text-[#f5f0e6] font-semibold rounded-xl hover:bg-[#7c9a7a]/90 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#f5f0e6] border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Preferences</span>
                </>
              )}
            </button>

            {preferences.notifications_enabled && (preferences.email_enabled || preferences.push_enabled) && (
              <button
                onClick={sendTestNotification}
                disabled={testingSend}
                className="px-6 py-3 bg-[#6b9a9a] text-[#f5f0e6] font-semibold rounded-xl hover:bg-[#6b9a9a]/90 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {testingSend ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#f5f0e6] border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Send Test</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 p-4 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-xl">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-[#c9a227] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-[#f5f0e6]/80">
              <span className="font-semibold text-[#c9a227]">Daily Inspiration:</span>{' '}
              Each notification includes carefully selected scripture about our identity as{' '}
              <span className="font-bold italic" style={{ color: '#c9a227' }}>Sons' of The One</span>,{' '}
              <span className="font-bold italic" style={{ color: '#c9a227' }}>God Almighty!!!</span>{' '}
              along with practical WWJD scenarios to apply God's Word in your daily life.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
