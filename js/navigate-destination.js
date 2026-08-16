/* ============================================================================
   归途 GuiTu — "Navigation" route to a saved destination (Figma node 120:363)
   ----------------------------------------------------------------------------
   Same real, routed Google Maps embed go-home.js builds — same keyless
   endpoint, same destination-only-map-loads-immediately-then-upgrades-to-
   a-route posture if geolocation succeeds — just reading a different
   saved value: "guitu.savedDestination" (written by add-destination.js),
   not the profile's home address. Opened directly with nothing saved
   (shouldn't normally happen — navigation.html only links here once a
   destination exists) falls back to the same sample address go-home.js
   uses, rather than showing a broken/blank map.
   ========================================================================== */
(function () {
  'use strict';

  var DEST_KEY = 'guitu.savedDestination';
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

  function destinationAddress() {
    try {
      var dest = JSON.parse(localStorage.getItem(DEST_KEY));
      return (dest && dest.address) || FALLBACK_ADDRESS;
    } catch (e) { return FALLBACK_ADDRESS; }
  }

  function destinationOnlyUrl(address) {
    return 'https://maps.google.com/maps?q=' + encodeURIComponent(address) + '&z=15&output=embed';
  }

  function directionsUrl(origin, address) {
    return 'https://maps.google.com/maps?saddr=' + origin + '&daddr=' + encodeURIComponent(address) + '&output=embed';
  }

  var address = destinationAddress();
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
