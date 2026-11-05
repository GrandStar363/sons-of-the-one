import React, { useEffect, useState } from 'react';
import {
  AlertCircle, AlertTriangle, Calendar, CheckCircle, ChevronDown, ChevronUp, Clock, Crown,
  History, Loader2, RefreshCw, Shield, X, XCircle,
} from 'lucide-react';
import {
  cancelMembership, ENTRY_FEE, formatDate, getMembershipWithHistory, Membership, MembershipEvent,
  Plan, PLANS, resumeMembership, switchPlan,
} from '@/lib/membership';

// "My Subscription": the member's plan, next charge, and the actions they can
// take themselves: switch to annual, cancel (no further charges), or undo a
// cancellation. Everything goes through the membership function, which checks
// the signed-in account and reads the live state from Stripe.

interface SubscriptionStatusProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

type Confirming = null | 'cancel' | { switchTo: Plan };

function StatusBadge({ m }: { m: Membership }) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium';
  if (m.status === 'trialing') {
    return <span className={`${base} bg-amber-100 text-amber-800`}><Clock className="w-4 h-4" /> First 24 hours</span>;
  }
  if (m.status === 'active') {
    return <span className={`${base} bg-green-100 text-green-700`}><CheckCircle className="w-4 h-4" /> Active</span>;
  }
  if (m.status === 'past_due') {
    return <span className={`${base} bg-red-100 text-red-700`}><AlertTriangle className="w-4 h-4" /> Payment problem</span>;
  }
  if (m.status === 'canceled') {
    return <span className={`${base} bg-gray-100 text-gray-700`}><XCircle className="w-4 h-4" /> Ended</span>;
  }
  return <span className={`${base} bg-gray-100 text-gray-600`}>No membership</span>;
}

export default function SubscriptionStatus({ isOpen, onClose, email }: SubscriptionStatusProps) {
  const [loading, setLoading] = useState(true);
  const [m, setM] = useState<Membership | null>(null);
  const [history, setHistory] = useState<MembershipEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [confirming, setConfirming] = useState<Confirming>(null);
  const [working, setWorking] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMembershipWithHistory();
      setM(res);
      setHistory(res.history ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setNotice(null);
      setConfirming(null);
      load();
    }
  }, [isOpen]);

  const run = async (action: () => Promise<Membership>, done: string) => {
    setWorking(true);
    setError(null);
    try {
      const updated = await action();
      setM(updated);
      setConfirming(null);
      setNotice(done);
      getMembershipWithHistory().then((r) => setHistory(r.history ?? [])).catch(() => {});
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setWorking(false);
    }
  };

  if (!isOpen) return null;

  const plan = m?.plan ?? 'monthly';
  const entry = m?.status === 'trialing';
  // First charge of the plan (end of the 24 hours), or the next renewal.
  const nextDate = entry ? m?.trialEnd : m?.currentPeriodEnd;
  const live = !!m?.hasSubscription && ['trialing', 'active', 'past_due'].includes(m.status);
  const other: Plan = plan === 'monthly' ? 'annual' : 'monthly';
  // Upgrading to annual is always offered; going back to monthly only before
  // anything has been billed (the first 24 hours).
  const canSwitch = live && !m?.cancelAtPeriodEnd && (other === 'annual' || entry);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 text-center text-white rounded-t-2xl">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-1">My Membership</h2>
          <p className="text-amber-100 text-sm break-all">{email}</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading your membership…</p>
            </div>
          ) : !m ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700">{error ?? 'Could not load your membership.'}</p>
              <button onClick={load} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                Try Again
              </button>
            </div>
          ) : !m.hasSubscription ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-500" />
              </div>
              {m.isAdmin ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Administrator account</h3>
                  <p className="text-gray-600">You have full access. Administrators don't need a membership.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No membership yet</h3>
                  <p className="text-gray-600">
                    Membership is {ENTRY_FEE} for the first 24 hours, then {PLANS.monthly.price}/month or {PLANS.annual.price}/year.
                    Sign out and back in to choose your plan.
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              {notice && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" /> <span>{notice}</span>
                </div>
              )}
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> <span>{error}</span>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 font-medium">Status</span>
                  <StatusBadge m={m} />
                </div>

                <div className="flex items-center justify-between gap-3 py-3 border-t border-gray-200">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-semibold text-gray-900 text-right">
                    {PLANS[plan].label} ({PLANS[plan].price}/{PLANS[plan].per})
                  </span>
                </div>

                {entry && (
                  <div className="py-3 border-t border-gray-200 text-sm text-gray-700">
                    Your {ENTRY_FEE} entry covers the first 24 hours, until{' '}
                    <span className="font-semibold">{formatDate(m.trialEnd, true)}</span>.
                  </div>
                )}

                {live && nextDate && (
                  <div className="flex items-center justify-between gap-3 py-3 border-t border-gray-200">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {m.cancelAtPeriodEnd ? 'Access until' : entry ? 'First charge' : 'Next charge'}
                    </span>
                    <span className="font-semibold text-gray-900 text-right">
                      {m.cancelAtPeriodEnd
                        ? formatDate(nextDate, entry)
                        : `${PLANS[plan].price} on ${formatDate(nextDate, entry)}`}
                    </span>
                  </div>
                )}

                {m.status === 'past_due' && (
                  <p className="mt-2 text-sm text-red-700">
                    Your last payment didn't go through. We'll retry the card on file automatically.
                  </p>
                )}

                {m.cancelAtPeriodEnd && live && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-amber-800 font-medium text-sm">Membership cancelled</p>
                    <p className="text-amber-700 text-xs mt-1">
                      You won't be charged again. Access continues until {formatDate(nextDate, entry)}.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {live && (
                <div className="space-y-3 mb-6">
                  {m.cancelAtPeriodEnd ? (
                    <button
                      onClick={() => run(resumeMembership, 'Your membership will continue as normal.')}
                      disabled={working}
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {working && <Loader2 className="w-4 h-4 animate-spin" />} Keep my membership
                    </button>
                  ) : confirming === 'cancel' ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Cancel your membership?</h4>
                      <p className="text-sm text-red-700 mb-4">
                        {entry
                          ? `You won't be charged ${PLANS[plan].price}. You keep access until ${formatDate(nextDate, true)}.`
                          : `No further charges. You keep access until ${formatDate(nextDate)}.`}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setConfirming(null)}
                          className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Keep it
                        </button>
                        <button
                          onClick={() => run(cancelMembership, 'Cancelled. You will not be charged again.')}
                          disabled={working}
                          className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {working && <Loader2 className="w-4 h-4 animate-spin" />} Yes, cancel
                        </button>
                      </div>
                    </div>
                  ) : confirming && typeof confirming === 'object' ? (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-900 mb-2">
                        Switch to {PLANS[confirming.switchTo].label} ({PLANS[confirming.switchTo].price}/{PLANS[confirming.switchTo].per})?
                      </h4>
                      <p className="text-sm text-teal-800 mb-4">
                        {entry
                          ? `Nothing changes today. On ${formatDate(nextDate, true)} you'll be charged ${PLANS[confirming.switchTo].price} instead of ${PLANS[plan].price}.`
                          : `You'll be charged ${PLANS.annual.price} today, less a credit for the unused part of this month. Then ${PLANS.annual.price} once a year.`}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setConfirming(null)}
                          className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Not now
                        </button>
                        <button
                          onClick={() => run(() => switchPlan(confirming.switchTo),
                            `You're now on the ${PLANS[confirming.switchTo].label.toLowerCase()} plan.`)}
                          disabled={working}
                          className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {working && <Loader2 className="w-4 h-4 animate-spin" />} Confirm
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {canSwitch && (
                        <button
                          onClick={() => setConfirming({ switchTo: other })}
                          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700"
                        >
                          {other === 'annual'
                            ? `Upgrade to Annual: ${PLANS.annual.price}/year (${PLANS.annual.note})`
                            : `Switch back to Monthly: ${PLANS.monthly.price}/month`}
                        </button>
                      )}
                      <button
                        onClick={() => setConfirming('cancel')}
                        className="w-full py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                      >
                        Cancel membership
                      </button>
                    </>
                  )}
                </div>
              )}

              {history.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full flex items-center justify-between py-3 text-gray-700 hover:text-gray-900"
                  >
                    <span className="flex items-center gap-2 font-medium"><History className="w-5 h-5" /> History</span>
                    {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {showHistory && (
                    <div className="mt-2 space-y-3 max-h-64 overflow-y-auto">
                      {history.map((e) => (
                        <div key={e.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 capitalize">{e.event_type.replace(/_/g, ' ')}</p>
                          {e.description && <p className="text-xs text-gray-600 mt-0.5">{e.description}</p>}
                          <p className="text-xs text-gray-400 mt-1">{formatDate(e.created_at, true)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={load}
                className="w-full mt-4 py-2 text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
