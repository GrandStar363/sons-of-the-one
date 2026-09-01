import React, { useState, useEffect } from 'react';
import { 
  Users, Search, RefreshCw, Mail, Calendar, DollarSign, 
  ChevronLeft, ChevronRight, Eye, Crown, UserCheck, LogIn
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  is_subscribed: boolean;
  subscription_tier: string;
  total_donations: number;
  last_active: string;
  created_at: string;
}

interface UserStats {
  totalUsers: number;
  subscribedUsers: number;
  newUsersThisMonth: number;
  activeUsersThisWeek: number;
  totalDonations: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [impersonating, setImpersonating] = useState<string | null>(null);

  // Sign in as a member, for support and debugging.
  //
  // The session is minted by GoTrue's admin API on the server (admin-users ->
  // impersonate), which returns a one-time token hash. Exchanging it here via
  // verifyOtp yields a real, refreshable member session -- the same thing the
  // user would get by clicking a magic link.
  //
  // Server-side this requires a valid super_admin session, refuses to target
  // another admin account, and writes an entry to admin_audit_log.
  const loginAs = async (user: User) => {
    const confirmed = window.confirm(
      `Sign in as ${user.email}?\n\n` +
      `You will be signed out of the admin dashboard and will browse the site ` +
      `as this member. This action is recorded in the audit log.`
    );
    if (!confirmed) return;

    setImpersonating(user.email);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'impersonate',
          email: user.email,
          adminToken: localStorage.getItem('adminToken'),
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Could not start session');

      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: data.token_hash,
        type: 'magiclink',
      });
      if (otpError) throw otpError;

      // Drop the admin session so the two identities cannot be confused.
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/';
    } catch (err: any) {
      console.error('Impersonation failed:', err);
      window.alert(`Could not sign in as ${user.email}: ${err.message ?? err}`);
    } finally {
      setImpersonating(null);
    }
  };

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDonations, setUserDonations] = useState<any[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'list', page, limit: 20, search: search || undefined, adminToken: localStorage.getItem('adminToken') }
      });

      if (error) throw error;
      if (data?.success) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'stats', adminToken: localStorage.getItem('adminToken') }
      });

      if (error) throw error;
      if (data?.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchUserDetails = async (user: User) => {
    setSelectedUser(user);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'get', userId: user.id, adminToken: localStorage.getItem('adminToken') }
      });

      if (error) throw error;
      if (data?.success) {
        setUserDonations(data.donations);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500">View and manage registered users</p>
        </div>
        <button
          onClick={() => { fetchUsers(); fetchStats(); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.subscribedUsers}</p>
                <p className="text-sm text-gray-500">Subscribers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.newUsersThisMonth}</p>
                <p className="text-sm text-gray-500">New This Month</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsersThisWeek}</p>
                <p className="text-sm text-gray-500">Active This Week</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${stats.totalDonations.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Donated</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_subscribed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          <Crown className="w-3 h-3" />
                          {user.subscription_tier || 'Premium'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        ${parseFloat(String(user.total_donations || 0)).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_active 
                        ? new Date(user.last_active).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => fetchUserDetails(user)}
                        title="View details"
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => loginAs(user)}
                        disabled={impersonating === user.email}
                        title={`Sign in as ${user.email}`}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <LogIn className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {(selectedUser.name || selectedUser.email)[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {selectedUser.name || 'No name'}
                  </h4>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold text-gray-900">
                    {selectedUser.is_subscribed ? 'Premium' : 'Free'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Total Donated</p>
                  <p className="font-semibold text-gray-900">
                    ${parseFloat(String(selectedUser.total_donations || 0)).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Last Active</p>
                  <p className="font-semibold text-gray-900">
                    {selectedUser.last_active 
                      ? new Date(selectedUser.last_active).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>

              <h5 className="font-semibold text-gray-900 mb-3">Recent Donations</h5>
              {userDonations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No donations</p>
              ) : (
                <div className="space-y-2">
                  {userDonations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-600">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </span>
                      <span className="font-semibold text-purple-600">
                        ${parseFloat(donation.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
