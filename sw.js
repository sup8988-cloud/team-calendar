const CACHE_NAME="team-calendar-v2.5.0";
const APP_SHELL=["./","./index.html","./style.css","./app.js","./password-change.js","./admin-tools.js","./manifest.json","./og-image.png","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==self.location.origin)return;
if(u.pathname.endsWith("/config.js")||e.request.mode==="navigate"){e.respondWith(fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match(e.request).then(x=>x||caches.match("./index.html"))));return}
e.respondWith(caches.match(e.request).then(x=>x||fetch(e.request).then(r=>{const y=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,y));return r})))});
