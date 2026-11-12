import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Facebook, Link2, Mail, MessageCircle, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// One Share button for the whole app.
//
// Phones get the native share sheet (Facebook, WhatsApp, Messages, TikTok...).
// Elsewhere — or if the share sheet isn't available, e.g. inside some in-app
// browsers — a menu opens. The menu is drawn on top of the page (a portal),
// so a card with overflow-hidden can't clip it, and it flips above the button
// when there's no room below. Every share carries a link back to the site.

const SITE_NAME = 'Sons of the One';

export interface ShareButtonProps {
  /** Short heading, e.g. "Verse of the Day". */
  title: string;
  /** The message or scripture to share. */
  text: string;
  /** Link to share; defaults to the site's front page. */
  url?: string;
  /** Button label (default "Share"). */
  label?: string;
  /** Classes for the button itself (replaces the default look). */
  buttonClassName?: string;
  className?: string;
}

const XIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DEFAULT_BUTTON =
  'inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition-all hover:border-[#14B8A6]/60 hover:bg-[#14B8A6]/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/60';

const MENU_WIDTH = 232;

const ShareButton: React.FC<ShareButtonProps> = ({
  title, text, url, label = 'Share', buttonClassName, className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean } | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const link = url ?? `${window.location.origin}/`;
  const fullTitle = `${title} — ${SITE_NAME}`;
  const message = `${title}\n\n${text}`;

  const place = useCallback(() => {
    const r = button.current?.getBoundingClientRect();
    if (!r) return;
    const menuHeight = menu.current?.offsetHeight ?? 280;
    const spaceBelow = window.innerHeight - r.bottom;
    const above = spaceBelow < menuHeight + 16 && r.top > menuHeight + 16;
    const left = Math.min(
      Math.max(12, r.left + r.width / 2 - MENU_WIDTH / 2),
      window.innerWidth - MENU_WIDTH - 12,
    );
    setPos({ top: above ? r.top - menuHeight - 8 : r.bottom + 8, left, above });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (menu.current?.contains(t) || button.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onMove = () => place();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open, place]);

  const nativeShare = async (): Promise<boolean> => {
    if (typeof navigator.share !== 'function') return false;
    try {
      await navigator.share({ title: fullTitle, text: message, url: link });
      return true;
    } catch (err) {
      // Closing the share sheet isn't a failure.
      return (err as DOMException)?.name === 'AbortError';
    }
  };

  const handleClick = async () => {
    if (open) { setOpen(false); return; }
    const isTouch = window.matchMedia?.('(pointer: coarse)').matches;
    if (isTouch && (await nativeShare())) return;
    setOpen(true);
  };

  const openWindow = (href: string) => {
    // No "noopener" in the features: with it, window.open always returns null,
    // so a blocked pop-up couldn't be told apart. Cut the opener link instead.
    const w = window.open(href, '_blank', 'width=620,height=560');
    if (w) w.opener = null;
    else window.location.href = href; // pop-up really blocked: go there directly
    setOpen(false);
  };

  const copy = async () => {
    const value = `${message}\n\n${link}`;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Older browsers / in-app browsers without clipboard access.
      const area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      if (!ok) {
        toast({ title: "Couldn't copy", description: 'Please copy the text from the page.', variant: 'destructive' });
        return;
      }
    }
    setCopied(true);
    toast({ title: 'Copied!', description: 'Paste it anywhere to share.' });
    setTimeout(() => { setCopied(false); setOpen(false); }, 1200);
  };

  const enc = encodeURIComponent;
  const options = [
    { label: 'Facebook', icon: <Facebook className="h-4 w-4" />, color: 'bg-[#1877F2]',
      onClick: () => openWindow(`https://www.facebook.com/sharer/sharer.php?u=${enc(link)}`) },
    { label: 'X (Twitter)', icon: <XIcon />, color: 'bg-black',
      onClick: () => openWindow(`https://twitter.com/intent/tweet?text=${enc(message)}&url=${enc(link)}`) },
    { label: 'WhatsApp', icon: <MessageCircle className="h-4 w-4" />, color: 'bg-[#25D366]',
      onClick: () => openWindow(`https://wa.me/?text=${enc(`${message}\n\n${link}`)}`) },
    { label: 'Email', icon: <Mail className="h-4 w-4" />, color: 'bg-[#F59E0B]',
      onClick: () => {
        window.location.href = `mailto:?subject=${enc(fullTitle)}&body=${enc(`${message}\n\n${link}`)}`;
        setOpen(false);
      } },
  ];
  const canNative = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div className={`inline-block ${className}`}>
      <button
        ref={button}
        type="button"
        onClick={handleClick}
        aria-haspopup="menu"
        aria-expanded={open}
        className={buttonClassName ?? DEFAULT_BUTTON}
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        <span>{label}</span>
      </button>

      {open && createPortal(
        <div
          ref={menu}
          role="menu"
          style={{ position: 'fixed', top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: MENU_WIDTH, zIndex: 1000 }}
          className="rounded-xl border border-[#14B8A6]/30 bg-[#0c1929] p-2 text-left shadow-2xl shadow-black/50"
        >
          <p className="px-3 pb-1 pt-1 text-xs font-medium uppercase tracking-wide text-white/40">Share {title}</p>
          {options.map((o) => (
            <button key={o.label} type="button" role="menuitem" onClick={o.onClick}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-white ${o.color}`}>{o.icon}</span>
              {o.label}
            </button>
          ))}
          <button type="button" role="menuitem" onClick={copy}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14B8A6] text-white">
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            </span>
            {copied ? 'Copied!' : 'Copy text & link'}
          </button>
          {canNative && (
            <button type="button" role="menuitem" onClick={async () => { setOpen(false); await nativeShare(); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white">
                <Share2 className="h-4 w-4" />
              </span>
              More apps…
            </button>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
};

export default ShareButton;
