import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Crown, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  CreditCard,
  History,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';

interface SubscriptionHistory {
  id: string;
  event_type: string;
  plan_type: string;
  description: string;
  created_at: string;
  amount_cents?: number;
  currency?: string;
}

interface SubscriptionData {
  hasSubscription: boolean;
  status: string;
  planType: string;
  trialDaysRemaining: number;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  history: SubscriptionHistory[];
}

interface SubscriptionStatusProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSubscribe?: () => void;
}

export default function SubscriptionStatus({ isOpen, onClose, email, onSubscribe }: SubscriptionStatusProps) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelImmediately, setCancelImmediately] = useState(false);

  useEffect(() => {
    if (isOpen && email) {
      fetchSubscriptionStatus();
    }
  }, [isOpen, email]);

  const fetchSubscriptionStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-subscription-status', {
        body: { email }
      });
      
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      
      setSubscription(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('cancel-subscription', {
        body: { email, immediately: cancelImmediately }
      });
      
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      
      setShowCancelConfirm(false);
      await fetchSubscriptionStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'trialing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Free Trial
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Canceled
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            Past Due
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
            No Subscription
          </span>
        );
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'trial_started':
        return <Sparkles className="w-4 h-4 text-blue-500" />;
      case 'activated':
      case 'renewed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'canceled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'payment_failed':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 text-center text-white rounded-t-2xl">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Subscription Status</h2>
          <p className="text-amber-100 text-sm">{email}</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading subscription status...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchSubscriptionStatus}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : !subscription || subscription.status === 'none' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-6">
                You don't have an active subscription yet. Start your 3-day free trial today!
              </p>
              {onSubscribe && (
                <button
                  onClick={() => { onClose(); onSubscribe(); }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
                >
                  Start Free Trial
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Status Card */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 font-medium">Status</span>
                  {getStatusBadge(subscription.status)}
                </div>

                {subscription.planType && (
                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {subscription.planType} ({subscription.planType === 'annual' ? '$79.99/year' : '$9.99/month'})
                    </span>
                  </div>
                )}

                {/* Trial Days Remaining */}
                {subscription.status === 'trialing' && subscription.trialDaysRemaining > 0 && (
                  <div className="py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Trial Days Remaining
                      </span>
                      <span className="font-bold text-blue-600 text-lg">
                        {subscription.trialDaysRemaining} {subscription.trialDaysRemaining === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(subscription.trialDaysRemaining / 3) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Trial ends on {formatDate(subscription.trialEnd)}
                    </p>
                  </div>
                )}

                {/* Next Billing Date */}
                {subscription.currentPeriodEnd && subscription.status !== 'canceled' && (
                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {subscription.cancelAtPeriodEnd ? 'Access Until' : 'Next Billing Date'}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(subscription.currentPeriodEnd)}
                    </span>
                  </div>
                )}

                {/* Cancel at period end warning */}
                {subscription.cancelAtPeriodEnd && subscription.status !== 'canceled' && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-800 font-medium text-sm">Subscription Ending</p>
                        <p className="text-amber-700 text-xs mt-1">
                          Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. 
                          You'll continue to have access until then.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Member since */}
                {subscription.createdAt && (
                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <span className="text-gray-600">Member Since</span>
                    <span className="text-gray-900">{formatDate(subscription.createdAt)}</span>
                  </div>
                )}
              </div>

              {/* Cancel Subscription Button */}
              {subscription.hasSubscription && !subscription.cancelAtPeriodEnd && subscription.status !== 'canceled' && (
                <div className="mb-6">
                  {!showCancelConfirm ? (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                    >
                      Cancel Subscription
                    </button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-3">Cancel Subscription?</h4>
                      
                      <div className="space-y-2 mb-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="cancelType"
                            checked={!cancelImmediately}
                            onChange={() => setCancelImmediately(false)}
                            className="w-4 h-4 text-red-600"
                          />
                          <div>
                            <span className="text-gray-900 font-medium">Cancel at period end</span>
                            <p className="text-xs text-gray-600">Keep access until {formatDate(subscription.currentPeriodEnd)}</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="cancelType"
                            checked={cancelImmediately}
                            onChange={() => setCancelImmediately(true)}
                            className="w-4 h-4 text-red-600"
                          />
                          <div>
                            <span className="text-gray-900 font-medium">Cancel immediately</span>
                            <p className="text-xs text-gray-600">Lose access right away</p>
                          </div>
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Keep Subscription
                        </button>
                        <button
                          onClick={handleCancelSubscription}
                          disabled={canceling}
                          className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {canceling ? 'Canceling...' : 'Confirm Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Subscription History */}
              {subscription.history && subscription.history.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full flex items-center justify-between py-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <History className="w-5 h-5" />
                      Subscription History
                    </span>
                    {showHistory ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>

                  {showHistory && (
                    <div className="mt-2 space-y-3 max-h-64 overflow-y-auto">
                      {subscription.history.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="mt-0.5">
                            {getEventIcon(event.event_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {event.event_type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {event.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDateTime(event.created_at)}
                            </p>
                          </div>
                          {event.amount_cents && (
                            <span className="text-sm font-medium text-gray-900">
                              ${(event.amount_cents / 100).toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Refresh Button */}
              <button
                onClick={fetchSubscriptionStatus}
                className="w-full mt-4 py-2 text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Status
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
