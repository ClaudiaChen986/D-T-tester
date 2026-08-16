/* ============================================================================
   归途 GuiTu — event location map
   ----------------------------------------------------------------------------
   Real, embedded, routed Google Maps — same keyless endpoint and same
   destination-only-map-loads-first-then-upgrades-if-geolocation-succeeds
   posture as go-home.js/navigate-destination.js on the `navigation`
   branch — just reading the destination from ?name=&address= instead of
   a saved localStorage value, since senior-events.html hands it off
   straight through the link rather than persisting it anywhere.
   ========================================================================== */
(function () {
  'use strict';

  var FALLBACK_ADDRESS = 'Council Chambers, 818 Pacific Highway, Gordon, 2072';
  var FALLBACK_NAME = 'Location';

  var stage    = document.querySelector('.stage');
  var mapFrame = document.getElementById('mapFrame');
  var destName = document.getElementById('destName');

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

  var params = new URLSearchParams(window.location.search);
  var name = params.get('name') || FALLBACK_NAME;
  var address = params.get('address') || FALLBACK_ADDRESS;
  destName.textContent = name;

  function destinationOnlyUrl(addr) {
    return 'https://maps.google.com/maps?q=' + encodeURIComponent(addr) + '&z=15&output=embed';
  }

  function directionsUrl(origin, addr) {
    return 'https://maps.google.com/maps?saddr=' + origin + '&daddr=' + encodeURIComponent(addr) + '&output=embed';
  }

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
