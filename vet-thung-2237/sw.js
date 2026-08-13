const CACHE_PREFIX = 'vt2237-reader-';
const CACHE_NAME = 'vt2237-reader-20260813-25';
const CORE_URLS = [
  './index.html',
  './styles.css?v=reader-share-capability-20260812',
  './story-data.js?v=volume-01-complete-20260813',
  './app.js?v=reader-chapter-keys-20260813',
  './assets/cover.webp?v=cover-20260812',
  './assets/fonts/be-vietnam-pro-400.woff2',
  './assets/fonts/be-vietnam-pro-500.woff2',
  './assets/fonts/be-vietnam-pro-600.woff2',
  './assets/fonts/be-vietnam-pro-700.woff2',
  './assets/fonts/be-vietnam-pro-800.woff2',
  './assets/fonts/spectral-600.woff2',
  './assets/fonts/spectral-600-italic.woff2'
];
const OPTIONAL_URLS = [
  './manifest.webmanifest?v=volume-01-complete-20260813',
  './assets/icon-192.svg?v=pwa-20260812',
  './assets/icon-512.svg?v=pwa-20260812',
  './assets/icon-192.png?v=pwa-20260812',
  './assets/icon-512.png?v=pwa-20260812'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_URLS)
        .then(() => Promise.allSettled(OPTIONAL_URLS.map(url => cache.add(url)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    return (await caches.match(request)) || caches.match('./index.html');
  }
}

self.addEventListener('fetch', event => {
  const {request} = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  if (['font', 'image', 'manifest', 'script', 'style'].includes(request.destination)) {
    event.respondWith(cacheFirst(request));
  }
});
