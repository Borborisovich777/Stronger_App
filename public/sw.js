const CACHE_VERSION = "v8-strong-catalog";
const CACHE_PREFIX = "stronger-";
const SHELL_CACHE = `${CACHE_PREFIX}shell-${CACHE_VERSION}`;
const ASSET_CACHE = `${CACHE_PREFIX}assets-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${CACHE_VERSION}`;
const ACTIVE_CACHES = new Set([SHELL_CACHE, ASSET_CACHE, RUNTIME_CACHE]);

const SCOPE_URL = new URL(self.registration.scope);
const APP_PATH = SCOPE_URL.pathname;
const scopedUrl = (path) => new URL(path, SCOPE_URL).href;

const PRECACHE_URLS = [
  scopedUrl("./"),
  scopedUrl("manifest.webmanifest"),
  scopedUrl("icon-192.png"),
  scopedUrl("icon-512.png"),
  scopedUrl("apple-touch-icon.png"),
];

function isCacheable(response) {
  if (!response || !response.ok || response.type !== "basic") {
    return false;
  }

  const cacheControl = response.headers.get("Cache-Control") || "";
  return !cacheControl.includes("no-store");
}

async function cacheResponse(cacheName, request, response) {
  if (!isCacheable(response)) {
    return;
  }

  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  } catch {
    // A cache quota or write failure must never make an online request fail.
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: "reload" })),
        ),
      ),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith(CACHE_PREFIX) &&
              !ACTIVE_CACHES.has(cacheName),
          )
          .map((cacheName) => caches.delete(cacheName)),
      ),
    ),
  );
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    await cacheResponse(SHELL_CACHE, request, response);
    return response;
  } catch {
    const cachedResponse = await caches.match(request, { ignoreSearch: true });
    if (cachedResponse) {
      return cachedResponse;
    }

    const shellResponse = await caches.match(scopedUrl("./"));
    if (shellResponse) {
      return shellResponse;
    }

    return new Response("Stronger is unavailable offline until it has loaded once.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirst(request) {
  const cachedResponse =
    await caches.match(request, { cacheName: ASSET_CACHE }) ||
    await caches.match(request, { cacheName: RUNTIME_CACHE });
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);
  await cacheResponse(ASSET_CACHE, request, response);
  return response;
}

async function staleWhileRevalidate(event, request) {
  const cachedResponse = await caches.match(request);
  const networkResponse = fetch(request).then(async (response) => {
    await cacheResponse(ASSET_CACHE, request, response);
    return response;
  });

  if (cachedResponse) {
    event.waitUntil(networkResponse.catch(() => undefined));
    return cachedResponse;
  }

  return networkResponse;
}

function isImmutableAsset(url, request) {
  return (
    url.pathname.startsWith(`${APP_PATH}assets/`) ||
    url.pathname.startsWith(`${APP_PATH}exercises/`) ||
    request.destination === "font" ||
    /\.[a-f0-9]{8,}\.(?:css|js|woff2?)$/i.test(url.pathname)
  );
}

function isRevalidatingAsset(url, request) {
  return (
    ["image", "script", "style"].includes(request.destination) ||
    url.pathname === new URL("manifest.webmanifest", SCOPE_URL).pathname
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_PATH)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isImmutableAsset(url, request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isRevalidatingAsset(url, request)) {
    event.respondWith(staleWhileRevalidate(event, request));
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(RUNTIME_CACHE);
  let nextIndex = 0;
  let cached = 0;
  let failed = 0;

  // Keep the initial illustration download from overwhelming a mobile connection.
  await Promise.all(Array.from({ length: Math.min(6, urls.length) }, async () => {
    while (nextIndex < urls.length) {
      const request = new Request(urls[nextIndex++], { credentials: "same-origin" });
      try {
        const existing = await cache.match(request) ||
          await caches.match(request, { cacheName: ASSET_CACHE });
        if (!existing) {
          const response = await fetch(request);
          if (!isCacheable(response)) {
            throw new Error(`Uncacheable response for ${request.url}`);
          }
          await cache.put(request, response);
        }
        cached += 1;
      } catch {
        failed += 1;
      }
    }
  }));

  return { cached, failed };
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_URLS" || !Array.isArray(event.data.urls)) {
    return;
  }

  const urls = [...new Set(event.data.urls.flatMap((value) => {
    if (typeof value !== "string") {
      return [];
    }

    try {
      const url = new URL(value, SCOPE_URL);
      return url.origin === self.location.origin && url.pathname.startsWith(APP_PATH) ? [url.href] : [];
    } catch {
      return [];
    }
  }))];

  const work = cacheUrls(urls)
    .catch(() => ({ cached: 0, failed: urls.length }))
    .then((result) => {
      event.ports[0]?.postMessage({
        type: "CACHE_URLS_RESULT",
        ...result,
      });
    });

  event.waitUntil(work);
});
