import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { featuredVerses } from '@/data/bibleData';
import { useAppContext, BIBLE_VERSIONS } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';
import { useSyncedState } from '@/hooks/useSyncedState';
import {
  Sun,
  Heart,
  Share2,
  Bell,
  BellOff,
  Mail,
  Copy,
  Check,
  BookOpen,
  Calendar,
  Clock,
  X,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Globe,
} from 'lucide-react';

interface VerseOfTheDayProps {
  user: User | null;
  onOpenAuth: () => void;
  onReadVerse: (reference: string) => void;
}

interface FavoriteVerse {
  id: string;
  reference: string;
  text: string;
  theme: string;
  saved_at: string;
}

interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  preferred_time: string;
}

// LocalStorage keys
const FAVORITES_KEY = 'verse_favorites';
const NOTIFICATION_PREFS_KEY = 'verse_notification_prefs';

// Get verse of the day based on date
const getVerseOfTheDay = (date: Date = new Date()) => {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const verseIndex = dayOfYear % featuredVerses.length;
  return featuredVerses[verseIndex];
};

// Get previous verses for history
const getPreviousVerses = (count: number = 7) => {
  const verses = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - i);
    verses.push({
      date: pastDate,
      verse: getVerseOfTheDay(pastDate),
    });
  }
  return verses;
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const VerseOfTheDay: React.FC<VerseOfTheDayProps> = ({
  user,
  onOpenAuth,
  onReadVerse,
}) => {
  const { selectedVersion, apiKeyConfigured } = useAppContext();
  const [todayVerse, setTodayVerse] = useState(getVerseOfTheDay());
  // Favourites and notification preferences are persisted to user_data
  // (verse_prefs); localStorage remains as an offline cache. Previously both
  // lived only in per-user localStorage keys and were lost with the browser.
  const [versePrefs, setVersePrefs] = useSyncedState<{
    favorites: FavoriteVerse[];
    notificationPrefs: NotificationPreferences;
  }>('verse_prefs_v2', 'verse_prefs', {
    favorites: [],
    notificationPrefs: { email_enabled: false, push_enabled: false, preferred_time: '07:00' },
  }, user);

  const favorites = versePrefs.favorites ?? [];
  const notificationPrefs = versePrefs.notificationPrefs ?? {
    email_enabled: false, push_enabled: false, preferred_time: '07:00',
  };
  const setFavorites = (f: FavoriteVerse[]) =>
    setVersePrefs(prev => ({ ...prev, favorites: f }));
  const setNotificationPrefs = (n: NotificationPreferences) =>
    setVersePrefs(prev => ({ ...prev, notificationPrefs: n }));
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  // Get the display version (KJV if API not configured for selected version)
  const displayVersion = selectedVersion.requiresApi && !apiKeyConfigured
    ? BIBLE_VERSIONS.find(v => v.isDefault) || selectedVersion
    : selectedVersion;

  // Check if push notifications are supported
  useEffect(() => {
    setPushSupported('Notification' in window && 'serviceWorker' in navigator);
  }, []);

  // One-time lift of the legacy per-user localStorage keys into the synced
  // object. After this the synced value is authoritative.
  const migratedPrefs = React.useRef(false);
  useEffect(() => {
    if (migratedPrefs.current) return;
    const hasSynced =
      (versePrefs.favorites && versePrefs.favorites.length > 0) ||
      versePrefs.notificationPrefs?.email_enabled ||
      versePrefs.notificationPrefs?.push_enabled;
    if (hasSynced) { migratedPrefs.current = true; return; }
    try {
      const legacyFav = localStorage.getItem(getStorageKey(FAVORITES_KEY));
      const legacyPrefs = localStorage.getItem(getStorageKey(NOTIFICATION_PREFS_KEY));
      if (legacyFav || legacyPrefs) {
        migratedPrefs.current = true;
        setVersePrefs(prev => ({
          favorites: legacyFav ? JSON.parse(legacyFav) : prev.favorites,
          notificationPrefs: legacyPrefs ? JSON.parse(legacyPrefs) : prev.notificationPrefs,
        }));
      }
    } catch (err) {
      console.warn('[VerseOfTheDay] legacy preference migration failed:', err);
    }
  }, [user, versePrefs, setVersePrefs]);

  // Check if today's verse is a favorite
  useEffect(() => {
    if (favorites.length > 0) {
      setIsFavorite(favorites.some((f) => f.reference === todayVerse.reference));
    } else {
      setIsFavorite(false);
    }
  }, [favorites, todayVerse]);

  const getStorageKey = (baseKey: string) => {
    // Use user ID if logged in, otherwise use a generic key
    return user ? `${baseKey}_${user.id}` : baseKey;
  };

  const loadFavorites = () => {
    try {
      const storageKey = getStorageKey(FAVORITES_KEY);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error loading favorites from localStorage:', err);
      setFavorites([]);
    }
  };

  // Kept so existing call sites are unchanged. Persistence now happens through
  // setFavorites -> useSyncedState; this only refreshes the legacy cache key.
  const saveFavoritesToStorage = (newFavorites: FavoriteVerse[]) => {
    try {
      localStorage.setItem(getStorageKey(FAVORITES_KEY), JSON.stringify(newFavorites));
    } catch (err) {
      console.error('Error saving favorites to localStorage:', err);
    }
  };

  const loadNotificationPrefs = () => {
    try {
      const storageKey = getStorageKey(NOTIFICATION_PREFS_KEY);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotificationPrefs(parsed);
      }
    } catch (err) {
      console.error('Error loading notification preferences from localStorage:', err);
    }
  };

  const saveNotificationPrefsToStorage = (prefs: NotificationPreferences) => {
    try {
      const storageKey = getStorageKey(NOTIFICATION_PREFS_KEY);
      localStorage.setItem(storageKey, JSON.stringify(prefs));
    } catch (err) {
      console.error('Error saving notification preferences to localStorage:', err);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const newFavorites = favorites.filter((f) => f.reference !== todayVerse.reference);
        setFavorites(newFavorites);
        saveFavoritesToStorage(newFavorites);
        setIsFavorite(false);
        toast({
          title: 'Removed from favorites',
          description: `${todayVerse.reference} has been removed from your collection.`,
        });
      } else {
        // Add to favorites
        const newFavorite: FavoriteVerse = {
          id: generateId(),
          reference: todayVerse.reference,
          text: todayVerse.text,
          theme: todayVerse.theme,
          saved_at: new Date().toISOString(),
        };
        const newFavorites = [newFavorite, ...favorites];
        setFavorites(newFavorites);
        saveFavoritesToStorage(newFavorites);
        setIsFavorite(true);
        toast({
          title: 'Added to favorites',
          description: `${todayVerse.reference} has been saved to your collection.`,
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (reference: string) => {
    try {
      const newFavorites = favorites.filter((f) => f.reference !== reference);
      setFavorites(newFavorites);
      saveFavoritesToStorage(newFavorites);
      if (reference === todayVerse.reference) {
        setIsFavorite(false);
      }
      toast({
        title: 'Removed',
        description: 'Verse removed from your favorites.',
      });
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const saveNotificationPrefs = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    try {
      if (notificationPrefs.push_enabled && pushSupported) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setNotificationPrefs((prev) => ({ ...prev, push_enabled: false }));
          toast({
            title: 'Permission denied',
            description: 'Push notifications require browser permission.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      // Save to localStorage
      saveNotificationPrefsToStorage(notificationPrefs);

      toast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated.',
      });
      setShowNotificationModal(false);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    const text = `"${todayVerse.text}"\n\n— ${todayVerse.reference} (${displayVersion.abbreviation})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Verse copied to clipboard.',
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToSocial = (platform: string) => {
    const text = `"${todayVerse.text}" — ${todayVerse.reference} (${displayVersion.abbreviation})`;
    const url = window.location.href;

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      email: `mailto:?subject=Verse of the Day - ${todayVerse.reference}&body=${encodeURIComponent(text)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const previousVerses = getPreviousVerses(7);

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 border border-[#F59E0B]/30 rounded-full mb-4">
            <Sun className="w-5 h-5 text-[#F59E0B]" />
            <span className="text-[#F59E0B] font-medium">Verse of the Day</span>
          </div>
          <p className="text-white/60 text-sm">{formatDate(new Date())}</p>
        </div>

        {/* Main Verse Card */}
        <div className="relative bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#F59E0B]/10 border border-[#14B8A6]/30 rounded-3xl p-8 sm:p-12 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F59E0B]/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#14B8A6]/10 to-transparent rounded-full blur-3xl" />

          {/* Theme Badge & Version Indicator */}
          <div className="relative flex flex-wrap justify-center items-center gap-3 mb-6">
            <span className="px-4 py-1.5 bg-gradient-to-r from-[#14B8A6]/30 to-[#0D9488]/30 border border-[#14B8A6]/40 rounded-full text-[#14B8A6] text-sm font-medium">
              {todayVerse.theme}
            </span>
            <span className="flex items-center space-x-1 px-3 py-1.5 bg-white/5 border border-white/20 rounded-full text-white/60 text-xs">
              <Globe className="w-3 h-3" />
              <span>{displayVersion.abbreviation}</span>
              {selectedVersion.id !== displayVersion.id && (
                <span className="text-amber-400">(default)</span>
              )}
            </span>
          </div>

          {/* Verse Text */}
          <div className="relative text-center mb-8">
            <svg
              className="w-8 h-8 text-[#F59E0B]/40 mx-auto mb-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-xl sm:text-2xl lg:text-3xl font-serif text-white leading-relaxed mb-6">
              {todayVerse.text}
            </p>
            <p className="text-[#F59E0B] font-semibold text-lg">
              — {todayVerse.reference}
            </p>
            <p className="text-white/40 text-sm mt-1">
              {displayVersion.name} ({displayVersion.abbreviation})
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative flex flex-wrap justify-center gap-3">
            {/* Read in Context */}
            <button
              onClick={() => onReadVerse(todayVerse.reference)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-medium rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all shadow-lg shadow-[#14B8A6]/20"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read in Context</span>
            </button>

            {/* Save to Favorites */}
            <button
              onClick={toggleFavorite}
              disabled={loading}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                isFavorite
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                  : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
              }`}
            >
              {isFavorite ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white/5 text-white/80 border border-white/20 rounded-xl hover:bg-white/10 transition-all font-medium"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              {/* Share Menu Dropdown */}
              {showShareMenu && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-[#0f2942] border border-[#14B8A6]/30 rounded-xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => shareToSocial('facebook')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-white/80 hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('twitter')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-white/80 hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('whatsapp')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-white/80 hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('email')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-white/80 hover:bg-white/10 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-[#EA4335]" />
                    <span>Email</span>
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-white/80 hover:bg-white/10 transition-colors border-t border-white/10"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 text-[#14B8A6]" />
                        <span className="text-[#14B8A6]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy to Clipboard</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                } else {
                  setShowNotificationModal(true);
                }
              }}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                notificationPrefs.email_enabled || notificationPrefs.push_enabled
                  ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/40'
                  : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
              }`}
            >
              {notificationPrefs.email_enabled || notificationPrefs.push_enabled ? (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Notifications On</span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4" />
                  <span>Get Notified</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center space-x-2 text-white/60 hover:text-white transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>{showHistory ? 'Hide History' : 'View Past Verses'}</span>
          </button>

          {favorites.length > 0 && (
            <button
              onClick={() => setShowFavoritesModal(true)}
              className="inline-flex items-center space-x-2 text-[#F59E0B] hover:text-[#D97706] transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>My Favorites ({favorites.length})</span>
            </button>
          )}
        </div>

        {/* History Section */}
        {showHistory && (
          <div className="mt-8 bg-[#0f2942]/50 border border-[#14B8A6]/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#14B8A6]" />
              <span>Previous Verses</span>
            </h3>
            <div className="space-y-4">
              {previousVerses.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => onReadVerse(item.verse.reference)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white/50 text-sm">
                      {item.date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="px-2 py-0.5 bg-[#14B8A6]/20 text-[#14B8A6] text-xs rounded-full">
                      {item.verse.theme}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm line-clamp-2 mb-1">
                    "{item.verse.text}"
                  </p>
                  <p className="text-[#F59E0B] text-sm font-medium">
                    — {item.verse.reference}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notification Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-[#14B8A6]/30 rounded-2xl max-w-md w-full p-6 relative">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#14B8A6]/20 flex items-center justify-center">
                  <Bell className="w-7 h-7 text-[#3B82F6]" />
                </div>
                <h3 className="text-xl font-bold text-white">Daily Verse Notifications</h3>
                <p className="text-white/60 text-sm mt-1">
                  Receive the Verse of the Day directly to your inbox or device
                </p>
              </div>

              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-[#EA4335]" />
                      <span className="text-white font-medium">Email Notifications</span>
                    </div>
                    <button
                      onClick={() =>
                        setNotificationPrefs((prev) => ({
                          ...prev,
                          email_enabled: !prev.email_enabled,
                        }))
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notificationPrefs.email_enabled ? 'bg-[#14B8A6]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          notificationPrefs.email_enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-white/50 text-sm">
                    Receive a daily email with the verse of the day
                  </p>
                </div>

                {/* Push Notifications */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-[#3B82F6]" />
                      <span className="text-white font-medium">Push Notifications</span>
                    </div>
                    <button
                      onClick={() =>
                        setNotificationPrefs((prev) => ({
                          ...prev,
                          push_enabled: !prev.push_enabled,
                        }))
                      }
                      disabled={!pushSupported}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notificationPrefs.push_enabled ? 'bg-[#14B8A6]' : 'bg-white/20'
                      } ${!pushSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          notificationPrefs.push_enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-white/50 text-sm">
                    {pushSupported
                      ? 'Get browser notifications on your device'
                      : 'Push notifications are not supported in this browser'}
                  </p>
                </div>

                {/* Preferred Time */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Clock className="w-5 h-5 text-[#F59E0B]" />
                    <span className="text-white font-medium">Preferred Time</span>
                  </div>
                  <input
                    type="time"
                    value={notificationPrefs.preferred_time}
                    onChange={(e) =>
                      setNotificationPrefs((prev) => ({
                        ...prev,
                        preferred_time: e.target.value,
                      }))
                    }
                    className="w-full bg-[#0c1929] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#14B8A6]"
                  />
                </div>
              </div>

              <button
                onClick={saveNotificationPrefs}
                disabled={loading}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* Favorites Modal */}
        {showFavoritesModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-[#14B8A6]/30 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden relative">
              <div className="p-6 border-b border-white/10">
                <button
                  onClick={() => setShowFavoritesModal(false)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">My Favorite Verses</h3>
                    <p className="text-white/60 text-sm">{favorites.length} saved verses</p>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {favorites.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50">No favorite verses yet</p>
                    <p className="text-white/30 text-sm mt-1">
                      Save verses you love to build your collection
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((fav) => (
                      <div
                        key={fav.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-0.5 bg-[#14B8A6]/20 text-[#14B8A6] text-xs rounded-full">
                            {fav.theme}
                          </span>
                          <button
                            onClick={() => removeFavorite(fav.reference)}
                            className="text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-white/80 text-sm mb-2 line-clamp-3">
                          "{fav.text}"
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-[#F59E0B] text-sm font-medium">
                            — {fav.reference}
                          </p>
                          <button
                            onClick={() => {
                              onReadVerse(fav.reference);
                              setShowFavoritesModal(false);
                            }}
                            className="text-[#14B8A6] text-sm hover:underline flex items-center space-x-1"
                          >
                            <span>Read</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-white/30 text-xs mt-2">
                          Saved {new Date(fav.saved_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </section>
  );
};

export default VerseOfTheDay;
