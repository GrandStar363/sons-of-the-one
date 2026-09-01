import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useSyncedState } from '@/hooks/useSyncedState';
import { 
  BookOpen, 
  GitCompare, 
  Heart, 
  HeartOff,
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Search,
  X,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Trash2,
  Share2,
  Bookmark,
  Sparkles,
  ArrowLeftRight,
  Layers
} from 'lucide-react';

interface VerseComparisonProps {
  onReadVerse?: (reference: string) => void;
  user?: User | null;
}

interface Translation {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
}

interface VerseData {
  reference: string;
  translations: Record<string, string>;
}

interface SavedComparison {
  id: string;
  reference: string;
  translations: string[];
  savedAt: Date;
  note?: string;
}

const translations: Translation[] = [
  { 
    id: 'kjv', 
    name: 'King James Version', 
    abbreviation: 'KJV',
    description: 'Traditional English translation from 1611'
  },
  { 
    id: 'niv', 
    name: 'New International Version', 
    abbreviation: 'NIV',
    description: 'Modern English translation for readability'
  },
  { 
    id: 'esv', 
    name: 'English Standard Version', 
    abbreviation: 'ESV',
    description: 'Literal translation with modern language'
  },
  { 
    id: 'nasb', 
    name: 'New American Standard Bible', 
    abbreviation: 'NASB',
    description: 'Highly literal word-for-word translation'
  },
  { 
    id: 'nlt', 
    name: 'New Living Translation', 
    abbreviation: 'NLT',
    description: 'Thought-for-thought dynamic translation'
  },
  { 
    id: 'amp', 
    name: 'Amplified Bible', 
    abbreviation: 'AMP',
    description: 'Expanded translation with additional clarity'
  },
];

// Sample verse data for multiple translations
const verseDatabase: Record<string, Record<string, string>> = {
  'John 3:16': {
    kjv: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    niv: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    esv: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    nasb: 'For God so loved the world, that He gave His only Son, so that everyone who believes in Him will not perish, but have eternal life.',
    nlt: 'For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.',
    amp: 'For God so [greatly] loved and dearly prized the world, that He [even] gave His [One and] only begotten Son, so that whoever believes and trusts in Him [as Savior] shall not perish, but have eternal life.',
  },
  'Romans 8:28': {
    kjv: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    niv: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    esv: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    nasb: 'And we know that God causes all things to work together for good to those who love God, to those who are called according to His purpose.',
    nlt: 'And we know that God causes everything to work together for the good of those who love God and are called according to his purpose for them.',
    amp: 'And we know [with great confidence] that God [who is deeply concerned about us] causes all things to work together [as a plan] for good for those who love God, to those who are called according to His plan and purpose.',
  },
  'Romans 8:14': {
    kjv: 'For as many as are led by the Spirit of God, they are the sons of God.',
    niv: 'For those who are led by the Spirit of God are the children of God.',
    esv: 'For all who are led by the Spirit of God are sons of God.',
    nasb: 'For all who are being led by the Spirit of God, these are sons of God.',
    nlt: 'For all who are led by the Spirit of God are children of God.',
    amp: 'For all who are allowing themselves to be led by the Spirit of God are sons of God.',
  },
  'Romans 8:15': {
    kjv: 'For ye have not received the spirit of bondage again to fear; but ye have received the Spirit of adoption, whereby we cry, Abba, Father.',
    niv: 'The Spirit you received does not make you slaves, so that you live in fear again; rather, the Spirit you received brought about your adoption to sonship. And by him we cry, "Abba, Father."',
    esv: 'For you did not receive the spirit of slavery to fall back into fear, but you have received the Spirit of adoption as sons, by whom we cry, "Abba! Father!"',
    nasb: 'For you have not received a spirit of slavery leading to fear again, but you have received a spirit of adoption as sons and daughters by which we cry out, "Abba! Father!"',
    nlt: 'So you have not received a spirit that makes you fearful slaves. Instead, you received God\'s Spirit when he adopted you as his own children. Now we call him, "Abba, Father."',
    amp: 'For you have not received a spirit of slavery leading again to fear [of God\'s judgment], but you have received the Spirit of adoption as sons [the Spirit producing sonship] by which we [joyfully] cry, "Abba! Father!"',
  },
  'Romans 8:16': {
    kjv: 'The Spirit itself beareth witness with our spirit, that we are the children of God:',
    niv: 'The Spirit himself testifies with our spirit that we are God\'s children.',
    esv: 'The Spirit himself bears witness with our spirit that we are children of God,',
    nasb: 'The Spirit Himself testifies with our spirit that we are children of God,',
    nlt: 'For his Spirit joins with our spirit to affirm that we are God\'s children.',
    amp: 'The Spirit Himself testifies and confirms together with our spirit [assuring us] that we [believers] are children of God.',
  },
  'Romans 8:17': {
    kjv: 'And if children, then heirs; heirs of God, and joint-heirs with Christ; if so be that we suffer with him, that we may be also glorified together.',
    niv: 'Now if we are children, then we are heirs—heirs of God and co-heirs with Christ, if indeed we share in his sufferings in order that we may also share in his glory.',
    esv: 'and if children, then heirs—heirs of God and fellow heirs with Christ, provided we suffer with him in order that we may also be glorified with him.',
    nasb: 'and if children, heirs also, heirs of God and fellow heirs with Christ, if indeed we suffer with Him so that we may also be glorified with Him.',
    nlt: 'And since we are his children, we are his heirs. In fact, together with Christ we are heirs of God\'s glory. But if we are to share his glory, we must also share his suffering.',
    amp: 'And if [we are His] children, [then we are His] heirs also: heirs of God and fellow heirs with Christ [sharing His spiritual blessing and inheritance], if indeed we share in His suffering so that we may also share in His glory.',
  },
  'Psalm 23:1': {
    kjv: 'The LORD is my shepherd; I shall not want.',
    niv: 'The LORD is my shepherd, I lack nothing.',
    esv: 'The LORD is my shepherd; I shall not want.',
    nasb: 'The LORD is my shepherd, I will not be in need.',
    nlt: 'The LORD is my shepherd; I have all that I need.',
    amp: 'The LORD is my Shepherd [to feed, to guide and to shield me], I shall not want.',
  },
  'Proverbs 3:5-6': {
    kjv: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
    niv: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    esv: 'Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
    nasb: 'Trust in the LORD with all your heart And do not lean on your own understanding. In all your ways acknowledge Him, And He will make your paths straight.',
    nlt: 'Trust in the LORD with all your heart; do not depend on your own understanding. Seek his will in all you do, and he will show you which path to take.',
    amp: 'Trust in and rely confidently on the LORD with all your heart And do not rely on your own insight or understanding. In all your ways know and acknowledge and recognize Him, And He will make your paths straight and smooth [removing obstacles that block your way].',
  },
  'Philippians 4:13': {
    kjv: 'I can do all things through Christ which strengtheneth me.',
    niv: 'I can do all this through him who gives me strength.',
    esv: 'I can do all things through him who strengthens me.',
    nasb: 'I can do all things through Him who strengthens me.',
    nlt: 'For I can do everything through Christ, who gives me strength.',
    amp: 'I can do all things [which He has called me to do] through Him who strengthens and empowers me [to fulfill His purpose—I am self-sufficient in Christ\'s sufficiency; I am ready for anything and equal to anything through Him who infuses me with inner strength and confident peace.]',
  },
  'Jeremiah 29:11': {
    kjv: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
    niv: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."',
    esv: 'For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.',
    nasb: '"For I know the plans that I have for you," declares the LORD, "plans for prosperity and not for disaster, to give you a future and a hope."',
    nlt: 'For I know the plans I have for you," says the LORD. "They are plans for good and not for disaster, to give you a future and a hope.',
    amp: 'For I know the plans and thoughts that I have for you,\' says the LORD, \'plans for peace and well-being and not for disaster, to give you a future and a hope.',
  },
  'Isaiah 40:31': {
    kjv: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
    niv: 'but those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
    esv: 'but they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.',
    nasb: 'Yet those who wait for the LORD Will gain new strength; They will mount up with wings like eagles, They will run and not get tired, They will walk and not become weary.',
    nlt: 'But those who trust in the LORD will find new strength. They will soar high on wings like eagles. They will run and not grow weary. They will walk and not faint.',
    amp: 'But those who wait for the LORD [who expect, look for, and hope in Him] Will gain new strength and renew their power; They will lift up their wings [and rise up close to God] like eagles [rising toward the sun]; They will run and not become weary, They will walk and not grow tired.',
  },
  'Galatians 2:20': {
    kjv: 'I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.',
    niv: 'I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God, who loved me and gave himself for me.',
    esv: 'I have been crucified with Christ. It is no longer I who live, but Christ who lives in me. And the life I now live in the flesh I live by faith in the Son of God, who loved me and gave himself for me.',
    nasb: 'I have been crucified with Christ; and it is no longer I who live, but Christ lives in me; and the life which I now live in the flesh I live by faith in the Son of God, who loved me and gave Himself up for me.',
    nlt: 'My old self has been crucified with Christ. It is no longer I who live, but Christ lives in me. So I live in this earthly body by trusting in the Son of God, who loved me and gave himself for me.',
    amp: 'I have been crucified with Christ [that is, in Him I have shared His crucifixion]; it is no longer I who live, but Christ lives in me. The life I now live in the body I live by faith [by adhering to, relying on, and completely trusting] in the Son of God, who loved me and gave Himself up for me.',
  },
};

const popularVerses = [
  'John 3:16',
  'Romans 8:28',
  'Romans 8:14',
  'Romans 8:15',
  'Romans 8:16',
  'Romans 8:17',
  'Psalm 23:1',
  'Proverbs 3:5-6',
  'Philippians 4:13',
  'Jeremiah 29:11',
  'Isaiah 40:31',
  'Galatians 2:20',
];

const VerseComparison: React.FC<VerseComparisonProps> = ({ onReadVerse, user = null }) => {
  const [selectedReference, setSelectedReference] = useState('Romans 8:14');
  const [selectedTranslations, setSelectedTranslations] = useState<string[]>(['kjv', 'niv', 'esv', 'nasb']);
  const [showWordDiff, setShowWordDiff] = useState(false);
  const [baseTranslation, setBaseTranslation] = useState('kjv');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  // Persisted to user_data; localStorage is an offline cache.
  const [savedComparisons, setSavedComparisons] = useSyncedState<SavedComparison[]>(
    'sog-saved-comparisons', 'saved_comparisons', [], user);
  const [showSaved, setShowSaved] = useState(false);
  const [comparisonNote, setComparisonNote] = useState('');
  const [expandedTranslations, setExpandedTranslations] = useState(false);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'stacked'>('side-by-side');

  const currentVerseData = verseDatabase[selectedReference];

  const toggleTranslation = (translationId: string) => {
    setSelectedTranslations(prev => {
      if (prev.includes(translationId)) {
        if (prev.length <= 2) return prev; // Keep at least 2 translations
        return prev.filter(t => t !== translationId);
      }
      return [...prev, translationId];
    });
  };

  const handleSaveComparison = () => {
    const newComparison: SavedComparison = {
      id: Date.now().toString(),
      reference: selectedReference,
      translations: selectedTranslations,
      savedAt: new Date(),
      note: comparisonNote || undefined,
    };
    setSavedComparisons(prev => [newComparison, ...prev]);
    setComparisonNote('');
  };

  const handleRemoveSaved = (id: string) => {
    setSavedComparisons(prev => prev.filter(c => c.id !== id));
  };

  const handleLoadSaved = (comparison: SavedComparison) => {
    setSelectedReference(comparison.reference);
    setSelectedTranslations(comparison.translations);
    setShowSaved(false);
  };

  const isSaved = savedComparisons.some(
    c => c.reference === selectedReference && 
    JSON.stringify(c.translations.sort()) === JSON.stringify([...selectedTranslations].sort())
  );

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAllTranslations = () => {
    if (!currentVerseData) return;
    
    let text = `${selectedReference}\n\n`;
    selectedTranslations.forEach(tid => {
      const trans = translations.find(t => t.id === tid);
      if (trans && currentVerseData[tid]) {
        text += `${trans.abbreviation}: ${currentVerseData[tid]}\n\n`;
      }
    });
    
    navigator.clipboard.writeText(text.trim());
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  // Word difference highlighting
  const getWordDiff = (text1: string, text2: string): { word: string; isDifferent: boolean }[] => {
    const words1 = text1.toLowerCase().replace(/[.,;:!?"']/g, '').split(/\s+/);
    const words2 = text2.split(/\s+/);
    
    return words2.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[.,;:!?"']/g, '');
      const isDifferent = !words1.includes(cleanWord);
      return { word, isDifferent };
    });
  };

  const filteredVerses = popularVerses.filter(v => 
    v.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3d4a4a] via-[#3d4a4a] to-[#2d3a3a] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#7c9a7a] to-[#4a5d4a] mb-4 sm:mb-6 shadow-lg shadow-[#7c9a7a]/20">
            <GitCompare className="w-8 h-8 sm:w-10 sm:h-10 text-[#f5f0e6]" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5f0e6] mb-3 sm:mb-4">
            Verse Comparison Tool
          </h1>
          <p className="text-lg sm:text-xl text-[#f5f0e6]/70 max-w-2xl mx-auto">
            Compare scripture across multiple translations to gain deeper understanding
          </p>
        </div>

        {/* Controls */}
        <div className="bg-[#4a5d4a] rounded-2xl border border-[#7c9a7a]/30 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            {/* Verse Selector */}
            <div className="flex-1">
              <label className="block text-[#f5f0e6]/70 text-sm font-medium mb-2">
                Select Verse
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#3d4a4a] border border-[#7c9a7a]/30 rounded-xl text-[#f5f0e6] hover:border-[#9cb59c]/50 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-[#9cb59c]" />
                    <span className="font-medium">{selectedReference}</span>
                  </span>
                  {showSearch ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {showSearch && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#3d4a4a] border border-[#7c9a7a]/30 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="p-3 border-b border-[#7c9a7a]/20">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f5f0e6]/50" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search verses..."
                          className="w-full pl-10 pr-4 py-2 bg-[#4a5d4a] border border-[#7c9a7a]/20 rounded-lg text-[#f5f0e6] placeholder-[#f5f0e6]/40 focus:outline-none focus:border-[#9cb59c]/50"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredVerses.map((verse) => (
                        <button
                          key={verse}
                          onClick={() => {
                            setSelectedReference(verse);
                            setShowSearch(false);
                            setSearchQuery('');
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-[#7c9a7a]/10 transition-colors flex items-center justify-between ${
                            selectedReference === verse ? 'bg-[#7c9a7a]/20 text-[#9cb59c]' : 'text-[#f5f0e6]'
                          }`}
                        >
                          <span>{verse}</span>
                          {selectedReference === verse && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-[#7c9a7a] text-[#f5f0e6]'
                    : 'bg-[#3d4a4a] text-[#f5f0e6]/70 hover:text-[#f5f0e6]'
                }`}
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('stacked')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'stacked'
                    ? 'bg-[#7c9a7a] text-[#f5f0e6]'
                    : 'bg-[#3d4a4a] text-[#f5f0e6]/70 hover:text-[#f5f0e6]'
                }`}
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSaved(!showSaved)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                  showSaved
                    ? 'bg-[#7c9a7a] text-[#f5f0e6]'
                    : 'bg-[#3d4a4a] text-[#f5f0e6]/70 hover:text-[#f5f0e6] border border-[#7c9a7a]/30'
                }`}
              >
                <Bookmark className="w-5 h-5" />
                <span className="hidden sm:inline">Saved ({savedComparisons.length})</span>
              </button>
              
              <button
                onClick={copyAllTranslations}
                className="flex items-center space-x-2 px-4 py-3 bg-[#3d4a4a] border border-[#7c9a7a]/30 rounded-xl text-[#f5f0e6]/70 hover:text-[#f5f0e6] transition-colors"
              >
                {copied === 'all' ? <Check className="w-5 h-5 text-[#7c9a7a]" /> : <Copy className="w-5 h-5" />}
                <span className="hidden sm:inline">Copy All</span>
              </button>
            </div>
          </div>

          {/* Translation Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[#f5f0e6]/70 text-sm font-medium">
                Select Translations ({selectedTranslations.length} selected)
              </label>
              <button
                onClick={() => setExpandedTranslations(!expandedTranslations)}
                className="text-[#9cb59c] text-sm hover:underline"
              >
                {expandedTranslations ? 'Show Less' : 'Show All'}
              </button>
            </div>
            
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 ${!expandedTranslations ? 'max-h-24 overflow-hidden' : ''}`}>
              {translations.map((trans) => (
                <button
                  key={trans.id}
                  onClick={() => toggleTranslation(trans.id)}
                  className={`relative px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedTranslations.includes(trans.id)
                      ? 'bg-[#7c9a7a] text-[#f5f0e6]'
                      : 'bg-[#3d4a4a] text-[#f5f0e6]/70 hover:text-[#f5f0e6] border border-[#7c9a7a]/20'
                  }`}
                >
                  <span className="font-bold">{trans.abbreviation}</span>
                  {selectedTranslations.includes(trans.id) && (
                    <Check className="absolute top-1 right-1 w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Word Diff Toggle */}
          <div className="mt-4 pt-4 border-t border-[#7c9a7a]/20 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowWordDiff(!showWordDiff)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showWordDiff
                  ? 'bg-[#6b9a9a]/20 text-[#a8c5d9] border border-[#6b9a9a]/30'
                  : 'bg-[#3d4a4a] text-[#f5f0e6]/70 hover:text-[#f5f0e6] border border-[#7c9a7a]/20'
              }`}
            >
              {showWordDiff ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              <span>Word Differences</span>
            </button>

            {showWordDiff && (
              <div className="flex items-center space-x-2">
                <span className="text-[#f5f0e6]/50 text-sm">Compare against:</span>
                <select
                  value={baseTranslation}
                  onChange={(e) => setBaseTranslation(e.target.value)}
                  className="px-3 py-1 bg-[#3d4a4a] border border-[#7c9a7a]/30 rounded-lg text-[#f5f0e6] text-sm focus:outline-none focus:border-[#9cb59c]"
                >
                  {translations.filter(t => selectedTranslations.includes(t.id)).map((trans) => (
                    <option key={trans.id} value={trans.id}>{trans.abbreviation}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex-1" />

            {/* Save Comparison */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={comparisonNote}
                onChange={(e) => setComparisonNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="px-3 py-2 bg-[#3d4a4a] border border-[#7c9a7a]/20 rounded-lg text-[#f5f0e6] placeholder-[#f5f0e6]/40 text-sm focus:outline-none focus:border-[#9cb59c]/50 w-40 sm:w-48"
              />
              <button
                onClick={handleSaveComparison}
                disabled={isSaved}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isSaved
                    ? 'bg-[#7c9a7a]/20 text-[#9cb59c] cursor-not-allowed'
                    : 'bg-[#7c9a7a] text-[#f5f0e6] hover:bg-[#7c9a7a]/90'
                }`}
              >
                {isSaved ? <Check className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Saved Comparisons Panel */}
        {showSaved && (
          <div className="bg-[#4a5d4a] rounded-2xl border border-[#7c9a7a]/30 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#f5f0e6] flex items-center space-x-2">
                <Bookmark className="w-5 h-5 text-[#9cb59c]" />
                <span>Saved Comparisons</span>
              </h3>
              <button
                onClick={() => setShowSaved(false)}
                className="p-2 text-[#f5f0e6]/50 hover:text-[#f5f0e6] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedComparisons.length === 0 ? (
              <div className="text-center py-8">
                <HeartOff className="w-12 h-12 text-[#f5f0e6]/30 mx-auto mb-3" />
                <p className="text-[#f5f0e6]/50">No saved comparisons yet</p>
                <p className="text-[#f5f0e6]/30 text-sm mt-1">Save your favorite verse comparisons for quick access</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {savedComparisons.map((comparison) => (
                  <div
                    key={comparison.id}
                    className="flex items-center justify-between p-3 bg-[#3d4a4a] rounded-xl border border-[#7c9a7a]/10 hover:border-[#7c9a7a]/30 transition-colors"
                  >
                    <button
                      onClick={() => handleLoadSaved(comparison)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-5 h-5 text-[#9cb59c]" />
                        <div>
                          <p className="text-[#f5f0e6] font-medium">{comparison.reference}</p>
                          <p className="text-[#f5f0e6]/50 text-sm">
                            {comparison.translations.map(t => translations.find(tr => tr.id === t)?.abbreviation).join(', ')}
                          </p>
                          {comparison.note && (
                            <p className="text-[#9cb59c]/70 text-xs mt-1 italic">"{comparison.note}"</p>
                          )}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleRemoveSaved(comparison.id)}
                      className="p-2 text-[#f5f0e6]/30 hover:text-[#c4907a] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comparison Display */}
        {currentVerseData ? (
          <div className={`grid gap-4 sm:gap-6 ${
            viewMode === 'side-by-side' 
              ? selectedTranslations.length <= 2 
                ? 'grid-cols-1 lg:grid-cols-2' 
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {selectedTranslations.map((translationId) => {
              const trans = translations.find(t => t.id === translationId);
              const verseText = currentVerseData[translationId];
              
              if (!trans || !verseText) return null;

              const wordDiff = showWordDiff && translationId !== baseTranslation
                ? getWordDiff(currentVerseData[baseTranslation] || '', verseText)
                : null;

              return (
                <div
                  key={translationId}
                  className="bg-[#f5f0e6] rounded-2xl overflow-hidden shadow-lg"
                >
                  {/* Translation Header */}
                  <div className="bg-gradient-to-r from-[#7c9a7a] to-[#4a5d4a] px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-[#f5f0e6]">{trans.abbreviation}</h3>
                        <p className="text-[#f5f0e6]/70 text-xs sm:text-sm">{trans.name}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${selectedReference} (${trans.abbreviation})\n${verseText}`, translationId)}
                        className="p-2 bg-[#f5f0e6]/10 rounded-lg hover:bg-[#f5f0e6]/20 transition-colors"
                      >
                        {copied === translationId ? (
                          <Check className="w-4 h-4 text-[#f5f0e6]" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#f5f0e6]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Verse Content */}
                  <div className="p-4 sm:p-6">
                    <p className="text-[#5c4f42]/50 text-sm font-medium mb-2">{selectedReference}</p>
                    
                    {wordDiff ? (
                      <p className="text-[#5c4f42] text-base sm:text-lg leading-relaxed">
                        {wordDiff.map((item, index) => (
                          <span
                            key={index}
                            className={item.isDifferent ? 'bg-[#a8c5d9]/40 text-[#6b9a9a] px-1 rounded' : ''}
                          >
                            {item.word}{' '}
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p className="text-[#5c4f42] text-base sm:text-lg leading-relaxed">
                        {verseText}
                      </p>
                    )}

                    {showWordDiff && translationId === baseTranslation && (
                      <div className="mt-3 pt-3 border-t border-[#5c4f42]/10">
                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-[#7c9a7a]/20 text-[#4a5d4a] text-xs font-medium rounded">
                          <Sparkles className="w-3 h-3" />
                          <span>Base Translation</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#4a5d4a] rounded-2xl border border-[#7c9a7a]/30 p-8 sm:p-12 text-center">
            <BookOpen className="w-16 h-16 text-[#f5f0e6]/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#f5f0e6] mb-2">Verse Not Found</h3>
            <p className="text-[#f5f0e6]/50">Select a verse from the dropdown to compare translations</p>
          </div>
        )}

        {/* Word Diff Legend */}
        {showWordDiff && currentVerseData && (
          <div className="mt-6 p-4 bg-[#4a5d4a] rounded-xl border border-[#7c9a7a]/30">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[#f5f0e6]/70 text-sm font-medium">Legend:</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-[#a8c5d9]/40 text-[#6b9a9a] text-sm rounded">highlighted</span>
                <span className="text-[#f5f0e6]/50 text-sm">= Word differs from {translations.find(t => t.id === baseTranslation)?.abbreviation}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Select Popular Verses */}
        <div className="mt-8 sm:mt-12">
          <h3 className="text-xl font-serif font-bold text-[#f5f0e6] mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#9cb59c]" />
            <span>Popular Verses to Compare</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {popularVerses.map((verse) => (
              <button
                key={verse}
                onClick={() => setSelectedReference(verse)}
                className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  selectedReference === verse
                    ? 'bg-[#7c9a7a] text-[#f5f0e6]'
                    : 'bg-[#4a5d4a] text-[#f5f0e6]/70 hover:text-[#f5f0e6] border border-[#7c9a7a]/20 hover:border-[#7c9a7a]/40'
                }`}
              >
                {verse}
              </button>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-r from-[#7c9a7a]/10 to-transparent rounded-2xl border border-[#7c9a7a]/20 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-[#f5f0e6] mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#9cb59c]" />
            <span>Tips for Comparing Translations</span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#7c9a7a]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#9cb59c] font-bold">1</span>
              </div>
              <div>
                <p className="text-[#f5f0e6] font-medium">KJV for Traditional Language</p>
                <p className="text-[#f5f0e6]/50 text-sm">Classic, formal English with poetic beauty</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#7c9a7a]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#9cb59c] font-bold">2</span>
              </div>
              <div>
                <p className="text-[#f5f0e6] font-medium">NASB for Word-for-Word</p>
                <p className="text-[#f5f0e6]/50 text-sm">Most literal translation for study</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#7c9a7a]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#9cb59c] font-bold">3</span>
              </div>
              <div>
                <p className="text-[#f5f0e6] font-medium">NLT for Clarity</p>
                <p className="text-[#f5f0e6]/50 text-sm">Easy to understand, thought-for-thought</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerseComparison;
