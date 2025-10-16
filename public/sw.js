// Service Worker for caching optimization and performance improvement

const CACHE_NAME = 'lxl-frontend-v1';
const STATIC_CACHE = 'lxl-static-v1';
const DYNAMIC_CACHE = 'lxl-dynamic-v1';

// Cache static assets
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/_next/static/css/',
  '/_next/static/js/',
  '/images/logo.webp',
  '/images/favicon.ico',
  '/manifest.json'
];

// Cache API responses temporarily
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STATIC_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle static assets
  if (request.url.includes('/_next/static/') || 
      request.url.includes('/images/') ||
      request.url.includes('/fonts/')) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((fetchResponse) => {
          const responseClone = fetchResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return fetchResponse;
        });
      })
    );
    return;
  }

  // Handle API requests with short-term caching
  if (request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          const fetchPromise = fetch(request).then((fetchResponse) => {
            // Only cache successful responses
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              cache.put(request, responseClone);
              
              // Set expiration for API cache
              setTimeout(() => {
                cache.delete(request);
              }, API_CACHE_DURATION);
            }
            return fetchResponse;
          }).catch(() => {
            // Return cached version if network fails
            return response || new Response('Offline', { status: 503 });
          });

          // Return cached response if available, otherwise fetch
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // Handle page requests
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request).then((fetchResponse) => {
        // Only cache successful HTML responses
        if (fetchResponse.status === 200 && 
            fetchResponse.headers.get('content-type')?.includes('text/html')) {
          const responseClone = fetchResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync for failed API requests
      handleBackgroundSync()
    );
  }
});

// Push notifications (if needed)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/images/icon-192x192.png',
      badge: '/images/badge-72x72.png',
      data: data.data
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Optimize cache size
async function cleanupOldCaches() {
  const caches = await self.caches.keys();
  const cachesToDelete = caches.filter(cache => 
    !cache.includes(CACHE_NAME) && 
    !cache.includes(STATIC_CACHE) && 
    !cache.includes(DYNAMIC_CACHE)
  );
  
  await Promise.all(
    cachesToDelete.map(cache => self.caches.delete(cache))
  );
}

// Background sync handler
async function handleBackgroundSync() {
  // Implement retry logic for failed requests
  console.log('Background sync triggered');
}

// Periodically clean up caches
setInterval(cleanupOldCaches, 24 * 60 * 60 * 1000); // Daily cleanup