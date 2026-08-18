/* ============================================================================
   归途 GuiTu — service worker
   ----------------------------------------------------------------------------
   No build step, no bundler (see README) — so unlike a Workbox-generated
   worker, PRECACHE_URLS below is hand-maintained. Every page's own CSS/JS
   is listed (all of css/*.css and js/*.js — 456KB combined, small enough
   to just cache all of it rather than curate a subset), plus the six
   assets referenced from 15+ pages (return button, header, logo, background
   texture, bottom-nav background, chevron) and the three language-track
   homepages, since those are the first thing a returning visitor hits.
   The other ~90 asset files and ~70 per-page HTML files are *not* listed
   here — they're runtime-cached the first time each one loads (see the
   fetch handler below), so the install step stays fast and the cache only
   grows to cover what someone's actually visited.

   Bump CACHE_VERSION whenever PRECACHE_URLS changes (new page/asset added)
   or when shipping a fix that needs previously-cached pages/CSS/JS to be
   invalidated — the activate handler deletes every cache that doesn't
   match the current name.
   ========================================================================== */

var CACHE_VERSION = 'guitu-v1';

var PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html',

  './pages/home.html',
  './pages/home-en.html',
  './pages/home-cn.html',

  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/return-button.png',
  './assets/header.svg',
  './assets/logo-sprite.png',
  './assets/background-texture.png',
  './assets/bottomnav-bg.svg',
  './assets/icon-chevron.svg',

  './css/styles.css',
  './css/language.css',
  './css/home-en.css',
  './css/lang-en.css',
  './css/lang-cn.css',
  './css/soundwave.css',
  './css/add-contact.css',
  './css/add-destination.css',
  './css/add-event-continue.css',
  './css/add-event.css',
  './css/add-journal.css',
  './css/add-phrase.css',
  './css/calendar.css',
  './css/calling.css',
  './css/contacts.css',
  './css/daily-english.css',
  './css/edit-profile.css',
  './css/edit.css',
  './css/event-location.css',
  './css/go-home.css',
  './css/journal.css',
  './css/navigate-destination.css',
  './css/navigation.css',
  './css/other.css',
  './css/phrase-library.css',
  './css/profile.css',
  './css/senior-events.css',
  './css/show-phrase.css',
  './css/todays-events.css',
  './css/translation.css',
  './css/voice-translation.css',

  './js/app.js',
  './js/language.js',
  './js/add-contact.js',
  './js/add-destination.js',
  './js/add-event-continue.js',
  './js/add-event.js',
  './js/add-journal.js',
  './js/add-phrase.js',
  './js/calendar.js',
  './js/calling.js',
  './js/contacts.js',
  './js/daily-english.js',
  './js/edit-profile.js',
  './js/edit.js',
  './js/event-location.js',
  './js/go-home.js',
  './js/journal.js',
  './js/navigate-destination.js',
  './js/navigation.js',
  './js/other.js',
  './js/phrase-library.js',
  './js/profile.js',
  './js/show-phrase.js',
  './js/translation.js',
  './js/voice-translation.js',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function (cache) { return cache.addAll(PRECACHE_URLS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (names) {
        return Promise.all(
          names
            .filter(function (name) { return name !== CACHE_VERSION; })
            .map(function (name) { return caches.delete(name); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

/* ------------------------------------------------------------- fetch
   Same-origin requests (every page, its CSS/JS, and every local asset):
   network-first, so a visit while online always gets the latest copy,
   falling back to whatever's cached when offline. Every successful
   network response is stashed in the cache as it goes by, so the very
   first offline visit to any page still works as long as it was ever
   loaded once before while online. Navigations that fail with nothing
   cached yet fall back to offline.html rather than the browser's own
   "no internet" page, so the language-specific chrome isn't lost too.

   Cross-origin requests (Google Fonts) — cache-first instead: font
   files are effectively immutable once published, so there's no reason
   to hit the network again once one's been fetched. */
self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    event.respondWith(
      caches.match(request).then(function (cached) {
        if (cached) return cached;
        return fetch(request).then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(request, copy); });
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(function (response) {
        var copy = response.clone();
        caches.open(CACHE_VERSION).then(function (cache) { cache.put(request, copy); });
        return response;
      })
      .catch(function () {
        return caches.match(request).then(function (cached) {
          if (cached) return cached;
          if (request.mode === 'navigate') return caches.match('./offline.html');
          return Response.error();
        });
      })
  );
});
