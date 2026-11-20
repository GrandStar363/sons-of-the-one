// Content the admin publishes from the admin panel (Content tab).
//
//   Featured verse: one dated for today wins; otherwise the newest active verse
//                   with no date. Without one, the app's built-in rotation.
//   Devotional:     one published for today wins; otherwise the newest published
//                   devotional with no date. Without one, the built-in text.

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface AdminVerse {
  reference: string;
  text: string;
  translation: string;
  theme: string;
}

export interface AdminDevotional {
  title: string;
  content: string;
  reference: string;
  scriptureText: string;
  author: string | null;
}

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export async function fetchTodaysVerse(): Promise<AdminVerse | null> {
  const today = localToday();
  const { data, error } = await supabase
    .from('featured_verses')
    .select('reference, verse_text, translation, display_date, created_at')
    .eq('is_active', true)
    .or(`display_date.eq.${today},display_date.is.null`)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error || !data?.length) return null;
  const pick = data.find((v) => v.display_date === today) ?? data.find((v) => !v.display_date);
  if (!pick?.reference || !pick?.verse_text) return null;
  return { reference: pick.reference, text: pick.verse_text, translation: pick.translation || 'KJV', theme: 'Featured' };
}

export async function fetchTodaysDevotional(): Promise<AdminDevotional | null> {
  const today = localToday();
  const { data, error } = await supabase
    .from('devotionals')
    .select('title, content, scripture_reference, scripture_text, author, publish_date, created_at')
    .eq('is_published', true)
    .or(`publish_date.eq.${today},publish_date.is.null`)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error || !data?.length) return null;
  const pick = data.find((d) => d.publish_date === today) ?? data.find((d) => !d.publish_date);
  if (!pick?.content) return null;
  return {
    title: pick.title ?? "Today's Devotional",
    content: pick.content,
    reference: pick.scripture_reference ?? '',
    scriptureText: pick.scripture_text ?? '',
    author: pick.author ?? null,
  };
}

/** Today's admin content, or null while loading / when there is none. */
export function usePublished<T>(load: () => Promise<T | null>): T | null {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((v) => { if (alive) setValue(v); }).catch(() => {});
    return () => { alive = false; };
  }, [load]);
  return value;
}
