// Full Bible text, any chapter, in the member's chosen version.
//
// Chapters come from bible-api.com (free, public-domain texts) and are cached
// on the device, so a chapter read once opens instantly and works offline.
// (The reader used to contain only 7 sample chapters, and switching version
// changed the label but not the words.)

import { allBooks } from '@/data/bibleData';

export interface ChapterText {
  verses: { number: number; text: string }[];
}

// Standard book codes, in the same order as allBooks (Genesis ... Revelation).
const BOOK_CODES = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH',
  'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS',
  'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH',
  '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
];

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const ALIASES: Record<string, string> = { psalm: 'PSA', psalms: 'PSA', songofsolomon: 'SNG', songofsongs: 'SNG', revelations: 'REV' };

export function bookCode(book: string): string | null {
  const n = normalize(book);
  if (ALIASES[n]) return ALIASES[n];
  const i = allBooks.findIndex((b) => normalize(b.name) === n || normalize(b.abbr) === n);
  return i >= 0 ? BOOK_CODES[i] ?? null : null;
}

const memory = new Map<string, ChapterText>();
const STORE_PREFIX = 'sog-bible:';
const MAX_STORED = 150; // chapters kept on the device

function readStored(key: string): ChapterText | null {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    return raw ? (JSON.parse(raw) as ChapterText) : null;
  } catch {
    return null;
  }
}

function store(key: string, value: ChapterText) {
  try {
    const indexKey = STORE_PREFIX + 'index';
    const index: string[] = JSON.parse(localStorage.getItem(indexKey) ?? '[]').filter((k: string) => k !== key);
    index.push(key);
    while (index.length > MAX_STORED) localStorage.removeItem(STORE_PREFIX + index.shift());
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
    localStorage.setItem(indexKey, JSON.stringify(index));
  } catch { /* storage full or blocked: the memory cache still works */ }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Loads one chapter. Throws a readable message if it cannot. */
export async function fetchChapter(apiId: string, book: string, chapter: number): Promise<ChapterText> {
  const code = bookCode(book);
  if (!code) throw new Error(`Unknown book: ${book}`);
  const key = `${apiId}/${code}/${chapter}`;
  const cached = memory.get(key) ?? readStored(key);
  if (cached) { memory.set(key, cached); return cached; }

  let lastError = 'Could not load this chapter.';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`https://bible-api.com/data/${encodeURIComponent(apiId)}/${code}/${chapter}`);
      if (res.status === 429) { lastError = 'Busy, trying again…'; await sleep(2500 * (attempt + 1)); continue; }
      if (res.status === 404) throw new Error(`${book} ${chapter} is not in this version.`);
      if (!res.ok) { lastError = `Bible text service error (${res.status}).`; await sleep(800); continue; }
      const data = await res.json();
      const verses = (data?.verses ?? [])
        .map((v: { verse: number; text: string }) => ({ number: Number(v.verse), text: String(v.text ?? '').replace(/\s+/g, ' ').trim() }))
        .filter((v: { number: number; text: string }) => v.number > 0 && v.text);
      if (!verses.length) throw new Error(`${book} ${chapter} is not in this version.`);
      const value = { verses };
      memory.set(key, value);
      store(key, value);
      return value;
    } catch (e) {
      if (e instanceof Error && e.message.includes('is not in this version')) throw e;
      lastError = navigator.onLine === false ? 'You are offline. Chapters you have read before still open.' : 'Could not reach the Bible text service.';
      await sleep(800);
    }
  }
  throw new Error(lastError);
}

/** "John 3:16" or "Romans 8:28-30" in the given version, or null. */
export async function fetchVerse(apiId: string, reference: string): Promise<string | null> {
  const m = reference.trim().match(/^(.+?)\s+(\d+):(\d+)(?:\s*[-–]\s*(\d+))?$/);
  if (!m) return null;
  const [, book, ch, from, to] = m;
  try {
    const { verses } = await fetchChapter(apiId, book, Number(ch));
    const last = Number(to ?? from);
    const text = verses.filter((v) => v.number >= Number(from) && v.number <= last).map((v) => v.text).join(' ');
    return text || null;
  } catch {
    return null;
  }
}
