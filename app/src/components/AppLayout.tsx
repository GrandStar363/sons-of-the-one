import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSyncedState } from '@/hooks/useSyncedState';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Header from './Header';
import HeroSection from './HeroSection';
import VerseOfTheDay from './VerseOfTheDay';
import SalvationMessage from './SalvationMessage';
import OneSonOfMany from './OneSonOfMany';
import DailyDevotional from './DailyDevotional';
import LifeThroughSpiritualEyes from './LifeThroughSpiritualEyes';
import FeaturedVerses from './FeaturedVerses';
import TopicsSection from './TopicsSection';
import DiscipleshipTeaching from './DiscipleshipTeaching';
import DivineCallingBanner from './DivineCallingBanner';

import WWJDSection from './WWJDSection';
import ReadingPlans from './ReadingPlans';
import BibleNavigator from './BibleNavigator';
import ScriptureReader from './ScriptureReader';
import BookmarksSection from './BookmarksSection';
import SearchResults from './SearchResults';
import AuthModal from './AuthModal';
import BaptismJourney from './BaptismJourney';
import ScriptureMemory from './ScriptureMemory';
import PersonalJournal from './PersonalJournal';
import AudioBible from './AudioBible';
import VerseComparison from './VerseComparison';
import NotificationSettings from './NotificationSettings';
import ChurchFinder from './ChurchFinder';
import DailyBibleReadingPlan from './DailyBibleReadingPlan';
import Footer from './Footer';
import BibleVersionSelector from './BibleVersionSelector';
import FaithAndWonder from './FaithAndWonder';
import DonationModal from './DonationModal';
import SubscriptionStatus from './SubscriptionStatus';
import DonationHistory from './DonationHistory';
import BibleTrivia from './BibleTrivia';
import DailyTriviaChallenge from './DailyTriviaChallenge';
import TriviaSection from './TriviaSection';
import ContactUs from './ContactUs';
import UserProfile from './UserProfile';
import LessonsPage from './LessonsPage';
import CertificateSystem from './CertificateSystem';
import CommunityLeaderboard from './CommunityLeaderboard';
import AccessGate from './AccessGate';
import PrivateWorkspace from './PrivateWorkspace';
import DailyReminders from './DailyReminders';
import MultiplayerTrivia from './MultiplayerTrivia';
import TournamentOfDisciples from './TournamentOfDisciples';
import SpectatorMode from './SpectatorMode';
import TermsOfService from './TermsOfService';
// CommunityPrayerWall keeps prayers in React state only -- nothing persists.
// CommunityWall has identical props and writes to prayer_requests,
// declarations, declaration_amens, prayer_commitments and
// prayer_encouragements. It was orphaned in the fork; this restores it.
import CommunityWall from './CommunityWall';
import PrayerWallHighlight from './PrayerWallHighlight';
import EmailDevotionalSubscription from './EmailDevotionalSubscription';
import BackButton from './BackButton';
import OfflineIndicator from './OfflineIndicator';

import { allBooks } from '@/data/bibleData';
import {
  currentDepth, currentEntry, initHistory, isSubOpen, NavEntry, pushEntry, replaceEntry,
  SECTION_TITLES, sectionFromUrl, syncDepth, useBackStep,
} from '@/lib/backNav';

// Where each home-page Topic opens in the Bible (it used to open an empty
// "Select a Book" page).
const TOPIC_CHAPTERS: Record<string, string> = {
  'The Road to Salvation': 'Romans 10', 'Sons of God': 'Romans 8', 'Baptism': 'Romans 6',
  'New Life': '2 Corinthians 5', 'The Spirit': 'Galatians 5', 'Faith': 'Hebrews 11',
  'Love': '1 Corinthians 13', 'Salvation': 'Ephesians 2', 'Grace': 'Titus 2', 'Prayer': 'Matthew 6',
  'Wisdom': 'Proverbs 3', 'Peace': 'Philippians 4', 'Hope': 'Romans 15', 'Righteousness': 'Romans 3',
  'Redemption': 'Ephesians 1', 'Kingdom': 'Matthew 13', 'Eternal Life': 'John 3',
  'Forgiveness': 'Matthew 18', 'Obedience': 'John 14', 'Worship': 'Psalm 95',
  'Covenant': 'Jeremiah 31', 'Prophecy': 'Isaiah 53', 'Resurrection': '1 Corinthians 15',
  'Transformation': 'Romans 12',
};



interface AppLayoutProps {
  onNavigateToTerms?: () => void;
  onNavigateToPrivacy?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ onNavigateToTerms, onNavigateToPrivacy }) => {




  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Membership and Donation modals
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [subscriptionStatusOpen, setSubscriptionStatusOpen] = useState(false);
  const [donationHistoryOpen, setDonationHistoryOpen] = useState(false);
  const openMembership = () => (user ? setSubscriptionStatusOpen(true) : setAuthModalOpen(true));
  const [privateWorkspaceOpen, setPrivateWorkspaceOpen] = useState(false);




  // Navigation state
  const [currentSection, setCurrentSection] = useState(() => sectionFromUrl() ?? 'home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);


  // Bible reading state
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  // Type definitions for dated items
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

  // User data, held in the database and cached in localStorage for offline use.
  // See hooks/useSyncedState.ts -- the database is authoritative; the cache
  // exists so first paint is instant and offline edits survive.
  const [bookmarks, setBookmarks, bookmarksSync] = useSyncedState<BookmarkItem[]>(
    'sog-bookmarks', 'bookmarks', [], user);

  const [highlights, setHighlights, highlightsSync] = useSyncedState<HighlightItem[]>(
    'sog-highlights', 'highlights', [], user);

  const [notes, setNotes, notesSync] = useSyncedState<Record<string, NoteItem>>(
    'sog-notes', 'notes', {}, user);

  const [activePlan, setActivePlan, activePlanSync] = useSyncedState<string | null>(
    'sog-active-plan', 'active_plan', null, user);

  const [planProgress, setPlanProgress, planProgressSync] = useSyncedState<Record<string, number[]>>(
    'sog-plan-progress', 'plan_progress', {}, user);

  // Completed lessons state for certificate system
  const [completedLessons, setCompletedLessons, lessonsSync] = useSyncedState<string[]>(
    'sog-completed-lessons', 'completed_lessons', [], user);

  const dataLoaded =
    bookmarksSync.loaded && highlightsSync.loaded && notesSync.loaded &&
    activePlanSync.loaded && planProgressSync.loaded && lessonsSync.loaded;



  // Check auth state on mount
  useEffect(() => {
    setAuthLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);



  // Loading and persistence are handled by useSyncedState (see the state
  // declarations above). Famous shipped stubbed loadUserData/syncToDatabase
  // functions commented "database sync disabled due to missing table" -- but
  // user_data existed all along with exactly the right columns, so member data
  // never left the browser. The stubs and the localStorage-only write effects
  // they fed are gone; the sync indicator below now reflects real sync state.
  useEffect(() => {
    setSyncing(!dataLoaded);
  }, [dataLoaded]);

  // Auth handlers
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleAuthSuccess = () => {
    // Data will be loaded via the auth state change listener
  };

  // ---- Navigation ---------------------------------------------------------
  // Each page change is a browser history entry (see lib/backNav.ts), so the
  // phone's Back gesture, the browser's Back and the Back bar all work.
  const scrollAfterRender = (y: number) => {
    // Sections reload their content when you come back, which moves things for
    // a moment; keep putting you back where you were until it settles — but
    // stop as soon as you scroll yourself.
    let userScrolled = false;
    const stop = () => { userScrolled = true; };
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown', 'mousedown'] as const;
    events.forEach((ev) => window.addEventListener(ev, stop, { passive: true }));
    [60, 300, 700, 1200, 1800].forEach((t) => setTimeout(() => {
      if (!userScrolled && Math.abs(window.scrollY - y) > 30) window.scrollTo({ top: y });
    }, t));
    setTimeout(() => events.forEach((ev) => window.removeEventListener(ev, stop)), 2000);
  };

  useEffect(() => {
    initHistory({ section: currentSection });
    const onPop = (e: PopStateEvent) => {
      const entry = (e.state && e.state.sog ? e.state : null) as NavEntry | null;
      const before = syncDepth(entry);
      // An inner view that is no longer open (its page was left): skip past it.
      if (entry?.sub && !isSubOpen(entry.sub) && entry.depth < before) {
        window.history.back();
        return;
      }
      const section = entry?.section ?? 'home';
      setCurrentSection(section);
      if (section === 'bible' && entry?.book) {
        setSelectedBook(entry.book);
        setSelectedChapter(entry.chapter ?? 1);
      }
      setMenuOpen(false);
      scrollAfterRender(entry?.scrollY ?? 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigate = (section: string) => {
    setMenuOpen(false);
    if (section === currentSection && section !== 'bible') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    pushEntry({ section });
    setCurrentSection(section);
    window.scrollTo({ top: 0 });
  };

  // Back bar: one step back, or Home if this is the first page of the visit.
  const handleGoBack = () => {
    if (currentDepth() > 0) window.history.back();
    else handleNavigate('home');
  };

  // Phone Back also closes these overlays.
  useBackStep(showSearch, () => setShowSearch(false));
  useBackStep(authModalOpen, () => setAuthModalOpen(false));
  useBackStep(donationModalOpen, () => setDonationModalOpen(false));
  useBackStep(subscriptionStatusOpen, () => setSubscriptionStatusOpen(false));
  useBackStep(donationHistoryOpen, () => setDonationHistoryOpen(false));
  useBackStep(privateWorkspaceOpen, () => setPrivateWorkspaceOpen(false));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearch(true);
  };

  const handleSelectBook = (book: string, chapter: number = 1) => {
    setMenuOpen(false);
    const entry = currentEntry();
    if (currentSection === 'bible' && entry?.section === 'bible' && !entry.sub) {
      replaceEntry({ book, chapter }); // moving around inside the reader
    } else {
      pushEntry({ section: 'bible', book, chapter });
    }
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setCurrentSection('bible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleNavigateChapter = (direction: 'prev' | 'next') => {
    if (!selectedBook || !selectedChapter) return;
    
    const book = allBooks.find(b => b.name === selectedBook);
    if (!book) return;

    let nextBook = selectedBook;
    let nextChapter = selectedChapter;
    const currentIndex = allBooks.findIndex(b => b.name === selectedBook);
    if (direction === 'next') {
      if (selectedChapter < book.chapters) {
        nextChapter = selectedChapter + 1;
      } else if (currentIndex < allBooks.length - 1) {
        nextBook = allBooks[currentIndex + 1].name;
        nextChapter = 1;
      }
    } else {
      if (selectedChapter > 1) {
        nextChapter = selectedChapter - 1;
      } else if (currentIndex > 0) {
        nextBook = allBooks[currentIndex - 1].name;
        nextChapter = allBooks[currentIndex - 1].chapters;
      }
    }
    setSelectedBook(nextBook);
    setSelectedChapter(nextChapter);
    replaceEntry({ book: nextBook, chapter: nextChapter });
  };

  // Bookmark handlers - now with date tracking
  const handleToggleBookmark = (reference: string) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.reference === reference);
      if (exists) {
        return prev.filter(b => b.reference !== reference);
      } else {
        return [...prev, { reference, dateAdded: new Date().toISOString() }];
      }
    });
  };

  const handleToggleHighlight = (reference: string) => {
    setHighlights(prev => {
      const exists = prev.some(h => h.reference === reference);
      if (exists) {
        return prev.filter(h => h.reference !== reference);
      } else {
        return [...prev, { reference, dateAdded: new Date().toISOString() }];
      }
    });
  };

  const handleAddNote = (reference: string, note: string) => {
    setNotes(prev => ({ 
      ...prev, 
      [reference]: { text: note, dateAdded: new Date().toISOString() } 
    }));
  };

  const handleRemoveNote = (reference: string) => {
    setNotes(prev => {
      const newNotes = { ...prev };
      delete newNotes[reference];
      return newNotes;
    });
  };



  // Reading plan handlers
  const handleStartPlan = (planId: string) => {
    setActivePlan(planId);
  };

  const handleCompleteDay = (planId: string, day: number) => {
    setPlanProgress(prev => ({
      ...prev,
      [planId]: [...(prev[planId] || []), day]
    }));
  };

  // Parse reference and navigate
  const handleReadVerse = (reference: string) => {
    const match = reference.match(/^(.+?)\s+(\d+)/);
    if (match) {
      const bookName = match[1];
      const chapter = parseInt(match[2], 10);
      handleSelectBook(bookName, chapter);
    }
  };

  const handleSearchResultSelect = (reference: string) => {
    setShowSearch(false);
    setSearchQuery('');
    
    const book = allBooks.find(b => b.name === reference);
    if (book) {
      handleSelectBook(book.name, 1);
    } else {
      handleReadVerse(reference);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#14B8A6] via-[#0D9488] to-[#0F766E] flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access gate if user is not authenticated
  if (!user) {
    return <AccessGate onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    // overflow-x-clip: decorative glows and badges must never make the page
    // wider than a phone screen (it then slides sideways and cuts text off on
    // the right). `clip`, unlike `hidden`, doesn't break sticky elements.
    <div className="min-h-screen overflow-x-clip bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929]">
      {/* Header */}
      <Header
        onNavigate={handleNavigate}
        currentSection={currentSection}
        onSearch={handleSearch}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        menuOpen={menuOpen}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        syncing={syncing}
        onOpenSubscription={openMembership}
        onOpenDonation={() => setDonationModalOpen(true)}
        onOpenSubscriptionStatus={openMembership}
        onOpenDonationHistory={() => {
          setDonationHistoryOpen(true);
        }}
        onOpenProfile={() => handleNavigate('profile')}
        onOpenPrivateWorkspace={() => setPrivateWorkspaceOpen(true)}
      />

      {/* Private Workspace Modal - Only for Robert Dorsey */}
      <PrivateWorkspace
        isOpen={privateWorkspaceOpen}
        onClose={() => setPrivateWorkspaceOpen(false)}
      />




      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Donation Modal */}
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
      />

      {/* My Membership (plan, next charge, upgrade, cancel) */}
      <SubscriptionStatus
        isOpen={subscriptionStatusOpen}
        onClose={() => setSubscriptionStatusOpen(false)}
        email={user?.email || ''}
      />

      {/* Donation History Modal */}
      <DonationHistory
        isOpen={donationHistoryOpen}
        onClose={() => setDonationHistoryOpen(false)}
        userEmail={user?.email}
      />

      {/* Search Results Overlay */}
      {showSearch && (
        <SearchResults
          query={searchQuery}
          onClose={() => setShowSearch(false)}
          onSelectResult={handleSearchResultSelect}
        />
      )}


      {/* Main Content */}
      <main className="pt-16 sm:pt-20">
        {currentSection !== 'home' && (
          <BackButton
            onBack={handleGoBack}
            onHome={() => handleNavigate('home')}
            title={currentSection === 'bible' && selectedBook && selectedChapter
              ? `${selectedBook} ${selectedChapter}`
              : SECTION_TITLES[currentSection] ?? 'Sons of the One'}
          />
        )}

        {/* User Welcome Bar with Sign Out - Always visible when logged in */}
        {user && currentSection === 'home' && (
          <div className="bg-gradient-to-r from-[#14B8A6]/20 via-[#0f2942] to-[#F59E0B]/20 border-b border-[#14B8A6]/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {(user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      Welcome back, <span className="text-[#F59E0B]">{user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Friend'}</span>!
                    </p>
                    <p className="text-white/60 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleNavigate('profile')}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#14B8A6]/20 border border-[#14B8A6]/40 text-[#5EEAD4] font-medium rounded-lg hover:bg-[#14B8A6]/30 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-lg hover:from-[#D97706] hover:to-[#B45309] transition-all shadow-lg shadow-amber-500/25"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSection === 'home' && (
          <>
            <HeroSection
              onStartReading={() => handleSelectBook('Romans', 8)}
              onNavigateToSalvation={() => {
                const salvationSection = document.getElementById('salvation-section');
                salvationSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreTopics={() => {

                const topicsSection = document.getElementById('topics-section');
                topicsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              onNavigateToBaptism={() => handleNavigate('baptism')}
              onNavigateToMemory={() => handleNavigate('memory')}
              onNavigateToAudio={() => handleNavigate('audio')}
              onNavigateToCompare={() => handleNavigate('compare')}
              onNavigateToNotifications={() => handleNavigate('notifications')}
              onNavigateToDailyReading={() => handleNavigate('daily-reading')}
              onNavigateToJournal={() => handleNavigate('journal')}
            />


            {/* Prayer Wall Highlight - Bright and noticeable section */}
            <PrayerWallHighlight
              onNavigateToPrayerWall={() => handleNavigate('prayer-wall')}
              onReadVerse={handleReadVerse}
              onOpenAuth={() => setAuthModalOpen(true)}
              user={user}
            />

            {/* Verse of the Day - Prominent placement after hero */}
            <VerseOfTheDay
              user={user}
              onOpenAuth={() => setAuthModalOpen(true)}
              onReadVerse={handleReadVerse}
            />

            <div id="salvation-section">
              <SalvationMessage 
                onReadVerse={handleReadVerse}
                onNavigateToBaptism={() => handleNavigate('baptism')}
                onNavigateToChurches={() => handleNavigate('churches')}
              />
            </div>


            <OneSonOfMany onReadVerse={handleReadVerse} />
            <FaithAndWonder onReadVerse={handleReadVerse} />
            <LifeThroughSpiritualEyes onReadVerse={handleReadVerse} />
            <DailyDevotional onReadMore={handleReadVerse} />
            <DiscipleshipTeaching onReadVerse={handleReadVerse} />

            {/* Bible Trivia Section - After Memory/Teaching content */}
            {/* Bible Trivia Section - After Memory/Teaching content */}
            <TriviaSection
              onNavigateToTrivia={() => handleNavigate('trivia')}
              onNavigateToDailyChallenge={() => handleNavigate('daily-trivia')}
              onNavigateToMultiplayer={() => handleNavigate('multiplayer-trivia')}
              onNavigateToTournament={() => handleNavigate('tournament')}
              onNavigateToSpectator={() => handleNavigate('spectator')}
            />




            <WWJDSection 
              onReadVerse={handleReadVerse} 
              user={user}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
            <FeaturedVerses
              bookmarks={bookmarks}
              onToggleBookmark={handleToggleBookmark}
              onReadVerse={handleReadVerse}
            />
            <div id="topics-section">
              <TopicsSection onSelectTopic={(topic) => {
                const reference = TOPIC_CHAPTERS[topic];
                if (reference) handleReadVerse(reference);
                else handleNavigate('bible');
              }} />
            </div>
            
            {/* Divine Calling Banner - Motivational Section */}
            <DivineCallingBanner />
          </>
        )}




        {currentSection === 'wwjd' && (
          <WWJDSection 
            onReadVerse={handleReadVerse} 
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentSection === 'bible' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Navigator */}
              <div className="lg:col-span-1">
                <BibleNavigator
                  onSelectBook={handleSelectBook}
                  selectedBook={selectedBook}
                  selectedChapter={selectedChapter}
                />
              </div>

              {/* Reader */}
              <div className="lg:col-span-2">
                {selectedBook && selectedChapter ? (
                  <ScriptureReader
                    book={selectedBook}
                    chapter={selectedChapter}
                    bookmarks={bookmarks}
                    highlights={highlights}
                    notes={notes}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleHighlight={handleToggleHighlight}
                    onAddNote={handleAddNote}
                    onNavigate={handleNavigateChapter}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-8 sm:p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#14B8A6]/20 flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-4">
                      Select a Book to Begin
                    </h3>
                    <p className="text-white/60 mb-6 max-w-md mx-auto">
                      Choose a book from the navigator on the left to start reading. 
                      We recommend starting with Romans 8 to explore the theme of <span className="font-bold italic text-[#F59E0B]">sonship</span> and <span className="font-bold italic text-[#14B8A6]">discipleship</span>.
                    </p>
                    <button
                      onClick={() => handleSelectBook('Romans', 8)}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all glow-amber"
                    >
                      <span>Start with Romans 8</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentSection === 'plans' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <ReadingPlans
              activePlan={activePlan}
              planProgress={planProgress}
              onStartPlan={handleStartPlan}
              onCompleteDay={handleCompleteDay}
              onReadVerse={handleReadVerse}
            />
          </div>
        )}


        {currentSection === 'baptism' && (
          <BaptismJourney
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onReadVerse={handleReadVerse}
          />
        )}

        {currentSection === 'memory' && (
          <ScriptureMemory
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onReadVerse={handleReadVerse}
          />
        )}

        {currentSection === 'journal' && (
          <PersonalJournal
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}



        {currentSection === 'audio' && (
          <AudioBible onReadVerse={handleReadVerse} />
        )}

        {currentSection === 'compare' && (
          <VerseComparison onReadVerse={handleReadVerse} user={user} />
        )}

        {currentSection === 'bookmarks' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <BookmarksSection
              bookmarks={bookmarks}
              highlights={highlights}
              notes={notes}
              onRemoveBookmark={(ref) => setBookmarks(prev => prev.filter(b => b.reference !== ref))}
              onRemoveHighlight={(ref) => setHighlights(prev => prev.filter(h => h.reference !== ref))}
              onRemoveNote={handleRemoveNote}
              onNavigateToVerse={handleReadVerse}

            />
            
            {/* Sync Status for Bookmarks Section */}
            {user && (
              <div className="mt-6 text-center">
                <p className="text-white/50 text-sm">
                  {syncing ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="w-2 h-2 bg-[#14B8A6] rounded-full animate-pulse" />
                      <span>Syncing to cloud...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="w-2 h-2 bg-[#14B8A6] rounded-full" />
                      <span>All changes saved to cloud</span>
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {currentSection === 'notifications' && (
          <NotificationSettings
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentSection === 'churches' && (
          <ChurchFinder
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onNavigateToBaptism={() => handleNavigate('baptism')}
          />
        )}

        {currentSection === 'daily-reading' && (
          <DailyBibleReadingPlan
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onReadVerse={handleReadVerse}
          />
        )}

        {currentSection === 'faith-wonder' && (
          <FaithAndWonder onReadVerse={handleReadVerse} />
        )}

        {currentSection === 'trivia' && (
          <BibleTrivia
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onReadVerse={handleReadVerse}
          />
        )}

        {currentSection === 'daily-trivia' && (
          <DailyTriviaChallenge
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onReadVerse={handleReadVerse}
          />
        )}

        {currentSection === 'contact' && (
          <ContactUs user={user} />
        )}

        {currentSection === 'profile' && (
          <UserProfile
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onSignOut={handleSignOut}
            onOpenSubscription={openMembership}
            onOpenNotifications={() => handleNavigate('notifications')}
          />
        )}

        {currentSection === 'lessons' && (
          <LessonsPage
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onReadVerse={handleReadVerse}
          />
        )}

        {currentSection === 'certificates' && (
          <CertificateSystem
            user={user}
            completedLessons={completedLessons}
          />
        )}

        {currentSection === 'leaderboard' && (
          <CommunityLeaderboard
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentSection === 'daily-reminders' && (
          <DailyReminders
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}




        {currentSection === 'multiplayer-trivia' && (
          <MultiplayerTrivia />
        )}

        {currentSection === 'tournament' && (
          <TournamentOfDisciples />
        )}

        {currentSection === 'spectator' && (
          <SpectatorMode />
        )}

        {currentSection === 'terms-of-service' && (
          <TermsOfService onNavigateBack={() => handleNavigate('home')} />
        )}

        {currentSection === 'prayer-wall' && (
          <CommunityWall
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onReadVerse={handleReadVerse}
          />
        )}

        {currentSection === 'devotional-emails' && (
          <EmailDevotionalSubscription
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}


      </main>
















      {/* Offline Indicator - Shows connection status */}
      <OfflineIndicator />

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSelectBook={(book) => handleSelectBook(book, 1)}
      />
    </div>
  );
};

export default AppLayout;
