import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  Heart, MessageCircle, Send, Users, ChevronDown, ChevronUp, Sparkles, X, 
  HandHeart, Check, Clock, AlertCircle, BookOpen, Filter, Flame, 
  PartyPopper, ChevronRight
} from 'lucide-react';

interface Declaration {
  id: string;
  user_id: string;
  name: string;
  declaration: string;
  testimony: string | null;
  created_at: string;
  amen_count: number;
  user_has_amened: boolean;
  responses: Response[];
}

interface Response {
  id: string;
  name: string;
  message: string;
  created_at: string;
  user_id: string;
}

interface PrayerRequest {
  id: string;
  user_id: string;
  name: string;
  title: string;
  request: string;
  category: string;
  is_urgent: boolean;
  is_answered: boolean;
  answered_testimony: string | null;
  answered_at: string | null;
  is_anonymous: boolean;
  created_at: string;
  praying_count: number;
  user_is_praying: boolean;
  encouragements: Encouragement[];
}

interface Encouragement {
  id: string;
  name: string;
  message: string;
  scripture_reference: string | null;
  created_at: string;
  user_id: string;
}

interface CommunityWallProps {
  user: User | null;
  onOpenAuth: () => void;
}

const PRAYER_CATEGORIES = [
  { value: 'general', label: 'General', icon: HandHeart },
  { value: 'health', label: 'Health & Healing', icon: Heart },
  { value: 'family', label: 'Family', icon: Users },
  { value: 'guidance', label: 'Guidance & Wisdom', icon: BookOpen },
  { value: 'provision', label: 'Provision', icon: Sparkles },
  { value: 'spiritual', label: 'Spiritual Growth', icon: Flame },
  { value: 'thanksgiving', label: 'Thanksgiving', icon: PartyPopper },
];

const CommunityWall: React.FC<CommunityWallProps> = ({ user, onOpenAuth }) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'declarations' | 'prayers'>('declarations');
  
  // Declarations state
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loadingDeclarations, setLoadingDeclarations] = useState(true);
  const [submittingDeclaration, setSubmittingDeclaration] = useState(false);
  const [showDeclarationForm, setShowDeclarationForm] = useState(false);
  const [expandedDeclaration, setExpandedDeclaration] = useState<string | null>(null);
  const [replyingToDeclaration, setReplyingToDeclaration] = useState<string | null>(null);
  
  // Declaration form state
  const [formName, setFormName] = useState('');
  const [formDeclaration, setFormDeclaration] = useState('');
  const [formTestimony, setFormTestimony] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyName, setReplyName] = useState('');

  // Prayer requests state
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loadingPrayers, setLoadingPrayers] = useState(true);
  const [submittingPrayer, setSubmittingPrayer] = useState(false);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);
  const [encouragingPrayer, setEncouragingPrayer] = useState<string | null>(null);
  const [prayerFilter, setPrayerFilter] = useState<'all' | 'active' | 'answered' | 'urgent'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [markingAnswered, setMarkingAnswered] = useState<string | null>(null);
  
  // Prayer form state
  const [prayerName, setPrayerName] = useState('');
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerRequest, setPrayerRequest] = useState('');
  const [prayerCategory, setPrayerCategory] = useState('general');
  const [prayerIsUrgent, setPrayerIsUrgent] = useState(false);
  const [prayerIsAnonymous, setPrayerIsAnonymous] = useState(false);
  
  // Encouragement form state
  const [encourageName, setEncourageName] = useState('');
  const [encourageMessage, setEncourageMessage] = useState('');
  const [encourageScripture, setEncourageScripture] = useState('');
  
  // Answered testimony state
  const [answeredTestimony, setAnsweredTestimony] = useState('');

  // Load data on mount
  useEffect(() => {
    loadDeclarations();
    loadPrayers();
  }, [user]);

  // ==================== DECLARATIONS ====================
  const loadDeclarations = async () => {
    setLoadingDeclarations(true);
    try {
      const { data: declarationsData, error: declarationsError } = await supabase
        .from('declarations')
        .select('*')
        .order('created_at', { ascending: false });

      if (declarationsError) throw declarationsError;

      const { data: amensData, error: amensError } = await supabase
        .from('declaration_amens')
        .select('declaration_id');

      if (amensError) throw amensError;

      let userAmens: string[] = [];
      if (user) {
        const { data: userAmensData } = await supabase
          .from('declaration_amens')
          .select('declaration_id')
          .eq('user_id', user.id);
        userAmens = userAmensData?.map(a => a.declaration_id) || [];
      }

      const { data: responsesData, error: responsesError } = await supabase
        .from('declaration_responses')
        .select('*')
        .order('created_at', { ascending: true });

      if (responsesError) throw responsesError;

      const amenCounts: Record<string, number> = {};
      amensData?.forEach(amen => {
        amenCounts[amen.declaration_id] = (amenCounts[amen.declaration_id] || 0) + 1;
      });

      const responsesByDeclaration: Record<string, Response[]> = {};
      responsesData?.forEach(response => {
        if (!responsesByDeclaration[response.declaration_id]) {
          responsesByDeclaration[response.declaration_id] = [];
        }
        responsesByDeclaration[response.declaration_id].push(response);
      });

      const enrichedDeclarations = declarationsData?.map(dec => ({
        ...dec,
        amen_count: amenCounts[dec.id] || 0,
        user_has_amened: userAmens.includes(dec.id),
        responses: responsesByDeclaration[dec.id] || [],
      })) || [];

      setDeclarations(enrichedDeclarations);
    } catch (error) {
      console.error('Error loading declarations:', error);
    } finally {
      setLoadingDeclarations(false);
    }
  };

  const handleSubmitDeclaration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!formName.trim() || !formDeclaration.trim()) return;

    setSubmittingDeclaration(true);
    try {
      const { error } = await supabase.from('declarations').insert({
        user_id: user.id,
        name: formName.trim(),
        declaration: formDeclaration.trim(),
        testimony: formTestimony.trim() || null,
      });

      if (error) throw error;

      setFormName('');
      setFormDeclaration('');
      setFormTestimony('');
      setShowDeclarationForm(false);
      await loadDeclarations();
    } catch (error) {
      console.error('Error submitting declaration:', error);
    } finally {
      setSubmittingDeclaration(false);
    }
  };

  const handleAmen = async (declarationId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    const declaration = declarations.find(d => d.id === declarationId);
    if (!declaration) return;

    try {
      if (declaration.user_has_amened) {
        await supabase
          .from('declaration_amens')
          .delete()
          .eq('declaration_id', declarationId)
          .eq('user_id', user.id);
      } else {
        await supabase.from('declaration_amens').insert({
          declaration_id: declarationId,
          user_id: user.id,
        });
      }

      setDeclarations(prev => prev.map(d => {
        if (d.id === declarationId) {
          return {
            ...d,
            amen_count: d.user_has_amened ? d.amen_count - 1 : d.amen_count + 1,
            user_has_amened: !d.user_has_amened,
          };
        }
        return d;
      }));
    } catch (error) {
      console.error('Error toggling amen:', error);
    }
  };

  const handleSubmitDeclarationResponse = async (declarationId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!replyMessage.trim() || !replyName.trim()) return;

    try {
      const { data, error } = await supabase.from('declaration_responses').insert({
        declaration_id: declarationId,
        user_id: user.id,
        name: replyName.trim(),
        message: replyMessage.trim(),
      }).select().single();

      if (error) throw error;

      setDeclarations(prev => prev.map(d => {
        if (d.id === declarationId) {
          return {
            ...d,
            responses: [...d.responses, data],
          };
        }
        return d;
      }));

      setReplyMessage('');
      setReplyName('');
      setReplyingToDeclaration(null);
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  // ==================== PRAYER REQUESTS ====================
  const loadPrayers = async () => {
    setLoadingPrayers(true);
    try {
      const { data: prayersData, error: prayersError } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (prayersError) throw prayersError;

      const { data: commitmentsData, error: commitmentsError } = await supabase
        .from('prayer_commitments')
        .select('prayer_id');

      if (commitmentsError) throw commitmentsError;

      let userCommitments: string[] = [];
      if (user) {
        const { data: userCommitmentsData } = await supabase
          .from('prayer_commitments')
          .select('prayer_id')
          .eq('user_id', user.id);
        userCommitments = userCommitmentsData?.map(c => c.prayer_id) || [];
      }

      const { data: encouragementsData, error: encouragementsError } = await supabase
        .from('prayer_encouragements')
        .select('*')
        .order('created_at', { ascending: true });

      if (encouragementsError) throw encouragementsError;

      const commitmentCounts: Record<string, number> = {};
      commitmentsData?.forEach(commitment => {
        commitmentCounts[commitment.prayer_id] = (commitmentCounts[commitment.prayer_id] || 0) + 1;
      });

      const encouragementsByPrayer: Record<string, Encouragement[]> = {};
      encouragementsData?.forEach(enc => {
        if (!encouragementsByPrayer[enc.prayer_id]) {
          encouragementsByPrayer[enc.prayer_id] = [];
        }
        encouragementsByPrayer[enc.prayer_id].push(enc);
      });

      const enrichedPrayers = prayersData?.map(prayer => ({
        ...prayer,
        praying_count: commitmentCounts[prayer.id] || 0,
        user_is_praying: userCommitments.includes(prayer.id),
        encouragements: encouragementsByPrayer[prayer.id] || [],
      })) || [];

      setPrayers(enrichedPrayers);
    } catch (error) {
      console.error('Error loading prayers:', error);
    } finally {
      setLoadingPrayers(false);
    }
  };

  const handleSubmitPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!prayerName.trim() || !prayerTitle.trim() || !prayerRequest.trim()) return;

    setSubmittingPrayer(true);
    try {
      const { error } = await supabase.from('prayer_requests').insert({
        user_id: user.id,
        name: prayerIsAnonymous ? 'Anonymous' : prayerName.trim(),
        title: prayerTitle.trim(),
        request: prayerRequest.trim(),
        category: prayerCategory,
        is_urgent: prayerIsUrgent,
        is_anonymous: prayerIsAnonymous,
      });

      if (error) throw error;

      setPrayerName('');
      setPrayerTitle('');
      setPrayerRequest('');
      setPrayerCategory('general');
      setPrayerIsUrgent(false);
      setPrayerIsAnonymous(false);
      setShowPrayerForm(false);
      await loadPrayers();
    } catch (error) {
      console.error('Error submitting prayer:', error);
    } finally {
      setSubmittingPrayer(false);
    }
  };

  const handleCommitToPray = async (prayerId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    const prayer = prayers.find(p => p.id === prayerId);
    if (!prayer) return;

    try {
      if (prayer.user_is_praying) {
        await supabase
          .from('prayer_commitments')
          .delete()
          .eq('prayer_id', prayerId)
          .eq('user_id', user.id);
      } else {
        await supabase.from('prayer_commitments').insert({
          prayer_id: prayerId,
          user_id: user.id,
        });
      }

      setPrayers(prev => prev.map(p => {
        if (p.id === prayerId) {
          return {
            ...p,
            praying_count: p.user_is_praying ? p.praying_count - 1 : p.praying_count + 1,
            user_is_praying: !p.user_is_praying,
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error toggling prayer commitment:', error);
    }
  };

  const handleSubmitEncouragement = async (prayerId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!encourageName.trim() || !encourageMessage.trim()) return;

    try {
      const { data, error } = await supabase.from('prayer_encouragements').insert({
        prayer_id: prayerId,
        user_id: user.id,
        name: encourageName.trim(),
        message: encourageMessage.trim(),
        scripture_reference: encourageScripture.trim() || null,
      }).select().single();

      if (error) throw error;

      setPrayers(prev => prev.map(p => {
        if (p.id === prayerId) {
          return {
            ...p,
            encouragements: [...p.encouragements, data],
          };
        }
        return p;
      }));

      setEncourageName('');
      setEncourageMessage('');
      setEncourageScripture('');
      setEncouragingPrayer(null);
    } catch (error) {
      console.error('Error submitting encouragement:', error);
    }
  };

  const handleMarkAnswered = async (prayerId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    const prayer = prayers.find(p => p.id === prayerId);
    if (!prayer || prayer.user_id !== user.id) return;

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({
          is_answered: true,
          answered_testimony: answeredTestimony.trim() || null,
          answered_at: new Date().toISOString(),
        })
        .eq('id', prayerId);

      if (error) throw error;

      setPrayers(prev => prev.map(p => {
        if (p.id === prayerId) {
          return {
            ...p,
            is_answered: true,
            answered_testimony: answeredTestimony.trim() || null,
            answered_at: new Date().toISOString(),
          };
        }
        return p;
      }));

      setAnsweredTestimony('');
      setMarkingAnswered(null);
    } catch (error) {
      console.error('Error marking prayer as answered:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredPrayers = prayers.filter(prayer => {
    if (prayerFilter === 'active' && prayer.is_answered) return false;
    if (prayerFilter === 'answered' && !prayer.is_answered) return false;
    if (prayerFilter === 'urgent' && !prayer.is_urgent) return false;
    if (categoryFilter !== 'all' && prayer.category !== categoryFilter) return false;
    return true;
  });

  const getCategoryInfo = (category: string) => {
    return PRAYER_CATEGORIES.find(c => c.value === category) || PRAYER_CATEGORIES[0];
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#1a2332] to-[#0f1520]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full mb-6">
            <Users className="w-4 h-4 text-[#d4af37]" />
            <span className="text-[#d4af37] text-sm font-medium">Fellowship of Sons</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5f1e8] mb-4">
            Community Wall
          </h2>

          <p className="text-lg sm:text-xl text-[#f5f1e8]/70 max-w-2xl mx-auto mb-2">
            "are you one of...<span className="font-bold italic text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">WE</span> ?"
          </p>
          <p className="text-[#f5f1e8]/60 max-w-2xl mx-auto">
            Share declarations, lift up prayer requests, and encourage one another 
            as we walk together in <span className="font-bold italic text-teal-400">sonship</span> and <span className="font-bold italic text-sky-400">discipleship</span>.
          </p>



        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-[#f5f1e8]/10 rounded-xl p-1.5">
            <button
              onClick={() => setActiveTab('declarations')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'declarations'
                  ? 'bg-[#d4af37] text-[#1a2332]'
                  : 'text-[#f5f1e8]/70 hover:text-[#f5f1e8] hover:bg-[#f5f1e8]/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Declarations</span>
            </button>
            <button
              onClick={() => setActiveTab('prayers')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'prayers'
                  ? 'bg-[#d4af37] text-[#1a2332]'
                  : 'text-[#f5f1e8]/70 hover:text-[#f5f1e8] hover:bg-[#f5f1e8]/5'
              }`}
            >
              <HandHeart className="w-4 h-4" />
              <span>Prayer Requests</span>
            </button>
          </div>
        </div>

        {/* ==================== DECLARATIONS TAB ==================== */}
        {activeTab === 'declarations' && (
          <>
            {/* Add Declaration Button */}
            {!showDeclarationForm && (
              <div className="text-center mb-10">
                <button
                  onClick={() => user ? setShowDeclarationForm(true) : onOpenAuth()}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Share Your Declaration</span>
                </button>
                {!user && (
                  <p className="text-[#f5f1e8]/50 text-sm mt-2">Sign in to share your declaration</p>
                )}
              </div>
            )}

            {/* Declaration Form */}
            {showDeclarationForm && (
              <div className="bg-[#f5f1e8] rounded-2xl p-6 sm:p-8 mb-10 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-serif font-bold text-[#1a2332]">
                    Your Declaration
                  </h3>
                  <button
                    onClick={() => setShowDeclarationForm(false)}
                    className="p-2 text-[#1a2332]/60 hover:text-[#1a2332] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmitDeclaration} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#1a2332]/70 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-white border border-[#1a2332]/20 rounded-xl text-[#1a2332] placeholder-[#1a2332]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1a2332]/70 mb-2">
                      Your Declaration
                    </label>
                    <textarea
                      value={formDeclaration}
                      onChange={(e) => setFormDeclaration(e.target.value)}
                      placeholder="I am [Your Name]... One 'Son' of many... (share your declaration of sonship and discipleship)"
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-[#1a2332]/20 rounded-xl text-[#1a2332] placeholder-[#1a2332]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent resize-none"
                      required
                    />
                  </div>



                  
                  <div>
                    <label className="block text-sm font-medium text-[#1a2332]/70 mb-2">
                      Your Testimony (Optional)
                    </label>
                    <textarea
                      value={formTestimony}
                      onChange={(e) => setFormTestimony(e.target.value)}
                      placeholder="Share your journey to understanding your identity as a son of God..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-[#1a2332]/20 rounded-xl text-[#1a2332] placeholder-[#1a2332]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeclarationForm(false)}
                      className="px-5 py-2.5 text-[#1a2332]/70 hover:text-[#1a2332] font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingDeclaration || !formName.trim() || !formDeclaration.trim()}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingDeclaration ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#1a2332]/30 border-t-[#1a2332] rounded-full animate-spin" />
                          <span>Sharing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Share Declaration</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Declarations List */}
            {loadingDeclarations ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#f5f1e8]/60">Loading declarations...</p>
              </div>
            ) : declarations.length === 0 ? (
              <div className="text-center py-12 bg-[#f5f1e8]/5 rounded-2xl border border-[#f5f1e8]/10">
                <Users className="w-16 h-16 text-[#d4af37]/40 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold text-[#f5f1e8] mb-2">
                  Be the First to Declare
                </h3>
                <p className="text-[#f5f1e8]/60 max-w-md mx-auto">
                  No declarations yet. Be the first to share your identity as "One "Son" of many..."© 
                  and start building our community of faith.

                </p>
              </div>

            ) : (
              <div className="space-y-6">
                {declarations.map((declaration) => (
                  <div
                    key={declaration.id}
                    className="bg-[#f5f1e8] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >

                    <div className="p-6 sm:p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8962e] flex items-center justify-center text-[#1a2332] font-bold text-lg">
                            {declaration.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#1a2332]">{declaration.name}</h4>
                            <p className="text-sm text-[#1a2332]/50">{formatDate(declaration.created_at)}</p>
                        </div>
                        <span className="px-3 py-1 bg-[#d4af37]/20 text-[#8b7722] text-xs font-medium rounded-full">
                          "One "Son" of many..."©
                        </span>

                      </div>

                      </div>
                      
                      <div className="mb-4">
                        <p className="text-[#1a2332] text-lg font-medium leading-relaxed">
                          "{declaration.declaration}"
                        </p>
                      </div>
                      
                      {declaration.testimony && (
                        <div className="mb-4 p-4 bg-[#1a2332]/5 rounded-xl">
                          <p className="text-sm font-medium text-[#1a2332]/70 mb-2">My Testimony:</p>
                          <p className="text-[#1a2332]/80 leading-relaxed">{declaration.testimony}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-[#1a2332]/10">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleAmen(declaration.id)}
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                              declaration.user_has_amened
                                ? 'bg-[#d4af37] text-[#1a2332]'
                                : 'bg-[#1a2332]/10 text-[#1a2332]/70 hover:bg-[#d4af37]/20 hover:text-[#1a2332]'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${declaration.user_has_amened ? 'fill-current' : ''}`} />
                            <span className="font-medium">Amen</span>
                            {declaration.amen_count > 0 && (
                              <span className="ml-1 px-2 py-0.5 bg-[#1a2332]/10 rounded-full text-xs">
                                {declaration.amen_count}
                              </span>
                            )}
                          </button>
                          
                          <button
                            onClick={() => setReplyingToDeclaration(replyingToDeclaration === declaration.id ? null : declaration.id)}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1a2332]/10 text-[#1a2332]/70 rounded-lg hover:bg-[#1a2332]/20 hover:text-[#1a2332] transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-medium">Encourage</span>
                            {declaration.responses.length > 0 && (
                              <span className="ml-1 px-2 py-0.5 bg-[#1a2332]/10 rounded-full text-xs">
                                {declaration.responses.length}
                              </span>
                            )}
                          </button>
                        </div>
                        
                        {declaration.responses.length > 0 && (
                          <button
                            onClick={() => setExpandedDeclaration(
                              expandedDeclaration === declaration.id ? null : declaration.id
                            )}
                            className="inline-flex items-center space-x-1 text-[#1a2332]/60 hover:text-[#1a2332] transition-colors"
                          >
                            <span className="text-sm">
                              {expandedDeclaration === declaration.id ? 'Hide' : 'View'} responses
                            </span>
                            {expandedDeclaration === declaration.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {replyingToDeclaration === declaration.id && (
                      <div className="px-6 sm:px-8 pb-6 pt-2 bg-[#1a2332]/5">
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={replyName}
                            onChange={(e) => setReplyName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-4 py-2.5 bg-white border border-[#1a2332]/20 rounded-lg text-[#1a2332] placeholder-[#1a2332]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm"
                          />
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder="Write an encouraging message..."
                              className="flex-1 px-4 py-2.5 bg-white border border-[#1a2332]/20 rounded-lg text-[#1a2332] placeholder-[#1a2332]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && replyMessage.trim() && replyName.trim()) {
                                  handleSubmitDeclarationResponse(declaration.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleSubmitDeclarationResponse(declaration.id)}
                              disabled={!replyMessage.trim() || !replyName.trim()}
                              className="px-4 py-2.5 bg-[#d4af37] text-[#1a2332] rounded-lg hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {expandedDeclaration === declaration.id && declaration.responses.length > 0 && (
                      <div className="px-6 sm:px-8 pb-6 bg-[#1a2332]/5">
                        <div className="space-y-3">
                          {declaration.responses.map((response) => (
                            <div
                              key={response.id}
                              className="flex items-start space-x-3 p-3 bg-white rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#1a2332]/10 flex items-center justify-center text-[#1a2332]/60 font-medium text-sm flex-shrink-0">
                                {response.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-[#1a2332] text-sm">{response.name}</span>
                                  <span className="text-xs text-[#1a2332]/40">{formatDate(response.created_at)}</span>
                                </div>
                                <p className="text-[#1a2332]/80 text-sm">{response.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ==================== PRAYER REQUESTS TAB ==================== */}
        {activeTab === 'prayers' && (
          <>
            {/* Prayer Request Header */}
            <div className="text-center mb-8">
              <p className="text-[#f5f1e8]/70 max-w-2xl mx-auto">
                "Bear ye one another's burdens, and so fulfil the law of Christ." — Galatians 6:2 (KJV 1611)
              </p>
            </div>


            {/* Add Prayer Button */}
            {!showPrayerForm && (
              <div className="text-center mb-8">
                <button
                  onClick={() => user ? setShowPrayerForm(true) : onOpenAuth()}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-all transform hover:scale-105 shadow-lg"
                >
                  <HandHeart className="w-5 h-5" />
                  <span>Share Prayer Request</span>
                </button>
                {!user && (
                  <p className="text-[#f5f1e8]/50 text-sm mt-2">Sign in to share your prayer request</p>
                )}
              </div>
            )}

            {/* Prayer Form */}
            {showPrayerForm && (
              <div className="bg-[#f5f1e8] rounded-2xl p-6 sm:p-8 mb-10 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-serif font-bold text-[#1a2332]">
                    Share Your Prayer Request
                  </h3>
                  <button
                    onClick={() => setShowPrayerForm(false)}
                    className="p-2 text-[#1a2332]/60 hover:text-[#1a2332] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmitPrayer} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1a2332]/70 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={prayerName}
                        onChange={(e) => setPrayerName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 bg-white border border-[#1a2332]/20 rounded-xl text-[#1a2332] placeholder-[#1a2332]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                        required
                        disabled={prayerIsAnonymous}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1a2332]/70 mb-2">
                        Category
                      </label>
                      <select
                        value={prayerCategory}
                        onChange={(e) => setPrayerCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-[#1a2332]/20 rounded-xl text-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                      >
                        {PRAYER_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1a2332]/70 mb-2">
                      Prayer Title
                    </label>
                    <input
                      type="text"
                      value={prayerTitle}
                      onChange={(e) => setPrayerTitle(e.target.value)}
                      placeholder="Brief title for your prayer request"
                      className="w-full px-4 py-3 bg-white border border-[#1a2332]/20 rounded-xl text-[#1a2332] placeholder-[#1a2332]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1a2332]/70 mb-2">
                      Your Prayer Request
                    </label>
                    <textarea
                      value={prayerRequest}
                      onChange={(e) => setPrayerRequest(e.target.value)}
                      placeholder="Share your prayer need with your brothers and sisters in Christ..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-[#1a2332]/20 rounded-xl text-[#1a2332] placeholder-[#1a2332]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent resize-none"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prayerIsUrgent}
                        onChange={(e) => setPrayerIsUrgent(e.target.checked)}
                        className="w-4 h-4 text-[#d4af37] border-[#1a2332]/20 rounded focus:ring-[#d4af37]"
                      />
                      <span className="text-sm text-[#1a2332]/70 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span>Urgent Request</span>
                      </span>
                    </label>
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prayerIsAnonymous}
                        onChange={(e) => setPrayerIsAnonymous(e.target.checked)}
                        className="w-4 h-4 text-[#d4af37] border-[#1a2332]/20 rounded focus:ring-[#d4af37]"
                      />
                      <span className="text-sm text-[#1a2332]/70">Post Anonymously</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPrayerForm(false)}
                      className="px-5 py-2.5 text-[#1a2332]/70 hover:text-[#1a2332] font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingPrayer || !prayerTitle.trim() || !prayerRequest.trim() || (!prayerIsAnonymous && !prayerName.trim())}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#d4af37] text-[#1a2332] font-semibold rounded-xl hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingPrayer ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#1a2332]/30 border-t-[#1a2332] rounded-full animate-spin" />
                          <span>Sharing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Share Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#f5f1e8]/60 text-sm flex items-center space-x-1">
                  <Filter className="w-4 h-4" />
                  <span>Filter:</span>
                </span>
                {(['all', 'active', 'answered', 'urgent'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setPrayerFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      prayerFilter === filter
                        ? 'bg-[#d4af37] text-[#1a2332]'
                        : 'bg-[#f5f1e8]/10 text-[#f5f1e8]/70 hover:bg-[#f5f1e8]/20'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'active' ? 'Active' : filter === 'answered' ? 'Answered' : 'Urgent'}
                  </button>
                ))}
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#f5f1e8]/10 border border-[#f5f1e8]/20 rounded-lg text-[#f5f1e8] text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              >
                <option value="all">All Categories</option>
                {PRAYER_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Prayer Requests List */}
            {loadingPrayers ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#f5f1e8]/60">Loading prayer requests...</p>
              </div>
            ) : filteredPrayers.length === 0 ? (
              <div className="text-center py-12 bg-[#f5f1e8]/5 rounded-2xl border border-[#f5f1e8]/10">
                <HandHeart className="w-16 h-16 text-[#d4af37]/40 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold text-[#f5f1e8] mb-2">
                  {prayerFilter === 'all' && categoryFilter === 'all' 
                    ? 'No Prayer Requests Yet' 
                    : 'No Matching Requests'}
                </h3>
                <p className="text-[#f5f1e8]/60 max-w-md mx-auto">
                  {prayerFilter === 'all' && categoryFilter === 'all'
                    ? 'Be the first to share a prayer request and let your brothers and sisters lift you up in prayer.'
                    : 'Try adjusting your filters to see more prayer requests.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPrayers.map((prayer) => {
                  const categoryInfo = getCategoryInfo(prayer.category);
                  const CategoryIcon = categoryInfo.icon;
                  
                  return (
                    <div
                      key={prayer.id}
                      className={`bg-[#f5f1e8] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${
                        prayer.is_answered ? 'ring-2 ring-green-500/50' : ''
                      }`}
                    >
                      <div className="p-6 sm:p-8">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[#1a2332] font-bold text-lg ${
                              prayer.is_answered 
                                ? 'bg-gradient-to-br from-green-400 to-green-600' 
                                : 'bg-gradient-to-br from-[#d4af37] to-[#b8962e]'
                            }`}>
                              {prayer.is_answered ? (
                                <Check className="w-6 h-6 text-white" />
                              ) : (
                                prayer.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#1a2332]">{prayer.name}</h4>
                              <p className="text-sm text-[#1a2332]/50">{formatDate(prayer.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {prayer.is_urgent && !prayer.is_answered && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center space-x-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Urgent</span>
                              </span>
                            )}
                            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${
                              prayer.is_answered 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-[#d4af37]/20 text-[#8b7722]'
                            }`}>
                              <CategoryIcon className="w-3 h-3" />
                              <span>{categoryInfo.label}</span>
                            </span>
                          </div>
                        </div>
                        
                        {/* Title & Request */}
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-[#1a2332] mb-2 flex items-center space-x-2">
                            <span>{prayer.title}</span>
                            {prayer.is_answered && (
                              <span className="text-green-600 text-sm font-normal flex items-center space-x-1">
                                <PartyPopper className="w-4 h-4" />
                                <span>Answered!</span>
                              </span>
                            )}
                          </h3>
                          <p className="text-[#1a2332]/80 leading-relaxed">{prayer.request}</p>
                        </div>
                        
                        {/* Answered Testimony */}
                        {prayer.is_answered && prayer.answered_testimony && (
                          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-sm font-medium text-green-800 mb-2 flex items-center space-x-2">
                              <PartyPopper className="w-4 h-4" />
                              <span>Testimony of God's Faithfulness:</span>
                            </p>
                            <p className="text-green-700 leading-relaxed">{prayer.answered_testimony}</p>
                            {prayer.answered_at && (
                              <p className="text-xs text-green-600 mt-2">
                                Answered on {new Date(prayer.answered_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Praying Count */}
                        {prayer.praying_count > 0 && (
                          <div className="mb-4 flex items-center space-x-2 text-[#1a2332]/60">
                            <HandHeart className="w-4 h-4 text-[#d4af37]" />
                            <span className="text-sm">
                              <strong className="text-[#1a2332]">{prayer.praying_count}</strong> {prayer.praying_count === 1 ? 'person is' : 'people are'} praying for this
                            </span>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#1a2332]/10">
                          {/* Pray Button */}
                          <button
                            onClick={() => handleCommitToPray(prayer.id)}
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                              prayer.user_is_praying
                                ? 'bg-[#d4af37] text-[#1a2332]'
                                : 'bg-[#1a2332]/10 text-[#1a2332]/70 hover:bg-[#d4af37]/20 hover:text-[#1a2332]'
                            }`}
                          >
                            <HandHeart className={`w-4 h-4 ${prayer.user_is_praying ? 'fill-current' : ''}`} />
                            <span className="font-medium">{prayer.user_is_praying ? 'Praying' : 'I\'ll Pray'}</span>
                          </button>
                          
                          {/* Encourage Button */}
                          <button
                            onClick={() => setEncouragingPrayer(encouragingPrayer === prayer.id ? null : prayer.id)}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1a2332]/10 text-[#1a2332]/70 rounded-lg hover:bg-[#1a2332]/20 hover:text-[#1a2332] transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-medium">Encourage</span>
                            {prayer.encouragements.length > 0 && (
                              <span className="ml-1 px-2 py-0.5 bg-[#1a2332]/10 rounded-full text-xs">
                                {prayer.encouragements.length}
                              </span>
                            )}
                          </button>
                          
                          {/* Mark as Answered (only for owner) */}
                          {user && prayer.user_id === user.id && !prayer.is_answered && (
                            <button
                              onClick={() => setMarkingAnswered(markingAnswered === prayer.id ? null : prayer.id)}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              <span className="font-medium">Mark Answered</span>
                            </button>
                          )}
                          
                          {/* View Encouragements */}
                          {prayer.encouragements.length > 0 && (
                            <button
                              onClick={() => setExpandedPrayer(expandedPrayer === prayer.id ? null : prayer.id)}
                              className="inline-flex items-center space-x-1 text-[#1a2332]/60 hover:text-[#1a2332] transition-colors ml-auto"
                            >
                              <span className="text-sm">
                                {expandedPrayer === prayer.id ? 'Hide' : 'View'} encouragements
                              </span>
                              <ChevronRight className={`w-4 h-4 transition-transform ${expandedPrayer === prayer.id ? 'rotate-90' : ''}`} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Mark as Answered Form */}
                      {markingAnswered === prayer.id && (
                        <div className="px-6 sm:px-8 pb-6 pt-2 bg-green-50">
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-green-800">
                              Share how God answered this prayer (optional):
                            </p>
                            <textarea
                              value={answeredTestimony}
                              onChange={(e) => setAnsweredTestimony(e.target.value)}
                              placeholder="Share your testimony of God's faithfulness..."
                              rows={3}
                              className="w-full px-4 py-2.5 bg-white border border-green-200 rounded-lg text-[#1a2332] placeholder-[#1a2332]/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                            />
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setMarkingAnswered(null);
                                  setAnsweredTestimony('');
                                }}
                                className="px-4 py-2 text-[#1a2332]/70 hover:text-[#1a2332] font-medium text-sm transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleMarkAnswered(prayer.id)}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                <PartyPopper className="w-4 h-4" />
                                <span>Mark as Answered</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Encouragement Form */}
                      {encouragingPrayer === prayer.id && (
                        <div className="px-6 sm:px-8 pb-6 pt-2 bg-[#1a2332]/5">
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={encourageName}
                              onChange={(e) => setEncourageName(e.target.value)}
                              placeholder="Your name"
                              className="w-full px-4 py-2.5 bg-white border border-[#1a2332]/20 rounded-lg text-[#1a2332] placeholder-[#1a2332]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm"
                            />
                            <textarea
                              value={encourageMessage}
                              onChange={(e) => setEncourageMessage(e.target.value)}
                              placeholder="Write an encouraging message..."
                              rows={2}
                              className="w-full px-4 py-2.5 bg-white border border-[#1a2332]/20 rounded-lg text-[#1a2332] placeholder-[#1a2332]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm resize-none"
                            />
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={encourageScripture}
                                onChange={(e) => setEncourageScripture(e.target.value)}
                                placeholder="Scripture reference (optional, e.g., Philippians 4:6)"
                                className="flex-1 px-4 py-2.5 bg-white border border-[#1a2332]/20 rounded-lg text-[#1a2332] placeholder-[#1a2332]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm"
                              />
                              <button
                                onClick={() => handleSubmitEncouragement(prayer.id)}
                                disabled={!encourageName.trim() || !encourageMessage.trim()}
                                className="px-4 py-2.5 bg-[#d4af37] text-[#1a2332] rounded-lg hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Encouragements List */}
                      {expandedPrayer === prayer.id && prayer.encouragements.length > 0 && (
                        <div className="px-6 sm:px-8 pb-6 bg-[#1a2332]/5">
                          <div className="space-y-3">
                            {prayer.encouragements.map((enc) => (
                              <div
                                key={enc.id}
                                className="flex items-start space-x-3 p-3 bg-white rounded-lg"
                              >
                                <div className="w-8 h-8 rounded-full bg-[#1a2332]/10 flex items-center justify-center text-[#1a2332]/60 font-medium text-sm flex-shrink-0">
                                  {enc.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-[#1a2332] text-sm">{enc.name}</span>
                                    <span className="text-xs text-[#1a2332]/40">{formatDate(enc.created_at)}</span>
                                  </div>
                                  <p className="text-[#1a2332]/80 text-sm">{enc.message}</p>
                                  {enc.scripture_reference && (
                                    <p className="text-[#d4af37] text-xs mt-1 flex items-center space-x-1">
                                      <BookOpen className="w-3 h-3" />
                                      <span>{enc.scripture_reference}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Unity Scripture */}
        <div className="mt-16 text-center">
          <div className="inline-block p-6 sm:p-8 bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/30 rounded-2xl max-w-2xl">
            <p className="text-lg sm:text-xl text-[#f5f1e8] font-serif italic leading-relaxed mb-4">
              {activeTab === 'declarations' ? (
                '"That they all may be one; as thou, Father, art in me, and I in thee, that they also may be one in us: that the world may believe that thou hast sent me."'
              ) : (
                '"Confess your faults one to another, and pray one for another, that ye may be healed. The effectual fervent prayer of a righteous man availeth much."'
              )}
            </p>
            <p className="text-[#d4af37] font-medium">
              {activeTab === 'declarations' ? '— John 17:21 (KJV 1611)' : '— James 5:16 (KJV 1611)'}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CommunityWall;
