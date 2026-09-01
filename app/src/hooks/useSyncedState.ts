import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

/**
 * Drop-in replacement for the `useState` + `localStorage` pattern used across
 * this app, backed by the database.
 *
 * Ten components stored member data in localStorage ONLY -- bookmarks,
 * highlights, notes, reading plans, completed lessons, certificates, saved
 * comparisons, trivia scores. Clearing the browser or switching devices lost
 * all of it.
 *
 * localStorage is deliberately kept, but demoted to an offline cache:
 *
 *   1. First paint reads the cache synchronously, so there is no flash of
 *      empty state while the network round-trips.
 *   2. The database is then read and, being authoritative, wins.
 *   3. If the database has nothing but the cache does, the cache is promoted
 *      once -- this migrates existing members' data on their next sign-in
 *      without asking them to do anything.
 *   4. Writes go to the cache immediately and to the database debounced, so
 *      the app stays responsive and offline edits survive until reconnect.
 *
 * Signed-out visitors keep working exactly as before (cache only), which
 * matters because much of the app is usable before signing up.
 */

const DEBOUNCE_MS = 800;

/** Columns on public.user_data that hold a per-user singleton blob. */
export type UserDataColumn =
  | 'bookmarks'
  | 'highlights'
  | 'notes'
  | 'active_plan'
  | 'plan_progress'
  | 'completed_lessons'
  | 'lesson_progress'
  | 'earned_certificates'
  | 'saved_comparisons'
  | 'reading_plan'
  | 'trivia_highscores'
  | 'trivia_progress'
  | 'verse_prefs'
  | 'leaderboard_public';

function readCache<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Not JSON. Some keys were written as bare strings (e.g. sog-active-plan),
    // so returning the raw value preserves that data instead of discarding it.
    // Anything genuinely corrupt falls back to the default.
    return (typeof fallback === 'string' || fallback === null
      ? (raw as unknown as T)
      : fallback);
  }
}

function writeCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or private-browsing. The database still has it.
  }
}

/** True when the value is "empty" and so should lose to the other source. */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  if (typeof value === 'string') return value === '';
  return false;
}

export function useSyncedState<T>(
  cacheKey: string,
  column: UserDataColumn,
  defaultValue: T,
  user: User | null,
): [T, (updater: T | ((prev: T) => T)) => void, { loaded: boolean }] {
  const [value, setValue] = useState<T>(() => readCache(cacheKey, defaultValue));
  const [loaded, setLoaded] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<T>(value);
  // Guards the initial DB read from being clobbered by the write effect.
  const hydrating = useRef(true);

  latest.current = value;

  // ---- Load -------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    if (!user) {
      // Signed out: cache is all there is.
      hydrating.current = false;
      setLoaded(true);
      return;
    }

    hydrating.current = true;

    (async () => {
      const { data, error } = await supabase
        .from('user_data')
        .select(column)
        .eq('user_id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        // Offline or RLS problem -- keep using the cache rather than wiping it.
        console.warn(`[useSyncedState] load failed for ${column}:`, error.message);
        hydrating.current = false;
        setLoaded(true);
        return;
      }

      const remote = (data as Record<string, unknown> | null)?.[column] as T | undefined;
      const cached = readCache<T>(cacheKey, defaultValue);

      if (!isEmpty(remote)) {
        // Database wins.
        setValue(remote as T);
        writeCache(cacheKey, remote);
      } else if (!isEmpty(cached)) {
        // One-time promotion of pre-existing browser data.
        setValue(cached);
        await supabase
          .from('user_data')
          .upsert({ user_id: user.id, [column]: cached }, { onConflict: 'user_id' });
      }

      hydrating.current = false;
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
    // defaultValue is intentionally excluded: callers commonly pass a fresh
    // literal each render, which would re-run this on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, column, cacheKey]);

  // ---- Save -------------------------------------------------------------
  useEffect(() => {
    writeCache(cacheKey, value);

    if (!user || hydrating.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const { error } = await supabase
        .from('user_data')
        .upsert(
          { user_id: user.id, [column]: latest.current },
          { onConflict: 'user_id' },
        );
      if (error) {
        console.warn(`[useSyncedState] save failed for ${column}:`, error.message);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, user?.id, column, cacheKey]);

  // Flush any pending write when the tab is hidden or closed, so a debounced
  // edit is not lost by navigating away within the debounce window.
  useEffect(() => {
    const flush = () => {
      if (!user || hydrating.current) return;
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      void supabase
        .from('user_data')
        .upsert(
          { user_id: user.id, [column]: latest.current },
          { onConflict: 'user_id' },
        );
    };
    document.addEventListener('visibilitychange', flush);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', flush);
      window.removeEventListener('pagehide', flush);
    };
  }, [user?.id, column]);

  const update = useCallback((updater: T | ((prev: T) => T)) => {
    setValue((prev) =>
      typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater,
    );
  }, []);

  return [value, update, { loaded }];
}
