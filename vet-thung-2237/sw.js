const CACHE_PREFIX = 'vt2237-reader-';
const CACHE_NAME = 'vt2237-reader-20260814-46';
const CORE_URLS = [
  './index.html',
  './styles.css?v=reader-share-capability-20260812',
  './story-data.js?v=volume-01-complete-20260813',
  './app.js?v=reader-fullscreen-exit-20260814',
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
const VOLUME_PAGE_URLS = [
  './assets/pages/page-01.webp?v=dialogue-20260811',
  './assets/pages/page-02.webp?v=dialogue-20260811',
  './assets/pages/page-03.webp?v=dialogue-20260811-p34',
  './assets/pages/page-04.webp?v=dialogue-20260811-p34',
  './assets/pages/page-05.webp?v=dialogue-20260811-p56',
  './assets/pages/page-06.webp?v=dialogue-20260811-p56',
  './assets/pages/page-07.webp?v=dialogue-20260811-p78',
  './assets/pages/page-08.webp?v=dialogue-20260811-p78',
  './assets/pages/page-09.webp?v=dialogue-20260811-p910',
  './assets/pages/page-10.webp?v=dialogue-20260811-p910',
  './assets/pages/page-11.webp?v=dialogue-20260811-p1112',
  './assets/pages/page-12.webp?v=dialogue-20260811-p1112',
  './assets/pages/page-13.webp?v=chapter-02-20260813-p1',
  './assets/pages/page-14.webp?v=chapter-02-20260813-p2',
  './assets/pages/page-15.webp?v=chapter-02-20260813-p34',
  './assets/pages/page-16.webp?v=chapter-02-20260813-p34',
  './assets/pages/page-17.webp?v=chapter-02-20260813-p56',
  './assets/pages/page-18.webp?v=chapter-02-20260813-p56',
  './assets/pages/page-19.webp?v=chapter-02-20260813-p78',
  './assets/pages/page-20.webp?v=chapter-02-20260813-p78',
  './assets/pages/page-21.webp?v=chapter-02-20260813-p910',
  './assets/pages/page-22.webp?v=chapter-02-20260813-p910',
  './assets/pages/page-23.webp?v=chapter-02-20260813-p1112',
  './assets/pages/page-24.webp?v=chapter-02-20260813-p1112'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_URLS)
        .then(() => cache.addAll(VOLUME_PAGE_URLS))
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
  const requestUrl = new URL(request.url);
  const isRetry = requestUrl.searchParams.has('retry');
  requestUrl.searchParams.delete('retry');
  const canonicalRequest = isRetry ? requestUrl.href : request;
  const cached = isRetry ? null : await matchRuntimeResponse(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await storeRuntimeResponse(canonicalRequest, response);
  return response;
}

async function matchRuntimeResponse(key) {
  try {
    return await caches.match(key);
  } catch (_) {
    return null;
  }
}

async function storeRuntimeResponse(key, response) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(key, response.clone());
  } catch (_) {}
}

async function networkFirst(request) {
  let networkResponse = null;
  try {
    networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await storeRuntimeResponse('./index.html', networkResponse);
      return networkResponse;
    }
  } catch (_) {}
  return (await matchRuntimeResponse(request)) || (await matchRuntimeResponse('./index.html')) || networkResponse || Response.error();
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
