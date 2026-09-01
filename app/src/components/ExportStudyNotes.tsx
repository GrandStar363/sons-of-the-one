import React, { useState, useMemo, useRef } from 'react';
import { 
  Download, 
  FileText, 
  Printer, 
  Book, 
  Calendar, 
  Filter, 
  Bookmark, 
  Highlighter, 
  StickyNote,
  CheckSquare,
  X,
  ChevronDown
} from 'lucide-react';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { allBooks } from '@/data/bibleData';
import { featuredVerses } from '@/data/bibleData';

interface NoteWithDate {
  reference: string;
  content: string;
  dateAdded?: string;
}

interface BookmarkWithDate {
  reference: string;
  dateAdded?: string;
}

interface HighlightWithDate {
  reference: string;
  dateAdded?: string;
}

interface ExportStudyNotesProps {
  bookmarks: string[] | BookmarkWithDate[];
  highlights: string[] | HighlightWithDate[];
  notes: Record<string, string> | Record<string, NoteWithDate>;
  onClose?: () => void;
}

const ExportStudyNotes: React.FC<ExportStudyNotesProps> = ({
  bookmarks,
  highlights,
  notes,
  onClose
}) => {
  const [exportType, setExportType] = useState<'all' | 'notes' | 'bookmarks' | 'highlights'>('all');
  const [filterBook, setFilterBook] = useState<string>('all');
  const [dateRangeEnabled, setDateRangeEnabled] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Normalize data to include dates
  const normalizedBookmarks = useMemo(() => {
    return bookmarks.map(b => {
      if (typeof b === 'string') {
        return { reference: b, dateAdded: undefined };
      }
      return b;
    });
  }, [bookmarks]);

  const normalizedHighlights = useMemo(() => {
    return highlights.map(h => {
      if (typeof h === 'string') {
        return { reference: h, dateAdded: undefined };
      }
      return h;
    });
  }, [highlights]);

  const normalizedNotes = useMemo(() => {
    return Object.entries(notes).map(([ref, value]) => {
      if (typeof value === 'string') {
        return { reference: ref, content: value, dateAdded: undefined };
      }
      return { reference: ref, ...value };
    });
  }, [notes]);

  // Extract book name from reference
  const getBookFromReference = (reference: string): string => {
    // Handle references like "1 John 3:16", "Genesis 1:1", "Song of Solomon 2:1"
    const match = reference.match(/^(\d?\s?[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)/);
    if (match) {
      return match[1].trim();
    }
    return reference.split(' ')[0];
  };

  // Get unique books from all data
  const availableBooks = useMemo(() => {
    const books = new Set<string>();
    normalizedBookmarks.forEach(b => books.add(getBookFromReference(b.reference)));
    normalizedHighlights.forEach(h => books.add(getBookFromReference(h.reference)));
    normalizedNotes.forEach(n => books.add(getBookFromReference(n.reference)));
    
    // Sort by Bible order
    const bookOrder = allBooks.map(b => b.name);
    return Array.from(books).sort((a, b) => {
      const indexA = bookOrder.indexOf(a);
      const indexB = bookOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [normalizedBookmarks, normalizedHighlights, normalizedNotes]);

  // Filter data based on selections
  const filterByBookAndDate = <T extends { reference: string; dateAdded?: string }>(
    items: T[]
  ): T[] => {
    return items.filter(item => {
      // Filter by book
      if (filterBook !== 'all') {
        const itemBook = getBookFromReference(item.reference);
        if (itemBook !== filterBook) return false;
      }

      // Filter by date range
      if (dateRangeEnabled && startDate && endDate && item.dateAdded) {
        try {
          const itemDate = parseISO(item.dateAdded);
          const start = startOfDay(parseISO(startDate));
          const end = endOfDay(parseISO(endDate));
          if (!isWithinInterval(itemDate, { start, end })) return false;
        } catch {
          // If date parsing fails, include the item
        }
      }

      return true;
    });
  };

  const filteredBookmarks = useMemo(() => 
    filterByBookAndDate(normalizedBookmarks), 
    [normalizedBookmarks, filterBook, dateRangeEnabled, startDate, endDate]
  );

  const filteredHighlights = useMemo(() => 
    filterByBookAndDate(normalizedHighlights), 
    [normalizedHighlights, filterBook, dateRangeEnabled, startDate, endDate]
  );

  const filteredNotes = useMemo(() => 
    filterByBookAndDate(normalizedNotes), 
    [normalizedNotes, filterBook, dateRangeEnabled, startDate, endDate]
  );

  // Get verse text for a reference
  const getVerseText = (reference: string): string => {
    const verse = featuredVerses.find(v => v.reference === reference);
    return verse?.text || '';
  };

  // Generate text content for export
  const generateTextContent = (): string => {
    const lines: string[] = [];
    const currentDate = format(new Date(), 'MMMM d, yyyy');
    
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('                    PERSONAL BIBLE STUDY NOTES');
    lines.push('                     Sons of God Bible Study');
    lines.push(`                     Exported: ${currentDate}`);
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');

    if (filterBook !== 'all') {
      lines.push(`Filtered by Book: ${filterBook}`);
      lines.push('');
    }

    if (dateRangeEnabled && startDate && endDate) {
      lines.push(`Date Range: ${format(parseISO(startDate), 'MMM d, yyyy')} - ${format(parseISO(endDate), 'MMM d, yyyy')}`);
      lines.push('');
    }

    // Notes Section
    if ((exportType === 'all' || exportType === 'notes') && filteredNotes.length > 0) {
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('                         STUDY NOTES');
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('');

      // Group notes by book
      const notesByBook: Record<string, typeof filteredNotes> = {};
      filteredNotes.forEach(note => {
        const book = getBookFromReference(note.reference);
        if (!notesByBook[book]) notesByBook[book] = [];
        notesByBook[book].push(note);
      });

      Object.entries(notesByBook).forEach(([book, bookNotes]) => {
        lines.push(`📖 ${book}`);
        lines.push('');
        
        bookNotes.forEach(note => {
          lines.push(`  Reference: ${note.reference}`);
          if (note.dateAdded) {
            lines.push(`  Date Added: ${format(parseISO(note.dateAdded), 'MMMM d, yyyy')}`);
          }
          const verseText = getVerseText(note.reference);
          if (verseText) {
            lines.push(`  Verse: "${verseText}"`);
          }
          lines.push(`  Note: ${note.content}`);
          lines.push('');
        });
      });
    }

    // Bookmarks Section
    if ((exportType === 'all' || exportType === 'bookmarks') && filteredBookmarks.length > 0) {
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('                         BOOKMARKS');
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('');

      // Group bookmarks by book
      const bookmarksByBook: Record<string, typeof filteredBookmarks> = {};
      filteredBookmarks.forEach(bookmark => {
        const book = getBookFromReference(bookmark.reference);
        if (!bookmarksByBook[book]) bookmarksByBook[book] = [];
        bookmarksByBook[book].push(bookmark);
      });

      Object.entries(bookmarksByBook).forEach(([book, bookBookmarks]) => {
        lines.push(`📖 ${book}`);
        bookBookmarks.forEach(bookmark => {
          const dateStr = bookmark.dateAdded 
            ? ` (Added: ${format(parseISO(bookmark.dateAdded), 'MMM d, yyyy')})` 
            : '';
          lines.push(`  • ${bookmark.reference}${dateStr}`);
        });
        lines.push('');
      });
    }

    // Highlights Section
    if ((exportType === 'all' || exportType === 'highlights') && filteredHighlights.length > 0) {
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('                         HIGHLIGHTS');
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('');

      // Group highlights by book
      const highlightsByBook: Record<string, typeof filteredHighlights> = {};
      filteredHighlights.forEach(highlight => {
        const book = getBookFromReference(highlight.reference);
        if (!highlightsByBook[book]) highlightsByBook[book] = [];
        highlightsByBook[book].push(highlight);
      });

      Object.entries(highlightsByBook).forEach(([book, bookHighlights]) => {
        lines.push(`📖 ${book}`);
        bookHighlights.forEach(highlight => {
          const dateStr = highlight.dateAdded 
            ? ` (Added: ${format(parseISO(highlight.dateAdded), 'MMM d, yyyy')})` 
            : '';
          lines.push(`  ✦ ${highlight.reference}${dateStr}`);
        });
        lines.push('');
      });
    }

    // Summary
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('                           SUMMARY');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');
    if (exportType === 'all' || exportType === 'notes') {
      lines.push(`  Total Notes: ${filteredNotes.length}`);
    }
    if (exportType === 'all' || exportType === 'bookmarks') {
      lines.push(`  Total Bookmarks: ${filteredBookmarks.length}`);
    }
    if (exportType === 'all' || exportType === 'highlights') {
      lines.push(`  Total Highlights: ${filteredHighlights.length}`);
    }
    lines.push('');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('  "Your word is a lamp to my feet and a light to my path."');
    lines.push('                        - Psalm 119:105');
    lines.push('───────────────────────────────────────────────────────────────');

    return lines.join('\n');
  };

  // Export as text file
  const handleExportText = () => {
    const content = generateTextContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bible-study-notes-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export as PDF (using print)
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to export as PDF');
      return;
    }

    const currentDate = format(new Date(), 'MMMM d, yyyy');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bible Study Notes - ${currentDate}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Georgia, 'Times New Roman', serif; 
            line-height: 1.6; 
            color: #1a1a1a;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #d4af37;
          }
          .header h1 { 
            font-size: 28px; 
            color: #1a2332;
            margin-bottom: 8px;
          }
          .header p { 
            color: #666; 
            font-style: italic;
          }
          .filter-info {
            background: #f5f5f0;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-size: 14px;
            color: #666;
          }
          .section { margin-bottom: 32px; }
          .section-title { 
            font-size: 20px; 
            color: #14B8A6;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .book-group { margin-bottom: 24px; }
          .book-name { 
            font-size: 16px; 
            font-weight: bold;
            color: #F59E0B;
            margin-bottom: 12px;
          }
          .item { 
            margin-bottom: 16px; 
            padding: 12px 16px;
            background: #fafafa;
            border-left: 3px solid #14B8A6;
            border-radius: 0 8px 8px 0;
          }
          .item-reference { 
            font-weight: bold; 
            color: #1a2332;
            margin-bottom: 4px;
          }
          .item-date { 
            font-size: 12px; 
            color: #888;
            margin-bottom: 8px;
          }
          .item-verse {
            font-style: italic;
            color: #555;
            margin-bottom: 8px;
            padding: 8px;
            background: #fff;
            border-radius: 4px;
          }
          .item-note { color: #333; }
          .simple-item {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .summary {
            margin-top: 40px;
            padding: 20px;
            background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
            color: white;
            border-radius: 12px;
            text-align: center;
          }
          .summary h3 { margin-bottom: 12px; }
          .summary-stats { 
            display: flex; 
            justify-content: center; 
            gap: 24px;
            margin-bottom: 16px;
          }
          .stat { text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; }
          .stat-label { font-size: 12px; opacity: 0.9; }
          .footer {
            margin-top: 40px;
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #888;
            font-style: italic;
          }
          @media print {
            body { padding: 20px; }
            .item { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Personal Bible Study Notes</h1>
          <p>Sons of God Bible Study • Exported ${currentDate}</p>
        </div>

        ${filterBook !== 'all' || (dateRangeEnabled && startDate && endDate) ? `
          <div class="filter-info">
            ${filterBook !== 'all' ? `<strong>Book:</strong> ${filterBook}` : ''}
            ${filterBook !== 'all' && dateRangeEnabled ? ' • ' : ''}
            ${dateRangeEnabled && startDate && endDate ? `<strong>Date Range:</strong> ${format(parseISO(startDate), 'MMM d, yyyy')} - ${format(parseISO(endDate), 'MMM d, yyyy')}` : ''}
          </div>
        ` : ''}

        ${(exportType === 'all' || exportType === 'notes') && filteredNotes.length > 0 ? `
          <div class="section">
            <h2 class="section-title">📝 Study Notes</h2>
            ${Object.entries(
              filteredNotes.reduce((acc, note) => {
                const book = getBookFromReference(note.reference);
                if (!acc[book]) acc[book] = [];
                acc[book].push(note);
                return acc;
              }, {} as Record<string, typeof filteredNotes>)
            ).map(([book, bookNotes]) => `
              <div class="book-group">
                <div class="book-name">📖 ${book}</div>
                ${bookNotes.map(note => `
                  <div class="item">
                    <div class="item-reference">${note.reference}</div>
                    ${note.dateAdded ? `<div class="item-date">Added: ${format(parseISO(note.dateAdded), 'MMMM d, yyyy')}</div>` : ''}
                    ${getVerseText(note.reference) ? `<div class="item-verse">"${getVerseText(note.reference)}"</div>` : ''}
                    <div class="item-note">${note.content}</div>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(exportType === 'all' || exportType === 'bookmarks') && filteredBookmarks.length > 0 ? `
          <div class="section">
            <h2 class="section-title">🔖 Bookmarks</h2>
            ${Object.entries(
              filteredBookmarks.reduce((acc, bookmark) => {
                const book = getBookFromReference(bookmark.reference);
                if (!acc[book]) acc[book] = [];
                acc[book].push(bookmark);
                return acc;
              }, {} as Record<string, typeof filteredBookmarks>)
            ).map(([book, bookBookmarks]) => `
              <div class="book-group">
                <div class="book-name">📖 ${book}</div>
                ${bookBookmarks.map(bookmark => `
                  <div class="simple-item">
                    <strong>${bookmark.reference}</strong>
                    ${bookmark.dateAdded ? `<span style="color: #888; font-size: 12px;"> • Added: ${format(parseISO(bookmark.dateAdded), 'MMM d, yyyy')}</span>` : ''}
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(exportType === 'all' || exportType === 'highlights') && filteredHighlights.length > 0 ? `
          <div class="section">
            <h2 class="section-title">✨ Highlights</h2>
            ${Object.entries(
              filteredHighlights.reduce((acc, highlight) => {
                const book = getBookFromReference(highlight.reference);
                if (!acc[book]) acc[book] = [];
                acc[book].push(highlight);
                return acc;
              }, {} as Record<string, typeof filteredHighlights>)
            ).map(([book, bookHighlights]) => `
              <div class="book-group">
                <div class="book-name">📖 ${book}</div>
                ${bookHighlights.map(highlight => `
                  <div class="simple-item">
                    <strong>${highlight.reference}</strong>
                    ${highlight.dateAdded ? `<span style="color: #888; font-size: 12px;"> • Added: ${format(parseISO(highlight.dateAdded), 'MMM d, yyyy')}</span>` : ''}
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="summary">
          <h3>Export Summary</h3>
          <div class="summary-stats">
            ${exportType === 'all' || exportType === 'notes' ? `
              <div class="stat">
                <div class="stat-number">${filteredNotes.length}</div>
                <div class="stat-label">Notes</div>
              </div>
            ` : ''}
            ${exportType === 'all' || exportType === 'bookmarks' ? `
              <div class="stat">
                <div class="stat-number">${filteredBookmarks.length}</div>
                <div class="stat-label">Bookmarks</div>
              </div>
            ` : ''}
            ${exportType === 'all' || exportType === 'highlights' ? `
              <div class="stat">
                <div class="stat-number">${filteredHighlights.length}</div>
                <div class="stat-label">Highlights</div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="footer">
          "Your word is a lamp to my feet and a light to my path." - Psalm 119:105
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const totalItems = 
    (exportType === 'all' || exportType === 'notes' ? filteredNotes.length : 0) +
    (exportType === 'all' || exportType === 'bookmarks' ? filteredBookmarks.length : 0) +
    (exportType === 'all' || exportType === 'highlights' ? filteredHighlights.length : 0);

  return (
    <div className="bg-[#1a2332] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#d4af37]/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#f5f1e8]">Export Study Notes</h2>
              <p className="text-[#f5f1e8]/60">Download your personal Bible study collection</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-[#f5f1e8]/60 hover:text-[#f5f1e8] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      <div className="p-6 space-y-6">
        {/* Export Type Selection */}
        <div>
          <label className="block text-sm font-medium text-[#f5f1e8]/80 mb-3">
            What to Export
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'all', label: 'All', icon: CheckSquare },
              { id: 'notes', label: 'Notes', icon: StickyNote },
              { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
              { id: 'highlights', label: 'Highlights', icon: Highlighter },
            ].map(option => (
              <button
                key={option.id}
                onClick={() => setExportType(option.id as typeof exportType)}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border transition-all ${
                  exportType === option.id
                    ? 'bg-[#14B8A6]/20 border-[#14B8A6] text-[#5EEAD4]'
                    : 'bg-white/5 border-[#d4af37]/20 text-[#f5f1e8]/60 hover:border-[#d4af37]/40'
                }`}
              >
                <option.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Book Filter */}
        <div>
          <label className="block text-sm font-medium text-[#f5f1e8]/80 mb-3">
            <Book className="w-4 h-4 inline mr-2" />
            Filter by Book
          </label>
          <div className="relative">
            <button
              onClick={() => setShowBookDropdown(!showBookDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-[#d4af37]/20 rounded-xl text-[#f5f1e8] hover:border-[#d4af37]/40 transition-colors"
            >
              <span>{filterBook === 'all' ? 'All Books' : filterBook}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showBookDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showBookDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-[#1a2332] border border-[#d4af37]/20 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setFilterBook('all');
                    setShowBookDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-white/5 transition-colors ${
                    filterBook === 'all' ? 'text-[#14B8A6]' : 'text-[#f5f1e8]'
                  }`}
                >
                  All Books
                </button>
                {availableBooks.map(book => (
                  <button
                    key={book}
                    onClick={() => {
                      setFilterBook(book);
                      setShowBookDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-white/5 transition-colors ${
                      filterBook === book ? 'text-[#14B8A6]' : 'text-[#f5f1e8]'
                    }`}
                  >
                    {book}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-[#f5f1e8]/80">
              <Calendar className="w-4 h-4 inline mr-2" />
              Filter by Date Range
            </label>
            <button
              onClick={() => setDateRangeEnabled(!dateRangeEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                dateRangeEnabled ? 'bg-[#14B8A6]' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  dateRangeEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
          
          {dateRangeEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#f5f1e8]/60 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-[#d4af37]/20 rounded-lg text-[#f5f1e8] focus:outline-none focus:border-[#14B8A6]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#f5f1e8]/60 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-[#d4af37]/20 rounded-lg text-[#f5f1e8] focus:outline-none focus:border-[#14B8A6]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Preview Stats */}
        <div className="bg-gradient-to-r from-[#14B8A6]/10 to-[#F59E0B]/10 rounded-xl p-4 border border-[#14B8A6]/20">
          <h3 className="text-sm font-medium text-[#f5f1e8]/80 mb-3">Export Preview</h3>
          <div className="grid grid-cols-3 gap-4">
            {(exportType === 'all' || exportType === 'notes') && (
              <div className="text-center">
                <div className="text-2xl font-bold text-[#14B8A6]">{filteredNotes.length}</div>
                <div className="text-xs text-[#f5f1e8]/60">Notes</div>
              </div>
            )}
            {(exportType === 'all' || exportType === 'bookmarks') && (
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F59E0B]">{filteredBookmarks.length}</div>
                <div className="text-xs text-[#f5f1e8]/60">Bookmarks</div>
              </div>
            )}
            {(exportType === 'all' || exportType === 'highlights') && (
              <div className="text-center">
                <div className="text-2xl font-bold text-[#A855F7]">{filteredHighlights.length}</div>
                <div className="text-xs text-[#f5f1e8]/60">Highlights</div>
              </div>
            )}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleExportText}
            disabled={totalItems === 0}
            className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all ${
              totalItems > 0
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-lg shadow-blue-500/25'
                : 'bg-white/10 text-[#f5f1e8]/40 cursor-not-allowed'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Export as Text</span>
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={totalItems === 0}
            className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all ${
              totalItems > 0
                ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white hover:from-[#D97706] hover:to-[#B45309] shadow-lg shadow-amber-500/25'
                : 'bg-white/10 text-[#f5f1e8]/40 cursor-not-allowed'
            }`}
          >
            <Printer className="w-5 h-5" />
            <span>Export as PDF</span>
          </button>
        </div>

        {totalItems === 0 && (
          <p className="text-center text-[#f5f1e8]/50 text-sm">
            No items match your current filters. Try adjusting your selection.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExportStudyNotes;
