import React, { useState } from 'react';
import { 
  Bookmark, BookmarkCheck, Copy, Check, Share2, ChevronLeft, ChevronRight, 
  Highlighter, MessageSquare, Globe, Link2, Map, ChevronDown, ChevronUp,
  X, Layers
} from 'lucide-react';
import { sampleScriptures } from '@/data/bibleData';
import { useAppContext, BIBLE_VERSIONS } from '@/contexts/AppContext';
import ShareModal from './ShareModal';
import CrossReferencePanel from './CrossReferencePanel';
import VerseConnectionMap from './VerseConnectionMap';
import { getCrossReferences } from '@/data/crossReferences';
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

interface ScriptureReaderProps {
  book: string;
  chapter: number;
  bookmarks: BookmarkItem[];
  highlights: HighlightItem[];
  notes: Record<string, NoteItem>;
  onToggleBookmark: (reference: string) => void;
  onToggleHighlight: (reference: string) => void;
  onAddNote: (reference: string, note: string) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}


const ScriptureReader: React.FC<ScriptureReaderProps> = ({
  book,
  chapter,
  bookmarks,
  highlights,
  notes,
  onToggleBookmark,
  onToggleHighlight,
  onAddNote,
  onNavigate,
}) => {
  const { selectedVersion, apiKeyConfigured } = useAppContext();
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState<{
    type: 'verse';
    title: string;
    text: string;
    reference: string;
    theme?: string;
  } | null>(null);
  
  // Cross-reference state
  const [showCrossReferences, setShowCrossReferences] = useState(false);
  const [crossRefVerse, setCrossRefVerse] = useState<{ reference: string; text: string } | null>(null);
  const [showConnectionMap, setShowConnectionMap] = useState(false);

  // Get the display version (KJV if API not configured for selected version)
  const displayVersion = selectedVersion.requiresApi && !apiKeyConfigured
    ? BIBLE_VERSIONS.find(v => v.isDefault) || selectedVersion
    : selectedVersion;

  const chapterKey = `${book} ${chapter}`;
  const scriptureData = sampleScriptures[chapterKey];

  const handleCopyVerse = async (verseNum: number, text: string) => {
    const reference = `${book} ${chapter}:${verseNum}`;
    await navigator.clipboard.writeText(`"${text}" - ${reference} (${displayVersion.abbreviation})`);
    setCopiedVerse(verseNum);
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  const handleShareVerse = (verseNum: number, text: string) => {
    const reference = `${book} ${chapter}:${verseNum}`;
    setShareContent({
      type: 'verse',
      title: reference,
      text: text,
      reference: `${reference} (${displayVersion.abbreviation})`,
    });
    setShareModalOpen(true);
  };

  const handleShowCrossReferences = (verseNum: number, text: string) => {
    const reference = `${book} ${chapter}:${verseNum}`;
    setCrossRefVerse({ reference, text });
    setShowCrossReferences(true);
  };

  const handleSaveNote = (verseNum: number) => {
    if (noteText.trim()) {
      const reference = `${book} ${chapter}:${verseNum}`;
      onAddNote(reference, noteText);
      setNoteText('');
      setShowNoteInput(null);
    }
  };

  const getVerseReference = (verseNum: number) => `${book} ${chapter}:${verseNum}`;

  // Check if verse has cross-references
  const hasCrossReferences = (verseNum: number): boolean => {
    const reference = `${book} ${chapter}:${verseNum}`;
    return getCrossReferences(reference).length > 0;
  };

  if (!scriptureData) {
    return (
      <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#14B8A6]/20 to-[#0D9488]/20 flex items-center justify-center">
          <Bookmark className="w-8 h-8 text-[#14B8A6]" />
        </div>
        <h3 className="text-xl font-serif font-bold text-white mb-2">{book} {chapter}</h3>
        
        {/* Version Indicator */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-white/5 border border-white/20 rounded-full text-white/60 text-xs">
            <Globe className="w-3 h-3" />
            <span>{displayVersion.abbreviation}</span>
            {selectedVersion.id !== displayVersion.id && (
              <span className="text-amber-400">(default)</span>
            )}
          </span>
        </div>
        
        <p className="text-white/60 mb-6">
          This chapter is available in the full {displayVersion.abbreviation} Bible. 
          <br />
          Select Romans 8, John 1, Galatians 3, Genesis 1, Psalm 23, Matthew 5, or Revelation 21 for sample content.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => onNavigate('prev')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <button
            onClick={() => onNavigate('next')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white rounded-lg hover:from-[#0D9488] hover:to-[#0F766E] transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Scripture Reader */}
        <div className={`${showCrossReferences ? 'lg:w-3/5' : 'w-full'} transition-all duration-300`}>
          <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl overflow-hidden">
            {/* Chapter Header */}
            <div className="bg-gradient-to-r from-[#14B8A6]/20 to-[#3B82F6]/20 px-6 py-4 flex items-center justify-between border-b border-[#14B8A6]/20">
              <button
                onClick={() => onNavigate('prev')}
                className="p-2 text-white/60 hover:text-[#14B8A6] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h2 className="text-xl font-serif font-bold text-white">{book}</h2>
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-sm text-[#14B8A6]">Chapter {chapter}</p>
                  <span className="text-white/30">•</span>
                  <span className="flex items-center space-x-1 text-xs text-white/50">
                    <Globe className="w-3 h-3" />
                    <span>{displayVersion.abbreviation}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowConnectionMap(true)}
                  className="p-2 text-white/60 hover:text-[#14B8A6] transition-colors"
                  title="View Connection Map"
                >
                  <Map className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('next')}
                  className="p-2 text-white/60 hover:text-[#14B8A6] transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cross-Reference Toggle Banner */}
            <div className="px-6 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white/60 text-sm">
                <Link2 className="w-4 h-4" />
                <span>Cross-references available for highlighted verses</span>
              </div>
              <button
                onClick={() => setShowCrossReferences(!showCrossReferences)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs transition-colors ${
                  showCrossReferences
                    ? 'bg-[#14B8A6] text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showCrossReferences ? 'Hide Panel' : 'Show Panel'}</span>
              </button>
            </div>

            {/* Scripture Content */}
            <div className="p-6 sm:p-8 max-h-[600px] overflow-y-auto">
              <div className="prose prose-lg max-w-none">
                {scriptureData.verses.map((verse) => {
                  const reference = getVerseReference(verse.number);
                  const isBookmarked = bookmarks.some(b => b.reference === reference);
                  const isHighlighted = highlights.some(h => h.reference === reference);
                  const noteData = notes[reference];
                  const hasNote = !!noteData;
                  const hasRefs = hasCrossReferences(verse.number);


                  return (
                    <div
                      key={verse.number}
                      className={`group relative py-2 px-3 -mx-3 rounded-lg transition-colors cursor-pointer ${
                        selectedVerse === verse.number ? 'bg-[#14B8A6]/15' : 'hover:bg-[#14B8A6]/10'
                      } ${isHighlighted ? 'bg-[#F59E0B]/20' : ''}`}
                      onClick={() => setSelectedVerse(selectedVerse === verse.number ? null : verse.number)}
                    >
                      <span className="inline">
                        <sup className="text-[#14B8A6] font-bold mr-1 text-sm">{verse.number}</sup>
                        <span className="text-white/90 font-serif leading-relaxed">{verse.text}</span>
                        {hasRefs && (
                          <sup className="ml-1 text-[#3B82F6] text-xs cursor-pointer hover:text-[#60A5FA]">
                            <Link2 className="w-3 h-3 inline" />
                          </sup>
                        )}
                      </span>

                      {/* Verse Actions */}
                      {selectedVerse === verse.number && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#14B8A6]/20 pt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBookmark(reference);
                            }}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              isBookmarked
                                ? 'bg-[#14B8A6] text-white'
                                : 'bg-white/10 text-white/80 hover:bg-white/20'
                            }`}
                          >
                            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleHighlight(reference);
                            }}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              isHighlighted
                                ? 'bg-[#F59E0B] text-white'
                                : 'bg-white/10 text-white/80 hover:bg-white/20'
                            }`}
                          >
                            <Highlighter className="w-4 h-4" />
                            <span>{isHighlighted ? 'Highlighted' : 'Highlight'}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyVerse(verse.number, verse.text);
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                          >
                            {copiedVerse === verse.number ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedVerse === verse.number ? 'Copied!' : 'Copy'}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareVerse(verse.number, verse.text);
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>

                          {/* Cross-Reference Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowCrossReferences(verse.number, verse.text);
                            }}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              hasRefs
                                ? 'bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30'
                                : 'bg-white/10 text-white/80 hover:bg-white/20'
                            }`}
                          >
                            <Link2 className="w-4 h-4" />
                            <span>Cross-Refs</span>
                            {hasRefs && (
                              <span className="ml-1 px-1.5 py-0.5 bg-[#3B82F6] text-white text-xs rounded-full">
                                {getCrossReferences(reference).length}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowNoteInput(showNoteInput === verse.number ? null : verse.number);
                            }}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              hasNote
                                ? 'bg-[#8B5CF6] text-white'
                                : 'bg-white/10 text-white/80 hover:bg-white/20'
                            }`}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{hasNote ? 'View Note' : 'Add Note'}</span>
                          </button>
                        </div>
                      )}

                      {/* Note Input/Display */}
                      {showNoteInput === verse.number && (
                        <div className="mt-3 p-3 bg-[#0c1929] rounded-lg border border-[#14B8A6]/30" onClick={(e) => e.stopPropagation()}>
                          {noteData && (
                            <div className="mb-3 p-2 bg-[#8B5CF6]/20 rounded text-sm text-white/80">
                              <strong className="text-[#8B5CF6]">Your Note:</strong> {noteData.text}
                            </div>
                          )}

                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add your thoughts..."
                            className="w-full p-2 bg-white/5 border border-white/20 rounded text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6]"
                            rows={3}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => handleSaveNote(verse.number)}
                              className="px-4 py-1.5 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white rounded text-sm font-medium hover:from-[#0D9488] hover:to-[#0F766E] transition-colors"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Note Indicator */}
                      {hasNote && selectedVerse !== verse.number && (
                        <span className="absolute right-0 top-2 w-2 h-2 bg-[#8B5CF6] rounded-full" />
                      )}
                      
                      {/* Cross-Reference Indicator */}
                      {hasRefs && selectedVerse !== verse.number && (
                        <span className="absolute right-3 top-2 w-2 h-2 bg-[#3B82F6] rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white/5 px-6 py-3 border-t border-[#14B8A6]/20">
              <p className="text-xs text-white/40 text-center">
                {displayVersion.name} ({displayVersion.abbreviation}) • {scriptureData.verses.length} verses
                {selectedVersion.id !== displayVersion.id && (
                  <span className="text-amber-400/60 ml-2">
                    (Showing default - {selectedVersion.abbreviation} requires API)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Cross-Reference Panel */}
        {showCrossReferences && crossRefVerse && (
          <div className="lg:w-2/5 transition-all duration-300">
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white/60 text-sm">Cross-Reference Panel</h3>
                <button
                  onClick={() => setShowCrossReferences(false)}
                  className="p-1 text-white/40 hover:text-white/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <CrossReferencePanel
                reference={crossRefVerse.reference}
                verseText={crossRefVerse.text}
                onNavigateToVerse={(ref) => {
                  // Parse reference and navigate if possible
                  console.log('Navigate to:', ref);
                }}
                onOpenMap={() => setShowConnectionMap(true)}
              />
            </div>
          </div>
        )}
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

      {/* Connection Map Modal */}
      <VerseConnectionMap
        isOpen={showConnectionMap}
        onClose={() => setShowConnectionMap(false)}
        currentReference={crossRefVerse?.reference || `${book} ${chapter}:1`}
        onNavigateToVerse={(ref) => {
          console.log('Navigate to:', ref);
          setShowConnectionMap(false);
        }}
      />
    </>
  );
};

export default ScriptureReader;
