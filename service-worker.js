/* service-worker.js — Novare Apps Hub */
const CACHE_VERSION = 'v1.0.0';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './privacy.html',
  './terms.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
    .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Stale-while-revalidate for apps.json
  if (url.pathname.endsWith('/apps.json') || url.pathname.endsWith('apps.json')) {
    event.respondWith(swr(req));
    return;
  }

  // Cache-first for same-origin GET
  if (req.method === 'GET' && url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        return res;
      }).catch(()=>caches.match('./index.html')))
    );
  }
});

async function swr(request){
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(res=>{
    cache.put(request, res.clone());
    return res;
  }).catch(()=>cached);
  return cached || networkPromise;
}
