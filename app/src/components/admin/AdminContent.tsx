import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FileText, Plus, Edit2, Trash2, RefreshCw, 
  Save, X, Eye, EyeOff, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FeaturedVerse {
  id: string;
  reference: string;
  verse_text: string;
  translation: string;
  is_active: boolean;
  display_date: string;
  created_at: string;
}

interface Devotional {
  id: string;
  title: string;
  content: string;
  scripture_reference: string;
  scripture_text: string;
  author: string;
  is_published: boolean;
  publish_date: string;
  created_at: string;
}

interface AdminContentProps {
  adminId: string;
}

export default function AdminContent({ adminId }: AdminContentProps) {
  const [activeTab, setActiveTab] = useState<'verses' | 'devotionals'>('verses');
  const [verses, setVerses] = useState<FeaturedVerse[]>([]);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingVerse, setEditingVerse] = useState<Partial<FeaturedVerse> | null>(null);
  const [editingDevotional, setEditingDevotional] = useState<Partial<Devotional> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'verses') {
        const { data, error } = await supabase.functions.invoke('admin-content', {
        body: { contentType: 'verses', action: 'list', page, limit: 10, adminToken: localStorage.getItem('adminToken') }
        });
        if (error) throw error;
        if (data?.success) {
          setVerses(data.verses);
          setTotalPages(data.totalPages);
        }
      } else {
        const { data, error } = await supabase.functions.invoke('admin-content', {
        body: { contentType: 'devotionals', action: 'list', page, limit: 10, adminToken: localStorage.getItem('adminToken') }
        });
        if (error) throw error;
        if (data?.success) {
          setDevotionals(data.devotionals);
          setTotalPages(data.totalPages);
        }
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVerse = async () => {
    if (!editingVerse?.reference || !editingVerse?.verse_text) return;
    setSaving(true);
    try {
      const action = editingVerse.id ? 'update' : 'create';
      const { data, error } = await supabase.functions.invoke('admin-content', {
        body: { contentType: 'verses',
          action,
          contentId: editingVerse.id,
          contentData: editingVerse,
          adminId, adminToken: localStorage.getItem('adminToken') }
      });
      if (error) throw error;
      if (data?.success) {
        setEditingVerse(null);
        fetchContent();
      }
    } catch (err) {
      console.error('Error saving verse:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDevotional = async () => {
    if (!editingDevotional?.title || !editingDevotional?.content) return;
    setSaving(true);
    try {
      const action = editingDevotional.id ? 'update' : 'create';
      const { data, error } = await supabase.functions.invoke('admin-content', {
        body: { contentType: 'devotionals',
          action,
          contentId: editingDevotional.id,
          contentData: editingDevotional,
          adminId, adminToken: localStorage.getItem('adminToken') }
      });
      if (error) throw error;
      if (data?.success) {
        setEditingDevotional(null);
        fetchContent();
      }
    } catch (err) {
      console.error('Error saving devotional:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contentType: 'verses' | 'devotionals', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const { data, error } = await supabase.functions.invoke('admin-content', {
        body: { contentType, action: 'delete', contentId: id, adminToken: localStorage.getItem('adminToken') }
      });
      if (error) throw error;
      if (data?.success) {
        fetchContent();
      }
    } catch (err) {
      console.error('Error deleting content:', err);
    }
  };

  const handleToggleActive = async (verse: FeaturedVerse) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-content', {
        body: { contentType: 'verses',
          action: 'update',
          contentId: verse.id,
          contentData: { is_active: !verse.is_active, adminToken: localStorage.getItem('adminToken') }
        }
      });
      if (error) throw error;
      if (data?.success) {
        fetchContent();
      }
    } catch (err) {
      console.error('Error toggling verse:', err);
    }
  };

  const handleTogglePublished = async (devotional: Devotional) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-content', {
        body: { contentType: 'devotionals',
          action: 'update',
          contentId: devotional.id,
          contentData: { is_published: !devotional.is_published, adminToken: localStorage.getItem('adminToken') }
        }
      });
      if (error) throw error;
      if (data?.success) {
        fetchContent();
      }
    } catch (err) {
      console.error('Error toggling devotional:', err);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchContent();
  }, [activeTab]);

  useEffect(() => {
    fetchContent();
  }, [page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-500">Manage featured verses and devotionals</p>
        </div>
        <button
          onClick={fetchContent}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('verses')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'verses'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Featured Verses
        </button>
        <button
          onClick={() => setActiveTab('devotionals')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'devotionals'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-5 h-5" />
          Devotionals
        </button>
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          if (activeTab === 'verses') {
            setEditingVerse({ reference: '', verse_text: '', translation: 'KJV', is_active: true });
          } else {
            setEditingDevotional({ title: '', content: '', is_published: false });
          }
        }}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add {activeTab === 'verses' ? 'Verse' : 'Devotional'}
      </button>

      {/* Content List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : activeTab === 'verses' ? (
          verses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No featured verses yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {verses.map((verse) => (
                <div key={verse.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{verse.reference}</h4>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {verse.translation}
                        </span>
                        {verse.is_active ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 italic">"{verse.verse_text}"</p>
                      {verse.display_date && (
                        <p className="text-sm text-gray-400 mt-2">
                          Display date: {new Date(verse.display_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(verse)}
                        className={`p-2 rounded-lg transition-colors ${
                          verse.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={verse.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {verse.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => setEditingVerse(verse)}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete('verses', verse.id)}
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
          )
        ) : devotionals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No devotionals yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {devotionals.map((devotional) => (
              <div key={devotional.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{devotional.title}</h4>
                      {devotional.is_published ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 line-clamp-2">{devotional.content}</p>
                    {devotional.scripture_reference && (
                      <p className="text-sm text-purple-600 mt-2">{devotional.scripture_reference}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      {devotional.author && <span>By {devotional.author}</span>}
                      {devotional.publish_date && (
                        <span>Publish: {new Date(devotional.publish_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublished(devotional)}
                      className={`p-2 rounded-lg transition-colors ${
                        devotional.is_published
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                      title={devotional.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {devotional.is_published ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setEditingDevotional(devotional)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete('devotionals', devotional.id)}
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
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Verse Modal */}
      {editingVerse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingVerse.id ? 'Edit Verse' : 'Add New Verse'}
              </h3>
              <button onClick={() => setEditingVerse(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input
                  type="text"
                  value={editingVerse.reference || ''}
                  onChange={(e) => setEditingVerse({ ...editingVerse, reference: e.target.value })}
                  placeholder="e.g., John 3:16"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verse Text</label>
                <textarea
                  value={editingVerse.verse_text || ''}
                  onChange={(e) => setEditingVerse({ ...editingVerse, verse_text: e.target.value })}
                  placeholder="Enter the verse text..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                  <select
                    value={editingVerse.translation || 'KJV'}
                    onChange={(e) => setEditingVerse({ ...editingVerse, translation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="KJV">KJV</option>
                    <option value="NIV">NIV</option>
                    <option value="ESV">ESV</option>
                    <option value="NKJV">NKJV</option>
                    <option value="NLT">NLT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Date</label>
                  <input
                    type="date"
                    value={editingVerse.display_date || ''}
                    onChange={(e) => setEditingVerse({ ...editingVerse, display_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingVerse.is_active ?? true}
                  onChange={(e) => setEditingVerse({ ...editingVerse, is_active: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm text-gray-700">Active (visible to users)</span>
              </label>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setEditingVerse(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVerse}
                disabled={saving || !editingVerse.reference || !editingVerse.verse_text}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Devotional Modal */}
      {editingDevotional && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDevotional.id ? 'Edit Devotional' : 'Add New Devotional'}
              </h3>
              <button onClick={() => setEditingDevotional(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingDevotional.title || ''}
                  onChange={(e) => setEditingDevotional({ ...editingDevotional, title: e.target.value })}
                  placeholder="Enter devotional title..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={editingDevotional.content || ''}
                  onChange={(e) => setEditingDevotional({ ...editingDevotional, content: e.target.value })}
                  placeholder="Write your devotional content..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scripture Reference</label>
                  <input
                    type="text"
                    value={editingDevotional.scripture_reference || ''}
                    onChange={(e) => setEditingDevotional({ ...editingDevotional, scripture_reference: e.target.value })}
                    placeholder="e.g., Psalm 23:1-6"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={editingDevotional.author || ''}
                    onChange={(e) => setEditingDevotional({ ...editingDevotional, author: e.target.value })}
                    placeholder="Author name"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scripture Text</label>
                <textarea
                  value={editingDevotional.scripture_text || ''}
                  onChange={(e) => setEditingDevotional({ ...editingDevotional, scripture_text: e.target.value })}
                  placeholder="Enter the scripture text..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                  <input
                    type="date"
                    value={editingDevotional.publish_date || ''}
                    onChange={(e) => setEditingDevotional({ ...editingDevotional, publish_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 pb-2">
                    <input
                      type="checkbox"
                      checked={editingDevotional.is_published ?? false}
                      onChange={(e) => setEditingDevotional({ ...editingDevotional, is_published: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Published</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setEditingDevotional(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDevotional}
                disabled={saving || !editingDevotional.title || !editingDevotional.content}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
