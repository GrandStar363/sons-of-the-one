import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Check, X, RefreshCw, Clock, CheckCircle, 
  XCircle, ChevronLeft, ChevronRight, Trash2, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PrayerRequest {
  id: string;
  user_email: string;
  user_name: string;
  request_text: string;
  is_anonymous: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string;
  created_at: string;
  moderated_at: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface AdminPrayerRequestsProps {
  adminId: string;
}

export default function AdminPrayerRequests({ adminId }: AdminPrayerRequestsProps) {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [moderating, setModerating] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; reason: string } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-prayer-requests', {
        body: { action: 'list', page, limit: 20, filterStatus, adminToken: localStorage.getItem('adminToken') }
      });

      if (error) throw error;
      if (data?.success) {
        setRequests(data.requests);
        setTotalPages(data.totalPages);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching prayer requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (requestId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    setModerating(requestId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-prayer-requests', {
        body: { action: 'moderate', requestId, adminId, status, rejectionReason, adminToken: localStorage.getItem('adminToken') }
      });

      if (error) throw error;
      if (data?.success) {
        fetchRequests();
        setRejectModal(null);
      }
    } catch (err) {
      console.error('Error moderating request:', err);
    } finally {
      setModerating(null);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this prayer request?')) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-prayer-requests', {
        body: { action: 'delete', requestId, adminToken: localStorage.getItem('adminToken') }
      });

      if (error) throw error;
      if (data?.success) {
        fetchRequests();
      }
    } catch (err) {
      console.error('Error deleting request:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prayer Request Moderation</h2>
          <p className="text-gray-500">Review and approve prayer requests from the community</p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => { setFilterStatus('all'); setPage(1); }}
            className={`bg-white rounded-xl p-4 border-2 transition-colors ${
              filterStatus === 'all' ? 'border-purple-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Requests</p>
          </button>
          <button
            onClick={() => { setFilterStatus('pending'); setPage(1); }}
            className={`bg-white rounded-xl p-4 border-2 transition-colors ${
              filterStatus === 'pending' ? 'border-yellow-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending Review</p>
          </button>
          <button
            onClick={() => { setFilterStatus('approved'); setPage(1); }}
            className={`bg-white rounded-xl p-4 border-2 transition-colors ${
              filterStatus === 'approved' ? 'border-green-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-gray-500">Approved</p>
          </button>
          <button
            onClick={() => { setFilterStatus('rejected'); setPage(1); }}
            className={`bg-white rounded-xl p-4 border-2 transition-colors ${
              filterStatus === 'rejected' ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-gray-500">Rejected</p>
          </button>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No prayer requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(request.status)}
                      <span className="text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()} at{' '}
                        {new Date(request.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-2">{request.request_text}</p>
                    <p className="text-sm text-gray-500">
                      From: {request.is_anonymous ? 'Anonymous' : (request.user_name || request.user_email || 'Unknown')}
                    </p>
                    {request.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Rejection reason:</strong> {request.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleModerate(request.id, 'approved')}
                          disabled={moderating === request.id}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          {moderating === request.id ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <Check className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: request.id, reason: '' })}
                          disabled={moderating === request.id}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Reject Prayer Request</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this prayer request (optional):
            </p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows={3}
            />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerate(rejectModal.id, 'rejected', rejectModal.reason)}
                disabled={moderating === rejectModal.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {moderating === rejectModal.id ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
