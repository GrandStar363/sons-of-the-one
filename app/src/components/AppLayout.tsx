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
import SubscriptionModal from './SubscriptionModal';
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

// Navigation history entry type

interface NavigationHistoryEntry {
  section: string;
  scrollPosition: number;
  timestamp: number;
}



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
  
  // Subscription and Donation modals
  // Subscription and Donation modals
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [subscriptionStatusOpen, setSubscriptionStatusOpen] = useState(false);
  const [donationHistoryOpen, setDonationHistoryOpen] = useState(false);
  const [privateWorkspaceOpen, setPrivateWorkspaceOpen] = useState(false);




  // Navigation state
  const [currentSection, setCurrentSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Navigation history for back button functionality
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryEntry[]>([]);
  const isNavigatingBack = useRef(false);

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

  // Navigation handlers with history tracking
  const handleNavigate = (section: string) => {
    // Don't add to history if navigating back
    if (!isNavigatingBack.current) {
      // Save current scroll position and section to history
      const currentScrollPosition = window.scrollY;
      setNavigationHistory(prev => [
        ...prev,
        {
          section: currentSection,
          scrollPosition: currentScrollPosition,
          timestamp: Date.now()
        }
      ]);
    }
    isNavigatingBack.current = false;
    
    setCurrentSection(section);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle going back in navigation history
  const handleGoBack = () => {
    if (navigationHistory.length === 0) return;
    
    isNavigatingBack.current = true;
    
    // Get the last history entry
    const lastEntry = navigationHistory[navigationHistory.length - 1];
    
    // Remove the last entry from history
    setNavigationHistory(prev => prev.slice(0, -1));
    
    // Navigate to the previous section
    setCurrentSection(lastEntry.section);
    setMenuOpen(false);
    
    // Restore scroll position after a brief delay to allow content to render
    setTimeout(() => {
      window.scrollTo({ top: lastEntry.scrollPosition, behavior: 'smooth' });
    }, 100);
  };


  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearch(true);
  };

  const handleSelectBook = (book: string, chapter: number = 1) => {
    // Track navigation history when selecting a book
    if (!isNavigatingBack.current) {
      const currentScrollPosition = window.scrollY;
      setNavigationHistory(prev => [
        ...prev,
        {
          section: currentSection,
          scrollPosition: currentScrollPosition,
          timestamp: Date.now()
        }
      ]);
    }
    isNavigatingBack.current = false;
    
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setCurrentSection('bible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleNavigateChapter = (direction: 'prev' | 'next') => {
    if (!selectedBook || !selectedChapter) return;
    
    const book = allBooks.find(b => b.name === selectedBook);
    if (!book) return;

    if (direction === 'next') {
      if (selectedChapter < book.chapters) {
        setSelectedChapter(selectedChapter + 1);
      } else {
        const currentIndex = allBooks.findIndex(b => b.name === selectedBook);
        if (currentIndex < allBooks.length - 1) {
          setSelectedBook(allBooks[currentIndex + 1].name);
          setSelectedChapter(1);
        }
      }
    } else {
      if (selectedChapter > 1) {
        setSelectedChapter(selectedChapter - 1);
      } else {
        const currentIndex = allBooks.findIndex(b => b.name === selectedBook);
        if (currentIndex > 0) {
          const prevBook = allBooks[currentIndex - 1];
          setSelectedBook(prevBook.name);
          setSelectedChapter(prevBook.chapters);
        }
      }
    }
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
    <div className="min-h-screen bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929]">
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
        onOpenSubscription={() => setSubscriptionModalOpen(true)}
        onOpenDonation={() => setDonationModalOpen(true)}
        onOpenSubscriptionStatus={() => {
          if (user) {
            setSubscriptionStatusOpen(true);
          } else {
            setAuthModalOpen(true);
          }
        }}
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

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />

      {/* Donation Modal */}
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
      />

      {/* Subscription Status Modal */}
      <SubscriptionStatus
        isOpen={subscriptionStatusOpen}
        onClose={() => setSubscriptionStatusOpen(false)}
        email={user?.email || ''}
        onSubscribe={() => {
          setSubscriptionStatusOpen(false);
          setSubscriptionModalOpen(true);
        }}
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
                handleNavigate('bible');
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
            onOpenSubscription={() => setSubscriptionModalOpen(true)}
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
          />
        )}

        {currentSection === 'devotional-emails' && (
          <EmailDevotionalSubscription
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}


      </main>
















      {/* Back Button - Floating navigation */}
      <BackButton
        onClick={handleGoBack}
        show={navigationHistory.length > 0}
        previousSection={navigationHistory.length > 0 ? navigationHistory[navigationHistory.length - 1].section : undefined}
      />

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
