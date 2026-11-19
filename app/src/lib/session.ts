import { supabase } from '@/lib/supabase';
import { flushPendingSaves } from '@/lib/pendingSaves';

// Signing in and out, and what the app leaves on the device.
//
// After ANY sign-out (a Sign Out button, the billing screen, a password
// reset, an expired session, or another tab) the app goes back to its first
// page, the "One Classroom" welcome with "Enter The Classroom".
//
// Members' personal data (bookmarks, notes, journal, progress...) is cached
// on the device for speed. It belongs to whoever is signed in, so it is
// cleared at sign-out: on a shared phone or computer the next person must
// never see it, and it must never be copied into their account.

/** Set once "Enter The Classroom" is pressed in this browser tab. */
export const ENTERED_CLASSROOM_KEY = 'sog-entered-classroom';
/** Which account the cached member data on this device belongs to. */
const DEVICE_OWNER_KEY = 'sog-device-owner';

/** Personal data cached on the device (database copies are untouched). */
const MEMBER_KEYS = [
  'sog-bookmarks', 'sog-highlights', 'sog-notes', 'sog-active-plan', 'sog-plan-progress',
  'sog-completed-lessons', 'sog-lesson-progress', 'sog-earned-certificates', 'sog-saved-comparisons',
  'sog-leaderboard-public', 'sog-journal-entries', 'sog-memory-verses-count', 'sog-memory-streak',
  'sog-notification-prefs', 'bible-trivia-highscores', 'trivia-total-questions', 'daily-trivia-streak',
  'daily-trivia-notifications', 'lastSyncTime', 'verse_favorites', 'verse_notification_prefs',
];
/** Key families (e.g. daily-reading-streak, verse_favorites_<user id>). */
const MEMBER_PREFIXES = ['daily-reading-', 'verse_favorites_', 'verse_notification_prefs_'];
// Device settings that are not personal stay: theme, selectedBibleVersion,
// daily-trivia-guest-id. The admin panel manages its own adminToken/adminUser.

export function hasEnteredClassroom(): boolean {
  try {
    return sessionStorage.getItem(ENTERED_CLASSROOM_KEY) === '1';
  } catch {
    return false;
  }
}

export function markEnteredClassroom(): void {
  try {
    sessionStorage.setItem(ENTERED_CLASSROOM_KEY, '1');
  } catch {
    // Private browsing: they'll just see the welcome again next load.
  }
}

/** Next page load (in this tab) starts again at the welcome page. */
export function forgetEnteredClassroom(): void {
  try {
    sessionStorage.removeItem(ENTERED_CLASSROOM_KEY);
  } catch {
    // Storage unavailable: nothing to forget.
  }
}

export function clearMemberDataOnDevice(): void {
  try {
    const doomed = new Set<string>([DEVICE_OWNER_KEY, ...MEMBER_KEYS]);
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && MEMBER_PREFIXES.some((p) => key.startsWith(p))) doomed.add(key);
    }
    doomed.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage unavailable: nothing was cached.
  }
}

/**
 * Called as soon as someone is signed in, before their pages load: if the
 * cached data on this device belongs to a different account, it is removed
 * so it can't be shown to, or copied into, this one.
 */
export function claimDeviceFor(userId: string): void {
  try {
    const owner = localStorage.getItem(DEVICE_OWNER_KEY);
    if (owner && owner !== userId) clearMemberDataOnDevice();
    localStorage.setItem(DEVICE_OWNER_KEY, userId);
  } catch {
    // Storage unavailable: nothing cached to protect.
  }
}

/**
 * Sign out, the one way every Sign Out button should use: finish any
 * waiting saves, sign out on the server, and if the network fails, still
 * sign out on this device (otherwise the button would seem to do nothing).
 */
export async function signOut(): Promise<void> {
  await flushPendingSaves();
  const { error } = await supabase.auth.signOut();
  if (error) await supabase.auth.signOut({ scope: 'local' });
}

let cleanupInstalled = false;

/**
 * Whatever caused it, a sign-out clears the personal cache and sends the
 * next page load back to the welcome page. Installed once at start-up so it
 * also covers pages where Index isn't mounted (password reset).
 */
export function installSignOutCleanup(): void {
  if (cleanupInstalled) return;
  cleanupInstalled = true;
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      clearMemberDataOnDevice();
      forgetEnteredClassroom();
    }
  });
}
