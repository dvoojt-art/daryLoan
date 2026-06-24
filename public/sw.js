const CACHE_NAME = 'daryloan-cache-v1';

// Files to cache immediately (core app shell)
const urlsToCache = [
  '/',
];

// Install event → cache base files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event → cleanup old cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event → offline-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version first if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network and cache it
      return fetch(event.request)
        .then((response) => {
          // Clone response before caching
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Offline fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});