// Keeps the Horizon player page for offline use; a newer page is taken when online. No other requests.
const CACHE = 'horizon-player-1.25.0', PAGE = ['./', 'index.html', 'manifest.webmanifest', 'icons/horizon-app-180.png', 'icons/horizon-app-192.png', 'icons/horizon-app-512.png', 'icons/horizon-app.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(PAGE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // Only a good answer from the player's own address replaces what is kept: never an error or a Wi-Fi login page.
  e.respondWith(fetch(e.request).then(r => { if (r.ok && r.type === 'basic') { const copy = r.clone(); void caches.open(CACHE).then(c => c.put(e.request, copy)); return r; } return caches.match(e.request, { ignoreSearch: true }).then(m => m || r); })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match('index.html'))));
});
