import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Lock, Globe, BookOpen, MessageSquare, 
  Bookmark, Highlighter, Heart, Settings, Link2, Mail, Copy, Check,
  ChevronRight, ArrowLeft, Pin, Send, Trash2, Crown, Shield, User,
  Calendar, Clock, Share2, X, AlertCircle, Sparkles, HandHeart
} from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface BibleStudyGroupsProps {
  user: SupabaseUser | null;
  onOpenAuth: () => void;
  onReadVerse: (reference: string) => void;
}

interface Group {
  id: string;
  name: string;
  description: string;
  cover_image: string;
  reading_plan_id: string;
  reading_plan_name: string;
  is_private: boolean;
  invite_code: string;
  created_by: string;
  created_by_name: string;
  member_count: number;
  created_at: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

interface Discussion {
  id: string;
  group_id: string;
  title: string;
  content: string;
  scripture_reference: string;
  reading_plan_day: number;
  author_id: string;
  author_name: string;
  author_avatar: string;
  reply_count: number;
  is_pinned: boolean;
  created_at: string;
}

interface DiscussionReply {
  id: string;
  discussion_id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  created_at: string;
}

interface SharedBookmark {
  id: string;
  group_id: string;
  book: string;
  chapter: number;
  verse: number;
  verse_text: string;
  note: string;
  shared_by_id: string;
  shared_by_name: string;
  created_at: string;
}

interface SharedHighlight {
  id: string;
  group_id: string;
  book: string;
  chapter: number;
  verse: number;
  verse_text: string;
  highlight_color: string;
  insight: string;
  shared_by_id: string;
  shared_by_name: string;
  created_at: string;
}

interface GroupPrayer {
  id: string;
  group_id: string;
  title: string;
  description: string;
  is_urgent: boolean;
  is_answered: boolean;
  answered_testimony: string;
  author_id: string;
  author_name: string;
  praying_count: number;
  created_at: string;
  answered_at: string;
}

// Reading plans data
// Reading plans data
const readingPlans = [
  { id: 'sonship-discipleship', name: 'Sonship & Discipleship Journey', duration: '21 days' },
  { id: 'wwjd-lifestyle', name: 'WWJD Lifestyle', duration: '30 days' },
  { id: 'baptism-new-life', name: 'Baptism & New Life', duration: '14 days' },
  { id: 'romans-deep-dive', name: 'Romans Deep Dive', duration: '28 days' },
  { id: 'gospel-of-john', name: 'Gospel of John', duration: '21 days' },
  { id: 'psalms-worship', name: 'Psalms of Worship', duration: '30 days' },
];


// Sample groups for demo
const sampleGroups: Group[] = [
  {
    id: '1',
    name: 'Sons of Light Fellowship',
    description: 'A group dedicated to understanding our identity as sons of God and walking in the light of His truth.',
    cover_image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800',
    reading_plan_id: 'sonship-identity',
    reading_plan_name: 'Sonship Identity Journey',
    is_private: false,
    invite_code: 'abc123xyz',
    created_by: 'user1',
    created_by_name: 'Robert',
    member_count: 24,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'WWJD Daily Walkers',
    description: 'Committed to asking "What Would Jesus Do?" in every situation and living out His example daily.',
    cover_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    reading_plan_id: 'wwjd-lifestyle',
    reading_plan_name: 'WWJD Lifestyle',
    is_private: false,
    invite_code: 'def456uvw',
    created_by: 'user2',
    created_by_name: 'Sarah',
    member_count: 18,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'New Life in Christ',
    description: 'Exploring the transformative power of baptism and what it means to be a new creation in Christ.',
    cover_image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800',
    reading_plan_id: 'baptism-new-life',
    reading_plan_name: 'Baptism & New Life',
    is_private: true,
    invite_code: 'ghi789rst',
    created_by: 'user3',
    created_by_name: 'Michael',
    member_count: 12,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Romans Study Circle',
    description: 'Deep diving into Paul\'s letter to the Romans, understanding grace, faith, and our position in Christ.',
    cover_image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    reading_plan_id: 'romans-deep-dive',
    reading_plan_name: 'Romans Deep Dive',
    is_private: false,
    invite_code: 'jkl012mno',
    created_by: 'user4',
    created_by_name: 'David',
    member_count: 31,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample discussions
const sampleDiscussions: Discussion[] = [
  {
    id: 'd1',
    group_id: '1',
    title: 'What does it mean to be "led by the Spirit"?',
    content: 'Romans 8:14 says "For all who are being led by the Spirit of God, these are sons of God." I\'ve been meditating on this verse and wondering - how do we practically know when we\'re being led by the Spirit versus our own desires?',
    scripture_reference: 'Romans 8:14',
    reading_plan_day: 5,
    author_id: 'user1',
    author_name: 'Robert',
    author_avatar: '',
    reply_count: 8,
    is_pinned: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'd2',
    group_id: '1',
    title: 'The Spirit of Adoption',
    content: 'I was struck by verse 15 - "you have received a spirit of adoption as sons by which we cry out, \'Abba! Father!\'" The intimacy of calling God "Abba" is so powerful. Has anyone else experienced this shift in how they relate to God?',
    scripture_reference: 'Romans 8:15',
    reading_plan_day: 6,
    author_id: 'user5',
    author_name: 'Grace',
    author_avatar: '',
    reply_count: 12,
    is_pinned: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'd3',
    group_id: '1',
    title: 'Heirs with Christ - What does this mean practically?',
    content: 'Romans 8:17 tells us we are "heirs of God and fellow heirs with Christ." This is an incredible statement! What do you think our inheritance includes, and how should this affect how we live today?',
    scripture_reference: 'Romans 8:17',
    reading_plan_day: 7,
    author_id: 'user6',
    author_name: 'James',
    author_avatar: '',
    reply_count: 5,
    is_pinned: false,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample shared bookmarks
const sampleBookmarks: SharedBookmark[] = [
  {
    id: 'b1',
    group_id: '1',
    book: 'Romans',
    chapter: 8,
    verse: 14,
    verse_text: 'For all who are being led by the Spirit of God, these are sons of God.',
    note: 'This is our identity verse! We ARE sons of God.',
    shared_by_id: 'user1',
    shared_by_name: 'Robert',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'b2',
    group_id: '1',
    book: 'Galatians',
    chapter: 3,
    verse: 26,
    verse_text: 'For you are all sons of God through faith in Christ Jesus.',
    note: 'Faith is the key - through faith we become sons!',
    shared_by_id: 'user5',
    shared_by_name: 'Grace',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample shared highlights
const sampleHighlights: SharedHighlight[] = [
  {
    id: 'h1',
    group_id: '1',
    book: 'Romans',
    chapter: 8,
    verse: 28,
    verse_text: 'And we know that God causes all things to work together for good to those who love God, to those who are called according to His purpose.',
    highlight_color: 'yellow',
    insight: 'Even in trials, God is working for our good as His sons!',
    shared_by_id: 'user6',
    shared_by_name: 'James',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample group prayers
const samplePrayers: GroupPrayer[] = [
  {
    id: 'p1',
    group_id: '1',
    title: 'Wisdom for a difficult decision',
    description: 'I\'m facing a major career decision and need wisdom to know God\'s will. Please pray that I would be led by the Spirit.',
    is_urgent: false,
    is_answered: false,
    answered_testimony: '',
    author_id: 'user5',
    author_name: 'Grace',
    praying_count: 7,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    answered_at: '',
  },
  {
    id: 'p2',
    group_id: '1',
    title: 'Healing for my father',
    description: 'My father was diagnosed with a serious illness. Praying for complete healing and peace for our family.',
    is_urgent: true,
    is_answered: false,
    answered_testimony: '',
    author_id: 'user6',
    author_name: 'James',
    praying_count: 15,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    answered_at: '',
  },
  {
    id: 'p3',
    group_id: '1',
    title: 'Found a new job!',
    description: 'Was praying for employment for months.',
    is_urgent: false,
    is_answered: true,
    answered_testimony: 'God provided an amazing job opportunity that I never expected! He truly works all things for good.',
    author_id: 'user1',
    author_name: 'Robert',
    praying_count: 12,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    answered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample members
const sampleMembers: GroupMember[] = [
  { id: 'm1', group_id: '1', user_id: 'user1', user_name: 'Robert', user_avatar: '', role: 'admin', joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'm2', group_id: '1', user_id: 'user5', user_name: 'Grace', user_avatar: '', role: 'moderator', joined_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'm3', group_id: '1', user_id: 'user6', user_name: 'James', user_avatar: '', role: 'member', joined_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'm4', group_id: '1', user_id: 'user7', user_name: 'Mary', user_avatar: '', role: 'member', joined_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'm5', group_id: '1', user_id: 'user8', user_name: 'John', user_avatar: '', role: 'member', joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

const BibleStudyGroups: React.FC<BibleStudyGroupsProps> = ({ user, onOpenAuth, onReadVerse }) => {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<'discussions' | 'bookmarks' | 'prayers' | 'members' | 'settings'>('discussions');
  const [searchQuery, setSearchQuery] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [groups, setGroups] = useState<Group[]>(sampleGroups);
  const [myGroups, setMyGroups] = useState<string[]>(['1']); // User is member of group 1
  const [discussions, setDiscussions] = useState<Discussion[]>(sampleDiscussions);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [bookmarks, setBookmarks] = useState<SharedBookmark[]>(sampleBookmarks);
  const [highlights, setHighlights] = useState<SharedHighlight[]>(sampleHighlights);
  const [prayers, setPrayers] = useState<GroupPrayer[]>(samplePrayers);
  const [members, setMembers] = useState<GroupMember[]>(sampleMembers);
  const [prayingFor, setPrayingFor] = useState<string[]>([]);

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupPlan, setNewGroupPlan] = useState('');
  const [newGroupPrivate, setNewGroupPrivate] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [newDiscussionScripture, setNewDiscussionScripture] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');
  const [newPrayerTitle, setNewPrayerTitle] = useState('');
  const [newPrayerDescription, setNewPrayerDescription] = useState('');
  const [newPrayerUrgent, setNewPrayerUrgent] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [showNewPrayer, setShowNewPrayer] = useState(false);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Anonymous';

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!newGroupName.trim()) return;

    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      description: newGroupDescription,
      cover_image: '',
      reading_plan_id: newGroupPlan,
      reading_plan_name: readingPlans.find(p => p.id === newGroupPlan)?.name || '',
      is_private: newGroupPrivate,
      invite_code: Math.random().toString(36).substring(2, 14),
      created_by: user.id,
      created_by_name: displayName,
      member_count: 1,
      created_at: new Date().toISOString(),
    };

    setGroups([newGroup, ...groups]);
    setMyGroups([...myGroups, newGroup.id]);
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupPlan('');
    setNewGroupPrivate(false);
    setSelectedGroup(newGroup);
    setView('detail');
  };

  const handleJoinGroup = (groupId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!myGroups.includes(groupId)) {
      setMyGroups([...myGroups, groupId]);
      setGroups(groups.map(g => 
        g.id === groupId ? { ...g, member_count: g.member_count + 1 } : g
      ));
    }
  };

  const handleJoinByCode = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const group = groups.find(g => g.invite_code === joinCode);
    if (group) {
      handleJoinGroup(group.id);
      setShowJoinModal(false);
      setJoinCode('');
      setSelectedGroup(group);
      setView('detail');
    }
  };

  const handleLeaveGroup = (groupId: string) => {
    setMyGroups(myGroups.filter(id => id !== groupId));
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, member_count: Math.max(0, g.member_count - 1) } : g
    ));
    if (selectedGroup?.id === groupId) {
      setView('list');
      setSelectedGroup(null);
    }
  };

  const handleCreateDiscussion = () => {
    if (!user || !selectedGroup || !newDiscussionTitle.trim()) return;

    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      group_id: selectedGroup.id,
      title: newDiscussionTitle,
      content: newDiscussionContent,
      scripture_reference: newDiscussionScripture,
      reading_plan_day: 0,
      author_id: user.id,
      author_name: displayName,
      author_avatar: '',
      reply_count: 0,
      is_pinned: false,
      created_at: new Date().toISOString(),
    };

    setDiscussions([newDiscussion, ...discussions]);
    setNewDiscussionTitle('');
    setNewDiscussionContent('');
    setNewDiscussionScripture('');
    setShowNewDiscussion(false);
  };

  const handleCreateReply = () => {
    if (!user || !selectedDiscussion || !newReplyContent.trim()) return;

    const newReply: DiscussionReply = {
      id: Date.now().toString(),
      discussion_id: selectedDiscussion.id,
      content: newReplyContent,
      author_id: user.id,
      author_name: displayName,
      author_avatar: '',
      created_at: new Date().toISOString(),
    };

    setReplies([...replies, newReply]);
    setDiscussions(discussions.map(d => 
      d.id === selectedDiscussion.id ? { ...d, reply_count: d.reply_count + 1 } : d
    ));
    setNewReplyContent('');
  };

  const handleCreatePrayer = () => {
    if (!user || !selectedGroup || !newPrayerTitle.trim()) return;

    const newPrayer: GroupPrayer = {
      id: Date.now().toString(),
      group_id: selectedGroup.id,
      title: newPrayerTitle,
      description: newPrayerDescription,
      is_urgent: newPrayerUrgent,
      is_answered: false,
      answered_testimony: '',
      author_id: user.id,
      author_name: displayName,
      praying_count: 0,
      created_at: new Date().toISOString(),
      answered_at: '',
    };

    setPrayers([newPrayer, ...prayers]);
    setNewPrayerTitle('');
    setNewPrayerDescription('');
    setNewPrayerUrgent(false);
    setShowNewPrayer(false);
  };

  const handlePrayFor = (prayerId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (prayingFor.includes(prayerId)) {
      setPrayingFor(prayingFor.filter(id => id !== prayerId));
      setPrayers(prayers.map(p => 
        p.id === prayerId ? { ...p, praying_count: Math.max(0, p.praying_count - 1) } : p
      ));
    } else {
      setPrayingFor([...prayingFor, prayerId]);
      setPrayers(prayers.map(p => 
        p.id === prayerId ? { ...p, praying_count: p.praying_count + 1 } : p
      ));
    }
  };

  const handleCopyInviteLink = () => {
    if (!selectedGroup) return;
    const link = `${window.location.origin}/join/${selectedGroup.invite_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;
    // In production, this would send an email via edge function
    alert(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-[#d4af37]" />;
      case 'moderator': return <Shield className="w-4 h-4 text-blue-400" />;
      default: return <User className="w-4 h-4 text-[#f5f1e8]/50" />;
    }
  };

  // Group List View
  if (view === 'list') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#d4af37]/20 rounded-full mb-6">
            <Users className="w-5 h-5 text-[#d4af37]" />
            <span className="text-[#d4af37] font-medium">Bible Study Groups</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5f1e8] mb-4">
            Fellowship of <span className="text-[#d4af37]">Sons</span>
          </h1>
          <p className="text-[#f5f1e8]/70 max-w-2xl mx-auto">
            Join a community of believers studying God's Word together. Share insights, 
            pray for one another, and grow in your identity as sons of God.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#f5f1e8]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center space-x-2 px-4 py-3 border border-[#d4af37]/50 text-[#d4af37] rounded-xl hover:bg-[#d4af37]/10 transition-colors"
            >
              <Link2 className="w-5 h-5" />
              <span>Join with Code</span>
            </button>
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                  return;
                }
                setView('create');
              }}
              className="flex items-center space-x-2 px-4 py-3 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Group</span>
            </button>
          </div>
        </div>

        {/* My Groups */}
        {myGroups.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-serif font-bold text-[#f5f1e8] mb-4">My Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.filter(g => myGroups.includes(g.id)).map((group) => (
                <div
                  key={group.id}
                  className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-2xl overflow-hidden hover:border-[#d4af37]/40 transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedGroup(group);
                    setView('detail');
                  }}
                >
                  <div className="h-32 bg-gradient-to-br from-[#d4af37]/30 to-[#1a2332] relative">
                    {group.is_private && (
                      <div className="absolute top-3 right-3 p-2 bg-[#1a2332]/80 rounded-full">
                        <Lock className="w-4 h-4 text-[#d4af37]" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[#f5f1e8] mb-2 group-hover:text-[#d4af37] transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-[#f5f1e8]/60 text-sm mb-4 line-clamp-2">{group.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-[#f5f1e8]/50">
                        <Users className="w-4 h-4" />
                        <span>{group.member_count} members</span>
                      </div>
                      {group.reading_plan_name && (
                        <div className="flex items-center space-x-1 text-[#d4af37]">
                          <BookOpen className="w-4 h-4" />
                          <span className="text-xs truncate max-w-[100px]">{group.reading_plan_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discover Groups */}
        <div>
          <h2 className="text-xl font-serif font-bold text-[#f5f1e8] mb-4">Discover Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.filter(g => !g.is_private || myGroups.includes(g.id)).map((group) => (
              <div
                key={group.id}
                className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-2xl overflow-hidden hover:border-[#d4af37]/40 transition-all"
              >
                <div className="h-32 bg-gradient-to-br from-[#d4af37]/20 to-[#1a2332] relative">
                  {group.is_private && (
                    <div className="absolute top-3 right-3 p-2 bg-[#1a2332]/80 rounded-full">
                      <Lock className="w-4 h-4 text-[#d4af37]" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#f5f1e8] mb-2">{group.name}</h3>
                  <p className="text-[#f5f1e8]/60 text-sm mb-4 line-clamp-2">{group.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-[#f5f1e8]/50 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{group.member_count} members</span>
                    </div>
                    {myGroups.includes(group.id) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroup(group);
                          setView('detail');
                        }}
                        className="px-4 py-2 bg-[#d4af37]/20 text-[#d4af37] text-sm rounded-lg hover:bg-[#d4af37]/30 transition-colors"
                      >
                        View
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinGroup(group.id);
                        }}
                        className="px-4 py-2 bg-[#d4af37] text-[#1a2332] text-sm font-medium rounded-lg hover:bg-[#d4af37]/90 transition-colors"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1a2332] border border-[#d4af37]/30 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-bold text-[#f5f1e8]">Join with Invite Code</h3>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="p-2 text-[#f5f1e8]/60 hover:text-[#f5f1e8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter invite code..."
                className="w-full px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] mb-4"
              />
              <button
                onClick={handleJoinByCode}
                disabled={!joinCode.trim()}
                className="w-full py-3 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Group
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Create Group View
  if (view === 'create') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <button
          onClick={() => setView('list')}
          className="flex items-center space-x-2 text-[#f5f1e8]/60 hover:text-[#d4af37] mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Groups</span>
        </button>

        <div className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-serif font-bold text-[#f5f1e8] mb-6">Create a New Study Group</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-[#f5f1e8]/80 text-sm font-medium mb-2">Group Name *</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g., Sons of Light Fellowship"
                className="w-full px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-[#f5f1e8]/80 text-sm font-medium mb-2">Description</label>
              <textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="What is this group about?"
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] resize-none"
              />
            </div>

            <div>
              <label className="block text-[#f5f1e8]/80 text-sm font-medium mb-2">Reading Plan (Optional)</label>
              <select
                value={newGroupPlan}
                onChange={(e) => setNewGroupPlan(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] focus:outline-none focus:border-[#d4af37]"
              >
                <option value="" className="bg-[#1a2332]">No reading plan</option>
                {readingPlans.map((plan) => (
                  <option key={plan.id} value={plan.id} className="bg-[#1a2332]">
                    {plan.name} ({plan.duration})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setNewGroupPrivate(!newGroupPrivate)}
                className={`w-12 h-6 rounded-full transition-colors ${newGroupPrivate ? 'bg-[#d4af37]' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${newGroupPrivate ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <div>
                <p className="text-[#f5f1e8] font-medium">Private Group</p>
                <p className="text-[#f5f1e8]/50 text-sm">Only people with the invite code can join</p>
              </div>
            </div>

            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              className="w-full py-4 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Group
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Group Detail View
  if (view === 'detail' && selectedGroup) {
    const groupDiscussions = discussions.filter(d => d.group_id === selectedGroup.id);
    const groupBookmarks = bookmarks.filter(b => b.group_id === selectedGroup.id);
    const groupHighlights = highlights.filter(h => h.group_id === selectedGroup.id);
    const groupPrayers = prayers.filter(p => p.group_id === selectedGroup.id);
    const groupMembers = members.filter(m => m.group_id === selectedGroup.id);
    const isMember = myGroups.includes(selectedGroup.id);
    const isAdmin = groupMembers.find(m => m.user_id === user?.id)?.role === 'admin';

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <button
          onClick={() => {
            setView('list');
            setSelectedGroup(null);
            setSelectedDiscussion(null);
          }}
          className="flex items-center space-x-2 text-[#f5f1e8]/60 hover:text-[#d4af37] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Groups</span>
        </button>

        {/* Group Header */}
        <div className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-2xl overflow-hidden mb-8">
          <div className="h-40 sm:h-56 bg-gradient-to-br from-[#d4af37]/30 to-[#1a2332] relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="w-20 h-20 text-[#d4af37]/30" />
            </div>
            {selectedGroup.is_private && (
              <div className="absolute top-4 right-4 flex items-center space-x-2 px-3 py-1.5 bg-[#1a2332]/80 rounded-full">
                <Lock className="w-4 h-4 text-[#d4af37]" />
                <span className="text-[#d4af37] text-sm">Private</span>
              </div>
            )}
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5f1e8] mb-2">
                  {selectedGroup.name}
                </h1>
                <p className="text-[#f5f1e8]/60 mb-4">{selectedGroup.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#f5f1e8]/50">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{selectedGroup.member_count} members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(selectedGroup.created_at)}</span>
                  </div>
                  {selectedGroup.reading_plan_name && (
                    <div className="flex items-center space-x-2 text-[#d4af37]">
                      <BookOpen className="w-4 h-4" />
                      <span>{selectedGroup.reading_plan_name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isMember ? (
                  <>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 border border-[#d4af37]/50 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/10 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Invite</span>
                    </button>
                    <button
                      onClick={() => handleLeaveGroup(selectedGroup.id)}
                      className="px-4 py-2 border border-red-400/50 text-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
                    >
                      Leave
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleJoinGroup(selectedGroup.id)}
                    className="flex items-center space-x-2 px-6 py-3 bg-[#d4af37] text-[#1a2332] font-semibold rounded-lg hover:bg-[#d4af37]/90 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Join Group</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'discussions', label: 'Discussions', icon: MessageSquare },
            { id: 'bookmarks', label: 'Bookmarks & Highlights', icon: Bookmark },
            { id: 'prayers', label: 'Prayer Board', icon: HandHeart },
            { id: 'members', label: 'Members', icon: Users },
            ...(isAdmin ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#d4af37]/20 text-[#d4af37]'
                  : 'text-[#f5f1e8]/60 hover:text-[#f5f1e8] hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'discussions' && (
          <div>
            {/* Discussion Thread View */}
            {selectedDiscussion ? (
              <div>
                <button
                  onClick={() => setSelectedDiscussion(null)}
                  className="flex items-center space-x-2 text-[#f5f1e8]/60 hover:text-[#d4af37] mb-6 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Discussions</span>
                </button>

                <div className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-2xl p-6 mb-6">
                  {selectedDiscussion.is_pinned && (
                    <div className="flex items-center space-x-2 text-[#d4af37] text-sm mb-3">
                      <Pin className="w-4 h-4" />
                      <span>Pinned</span>
                    </div>
                  )}
                  <h2 className="text-xl font-serif font-bold text-[#f5f1e8] mb-3">
                    {selectedDiscussion.title}
                  </h2>
                  <p className="text-[#f5f1e8]/80 mb-4">{selectedDiscussion.content}</p>
                  {selectedDiscussion.scripture_reference && (
                    <button
                      onClick={() => onReadVerse(selectedDiscussion.scripture_reference)}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 bg-[#d4af37]/20 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/30 transition-colors text-sm mb-4"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{selectedDiscussion.scripture_reference}</span>
                    </button>
                  )}
                  <div className="flex items-center space-x-3 text-sm text-[#f5f1e8]/50">
                    <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center">
                      <span className="text-[#1a2332] font-semibold text-sm">
                        {selectedDiscussion.author_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[#f5f1e8]">{selectedDiscussion.author_name}</span>
                    <span>•</span>
                    <span>{formatDate(selectedDiscussion.created_at)}</span>
                  </div>
                </div>

                {/* Replies */}
                <div className="space-y-4 mb-6">
                  {replies.filter(r => r.discussion_id === selectedDiscussion.id).map((reply) => (
                    <div key={reply.id} className="bg-[#f5f1e8]/5 border border-[#d4af37]/10 rounded-xl p-4 ml-8">
                      <p className="text-[#f5f1e8]/80 mb-3">{reply.content}</p>
                      <div className="flex items-center space-x-3 text-sm text-[#f5f1e8]/50">
                        <div className="w-6 h-6 rounded-full bg-[#d4af37]/50 flex items-center justify-center">
                          <span className="text-[#1a2332] font-semibold text-xs">
                            {reply.author_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{reply.author_name}</span>
                        <span>•</span>
                        <span>{formatDate(reply.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                {isMember && (
                  <div className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-xl p-4">
                    <textarea
                      value={newReplyContent}
                      onChange={(e) => setNewReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] resize-none mb-3"
                    />
                    <button
                      onClick={handleCreateReply}
                      disabled={!newReplyContent.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#d4af37] text-[#1a2332] font-medium rounded-lg hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* New Discussion Button */}
                {isMember && (
                  <div className="mb-6">
                    {showNewDiscussion ? (
                      <div className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-[#f5f1e8] mb-4">Start a Discussion</h3>
                        <input
                          type="text"
                          value={newDiscussionTitle}
                          onChange={(e) => setNewDiscussionTitle(e.target.value)}
                          placeholder="Discussion title..."
                          className="w-full px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] mb-3"
                        />
                        <textarea
                          value={newDiscussionContent}
                          onChange={(e) => setNewDiscussionContent(e.target.value)}
                          placeholder="Share your thoughts..."
                          rows={4}
                          className="w-full px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] resize-none mb-3"
                        />
                        <input
                          type="text"
                          value={newDiscussionScripture}
                          onChange={(e) => setNewDiscussionScripture(e.target.value)}
                          placeholder="Scripture reference (optional, e.g., Romans 8:14)"
                          className="w-full px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] mb-4"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleCreateDiscussion}
                            disabled={!newDiscussionTitle.trim()}
                            className="flex items-center space-x-2 px-4 py-2 bg-[#d4af37] text-[#1a2332] font-medium rounded-lg hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            <span>Post Discussion</span>
                          </button>
                          <button
                            onClick={() => setShowNewDiscussion(false)}
                            className="px-4 py-2 text-[#f5f1e8]/60 hover:text-[#f5f1e8] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowNewDiscussion(true)}
                        className="flex items-center space-x-2 px-4 py-3 bg-[#d4af37]/20 text-[#d4af37] rounded-xl hover:bg-[#d4af37]/30 transition-colors w-full justify-center"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Start a Discussion</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Discussions List */}
                <div className="space-y-4">
                  {groupDiscussions.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-[#f5f1e8]/20 mx-auto mb-4" />
                      <p className="text-[#f5f1e8]/50">No discussions yet. Start the conversation!</p>
                    </div>
                  ) : (
                    groupDiscussions.map((discussion) => (
                      <div
                        key={discussion.id}
                        onClick={() => setSelectedDiscussion(discussion)}
                        className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-xl p-5 cursor-pointer hover:border-[#d4af37]/40 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            {discussion.is_pinned && (
                              <div className="flex items-center space-x-1 text-[#d4af37] text-xs mb-2">
                                <Pin className="w-3 h-3" />
                                <span>Pinned</span>
                              </div>
                            )}
                            <h3 className="text-lg font-semibold text-[#f5f1e8] mb-2">{discussion.title}</h3>
                            <p className="text-[#f5f1e8]/60 text-sm line-clamp-2">{discussion.content}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#f5f1e8]/40 flex-shrink-0 ml-4" />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3 text-[#f5f1e8]/50">
                            <span>{discussion.author_name}</span>
                            <span>•</span>
                            <span>{formatDate(discussion.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[#f5f1e8]/50">
                            <MessageSquare className="w-4 h-4" />
                            <span>{discussion.reply_count}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shared Bookmarks */}
            <div>
              <h3 className="text-lg font-semibold text-[#f5f1e8] mb-4 flex items-center space-x-2">
                <Bookmark className="w-5 h-5 text-[#d4af37]" />
                <span>Shared Bookmarks</span>
              </h3>
              {groupBookmarks.length === 0 ? (
                <div className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-xl p-8 text-center">
                  <Bookmark className="w-10 h-10 text-[#f5f1e8]/20 mx-auto mb-3" />
                  <p className="text-[#f5f1e8]/50">No shared bookmarks yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-xl p-4"
                    >
                      <button
                        onClick={() => onReadVerse(`${bookmark.book} ${bookmark.chapter}:${bookmark.verse}`)}
                        className="text-[#d4af37] font-medium hover:underline mb-2"
                      >
                        {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                      </button>
                      <p className="text-[#f5f1e8]/80 text-sm italic mb-2">"{bookmark.verse_text}"</p>
                      {bookmark.note && (
                        <p className="text-[#f5f1e8]/60 text-sm mb-2">{bookmark.note}</p>
                      )}
                      <p className="text-[#f5f1e8]/40 text-xs">
                        Shared by {bookmark.shared_by_name} • {formatDate(bookmark.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shared Highlights */}
            <div>
              <h3 className="text-lg font-semibold text-[#f5f1e8] mb-4 flex items-center space-x-2">
                <Highlighter className="w-5 h-5 text-yellow-400" />
                <span>Shared Highlights</span>
              </h3>
              {groupHighlights.length === 0 ? (
                <div className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-xl p-8 text-center">
                  <Highlighter className="w-10 h-10 text-[#f5f1e8]/20 mx-auto mb-3" />
                  <p className="text-[#f5f1e8]/50">No shared highlights yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupHighlights.map((highlight) => (
                    <div
                      key={highlight.id}
                      className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-xl p-4"
                    >
                      <button
                        onClick={() => onReadVerse(`${highlight.book} ${highlight.chapter}:${highlight.verse}`)}
                        className="text-[#d4af37] font-medium hover:underline mb-2"
                      >
                        {highlight.book} {highlight.chapter}:{highlight.verse}
                      </button>
                      <p className={`text-sm italic mb-2 px-2 py-1 rounded bg-${highlight.highlight_color}-400/20 text-[#f5f1e8]`}>
                        "{highlight.verse_text}"
                      </p>
                      {highlight.insight && (
                        <p className="text-[#f5f1e8]/60 text-sm mb-2">{highlight.insight}</p>
                      )}
                      <p className="text-[#f5f1e8]/40 text-xs">
                        Shared by {highlight.shared_by_name} • {formatDate(highlight.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prayers' && (
          <div>
            {/* New Prayer Button */}
            {isMember && (
              <div className="mb-6">
                {showNewPrayer ? (
                  <div className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#f5f1e8] mb-4">Share a Prayer Request</h3>
                    <input
                      type="text"
                      value={newPrayerTitle}
                      onChange={(e) => setNewPrayerTitle(e.target.value)}
                      placeholder="Prayer request title..."
                      className="w-full px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] mb-3"
                    />
                    <textarea
                      value={newPrayerDescription}
                      onChange={(e) => setNewPrayerDescription(e.target.value)}
                      placeholder="Share more details (optional)..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37] resize-none mb-3"
                    />
                    <div className="flex items-center space-x-3 mb-4">
                      <button
                        onClick={() => setNewPrayerUrgent(!newPrayerUrgent)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                          newPrayerUrgent
                            ? 'border-red-400 bg-red-400/20 text-red-400'
                            : 'border-[#d4af37]/30 text-[#f5f1e8]/60 hover:border-[#d4af37]/50'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Urgent</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCreatePrayer}
                        disabled={!newPrayerTitle.trim()}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#d4af37] text-[#1a2332] font-medium rounded-lg hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50"
                      >
                        <HandHeart className="w-4 h-4" />
                        <span>Submit Request</span>
                      </button>
                      <button
                        onClick={() => setShowNewPrayer(false)}
                        className="px-4 py-2 text-[#f5f1e8]/60 hover:text-[#f5f1e8] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewPrayer(true)}
                    className="flex items-center space-x-2 px-4 py-3 bg-[#d4af37]/20 text-[#d4af37] rounded-xl hover:bg-[#d4af37]/30 transition-colors w-full justify-center"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Share a Prayer Request</span>
                  </button>
                )}
              </div>
            )}

            {/* Prayers List */}
            <div className="space-y-4">
              {groupPrayers.length === 0 ? (
                <div className="text-center py-12">
                  <HandHeart className="w-12 h-12 text-[#f5f1e8]/20 mx-auto mb-4" />
                  <p className="text-[#f5f1e8]/50">No prayer requests yet. Share your needs with the group!</p>
                </div>
              ) : (
                groupPrayers.map((prayer) => (
                  <div
                    key={prayer.id}
                    className={`border rounded-xl p-5 ${
                      prayer.is_answered
                        ? 'bg-green-500/10 border-green-500/30'
                        : prayer.is_urgent
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-[#f5f1e8]/5 border-[#d4af37]/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          {prayer.is_answered && (
                            <span className="flex items-center space-x-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                              <Sparkles className="w-3 h-3" />
                              <span>Answered!</span>
                            </span>
                          )}
                          {prayer.is_urgent && !prayer.is_answered && (
                            <span className="flex items-center space-x-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                              <AlertCircle className="w-3 h-3" />
                              <span>Urgent</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-[#f5f1e8]">{prayer.title}</h3>
                      </div>
                    </div>
                    {prayer.description && (
                      <p className="text-[#f5f1e8]/70 mb-3">{prayer.description}</p>
                    )}
                    {prayer.is_answered && prayer.answered_testimony && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3">
                        <p className="text-green-400 text-sm font-medium mb-1">Testimony:</p>
                        <p className="text-[#f5f1e8]/80 text-sm">{prayer.answered_testimony}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-sm text-[#f5f1e8]/50">
                        <span>{prayer.author_name}</span>
                        <span>•</span>
                        <span>{formatDate(prayer.created_at)}</span>
                      </div>
                      {!prayer.is_answered && (
                        <button
                          onClick={() => handlePrayFor(prayer.id)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            prayingFor.includes(prayer.id)
                              ? 'bg-[#d4af37] text-[#1a2332]'
                              : 'bg-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/30'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${prayingFor.includes(prayer.id) ? 'fill-current' : ''}`} />
                          <span>{prayer.praying_count} praying</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupMembers.map((member) => (
              <div
                key={member.id}
                className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-xl p-4 flex items-center space-x-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#1a2332] font-semibold text-lg">
                    {member.user_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-[#f5f1e8] font-medium truncate">{member.user_name}</p>
                    {getRoleIcon(member.role)}
                  </div>
                  <p className="text-[#f5f1e8]/50 text-sm capitalize">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && isAdmin && (
          <div className="max-w-2xl">
            <div className="bg-[#f5f1e8]/5 border border-[#d4af37]/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#f5f1e8] mb-6">Group Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[#f5f1e8]/80 text-sm font-medium mb-2">Invite Code</label>
                  <div className="flex items-center space-x-3">
                    <code className="flex-1 px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#d4af37] font-mono">
                      {selectedGroup.invite_code}
                    </code>
                    <button
                      onClick={handleCopyInviteLink}
                      className="p-3 bg-[#d4af37]/20 text-[#d4af37] rounded-xl hover:bg-[#d4af37]/30 transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#f5f1e8]/80 text-sm font-medium mb-2">Shareable Link</label>
                  <div className="flex items-center space-x-3">
                    <code className="flex-1 px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8]/60 text-sm truncate">
                      {window.location.origin}/join/{selectedGroup.invite_code}
                    </code>
                    <button
                      onClick={handleCopyInviteLink}
                      className="p-3 bg-[#d4af37]/20 text-[#d4af37] rounded-xl hover:bg-[#d4af37]/30 transition-colors"
                    >
                      <Link2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1a2332] border border-[#d4af37]/30 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-bold text-[#f5f1e8]">Invite to Group</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 text-[#f5f1e8]/60 hover:text-[#f5f1e8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Shareable Link */}
              <div className="mb-6">
                <label className="block text-[#f5f1e8]/80 text-sm font-medium mb-2">Share Link</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white/5 border border-[#d4af37]/30 rounded-lg text-[#f5f1e8]/60 text-sm truncate">
                    {window.location.origin}/join/{selectedGroup?.invite_code}
                  </code>
                  <button
                    onClick={handleCopyInviteLink}
                    className="p-2 bg-[#d4af37] text-[#1a2332] rounded-lg hover:bg-[#d4af37]/90 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#d4af37]/20" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-[#1a2332] text-[#f5f1e8]/50 text-sm">or</span>
                </div>
              </div>

              {/* Email Invite */}
              <div>
                <label className="block text-[#f5f1e8]/80 text-sm font-medium mb-2">Invite by Email</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="flex-1 px-4 py-3 bg-white/5 border border-[#d4af37]/30 rounded-xl text-[#f5f1e8] placeholder-[#f5f1e8]/40 focus:outline-none focus:border-[#d4af37]"
                  />
                  <button
                    onClick={handleSendInvite}
                    disabled={!inviteEmail.trim()}
                    className="p-3 bg-[#d4af37] text-[#1a2332] rounded-xl hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default BibleStudyGroups;
