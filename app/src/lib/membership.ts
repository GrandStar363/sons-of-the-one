import { supabase } from '@/lib/supabase';
import { functionErrorMessage } from '@/lib/utils';

// Membership: $1 for the first 24 hours, then the chosen plan is billed
// automatically unless cancelled. Server side: supabase/functions/membership.

/** Turn off to let signed-in users into the app without a membership. */
export const MEMBERSHIP_REQUIRED = true;

export type Plan = 'monthly' | 'annual';

export const ENTRY_FEE = '$1.00';
export const PLANS: Record<Plan, { label: string; price: string; per: string; note?: string }> = {
  monthly: { label: 'Monthly', price: '$9.99', per: 'month' },
  annual: { label: 'Annual', price: '$79.99', per: 'year', note: 'Save 33%' },
};

export interface Membership {
  isMember: boolean;
  isAdmin: boolean;
  hasSubscription: boolean;
  status: string;            // Stripe status: trialing | active | past_due | canceled | incomplete | none
  plan?: Plan;
  inEntryPeriod?: boolean;   // within the $1 first 24 hours
  trialEnd?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

export interface MembershipEvent {
  id: string;
  event_type: string;
  plan_type: string | null;
  description: string | null;
  created_at: string;
}

/** Signup context: right after sign-up there may be no session yet. */
export interface SignupContext {
  userId: string;
}

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('membership', { body });
  if (error) throw new Error(await functionErrorMessage(error, 'Membership service unavailable'));
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export const getMembership = () => call<Membership>({ action: 'status' });
export const getMembershipWithHistory = () =>
  call<Membership & { history: MembershipEvent[] }>({ action: 'status', withHistory: true });

export const startMembership = (plan: Plan, signup?: SignupContext) =>
  call<{ clientSecret?: string; subscriptionId?: string; alreadyMember?: boolean } & Partial<Membership>>({
    action: 'start', plan, signupUserId: signup?.userId,
  });

export const confirmMembership = (subscriptionId: string, signup?: SignupContext) =>
  call<Membership & { paid: boolean }>({ action: 'confirm', subscriptionId, signupUserId: signup?.userId });

export const cancelMembership = () => call<Membership>({ action: 'cancel' });
export const resumeMembership = () => call<Membership>({ action: 'resume' });
export const switchPlan = (plan: Plan) => call<Membership>({ action: 'switch-plan', plan });

export function formatDate(iso?: string | null, withTime = false): string {
  if (!iso) return '';
  const d = new Date(iso);
  return withTime
    ? d.toLocaleString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}
