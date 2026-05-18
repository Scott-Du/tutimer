const CACHE_NAME = "tukuai-timer-v20260507-3";
const SCOPE_URL = new URL(self.registration.scope);
const TIMER_PAGE_URL = new URL("index.html", SCOPE_URL).toString();
const APP_ROOT_PATH = SCOPE_URL.pathname;
const APP_ROOT_PATH_NO_SLASH = APP_ROOT_PATH.endsWith("/") ? APP_ROOT_PATH.slice(0, -1) : APP_ROOT_PATH;
const TIMER_PAGE_PATH = new URL("index.html", SCOPE_URL).pathname;
const CORE_URLS = [
  TIMER_PAGE_URL
];
const OPTIONAL_URLS = [
  TIMER_PAGE_URL,
  "timer-manifest.webmanifest",
  "assets/favicon.png",
  "assets/logo.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/icon-maskable-192.png",
  "assets/icon-maskable-512.png",
  "assets/apple-touch-icon.png"
].map((url) => new URL(url, SCOPE_URL).toString());
const NAVIGATION_PATHS = new Set([
  APP_ROOT_PATH,
  APP_ROOT_PATH_NO_SLASH || "/",
  TIMER_PAGE_PATH
]);
const TIMER_ASSET_PREFIX = new URL("assets/", SCOPE_URL).pathname;
const TIMER_STATIC_PATHS = new Set([
  new URL("timer-manifest.webmanifest", SCOPE_URL).pathname
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("tukuai-timer-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
      .then(() => {
        warmOptionalCache();
      })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" || NAVIGATION_PATHS.has(url.pathname)) {
    event.respondWith(networkFirstTimerPage(request));
    return;
  }

  if (url.pathname.startsWith(TIMER_ASSET_PREFIX) || TIMER_STATIC_PATHS.has(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function networkFirstTimerPage(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(TIMER_PAGE_URL, response.clone());
    }
    return response;
  } catch (_error) {
    const cached = await caches.match(TIMER_PAGE_URL);
    if (cached) return cached;
    throw _error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

async function warmOptionalCache() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(
    OPTIONAL_URLS.map(async (url) => {
      const response = await fetch(new Request(url, { cache: "reload" }));
      if (response.ok) {
        await cache.put(url, response.clone());
      }
    })
  );
}
