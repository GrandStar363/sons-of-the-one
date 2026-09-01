import React, { useState } from 'react';
import { 
  Link2, BookOpen, ArrowRight, Sparkles, Quote, 
  ChevronDown, ChevronUp, ExternalLink, Map, Tag,
  GitBranch, Layers, X
} from 'lucide-react';
import { CrossReference, getCrossReferences, thematicGroups, getVerseConnections } from '@/data/crossReferences';
import { featuredVerses } from '@/data/bibleData';

interface CrossReferencePanelProps {
  reference: string;
  verseText: string;
  onNavigateToVerse?: (reference: string) => void;
  onOpenMap?: () => void;
}

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  direct: { bg: 'bg-[#14B8A6]/20', text: 'text-[#14B8A6]', border: 'border-[#14B8A6]/40' },
  parallel: { bg: 'bg-[#3B82F6]/20', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/40' },
  thematic: { bg: 'bg-[#8B5CF6]/20', text: 'text-[#8B5CF6]', border: 'border-[#8B5CF6]/40' },
  prophetic: { bg: 'bg-[#F59E0B]/20', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/40' },
  quotation: { bg: 'bg-[#EC4899]/20', text: 'text-[#EC4899]', border: 'border-[#EC4899]/40' },
};

const typeIcons: Record<string, React.ReactNode> = {
  direct: <Link2 className="w-3.5 h-3.5" />,
  parallel: <GitBranch className="w-3.5 h-3.5" />,
  thematic: <Layers className="w-3.5 h-3.5" />,
  prophetic: <Sparkles className="w-3.5 h-3.5" />,
  quotation: <Quote className="w-3.5 h-3.5" />,
};

const typeLabels: Record<string, string> = {
  direct: 'Direct Reference',
  parallel: 'Parallel Passage',
  thematic: 'Thematic Connection',
  prophetic: 'Prophetic Fulfillment',
  quotation: 'Quotation',
};

const CrossReferencePanel: React.FC<CrossReferencePanelProps> = ({
  reference,
  verseText,
  onNavigateToVerse,
  onOpenMap,
}) => {
  const [expandedRef, setExpandedRef] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'references' | 'themes' | 'chain'>('references');
  const [chainHistory, setChainHistory] = useState<string[]>([reference]);

  const crossRefs = getCrossReferences(reference);
  
  // Find related themes
  const relatedThemes = Object.entries(thematicGroups).filter(([_, group]) =>
    group.verses.some(v => v === reference || crossRefs.some(cr => cr.reference === v))
  );

  // Get verse text from featured verses if available
  const getVerseText = (ref: string): string => {
    const found = featuredVerses.find(v => v.reference === ref);
    if (found) return found.text;
    const crossRef = crossRefs.find(cr => cr.reference === ref);
    if (crossRef) return crossRef.text;
    return '';
  };

  const handleExploreChain = (newRef: string) => {
    setChainHistory(prev => [...prev, newRef]);
  };

  const handleBackInChain = () => {
    if (chainHistory.length > 1) {
      setChainHistory(prev => prev.slice(0, -1));
    }
  };

  const currentChainRef = chainHistory[chainHistory.length - 1];
  const currentChainRefs = getCrossReferences(currentChainRef);

  return (
    <div className="bg-gradient-to-br from-[#14B8A6]/5 via-[#0f2942] to-[#3B82F6]/5 border border-[#14B8A6]/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#14B8A6]/20 to-[#3B82F6]/20 px-4 py-3 border-b border-[#14B8A6]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Cross References</h3>
              <p className="text-white/50 text-xs">{reference}</p>
            </div>
          </div>
          {onOpenMap && (
            <button
              onClick={onOpenMap}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 text-xs transition-colors"
            >
              <Map className="w-3.5 h-3.5" />
              <span>View Map</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('references')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'references'
              ? 'text-[#14B8A6] border-b-2 border-[#14B8A6] bg-[#14B8A6]/5'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          <div className="flex items-center justify-center space-x-1.5">
            <BookOpen className="w-4 h-4" />
            <span>References ({crossRefs.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('themes')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'themes'
              ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6] bg-[#8B5CF6]/5'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          <div className="flex items-center justify-center space-x-1.5">
            <Tag className="w-4 h-4" />
            <span>Themes ({relatedThemes.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('chain')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'chain'
              ? 'text-[#F59E0B] border-b-2 border-[#F59E0B] bg-[#F59E0B]/5'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          <div className="flex items-center justify-center space-x-1.5">
            <GitBranch className="w-4 h-4" />
            <span>Chain Study</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {/* References Tab */}
        {activeTab === 'references' && (
          <div className="space-y-3">
            {crossRefs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-white/40" />
                </div>
                <p className="text-white/50 text-sm">No cross-references available for this verse.</p>
                <p className="text-white/30 text-xs mt-1">Try selecting a different verse.</p>
              </div>
            ) : (
              <>
                {/* Type Legend */}
                <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-white/10">
                  {Object.entries(typeLabels).map(([type, label]) => (
                    <div
                      key={type}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${typeColors[type].bg} ${typeColors[type].text}`}
                    >
                      {typeIcons[type]}
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Reference Cards */}
                {crossRefs.map((ref, index) => (
                  <div
                    key={index}
                    className={`border ${typeColors[ref.type].border} rounded-xl overflow-hidden transition-all duration-200`}
                  >
                    <button
                      onClick={() => setExpandedRef(expandedRef === ref.reference ? null : ref.reference)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg ${typeColors[ref.type].bg} flex items-center justify-center ${typeColors[ref.type].text}`}>
                          {typeIcons[ref.type]}
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium text-sm">{ref.reference}</p>
                          <p className={`text-xs ${typeColors[ref.type].text}`}>{ref.relationship}</p>
                        </div>
                      </div>
                      {expandedRef === ref.reference ? (
                        <ChevronUp className="w-4 h-4 text-white/40" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/40" />
                      )}
                    </button>

                    {expandedRef === ref.reference && (
                      <div className="px-4 pb-4 border-t border-white/10">
                        <p className="text-white/70 text-sm italic mt-3 leading-relaxed">
                          "{ref.text}"
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[ref.type].bg} ${typeColors[ref.type].text}`}>
                            {typeLabels[ref.type]}
                          </span>
                          <button
                            onClick={() => onNavigateToVerse?.(ref.reference)}
                            className="flex items-center space-x-1 text-[#14B8A6] hover:text-[#0D9488] text-xs transition-colors"
                          >
                            <span>Go to verse</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div className="space-y-3">
            {relatedThemes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-white/40" />
                </div>
                <p className="text-white/50 text-sm">No related themes found.</p>
              </div>
            ) : (
              relatedThemes.map(([key, theme]) => (
                <div
                  key={key}
                  className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#8B5CF6]/5 border border-[#8B5CF6]/30 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold">{theme.title}</h4>
                      <p className="text-white/50 text-xs mt-0.5">{theme.description}</p>
                    </div>
                    <span className="text-[#8B5CF6] text-xs bg-[#8B5CF6]/20 px-2 py-0.5 rounded-full">
                      {theme.verses.length} verses
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {theme.verses.slice(0, 6).map((verse, idx) => (
                      <button
                        key={idx}
                        onClick={() => onNavigateToVerse?.(verse)}
                        className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                          verse === reference
                            ? 'bg-[#8B5CF6] text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {verse}
                      </button>
                    ))}
                    {theme.verses.length > 6 && (
                      <span className="text-xs text-white/40 px-2 py-1">
                        +{theme.verses.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* All Themes */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">Explore All Themes</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(thematicGroups).slice(0, 8).map(([key, theme]) => (
                  <button
                    key={key}
                    className="text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <p className="text-white text-sm font-medium">{theme.title}</p>
                    <p className="text-white/40 text-xs">{theme.verses.length} verses</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chain Study Tab */}
        {activeTab === 'chain' && (
          <div className="space-y-4">
            {/* Chain Path */}
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center space-x-1 text-xs text-white/50 mb-2">
                <GitBranch className="w-3.5 h-3.5" />
                <span>Study Chain Path</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {chainHistory.map((ref, idx) => (
                  <React.Fragment key={idx}>
                    <button
                      onClick={() => setChainHistory(chainHistory.slice(0, idx + 1))}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                        idx === chainHistory.length - 1
                          ? 'bg-[#F59E0B] text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {ref}
                    </button>
                    {idx < chainHistory.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-white/30" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              {chainHistory.length > 1 && (
                <button
                  onClick={handleBackInChain}
                  className="mt-2 text-xs text-[#F59E0B] hover:text-[#D97706] transition-colors"
                >
                  ← Go back
                </button>
              )}
            </div>

            {/* Current Verse */}
            <div className="bg-gradient-to-r from-[#F59E0B]/10 to-[#F59E0B]/5 border border-[#F59E0B]/30 rounded-xl p-4">
              <p className="text-[#F59E0B] text-sm font-semibold mb-1">{currentChainRef}</p>
              <p className="text-white/70 text-sm italic">
                "{currentChainRef === reference ? verseText : getVerseText(currentChainRef)}"
              </p>
            </div>

            {/* Connected Verses */}
            <div>
              <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">
                Continue the Chain ({currentChainRefs.length} connections)
              </h4>
              {currentChainRefs.length === 0 ? (
                <div className="text-center py-6 bg-white/5 rounded-xl">
                  <p className="text-white/50 text-sm">End of chain - no more connections.</p>
                  <button
                    onClick={() => setChainHistory([reference])}
                    className="mt-2 text-[#F59E0B] text-sm hover:text-[#D97706] transition-colors"
                  >
                    Start over
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentChainRefs.map((ref, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExploreChain(ref.reference)}
                      className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-lg ${typeColors[ref.type].bg} flex items-center justify-center ${typeColors[ref.type].text}`}>
                            {typeIcons[ref.type]}
                          </div>
                          <span className="text-white font-medium text-sm">{ref.reference}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-[#F59E0B] transition-colors" />
                      </div>
                      <p className="text-white/50 text-xs mt-1 ml-8">{ref.relationship}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossReferencePanel;
