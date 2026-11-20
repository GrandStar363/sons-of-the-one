import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, MoreVertical, PlusSquare, Share, Smartphone, X } from 'lucide-react';
import {
  canPromptInstall, installPlatform, isInstalled, onInstallChange, promptInstall,
} from '@/lib/installApp';

// "Add to Home Screen": the browser's own install dialog where there is one
// (Android, Chrome/Edge on a computer), otherwise the exact steps for this
// device. Hidden once the app is running from the home screen.

interface Props {
  /** Classes for the menu-item button (matches the menu it sits in). */
  className?: string;
  onDone?: () => void;
}

const Step: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <li className="flex gap-3">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#14B8A6] text-sm font-bold text-white">{n}</span>
    <span className="pt-0.5">{children}</span>
  </li>
);

const AddToHomeScreen: React.FC<Props> = ({ className, onDone }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [, rerender] = useState(0);
  useEffect(() => onInstallChange(() => rerender((n) => n + 1)), []);

  if (isInstalled()) return null;
  const platform = installPlatform();

  const handleClick = async () => {
    if (canPromptInstall()) {
      const result = await promptInstall();
      if (result !== 'unavailable') { onDone?.(); return; }
    }
    setShowHelp(true);
  };

  const close = () => { setShowHelp(false); onDone?.(); };

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        <Smartphone className="w-4 h-4" />
        <span>Add to Home Screen</span>
      </button>

      {showHelp && createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-4" role="dialog" aria-modal="true" aria-label="Add to Home Screen">
          <div className="absolute inset-0 bg-black/60" onClick={close} />
          <div className="relative w-full max-w-md rounded-2xl border border-[#14B8A6]/30 bg-[#0f2942] p-6 text-white shadow-2xl">
            <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4 flex items-center gap-3">
              <img src="/icon-192.png" alt="" className="h-12 w-12 rounded-xl" />
              <div>
                <h2 className="font-serif text-xl font-bold">Add to Home Screen</h2>
                <p className="text-sm text-white/60">Open Sons of the One like an app, one tap away.</p>
              </div>
            </div>

            <ol className="space-y-3 text-[15px] leading-snug text-white/90">
              {platform === 'in-app' && (<>
                <Step n={1}>This page is open inside another app (TikTok, Facebook, Instagram...). Tap the <b>⋯</b> or <b>share</b> button at the top or bottom of the screen.</Step>
                <Step n={2}>Choose <b>"Open in browser"</b> (or "Open in Safari" / "Open in Chrome").</Step>
                <Step n={3}>In the browser, open the menu and tap <b>Add to Home Screen</b> again.</Step>
              </>)}
              {platform === 'ios' && (<>
                <Step n={1}>Tap the <b>Share</b> button <Share className="inline h-4 w-4 align-[-2px]" /> at the bottom of Safari (top right on iPad).</Step>
                <Step n={2}>Scroll down and tap <b>Add to Home Screen</b> <PlusSquare className="inline h-4 w-4 align-[-2px]" />.</Step>
                <Step n={3}>Tap <b>Add</b>. The Sons of the One icon appears on your home screen.</Step>
              </>)}
              {platform === 'android' && (<>
                <Step n={1}>Tap the browser menu <MoreVertical className="inline h-4 w-4 align-[-2px]" /> at the top right of Chrome.</Step>
                <Step n={2}>Tap <b>Add to Home screen</b> (or <b>Install app</b>).</Step>
                <Step n={3}>Tap <b>Install</b> / <b>Add</b>. The icon appears on your home screen.</Step>
              </>)}
              {platform === 'desktop' && (<>
                <Step n={1}>In Chrome or Edge, click the <b>install icon</b> at the right end of the address bar (a screen with an arrow), or open the browser menu <MoreVertical className="inline h-4 w-4 align-[-2px]" />.</Step>
                <Step n={2}>Choose <b>Install Sons of the One</b> (Chrome: "Cast, save and share" → "Install page as app"; Edge: "Apps" → "Install this site as an app").</Step>
                <Step n={3}>Click <b>Install</b>. It opens in its own window and gets a desktop / taskbar icon.</Step>
              </>)}
            </ol>

            <button type="button" onClick={close} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488] py-3 font-semibold">
              <Check className="h-4 w-4" /> Got it
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default AddToHomeScreen;
