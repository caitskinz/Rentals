const VERSION = 'v1'; // bump this whenever you push changes
const SHELL = ['./', './index.html', './manifest.json', './icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Leave Apps Script, Nominatim and all POSTs alone
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Network first, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(res => { caches.open(VERSION).then(c => c.put(e.request, res.clone())); return res; })
      .catch(() => caches.match(e.request))
  );
});
