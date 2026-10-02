// Admin authorization.
//
// The recovered admin-* functions performed NO authorization. They were
// reachable by anyone holding the anon key -- which ships in the browser
// bundle -- so `{"action":"list"}` against admin-users returned every member's
// email address to an unauthenticated caller.
//
// The frontend already had the pieces: AdminLogin stores an `adminToken` from
// admin-auth, and AdminDashboard verifies it on mount. But the individual
// admin components never transmitted it, so the check was cosmetic -- the UI
// gated on it, the API did not.
//
// requireAdmin() closes that. Every admin-* function calls it first.

import { admin } from './db.ts';

export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
  role: string;
}

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * Validate an admin session token against admin_sessions and return the admin.
 * Throws AdminAuthError if the token is missing, unknown or expired.
 *
 * The token is the opaque session value admin-auth issues on login -- not a
 * JWT -- so it is checked against the table on every call and cannot be forged
 * without the database.
 */
export async function requireAdmin(token: string | undefined | null): Promise<AdminIdentity> {
  if (!token) throw new AdminAuthError('Admin authentication required');

  const db = admin();
  const { data: session } = await db
    .from('admin_sessions').select('*').eq('token', token).maybeSingle();

  if (!session) throw new AdminAuthError('Invalid admin session');
  if (new Date(session.expires_at) < new Date()) {
    throw new AdminAuthError('Admin session expired');
  }

  const { data: who } = await db
    .from('admins').select('id, email, name, role').eq('id', session.admin_id).maybeSingle();

  if (!who) throw new AdminAuthError('Admin account no longer exists', 403);
  return who as AdminIdentity;
}

/** Require a specific role, e.g. super_admin for destructive actions. */
export function requireRole(who: AdminIdentity, ...roles: string[]): void {
  if (!roles.includes(who.role)) {
    throw new AdminAuthError(
      `This action requires one of: ${roles.join(', ')}`, 403);
  }
}

/**
 * Append to the admin audit trail. Deliberately best-effort: a logging failure
 * must not block the action the admin is performing, but it is surfaced in the
 * function logs.
 */
export async function auditLog(
  who: AdminIdentity,
  action: string,
  target: string | null,
  detail: Record<string, unknown> = {},
): Promise<void> {
  try {
    await admin().from('admin_audit_log').insert({
      admin_id: who.id,
      admin_email: who.email,
      action,
      target,
      detail,
    });
  } catch (err) {
    console.error('[audit] failed to record', action, err);
  }
}
