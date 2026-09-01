import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Users, Eye, Clock, TrendingUp, RefreshCw, 
  Download, Filter, Calendar, Globe, Smartphone, Monitor,
  MousePointer, BookOpen, Brain, MessageSquare, Heart,
  Play, Search, ChevronDown, ChevronUp, User, MapPin,
  BarChart3, PieChart, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Analytics {
  totalActivities: number;
  uniqueUsers: number;
  uniqueSessions: number;
  activityByType: Record<string, number>;
  activityByCategory: Record<string, number>;
  activityByHour: Record<number, number>;
  activityByDay: Record<string, number>;
  topPages: { page: string; count: number }[];
  topUsers: any[];
  recentActivities: any[];
}

interface RealtimeData {
  activeUsers: number;
  activeSessions: number;
  recentActivities: any[];
  periodMinutes: number;
}

const activityIcons: Record<string, any> = {
  page_view: Eye,
  bible_read: BookOpen,
  trivia_play: Brain,
  devotional_read: Heart,
  prayer_submit: MessageSquare,
  audio_play: Play,
  search: Search,
  login: User,
  signup: User,
  feature_use: Zap,
  default: Activity
};

const categoryColors: Record<string, string> = {
  navigation: 'bg-blue-500',
  bible: 'bg-purple-500',
  trivia: 'bg-amber-500',
  devotional: 'bg-pink-500',
  community: 'bg-green-500',
  audio: 'bg-indigo-500',
  auth: 'bg-cyan-500',
  default: 'bg-gray-500'
};

export default function AdminActivityMonitor() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [realtime, setRealtime] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  const getDateRange = useCallback(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    return { startDate: startDate.toISOString(), endDate: now.toISOString() };
  }, [dateRange]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { startDate, endDate } = getDateRange();
      
      const { data, error: fnError } = await supabase.functions.invoke('activity-tracker', {
        body: { 
          action: 'get_analytics',
          startDate,
          endDate,
          limit: 100
        }
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || 'Failed to fetch analytics');

      setAnalytics(data.analytics);
    } catch (err: any) {
      setError(err.message);
    }
  }, [getDateRange]);

  const fetchRealtime = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('activity-tracker', {
        body: { action: 'get_realtime', minutes: 60 }
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || 'Failed to fetch realtime data');

      setRealtime(data.realtime);
    } catch (err: any) {
      console.error('Realtime fetch error:', err);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchAnalytics(), fetchRealtime()]);
    setLoading(false);
  }, [fetchAnalytics, fetchRealtime]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchRealtime();
    }, 30000); // Refresh realtime every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchRealtime]);

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const { startDate, endDate } = getDateRange();
      
      const { data, error } = await supabase.functions.invoke('activity-tracker', {
        body: { 
          action: 'export',
          startDate,
          endDate,
          format
        }
      });

      if (error) throw error;

      if (format === 'csv') {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }

      setShowExportModal(false);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    }
  };

  const getActivityIcon = (type: string) => {
    return activityIcons[type] || activityIcons.default;
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || categoryColors.default;
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

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
        <p className="font-medium">Error loading activity data</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadData} className="mt-2 text-sm underline">
          Try again
        </button>
      </div>
    );
  }

  const maxHourlyActivity = Math.max(...Object.values(analytics?.activityByHour || {}), 1);
  const maxDailyActivity = Math.max(...Object.values(analytics?.activityByDay || {}), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Monitor</h2>
          <p className="text-gray-500">Track all user activities across the platform</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Zap className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
            Live
          </button>

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg flex items-center gap-2 hover:bg-purple-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Now</p>
              <p className="text-3xl font-bold mt-1">{realtime?.activeUsers || 0}</p>
              <p className="text-green-200 text-sm mt-1">users online</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Activities</p>
              <p className="text-3xl font-bold mt-1">{analytics?.totalActivities?.toLocaleString() || 0}</p>
              <p className="text-purple-200 text-sm mt-1">in selected period</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Unique Visitors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics?.uniqueUsers || 0}</p>
              <p className="text-gray-400 text-sm mt-1">registered users</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Sessions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics?.uniqueSessions || 0}</p>
              <p className="text-gray-400 text-sm mt-1">total sessions</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            Activity by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics?.activityByCategory || {})
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => {
                const percentage = ((count / (analytics?.totalActivities || 1)) * 100).toFixed(1);
                return (
                  <div key={category} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
                    <span className="flex-1 text-gray-700 capitalize">{category}</span>
                    <span className="text-gray-500">{count.toLocaleString()}</span>
                    <span className="text-gray-400 text-sm w-16 text-right">{percentage}%</span>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Activity by Type
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics?.activityByType || {})
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([type, count]) => {
                const Icon = getActivityIcon(type);
                const percentage = (count / (analytics?.totalActivities || 1)) * 100;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="flex-1 text-gray-700 capitalize">{type.replace(/_/g, ' ')}</span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-500 w-16 text-right">{count.toLocaleString()}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Hourly Activity Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Activity by Hour (UTC)
        </h3>
        <div className="h-40 flex items-end gap-1">
          {Array.from({ length: 24 }, (_, hour) => {
            const count = analytics?.activityByHour?.[hour] || 0;
            const height = (count / maxHourlyActivity) * 100;
            return (
              <div key={hour} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t transition-all hover:from-purple-700 hover:to-indigo-600"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${hour}:00 - ${count} activities`}
                />
                {hour % 3 === 0 && (
                  <span className="text-xs text-gray-400 mt-1">{hour}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Daily Activity Trend
        </h3>
        <div className="h-48 flex items-end gap-2">
          {Object.entries(analytics?.activityByDay || {})
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-14) // Last 14 days
            .map(([date, count]) => {
              const height = (count / maxDailyActivity) * 100;
              const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <div key={date} className="flex-1 flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">{count}</span>
                  <div 
                    className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t transition-all hover:from-green-600 hover:to-emerald-500"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${date}: ${count} activities`}
                  />
                  <span className="text-xs text-gray-400 mt-1">{dayName}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            Top Pages
          </h3>
          <div className="space-y-3">
            {analytics?.topPages?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No page data yet</p>
            ) : (
              analytics?.topPages?.map((page, index) => (
                <div key={page.page} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="flex-1 text-gray-700 truncate font-mono text-sm">{page.page}</span>
                  <span className="text-gray-500 font-medium">{page.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Active Users */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Most Active Users
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {analytics?.topUsers?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No user activity yet</p>
            ) : (
              analytics?.topUsers?.map((user: any, index: number) => (
                <div key={user.userId} className="border border-gray-100 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedUser(expandedUser === user.userId ? null : user.userId)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-amber-600' :
                      'bg-purple-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.userId.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        Last active: {formatTimeAgo(user.lastActive)}
                      </p>
                    </div>
                    <span className="text-purple-600 font-semibold">{user.totalActivities}</span>
                    {expandedUser === user.userId ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {expandedUser === user.userId && (
                    <div className="px-3 pb-3 bg-gray-50">
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(user.activities || {}).map(([type, count]) => (
                          <div key={type} className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 capitalize">{type.replace(/_/g, ' ')}:</span>
                            <span className="font-medium">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Recent Activity Stream
          {autoRefresh && (
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full animate-pulse">
              Live
            </span>
          )}
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {analytics?.recentActivities?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            analytics?.recentActivities?.slice(0, 30).map((activity: any) => {
              const Icon = getActivityIcon(activity.activity_type);
              return (
                <div 
                  key={activity.id} 
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(activity.activity_category)}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {activity.activity_type?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.page_path || 'No page'} 
                      {activity.user_id && (
                        <span className="ml-2 text-purple-600">
                          User: {activity.user_id.slice(0, 8)}...
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {formatTimeAgo(activity.created_at)}
                    </p>
                    <p className="text-xs text-gray-300">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Activity Data</h3>
            <p className="text-gray-600 mb-6">
              Export all activity data for the selected date range ({dateRange}).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('json')}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Export as JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Export as CSV
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full mt-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
