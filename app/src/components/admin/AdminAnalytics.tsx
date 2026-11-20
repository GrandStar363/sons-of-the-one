import React, { useState, useEffect } from 'react';
import {
  DollarSign, Users, RefreshCw, Calendar, Heart, ArrowUpRight, ArrowDownRight, Landmark,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Money and members, read live from Stripe by the admin-analytics function,
// so these numbers match Robert's Stripe dashboard (last 12 months).

type Kind = 'membership' | 'monthly_donation' | 'donation' | 'other';

interface Payment {
  id: string;
  kind: Kind;
  label: string;
  amount: number;
  fee: number;
  refunded: number;
  net: number;
  name: string | null;
  email: string | null;
  created_at: string;
}

interface Analytics {
  totalAmount: number;
  totalPayments: number;
  totalFees: number;
  totalRefunded: number;
  totalNet: number;
  membershipAmount: number;
  donationAmount: number;
  thisMonthAmount: number;
  thisMonthCount: number;
  lastMonthAmount: number;
  growthPercentage: number;
  monthlyTrends: { month: string; amount: number; memberships: number; donations: number; count: number }[];
  members: {
    active: number; firstDay: number; monthly: number; annual: number;
    cancelling: number; pastDue: number; monthlyDonors: number;
    membershipMrr: number; donationMrr: number;
  };
  topDonors: { email: string; name: string; total: number; count: number }[];
  recentPayments: Payment[];
}

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const BADGE: Record<Kind, string> = {
  membership: 'bg-purple-100 text-purple-700',
  monthly_donation: 'bg-green-100 text-green-700',
  donation: 'bg-emerald-100 text-emerald-700',
  other: 'bg-gray-100 text-gray-600',
};

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('admin-analytics', {
        body: { adminToken: localStorage.getItem('adminToken') },
      });
      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || 'Failed to fetch analytics');
      setAnalytics(data.analytics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm">Loading from Stripe…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error loading revenue</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={fetchAnalytics} className="mt-2 text-sm underline">Try again</button>
      </div>
    );
  }

  if (!analytics) return null;

  const a = analytics;
  const m = a.members;
  const maxTrend = Math.max(...a.monthlyTrends.map((t) => t.amount), 1);
  const growthUp = a.growthPercentage >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue &amp; Donations</h2>
          <p className="text-gray-500">Live from Stripe: memberships and donations, last 12 months</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Received</p>
              <p className="text-3xl font-bold mt-1">{money(a.totalAmount)}</p>
              <p className="text-purple-200 text-sm mt-1">
                {a.totalPayments} payment{a.totalPayments === 1 ? '' : 's'}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-purple-100">Stripe fees</span><span>−{money(a.totalFees)}</span></div>
            {a.totalRefunded > 0 && (
              <div className="flex justify-between"><span className="text-purple-100">Refunded</span><span>−{money(a.totalRefunded)}</span></div>
            )}
            <div className="flex justify-between font-semibold"><span>Net to bank</span><span>{money(a.totalNet)}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{money(a.thisMonthAmount)}</p>
              <p className="text-gray-400 text-sm mt-1">
                {a.thisMonthCount} payment{a.thisMonthCount === 1 ? '' : 's'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {growthUp
                  ? <ArrowUpRight className="w-4 h-4 text-green-500" />
                  : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                <span className={`text-sm font-medium ${growthUp ? 'text-green-600' : 'text-red-600'}`}>
                  {growthUp ? '+' : ''}{a.growthPercentage}%
                </span>
                <span className="text-gray-400 text-sm">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">Paying Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{m.active}</p>
              <p className="text-gray-400 text-sm mt-1">
                {m.monthly} monthly · {m.annual} yearly
              </p>
              {m.firstDay > 0 && (
                <p className="text-gray-400 text-sm">{m.firstDay} in their $1 first day</p>
              )}
              {m.cancelling > 0 && <p className="text-amber-600 text-sm">{m.cancelling} cancelling</p>}
              {m.pastDue > 0 && <p className="text-red-600 text-sm">{m.pastDue} payment failed</p>}
              <p className="text-gray-500 text-sm mt-1">≈ {money(m.membershipMrr)} / month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm">Donations</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{money(a.donationAmount)}</p>
              <p className="text-gray-400 text-sm mt-1">
                {m.monthlyDonors} monthly donor{m.monthlyDonors === 1 ? '' : 's'}
                {m.donationMrr > 0 && ` · ${money(m.donationMrr)} / month`}
              </p>
              <p className="text-gray-500 text-sm mt-1">Memberships: {money(a.membershipAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-500" />Memberships</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500" />Donations</span>
          </div>
        </div>
        <div className="h-64 flex items-end gap-1 sm:gap-2">
          {a.monthlyTrends.map((t) => (
            <div key={t.month} className="flex-1 min-w-0 flex flex-col items-center" title={`${t.month}: ${money(t.amount)} (${t.count} payments)`}>
              <span className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate max-w-full">
                {t.amount ? money(t.amount) : ''}
              </span>
              <div className="w-full flex flex-col-reverse rounded-t-md overflow-hidden bg-gray-100" style={{ height: `${Math.max((t.amount / maxTrend) * 180, 4)}px` }}>
                <div className="w-full bg-purple-500" style={{ height: `${t.amount ? (t.memberships / t.amount) * 100 : 0}%` }} />
                <div className="w-full bg-green-500" style={{ height: `${t.amount ? (t.donations / t.amount) * 100 : 0}%` }} />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-2 whitespace-nowrap">{t.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {a.recentPayments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No payments yet</p>
            ) : (
              a.recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{p.name || p.email || 'Anonymous'}</p>
                    {p.name && p.email && <p className="text-xs text-gray-400 truncate">{p.email}</p>}
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(p.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${BADGE[p.kind]}`}>{p.label}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gray-900">{money(p.amount)}</p>
                    <p className="text-xs text-gray-400">fee {money(p.fee)} · net {money(p.net)}</p>
                    {p.refunded > 0 && <p className="text-xs text-red-600">refunded {money(p.refunded)}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Donors */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Donors</h3>
          <div className="space-y-3">
            {a.topDonors.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No donations yet</p>
            ) : (
              a.topDonors.map((donor, index) => (
                <div key={donor.email || donor.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{donor.name}</p>
                      <p className="text-sm text-gray-500">{donor.count} donation{donor.count === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">{money(donor.total)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-gray-400">
        <Landmark className="w-4 h-4" />
        Same figures as the Stripe dashboard. Stripe pays the net amount out to the bank account on file.
      </p>
    </div>
  );
}
