import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  Heart, 
  Plus, 
  X, 
  Clock, 
  Filter, 
  Send, 
  User as UserIcon, 
  UserX, 
  HandHeart,
  Sparkles,
  Shield,
  Users,
  Wallet,
  Leaf,
  Home,
  BookOpen,
  Sun,
  ChevronDown,
  Search,
  MessageCircle,
  Book
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import BibleVersionSelector from './BibleVersionSelector';

interface CommunityPrayerWallProps {
  user: User | null;
  onOpenAuth: () => void;
}

interface PrayerRequest {
  id: string;
  author: string;
  authorId: string;
  isAnonymous: boolean;
  category: string;
  title: string;
  content: string;
  prayedCount: number;
  prayedBy: string[];
  createdAt: Date;
  isAnswered: boolean;
}

const PRAYER_CATEGORIES = [
  { id: 'all', label: 'All Prayers', icon: Heart, color: 'from-rose-500 to-pink-500' },
  { id: 'healing', label: 'Healing', icon: Sparkles, color: 'from-emerald-500 to-teal-500' },
  { id: 'guidance', label: 'Guidance', icon: BookOpen, color: 'from-blue-500 to-indigo-500' },
  { id: 'thanksgiving', label: 'Thanksgiving', icon: Sun, color: 'from-amber-500 to-orange-500' },
  { id: 'protection', label: 'Protection', icon: Shield, color: 'from-purple-500 to-violet-500' },
  { id: 'family', label: 'Family', icon: Home, color: 'from-pink-500 to-rose-500' },
  { id: 'financial', label: 'Financial', icon: Wallet, color: 'from-green-500 to-emerald-500' },
  { id: 'spiritual-growth', label: 'Spiritual Growth', icon: Leaf, color: 'from-teal-500 to-cyan-500' },
  { id: 'relationships', label: 'Relationships', icon: Users, color: 'from-red-500 to-rose-500' },
];

// Verse translations for different Bible versions
const VERSE_TRANSLATIONS: Record<string, { james516b: string; philippians46: string }> = {
  kjv1611: {
    james516b: "The effectual fervent prayer of a righteous man availeth much.",
    philippians46: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God."
  },
  nkjv: {
    james516b: "The effective, fervent prayer of a righteous man avails much.",
    philippians46: "Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God."
  },
  niv: {
    james516b: "The prayer of a righteous person is powerful and effective.",
    philippians46: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."
  },
  esv: {
    james516b: "The prayer of a righteous person has great power as it is working.",
    philippians46: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God."
  },
  nasb: {
    james516b: "The effective prayer of a righteous man can accomplish much.",
    philippians46: "Be anxious for nothing, but in everything by prayer and supplication with thanksgiving let your requests be made known to God."
  },
  nlt: {
    james516b: "The earnest prayer of a righteous person has great power and produces wonderful results.",
    philippians46: "Don't worry about anything; instead, pray about everything. Tell God what you need, and thank him for all he has done."
  },
  amp: {
    james516b: "The heartfelt and persistent prayer of a righteous man (believer) can accomplish much [when put into action and made effective by God—it is dynamic and can have tremendous power].",
    philippians46: "Do not be anxious or worried about anything, but in everything [every circumstance and situation] by prayer and petition with thanksgiving, continue to make your [specific] requests known to God."
  }
};

// Sample prayer requests data
const samplePrayers: PrayerRequest[] = [
  {
    id: '1',
    author: 'Sarah M.',
    authorId: 'user1',
    isAnonymous: false,
    category: 'healing',
    title: 'Healing for my mother',
    content: 'Please pray for my mother who is battling cancer. She starts her treatment next week and we need strength and healing from our Heavenly Father.',
    prayedCount: 47,
    prayedBy: ['user2', 'user3', 'user4'],
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isAnswered: false,
  },
  {
    id: '2',
    author: 'Anonymous',
    authorId: 'user2',
    isAnonymous: true,
    category: 'guidance',
    title: 'Career decision',
    content: 'I have a major career decision to make. Please pray that God gives me wisdom and clarity to choose the path He has prepared for me.',
    prayedCount: 23,
    prayedBy: ['user1', 'user5'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isAnswered: false,
  },
  {
    id: '3',
    author: 'Michael J.',
    authorId: 'user3',
    isAnonymous: false,
    category: 'thanksgiving',
    title: 'Grateful for answered prayer!',
    content: 'Praise God! My wife and I have been trying to have a baby for 5 years, and we just found out we are expecting! Thank you all for your prayers!',
    prayedCount: 89,
    prayedBy: ['user1', 'user2', 'user4', 'user5'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    isAnswered: true,
  },
  {
    id: '4',
    author: 'Anonymous',
    authorId: 'user4',
    isAnonymous: true,
    category: 'protection',
    title: 'Safety for my family',
    content: 'We live in a difficult area and I worry about my children\'s safety. Please pray for God\'s protection over our home and family.',
    prayedCount: 34,
    prayedBy: ['user1', 'user3'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    isAnswered: false,
  },
  {
    id: '5',
    author: 'David K.',
    authorId: 'user5',
    isAnonymous: false,
    category: 'family',
    title: 'Reconciliation with my brother',
    content: 'My brother and I haven\'t spoken in 3 years due to a misunderstanding. Please pray that God softens our hearts and brings reconciliation.',
    prayedCount: 56,
    prayedBy: ['user2', 'user3', 'user4'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    isAnswered: false,
  },
  {
    id: '6',
    author: 'Grace L.',
    authorId: 'user6',
    isAnonymous: false,
    category: 'financial',
    title: 'Job opportunity',
    content: 'I was laid off last month and have been struggling to find work. Please pray that God opens doors and provides for my family\'s needs.',
    prayedCount: 72,
    prayedBy: ['user1', 'user2', 'user3', 'user5'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isAnswered: false,
  },
  {
    id: '7',
    author: 'Anonymous',
    authorId: 'user7',
    isAnonymous: true,
    category: 'spiritual-growth',
    title: 'Deeper relationship with God',
    content: 'I feel distant from God lately. Please pray that I find renewed passion for His Word and a deeper connection in prayer.',
    prayedCount: 41,
    prayedBy: ['user1', 'user4'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
    isAnswered: false,
  },
  {
    id: '8',
    author: 'Rebecca T.',
    authorId: 'user8',
    isAnonymous: false,
    category: 'relationships',
    title: 'Struggling marriage',
    content: 'My husband and I are going through a difficult season. Please pray for healing, communication, and that God restores our love.',
    prayedCount: 63,
    prayedBy: ['user2', 'user3', 'user5', 'user6'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    isAnswered: false,
  },
];

const CommunityPrayerWall: React.FC<CommunityPrayerWallProps> = ({ user, onOpenAuth }) => {
  const { selectedVersion } = useAppContext();
  const [prayers, setPrayers] = useState<PrayerRequest[]>(samplePrayers);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPrayerForm, setShowNewPrayerForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'mostPrayed'>('recent');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // New prayer form state
  const [newPrayerTitle, setNewPrayerTitle] = useState('');
  const [newPrayerContent, setNewPrayerContent] = useState('');
  const [newPrayerCategory, setNewPrayerCategory] = useState('guidance');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous';
  const userId = user?.id || 'guest';

  // Get verses based on selected version
  const currentVerses = VERSE_TRANSLATIONS[selectedVersion.id] || VERSE_TRANSLATIONS.kjv1611;

  // Format relative time
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Filter and sort prayers
  const filteredPrayers = prayers
    .filter(prayer => {
      const matchesCategory = selectedCategory === 'all' || prayer.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        prayer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prayer.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return b.prayedCount - a.prayedCount;
    });

  // Handle praying for a request
  const handlePrayFor = (prayerId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setPrayers(prev => prev.map(prayer => {
      if (prayer.id === prayerId) {
        const hasPrayed = prayer.prayedBy.includes(userId);
        return {
          ...prayer,
          prayedCount: hasPrayed ? prayer.prayedCount - 1 : prayer.prayedCount + 1,
          prayedBy: hasPrayed 
            ? prayer.prayedBy.filter(id => id !== userId)
            : [...prayer.prayedBy, userId]
        };
      }
      return prayer;
    }));
  };

  // Handle submitting a new prayer
  const handleSubmitPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!newPrayerTitle.trim() || !newPrayerContent.trim()) return;

    const newPrayer: PrayerRequest = {
      id: Date.now().toString(),
      author: isAnonymous ? 'Anonymous' : displayName,
      authorId: userId,
      isAnonymous,
      category: newPrayerCategory,
      title: newPrayerTitle.trim(),
      content: newPrayerContent.trim(),
      prayedCount: 0,
      prayedBy: [],
      createdAt: new Date(),
      isAnswered: false,
    };

    setPrayers(prev => [newPrayer, ...prev]);
    setNewPrayerTitle('');
    setNewPrayerContent('');
    setNewPrayerCategory('guidance');
    setIsAnonymous(false);
    setShowNewPrayerForm(false);
  };

  const getCategoryInfo = (categoryId: string) => {
    return PRAYER_CATEGORIES.find(c => c.id === categoryId) || PRAYER_CATEGORIES[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030609] via-[#040a11] to-[#030609] py-8 sm:py-12">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 mb-6">
            <HandHeart className="w-10 h-10 text-rose-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
            Community <span className="text-rose-400">Prayer Wall</span>
          </h1>
          <p className="text-white/70 max-w-3xl mx-auto text-lg leading-relaxed">
            "Confess your faults one to another, and pray one for another, that ye may be healed."
          </p>
          <p className="text-amber-400 font-bold italic text-4xl sm:text-5xl lg:text-6xl mt-6 leading-tight">
            "{currentVerses.james516b}"
          </p>
          <p className="text-amber-400 font-bold text-3xl sm:text-4xl mt-4">— James 5:16b ({selectedVersion.abbreviation})</p>

          {/* Bible Version Selector */}
          <div className="mt-8 flex justify-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center space-x-2 text-white/70">
                  <Book className="w-5 h-5 text-amber-400" />
                  <span className="font-medium">Select Bible Version:</span>
                </div>
                <BibleVersionSelector variant="dropdown" showDescription />
              </div>
            </div>
          </div>
        </div>


        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-rose-400">{prayers.length}</div>
            <div className="text-white/60 text-sm">Prayer Requests</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-amber-400">
              {prayers.reduce((sum, p) => sum + p.prayedCount, 0)}
            </div>
            <div className="text-white/60 text-sm">Prayers Lifted</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
              {prayers.filter(p => p.isAnswered).length}
            </div>
            <div className="text-white/60 text-sm">Answered Prayers</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400">
              {new Set(prayers.flatMap(p => p.prayedBy)).size}
            </div>
            <div className="text-white/60 text-sm">Prayer Warriors</div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prayer requests..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center justify-between w-full sm:w-48 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:border-rose-500/30 transition-all"
            >
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-rose-400" />
                <span>{getCategoryInfo(selectedCategory).label}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showCategoryDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#081420] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">

                  {PRAYER_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'text-white/80 hover:bg-white/5'
                      }`}
                    >
                      <category.icon className="w-4 h-4" />
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'mostPrayed')}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-500/50 cursor-pointer"
          >
            <option value="recent" className="bg-[#081420]">Most Recent</option>
            <option value="mostPrayed" className="bg-[#081420]">Most Prayed</option>
          </select>


          {/* New Prayer Button */}
          <button
            onClick={() => {
              if (!user) {
                onOpenAuth();
                return;
              }
              setShowNewPrayerForm(true);
            }}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/25"
          >
            <Plus className="w-5 h-5" />
            <span>Share Prayer Request</span>
          </button>
        </div>

        {/* Category Pills - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {PRAYER_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* New Prayer Form Modal */}
        {showNewPrayerForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-gradient-to-br from-[#081828] to-[#060c14] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden">

              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <HandHeart className="w-6 h-6 text-rose-400" />
                    <span>Share Your Prayer Request</span>
                  </h2>
                  <button
                    onClick={() => setShowNewPrayerForm(false)}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitPrayer} className="p-6 space-y-5">
                {/* Category Selection */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRAYER_CATEGORIES.filter(c => c.id !== 'all').map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setNewPrayerCategory(category.id)}
                        className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                          newPrayerCategory === category.id
                            ? `bg-gradient-to-r ${category.color} text-white`
                            : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <category.icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Prayer Title</label>
                  <input
                    type="text"
                    value={newPrayerTitle}
                    onChange={(e) => setNewPrayerTitle(e.target.value)}
                    placeholder="Brief title for your prayer request..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Your Prayer Request</label>
                  <textarea
                    value={newPrayerContent}
                    onChange={(e) => setNewPrayerContent(e.target.value)}
                    placeholder="Share what's on your heart..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none"
                    required
                  />
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center space-x-3">
                    {isAnonymous ? (
                      <UserX className="w-5 h-5 text-amber-400" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-teal-400" />
                    )}
                    <div>
                      <p className="text-white font-medium">
                        {isAnonymous ? 'Post Anonymously' : `Post as ${displayName}`}
                      </p>
                      <p className="text-white/50 text-sm">
                        {isAnonymous ? 'Your name will not be shown' : 'Your name will be visible'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      isAnonymous ? 'bg-amber-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        isAnonymous ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!newPrayerTitle.trim() || !newPrayerContent.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  <span>Submit Prayer Request</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Prayer Requests List */}
        <div className="space-y-4">
          {filteredPrayers.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No prayer requests found</h3>
              <p className="text-white/60 mb-6">
                {searchQuery ? 'Try a different search term' : 'Be the first to share a prayer request'}
              </p>
              <button
                onClick={() => {
                  if (!user) {
                    onOpenAuth();
                    return;
                  }
                  setShowNewPrayerForm(true);
                }}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Share Prayer Request</span>
              </button>
            </div>
          ) : (
            filteredPrayers.map(prayer => {
              const categoryInfo = getCategoryInfo(prayer.category);
              const hasPrayed = prayer.prayedBy.includes(userId);

              return (
                <div
                  key={prayer.id}
                  className={`bg-gradient-to-br from-white/5 to-white/[0.02] border rounded-2xl p-6 transition-all hover:border-rose-500/30 ${
                    prayer.isAnswered ? 'border-emerald-500/30' : 'border-white/10'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center`}>
                        {prayer.isAnonymous ? (
                          <UserX className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-white font-bold">
                            {prayer.author.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{prayer.author}</p>
                        <div className="flex items-center space-x-2 text-white/50 text-sm">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(prayer.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {prayer.isAnswered && (
                        <span className="flex items-center space-x-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full">
                          <Sparkles className="w-4 h-4" />
                          <span>Answered!</span>
                        </span>
                      )}
                      <span className={`flex items-center space-x-1 px-3 py-1 bg-gradient-to-r ${categoryInfo.color} bg-opacity-20 text-white text-sm font-medium rounded-full`}>
                        <categoryInfo.icon className="w-4 h-4" />
                        <span>{categoryInfo.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-2">{prayer.title}</h3>
                  <p className="text-white/70 leading-relaxed mb-4">{prayer.content}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <button
                      onClick={() => handlePrayFor(prayer.id)}
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                        hasPrayed
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                          : 'bg-white/5 text-white/70 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${hasPrayed ? 'fill-current' : ''}`} />
                      <span>{hasPrayed ? 'Prayed!' : 'I Prayed'}</span>
                    </button>

                    <div className="flex items-center space-x-2 text-white/60">
                      <HandHeart className="w-5 h-5 text-rose-400" />
                      <span className="font-medium">
                        <span className="text-rose-400">{prayer.prayedCount}</span> people prayed
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>




        {/* Scripture Encouragement */}
        <div className="mt-12 p-8 sm:p-12 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20 rounded-2xl text-center">
          <p className="text-white/80 text-lg italic mb-4">
            "{currentVerses.philippians46}"
          </p>
          <p className="text-rose-400 font-semibold mb-8">— Philippians 4:6 ({selectedVersion.abbreviation})</p>
          
          {/* James 5:16b - EXTRA LARGE, BOLD, and GOLD - Identical to Top Verse */}
          <p className="text-amber-400 font-bold italic text-4xl sm:text-5xl lg:text-6xl mt-10 leading-tight">
            "{currentVerses.james516b}"
          </p>
          <p className="text-amber-400 font-bold text-3xl sm:text-4xl mt-4">— James 5:16b ({selectedVersion.abbreviation})</p>
        </div>

      </div>
    </div>
  );
};

export default CommunityPrayerWall;
