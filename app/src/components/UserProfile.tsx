import React, { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User as UserIcon, 
  Camera, 
  Mail, 
  Lock, 
  Bell, 
  Crown, 
  Calendar, 
  Shield, 
  Trash2, 
  Save, 
  X, 
  Check, 
  Eye, 
  EyeOff,
  Loader2,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Settings,
  LogOut,
  Edit3,
  Award,
  Trophy,
  Download,
  FileText
} from 'lucide-react';
import { getEarnedCertificates } from './CertificateSystem';
import ExportStudyNotes from './ExportStudyNotes';


interface UserProfileProps {
  user: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenSubscription: () => void;
  onOpenNotifications: () => void;
}

interface ProfileData {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  bio: string;
  createdAt: string;
}

interface SubscriptionInfo {
  status: string;
  trialDaysRemaining: number;
  trialEnd: string | null;
  planType: string;
}


const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  onOpenAuth, 
  onSignOut,
  onOpenSubscription,
  onOpenNotifications
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    email: '',
    avatarUrl: null,
    bio: '',
    createdAt: ''
  });
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  
  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  

  // Password change states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Account preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  
  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Export modal
  const [showExportModal, setShowExportModal] = useState(false);

  // Get user data from localStorage
  const bookmarks = JSON.parse(localStorage.getItem('sog-bookmarks') || '[]');
  const highlights = JSON.parse(localStorage.getItem('sog-highlights') || '[]');
  const notes = JSON.parse(localStorage.getItem('sog-notes') || '{}');

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadSubscriptionInfo();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Use user metadata for profile data (no database table required)
      const metadata = user.user_metadata || {};
      
      setProfileData({
        displayName: metadata.display_name || metadata.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatarUrl: metadata.avatar_url || null,
        bio: metadata.bio || '',
        createdAt: user.created_at
      });
      setNewDisplayName(metadata.display_name || metadata.full_name || user.email?.split('@')[0] || 'User');
      setNewBio(metadata.bio || '');
      
      // Load notification preferences from localStorage as fallback
      const savedPrefs = localStorage.getItem('sog-notification-prefs');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        setEmailNotifications(prefs.email_enabled ?? true);
        setPushNotifications(prefs.push_enabled ?? false);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };


  const loadSubscriptionInfo = async () => {
    if (!user) return;

    
    try {
      const metadata = user.user_metadata || {};
      const trialEnd = metadata.trial_end ? new Date(metadata.trial_end) : null;
      const now = new Date();
      
      let status = 'none';
      let trialDaysRemaining = 0;
      
      if (trialEnd && trialEnd > now) {
        status = 'trialing';
        trialDaysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else if (metadata.subscription_status === 'active') {
        status = 'active';
      } else if (trialEnd && trialEnd <= now) {
        status = 'trial_expired';
      }
      
      setSubscriptionInfo({
        status,
        trialDaysRemaining,
        trialEnd: metadata.trial_end || null,
        planType: metadata.subscription_plan || 'free'
      });
    } catch (err) {
      console.error('Error loading subscription:', err);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!user || !newDisplayName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid display name.",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    try {
      // Update auth metadata (this is the primary storage for profile data)
      const { error } = await supabase.auth.updateUser({
        data: { display_name: newDisplayName.trim() }
      });
      
      if (error) throw error;
      
      setProfileData(prev => ({ ...prev, displayName: newDisplayName.trim() }));
      setIsEditingName(false);
      
      toast({
        title: "Profile Updated",
        description: "Your display name has been saved successfully.",
      });
    } catch (err: any) {
      console.error('Error updating display name:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update display name. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };





  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 2MB.",
        variant: "destructive"
      });
      return;
    }
    
    setUploadingAvatar(true);
    try {
      // Try to upload to Supabase Storage first
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      let publicUrl = '';
      
      try {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });
        
        if (!uploadError) {
          // Get public URL
          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          publicUrl = data.publicUrl;
        }
      } catch (storageErr) {
        console.log('Storage not available, using base64 fallback');
      }
      
      // If storage upload failed, use base64 encoding as fallback
      if (!publicUrl) {
        publicUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      
      // Update auth metadata with avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      if (updateError) throw updateError;
      
      setProfileData(prev => ({ ...prev, avatarUrl: publicUrl }));
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been saved.",
      });
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };


  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive"
      });
      return;
    }
    
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to change password.",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Confirmation Required",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Note: Full account deletion requires admin privileges
      // This will sign out the user and they can request deletion
      await supabase.auth.signOut();
      
      toast({
        title: "Account Deletion Requested",
        description: "Please contact support to complete account deletion.",
      });
      
      onSignOut();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to process request.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubscriptionBadge = () => {
    if (!subscriptionInfo) return null;
    
    switch (subscriptionInfo.status) {
      case 'trialing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
            Free Trial ({subscriptionInfo.trialDaysRemaining} days left)
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14B8A6]/20 text-[#5EEAD4] text-sm font-medium border border-[#14B8A6]/30">
            <Crown className="w-4 h-4" />
            Premium Active
          </span>
        );
      case 'trial_expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium border border-amber-500/30">
            <AlertTriangle className="w-4 h-4" />
            Trial Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm font-medium border border-white/20">
            Free Plan
          </span>
        );
    }
  };

  const totalStudyItems = bookmarks.length + highlights.length + Object.keys(notes).length;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#14B8A6]/20 flex items-center justify-center">
            <UserIcon className="w-12 h-12 text-[#F59E0B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-4">
            Sign In to View Your Profile
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Access your profile settings, manage your subscription, and customize your experience as a{' '}
            <span className="font-bold italic text-[#F59E0B]">Son of The One</span>.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-8 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all glow-teal"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-8 text-center">
          <Loader2 className="w-8 h-8 text-[#14B8A6] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2">
          Your Profile
        </h1>
        <p className="text-white/60">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl overflow-hidden mb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#14B8A6]/20 to-[#3B82F6]/20 p-6 sm:p-8 border-b border-[#14B8A6]/20">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center overflow-hidden border-4 border-[#14B8A6]/30 shadow-lg">
                {profileData.avatarUrl ? (
                  <img 
                    src={profileData.avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl font-bold text-white">
                    {profileData.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Upload Button Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Name & Email */}
            <div className="text-center sm:text-left flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                  <Input
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="max-w-xs bg-white/10 border-[#14B8A6]/30 text-white"
                    placeholder="Display name"
                  />
                  <button
                    onClick={handleUpdateDisplayName}
                    disabled={saving}
                    className="p-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0D9488] transition-colors"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewDisplayName(profileData.displayName);
                    }}
                    className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {profileData.displayName}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 text-white/50 hover:text-[#14B8A6] transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <p className="text-white/60 flex items-center gap-2 justify-center sm:justify-start mb-3">
                <Mail className="w-4 h-4" />
                {profileData.email}
              </p>
              
              {getSubscriptionBadge()}

            </div>
          </div>
        </div>


        {/* Edit Profile Section */}
        <div className="p-6 border-b border-[#14B8A6]/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#14B8A6]" />
            Edit Profile
          </h3>
          
          <div className="space-y-4">
            {/* Display Name */}
            <div className="bg-white/5 rounded-xl p-4">
              <Label className="text-white/50 text-sm mb-2 block">Display Name</Label>
              <div className="flex items-center gap-3">
                <Input
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="flex-1 bg-white/10 border-[#14B8A6]/30 text-white"
                  placeholder="Enter your display name"
                />
                <button
                  onClick={handleUpdateDisplayName}
                  disabled={saving || newDisplayName.trim() === profileData.displayName}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    saving || newDisplayName.trim() === profileData.displayName
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-[#14B8A6] text-white hover:bg-[#0D9488]'
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
              <p className="text-white/40 text-xs mt-2">
                This name will be displayed throughout the app and on the community leaderboard.
              </p>
            </div>

            {/* Profile Photo */}
            <div className="bg-white/5 rounded-xl p-4">
              <Label className="text-white/50 text-sm mb-2 block">Profile Photo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center overflow-hidden border-2 border-[#14B8A6]/30">
                  {profileData.avatarUrl ? (
                    <img 
                      src={profileData.avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {profileData.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        Change Photo
                      </>
                    )}
                  </button>
                  <p className="text-white/40 text-xs mt-2">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="p-6 border-b border-[#14B8A6]/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#14B8A6]" />
            Account Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/50 text-sm mb-1">Member Since</p>
              <p className="text-white font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F59E0B]" />
                {formatDate(profileData.createdAt)}
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/50 text-sm mb-1">Account Status</p>
              <p className="text-white font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#14B8A6]" />
                Verified
              </p>
            </div>
          </div>
        </div>



        {/* Export Study Notes Section */}
        <div className="p-6 border-b border-[#14B8A6]/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-[#14B8A6]" />
            Export Study Notes
          </h3>
          
          <div className="bg-gradient-to-r from-[#14B8A6]/10 to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#14B8A6]/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#14B8A6]" />
                </div>
                <div>
                  <p className="text-white font-medium">Your Study Collection</p>
                  <p className="text-white/60 text-sm">
                    {totalStudyItems > 0 ? (
                      <>
                        {bookmarks.length} bookmarks, {highlights.length} highlights, {Object.keys(notes).length} notes
                      </>
                    ) : (
                      'No study notes yet'
                    )}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowExportModal(true)}
                disabled={totalStudyItems === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  totalStudyItems > 0
                    ? 'bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white hover:from-[#0D9488] hover:to-[#0F766E] shadow-lg shadow-teal-500/25'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4" />
                Export Notes
              </button>
            </div>
            
            {totalStudyItems > 0 && (
              <p className="text-white/50 text-xs mt-3 text-center sm:text-left">
                Export as PDF or text file with filtering by book or date range
              </p>
            )}
          </div>
        </div>

        {/* Certificates Section */}
        <div className="p-6 border-b border-[#14B8A6]/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#F59E0B]" />
            My Certificates
          </h3>
          
          {(() => {
            const earnedCerts = getEarnedCertificates();
            const earnedCount = Object.keys(earnedCerts).length;
            
            if (earnedCount === 0) {
              return (
                <div className="bg-white/5 rounded-xl p-6 text-center">
                  <Trophy className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60 mb-2">No certificates earned yet</p>
                  <p className="text-white/40 text-sm">Complete all lessons in a topic to earn your first certificate!</p>
                </div>
              );
            }
            
            const certNames: Record<string, string> = {
              sonship: 'Understanding Sonship',
              spirit: 'Walking in the Spirit',
              identity: 'Divine Identity',
              faith: 'Living by Faith',
              purpose: 'Divine Purpose',
              community: 'Life in Community'
            };
            
            const certColors: Record<string, string> = {
              sonship: 'from-[#F59E0B]/20 to-[#D97706]/10 border-[#F59E0B]/30',
              spirit: 'from-[#14B8A6]/20 to-[#0D9488]/10 border-[#14B8A6]/30',
              identity: 'from-[#8B5CF6]/20 to-[#7C3AED]/10 border-[#8B5CF6]/30',
              faith: 'from-[#3B82F6]/20 to-[#2563EB]/10 border-[#3B82F6]/30',
              purpose: 'from-[#EC4899]/20 to-[#DB2777]/10 border-[#EC4899]/30',
              community: 'from-[#10B981]/20 to-[#059669]/10 border-[#10B981]/30'
            };
            
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(earnedCerts).map(([topicId, earnedDate]) => (
                  <div
                    key={topicId}
                    className={`bg-gradient-to-br ${certColors[topicId] || 'from-white/10 to-white/5 border-white/20'} border rounded-xl p-4 flex items-center gap-3`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{certNames[topicId] || topicId}</p>
                      <p className="text-white/50 text-xs">Earned {earnedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>


        {/* Leaderboard Stats */}
        <div className="p-6 border-b border-[#14B8A6]/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#14B8A6]" />
            Leaderboard Stats
          </h3>
          
          {(() => {
            const completedLessons = JSON.parse(localStorage.getItem('sog-completed-lessons') || '[]');
            const earnedCerts = getEarnedCertificates();
            const certificatesCount = Object.keys(earnedCerts).length;
            const memoryVerses = parseInt(localStorage.getItem('sog-memory-verses-count') || '0');
            const streakData = JSON.parse(localStorage.getItem('sog-memory-streak') || '{"current_streak": 0}');
            const isPublic = JSON.parse(localStorage.getItem('sog-leaderboard-public') || 'true');
            
            // Calculate points
            const lessonPoints = completedLessons.length * 50;
            const certPoints = certificatesCount * 500;
            const versePoints = memoryVerses * 100;
            const streakBonus = Math.min((streakData.current_streak || 0) * 10, 300);
            const totalPoints = lessonPoints + certPoints + versePoints + streakBonus;
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#14B8A6]">{completedLessons.length}</p>
                    <p className="text-white/50 text-sm">Lessons</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#F59E0B]">{certificatesCount}</p>
                    <p className="text-white/50 text-sm">Certificates</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#8B5CF6]">{memoryVerses}</p>
                    <p className="text-white/50 text-sm">Verses</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-orange-400">{streakData.current_streak || 0}</p>
                    <p className="text-white/50 text-sm">Day Streak</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-[#14B8A6]/10 to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Total Points</p>
                    <p className="text-3xl font-bold text-[#14B8A6]">{totalPoints.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-sm">Visibility</p>
                    <p className={`font-medium ${isPublic ? 'text-green-400' : 'text-amber-400'}`}>
                      {isPublic ? 'Public' : 'Private'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Subscription Section */}
        <div className="p-6 border-b border-[#14B8A6]/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#F59E0B]" />
            Subscription
          </h3>
          
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium mb-1">
                  {subscriptionInfo?.status === 'active' ? 'Premium Plan' : 
                   subscriptionInfo?.status === 'trialing' ? 'Free Trial' : 
                   subscriptionInfo?.status === 'trial_expired' ? 'Trial Expired' : 'Free Plan'}
                </p>
                {subscriptionInfo?.status === 'trialing' && subscriptionInfo.trialEnd && (
                  <p className="text-white/60 text-sm">
                    Trial ends {formatDate(subscriptionInfo.trialEnd)}
                  </p>
                )}
                {subscriptionInfo?.status === 'trial_expired' && (
                  <p className="text-amber-400 text-sm">
                    Upgrade to continue enjoying premium features
                  </p>
                )}
              </div>
              <button
                onClick={onOpenSubscription}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all flex items-center gap-2"
              >
                {subscriptionInfo?.status === 'active' ? 'Manage' : 'Upgrade'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="p-6 border-b border-[#14B8A6]/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#14B8A6]" />
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#14B8A6]/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#14B8A6]" />
                </div>
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-white/50 text-sm">Daily verses and updates</p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-white/50 text-sm">Browser notifications</p>
                </div>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
            
            <button
              onClick={onOpenNotifications}
              className="w-full p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-white font-medium">Advanced Settings</p>
                  <p className="text-white/50 text-sm">Schedule, content, and more</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-[#14B8A6] transition-colors" />
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="p-6 border-b border-[#14B8A6]/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#14B8A6]" />
            Security
          </h3>
          
          {!showPasswordSection ? (
            <button
              onClick={() => setShowPasswordSection(true)}
              className="w-full p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#14B8A6]/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#14B8A6]" />
                </div>
                <div>
                  <p className="text-white font-medium">Change Password</p>
                  <p className="text-white/50 text-sm">Update your account password</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-[#14B8A6] transition-colors" />
            </button>
          ) : (
            <div className="bg-white/5 rounded-xl p-4 space-y-4">
              <div>
                <Label htmlFor="newPassword" className="text-white/70 text-sm">New Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white/10 border-[#14B8A6]/30 text-white pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="text-white/70 text-sm">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 bg-white/10 border-[#14B8A6]/30 text-white"
                  placeholder="Confirm new password"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="flex-1 py-2 bg-[#14B8A6] text-white font-medium rounded-lg hover:bg-[#0D9488] transition-colors flex items-center justify-center gap-2"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordSection(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out & Delete */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onSignOut}
              className="flex-1 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 py-3 bg-red-500/10 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 border border-red-500/30"
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
            ) : (
              <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-sm mb-3">
                  Type <strong>DELETE</strong> to confirm account deletion:
                </p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="bg-white/10 border-red-500/30 text-white mb-3"
                  placeholder="Type DELETE"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    className="px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scripture Quote */}
      <div className="text-center mt-8">
        <p className="text-white/40 text-sm italic">
          "For as many as are led by the Spirit of God, they are the sons of God."
        </p>
        <p className="text-[#F59E0B]/60 text-sm font-medium mt-1">
          — Romans 8:14 (KJV 1611)

        </p>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ExportStudyNotes
              bookmarks={bookmarks}
              highlights={highlights}
              notes={notes}
              onClose={() => setShowExportModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
