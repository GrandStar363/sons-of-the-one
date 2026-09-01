// Service Worker for Offline Bible Study App
//
// Cache names are versioned. BUMP THESE whenever the caching rules change --
// the activate handler deletes every cache that is not in the current set, so
// a bump is what evicts browsers holding bad entries. v1 cached API responses
// permanently (see the fetch handler), so anyone who loaded the app before this
// change is holding stale data until these names change.
const CACHE_NAME = 'bible-study-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/placeholder.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== CACHE_NAME)
            .map((key) => {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Never cache the backend.
  //
  // This used to test only for '/api/'. Supabase requests go to /rest/v1/,
  // /auth/v1/, /storage/v1/ and /functions/v1/, so they matched nothing here
  // and fell through to cacheFirst below -- which returns the cached copy and
  // never revalidates. Every database read was therefore served from a
  // permanent snapshot: a member's prayer wall, profile, donations and study
  // data would silently stop updating and never recover.
  //
  // Auth responses must additionally never be written to the cache store at
  // all, since they carry bearer tokens.
  const isBackend =
    url.pathname.startsWith('/rest/v1/') ||
    url.pathname.startsWith('/auth/v1/') ||
    url.pathname.startsWith('/storage/v1/') ||
    url.pathname.startsWith('/functions/v1/') ||
    url.pathname.includes('/api/');

  if (url.pathname.startsWith('/auth/v1/')) {
    return; // straight to network, never cached
  }

  if (isBackend || url.hostname === 'bible-api.com') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Requests carrying credentials must not be served from a shared cache.
  if (request.headers.has('authorization') || request.headers.has('apikey')) {
    return;
  }

  // Navigations go network-first so a new deployment is picked up on the next
  // load. Under cacheFirst the shell was pinned to whatever version happened to
  // be cached, and users would never see an update. cacheFirst still applies to
  // hashed build assets below, where it is safe.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // For static assets, use cache first strategy
  event.respondWith(cacheFirst(request));
});

// Cache first strategy - for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Fetch failed, returning offline fallback:', error);
    
    // Return cached index.html for navigation requests
    if (request.mode === 'navigate') {
      const cachedIndex = await caches.match('/index.html');
      if (cachedIndex) {
        return cachedIndex;
      }
    }
    
    // Return a simple offline response
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Network first strategy - for API requests
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed, checking cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_BIBLE_TEXT') {
    // Cache Bible text data
    const { book, chapter, verses } = event.data.payload;
    caches.open(CACHE_NAME).then((cache) => {
      const response = new Response(JSON.stringify({ book, chapter, verses }));
      cache.put(`/bible/${book}/${chapter}`, response);
    });
  }
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // This will be handled by the main app through IndexedDB
  // Notify all clients that sync is available
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_AVAILABLE' });
  });
}
