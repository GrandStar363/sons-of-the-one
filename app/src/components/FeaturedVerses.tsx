import React, { useState } from 'react';
import { BookOpen, Copy, Check, Share2, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Globe } from 'lucide-react';
import { featuredVerses } from '@/data/bibleData';
import { useAppContext, BIBLE_VERSIONS } from '@/contexts/AppContext';
import ShareModal from './ShareModal';

interface BookmarkItem {
  reference: string;
  dateAdded: string;
}

interface FeaturedVersesProps {
  bookmarks: BookmarkItem[];
  onToggleBookmark: (reference: string) => void;
  onReadVerse: (reference: string) => void;
}

const FeaturedVerses: React.FC<FeaturedVersesProps> = ({ bookmarks, onToggleBookmark, onReadVerse }) => {

  const { selectedVersion, apiKeyConfigured } = useAppContext();
  const [currentPage, setCurrentPage] = useState(0);
  const [copiedVerse, setCopiedVerse] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState<{
    type: 'verse';
    title: string;
    text: string;
    reference: string;
    theme: string;
  } | null>(null);
  
  const versesPerPage = 4;
  const totalPages = Math.ceil(featuredVerses.length / versesPerPage);

  // Get the display version (KJV if API not configured for selected version)
  const displayVersion = selectedVersion.requiresApi && !apiKeyConfigured
    ? BIBLE_VERSIONS.find(v => v.isDefault) || selectedVersion
    : selectedVersion;

  const currentVerses = featuredVerses.slice(
    currentPage * versesPerPage,
    (currentPage + 1) * versesPerPage
  );

  const handleCopy = async (verse: typeof featuredVerses[0]) => {
    await navigator.clipboard.writeText(`"${verse.text}" - ${verse.reference} (${displayVersion.abbreviation})`);
    setCopiedVerse(verse.reference);
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  const handleShare = (verse: typeof featuredVerses[0]) => {
    setShareContent({
      type: 'verse',
      title: verse.reference,
      text: verse.text,
      reference: `${verse.reference} (${displayVersion.abbreviation})`,
      theme: verse.theme,
    });
    setShareModalOpen(true);
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0c1929] via-[#081018] to-[#0c1929]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="inline-block px-4 py-1 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-sm font-medium rounded-full">
                Sons of God
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-white/5 border border-white/20 rounded-full text-white/50 text-xs">
                <Globe className="w-3 h-3" />
                <span>{displayVersion.abbreviation}</span>
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-white">
              Key Scriptures on <span className="font-bold italic text-[#F59E0B] text-glow-amber">Sonship</span> & <span className="font-bold italic text-[#14B8A6] text-glow-teal">Discipleship</span>

            </h2>

            <p className="text-white/60 mt-2">
              Foundational verses about our identity as children of God
            </p>
          </div>

          {/* Pagination */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg bg-[#14B8A6]/20 text-[#14B8A6] disabled:opacity-30 hover:bg-[#14B8A6]/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-white/60 px-2">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-2 rounded-lg bg-[#14B8A6]/20 text-[#14B8A6] disabled:opacity-30 hover:bg-[#14B8A6]/30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Verses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentVerses.map((verse, index) => {
            const isBookmarked = bookmarks.some(b => b.reference === verse.reference);

            
            return (
              <div
                key={verse.reference}
                className="group bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 rounded-xl border border-[#14B8A6]/30 p-6 hover:shadow-lg hover:shadow-[#14B8A6]/20 hover:border-[#F59E0B]/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[#F59E0B] font-serif text-lg font-semibold">
                      {verse.reference}
                    </span>
                    <span className="ml-2 px-2 py-0.5 bg-[#14B8A6]/20 text-[#5EEAD4] text-xs rounded-full border border-[#14B8A6]/30">
                      {verse.theme}
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleBookmark(verse.reference)}
                    className={`p-2 rounded-lg transition-all ${
                      isBookmarked
                        ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white glow-amber'
                        : 'bg-[#F59E0B]/10 text-[#F59E0B]/60 hover:text-[#F59E0B] hover:bg-[#F59E0B]/20'
                    }`}
                  >
                    {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>

                <blockquote className="text-white font-serif text-lg leading-relaxed mb-6 italic">
                  "{verse.text}"
                </blockquote>

                <div className="flex items-center justify-between pt-4 border-t border-[#14B8A6]/20">
                  <button
                    onClick={() => onReadVerse(verse.reference)}
                    className="flex items-center space-x-2 text-white/70 hover:text-[#14B8A6] transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Read Context</span>
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(verse)}
                      className="p-2 text-white/50 hover:text-[#F59E0B] transition-colors"
                      title="Copy verse"
                    >
                      {copiedVerse === verse.reference ? (
                        <Check className="w-4 h-4 text-[#14B8A6]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleShare(verse)}
                      className="p-2 text-white/50 hover:text-[#3B82F6] transition-colors"
                      title="Share verse"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => onReadVerse('Romans 8')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-medium rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all shadow-lg glow-amber"
          >
            <BookOpen className="w-5 h-5" />
            <span>Study Romans 8 - The <span className="font-bold italic">Sonship</span> & <span className="font-bold italic">Discipleship</span> Chapter</span>
          </button>


        </div>
      </div>

      {/* Share Modal */}
      {shareContent && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setShareContent(null);
          }}
          content={shareContent}
        />
      )}
    </section>
  );
};

export default FeaturedVerses;
