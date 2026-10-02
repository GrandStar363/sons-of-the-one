
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register the service worker for offline functionality in PRODUCTION only.
// In dev it caches the built bundle and serves stale JS, which masks .env and
// code changes (e.g. a freshly-added Stripe key not taking effect). So in dev
// we actively unregister any previously-installed worker instead.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  } else {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});
  }
}

// Remove dark mode class addition
createRoot(document.getElementById("root")!).render(<App />);
