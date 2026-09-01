import React, { useState } from 'react';
import { Bookmark, Trash2, Copy, Check, Search, Tag, Download, X, Calendar } from 'lucide-react';
import { featuredVerses } from '@/data/bibleData';
import ExportStudyNotes from './ExportStudyNotes';
import { format, parseISO } from 'date-fns';

interface BookmarkItem {
  reference: string;
  dateAdded: string;
}

interface HighlightItem {
  reference: string;
  dateAdded: string;
}

interface NoteItem {
  text: string;
  dateAdded: string;
}

interface BookmarksSectionProps {
  bookmarks: BookmarkItem[];
  highlights: HighlightItem[];
  notes: Record<string, NoteItem>;
  onRemoveBookmark: (reference: string) => void;
  onRemoveHighlight: (reference: string) => void;
  onRemoveNote: (reference: string) => void;
  onNavigateToVerse: (reference: string) => void;
}

const BookmarksSection: React.FC<BookmarksSectionProps> = ({
  bookmarks,
  highlights,
  notes,
  onRemoveBookmark,
  onRemoveHighlight,
  onRemoveNote,
  onNavigateToVerse,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'highlights' | 'notes'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleCopy = async (reference: string) => {
    const verse = featuredVerses.find(v => v.reference === reference);
    const text = verse ? `"${verse.text}" - ${reference} (KJV 1611)` : reference;
    await navigator.clipboard.writeText(text);
    setCopiedItem(reference);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return null;
    }
  };

  const filteredBookmarks = bookmarks.filter(b => 
    b.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHighlights = highlights.filter(h => 
    h.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotes = Object.entries(notes).filter(([ref]) => 
    ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'bookmarks' as const, label: 'Bookmarks', count: bookmarks.length, icon: Bookmark },
    { id: 'highlights' as const, label: 'Highlights', count: highlights.length, icon: Tag },
    { id: 'notes' as const, label: 'Notes', count: Object.keys(notes).length, icon: Tag },
  ];

  const totalItems = bookmarks.length + highlights.length + Object.keys(notes).length;

  const renderEmptyState = (type: string) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
        <Bookmark className="w-8 h-8 text-[#d4af37]" />
      </div>
      <h3 className="text-lg font-medium text-[#f5f1e8] mb-2">No {type} yet</h3>
      <p className="text-[#f5f1e8]/60 max-w-sm mx-auto">
        Start reading scripture and save verses that speak to your heart.
      </p>
    </div>
  );

  return (
    <>
      <div className="bg-[#1a2332] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#d4af37]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#f5f1e8]">My Collection</h2>
              <p className="text-[#f5f1e8]/60">Your saved verses and notes</p>
            </div>
            
            {/* Export Button */}
            {totalItems > 0 && (
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-medium rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all shadow-lg shadow-teal-500/25"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Notes</span>
                <span className="sm:hidden">Export</span>
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#f5f1e8]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your collection..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-[#d4af37]/20 rounded-lg text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37]/50 transition-colors"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#d4af37]/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37] bg-[#d4af37]/5'
                  : 'text-[#f5f1e8]/60 hover:text-[#f5f1e8]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-[#d4af37] text-[#1a2332]' : 'bg-white/10'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[500px] overflow-y-auto">
          {activeTab === 'bookmarks' && (
            filteredBookmarks.length === 0 ? renderEmptyState('bookmarks') : (
              <div className="divide-y divide-[#d4af37]/10">
                {filteredBookmarks.map((bookmark) => (
                  <div key={bookmark.reference} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => onNavigateToVerse(bookmark.reference)}
                        className="text-left flex-1"
                      >
                        <h4 className="font-medium text-[#d4af37] hover:underline">{bookmark.reference}</h4>
                        <p className="text-sm text-[#f5f1e8]/60 mt-1">
                          {featuredVerses.find(v => v.reference === bookmark.reference)?.text.slice(0, 100)}...
                        </p>
                        {bookmark.dateAdded && (
                          <p className="text-xs text-[#f5f1e8]/40 mt-2 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Added {formatDate(bookmark.dateAdded)}</span>
                          </p>
                        )}
                      </button>
                      <div className="flex items-center space-x-1 ml-4">
                        <button
                          onClick={() => handleCopy(bookmark.reference)}
                          className="p-2 text-[#f5f1e8]/40 hover:text-[#d4af37] transition-colors"
                        >
                          {copiedItem === bookmark.reference ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => onRemoveBookmark(bookmark.reference)}
                          className="p-2 text-[#f5f1e8]/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'highlights' && (
            filteredHighlights.length === 0 ? renderEmptyState('highlights') : (
              <div className="divide-y divide-[#d4af37]/10">
                {filteredHighlights.map((highlight) => (
                  <div key={highlight.reference} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => onNavigateToVerse(highlight.reference)}
                        className="text-left flex-1"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                          <h4 className="font-medium text-[#f5f1e8] hover:text-[#d4af37]">{highlight.reference}</h4>
                        </div>
                        {highlight.dateAdded && (
                          <p className="text-xs text-[#f5f1e8]/40 mt-2 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Added {formatDate(highlight.dateAdded)}</span>
                          </p>
                        )}
                      </button>
                      <button
                        onClick={() => onRemoveHighlight(highlight.reference)}
                        className="p-2 text-[#f5f1e8]/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'notes' && (
            filteredNotes.length === 0 ? renderEmptyState('notes') : (
              <div className="divide-y divide-[#d4af37]/10">
                {filteredNotes.map(([reference, noteData]) => (
                  <div key={reference} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => onNavigateToVerse(reference)}
                        className="text-left flex-1"
                      >
                        <h4 className="font-medium text-[#d4af37] hover:underline mb-2">{reference}</h4>
                        <p className="text-sm text-[#f5f1e8]/80 bg-white/5 p-3 rounded-lg">{noteData.text}</p>
                        {noteData.dateAdded && (
                          <p className="text-xs text-[#f5f1e8]/40 mt-2 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Added {formatDate(noteData.dateAdded)}</span>
                          </p>
                        )}
                      </button>
                      <button
                        onClick={() => onRemoveNote(reference)}
                        className="p-2 text-[#f5f1e8]/40 hover:text-red-400 transition-colors ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Export Tip */}
        {totalItems > 0 && (
          <div className="p-4 bg-gradient-to-r from-[#14B8A6]/10 to-[#F59E0B]/10 border-t border-[#14B8A6]/20">
            <p className="text-center text-[#f5f1e8]/60 text-sm">
              <Download className="w-4 h-4 inline mr-1" />
              Export your study notes as PDF or text file for offline access
            </p>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ExportStudyNotes
              bookmarks={bookmarks}
              highlights={highlights}
              notes={notes}
              onClose={() => setShowExportModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BookmarksSection;
