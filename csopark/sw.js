const CACHE_NAME = 'csopark-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/static/icons/csopark_icon.png'
];

// Telepítéskor cache-eljük az alap fájlokat
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

// Kérések kezelése: először cache-ből próbál, aztán hálózatról
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Cache frissítése, ha verziót váltunk (nem kötelező most)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      ))
  );
});
