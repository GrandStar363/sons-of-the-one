import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, RefreshCw, 
  Calendar, CreditCard, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Analytics {
  totalAmount: number;
  totalDonations: number;
  thisMonthAmount: number;
  thisMonthCount: number;
  lastMonthAmount: number;
  growthPercentage: number;
  monthlyTrends: { month: string; amount: number; count: number }[];
  topDonors: { email: string; name: string; total: number; count: number }[];
  recentDonations: any[];
  activeRecurringCount: number;
  monthlyRecurringRevenue: number;
  averageDonation: number;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('admin-analytics', {
        body: { adminToken: localStorage.getItem('adminToken') }
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
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error loading analytics</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={fetchAnalytics} className="mt-2 text-sm underline">
          Try again
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  const maxTrendAmount = Math.max(...analytics.monthlyTrends.map(t => t.amount), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donation Analytics</h2>
          <p className="text-gray-500">Overview of donation performance and trends</p>
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Donations</p>
              <p className="text-3xl font-bold mt-1">${analytics.totalAmount.toLocaleString()}</p>
              <p className="text-purple-200 text-sm mt-1">{analytics.totalDonations} donations</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                ${analytics.thisMonthAmount.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {analytics.growthPercentage >= 0 ? (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 text-sm font-medium">
                      +{analytics.growthPercentage}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 text-sm font-medium">
                      {analytics.growthPercentage}%
                    </span>
                  </>
                )}
                <span className="text-gray-400 text-sm">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Recurring Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                ${analytics.monthlyRecurringRevenue.toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {analytics.activeRecurringCount} active subscribers
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Donation</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                ${parseFloat(String(analytics.averageDonation)).toFixed(2)}
              </p>
              <p className="text-gray-400 text-sm mt-1">per transaction</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
        <div className="h-64 flex items-end gap-2">
          {analytics.monthlyTrends.map((trend, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">
                  ${trend.amount.toLocaleString()}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-md transition-all duration-300 hover:from-purple-700 hover:to-indigo-600"
                  style={{
                    height: `${Math.max((trend.amount / maxTrendAmount) * 180, 4)}px`
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                {trend.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Donors */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Donors</h3>
          <div className="space-y-3">
            {analytics.topDonors.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No donors yet</p>
            ) : (
              analytics.topDonors.map((donor, index) => (
                <div
                  key={donor.email}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-amber-600' :
                      'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{donor.name}</p>
                      <p className="text-sm text-gray-500">{donor.count} donations</p>
                    </div>
                  </div>
                  <p className="font-semibold text-purple-600">
                    ${donor.total.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analytics.recentDonations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No donations yet</p>
            ) : (
              analytics.recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {donation.donor_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(donation.created_at).toLocaleDateString()}
                      {donation.is_recurring && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Recurring
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${parseFloat(donation.amount).toFixed(2)}
                    </p>
                    {donation.receipt_sent ? (
                      <span className="text-xs text-green-600">Receipt sent</span>
                    ) : (
                      <span className="text-xs text-yellow-600">Pending</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
