import React, { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  PenLine, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  BookHeart, 
  Sparkles,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useJournalEntries } from '@/hooks/useJournalEntries';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  type: 'reflection' | 'prayer' | 'note' | 'testimony';
  createdAt: string;
  updatedAt: string;
}

interface PersonalJournalProps {
  user: User | null;
  onOpenAuth: () => void;
}

const entryTypeConfig = {
  reflection: {
    label: 'Reflection',
    icon: BookHeart,
    color: 'text-[#F59E0B]',
    bgColor: 'from-[#F59E0B]/20 to-[#F59E0B]/5',
    borderColor: 'border-[#F59E0B]/30',
    placeholder: 'Write your spiritual reflection...'
  },
  prayer: {
    label: 'Prayer',
    icon: Sparkles,
    color: 'text-[#14B8A6]',
    bgColor: 'from-[#14B8A6]/20 to-[#14B8A6]/5',
    borderColor: 'border-[#14B8A6]/30',
    placeholder: 'Write your prayer...'
  },
  note: {
    label: 'Note',
    icon: PenLine,
    color: 'text-[#3B82F6]',
    bgColor: 'from-[#3B82F6]/20 to-[#3B82F6]/5',
    borderColor: 'border-[#3B82F6]/30',
    placeholder: 'Write your note...'
  },
  testimony: {
    label: 'Testimony',
    icon: BookHeart,
    color: 'text-[#EC4899]',
    bgColor: 'from-[#EC4899]/20 to-[#EC4899]/5',
    borderColor: 'border-[#EC4899]/30',
    placeholder: 'Share your testimony...'
  }
};

const PersonalJournal: React.FC<PersonalJournalProps> = ({ user, onOpenAuth }) => {
  // Entries live in public.journal_entries; localStorage is an offline cache.
  const [entries, setEntries] = useJournalEntries(user);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    type: 'reflection' as JournalEntry['type']
  });
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const autoResize = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (isAddingNew && textareaRef.current) {
      autoResize(textareaRef.current);
    }
  }, [newEntry.content, isAddingNew]);

  const handleAddEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newEntry.title.trim(),
      content: newEntry.content.trim(),
      type: newEntry.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEntries(prev => [entry, ...prev]);
    setNewEntry({ title: '', content: '', type: 'reflection' });
    setIsAddingNew(false);
  };

  const handleUpdateEntry = (id: string, updates: Partial<JournalEntry>) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id 
        ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
        : entry
    ));
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #14B8A6 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#14B8A6]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#14B8A6]/20 to-[#F59E0B]/20 rounded-full mb-6 border border-[#14B8A6]/30">
            <PenLine className="w-5 h-5 text-[#14B8A6]" />
            <span className="text-[#14B8A6] font-medium">Personal Journal</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
            Your <span className="font-bold italic text-[#F59E0B] text-glow-amber">Spiritual</span> Journey
          </h2>
          
          <p className="text-white/70 max-w-2xl mx-auto">
            Record your reflections, prayers, notes, and testimonies. 
            Click on any entry to edit it directly on the page.
          </p>
        </div>

        {/* Add New Entry Button or Form */}
        {!isAddingNew ? (
          <div className="mb-8 text-center">
            <button
              onClick={() => setIsAddingNew(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-bold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all glow-teal"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Entry</span>
            </button>
          </div>
        ) : (
          <div className="mb-8 bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#F59E0B]/5 rounded-3xl p-6 sm:p-8 border border-[#14B8A6]/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-bold text-white">New Entry</h3>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setNewEntry({ title: '', content: '', type: 'reflection' });
                }}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Entry Type Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(Object.keys(entryTypeConfig) as JournalEntry['type'][]).map(type => {
                const config = entryTypeConfig[type];
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setNewEntry(prev => ({ ...prev, type }))}
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                      newEntry.type === type
                        ? `bg-gradient-to-r ${config.bgColor} ${config.borderColor} ${config.color}`
                        : 'bg-[#0c1929]/50 border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Title Input */}
            <input
              type="text"
              value={newEntry.title}
              onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Entry title..."
              className="w-full px-4 py-3 bg-[#0c1929] border border-[#14B8A6]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all mb-4"
            />

            {/* Content Textarea */}
            <textarea
              ref={textareaRef}
              value={newEntry.content}
              onChange={(e) => {
                setNewEntry(prev => ({ ...prev, content: e.target.value }));
                autoResize(e.target);
              }}
              placeholder={entryTypeConfig[newEntry.type].placeholder}
              rows={4}
              className="w-full px-4 py-3 bg-[#0c1929] border border-[#14B8A6]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all resize-none"
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setNewEntry({ title: '', content: '', type: 'reflection' });
                }}
                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                disabled={!newEntry.title.trim() || !newEntry.content.trim()}
                className="inline-flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-bold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Save Entry</span>
              </button>
            </div>
          </div>
        )}

        {/* Entries List */}
        {entries.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-[#14B8A6]/5 via-[#0f2942] to-[#F59E0B]/5 rounded-3xl border border-[#14B8A6]/20">
            <BookHeart className="w-16 h-16 text-[#14B8A6]/50 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-white mb-2">No Entries Yet</h3>
            <p className="text-white/60 mb-6">
              Start documenting your spiritual journey by adding your first entry.
            </p>
            <button
              onClick={() => setIsAddingNew(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-bold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Entry</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => {
              const config = entryTypeConfig[entry.type];
              const Icon = config.icon;
              const isEditing = editingId === entry.id;
              const isExpanded = expandedEntries.has(entry.id);

              return (
                <div
                  key={entry.id}
                  className={`bg-gradient-to-br ${config.bgColor} rounded-2xl border ${config.borderColor} overflow-hidden transition-all`}
                >
                  {/* Entry Header */}
                  <div 
                    className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => !isEditing && toggleExpanded(entry.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={entry.title}
                            onChange={(e) => handleUpdateEntry(entry.id, { title: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0c1929] border border-[#14B8A6]/30 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-[#14B8A6]"
                          />
                        ) : (
                          <h4 className="text-lg font-serif font-bold text-white">{entry.title}</h4>
                        )}
                        <div className="flex items-center space-x-2 text-white/50 text-sm">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(entry.createdAt)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${config.color} bg-white/10`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          className="p-2 text-[#14B8A6] hover:bg-[#14B8A6]/20 rounded-lg transition-all"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(entry.id);
                              setExpandedEntries(prev => new Set([...prev, entry.id]));
                            }}
                            className="p-2 text-white/50 hover:text-[#14B8A6] hover:bg-[#14B8A6]/10 rounded-lg transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEntry(entry.id);
                            }}
                            className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {!isEditing && (
                        isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white/50" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/50" />
                        )
                      )}
                    </div>
                  </div>

                  {/* Entry Content */}
                  {(isExpanded || isEditing) && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                      {isEditing ? (
                        <textarea
                          ref={editTextareaRef}
                          value={entry.content}
                          onChange={(e) => {
                            handleUpdateEntry(entry.id, { content: e.target.value });
                            autoResize(e.target);
                          }}
                          className="w-full px-4 py-3 bg-[#0c1929] border border-[#14B8A6]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all resize-none min-h-[100px]"
                        />
                      ) : (
                        <div className="bg-[#0c1929]/50 rounded-xl p-4 border border-white/5">
                          <p className="text-white/80 whitespace-pre-wrap leading-relaxed font-serif">
                            {entry.content}
                          </p>
                        </div>
                      )}
                      
                      {entry.updatedAt !== entry.createdAt && (
                        <p className="text-white/40 text-xs mt-2">
                          Last edited: {formatDate(entry.updatedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Sync Notice */}
        {!user && entries.length > 0 && (
          <div className="mt-8 p-4 bg-gradient-to-r from-[#14B8A6]/10 to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-xl text-center">
            <p className="text-white/80 mb-3">
              Sign in to sync your journal entries across all your devices.
            </p>
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-medium rounded-lg hover:from-[#0D9488] hover:to-[#0F766E] transition-all glow-teal"
            >
              Sign In to Sync
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PersonalJournal;
