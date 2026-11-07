/* Service worker del Laboratorio CQC.
   Red primero (para recibir actualizaciones) y caché como respaldo sin señal.
   Cada vez que publiques cambios en GitHub, sube el número de CACHE para que los celulares se actualicen.
   Si cambias el nombre del index.html, actualiza también ARCHIVOS y el manifest. */
var CACHE = "laboratorio-v17";
var ARCHIVOS = ["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png",
                "./apple-touch-icon.png","./logo-izq.jpg","./logo-der.png","./exceljs.min.js"];

self.addEventListener("install", function(e){
  /* archivo por archivo: si falta alguno (p. ej. un logo), el resto igual queda guardado para usar sin señal */
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(ARCHIVOS.map(function(a){ return c.add(a).catch(function(){}); }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  if(e.request.method!=="GET" || new URL(e.request.url).origin!==location.origin) return;
  e.respondWith(fetch(e.request).then(function(r){
    if(r.ok){ var copia=r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request,copia); }); }
    return r;
  }).catch(function(){
    return caches.match(e.request,{ignoreSearch:true}).then(function(r){
      return r || (e.request.mode==="navigate" ? caches.match("./index.html") : undefined);
    });
  }));
});
