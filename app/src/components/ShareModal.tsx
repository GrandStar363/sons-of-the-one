import React, { useState } from 'react';
import { X, Copy, Check, Facebook, Mail, ExternalLink } from 'lucide-react';

interface ShareContent {
  type: 'verse' | 'devotional' | 'wwjd';
  title: string;
  text: string;
  reference?: string;
  theme?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ShareContent;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, content }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'text'>('preview');

  if (!isOpen) return null;

  const appName = "Sons of The One";
  const appUrl = window.location.origin;
  
  const getShareText = () => {
    if (content.type === 'verse') {
      return `"${content.text}"\n\n— ${content.reference}\n\nShared via ${appName}`;
    } else if (content.type === 'devotional') {
      return `${content.title}\n\n"${content.text}"\n\nShared via ${appName}`;
    } else {
      return `WWJD: ${content.title}\n\n${content.text}\n\nShared via ${appName}`;
    }
  };

  const getShareTitle = () => {
    if (content.type === 'verse') {
      return `${content.reference} - ${appName}`;
    } else if (content.type === 'devotional') {
      return `${content.title} - Daily Devotional`;
    } else {
      return `What Would Jesus Do? - ${content.title}`;
    }
  };

  const shareText = getShareText();
  const shareTitle = getShareTitle();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const tweetText = content.type === 'verse' 
      ? `"${content.text.slice(0, 200)}${content.text.length > 200 ? '...' : ''}" — ${content.reference}`
      : content.text.slice(0, 250);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&hashtags=BibleVerse,Faith,SonsOfTheOne`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(shareText + `\n\n${appUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const getTypeLabel = () => {
    switch (content.type) {
      case 'verse': return 'Scripture';
      case 'devotional': return 'Devotional';
      case 'wwjd': return 'WWJD Scenario';
      default: return 'Content';
    }
  };

  const getTypeColor = () => {
    switch (content.type) {
      case 'verse': return 'from-[#14B8A6] to-[#0D9488]';
      case 'devotional': return 'from-[#F59E0B] to-[#D97706]';
      case 'wwjd': return 'from-[#3B82F6] to-[#2563EB]';
      default: return 'from-[#14B8A6] to-[#0D9488]';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-[#14B8A6]/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#14B8A6]/20 to-[#3B82F6]/20 px-6 py-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-bold text-white">Share {getTypeLabel()}</h3>
          <p className="text-white/60 text-sm mt-1">Spread the Word with others</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-[#14B8A6] border-b-2 border-[#14B8A6]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Preview Card
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'text'
                ? 'text-[#14B8A6] border-b-2 border-[#14B8A6]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Plain Text
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'preview' ? (
            /* Beautiful Share Card Preview */
            <div className="bg-gradient-to-br from-[#0a1628] via-[#0f2942] to-[#0a1628] border border-[#14B8A6]/40 rounded-xl overflow-hidden shadow-lg">
              {/* Card Header with Branding */}
              <div className={`bg-gradient-to-r ${getTypeColor()} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="text-white font-bold text-sm">{appName}</span>
                </div>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-white text-xs">
                  {getTypeLabel()}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5">
                {content.theme && (
                  <span className="inline-block px-3 py-1 bg-[#14B8A6]/20 text-[#14B8A6] text-xs rounded-full mb-3 border border-[#14B8A6]/30">
                    {content.theme}
                  </span>
                )}
                
                {/* Quote Icon */}
                <svg
                  className="w-8 h-8 text-[#F59E0B]/40 mb-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                <p className="text-white font-serif text-lg leading-relaxed mb-4 italic">
                  "{content.text.length > 200 ? content.text.slice(0, 200) + '...' : content.text}"
                </p>

                {content.reference && (
                  <p className="text-[#F59E0B] font-semibold">— {content.reference}</p>
                )}

                {content.type !== 'verse' && content.title && (
                  <p className="text-[#14B8A6] font-semibold mt-2">{content.title}</p>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/40 text-xs">sonsoftheone.com</span>
                <div className="flex items-center space-x-1 text-white/40 text-xs">
                  <ExternalLink className="w-3 h-3" />
                  <span>Read more</span>
                </div>
              </div>
            </div>
          ) : (
            /* Plain Text View */
            <div className="bg-[#0a1628] border border-white/20 rounded-xl p-4">
              <pre className="text-white/80 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {shareText}
              </pre>
            </div>
          )}

          {/* Share Buttons */}
          <div className="mt-6 space-y-3">
            <p className="text-white/60 text-sm font-medium mb-3">Share to:</p>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Facebook */}
              <button
                onClick={shareToFacebook}
                className="flex flex-col items-center justify-center p-4 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 rounded-xl transition-all group"
              >
                <svg className="w-8 h-8 text-[#1877F2] mb-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-white/80 text-sm font-medium">Facebook</span>
              </button>

              {/* Twitter/X */}
              <button
                onClick={shareToTwitter}
                className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all group"
              >
                <svg className="w-8 h-8 text-white mb-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-white/80 text-sm font-medium">X (Twitter)</span>
              </button>

              {/* Email */}
              <button
                onClick={shareViaEmail}
                className="flex flex-col items-center justify-center p-4 bg-[#EA4335]/20 hover:bg-[#EA4335]/30 border border-[#EA4335]/40 rounded-xl transition-all group"
              >
                <Mail className="w-8 h-8 text-[#EA4335] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-white/80 text-sm font-medium">Email</span>
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all ${
                copied
                  ? 'bg-[#14B8A6] text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10">
          <p className="text-white/40 text-xs text-center">
            Share the Good News • {appName} • "For as many as are led by the Spirit of God, they are the sons of God." - Romans 8:14
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
