/* Kiangan Pickleball PWA: static assets only; never cache live data or private pages. */
const VERSION = 'kpb-static-v1';
const PRECACHE = ['/offline.html','/icon-192.png','/icon-512.png','/manifest.webmanifest'];
self.addEventListener('install', event => {event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));});
self.addEventListener('activate', event => {event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('kpb-') && k !== VERSION).map(k => caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch', event => {
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 const url=new URL(req.url);
 // Always fetch API, admin, authentication, session, and all page navigation from the network.
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).catch(() => caches.match('/offline.html')));return;
 }
 if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/admin')||url.pathname.startsWith('/login')||url.pathname.startsWith('/player')||url.pathname.startsWith('/register'))return;
 if(url.pathname.startsWith('/_next/static/')||url.pathname==='/kiangan-open-play-poster.png'||PRECACHE.includes(url.pathname)){
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(response => {if(response.ok && response.type==='basic'){const copy=response.clone();caches.open(VERSION).then(cache=>cache.put(req,copy));}return response;})));return;
 }
 // Other requests are network-only: live court and player information must never go stale.
});
