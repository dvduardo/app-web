// Service Worker v5 - Simplified caching strategy
const CACHE_NAME = 'colecao-cache-v5';

// Pages to pre-cache aggressively (only PUBLIC pages)
const STATIC_PAGES = [
  '/offline.html',
];

// Install event - cache offline pages immediately
self.addEventListener('install', (event) => {
  console.log('[SW v5] Installing...');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW v5] Pre-caching static assets');
      return Promise.allSettled(
        STATIC_PAGES.map(url => {
          return fetch(url).then(r => {
            if (r.ok) {
              console.log(`[SW v5] ✅ Cached: ${url}`);
              return cache.put(url, r);
            }
            console.log(`[SW v5] ❌ Failed to cache ${url}: ${r.status}`);
          }).catch(e => console.log(`[SW v5] Error caching ${url}: ${e.message}`));
        })
      );
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW v5] Activating...');
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter(n => n !== CACHE_NAME)
          .map(n => {
            console.log(`[SW v5] Deleting old cache: ${n}`);
            return caches.delete(n);
          })
      );
    })
  );
});

// Fetch: network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // API calls: network-first with cache fallback (GET only)
  if (url.pathname.startsWith('/api/') && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request, { credentials: 'include' })
        .then(response => {
          if (!response || response.status >= 400) {
            throw new Error(`HTTP ${response?.status}`);
          }
          
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request.url, responseClone);
            });
          }
          
          return response;
        })
        .catch(err => {
          console.log(`[SW v5] API request failed: ${url.pathname} - trying cache`);
          return caches.match(event.request)
            .then(cached => {
              if (cached) {
                console.log(`[SW v5] ✅ API from cache: ${url.pathname}`);
                return cached;
              }
              
              // Return empty array for items/custom-fields to prevent errors
              if (url.pathname.includes('/items') || url.pathname.includes('/custom-fields')) {
                return new Response(JSON.stringify([]), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              
              return new Response(JSON.stringify({ error: 'Offline' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }
  
  // Skip non-GET requests to API
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  // HTML Pages: network-first with offline fallback
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request, { credentials: 'include' })
        .then(response => {
          if (!response || response.status >= 400) {
            console.log(`[SW v5] Network error: ${response?.status}`);
            throw new Error(`HTTP ${response?.status}`);
          }
          
          // Cache successful HTML
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request.url, responseClone)
                .then(() => console.log(`[SW v5] ✅ Cached: ${event.request.url}`))
                .catch(e => console.log(`[SW v5] Cache error: ${e.message}`));
            });
          }
          
          return response;
        })
        .catch(err => {
          console.log(`[SW v5] Network failed: ${event.request.url} - trying cache`);
          
          return caches.match(event.request)
            .then(cached => {
              if (cached) {
                console.log(`[SW v5] ✅ Served from cache: ${event.request.url}`);
                return cached;
              }
              
              // Last resort: offline page
              if (url.pathname.includes('/dashboard') || url.pathname.includes('/auth')) {
                return caches.match('/offline.html') || 
                  new Response('Offline', { status: 503 });
              }
              
              return new Response('Offline - Page not cached', { status: 503 });
            });
        })
    );
    return;
  }
  
  // Assets: cache-first
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          console.log(`[SW v5] Asset from cache: ${url.pathname}`);
          return cached;
        }
        
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request.url, clone);
            });
          }
          return response;
        }).catch(err => {
          console.log(`[SW v5] Asset offline: ${url.pathname}`);
          return new Response('Asset not available', { status: 404 });
        });
      })
  );
});

// Message handler
self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  
  if (type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW v5] Cache cleared');
    });
  }
  
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

