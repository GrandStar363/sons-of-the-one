import { useEffect, useRef } from 'react';

// Back navigation that matches the phone.
//
// The app swaps pages in React state, so the browser had no history: the
// phone's Back button/gesture left the site, and inside a page (a lesson, a
// plan, a game) there was often no way back at all. Every page change and
// every inner view now adds a browser history entry, so the phone's Back,
// the browser's Back and the app's own Back bar all step back one level.

export interface NavEntry {
  sog: true;
  section: string;
  depth: number;          // how many app steps deep this entry is (0 = first page)
  sub?: string;           // set for an inner view opened inside a page
  book?: string | null;   // Bible reader position
  chapter?: number | null;
  scrollY?: number;       // where the page was scrolled when we left it
}

/** Page titles; also the list of pages a #/link may open. */
export const SECTION_TITLES: Record<string, string> = {
  home: 'Home',
  bible: 'Scripture',
  plans: 'Reading Plans',
  bookmarks: 'Bookmarks',
  baptism: 'Baptism Journey',
  memory: 'Scripture Memory',
  journal: 'Journal',
  audio: 'Audio Bible',
  compare: 'Compare Versions',
  notifications: 'Notifications',
  churches: 'Find a Church',
  'daily-reading': 'Daily Reading',
  'faith-wonder': 'Faith & Wonder',
  trivia: 'Bible Trivia',
  'daily-trivia': 'Daily Challenge',
  contact: 'Contact Us',
  profile: 'My Profile',
  lessons: 'Lessons',
  certificates: 'Certificates',
  leaderboard: 'Leaderboard',
  'daily-reminders': 'Daily Reminders',
  'multiplayer-trivia': 'Battle Mode',
  tournament: 'Tournament of Disciples',
  spectator: 'Watch Live Matches',
  'terms-of-service': 'Terms of Service',
  'prayer-wall': 'Prayer Wall',
  'devotional-emails': 'Devotional Emails',
  wwjd: 'WWJD',
};

let depth = 0;
const openSubs = new Set<string>();

export const currentEntry = (): NavEntry | null => {
  const s = window.history.state;
  return s && s.sog ? (s as NavEntry) : null;
};
export const currentDepth = () => depth;
export const isSubOpen = (key: string) => openSubs.has(key);

export function urlFor(section: string): string {
  const base = window.location.pathname + window.location.search;
  return section === 'home' ? base : `${base}#/${section}`;
}

/** The page named in the address (#/lessons), if it's a real page. */
export function sectionFromUrl(): string | null {
  const m = window.location.hash.match(/^#\/([a-z-]+)$/);
  return m && SECTION_TITLES[m[1]] ? m[1] : null;
}

/** Start the history for this visit (no new entry). */
export function initHistory(entry: Omit<NavEntry, 'sog' | 'depth'>) {
  depth = 0;
  window.history.replaceState({ ...entry, sog: true, depth: 0 }, '', urlFor(entry.section));
}

/** Update the current entry in place (e.g. the next Bible chapter). */
export function replaceEntry(patch: Partial<NavEntry>) {
  const cur = currentEntry();
  if (!cur) return;
  const next = { ...cur, ...patch };
  window.history.replaceState(next, '', urlFor(next.section));
}

/** Add a step. Remembers the scroll position of the step being left. */
export function pushEntry(entry: Omit<NavEntry, 'sog' | 'depth'>) {
  const cur = currentEntry();
  if (cur) window.history.replaceState({ ...cur, scrollY: window.scrollY }, '');
  depth = (cur?.depth ?? depth) + 1;
  window.history.pushState({ ...entry, sog: true, depth }, '', urlFor(entry.section));
}

/** Called by AppLayout on every popstate, before it reads the entry. */
export function syncDepth(entry: NavEntry | null): number {
  const before = depth;
  depth = entry?.depth ?? 0;
  return before;
}

/**
 * Make an inner view (a lesson, a plan, a game...) part of Back.
 *
 * While `open` is true there is a history entry for it: Back (phone, browser
 * or the app's Back bar) calls `close`. If the page closes the view itself,
 * the entry is removed again. A view that is already open when the page
 * first appears (e.g. a remembered plan) doesn't add an entry, so Back from
 * there leaves the page as expected.
 */
export function useBackStep(open: boolean, close: () => void) {
  const key = useRef(`v${Math.random().toString(36).slice(2, 10)}`).current;
  const closeRef = useRef(close);
  closeRef.current = close;
  const myDepth = useRef<number | null>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    const wasFirst = firstRun.current;
    firstRun.current = false;
    if (open && myDepth.current === null) {
      if (wasFirst) return;
      const cur = currentEntry();
      pushEntry({ section: cur?.section ?? 'home', book: cur?.book, chapter: cur?.chapter, sub: key });
      myDepth.current = currentDepth();
      openSubs.add(key);
    } else if (!open && myDepth.current !== null) {
      myDepth.current = null;
      openSubs.delete(key);
      // Closed from the page (its own Back/Close button): drop our entry —
      // a moment later, and only if it's still on top. If the page opened its
      // next view in the same step (searching -> match found), that view's
      // entry is on top now and ours is skipped later by Back (AppLayout).
      setTimeout(() => {
        if (currentEntry()?.sub === key) window.history.back();
      }, 0);
    }
  }, [open, key]);

  useEffect(() => {
    const onPop = () => {
      if (myDepth.current === null) return;
      const entry = currentEntry();
      if ((entry?.depth ?? 0) >= myDepth.current) return; // still at or above our step
      myDepth.current = null;
      openSubs.delete(key);
      closeRef.current();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      openSubs.delete(key);
    };
  }, [key]);
}
