import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Settings,
  Book,
  ChevronDown,
  Headphones,
  Gauge,
  X,
  ListMusic,
  Repeat,
  Shuffle,
  Clock,
  BookOpen,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { allBooks, sampleScriptures, oldTestament, newTestament } from '@/data/bibleData';

interface AudioBibleProps {
  onReadVerse?: (reference: string) => void;
}

interface Verse {
  number: number;
  text: string;
}

// Extended scripture content for audio playback
const extendedScriptures: Record<string, { verses: Verse[] }> = {
  ...sampleScriptures,
  'John 3': {
    verses: [
      { number: 1, text: 'Now there was a man of the Pharisees, named Nicodemus, a ruler of the Jews;' },
      { number: 2, text: 'this man came to Jesus by night and said to Him, "Rabbi, we know that You have come from God as a teacher; for no one can do these signs that You do unless God is with him."' },
      { number: 3, text: 'Jesus answered and said to him, "Truly, truly, I say to you, unless one is born again he cannot see the kingdom of God."' },
      { number: 4, text: 'Nicodemus said to Him, "How can a man be born when he is old? He cannot enter a second time into his mother\'s womb and be born, can he?"' },
      { number: 5, text: 'Jesus answered, "Truly, truly, I say to you, unless one is born of water and the Spirit he cannot enter into the kingdom of God."' },
      { number: 6, text: 'That which is born of the flesh is flesh, and that which is born of the Spirit is spirit.' },
      { number: 7, text: 'Do not be amazed that I said to you, \'You must be born again.\'' },
      { number: 8, text: 'The wind blows where it wishes and you hear the sound of it, but do not know where it comes from and where it is going; so is everyone who is born of the Spirit.' },
      { number: 9, text: 'Nicodemus said to Him, "How can these things be?"' },
      { number: 10, text: 'Jesus answered and said to him, "Are you the teacher of Israel and do not understand these things?"' },
      { number: 11, text: 'Truly, truly, I say to you, we speak of what we know and testify of what we have seen, and you do not accept our testimony.' },
      { number: 12, text: 'If I told you earthly things and you do not believe, how will you believe if I tell you heavenly things?' },
      { number: 13, text: 'No one has ascended into heaven, but He who descended from heaven: the Son of Man.' },
      { number: 14, text: 'As Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up;' },
      { number: 15, text: 'so that whoever believes will in Him have eternal life.' },
      { number: 16, text: 'For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life.' },
      { number: 17, text: 'For God did not send the Son into the world to judge the world, but that the world might be saved through Him.' },
      { number: 18, text: 'He who believes in Him is not judged; he who does not believe has been judged already, because he has not believed in the name of the only begotten Son of God.' },
      { number: 19, text: 'This is the judgment, that the Light has come into the world, and men loved the darkness rather than the Light, for their deeds were evil.' },
      { number: 20, text: 'For everyone who does evil hates the Light, and does not come to the Light for fear that his deeds will be exposed.' },
      { number: 21, text: 'But he who practices the truth comes to the Light, so that his deeds may be manifested as having been wrought in God.' },
    ],
  },
  'Psalm 23': {
    verses: [
      { number: 1, text: 'The LORD is my shepherd, I shall not want.' },
      { number: 2, text: 'He makes me lie down in green pastures; He leads me beside quiet waters.' },
      { number: 3, text: 'He restores my soul; He guides me in the paths of righteousness for His name\'s sake.' },
      { number: 4, text: 'Even though I walk through the valley of the shadow of death, I fear no evil, for You are with me; Your rod and Your staff, they comfort me.' },
      { number: 5, text: 'You prepare a table before me in the presence of my enemies; You have anointed my head with oil; my cup overflows.' },
      { number: 6, text: 'Surely goodness and lovingkindness will follow me all the days of my life, and I will dwell in the house of the LORD forever.' },
    ],
  },
  'Psalm 91': {
    verses: [
      { number: 1, text: 'He who dwells in the shelter of the Most High will abide in the shadow of the Almighty.' },
      { number: 2, text: 'I will say to the LORD, "My refuge and my fortress, my God, in whom I trust!"' },
      { number: 3, text: 'For it is He who delivers you from the snare of the trapper and from the deadly pestilence.' },
      { number: 4, text: 'He will cover you with His pinions, and under His wings you may seek refuge; His faithfulness is a shield and bulwark.' },
      { number: 5, text: 'You will not be afraid of the terror by night, or of the arrow that flies by day;' },
      { number: 6, text: 'Of the pestilence that stalks in darkness, or of the destruction that lays waste at noon.' },
      { number: 7, text: 'A thousand may fall at your side and ten thousand at your right hand, but it shall not approach you.' },
      { number: 8, text: 'You will only look on with your eyes and see the recompense of the wicked.' },
      { number: 9, text: 'For you have made the LORD, my refuge, even the Most High, your dwelling place.' },
      { number: 10, text: 'No evil will befall you, nor will any plague come near your tent.' },
      { number: 11, text: 'For He will give His angels charge concerning you, to guard you in all your ways.' },
      { number: 12, text: 'They will bear you up in their hands, that you do not strike your foot against a stone.' },
      { number: 13, text: 'You will tread upon the lion and cobra, the young lion and the serpent you will trample down.' },
      { number: 14, text: 'Because he has loved Me, therefore I will deliver him; I will set him securely on high, because he has known My name.' },
      { number: 15, text: 'He will call upon Me, and I will answer him; I will be with him in trouble; I will rescue him and honor him.' },
      { number: 16, text: 'With a long life I will satisfy him and let him see My salvation.' },
    ],
  },
  'Proverbs 3': {
    verses: [
      { number: 1, text: 'My son, do not forget my teaching, but let your heart keep my commandments;' },
      { number: 2, text: 'For length of days and years of life and peace they will add to you.' },
      { number: 3, text: 'Do not let kindness and truth leave you; bind them around your neck, write them on the tablet of your heart.' },
      { number: 4, text: 'So you will find favor and good repute in the sight of God and man.' },
      { number: 5, text: 'Trust in the LORD with all your heart and do not lean on your own understanding.' },
      { number: 6, text: 'In all your ways acknowledge Him, and He will make your paths straight.' },
      { number: 7, text: 'Do not be wise in your own eyes; fear the LORD and turn away from evil.' },
      { number: 8, text: 'It will be healing to your body and refreshment to your bones.' },
      { number: 9, text: 'Honor the LORD from your wealth and from the first of all your produce;' },
      { number: 10, text: 'So your barns will be filled with plenty and your vats will overflow with new wine.' },
    ],
  },
  'Matthew 5': {
    verses: [
      { number: 1, text: 'When Jesus saw the crowds, He went up on the mountain; and after He sat down, His disciples came to Him.' },
      { number: 2, text: 'He opened His mouth and began to teach them, saying,' },
      { number: 3, text: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.' },
      { number: 4, text: 'Blessed are those who mourn, for they shall be comforted.' },
      { number: 5, text: 'Blessed are the gentle, for they shall inherit the earth.' },
      { number: 6, text: 'Blessed are those who hunger and thirst for righteousness, for they shall be satisfied.' },
      { number: 7, text: 'Blessed are the merciful, for they shall receive mercy.' },
      { number: 8, text: 'Blessed are the pure in heart, for they shall see God.' },
      { number: 9, text: 'Blessed are the peacemakers, for they shall be called sons of God.' },
      { number: 10, text: 'Blessed are those who have been persecuted for the sake of righteousness, for theirs is the kingdom of heaven.' },
      { number: 11, text: 'Blessed are you when people insult you and persecute you, and falsely say all kinds of evil against you because of Me.' },
      { number: 12, text: 'Rejoice and be glad, for your reward in heaven is great; for in the same way they persecuted the prophets who were before you.' },
    ],
  },
  'Ephesians 6': {
    verses: [
      { number: 10, text: 'Finally, be strong in the Lord and in the strength of His might.' },
      { number: 11, text: 'Put on the full armor of God, so that you will be able to stand firm against the schemes of the devil.' },
      { number: 12, text: 'For our struggle is not against flesh and blood, but against the rulers, against the powers, against the world forces of this darkness, against the spiritual forces of wickedness in the heavenly places.' },
      { number: 13, text: 'Therefore, take up the full armor of God, so that you will be able to resist in the evil day, and having done everything, to stand firm.' },
      { number: 14, text: 'Stand firm therefore, having girded your loins with truth, and having put on the breastplate of righteousness,' },
      { number: 15, text: 'and having shod your feet with the preparation of the gospel of peace;' },
      { number: 16, text: 'in addition to all, taking up the shield of faith with which you will be able to extinguish all the flaming arrows of the evil one.' },
      { number: 17, text: 'And take the helmet of salvation, and the sword of the Spirit, which is the word of God.' },
      { number: 18, text: 'With all prayer and petition pray at all times in the Spirit, and with this in view, be on the alert with all perseverance and petition for all the saints,' },
    ],
  },
  'Philippians 4': {
    verses: [
      { number: 4, text: 'Rejoice in the Lord always; again I will say, rejoice!' },
      { number: 5, text: 'Let your gentle spirit be known to all men. The Lord is near.' },
      { number: 6, text: 'Be anxious for nothing, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.' },
      { number: 7, text: 'And the peace of God, which surpasses all comprehension, will guard your hearts and your minds in Christ Jesus.' },
      { number: 8, text: 'Finally, brethren, whatever is true, whatever is honorable, whatever is right, whatever is pure, whatever is lovely, whatever is of good repute, if there is any excellence and if anything worthy of praise, dwell on these things.' },
      { number: 9, text: 'The things you have learned and received and heard and seen in me, practice these things, and the God of peace will be with you.' },
      { number: 10, text: 'But I rejoiced in the Lord greatly, that now at last you have revived your concern for me; indeed, you were concerned before, but you lacked opportunity.' },
      { number: 11, text: 'Not that I speak from want, for I have learned to be content in whatever circumstances I am.' },
      { number: 12, text: 'I know how to get along with humble means, and I also know how to live in prosperity; in any and every circumstance I have learned the secret of being filled and going hungry, both of having abundance and suffering need.' },
      { number: 13, text: 'I can do all things through Him who strengthens me.' },
    ],
  },
  'Isaiah 40': {
    verses: [
      { number: 28, text: 'Do you not know? Have you not heard? The Everlasting God, the LORD, the Creator of the ends of the earth does not become weary or tired. His understanding is inscrutable.' },
      { number: 29, text: 'He gives strength to the weary, and to him who lacks might He increases power.' },
      { number: 30, text: 'Though youths grow weary and tired, and vigorous young men stumble badly,' },
      { number: 31, text: 'Yet those who wait for the LORD will gain new strength; they will mount up with wings like eagles, they will run and not get tired, they will walk and not become weary.' },
    ],
  },
};

// Popular audio chapters
const popularChapters = [
  { book: 'Romans', chapter: 8, title: 'Life in the Spirit', duration: '12 min' },
  { book: 'John', chapter: 1, title: 'The Word Became Flesh', duration: '8 min' },
  { book: 'John', chapter: 3, title: 'Born Again', duration: '10 min' },
  { book: 'Psalm', chapter: 23, title: 'The Lord is My Shepherd', duration: '3 min' },
  { book: 'Psalm', chapter: 91, title: 'Dwelling in the Shelter', duration: '5 min' },
  { book: 'Matthew', chapter: 5, title: 'The Beatitudes', duration: '6 min' },
  { book: 'Proverbs', chapter: 3, title: 'Trust in the Lord', duration: '4 min' },
  { book: 'Ephesians', chapter: 6, title: 'Armor of God', duration: '5 min' },
  { book: 'Philippians', chapter: 4, title: 'Rejoice in the Lord', duration: '5 min' },
  { book: 'Isaiah', chapter: 40, title: 'Strength for the Weary', duration: '3 min' },
  { book: 'Galatians', chapter: 3, title: 'Sons Through Faith', duration: '4 min' },
];

const AudioBible: React.FC<AudioBibleProps> = ({ onReadVerse }) => {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  
  // UI state
  const [selectedBook, setSelectedBook] = useState('Romans');
  const [selectedChapter, setSelectedChapter] = useState(8);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [highlightMode, setHighlightMode] = useState<'verse' | 'word'>('verse');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Refs
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const verseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  // Get current scripture
  const scriptureKey = `${selectedBook} ${selectedChapter}`;
  const currentScripture = extendedScriptures[scriptureKey];
  const verses = currentScripture?.verses || [];
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        // Prefer English voices
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        setAvailableVoices(englishVoices.length > 0 ? englishVoices : voices);
        
        // Select a good default voice
        const preferredVoice = englishVoices.find(v => 
          v.name.includes('Google') || 
          v.name.includes('Microsoft') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel')
        ) || englishVoices[0] || voices[0];
        
        if (preferredVoice && !selectedVoice) {
          setSelectedVoice(preferredVoice);
        }
      };
      
      loadVoices();
      synthRef.current.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);
  
  // Scroll to current verse
  useEffect(() => {
    if (isPlaying && verseRefs.current[currentVerseIndex]) {
      verseRefs.current[currentVerseIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentVerseIndex, isPlaying]);
  
  // Speak a verse
  const speakVerse = useCallback((verseIndex: number) => {
    if (!synthRef.current || !verses[verseIndex]) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const verse = verses[verseIndex];
    const utterance = new SpeechSynthesisUtterance(verse.text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = playbackSpeed;
    utterance.volume = isMuted ? 0 : volume;
    utterance.pitch = 1;
    
    // Word boundary tracking for word-by-word highlighting
    if (highlightMode === 'word') {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const words = verse.text.split(/\s+/);
          const charIndex = event.charIndex;
          let wordIndex = 0;
          let charCount = 0;
          
          for (let i = 0; i < words.length; i++) {
            charCount += words[i].length + 1;
            if (charCount > charIndex) {
              wordIndex = i;
              break;
            }
          }
          
          setCurrentWordIndex(wordIndex);
        }
      };
    }
    
    utterance.onend = () => {
      if (verseIndex < verses.length - 1 && autoPlay && !isPaused) {
        setCurrentVerseIndex(verseIndex + 1);
        speakVerse(verseIndex + 1);
      } else if (verseIndex === verses.length - 1) {
        if (isLooping) {
          setCurrentVerseIndex(0);
          speakVerse(0);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
        }
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
    };
    
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [verses, selectedVoice, playbackSpeed, volume, isMuted, autoPlay, isPaused, isLooping, highlightMode]);
  
  // Play/Pause controls
  const handlePlay = () => {
    if (!synthRef.current) return;
    
    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
      setIsPaused(false);
      speakVerse(currentVerseIndex);
    }
  };
  
  const handlePause = () => {
    if (synthRef.current) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };
  
  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVerseIndex(0);
    setCurrentWordIndex(0);
  };
  
  const handlePrevVerse = () => {
    if (currentVerseIndex > 0) {
      const newIndex = currentVerseIndex - 1;
      setCurrentVerseIndex(newIndex);
      setCurrentWordIndex(0);
      if (isPlaying) {
        if (synthRef.current) synthRef.current.cancel();
        speakVerse(newIndex);
      }
    }
  };
  
  const handleNextVerse = () => {
    if (currentVerseIndex < verses.length - 1) {
      const newIndex = currentVerseIndex + 1;
      setCurrentVerseIndex(newIndex);
      setCurrentWordIndex(0);
      if (isPlaying) {
        if (synthRef.current) synthRef.current.cancel();
        speakVerse(newIndex);
      }
    }
  };
  
  const handleVerseClick = (index: number) => {
    setCurrentVerseIndex(index);
    setCurrentWordIndex(0);
    if (isPlaying) {
      if (synthRef.current) synthRef.current.cancel();
      speakVerse(index);
    }
  };
  
  const handleChapterSelect = (book: string, chapter: number) => {
    handleStop();
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setShowBookSelector(false);
  };
  
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    
    // If currently playing, restart with new speed
    if (isPlaying && synthRef.current) {
      synthRef.current.cancel();
      speakVerse(currentVerseIndex);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current) {
      utteranceRef.current.volume = !isMuted ? 0 : volume;
    }
  };
  
  // Render word with highlighting
  const renderVerseText = (verse: Verse, verseIndex: number) => {
    if (highlightMode === 'word' && verseIndex === currentVerseIndex && isPlaying) {
      const words = verse.text.split(/(\s+)/);
      return words.map((word, wordIdx) => {
        const actualWordIndex = Math.floor(wordIdx / 2);
        const isCurrentWord = actualWordIndex === currentWordIndex && !word.match(/^\s+$/);
        
        return (
          <span
            key={wordIdx}
            className={`transition-colors duration-150 ${
              isCurrentWord ? 'bg-[#7c9a7a] text-[#f5f0e6] px-1 rounded' : ''
            }`}
          >
            {word}
          </span>
        );
      });
    }
    
    return verse.text;
  };
  
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  
  // Progress calculation
  const progress = verses.length > 0 ? ((currentVerseIndex + 1) / verses.length) * 100 : 0;
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#7c9a7a] to-[#4a5d4a] mb-4">
          <Headphones className="w-8 h-8 text-[#f5f0e6]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5f0e6] mb-2">
          Audio Bible
        </h1>
        <p className="text-[#f5f0e6]/70 max-w-2xl mx-auto">
          Listen to Scripture being read aloud. Follow along with highlighted text as you hear God's Word.
        </p>
      </div>
      
      {/* Quick Select Chapters */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#f5f0e6] mb-4 flex items-center space-x-2">
          <ListMusic className="w-5 h-5 text-[#9cb59c]" />
          <span>Popular Chapters</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {popularChapters.map((chapter, index) => {
            const key = `${chapter.book} ${chapter.chapter}`;
            const isAvailable = !!extendedScriptures[key];
            const isSelected = selectedBook === chapter.book && selectedChapter === chapter.chapter;
            
            return (
              <button
                key={index}
                onClick={() => isAvailable && handleChapterSelect(chapter.book, chapter.chapter)}
                disabled={!isAvailable}
                className={`p-4 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-[#7c9a7a] text-[#f5f0e6]'
                    : isAvailable
                    ? 'bg-[#4a5d4a] hover:bg-[#5c6f5c] text-[#f5f0e6]'
                    : 'bg-[#4a5d4a]/50 text-[#f5f0e6]/40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-semibold text-sm ${isSelected ? 'text-[#f5f0e6]' : ''}`}>
                      {chapter.book} {chapter.chapter}
                    </p>
                    <p className={`text-xs mt-1 ${isSelected ? 'text-[#f5f0e6]/70' : 'text-[#f5f0e6]/60'}`}>
                      {chapter.title}
                    </p>
                  </div>
                  <span className={`text-xs ${isSelected ? 'text-[#f5f0e6]/70' : 'text-[#d4a574]'}`}>
                    {chapter.duration}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Main Player Section */}
      <div className="bg-[#4a5d4a] rounded-2xl overflow-hidden shadow-xl">
        {/* Chapter Header */}
        <div className="p-4 sm:p-6 border-b border-[#7c9a7a]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-[#7c9a7a]/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#9cb59c]" />
              </div>
              <div>
                <button
                  onClick={() => setShowBookSelector(!showBookSelector)}
                  className="flex items-center space-x-2 text-xl font-serif font-bold text-[#f5f0e6] hover:text-[#9cb59c] transition-colors"
                >
                  <span>{selectedBook} {selectedChapter}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showBookSelector ? 'rotate-180' : ''}`} />
                </button>
                <p className="text-[#f5f0e6]/60 text-sm">
                  {verses.length} verses
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings ? 'bg-[#7c9a7a] text-[#f5f0e6]' : 'text-[#f5f0e6]/60 hover:text-[#f5f0e6] hover:bg-white/5'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
              
              {/* Minimize Button */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 rounded-lg text-[#f5f0e6]/60 hover:text-[#f5f0e6] hover:bg-white/5 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Book Selector Dropdown */}
          {showBookSelector && (
            <div className="mt-4 p-4 bg-[#3d4a4a] rounded-xl max-h-64 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[#9cb59c] font-semibold text-sm mb-2">Old Testament</h4>
                  <div className="space-y-1">
                    {oldTestament.slice(0, 10).map((book) => (
                      <button
                        key={book.name}
                        onClick={() => handleChapterSelect(book.name, 1)}
                        className="block w-full text-left px-2 py-1 text-sm text-[#f5f0e6]/80 hover:text-[#9cb59c] hover:bg-white/5 rounded transition-colors"
                      >
                        {book.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[#9cb59c] font-semibold text-sm mb-2">New Testament</h4>
                  <div className="space-y-1">
                    {newTestament.slice(0, 10).map((book) => (
                      <button
                        key={book.name}
                        onClick={() => handleChapterSelect(book.name, 1)}
                        className="block w-full text-left px-2 py-1 text-sm text-[#f5f0e6]/80 hover:text-[#9cb59c] hover:bg-white/5 rounded transition-colors"
                      >
                        {book.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-[#3d4a4a] rounded-xl space-y-4">
              {/* Voice Selection */}
              <div>
                <label className="block text-[#f5f0e6]/70 text-sm mb-2">Voice</label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = availableVoices.find(v => v.name === e.target.value);
                    if (voice) setSelectedVoice(voice);
                  }}
                  className="w-full px-3 py-2 bg-[#4a5d4a] border border-[#7c9a7a]/30 rounded-lg text-[#f5f0e6] text-sm focus:outline-none focus:border-[#9cb59c]"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Highlight Mode */}
              <div>
                <label className="block text-[#f5f0e6]/70 text-sm mb-2">Highlight Mode</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setHighlightMode('verse')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      highlightMode === 'verse'
                        ? 'bg-[#7c9a7a] text-[#f5f0e6]'
                        : 'bg-[#4a5d4a] text-[#f5f0e6]/70 hover:text-[#f5f0e6]'
                    }`}
                  >
                    Verse
                  </button>
                  <button
                    onClick={() => setHighlightMode('word')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      highlightMode === 'word'
                        ? 'bg-[#7c9a7a] text-[#f5f0e6]'
                        : 'bg-[#4a5d4a] text-[#f5f0e6]/70 hover:text-[#f5f0e6]'
                    }`}
                  >
                    Word by Word
                  </button>
                </div>
              </div>
              
              {/* Auto-play Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-[#f5f0e6]/70 text-sm">Auto-play next verse</span>
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    autoPlay ? 'bg-[#7c9a7a]' : 'bg-[#4a5d4a]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                    autoPlay ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              {/* Loop Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-[#f5f0e6]/70 text-sm">Loop chapter</span>
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    isLooping ? 'bg-[#7c9a7a]' : 'bg-[#4a5d4a]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                    isLooping ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Scripture Text Display */}
        {!isMinimized && (
          <div className="p-4 sm:p-6 max-h-96 overflow-y-auto bg-[#f5f0e6]">
            {verses.length > 0 ? (
              <div className="space-y-4">
                {verses.map((verse, index) => (
                  <div
                    key={verse.number}
                    ref={(el) => (verseRefs.current[index] = el)}
                    onClick={() => handleVerseClick(index)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      index === currentVerseIndex
                        ? 'bg-[#7c9a7a]/20 border-2 border-[#7c9a7a] shadow-lg'
                        : 'hover:bg-[#3d4a4a]/5 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${
                        index === currentVerseIndex
                          ? 'bg-[#7c9a7a] text-[#f5f0e6]'
                          : 'bg-[#3d4a4a]/10 text-[#5c4f42]/60'
                      }`}>
                        {verse.number}
                      </span>
                      <p className={`text-lg leading-relaxed font-serif ${
                        index === currentVerseIndex
                          ? 'text-[#3d4a4a] font-medium'
                          : 'text-[#5c4f42]/80'
                      }`}>
                        {renderVerseText(verse, index)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Book className="w-16 h-16 mx-auto text-[#5c4f42]/30 mb-4" />
                <p className="text-[#5c4f42]/60">
                  This chapter is not yet available for audio playback.
                </p>
                <p className="text-[#5c4f42]/40 text-sm mt-2">
                  Please select a chapter from the popular list above.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="h-1 bg-[#3d4a4a]">
          <div 
            className="h-full bg-gradient-to-r from-[#7c9a7a] to-[#9cb59c] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Playback Controls */}
        <div className="p-4 sm:p-6 bg-[#3d4a4a]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Verse Counter */}
            <div className="text-[#f5f0e6]/60 text-sm order-2 sm:order-1">
              <span className="text-[#9cb59c] font-semibold">{currentVerseIndex + 1}</span>
              <span> / {verses.length} verses</span>
            </div>
            
            {/* Main Controls */}
            <div className="flex items-center space-x-4 order-1 sm:order-2">
              {/* Loop */}
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2 rounded-lg transition-colors ${
                  isLooping ? 'text-[#9cb59c]' : 'text-[#f5f0e6]/40 hover:text-[#f5f0e6]'
                }`}
                title="Loop chapter"
              >
                <Repeat className="w-5 h-5" />
              </button>
              
              {/* Previous */}
              <button
                onClick={handlePrevVerse}
                disabled={currentVerseIndex === 0}
                className="p-3 rounded-full text-[#f5f0e6] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              {/* Play/Pause */}
              <button
                onClick={isPlaying && !isPaused ? handlePause : handlePlay}
                disabled={verses.length === 0}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c9a7a] to-[#4a5d4a] text-[#f5f0e6] flex items-center justify-center shadow-lg hover:shadow-[#7c9a7a]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {isPlaying && !isPaused ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>
              
              {/* Next */}
              <button
                onClick={handleNextVerse}
                disabled={currentVerseIndex === verses.length - 1}
                className="p-3 rounded-full text-[#f5f0e6] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>
              
              {/* Stop */}
              <button
                onClick={handleStop}
                className="p-2 rounded-lg text-[#f5f0e6]/40 hover:text-[#f5f0e6] transition-colors"
                title="Stop"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Speed & Volume Controls */}
            <div className="flex items-center space-x-4 order-3">
              {/* Speed Control */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-white/5 text-[#f5f0e6]/80 hover:text-[#f5f0e6] hover:bg-white/10 transition-colors"
                >
                  <Gauge className="w-4 h-4" />
                  <span className="text-sm font-medium">{playbackSpeed}x</span>
                </button>
                
                {showSpeedMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowSpeedMenu(false)}
                    />
                    <div className="absolute bottom-full mb-2 right-0 bg-[#4a5d4a] border border-[#7c9a7a]/30 rounded-xl shadow-xl z-50 overflow-hidden">
                      {speedOptions.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                            playbackSpeed === speed
                              ? 'bg-[#7c9a7a] text-[#f5f0e6]'
                              : 'text-[#f5f0e6] hover:bg-white/10'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-lg text-[#f5f0e6]/60 hover:text-[#f5f0e6] transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    setIsMuted(newVolume === 0);
                  }}
                  className="w-20 h-1 bg-[#f5f0e6]/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#9cb59c]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Mini Player (when minimized and playing) */}
      {isMinimized && isPlaying && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-[#4a5d4a] rounded-2xl shadow-2xl border border-[#7c9a7a]/30 p-4 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#7c9a7a]/30 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-[#9cb59c]" />
              </div>
              <div>
                <p className="text-[#f5f0e6] font-medium text-sm">
                  {selectedBook} {selectedChapter}:{verses[currentVerseIndex]?.number}
                </p>
                <p className="text-[#f5f0e6]/50 text-xs">
                  Verse {currentVerseIndex + 1} of {verses.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevVerse}
                disabled={currentVerseIndex === 0}
                className="p-2 text-[#f5f0e6]/60 hover:text-[#f5f0e6] disabled:opacity-30 transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={isPlaying && !isPaused ? handlePause : handlePlay}
                className="w-10 h-10 rounded-full bg-[#7c9a7a] text-[#f5f0e6] flex items-center justify-center"
              >
                {isPlaying && !isPaused ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <button
                onClick={handleNextVerse}
                disabled={currentVerseIndex === verses.length - 1}
                className="p-2 text-[#f5f0e6]/60 hover:text-[#f5f0e6] disabled:opacity-30 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(false)}
                className="p-2 text-[#f5f0e6]/60 hover:text-[#f5f0e6] transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Mini Progress Bar */}
          <div className="mt-3 h-1 bg-[#3d4a4a] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#9cb59c] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Tips Section */}
      <div className="mt-8 p-6 bg-[#4a5d4a] rounded-2xl">
        <h3 className="text-lg font-semibold text-[#f5f0e6] mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-[#9cb59c]" />
          <span>Audio Bible Tips</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-[#3d4a4a] rounded-xl">
            <h4 className="text-[#9cb59c] font-medium mb-2">Background Playback</h4>
            <p className="text-[#f5f0e6]/60 text-sm">
              Audio continues playing even when you scroll or navigate. Use the mini player for quick controls.
            </p>
          </div>
          <div className="p-4 bg-[#3d4a4a] rounded-xl">
            <h4 className="text-[#9cb59c] font-medium mb-2">Speed Control</h4>
            <p className="text-[#f5f0e6]/60 text-sm">
              Adjust playback speed from 0.5x to 2x. Slower speeds help with meditation and memorization.
            </p>
          </div>
          <div className="p-4 bg-[#3d4a4a] rounded-xl">
            <h4 className="text-[#9cb59c] font-medium mb-2">Follow Along</h4>
            <p className="text-[#f5f0e6]/60 text-sm">
              Click any verse to jump to it. The current verse is highlighted as it's being read.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioBible;
