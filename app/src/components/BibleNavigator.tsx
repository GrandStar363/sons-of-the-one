import React, { useState } from 'react';
import { Book, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { oldTestament, newTestament, allBooks } from '@/data/bibleData';

interface BibleNavigatorProps {
  onSelectBook: (book: string, chapter: number) => void;
  selectedBook: string | null;
  selectedChapter: number | null;
}

const BibleNavigator: React.FC<BibleNavigatorProps> = ({ onSelectBook, selectedBook, selectedChapter }) => {
  const [activeTestament, setActiveTestament] = useState<'old' | 'new'>('new');
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentBooks = activeTestament === 'old' ? oldTestament : newTestament;
  
  const filteredBooks = searchQuery
    ? allBooks.filter(book => 
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.abbr.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentBooks;

  const handleBookClick = (bookName: string) => {
    if (expandedBook === bookName) {
      setExpandedBook(null);
    } else {
      setExpandedBook(bookName);
    }
  };

  const handleChapterClick = (bookName: string, chapter: number) => {
    onSelectBook(bookName, chapter);
  };

  return (
    <div className="bg-[#4a5d4a] rounded-2xl border border-[#7c9a7a]/30 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-[#7c9a7a]/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#7c9a7a]/30 flex items-center justify-center">
            <Book className="w-5 h-5 text-[#9cb59c]" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#f5f0e6]">Scripture Navigator</h2>
            <p className="text-sm text-[#f5f0e6]/60">66 Books • KJV 1611</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#f5f0e6]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-[#7c9a7a]/20 rounded-lg text-[#f5f0e6] placeholder-[#f5f0e6]/40 focus:outline-none focus:border-[#9cb59c]/50 transition-colors"
          />
        </div>
      </div>

      {/* Testament Tabs */}
      {!searchQuery && (
        <div className="flex border-b border-[#7c9a7a]/20">
          <button
            onClick={() => setActiveTestament('old')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTestament === 'old'
                ? 'text-[#9cb59c] border-b-2 border-[#9cb59c] bg-[#7c9a7a]/10'
                : 'text-[#f5f0e6]/60 hover:text-[#f5f0e6]'
            }`}
          >
            Old Testament
            <span className="ml-2 text-xs opacity-60">(39)</span>
          </button>
          <button
            onClick={() => setActiveTestament('new')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTestament === 'new'
                ? 'text-[#9cb59c] border-b-2 border-[#9cb59c] bg-[#7c9a7a]/10'
                : 'text-[#f5f0e6]/60 hover:text-[#f5f0e6]'
            }`}
          >
            New Testament
            <span className="ml-2 text-xs opacity-60">(27)</span>
          </button>
        </div>
      )}

      {/* Books List */}
      <div className="max-h-[500px] overflow-y-auto">
        {filteredBooks.map((book) => (
          <div key={book.name} className="border-b border-[#7c9a7a]/10 last:border-b-0">
            <button
              onClick={() => handleBookClick(book.name)}
              className={`w-full flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-[#7c9a7a]/10 transition-colors ${
                selectedBook === book.name ? 'bg-[#7c9a7a]/15' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-[#9cb59c] text-xs font-mono w-10">{book.abbr}</span>
                <span className={`font-medium ${selectedBook === book.name ? 'text-[#9cb59c]' : 'text-[#f5f0e6]'}`}>
                  {book.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-[#f5f0e6]/40">{book.chapters} ch.</span>
                {expandedBook === book.name ? (
                  <ChevronDown className="w-4 h-4 text-[#9cb59c]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#f5f0e6]/40" />
                )}
              </div>
            </button>

            {/* Chapters Grid */}
            {expandedBook === book.name && (
              <div className="px-4 sm:px-6 pb-4 bg-[#7c9a7a]/10">
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 pt-2">
                  {Array.from({ length: book.chapters }, (_, i) => i + 1).map((chapter) => (
                    <button
                      key={chapter}
                      onClick={() => handleChapterClick(book.name, chapter)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        selectedBook === book.name && selectedChapter === chapter
                          ? 'bg-[#7c9a7a] text-[#f5f0e6]'
                          : 'bg-white/5 text-[#f5f0e6]/70 hover:bg-[#7c9a7a]/30 hover:text-[#9cb59c]'
                      }`}
                    >
                      {chapter}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BibleNavigator;
