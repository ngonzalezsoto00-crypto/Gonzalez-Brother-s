// Service Worker para hacer la aplicación descargable (PWA)

// IMPORTANTE: Cambiar la versión aquí fuerza actualización en todos los dispositivos
// NUNCA se borran datos de localStorage - solo archivos en caché
const CACHE_VERSION = '3.4.1';
const CACHE_NAME = `sastrecontrol-v${CACHE_VERSION}`;

// NO CACHEAR archivos críticos para forzar actualizaciones
const urlsToCache = [
  './logo.png',
  './icon-192.png',
  './icon-512.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('SW: Instalando nueva versión', CACHE_VERSION);
  // Forzar que el nuevo SW tome control inmediatamente
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Cache abierto', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('SW: Activando versión', CACHE_VERSION);
  // Tomar control de todas las páginas inmediatamente
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Forzar que todas las páginas usen el nuevo SW
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones - SIEMPRE Network First
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Solo cachear imágenes
        if (response && response.status === 200 && event.request.url.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, usar cache solo para imágenes
        return caches.match(event.request);
      })
  );
});

// Notificar a la aplicación cuando hay una actualización disponible
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
