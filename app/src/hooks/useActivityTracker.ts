import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('app_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('app_session_id', sessionId);
  }
  return sessionId;
};

// Get device info
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);
  const isTablet = /iPad|Tablet/.test(ua);
  
  return {
    userAgent: ua,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    deviceType: isMobile ? (isTablet ? 'tablet' : 'mobile') : 'desktop',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

export type ActivityCategory = 
  | 'navigation'
  | 'bible'
  | 'trivia'
  | 'devotional'
  | 'community'
  | 'audio'
  | 'auth'
  | 'feature'
  | 'engagement';

export type ActivityType =
  | 'page_view'
  | 'bible_read'
  | 'bible_search'
  | 'chapter_complete'
  | 'trivia_start'
  | 'trivia_complete'
  | 'trivia_answer'
  | 'devotional_read'
  | 'devotional_complete'
  | 'prayer_submit'
  | 'prayer_view'
  | 'audio_play'
  | 'audio_pause'
  | 'audio_complete'
  | 'login'
  | 'signup'
  | 'logout'
  | 'search'
  | 'bookmark_add'
  | 'bookmark_remove'
  | 'share'
  | 'donate'
  | 'feature_use'
  | 'button_click'
  | 'form_submit'
  | 'session_start'
  | 'session_end';

interface TrackActivityParams {
  activityType: ActivityType;
  activityCategory: ActivityCategory;
  activityDetails?: Record<string, any>;
  pagePath?: string;
  durationSeconds?: number;
}

export function useActivityTracker() {
  const sessionId = useRef(getSessionId());
  const deviceInfo = useRef(getDeviceInfo());
  const sessionStartTime = useRef(Date.now());
  const lastActivityTime = useRef(Date.now());

  // Track activity
  const trackActivity = useCallback(async ({
    activityType,
    activityCategory,
    activityDetails = {},
    pagePath,
    durationSeconds
  }: TrackActivityParams) => {
    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.functions.invoke('activity-tracker', {
        body: {
          action: 'log',
          userId: user?.id || null,
          sessionId: sessionId.current,
          activityType,
          activityCategory,
          activityDetails: {
            ...activityDetails,
            timestamp: new Date().toISOString()
          },
          pagePath: pagePath || window.location.pathname,
          referrer: document.referrer,
          deviceInfo: deviceInfo.current,
          durationSeconds
        }
      });

      lastActivityTime.current = Date.now();
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.debug('Activity tracking error:', error);
    }
  }, []);

  // Track page view
  const trackPageView = useCallback((pageName?: string, details?: Record<string, any>) => {
    trackActivity({
      activityType: 'page_view',
      activityCategory: 'navigation',
      activityDetails: {
        pageName,
        ...details
      }
    });
  }, [trackActivity]);

  // Track Bible reading
  const trackBibleRead = useCallback((book: string, chapter: number, verse?: number) => {
    trackActivity({
      activityType: 'bible_read',
      activityCategory: 'bible',
      activityDetails: { book, chapter, verse }
    });
  }, [trackActivity]);

  // Track Bible search
  const trackBibleSearch = useCallback((query: string, resultsCount: number) => {
    trackActivity({
      activityType: 'bible_search',
      activityCategory: 'bible',
      activityDetails: { query, resultsCount }
    });
  }, [trackActivity]);

  // Track trivia activity
  const trackTrivia = useCallback((action: 'start' | 'complete' | 'answer', details: Record<string, any>) => {
    const typeMap = {
      start: 'trivia_start' as ActivityType,
      complete: 'trivia_complete' as ActivityType,
      answer: 'trivia_answer' as ActivityType
    };
    
    trackActivity({
      activityType: typeMap[action],
      activityCategory: 'trivia',
      activityDetails: details
    });
  }, [trackActivity]);

  // Track devotional reading
  const trackDevotional = useCallback((action: 'read' | 'complete', title: string, details?: Record<string, any>) => {
    trackActivity({
      activityType: action === 'read' ? 'devotional_read' : 'devotional_complete',
      activityCategory: 'devotional',
      activityDetails: { title, ...details }
    });
  }, [trackActivity]);

  // Track audio playback
  const trackAudio = useCallback((action: 'play' | 'pause' | 'complete', details: Record<string, any>) => {
    const typeMap = {
      play: 'audio_play' as ActivityType,
      pause: 'audio_pause' as ActivityType,
      complete: 'audio_complete' as ActivityType
    };
    
    trackActivity({
      activityType: typeMap[action],
      activityCategory: 'audio',
      activityDetails: details
    });
  }, [trackActivity]);

  // Track prayer activity
  const trackPrayer = useCallback((action: 'submit' | 'view', details?: Record<string, any>) => {
    trackActivity({
      activityType: action === 'submit' ? 'prayer_submit' : 'prayer_view',
      activityCategory: 'community',
      activityDetails: details
    });
  }, [trackActivity]);

  // Track auth events
  const trackAuth = useCallback((action: 'login' | 'signup' | 'logout') => {
    trackActivity({
      activityType: action,
      activityCategory: 'auth'
    });
  }, [trackActivity]);

  // Track feature usage
  const trackFeature = useCallback((featureName: string, details?: Record<string, any>) => {
    trackActivity({
      activityType: 'feature_use',
      activityCategory: 'feature',
      activityDetails: { featureName, ...details }
    });
  }, [trackActivity]);

  // Track button clicks
  const trackButtonClick = useCallback((buttonName: string, details?: Record<string, any>) => {
    trackActivity({
      activityType: 'button_click',
      activityCategory: 'engagement',
      activityDetails: { buttonName, ...details }
    });
  }, [trackActivity]);

  // Track form submissions
  const trackFormSubmit = useCallback((formName: string, success: boolean, details?: Record<string, any>) => {
    trackActivity({
      activityType: 'form_submit',
      activityCategory: 'engagement',
      activityDetails: { formName, success, ...details }
    });
  }, [trackActivity]);

  // Track bookmarks
  const trackBookmark = useCallback((action: 'add' | 'remove', reference: string) => {
    trackActivity({
      activityType: action === 'add' ? 'bookmark_add' : 'bookmark_remove',
      activityCategory: 'bible',
      activityDetails: { reference }
    });
  }, [trackActivity]);

  // Track shares
  const trackShare = useCallback((contentType: string, content: string) => {
    trackActivity({
      activityType: 'share',
      activityCategory: 'engagement',
      activityDetails: { contentType, content }
    });
  }, [trackActivity]);

  // Track donations
  const trackDonate = useCallback((amount: number, type: 'one-time' | 'recurring') => {
    trackActivity({
      activityType: 'donate',
      activityCategory: 'engagement',
      activityDetails: { amount, type }
    });
  }, [trackActivity]);

  // Track session start on mount
  useEffect(() => {
    trackActivity({
      activityType: 'session_start',
      activityCategory: 'navigation',
      activityDetails: {
        referrer: document.referrer,
        entryPage: window.location.pathname
      }
    });

    // Track session end on unmount/page close
    const handleUnload = () => {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      
      // Use sendBeacon for reliable tracking on page close
      const data = JSON.stringify({
        action: 'log',
        sessionId: sessionId.current,
        activityType: 'session_end',
        activityCategory: 'navigation',
        activityDetails: {
          sessionDuration,
          pagesViewed: performance.getEntriesByType('navigation').length
        },
        pagePath: window.location.pathname,
        deviceInfo: deviceInfo.current,
        durationSeconds: sessionDuration
      });

      // Try to send via beacon (most reliable for page unload)
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/activity-tracker`,
          data
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [trackActivity]);

  return {
    trackActivity,
    trackPageView,
    trackBibleRead,
    trackBibleSearch,
    trackTrivia,
    trackDevotional,
    trackAudio,
    trackPrayer,
    trackAuth,
    trackFeature,
    trackButtonClick,
    trackFormSubmit,
    trackBookmark,
    trackShare,
    trackDonate,
    sessionId: sessionId.current
  };
}

export default useActivityTracker;
