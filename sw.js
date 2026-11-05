/**
 * Gayatri Electrical Services — Enterprise Service Worker
 * Version: 26.11.05.2 | Offline Resilience Engine
 */

const CACHE_NAME = 'ges-cache-v26.11.05.2';
const PRECACHE_URLS = [
    './',
    './index.html',
    './404.html',
    'css/style.min.css?v=26.11.05.2',
    'js/main.min.js?v=26.11.05.2',
    'assets/logo.png',
    'assets/favicon.svg',
    'data/schema.json',
    'data/locales/en.json',
    'data/locales/hi.json',
    'data/locales/mr.json',
    'site.webmanifest',
    'assets/fonts/fonts.css'
];

// Install Event - Pre-cache critical application shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - Stale-While-Revalidate for app assets, Network-First for API/External
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Don't intercept analytics, recaptcha, or cross-origin scripts
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});
