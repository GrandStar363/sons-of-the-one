// "Add to Home Screen" support.
//
// Chrome/Edge/Android announce installability with a `beforeinstallprompt`
// event, once, early in the page's life, so it is captured at start-up
// (main.tsx) and kept here until the member taps "Add to Home Screen".
// iPhones have no such prompt: the member is shown the Share-menu steps instead.

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function captureInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // we offer it from the menu instead of a pop-up banner
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

export function onInstallChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const canPromptInstall = () => deferred !== null;

/** Opens the browser's own install dialog. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable';
  const event = deferred;
  deferred = null; // the event can only be used once
  await event.prompt();
  const { outcome } = await event.userChoice;
  notify();
  return outcome;
}

/** Already running as an installed app (opened from the home screen). */
export function isInstalled(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export type InstallPlatform = 'in-app' | 'ios' | 'android' | 'desktop';

export function installPlatform(): InstallPlatform {
  const ua = navigator.userAgent;
  // TikTok, Instagram, Facebook, Messenger, Snapchat, LINE... can't install apps.
  if (/FBAN|FBAV|FB_IAB|Instagram|TikTok|musical_ly|Bytedance|Snapchat|Line\/|Messenger/i.test(ua)) return 'in-app';
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(ua) || iPadOS) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}
