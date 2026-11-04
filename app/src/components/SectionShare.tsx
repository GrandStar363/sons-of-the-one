import React, { useEffect, useRef, useState } from 'react';
import { Check, Facebook, Link2, Mail, MessageCircle, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// A "Share" button for home-page sections.
//
// Phones get the native share sheet (Facebook, TikTok, WhatsApp, Messages...).
// Elsewhere it opens a small menu. The shared link is the site's front page,
// so people arriving from a share land on the "One Classroom" welcome.

interface SectionShareProps {
  /** Short heading for the share, e.g. "The Gospel Message". */
  title: string;
  /** The message or scripture to share. */
  text: string;
  className?: string;
}

const SITE_NAME = 'Sons of the One';

const XIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SectionShare: React.FC<SectionShareProps> = ({ title, text, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  const url = `${window.location.origin}/`;
  const fullTitle = `${title} — ${SITE_NAME}`;
  const message = `${title}\n\n${text}`;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleClick = async () => {
    const isTouch = window.matchMedia?.('(pointer: coarse)').matches;
    if (isTouch && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: fullTitle, text: message, url });
        return;
      } catch (err) {
        // Closing the share sheet isn't an error; anything else falls back to the menu.
        if ((err as DOMException)?.name === 'AbortError') return;
      }
    }
    setOpen((o) => !o);
  };

  const openWindow = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer,width=620,height=520');
    setOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${message}\n\n${url}`);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Paste it anywhere to share.' });
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1200);
    } catch {
      toast({ title: "Couldn't copy", description: 'Please copy the address from your browser.', variant: 'destructive' });
    }
  };

  const enc = encodeURIComponent;
  const options = [
    {
      label: 'Facebook',
      icon: <Facebook className="w-4 h-4" />,
      color: 'bg-[#1877F2]',
      onClick: () => openWindow(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`),
    },
    {
      label: 'X (Twitter)',
      icon: <XIcon />,
      color: 'bg-black',
      onClick: () => openWindow(`https://twitter.com/intent/tweet?text=${enc(message)}&url=${enc(url)}`),
    },
    {
      label: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'bg-[#25D366]',
      onClick: () => openWindow(`https://wa.me/?text=${enc(`${message}\n\n${url}`)}`),
    },
    {
      label: 'Email',
      icon: <Mail className="w-4 h-4" />,
      color: 'bg-[#F59E0B]',
      onClick: () => {
        window.location.href = `mailto:?subject=${enc(fullTitle)}&body=${enc(`${message}\n\n${url}`)}`;
        setOpen(false);
      },
    },
  ];

  return (
    <div ref={wrapper} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition-all hover:border-[#14B8A6]/60 hover:bg-[#14B8A6]/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/60"
      >
        <Share2 className="w-4 h-4" aria-hidden="true" />
        Share
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-40 mt-2 w-56 -translate-x-1/2 rounded-xl border border-[#14B8A6]/30 bg-[#0c1929] p-2 text-left shadow-2xl shadow-black/50"
        >
          {options.map((o) => (
            <button
              key={o.label}
              type="button"
              role="menuitem"
              onClick={o.onClick}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-white ${o.color}`}>{o.icon}</span>
              {o.label}
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14B8A6] text-white">
              {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            </span>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SectionShare;
