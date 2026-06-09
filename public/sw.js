// Service Worker for FamilyCare PWA
// Cache version name
const CACHE_NAME = 'familycare-pwa-v1';
// Files to precache (adjust as needed)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/src/index.css',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/pages/auth/Login.jsx',
  '/src/pages/auth/Register.jsx',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  // Bootstrap CSS & JS from CDN are loaded via node_modules, will be cached on fetch
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  // Ignore non-GET requests
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      // Network fallback and cache the response
      return fetch(request).then(networkResponse => {
        // Only cache successful responses
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseClone);
        });
        return networkResponse;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        // Optionally return a generic fallback for other requests
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
