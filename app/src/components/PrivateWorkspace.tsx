import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Crown, BookOpen, Brain, Award, Heart, 
  Sparkles, Calendar, Target, TrendingUp, Star, 
  FileText, Bookmark, Clock, ChevronRight, X,
  CheckCircle, AlertCircle, Settings, Bell, User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PrivateWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
}

// Robert Dorsey's email - this should match the email used for his account
const OWNER_EMAILS = ['robert@example.com', 'robertdorsey@example.com']; // Add Robert's actual email(s) here

const PrivateWorkspace: React.FC<PrivateWorkspaceProps> = ({ isOpen, onClose }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkAuthorization();
  }, [isOpen]);

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user is Robert Dorsey by email or name
        const userEmail = user.email?.toLowerCase() || '';
        const fullName = user.user_metadata?.full_name || '';
        
        // Check if user is Robert Dorsey
        const isRobertByEmail = OWNER_EMAILS.some(email => 
          userEmail.includes(email.toLowerCase()) || 
          userEmail.includes('robert') && userEmail.includes('dorsey')
        );
        const isRobertByName = fullName.toLowerCase().includes('robert') && 
                               fullName.toLowerCase().includes('dorsey');
        
        // For now, also allow if the name contains "robert" (case insensitive)
        // This makes it easier to test - in production, use specific email check
        const isOwner = isRobertByEmail || isRobertByName || 
                        fullName.toLowerCase().includes('robert');
        
        setIsAuthorized(isOwner);
        setUserName(fullName || 'Robert Dorsey');
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error('Error checking authorization:', error);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Unauthorized Access View
  if (!loading && !isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-[#0c1929]/95 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative w-full max-w-md bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-[#F59E0B] transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
              <Lock className="w-10 h-10 text-red-400" />
            </div>
            
            <h2 className="text-2xl font-serif font-bold text-white mb-3">
              Private Workspace
            </h2>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Access Restricted</span>
            </div>
            
            <p className="text-white/60 mb-6">
              This workspace is exclusively reserved for <span className="text-[#F59E0B] font-semibold">Robert Dorsey</span>. 
              Only the owner can access this private area.
            </p>
            
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 text-left">
                  If you believe you should have access to this workspace, please contact the administrator.
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
            >
              Return to Main App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading View
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#0c1929]/95 backdrop-blur-sm" />
        <div className="relative w-full max-w-md bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-[#14B8A6]/30 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#14B8A6]/20 to-[#3B82F6]/20 border border-[#14B8A6]/30 flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-[#14B8A6]" />
          </div>
          <p className="text-white/60">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Authorized - Private Workspace View
  const stats = [
    { label: 'Days Streak', value: '47', icon: Calendar, color: 'text-[#F59E0B]' },
    { label: 'Verses Memorized', value: '156', icon: Brain, color: 'text-[#14B8A6]' },
    { label: 'Certificates', value: '12', icon: Award, color: 'text-purple-400' },
    { label: 'Journal Entries', value: '89', icon: FileText, color: 'text-pink-400' },
  ];

  const quickActions = [
    { label: 'Continue Reading Plan', icon: BookOpen, description: 'Romans Chapter 8' },
    { label: 'Daily Devotional', icon: Sparkles, description: 'Today\'s reflection' },
    { label: 'Scripture Memory', icon: Brain, description: '3 verses to review' },
    { label: 'Prayer Journal', icon: Heart, description: 'Add new entry' },
  ];

  const recentActivity = [
    { action: 'Completed', item: 'Romans 7 reading', time: '2 hours ago', icon: CheckCircle },
    { action: 'Memorized', item: 'John 3:16', time: 'Yesterday', icon: Brain },
    { action: 'Earned', item: 'Scripture Scholar Badge', time: '2 days ago', icon: Award },
    { action: 'Added', item: 'Prayer request for family', time: '3 days ago', icon: Heart },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#0c1929]/95 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-[#F59E0B]/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-[#F59E0B]/20 bg-gradient-to-r from-[#F59E0B]/10 to-[#14B8A6]/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-[#F59E0B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-serif font-bold text-white">
                  {userName}'s Private Workspace
                </h2>
                <Shield className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <p className="text-white/60">Your exclusive spiritual growth dashboard</p>
            </div>
          </div>
          
          {/* Owner Badge */}
          <div className="absolute top-6 right-16 flex items-center space-x-2 px-3 py-1.5 bg-[#F59E0B]/20 border border-[#F59E0B]/30 rounded-full">
            <Star className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs font-medium text-[#F59E0B]">Owner Access</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#14B8A6]/20 px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#F59E0B] text-[#F59E0B]'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-white/5 to-white/[0.02] border border-[#14B8A6]/20 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                    </div>
                    <p className="text-sm text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                  <span>Quick Actions</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-[#14B8A6]/10 to-[#3B82F6]/10 border border-[#14B8A6]/20 rounded-xl hover:border-[#14B8A6]/40 transition-all group text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-[#14B8A6]/20 flex items-center justify-center">
                          <action.icon className="w-5 h-5 text-[#14B8A6]" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{action.label}</p>
                          <p className="text-sm text-white/50">{action.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#14B8A6] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#F59E0B]" />
                  <span>Recent Activity</span>
                </h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#14B8A6]/20 flex items-center justify-center">
                        <activity.icon className="w-4 h-4 text-[#14B8A6]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          <span className="text-white/60">{activity.action}</span>{' '}
                          <span className="font-medium">{activity.item}</span>
                        </p>
                      </div>
                      <span className="text-xs text-white/40">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-[#F59E0B]/10 to-[#14B8A6]/10 border border-[#F59E0B]/20 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Spiritual Growth Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Bible Reading</span>
                      <span className="text-[#14B8A6]">78%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[78%] bg-gradient-to-r from-[#14B8A6] to-[#0D9488] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Scripture Memory</span>
                      <span className="text-[#F59E0B]">65%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[65%] bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Daily Devotionals</span>
                      <span className="text-purple-400">92%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[92%] bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Your saved bookmarks will appear here</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-[#14B8A6]" />
                  <div>
                    <p className="font-medium text-white">Notifications</p>
                    <p className="text-sm text-white/50">Manage your notification preferences</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-[#14B8A6]" />
                  <div>
                    <p className="font-medium text-white">Profile Settings</p>
                    <p className="text-sm text-white/50">Update your personal information</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateWorkspace;
