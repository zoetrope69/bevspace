const version = '1';
const prefix = 'bevspace';
const CACHE_NAME = `${prefix}-static-v${version}`;

const REQUIRED_FILES = [
  'bundle.js.map',
  'bundle.js',
  'index.html',
  'style.css.map',
  'style.css',
];

self.addEventListener('install', (event) => {
  // Perform install step:  loading each required file into cache
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Add all offline dependencies to the cache
        console.log('[install] Caches opened, adding all core components to cache');
        return cache.addAll(REQUIRED_FILES);
      })
      .then(() => {
        console.log('[install] All required resources have been cached, we\'re good!');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the response from the cached version
        if (response) {
          console.log(
            '[fetch] Returning from ServiceWorker cache: ',
            event.request.url
          );
          return response;
        }

        // Not in cache - return the result from the live server
        // `fetch` is essentially a "fallback"
        console.log('[fetch] Returning from server: ', event.request.url);
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  console.log('[activate] Activating ServiceWorker!');

  // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
  console.log('[activate] Claiming this ServiceWorker!');
  event.waitUntil(self.clients.claim());
});
