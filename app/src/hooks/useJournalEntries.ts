import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

/**
 * Journal entries, backed by the public.journal_entries table.
 *
 * Presents the same `[entries, setEntries]` shape PersonalJournal already used
 * with localStorage, so the component keeps full control of the array and only
 * its state declaration changes.
 *
 * Journal entries get a real table rather than a jsonb blob on user_data:
 * they are user-authored prose, the most valuable data in the app, and the
 * collection grows without bound. A blob would mean one bad write loses
 * everything and there is nothing to index or paginate on.
 *
 * Sync is a whole-array reconcile: whatever the component hands back becomes
 * the server state (upsert everything present, delete everything absent). That
 * matches how the component thinks -- it replaces the array on every edit --
 * and avoids threading per-entry CRUD calls through its handlers.
 */

const DEBOUNCE_MS = 800;
const CACHE_KEY = 'sog-journal-entries';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  type: 'reflection' | 'prayer' | 'note' | 'testimony';
  createdAt: string;
  updatedAt: string;
}

interface JournalRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  entry_type: JournalEntry['type'];
  created_at: string;
  updated_at: string;
}

const toEntry = (r: JournalRow): JournalEntry => ({
  id: r.id,
  title: r.title,
  content: r.content,
  type: r.entry_type,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toRow = (e: JournalEntry, userId: string): Partial<JournalRow> => ({
  id: e.id,
  user_id: userId,
  title: e.title,
  content: e.content,
  entry_type: e.type,
  created_at: e.createdAt,
  updated_at: e.updatedAt,
});

/** The component generates ids like `Date.now().toString()`; the table wants uuids. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function ensureUuid(id: string): string {
  return UUID_RE.test(id) ? id : crypto.randomUUID();
}

function readCache(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
  } catch {
    return [];
  }
}

export function useJournalEntries(
  user: User | null,
): [JournalEntry[], (u: JournalEntry[] | ((p: JournalEntry[]) => JournalEntry[])) => void] {
  const [entries, setEntries] = useState<JournalEntry[]>(readCache);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<JournalEntry[]>(entries);
  const serverIds = useRef<Set<string>>(new Set());
  const hydrating = useRef(true);

  latest.current = entries;

  // ---- Load -------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    if (!user) {
      hydrating.current = false;
      return;
    }

    hydrating.current = true;

    (async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        console.warn('[useJournalEntries] load failed:', error.message);
        hydrating.current = false;
        return;
      }

      const rows = (data ?? []) as JournalRow[];

      if (rows.length > 0) {
        serverIds.current = new Set(rows.map((r) => r.id));
        const mapped = rows.map(toEntry);
        setEntries(mapped);
        localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
      } else {
        // Promote whatever the browser was holding, once.
        const cached = readCache();
        if (cached.length > 0) {
          const normalised = cached.map((e) => ({ ...e, id: ensureUuid(e.id) }));
          const { error: upErr } = await supabase
            .from('journal_entries')
            .upsert(normalised.map((e) => toRow(e, user.id)));
          if (upErr) {
            console.warn('[useJournalEntries] migration failed:', upErr.message);
          } else {
            serverIds.current = new Set(normalised.map((e) => e.id));
            setEntries(normalised);
            localStorage.setItem(CACHE_KEY, JSON.stringify(normalised));
          }
        }
      }

      hydrating.current = false;
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // ---- Save -------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));

    if (!user || hydrating.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const current = latest.current.map((e) => ({ ...e, id: ensureUuid(e.id) }));
      const currentIds = new Set(current.map((e) => e.id));

      if (current.length > 0) {
        const { error } = await supabase
          .from('journal_entries')
          .upsert(current.map((e) => toRow(e, user.id)));
        if (error) {
          console.warn('[useJournalEntries] save failed:', error.message);
          return;
        }
      }

      const removed = [...serverIds.current].filter((id) => !currentIds.has(id));
      if (removed.length > 0) {
        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .in('id', removed);
        if (error) {
          console.warn('[useJournalEntries] delete failed:', error.message);
          return;
        }
      }

      serverIds.current = currentIds;
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [entries, user?.id]);

  const update = useCallback(
    (updater: JournalEntry[] | ((p: JournalEntry[]) => JournalEntry[])) => {
      setEntries((prev) =>
        typeof updater === 'function'
          ? (updater as (p: JournalEntry[]) => JournalEntry[])(prev)
          : updater,
      );
    },
    [],
  );

  return [entries, update];
}
