import React from 'react';
import { Search, X, BookOpen, ChevronRight } from 'lucide-react';
import { featuredVerses, allBooks, sampleScriptures } from '@/data/bibleData';

interface SearchResultsProps {
  query: string;
  onClose: () => void;
  onSelectResult: (reference: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, onClose, onSelectResult }) => {
  const lowerQuery = query.toLowerCase();

  // Search in featured verses
  const verseResults = featuredVerses.filter(
    (v) =>
      v.text.toLowerCase().includes(lowerQuery) ||
      v.reference.toLowerCase().includes(lowerQuery) ||
      v.theme.toLowerCase().includes(lowerQuery)
  );

  // Search in books
  const bookResults = allBooks.filter(
    (b) =>
      b.name.toLowerCase().includes(lowerQuery) ||
      b.abbr.toLowerCase().includes(lowerQuery)
  );

  // Search in sample scriptures
  const scriptureResults: { reference: string; verse: { number: number; text: string } }[] = [];
  Object.entries(sampleScriptures).forEach(([chapter, data]) => {
    data.verses.forEach((verse) => {
      if (verse.text.toLowerCase().includes(lowerQuery)) {
        scriptureResults.push({ reference: `${chapter}:${verse.number}`, verse });
      }
    });
  });

  const hasResults = verseResults.length > 0 || bookResults.length > 0 || scriptureResults.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#1a2332]/95 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Search className="w-6 h-6 text-[#d4af37]" />
            <h2 className="text-2xl font-serif font-bold text-[#f5f1e8]">
              Search Results for "{query}"
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#f5f1e8]/60 hover:text-[#d4af37] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!hasResults ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
              <Search className="w-8 h-8 text-[#d4af37]" />
            </div>
            <h3 className="text-lg font-medium text-[#f5f1e8] mb-2">No results found</h3>
            <p className="text-[#f5f1e8]/60">
              Try searching for a book name, verse reference, or keyword.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Book Results */}
            {bookResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#d4af37] mb-4">Books ({bookResults.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {bookResults.map((book) => (
                    <button
                      key={book.name}
                      onClick={() => onSelectResult(book.name)}
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-[#d4af37]" />
                        <span className="text-[#f5f1e8]">{book.name}</span>
                      </div>
                      <span className="text-xs text-[#f5f1e8]/40">{book.chapters} ch.</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Verse Results */}
            {verseResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#d4af37] mb-4">Featured Verses ({verseResults.length})</h3>
                <div className="space-y-3">
                  {verseResults.map((verse) => (
                    <button
                      key={verse.reference}
                      onClick={() => onSelectResult(verse.reference)}
                      className="w-full text-left p-4 bg-white/5 hover:bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-lg transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-[#d4af37] font-semibold">{verse.reference}</span>
                            <span className="px-2 py-0.5 bg-[#d4af37]/20 text-[#d4af37] text-xs rounded-full">
                              {verse.theme}
                            </span>
                          </div>
                          <p className="text-[#f5f1e8]/80 text-sm line-clamp-2 italic">"{verse.text}"</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#f5f1e8]/40 ml-4 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scripture Results */}
            {scriptureResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#d4af37] mb-4">
                  Scripture Matches ({scriptureResults.length})
                </h3>
                <div className="space-y-3">
                  {scriptureResults.slice(0, 10).map((result, index) => (
                    <button
                      key={`${result.reference}-${index}`}
                      onClick={() => onSelectResult(result.reference.split(':')[0])}
                      className="w-full text-left p-4 bg-white/5 hover:bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-lg transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="text-[#d4af37] font-semibold">{result.reference}</span>
                          <p className="text-[#f5f1e8]/80 text-sm mt-1 line-clamp-2">
                            {result.verse.text}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#f5f1e8]/40 ml-4 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                  {scriptureResults.length > 10 && (
                    <p className="text-center text-[#f5f1e8]/40 text-sm">
                      +{scriptureResults.length - 10} more results
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
