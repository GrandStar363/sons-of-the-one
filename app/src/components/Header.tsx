import React, { useState, useEffect } from 'react';
import { Book, Search, Menu, X, Bookmark, Clock, Heart, User, LogOut, Loader2, Users, Footprints, Droplets, Brain, UsersRound, Headphones, GitCompare, Bell, Church, CalendarDays, PenLine, Sparkles, Crown, Gift, CreditCard, History, Lightbulb, Calendar, Mail, Settings, GraduationCap, Award, Trophy, Shield, Swords } from 'lucide-react';


import BibleVersionSelector from './BibleVersionSelector';

import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
  onSearch: (query: string) => void;
  onMenuToggle: () => void;
  menuOpen: boolean;
  user: SupabaseUser | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  syncing?: boolean;
  onOpenSubscription: () => void;
  onOpenDonation: () => void;
  onOpenSubscriptionStatus: () => void;
  onOpenDonationHistory: () => void;
  onOpenProfile: () => void;
  onOpenPrivateWorkspace: () => void;
}


const Header: React.FC<HeaderProps> = ({ 
  onNavigate, 
  currentSection, 
  onSearch, 
  onMenuToggle, 
  menuOpen,
  user,
  onOpenAuth,
  onSignOut,
  syncing,
  onOpenSubscription,
  onOpenDonation,
  onOpenSubscriptionStatus,
  onOpenDonationHistory,
  onOpenProfile,
  onOpenPrivateWorkspace
}) => {

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Check if current user is Robert Dorsey (the owner)
  useEffect(() => {
    const checkOwner = async () => {
      if (user) {
        const fullName = user.user_metadata?.full_name || user.user_metadata?.display_name || '';
        const userEmail = user.email?.toLowerCase() || '';
        
        // Check if user is Robert Dorsey
        const isRobertByName = fullName.toLowerCase().includes('robert');
        const isRobertByEmail = userEmail.includes('robert');
        
        setIsOwner(isRobertByName || isRobertByEmail);
      } else {
        setIsOwner(false);
      }
    };
    
    checkOwner();
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchOpen(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Heart },
    { id: 'bible', label: 'Scripture', icon: Book },
    { id: 'prayer-wall', label: 'Prayer Wall', icon: UsersRound },
    { id: 'lessons', label: 'Lessons', icon: GraduationCap },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'faith-wonder', label: 'Faith & Wonder', icon: Sparkles },
    { id: 'audio', label: 'Audio', icon: Headphones },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'trivia', label: 'Trivia', icon: Lightbulb },
    { id: 'multiplayer-trivia', label: 'Battle Mode', icon: Swords },
    { id: 'daily-trivia', label: 'Daily Challenge', icon: Calendar },
    { id: 'journal', label: 'Journal', icon: PenLine },
    { id: 'wwjd', label: 'WWJD', icon: Footprints },
    { id: 'baptism', label: 'Baptism', icon: Droplets },
    { id: 'churches', label: 'Find Church', icon: Church },
    { id: 'plans', label: 'Reading Plans', icon: Clock },
    { id: 'daily-reading', label: 'Daily Reading', icon: CalendarDays },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'devotional-emails', label: 'Devotional Emails', icon: Mail },
    { id: 'daily-reminders', label: 'Daily Reminders', icon: Bell },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'contact', label: 'Contact Us', icon: Mail },
  ];









  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (

    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0c1929]/98 via-[#0f2942]/98 to-[#0c1929]/98 backdrop-blur-md border-b border-[#14B8A6]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#14B8A6] via-[#0D9488] to-[#0F766E] flex items-center justify-center shadow-lg glow-teal group-hover:scale-105 transition-transform">
              <Book className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-serif font-bold italic text-white">
                <span className="text-[#F59E0B] text-glow-amber">Sons' of The One</span>
              </h1>
              <p className="text-xs font-bold italic text-[#FCD34D] text-glow-amber">God Almighty!!!</p>


            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.slice(0, 7).map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm ${
                  currentSection === item.id
                    ? 'bg-gradient-to-r from-[#14B8A6]/30 to-[#3B82F6]/30 text-[#5EEAD4] border border-[#14B8A6]/50'
                    : 'text-white/80 hover:text-[#5EEAD4] hover:bg-[#14B8A6]/10'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
            
            {/* More dropdown for additional items */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-lg font-medium text-white/80 hover:text-[#5EEAD4] hover:bg-[#14B8A6]/10 transition-all flex items-center space-x-1 text-sm">
                <span>More</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-[#0f2942] border border-[#14B8A6]/30 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {navItems.slice(7).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center space-x-2 px-4 py-3 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                      currentSection === item.id
                        ? 'bg-[#14B8A6]/20 text-[#5EEAD4]'
                        : 'text-white/80 hover:bg-[#14B8A6]/10 hover:text-[#5EEAD4]'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
                {/* Admin Link */}
                <a
                  href="/admin"
                  className="w-full flex items-center space-x-2 px-4 py-3 text-sm transition-colors text-amber-400 hover:bg-amber-500/10 border-t border-[#14B8A6]/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Admin Panel</span>
                </a>
              </div>
            </div>

          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Sync Indicator */}
            {syncing && (
              <div className="flex items-center space-x-1 text-[#5EEAD4] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Syncing...</span>
              </div>
            )}

            {/* Private Workspace Button - Only for Robert Dorsey */}
            {isOwner && (
              <button
                onClick={onOpenPrivateWorkspace}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25"
              >
                <Shield className="w-4 h-4" />
                <span>My Workspace</span>
              </button>
            )}

            {/* Premium Button - Desktop */}
            <button
              onClick={onOpenSubscription}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25"
            >
              <Crown className="w-4 h-4" />
              <span>Premium</span>
            </button>

            {/* Donate Button - Desktop */}
            <button
              onClick={onOpenDonation}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/25"
            >
              <Gift className="w-4 h-4" />
              <span>Give</span>
            </button>

            {/* Bible Version Selector - Desktop */}
            <div className="hidden md:block">
              <BibleVersionSelector variant="compact" />
            </div>

            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scripture..."
                  className="w-40 sm:w-56 px-4 py-2 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="ml-2 p-2 text-white/60 hover:text-[#F59E0B] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-white/80 hover:text-[#14B8A6] transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#14B8A6]/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center glow-amber">
                    <span className="text-white font-semibold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-white/80 text-sm">{displayName}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-[#0f2942] border border-[#14B8A6]/30 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-[#14B8A6]/20 bg-gradient-to-r from-[#14B8A6]/10 to-[#3B82F6]/10">
                        <p className="text-white font-medium truncate">{displayName}</p>
                        <p className="text-white/50 text-xs truncate">{user.email}</p>
                      </div>
                      
                      {/* Private Workspace - Only for Robert Dorsey */}
                      {isOwner && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenPrivateWorkspace();
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-3 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-colors border-b border-[#14B8A6]/10"
                        >
                          <Shield className="w-4 h-4" />
                          <span>My Private Workspace</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-white/80 hover:bg-[#14B8A6]/10 hover:text-[#5EEAD4] transition-colors border-b border-[#14B8A6]/10"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenSubscriptionStatus();
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-white/80 hover:bg-[#14B8A6]/10 hover:text-[#5EEAD4] transition-colors border-b border-[#14B8A6]/10"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>My Subscription</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenDonationHistory();
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-white/80 hover:bg-[#14B8A6]/10 hover:text-[#5EEAD4] transition-colors border-b border-[#14B8A6]/10"
                      >
                        <History className="w-4 h-4" />
                        <span>Giving & Impact</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('notifications');
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-white/80 hover:bg-[#14B8A6]/10 hover:text-[#5EEAD4] transition-colors border-b border-[#14B8A6]/10"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-white/80 hover:bg-[#F59E0B]/10 hover:text-[#F59E0B] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-medium rounded-lg hover:from-[#0D9488] hover:to-[#0F766E] transition-all glow-teal"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-white/80 hover:text-[#14B8A6] transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-gradient-to-b from-[#0f2942] to-[#0c1929] border-t border-[#14B8A6]/20">
          <nav className="px-4 py-4 space-y-2 max-h-[70vh] overflow-y-auto">
            {/* Bible Version Display - Mobile (KJV 1611 Only) */}
            <div className="mb-4 pb-4 border-b border-white/10">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2 px-2">Bible Translation</p>
              <div className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 border border-[#F59E0B]/40 rounded-xl text-[#F59E0B]">
                <Book className="w-4 h-4 text-[#F59E0B]" />
                <span className="font-medium">KJV 1611</span>
                <span className="text-white/50 text-xs">King James Version 1611</span>
              </div>
            </div>

            {/* Private Workspace Button - Mobile (Only for Robert Dorsey) */}
            {isOwner && (
              <button
                onClick={() => {
                  onMenuToggle();
                  onOpenPrivateWorkspace();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 mb-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-lg"
              >
                <Shield className="w-5 h-5" />
                <span>My Private Workspace</span>
              </button>
            )}

            {/* Premium & Donate Buttons - Mobile */}
            <div className="flex gap-2 mb-4 pb-4 border-b border-white/10">
              <button
                onClick={() => {
                  onMenuToggle();
                  onOpenSubscription();
                }}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg"
              >
                <Crown className="w-5 h-5" />
                <span>Premium</span>
              </button>
              <button
                onClick={() => {
                  onMenuToggle();
                  onOpenDonation();
                }}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-lg"
              >
                <Gift className="w-5 h-5" />
                <span>Give</span>
              </button>
            </div>

            {/* Profile Button - Mobile (when logged in) */}
            {user && (
              <button
                onClick={() => {
                  onMenuToggle();
                  onOpenProfile();
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-3 mb-2 ${
                  currentSection === 'profile'
                    ? 'bg-gradient-to-r from-[#14B8A6]/30 to-[#3B82F6]/30 text-[#5EEAD4] border border-[#14B8A6]/50'
                    : 'text-white/80 hover:text-[#5EEAD4] hover:bg-[#14B8A6]/10 border border-[#F59E0B]/30'
                }`}
              >
                <User className="w-5 h-5" />
                <span>My Profile</span>
              </button>
            )}

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onMenuToggle();
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-3 ${
                  currentSection === item.id
                    ? 'bg-gradient-to-r from-[#14B8A6]/30 to-[#3B82F6]/30 text-[#5EEAD4] border border-[#14B8A6]/50'
                    : 'text-white/80 hover:text-[#5EEAD4] hover:bg-[#14B8A6]/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
            
            {/* Mobile Auth Button - Sign In or Sign Out */}
            {user ? (
              <button
                onClick={() => {
                  onMenuToggle();
                  onSignOut();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 mt-4 bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 text-[#F59E0B] font-medium rounded-lg border border-[#F59E0B]/30 hover:from-[#F59E0B]/30 hover:to-[#D97706]/30 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onMenuToggle();
                  onOpenAuth();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 mt-4 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-medium rounded-lg glow-teal"
              >
                <User className="w-5 h-5" />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </nav>
        </div>
      )}

    </header>
  );
};

export default Header;
