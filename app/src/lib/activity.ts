// Member activity for the admin Activity Monitor.
//
// Records which pages members open, plus sign-in / sign-out. Fire-and-forget:
// tracking never slows the app down or shows an error. The page is noted from
// the address (#/bible, #/lessons...), which backNav.ts keeps up to date.

import { supabase } from '@/lib/supabase';
import { SECTION_TITLES, onPageChange } from '@/lib/backNav';

let userId: string | null = null;
let lastSection: string | null = null;

const sessionId = (): string => {
  try {
    let id = sessionStorage.getItem('app_session_id');
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem('app_session_id', id);
    }
    return id;
  } catch {
    return 'session_unknown';
  }
};

const device = () => {
  const ua = navigator.userAgent;
  const tablet = /iPad|Tablet/.test(ua);
  const mobile = /Mobile|Android|iPhone|iPad/.test(ua);
  return {
    userAgent: ua,
    language: navigator.language,
    deviceType: mobile ? (tablet ? 'tablet' : 'mobile') : 'desktop',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

export function trackActivity(
  activityType: string,
  activityCategory: string,
  activityDetails: Record<string, unknown> = {},
  pagePath?: string,
  forUser: string | null = userId,
): void {
  if (!forUser) return; // members only
  supabase.functions.invoke('activity-tracker', {
    body: {
      action: 'log',
      userId: forUser,
      sessionId: sessionId(),
      activityType,
      activityCategory,
      activityDetails,
      pagePath: pagePath ?? `/${currentSection()}`,
      referrer: document.referrer || null,
      deviceInfo: device(),
    },
  }).catch(() => { /* never bother the member */ });
}

function currentSection(): string {
  const m = window.location.hash.match(/^#\/([a-z-]+)$/);
  return m && SECTION_TITLES[m[1]] ? m[1] : 'home';
}

/** Called whenever the address may have changed; logs a page view once per page. */
export function notePage(): void {
  const section = currentSection();
  if (section === lastSection) return;
  lastSection = section;
  trackActivity('page_view', 'navigation', { pageName: SECTION_TITLES[section] ?? section }, `/${section}`);
}

export function installActivityTracking(): void {
  window.addEventListener('popstate', () => setTimeout(notePage, 0));
  window.addEventListener('hashchange', notePage);
  onPageChange(notePage);

  supabase.auth.onAuthStateChange((event, session) => {
    const id = session?.user?.id ?? null;
    if (event === 'SIGNED_OUT') {
      if (userId) trackActivity('logout', 'auth', {}, '/home', userId);
      userId = null;
      lastSection = null;
      return;
    }
    if (!id) return;
    const changed = id !== userId;
    userId = id;
    if (event === 'SIGNED_IN' && changed) {
      // Once per browser tab (SIGNED_IN also fires when a tab regains focus).
      let first = true;
      try {
        first = sessionStorage.getItem('sog-login-tracked') !== id;
        sessionStorage.setItem('sog-login-tracked', id);
      } catch { /* ignore */ }
      if (first) trackActivity('login', 'auth');
    }
    if (changed) setTimeout(notePage, 0);
  });
}
