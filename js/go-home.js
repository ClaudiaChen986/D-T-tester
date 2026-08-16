/* ============================================================================
   归途 GuiTu — "Go home" (Figma node 120:317)
   ----------------------------------------------------------------------------
   Real, embedded Google Maps again (same keyless endpoint navigation.html's
   own map uses — no API key or billing needed) — but routed, not just
   centered: destination is whatever address is saved on profile.html
   ("guitu.profile" in localStorage, the same key/field edit-profile.html
   writes and profile.html reads), so editing your address there changes
   where this page routes to. Origin is the browser's real current
   position where geolocation is available and granted; denied/unsupported
   (or just no address saved yet) falls back gracefully to a plain map
   centered on the destination, same posture as every other "real
   capability, graceful no-op otherwise" feature in this app.
   ========================================================================== */
(function () {
  'use strict';

  var PROFILE_KEY = 'guitu.profile';
  var FALLBACK_ADDRESS = '1 archer st. Chatswood';

  var stage    = document.querySelector('.stage');
  var mapFrame = document.getElementById('mapFrame');

  function fit() {
    var pad = window.innerWidth < 480 ? 0 : 32;
    var scale = Math.min(
      (window.innerWidth  - pad) / 390,
      (window.innerHeight - pad) / 844
    );
    stage.style.setProperty('--scale', Math.max(0.3, Math.min(scale, 1.6)));
  }
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);

  function homeAddress() {
    try {
      var profile = JSON.parse(localStorage.getItem(PROFILE_KEY));
      return (profile && profile.address) || FALLBACK_ADDRESS;
    } catch (e) { return FALLBACK_ADDRESS; }
  }

  function destinationOnlyUrl(address) {
    return 'https://maps.google.com/maps?q=' + encodeURIComponent(address) + '&z=15&output=embed';
  }

  function directionsUrl(origin, address) {
    return 'https://maps.google.com/maps?saddr=' + origin + '&daddr=' + encodeURIComponent(address) + '&output=embed';
  }

  var address = homeAddress();
  mapFrame.src = destinationOnlyUrl(address); // shows immediately; upgraded below if geolocation succeeds

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var origin = position.coords.latitude + ',' + position.coords.longitude;
        mapFrame.src = directionsUrl(origin, address);
      },
      function () { /* denied, unavailable, or timed out — the destination-only map already loaded */ },
      { timeout: 8000 }
    );
  }
}());
