import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useSyncedState } from '@/hooks/useSyncedState';
import {
  Award,
  Crown,
  Flame,
  Sparkles,
  Target,
  Zap,
  Users,
  Share2,
  Download,
  X,
  CheckCircle2,
  Lock,
  ExternalLink,
  Calendar,
  Star,
  Trophy,
  Medal,
  Gift
} from 'lucide-react';

interface Certificate {
  id: string;
  topicId: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  borderColor: string;
  earnedDate: string | null;
  lessonsRequired: number;
}

interface CertificateSystemProps {
  user: User | null;
  completedLessons: string[];
  onClose?: () => void;
}

interface ShareModalProps {
  certificate: Certificate;
  userName: string;
  onClose: () => void;
}

// Topic to lessons mapping
const topicLessons: Record<string, string[]> = {
  sonship: ['sonship-1', 'sonship-2', 'sonship-3', 'sonship-4'],
  spirit: ['spirit-1', 'spirit-2', 'spirit-3', 'spirit-4'],
  identity: ['identity-1', 'identity-2', 'identity-3', 'identity-4'],
  faith: ['faith-1', 'faith-2', 'faith-3', 'faith-4'],
  purpose: ['purpose-1', 'purpose-2', 'purpose-3', 'purpose-4'],
  community: ['community-1', 'community-2', 'community-3', 'community-4']
};

const ShareModal: React.FC<ShareModalProps> = ({ certificate, userName, onClose }) => {
  const shareText = `🎓 I just earned the "${certificate.title}" certificate on Sons of God! ${certificate.description} #SonsOfGod #SpiritualGrowth #Faith`;
  const shareUrl = window.location.origin;

  const handleShare = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(`I earned a certificate: ${certificate.title}`)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
    alert('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-[#14B8A6]/30 rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${certificate.bgGradient} flex items-center justify-center`}>
            {certificate.icon}
          </div>
          <h3 className="text-xl font-serif font-bold text-white mb-2">
            Share Your Achievement
          </h3>
          <p className="text-white/60 text-sm">
            Let others know about your spiritual growth journey!
          </p>
        </div>

        {/* Preview Card */}
        <div className={`bg-gradient-to-br ${certificate.bgGradient} border ${certificate.borderColor} rounded-xl p-4 mb-6`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center ${certificate.color}`}>
              {certificate.icon}
            </div>
            <div>
              <h4 className="text-white font-semibold">{certificate.title}</h4>
              <p className="text-white/60 text-sm">Earned by {userName}</p>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button
            onClick={() => handleShare('twitter')}
            className="flex flex-col items-center gap-2 p-3 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/30 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-white/80 text-xs">X</span>
          </button>

          <button
            onClick={() => handleShare('facebook')}
            className="flex flex-col items-center gap-2 p-3 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/30 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-white/80 text-xs">Facebook</span>
          </button>

          <button
            onClick={() => handleShare('linkedin')}
            className="flex flex-col items-center gap-2 p-3 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/30 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="text-white/80 text-xs">LinkedIn</span>
          </button>

          <button
            onClick={() => handleShare('whatsapp')}
            className="flex flex-col items-center gap-2 p-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/30 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-white/80 text-xs">WhatsApp</span>
          </button>

          <button
            onClick={() => handleShare('email')}
            className="flex flex-col items-center gap-2 p-3 bg-[#EA4335]/20 hover:bg-[#EA4335]/30 border border-[#EA4335]/30 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-[#EA4335]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-white/80 text-xs">Email</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <span className="text-white/80 text-xs">Copy</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Certificate Card Component
interface CertificateCardProps {
  certificate: Certificate;
  isEarned: boolean;
  progress: number;
  onShare: () => void;
  onView: () => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  isEarned,
  progress,
  onShare,
  onView
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isEarned
          ? `bg-gradient-to-br ${certificate.bgGradient} ${certificate.borderColor} shadow-lg`
          : 'bg-white/5 border-white/10 opacity-60'
      }`}
    >
      {/* Certificate Background Pattern */}
      {isEarned && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
      )}

      <div className="relative p-6">
        {/* Badge Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            isEarned ? 'bg-white/20' : 'bg-white/5'
          }`}>
            <div className={isEarned ? certificate.color : 'text-white/30'}>
              {certificate.icon}
            </div>
          </div>
          
          {isEarned ? (
            <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Earned</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full">
              <Lock className="w-4 h-4 text-white/50" />
              <span className="text-white/50 text-sm">Locked</span>
            </div>
          )}
        </div>

        {/* Certificate Info */}
        <h3 className={`text-lg font-serif font-bold mb-1 ${isEarned ? 'text-white' : 'text-white/50'}`}>
          {certificate.title}
        </h3>
        <p className={`text-sm mb-3 ${isEarned ? 'text-white/80' : 'text-white/40'}`}>
          {certificate.subtitle}
        </p>

        {/* Progress or Earned Date */}
        {isEarned ? (
          <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
            <Calendar className="w-4 h-4" />
            <span>Earned {certificate.earnedDate}</span>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/50">Progress</span>
              <span className="text-white/70">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${
                  certificate.topicId === 'sonship' ? 'from-[#F59E0B] to-[#D97706]' :
                  certificate.topicId === 'spirit' ? 'from-[#14B8A6] to-[#0D9488]' :
                  certificate.topicId === 'identity' ? 'from-[#8B5CF6] to-[#7C3AED]' :
                  certificate.topicId === 'faith' ? 'from-[#3B82F6] to-[#2563EB]' :
                  certificate.topicId === 'purpose' ? 'from-[#EC4899] to-[#DB2777]' :
                  'from-[#10B981] to-[#059669]'
                } transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isEarned && (
          <div className="flex gap-2">
            <button
              onClick={onView}
              className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              View
            </button>
            <button
              onClick={onShare}
              className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Full Certificate View Modal
interface CertificateViewModalProps {
  certificate: Certificate;
  userName: string;
  onClose: () => void;
  onShare: () => void;
}

const CertificateViewModal: React.FC<CertificateViewModalProps> = ({
  certificate,
  userName,
  onClose,
  onShare
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Certificate Display */}
        <div className="relative">
          {/* Certificate Frame */}
          <div className="relative bg-gradient-to-br from-[#F5E6D3] to-[#E8D4C0] rounded-lg p-1 shadow-2xl">
            <div className="bg-gradient-to-br from-[#FDF8F3] to-[#F5E6D3] rounded-lg p-8 border-4 border-[#D4A574]">
              {/* Decorative Corners */}
              <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-[#B8860B] rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-[#B8860B] rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-[#B8860B] rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-[#B8860B] rounded-br-lg" />

              <div className="text-center py-8">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${certificate.bgGradient} flex items-center justify-center shadow-lg`}>
                      <div className={certificate.color}>
                        {React.cloneElement(certificate.icon as React.ReactElement, { className: 'w-10 h-10' })}
                      </div>
                    </div>
                  </div>
                  <h1 className="text-3xl font-serif font-bold text-[#8B4513] mb-2">
                    Certificate of Completion
                  </h1>
                  <div className="w-32 h-1 mx-auto bg-gradient-to-r from-transparent via-[#B8860B] to-transparent" />
                </div>

                {/* Body */}
                <div className="mb-6">
                  <p className="text-[#5D4037] text-lg mb-4">This is to certify that</p>
                  <h2 className="text-4xl font-serif font-bold text-[#2C1810] mb-4">
                    {userName}
                  </h2>
                  <p className="text-[#5D4037] text-lg mb-4">
                    has successfully completed all lessons in
                  </p>
                  <h3 className="text-2xl font-serif font-bold text-[#8B4513] mb-2">
                    {certificate.title}
                  </h3>
                  <p className="text-[#6D4C41] italic">
                    {certificate.subtitle}
                  </p>
                </div>

                {/* Date */}
                <div className="mb-6">
                  <div className="w-48 h-0.5 mx-auto bg-[#B8860B] mb-2" />
                  <p className="text-[#5D4037]">
                    Awarded on {certificate.earnedDate}
                  </p>
                </div>

                {/* Seal */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#B8860B] to-[#8B6914] flex items-center justify-center shadow-lg">
                    <div className="w-20 h-20 rounded-full border-2 border-[#F5E6D3] flex items-center justify-center">
                      <Trophy className="w-10 h-10 text-[#F5E6D3]" />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6">
                  <p className="text-[#8B4513] font-serif font-bold text-xl">
                    Sons of God
                  </p>
                  <p className="text-[#6D4C41] text-sm italic">
                    Spiritual Growth Academy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6 justify-center">
          <button
            onClick={onShare}
            className="px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-medium rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share Achievement
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Certificate System Component
const CertificateSystem: React.FC<CertificateSystemProps> = ({
  user,
  completedLessons
}) => {
  // Persisted to user_data; localStorage is an offline cache.
  const [earnedCertificates, setEarnedCertificates] = useSyncedState<Record<string, string>>(
    'sog-earned-certificates', 'earned_certificates', {}, user);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);

  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Faithful Student';

  // Check for newly completed topics
  useEffect(() => {
    Object.entries(topicLessons).forEach(([topicId, lessons]) => {
      const allCompleted = lessons.every(lessonId => completedLessons.includes(lessonId));
      
      if (allCompleted && !earnedCertificates[topicId]) {
        // Award certificate
        const today = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        setEarnedCertificates(prev => ({
          ...prev,
          [topicId]: today
        }));
      }
    });
  }, [completedLessons]);

  const certificates: Certificate[] = [
    {
      id: 'cert-sonship',
      topicId: 'sonship',
      title: 'Understanding Sonship',
      subtitle: 'Discover Your Identity as a Child of God',
      description: 'Completed all lessons on understanding our identity as children of God.',
      icon: <Crown className="w-8 h-8" />,
      color: 'text-[#F59E0B]',
      bgGradient: 'from-[#F59E0B]/20 to-[#D97706]/10',
      borderColor: 'border-[#F59E0B]/30',
      earnedDate: earnedCertificates['sonship'] || null,
      lessonsRequired: 4
    },
    {
      id: 'cert-spirit',
      topicId: 'spirit',
      title: 'Walking in the Spirit',
      subtitle: 'Living by the Power of the Holy Spirit',
      description: 'Mastered the principles of walking in the Spirit daily.',
      icon: <Flame className="w-8 h-8" />,
      color: 'text-[#14B8A6]',
      bgGradient: 'from-[#14B8A6]/20 to-[#0D9488]/10',
      borderColor: 'border-[#14B8A6]/30',
      earnedDate: earnedCertificates['spirit'] || null,
      lessonsRequired: 4
    },
    {
      id: 'cert-identity',
      topicId: 'identity',
      title: 'Divine Identity',
      subtitle: 'Who You Are in Christ',
      description: 'Discovered the truth about your divine identity in Christ.',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'text-[#8B5CF6]',
      bgGradient: 'from-[#8B5CF6]/20 to-[#7C3AED]/10',
      borderColor: 'border-[#8B5CF6]/30',
      earnedDate: earnedCertificates['identity'] || null,
      lessonsRequired: 4
    },
    {
      id: 'cert-faith',
      topicId: 'faith',
      title: 'Living by Faith',
      subtitle: 'Trusting God in Every Season',
      description: 'Developed unshakeable faith that moves mountains.',
      icon: <Target className="w-8 h-8" />,
      color: 'text-[#3B82F6]',
      bgGradient: 'from-[#3B82F6]/20 to-[#2563EB]/10',
      borderColor: 'border-[#3B82F6]/30',
      earnedDate: earnedCertificates['faith'] || null,
      lessonsRequired: 4
    },
    {
      id: 'cert-purpose',
      topicId: 'purpose',
      title: 'Divine Purpose',
      subtitle: "Discovering God's Plan for Your Life",
      description: "Uncovered your unique calling and God's purpose for your life.",
      icon: <Zap className="w-8 h-8" />,
      color: 'text-[#EC4899]',
      bgGradient: 'from-[#EC4899]/20 to-[#DB2777]/10',
      borderColor: 'border-[#EC4899]/30',
      earnedDate: earnedCertificates['purpose'] || null,
      lessonsRequired: 4
    },
    {
      id: 'cert-community',
      topicId: 'community',
      title: 'Life in Community',
      subtitle: 'Growing Together in Christ',
      description: 'Embraced the importance of Christian community and fellowship.',
      icon: <Users className="w-8 h-8" />,
      color: 'text-[#10B981]',
      bgGradient: 'from-[#10B981]/20 to-[#059669]/10',
      borderColor: 'border-[#10B981]/30',
      earnedDate: earnedCertificates['community'] || null,
      lessonsRequired: 4
    }
  ];

  const getTopicProgress = (topicId: string): number => {
    const lessons = topicLessons[topicId] || [];
    const completed = lessons.filter(id => completedLessons.includes(id)).length;
    return Math.round((completed / lessons.length) * 100);
  };

  const earnedCount = Object.keys(earnedCertificates).length;
  const totalCertificates = certificates.length;

  const handleShare = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowShareModal(true);
  };

  const handleView = (certificate: Certificate) => {
    setViewingCertificate(certificate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://d64gsuwffb70l.cloudfront.net/695528f5022ffb066b447b69_1767596194897_f0fcd1c1.png"
            alt="Certificates"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c1929]/80 via-[#0f2942]/90 to-[#0c1929]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#F59E0B]/20 border border-[#F59E0B]/30 rounded-full mb-6">
              <Trophy className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-[#F59E0B] font-medium">Your Achievements</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
              Certificates & Badges
            </h1>

            <p className="text-lg sm:text-xl text-white/70 mb-8">
              Complete all lessons in a topic to earn your certificate. 
              Share your achievements and inspire others on their spiritual journey.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-xl">
                <Award className="w-5 h-5 text-[#F59E0B]" />
                <span className="text-white">
                  <span className="font-bold">{earnedCount}</span> / {totalCertificates} Earned
                </span>
              </div>
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-xl">
                <Star className="w-5 h-5 text-[#14B8A6]" />
                <span className="text-white">
                  <span className="font-bold">{Math.round((earnedCount / totalCertificates) * 100)}%</span> Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Earned Certificates Section */}
        {earnedCount > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-3">
              <Medal className="w-7 h-7 text-[#F59E0B]" />
              Earned Certificates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates
                .filter(cert => cert.earnedDate)
                .map(certificate => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    isEarned={true}
                    progress={100}
                    onShare={() => handleShare(certificate)}
                    onView={() => handleView(certificate)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* In Progress Section */}
        {earnedCount < totalCertificates && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-3">
              <Gift className="w-7 h-7 text-[#14B8A6]" />
              Certificates to Earn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates
                .filter(cert => !cert.earnedDate)
                .map(certificate => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    isEarned={false}
                    progress={getTopicProgress(certificate.topicId)}
                    onShare={() => {}}
                    onView={() => {}}
                  />
                ))}
            </div>
          </div>
        )}

        {/* All Earned Message */}
        {earnedCount === totalCertificates && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#14B8A6]/20 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-[#F59E0B]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white mb-2">
              Congratulations!
            </h3>
            <p className="text-white/70 max-w-md mx-auto">
              You've earned all available certificates! Your dedication to spiritual growth is truly inspiring.
            </p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && selectedCertificate && (
        <ShareModal
          certificate={selectedCertificate}
          userName={userName}
          onClose={() => {
            setShowShareModal(false);
            setSelectedCertificate(null);
          }}
        />
      )}

      {/* View Certificate Modal */}
      {viewingCertificate && (
        <CertificateViewModal
          certificate={viewingCertificate}
          userName={userName}
          onClose={() => setViewingCertificate(null)}
          onShare={() => {
            setSelectedCertificate(viewingCertificate);
            setViewingCertificate(null);
            setShowShareModal(true);
          }}
        />
      )}
    </div>
  );
};

export default CertificateSystem;

// Reads the offline cache only -- it is a plain function with no user context,
// so it cannot query user_data. The cache is kept in step by useSyncedState, so
// this stays correct for the signed-in user on this device.
export const getEarnedCertificates = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem('sog-earned-certificates');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Export helper to check if topic is complete
export const isTopicComplete = (topicId: string, completedLessons: string[]): boolean => {
  const lessons = topicLessons[topicId] || [];
  return lessons.every(lessonId => completedLessons.includes(lessonId));
};
