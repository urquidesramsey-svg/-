const CACHE='shiye-shell-v4-icon-blue';
const ASSETS=['./','./index.html','./style.css','./app.mjs','./core.mjs','./storage.mjs','./icon-blue.png','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('shiye-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;const url=new URL(e.request.url);const asset=ASSETS.some(a=>new URL(a,self.registration.scope).pathname===url.pathname);if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>r.ok?r:caches.match('./index.html')).catch(()=>caches.match('./index.html')))}else if(asset)e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)))});
