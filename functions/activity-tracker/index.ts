// activity-tracker
//
// Called only by the st07 fork; Famous.ai never built it. Contract derived
// from useActivityTracker.ts and AdminActivityMonitor.tsx:
//
//   log            { userId, sessionId, eventType, path, referrer, ... } -> { success }
//   get_analytics  { days }        -> { analytics: {...} }
//   get_realtime   { minutes }     -> { active_users, events, pages }
//   export         { limit }       -> { events }
//
// Reads are admin-facing and go through the service role. activity_events has
// RLS enabled with no anon/authenticated policy, so ordinary users cannot read
// the analytics even though they generate the rows.

import { admin, ok, fail, handler, corsHeaders } from '../_shared/db.ts';

Deno.serve(handler(async (body) => {
  const { action } = body;
  if (!action) return fail('action is required');
  const db = admin();

  if (action === 'log') {
    const { userId, sessionId, eventType, path, referrer, userAgent, metadata } = body;
    const { error } = await db.from('activity_events').insert({
      user_id: userId ?? null,
      session_id: sessionId ?? null,
      event_type: eventType ?? 'page_view',
      path: path ?? null,
      referrer: referrer ?? null,
      user_agent: userAgent ?? null,
      metadata: metadata ?? {},
    });
    if (error) throw error;
    return ok({ logged: true });
  }

  if (action === 'get_analytics') {
    const days = Number(body.days ?? 30);
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data, error } = await db
      .from('activity_events')
      .select('user_id, event_type, path, occurred_at')
      .gte('occurred_at', since);
    if (error) throw error;

    const rows = data ?? [];
    const byDay: Record<string, number> = {};
    const byPath: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const users = new Set<string>();
    for (const r of rows) {
      const day = String(r.occurred_at).slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + 1;
      if (r.path) byPath[r.path] = (byPath[r.path] ?? 0) + 1;
      byType[r.event_type] = (byType[r.event_type] ?? 0) + 1;
      if (r.user_id) users.add(r.user_id);
    }
    const top = (o: Record<string, number>, n = 10) =>
      Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n)
        .map(([k, v]) => ({ name: k, count: v }));

    return ok({
      analytics: {
        range_days: days,
        total_events: rows.length,
        unique_users: users.size,
        events_by_day: Object.entries(byDay).sort()
          .map(([date, count]) => ({ date, count })),
        top_pages: top(byPath),
        events_by_type: top(byType, 20),
      },
    });
  }

  if (action === 'get_realtime') {
    const minutes = Number(body.minutes ?? 60);
    const since = new Date(Date.now() - minutes * 60000).toISOString();
    const { data, error } = await db
      .from('activity_events')
      .select('user_id, session_id, path, event_type, occurred_at')
      .gte('occurred_at', since)
      .order('occurred_at', { ascending: false });
    if (error) throw error;

    const rows = data ?? [];
    const users = new Set(rows.map(r => r.user_id).filter(Boolean));
    const sessions = new Set(rows.map(r => r.session_id).filter(Boolean));
    const pages: Record<string, number> = {};
    for (const r of rows) if (r.path) pages[r.path] = (pages[r.path] ?? 0) + 1;

    return ok({
      window_minutes: minutes,
      active_users: users.size,
      active_sessions: sessions.size,
      events: rows.slice(0, 50),
      pages: Object.entries(pages).sort((a, b) => b[1] - a[1])
        .slice(0, 10).map(([name, count]) => ({ name, count })),
    });
  }

  if (action === 'export') {
    const limit = Math.min(Number(body.limit ?? 1000), 10000);
    const { data, error } = await db
      .from('activity_events').select('*')
      .order('occurred_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return ok({ events: data ?? [], count: (data ?? []).length });
  }

  return fail(`Unknown action: ${action}`);
}));

export { corsHeaders };
