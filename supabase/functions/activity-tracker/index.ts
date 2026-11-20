// activity-tracker
//
//   log            (anyone)  { userId, sessionId, activityType, activityCategory,
//                              activityDetails, pagePath, referrer, deviceInfo }
//   get_analytics  (admin)   { startDate, endDate } -> { analytics }
//   get_realtime   (admin)   { minutes }            -> { realtime }
//   export         (admin)   { startDate, endDate, format: 'json'|'csv' }
//
// The response shapes are the ones AdminActivityMonitor.tsx reads. (Earlier
// the app sent activityType/pagePath while this read eventType/path, the
// screen expected different field names, nothing in the app called the
// tracker at all, and the reads had no admin check.)

import { admin, corsHeaders } from '../_shared/db.ts';
import { requireAdmin, AdminAuthError } from '../_shared/admin.ts';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : null);

interface Row {
  id: string;
  user_id: string | null;
  session_id: string | null;
  event_type: string;
  path: string | null;
  metadata: Record<string, any> | null;
  occurred_at: string;
}

/** The row as the admin screen names things, with the member's name. */
function present(r: Row, names: Map<string, { name: string; email: string }>) {
  const who = r.user_id ? names.get(r.user_id) : undefined;
  return {
    id: r.id,
    user_id: r.user_id,
    user_name: who?.name ?? null,
    user_email: who?.email ?? null,
    session_id: r.session_id,
    activity_type: r.event_type,
    activity_category: r.metadata?.category ?? 'navigation',
    activity_details: r.metadata?.details ?? {},
    page_path: r.path,
    device_type: r.metadata?.device?.deviceType ?? null,
    created_at: r.occurred_at,
  };
}

async function memberNames(db: ReturnType<typeof admin>, ids: string[]) {
  const names = new Map<string, { name: string; email: string }>();
  for (const id of [...new Set(ids)].slice(0, 300)) {
    const { data } = await db.auth.admin.getUserById(id);
    const u = data?.user;
    if (u) {
      const email = u.email ?? '';
      names.set(id, { email, name: u.user_metadata?.display_name || u.user_metadata?.full_name || email.split('@')[0] });
    }
  }
  return names;
}

async function loadRange(db: ReturnType<typeof admin>, startDate?: string, endDate?: string): Promise<Row[]> {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 86400000);
  const end = endDate ? new Date(endDate) : new Date();
  const rows: Row[] = [];
  for (let from = 0; from < 50000; from += 1000) {
    const { data, error } = await db.from('activity_events')
      .select('id, user_id, session_id, event_type, path, metadata, occurred_at')
      .gte('occurred_at', start.toISOString()).lte('occurred_at', end.toISOString())
      .order('occurred_at', { ascending: false }).range(from, from + 999);
    if (error) throw error;
    rows.push(...((data ?? []) as Row[]));
    if ((data ?? []).length < 1000) break;
  }
  return rows;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const db = admin();

    if (action === 'log') {
      const type = clip(body.activityType ?? body.eventType, 60) ?? 'page_view';
      // The member comes from their sign-in token, not from the request body.
      // Sign-out is the exception: it is logged just after the token is gone.
      let userId: string | null = null;
      const jwt = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
      if (jwt) {
        const { data } = await db.auth.getUser(jwt);
        userId = data?.user?.id ?? null;
      }
      if (!userId && type === 'logout' && typeof body.userId === 'string' && /^[0-9a-f-]{36}$/i.test(body.userId)) {
        userId = body.userId;
      }
      if (!userId) return json({ success: true, logged: false }); // members only
      const { error } = await db.from('activity_events').insert({
        user_id: userId,
        session_id: clip(body.sessionId, 80),
        event_type: type,
        path: clip(body.pagePath ?? body.path, 200),
        referrer: clip(body.referrer, 300),
        user_agent: clip(body.deviceInfo?.userAgent ?? body.userAgent ?? req.headers.get('user-agent'), 300),
        metadata: {
          category: clip(body.activityCategory, 40) ?? 'navigation',
          details: body.activityDetails && typeof body.activityDetails === 'object' ? body.activityDetails : {},
          device: body.deviceInfo && typeof body.deviceInfo === 'object'
            ? { deviceType: clip(body.deviceInfo.deviceType, 20), language: clip(body.deviceInfo.language, 20), timezone: clip(body.deviceInfo.timezone, 60) }
            : null,
          duration: Number.isFinite(body.durationSeconds) ? body.durationSeconds : null,
        },
      });
      if (error) throw error;
      return json({ success: true, logged: true });
    }

    // Everything below shows members' activity: admins only.
    await requireAdmin(body.adminToken);

    if (action === 'get_analytics') {
      const rows = await loadRange(db, body.startDate, body.endDate);
      const names = await memberNames(db, rows.map((r) => r.user_id).filter(Boolean) as string[]);
      const byType: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      const byHour: Record<number, number> = {};
      const byDay: Record<string, number> = {};
      const byPage: Record<string, number> = {};
      const perUser = new Map<string, { userId: string; name: string | null; email: string | null; totalActivities: number; lastActive: string; activities: Record<string, number> }>();
      const sessions = new Set<string>();
      const tz = Number.isFinite(Number(body.tzOffset)) ? Number(body.tzOffset) : 0;
      for (const r of rows) {
        const cat = r.metadata?.category ?? 'navigation';
        byType[r.event_type] = (byType[r.event_type] ?? 0) + 1;
        byCategory[cat] = (byCategory[cat] ?? 0) + 1;
        // in the admin's own time zone (getTimezoneOffset minutes, sent by the screen)
        const local = new Date(new Date(r.occurred_at).getTime() - tz * 60000);
        byHour[local.getUTCHours()] = (byHour[local.getUTCHours()] ?? 0) + 1;
        const day = local.toISOString().slice(0, 10);
        byDay[day] = (byDay[day] ?? 0) + 1;
        if (r.path) byPage[r.path] = (byPage[r.path] ?? 0) + 1;
        if (r.session_id) sessions.add(r.session_id);
        if (r.user_id) {
          const who = names.get(r.user_id);
          const u = perUser.get(r.user_id) ?? { userId: r.user_id, name: who?.name ?? null, email: who?.email ?? null, totalActivities: 0, lastActive: r.occurred_at, activities: {} };
          u.totalActivities++;
          if (r.occurred_at > u.lastActive) u.lastActive = r.occurred_at;
          u.activities[r.event_type] = (u.activities[r.event_type] ?? 0) + 1;
          perUser.set(r.user_id, u);
        }
      }
      const sortedDays = Object.fromEntries(Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)));
      return json({
        success: true,
        analytics: {
          totalActivities: rows.length,
          uniqueUsers: perUser.size,
          uniqueSessions: sessions.size,
          activityByType: byType,
          activityByCategory: byCategory,
          activityByHour: byHour,
          activityByDay: sortedDays,
          topPages: Object.entries(byPage).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, count]) => ({ page, count })),
          topUsers: [...perUser.values()].sort((a, b) => b.totalActivities - a.totalActivities).slice(0, 10),
          recentActivities: rows.slice(0, 50).map((r) => present(r, names)),
        },
      });
    }

    if (action === 'get_realtime') {
      const minutes = Math.min(Math.max(Number(body.minutes ?? 60), 1), 1440);
      const rows = await loadRange(db, new Date(Date.now() - minutes * 60000).toISOString());
      const names = await memberNames(db, rows.slice(0, 50).map((r) => r.user_id).filter(Boolean) as string[]);
      return json({
        success: true,
        realtime: {
          activeUsers: new Set(rows.map((r) => r.user_id).filter(Boolean)).size,
          activeSessions: new Set(rows.map((r) => r.session_id).filter(Boolean)).size,
          recentActivities: rows.slice(0, 50).map((r) => present(r, names)),
          periodMinutes: minutes,
        },
      });
    }

    if (action === 'export') {
      const rows = await loadRange(db, body.startDate, body.endDate);
      const names = await memberNames(db, rows.map((r) => r.user_id).filter(Boolean) as string[]);
      const data = rows.map((r) => present(r, names));
      if (body.format === 'csv') {
        const cols = ['created_at', 'activity_type', 'activity_category', 'page_path', 'user_name', 'user_email', 'session_id', 'device_type'] as const;
        const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const csv = [cols.join(','), ...data.map((d) => cols.map((c) => esc(d[c])).join(','))].join('\n');
        return new Response(csv, { headers: { ...corsHeaders, 'Content-Type': 'text/csv' } });
      }
      return json({ success: true, data, count: data.length });
    }

    return json({ success: false, error: `Unknown action: ${action}` }, 400);
  } catch (error) {
    if (error instanceof AdminAuthError) return json({ success: false, error: error.message }, error.status);
    console.error('[activity-tracker]', error);
    return json({ success: false, error: (error as Error).message }, 500);
  }
});
