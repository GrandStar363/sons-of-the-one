import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { BookOpen, ChevronLeft, ChevronRight, Clock, HandHeart, Pause, Play, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Rotating prayers: one prayer at a time, large enough to read, moving on by
// itself every several seconds and starting over at the end, so visitors keep
// reading and praying over one another's requests.
//
// Members' requests (prayer_requests) come first. While there are only a few,
// prayers from Scripture fill the rotation so it is never empty; those are
// labelled with their reference, never presented as a member's request.

export interface PrayerStats {
  total: number;
  today: number;
  warriors: number;
}

interface SpotlightItem {
  id: string;
  kind: 'member' | 'scripture';
  title: string;
  text: string;
  author: string;
  category: string;
  createdAt?: string;
  urgent?: boolean;
  answered?: boolean;
  praying: number;
  iAmPraying: boolean;
  reference?: string;
}

const SCRIPTURE_PRAYERS: Array<{ title: string; text: string; reference: string }> = [
  { title: 'A clean heart', reference: 'Psalm 51:10',
    text: 'Create in me a clean heart, O God; and renew a right spirit within me.' },
  { title: 'The prayer Jesus taught', reference: 'Matthew 6:9-10',
    text: 'Our Father which art in heaven, Hallowed be thy name. Thy kingdom come. Thy will be done in earth, as it is in heaven.' },
  { title: 'Lead me in thy truth', reference: 'Psalm 25:4-5',
    text: 'Shew me thy ways, O LORD; teach me thy paths. Lead me in thy truth, and teach me: for thou art the God of my salvation; on thee do I wait all the day.' },
  { title: 'The blessing', reference: 'Numbers 6:24-26',
    text: 'The LORD bless thee, and keep thee: The LORD make his face shine upon thee, and be gracious unto thee: The LORD lift up his countenance upon thee, and give thee peace.' },
  { title: 'Search me, O God', reference: 'Psalm 139:23-24',
    text: 'Search me, O God, and know my heart: try me, and know my thoughts: And see if there be any wicked way in me, and lead me in the way everlasting.' },
  { title: 'When my heart is overwhelmed', reference: 'Psalm 61:1-2',
    text: 'Hear my cry, O God; attend unto my prayer. From the end of the earth will I cry unto thee, when my heart is overwhelmed: lead me to the rock that is higher than I.' },
  { title: 'Help thou mine unbelief', reference: 'Mark 9:24',
    text: 'Lord, I believe; help thou mine unbelief.' },
  { title: 'Words and meditations', reference: 'Psalm 19:14',
    text: 'Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer.' },
  { title: 'Teach me thy way', reference: 'Psalm 86:11',
    text: 'Teach me thy way, O LORD; I will walk in thy truth: unite my heart to fear thy name.' },
  { title: 'In the morning', reference: 'Psalm 143:8',
    text: 'Cause me to hear thy lovingkindness in the morning; for in thee do I trust: cause me to know the way wherein I should walk; for I lift up my soul unto thee.' },
];

const MIN_ROTATION = 6; // fill with Scripture prayers up to this many items

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General', health: 'Health & Healing', family: 'Family', guidance: 'Guidance & Wisdom',
  provision: 'Provision', spiritual: 'Spiritual Growth', thanksgiving: 'Thanksgiving',
};

function timeAgo(iso?: string) {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}d ago` : new Date(iso).toLocaleDateString();
}

/** Longer prayers stay up longer: 7–14 seconds. */
const dwellFor = (text: string) => Math.min(14000, Math.max(7000, 5000 + text.length * 35));

interface PrayerSpotlightProps {
  user: User | null;
  /** Change to reload (e.g. after a new prayer is posted). */
  refreshKey?: number;
  onReadVerse?: (reference: string) => void;
  onOpenAuth?: () => void;
  onStats?: (stats: PrayerStats) => void;
  /** 'light' sits on the purple home banner, 'dark' on the Prayer Wall page. */
  tone?: 'light' | 'dark';
}

const PrayerSpotlight: React.FC<PrayerSpotlightProps> = ({
  user, refreshKey = 0, onReadVerse, onOpenAuth, onStats, tone = 'light',
}) => {
  const [items, setItems] = useState<SpotlightItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [hoverPause, setHoverPause] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [cycle, setCycle] = useState(0); // restarts the progress bar
  const touchStart = useRef<number | null>(null);
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const load = useCallback(async () => {
    let members: SpotlightItem[] = [];
    try {
      const { data: prayers } = await supabase
        .from('prayer_requests')
        .select('id, user_id, name, title, request, category, is_urgent, is_answered, is_anonymous, created_at')
        .order('created_at', { ascending: false })
        .limit(25);
      const list = prayers ?? [];
      const ids = list.map((p) => p.id);
      const { data: commitments } = ids.length
        ? await supabase.from('prayer_commitments').select('prayer_id, user_id').in('prayer_id', ids)
        : { data: [] as { prayer_id: string; user_id: string }[] };
      const counts: Record<string, number> = {};
      const mine = new Set<string>();
      (commitments ?? []).forEach((c) => {
        counts[c.prayer_id] = (counts[c.prayer_id] ?? 0) + 1;
        if (user && c.user_id === user.id) mine.add(c.prayer_id);
      });
      // Open requests first (urgent ones at the top), answered ones after.
      members = list
        .map((p) => ({
          id: p.id,
          kind: 'member' as const,
          title: p.title,
          text: p.request,
          author: p.is_anonymous ? 'Anonymous' : (p.name || 'A member'),
          category: CATEGORY_LABELS[p.category] ?? 'Prayer',
          createdAt: p.created_at,
          urgent: p.is_urgent,
          answered: p.is_answered,
          praying: counts[p.id] ?? 0,
          iAmPraying: mine.has(p.id),
        }))
        .sort((a, b) => Number(a.answered) - Number(b.answered) || Number(b.urgent) - Number(a.urgent));

      if (onStats) {
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        const [{ count: total }, { count: today }, { data: warriorRows }] = await Promise.all([
          supabase.from('prayer_requests').select('id', { count: 'exact', head: true }),
          supabase.from('prayer_requests').select('id', { count: 'exact', head: true }).gte('created_at', startOfDay.toISOString()),
          supabase.from('prayer_commitments').select('user_id').limit(1000),
        ]);
        onStats({ total: total ?? 0, today: today ?? 0, warriors: new Set((warriorRows ?? []).map((r) => r.user_id)).size });
      }
    } catch (err) {
      console.error('Prayer spotlight: could not load prayers', err);
    }

    // No member requests yet: all the Scripture prayers. A few: top up to MIN_ROTATION.
    const fill = members.length === 0 ? SCRIPTURE_PRAYERS.length : Math.max(0, MIN_ROTATION - members.length);
    const scripture: SpotlightItem[] = SCRIPTURE_PRAYERS
      .slice(0, fill)
      .map((p, i) => ({
        id: `scripture-${i}`, kind: 'scripture', title: p.title, text: p.text, author: p.reference,
        category: 'Prayer from Scripture', praying: 0, iAmPraying: false, reference: p.reference,
      }));
    setItems([...members, ...scripture]);
    setLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    load();
    setIndex(0);
  }, [load, refreshKey]);

  const count = items.length;
  const current = items[Math.min(index, Math.max(0, count - 1))];
  const paused = hoverPause || userPaused;

  const go = useCallback((delta: number) => {
    if (!count) return;
    setIndex((i) => (i + delta + count) % count);
    setCycle((c) => c + 1);
  }, [count]);

  // Rotate continually; hold while paused or while the tab is in the background.
  useEffect(() => {
    if (!current || paused || count < 2) return;
    const id = setTimeout(() => {
      if (document.visibilityState === 'hidden') { setCycle((c) => c + 1); return; }
      go(1);
    }, dwellFor(current.text));
    return () => clearTimeout(id);
  }, [current, paused, count, go, cycle]);

  const togglePraying = async (item: SpotlightItem) => {
    if (item.kind !== 'member') return;
    if (!user) { onOpenAuth?.(); return; }
    setBusy(item.id);
    try {
      if (item.iAmPraying) {
        await supabase.from('prayer_commitments').delete().eq('prayer_id', item.id).eq('user_id', user.id);
      } else {
        await supabase.from('prayer_commitments').insert({ prayer_id: item.id, user_id: user.id });
      }
      setItems((prev) => prev.map((p) => p.id === item.id
        ? { ...p, iAmPraying: !p.iAmPraying, praying: p.praying + (p.iAmPraying ? -1 : 1) } : p));
    } catch (err) {
      console.error('Prayer spotlight: could not update', err);
    } finally {
      setBusy(null);
    }
  };

  const dark = tone === 'dark';
  const text = dark ? 'text-[#f5f1e8]' : 'text-white';
  const muted = dark ? 'text-[#f5f1e8]/60' : 'text-white/70';

  if (!loaded) {
    return (
      <div className={`mx-auto max-w-3xl rounded-3xl border p-8 ${dark ? 'border-[#d4af37]/20 bg-[#f5f1e8]/5' : 'border-white/20 bg-white/10'}`}>
        <div className="h-4 w-32 animate-pulse rounded bg-white/20" />
        <div className="mt-6 h-6 w-3/4 animate-pulse rounded bg-white/20" />
        <div className="mt-3 h-6 w-2/3 animate-pulse rounded bg-white/20" />
      </div>
    );
  }
  if (!current) return null;

  return (
    <div
      className="mx-auto max-w-3xl"
      onMouseEnter={() => setHoverPause(true)}
      onMouseLeave={() => setHoverPause(false)}
      onFocus={() => setHoverPause(true)}
      onBlur={() => setHoverPause(false)}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        touchStart.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); // swipe to the next/previous prayer
      }}
      aria-roledescription="carousel"
      aria-label="Prayer requests"
    >
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 shadow-2xl sm:p-8 ${
          dark ? 'border-[#d4af37]/30 bg-gradient-to-br from-[#d4af37]/10 via-[#1a2332] to-[#14B8A6]/10' : 'border-white/25 bg-white/10 backdrop-blur-md'
        }`}
      >
        {/* time until the next prayer */}
        {count > 1 && (
          <div className="absolute inset-x-0 top-0 h-1 bg-white/10">
            <div
              key={`${index}-${cycle}-${paused}`}
              className="h-full bg-gradient-to-r from-amber-300 to-pink-300"
              style={paused || reducedMotion
                ? { width: '0%' }
                : { width: '0%', animation: `sog-grow ${dwellFor(current.text)}ms linear forwards` }}
            />
          </div>
        )}

        {/* All prayers share one grid cell: the card is as tall as the longest,
            so the page below never jumps as the prayers rotate. */}
        <div className="grid">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`[grid-area:1/1] ${i === index
                ? (reducedMotion ? '' : 'animate-[sog-fade_600ms_ease-out]')
                : 'invisible pointer-events-none'}`}
              aria-hidden={i !== index}
              aria-live={i === index && paused ? 'polite' : 'off'}
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  item.kind === 'scripture' ? 'bg-amber-400/90 text-[#3b2600]' : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                }`}>
                  {item.kind === 'scripture' ? <BookOpen className="h-3.5 w-3.5" /> : <HandHeart className="h-3.5 w-3.5" />}
                  {item.category}
                </span>
                {item.urgent && !item.answered && (
                  <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white">Urgent</span>
                )}
                {item.answered && (
                  <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">Answered — praise God!</span>
                )}
                <span className={`ml-auto text-xs ${muted}`}>{i + 1} / {count}</span>
              </div>

              <h3 className={`mb-2 font-serif text-xl font-bold sm:text-2xl ${text}`}>{item.title}</h3>
              <p className={`font-serif text-lg italic leading-relaxed sm:text-xl ${text}`}>
                “{item.text}”
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
                    {item.kind === 'scripture' ? <Sparkles className="h-4 w-4" /> : item.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${text}`}>{item.author}</p>
                    {item.createdAt && (
                      <p className={`flex items-center text-xs ${muted}`}><Clock className="mr-1 h-3 w-3" />{timeAgo(item.createdAt)}</p>
                    )}
                  </div>
                </div>

                {item.kind === 'member' ? (
                  <button
                    type="button"
                    onClick={() => togglePraying(item)}
                    disabled={busy === item.id}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60 ${
                      item.iAmPraying
                        ? 'bg-emerald-500/30 text-emerald-200 ring-1 ring-emerald-300/50'
                        : 'bg-white/20 text-white hover:bg-white hover:text-purple-700'
                    }`}
                  >
                    <HandHeart className="h-4 w-4" />
                    {item.iAmPraying ? "I'm praying" : 'Pray for this'}
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{item.praying}</span>
                  </button>
                ) : onReadVerse && item.reference ? (
                  <button
                    type="button"
                    onClick={() => onReadVerse(item.reference!)}
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white hover:text-purple-700"
                  >
                    <BookOpen className="h-4 w-4" /> Read {item.reference}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* controls */}
      {count > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" onClick={() => go(-1)} aria-label="Previous prayer"
            className="rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/30">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex max-w-[60%] flex-wrap items-center justify-center gap-1.5">
            {items.slice(0, 12).map((it, i) => (
              <button
                key={it.id}
                type="button"
                onClick={() => { setIndex(i); setCycle((c) => c + 1); }}
                aria-label={`Prayer ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-amber-300' : 'w-2 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(1)} aria-label="Next prayer"
            className="rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/30">
            <ChevronRight className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? 'Resume rotating' : 'Pause rotating'}
            className="rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/30">
            {userPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
      )}

      <style>{`
        @keyframes sog-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes sog-grow { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
};

export default PrayerSpotlight;
