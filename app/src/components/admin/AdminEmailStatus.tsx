import React, { useState, useEffect } from 'react';
import { 
  Mail, RefreshCw, CheckCircle, XCircle, Clock, 
  ChevronLeft, ChevronRight, RotateCcw, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EmailRecord {
  id: string;
  donor_name: string;
  donor_email: string;
  amount: string;
  receipt_sent: boolean;
  email_sent_at: string;
  email_send_error: string;
  email_send_attempts: number;
  created_at: string;
}

interface Stats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

export default function AdminEmailStatus() {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retrying, setRetrying] = useState<string | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-email-status', {
        body: { action: 'list', page, limit: 20, filterStatus: filterStatus === 'all' ? undefined : filterStatus, adminToken: localStorage.getItem('adminToken') }
      });

      if (error) throw error;
      if (data?.success) {
        setEmails(data.emails);
        setTotalPages(data.totalPages);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (donationId: string) => {
    setRetrying(donationId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-email-status', {
        body: { action: 'retry', donationId, adminToken: localStorage.getItem('adminToken') }
      });

      if (error) throw error;
      if (data?.success) {
        fetchEmails();
      } else {
        alert(data?.error || 'Failed to retry email');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to retry email');
    } finally {
      setRetrying(null);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [page, filterStatus]);

  const getStatusIcon = (email: EmailRecord) => {
    if (email.receipt_sent) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (email.email_send_error) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusBadge = (email: EmailRecord) => {
    if (email.receipt_sent) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          <CheckCircle className="w-3 h-3" />
          Sent
        </span>
      );
    }
    if (email.email_send_error) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
          <XCircle className="w-3 h-3" />
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Receipt Status</h2>
          <p className="text-gray-500">Monitor and manage donation receipt emails</p>
        </div>
        <button
          onClick={fetchEmails}
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
            className={`bg-white rounded-xl p-4 border-2 transition-colors text-left ${
              filterStatus === 'all' ? 'border-purple-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Emails</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => { setFilterStatus('sent'); setPage(1); }}
            className={`bg-white rounded-xl p-4 border-2 transition-colors text-left ${
              filterStatus === 'sent' ? 'border-green-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                <p className="text-sm text-gray-500">Sent</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => { setFilterStatus('failed'); setPage(1); }}
            className={`bg-white rounded-xl p-4 border-2 transition-colors text-left ${
              filterStatus === 'failed' ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                <p className="text-sm text-gray-500">Failed</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => { setFilterStatus('pending'); setPage(1); }}
            className={`bg-white rounded-xl p-4 border-2 transition-colors text-left ${
              filterStatus === 'pending' ? 'border-yellow-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Email List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No emails found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donation Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {emails.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(email)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">{email.donor_name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{email.donor_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        ${parseFloat(email.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(email.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {email.email_sent_at 
                        ? new Date(email.email_sent_at).toLocaleString()
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        email.email_send_attempts > 2 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {email.email_send_attempts || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {!email.receipt_sent && (
                        <button
                          onClick={() => handleRetry(email.id)}
                          disabled={retrying === email.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                        >
                          {retrying === email.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Error Details Row */}
        {emails.some(e => e.email_send_error) && (
          <div className="border-t border-gray-200 p-4 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Failed Emails Details</h4>
                <div className="mt-2 space-y-2">
                  {emails.filter(e => e.email_send_error).map(email => (
                    <div key={email.id} className="text-sm text-red-700">
                      <span className="font-medium">{email.donor_email}:</span>{' '}
                      {email.email_send_error}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Email Service Configuration</h4>
            <p className="text-sm text-blue-700 mt-1">
              Emails are sent via the Resend API. Make sure the <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> environment 
              variable is configured in your Supabase project for emails to be sent successfully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
