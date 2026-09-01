import React, { useState, useEffect } from 'react';
import { Mail, Clock, User, MessageSquare, CheckCircle, AlertCircle, Loader2, RefreshCw, Eye, Reply, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  responded_at: string | null;
  response_notes: string | null;
}

interface AdminContactMessagesProps {
  adminId: string;
}

export default function AdminContactMessages({ adminId }: AdminContactMessagesProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new' | 'responded'>('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-contact-messages', {
        body: { action: 'list', adminToken: localStorage.getItem('adminToken') },
      });

      if (error) throw error;
      if (data && data.success === false) throw new Error(data.error);
      setMessages(data?.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsResponded = async (messageId: string) => {
    setUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-contact-messages', {
        body: {
          action: 'respond',
          messageId,
          responseNotes,
          adminToken: localStorage.getItem('adminToken'),
        },
      });

      if (error) throw error;
      if (data && data.success === false) throw new Error(data.error);

      setMessages(prev => prev.map(m =>
        m.id === messageId 
          ? { ...m, status: 'responded', responded_at: new Date().toISOString(), response_notes: responseNotes }
          : m
      ));
      setSelectedMessage(null);
      setResponseNotes('');
    } catch (err) {
      console.error('Error updating message:', err);
    } finally {
      setUpdating(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-contact-messages', {
        body: { action: 'delete', messageId, adminToken: localStorage.getItem('adminToken') },
      });

      if (error) throw error;
      if (data && data.success === false) throw new Error(data.error);

      setMessages(prev => prev.filter(m => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'new') return m.status === 'new';
    if (filter === 'responded') return m.status === 'responded';
    return true;
  });

  const newCount = messages.filter(m => m.status === 'new').length;
  const respondedCount = messages.filter(m => m.status === 'responded').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
              <p className="text-sm text-gray-500">Total Messages</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{newCount}</p>
              <p className="text-sm text-gray-500">Awaiting Response</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{respondedCount}</p>
              <p className="text-sm text-gray-500">Responded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'new', 'responded'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'new' && newCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  message.status === 'new' ? 'bg-amber-50/50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        message.status === 'new'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {message.status === 'new' ? 'New' : 'Responded'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{message.subject}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {message.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {message.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMessage(message);
                        setResponseNotes(message.response_notes || '');
                      }}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">From</label>
                  <p className="text-gray-900 font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                  <p className="text-gray-900">{selectedMessage.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Subject</label>
                  <p className="text-gray-900">{selectedMessage.subject}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
                  <p className="text-gray-900">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Message</label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
              
              {selectedMessage.status === 'new' ? (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Response Notes (Internal)</label>
                  <textarea
                    value={responseNotes}
                    onChange={(e) => setResponseNotes(e.target.value)}
                    placeholder="Add notes about your response..."
                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={3}
                  />
                  <div className="mt-4 flex gap-3">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      Reply via Email
                    </a>
                    <button
                      onClick={() => markAsResponded(selectedMessage.id)}
                      disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Mark as Responded
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Response Notes</label>
                  <div className="mt-1 p-4 bg-green-50 rounded-lg text-gray-700">
                    {selectedMessage.response_notes || 'No notes added'}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Responded on: {selectedMessage.responded_at ? new Date(selectedMessage.responded_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
