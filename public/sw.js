const SW_VERSION = "yumekai-v2-1";
const STATIC_CACHE = `${SW_VERSION}-static`;
const MEDIA_CACHE = `${SW_VERSION}-media`;
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;

const OFFLINE_URL = "/offline.html";
const STATIC_ASSETS = [
  "/",
  OFFLINE_URL,
  "/manifest.json",
  "/site.webmanifest",
  "/favicon.ico",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, MEDIA_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  return cached || networkPromise;
}

async function networkFirstNavigate(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    return caches.match(OFFLINE_URL);
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigate(request));
    return;
  }

  if (!sameOrigin) return;

  if (url.pathname.startsWith("/api/files/") || request.destination === "audio") {
    event.respondWith(cacheFirst(request, MEDIA_CACHE));
    return;
  }

  if (["style", "script", "image", "font"].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "CACHE_URLS" || !Array.isArray(data.urls)) return;

  event.waitUntil(
    caches.open(MEDIA_CACHE).then(async (cache) => {
      for (const rawUrl of data.urls) {
        if (typeof rawUrl !== "string" || !rawUrl) continue;
        try {
          const request = new Request(rawUrl, { credentials: "include" });
          const existing = await cache.match(request);
          if (!existing) {
            const response = await fetch(request);
            if (response && response.ok) {
              await cache.put(request, response.clone());
            }
          }
        } catch {
          // ignore cache warmup errors
        }
      }
    })
  );
});
