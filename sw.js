/* Service Worker: оффлайн-кэш приложения "Ремонт стиралок" */
var VERSION = "sma-v3";
var CACHE = VERSION + "-cache";
var ASSETS = [
  "./index.html",
  "./Ремонт стиралок.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll(ASSETS).catch(function(){});
    }).then(function(){return self.skipWaiting();})
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE)return caches.delete(k);
      }));
    }).then(function(){return self.clients.claim();})
  );
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET")return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(res){
        if(!res || res.status !== 200 || res.type === "opaque")return res;
        var clone = res.clone();
        caches.open(CACHE).then(function(c){c.put(e.request, clone)});
        return res;
      }).catch(function(){
        if(e.request.mode === "navigate")return caches.match("./Ремонт стиралок.html");
        return Response.error();
      });
    })
  );
});