/* MiRo GTA 6 Special Edition — offline app shell v1.5 */
'use strict';
const PREFIX = 'miro-gta6-se-pwa-';
const CACHE = PREFIX + '1.5';
const SHELL = ['index.html','manifest.webmanifest','pwa.js','icon-192.png','icon-512.png','icon-maskable.png','apple-touch-icon.png'];
const scope = new URL(self.registration.scope);
const urlFor = p => new URL(p,scope).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(p => new Request(urlFor(p),{cache:'reload'})))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => { if (event.data === 'ACTIVATE_UPDATE') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (req.mode === 'navigate' && (url.pathname === scope.pathname || url.pathname === new URL('index.html',scope).pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(urlFor('index.html'))) || fetch(req);
    })());
  } else if (SHELL.some(p => url.href === urlFor(p))) {
    event.respondWith((async () => (await (await caches.open(CACHE)).match(req)) || fetch(req))());
  }
});
