self.addEventListener('install', (e) => {
  self.skipWaiting(); // Take over immediately
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      return self.clients.claim(); // Control all open clients
    }).then(() => {
      // Self-destruct the service worker
      return self.registration.unregister();
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Do nothing, just pass through to network
  // In case the SW is still intercepting before unregistering
});
