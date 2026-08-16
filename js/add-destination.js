/* ============================================================================
   归途 GuiTu — "Set destination": live map preview, real save
   ----------------------------------------------------------------------------
   Address drives a live, embedded Google Maps preview (same keyless
   endpoint every other map in this app uses) — debounced 700ms so it
   doesn't re-request on every keystroke, and held behind a plain
   placeholder until there's at least a few characters worth geocoding.

   Save validates the address (the field the map/route actually depends
   on — Place name is just a friendly label and falls back to the address
   itself if left blank), writes { name, address } to localStorage
   ("guitu.savedDestination" — a single slot, not a list, since only one
   row on navigation.html's sheet is wired to show a saved destination
   right now) and returns to navigation.html, where that row now shows
   the saved name. Same file:// localStorage-disabled fallback as
   add-contact.js/add-phrase.js.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'guitu.savedDestination';
  var PREVIEW_DEBOUNCE_MS = 700;
  var PREVIEW_MIN_LENGTH = 3;

  var stage         = document.querySelector('.stage');
  var form          = document.getElementById('addDestinationForm');
  var addressField  = document.getElementById('addressField');
  var nameInput     = document.getElementById('nameInput');
  var addressInput  = document.getElementById('addressInput');
  var destMap       = document.getElementById('destMap');
  var destMapFrame  = document.getElementById('destMapFrame');
  var status        = document.getElementById('formStatus');

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

  /* --------------------------------------------------------- map preview */
  var previewTimer = null;

  function schedulePreview() {
    clearTimeout(previewTimer);
    var address = addressInput.value.trim();
    if (address.length < PREVIEW_MIN_LENGTH) {
      destMap.classList.remove('has-preview');
      return;
    }
    previewTimer = setTimeout(function () {
      destMapFrame.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(address) + '&z=16&output=embed';
      destMap.classList.add('has-preview');
    }, PREVIEW_DEBOUNCE_MS);
  }
  addressInput.addEventListener('input', schedulePreview);

  /* ------------------------------------------------------------------ save */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var address = addressInput.value.trim();
    if (!address) {
      addressField.classList.add('is-invalid');
      addressInput.focus();
      status.classList.add('is-error');
      status.textContent = 'Please enter an address before saving.';
      return;
    }
    addressField.classList.remove('is-invalid');
    status.classList.remove('is-error');

    var destination = { name: nameInput.value.trim() || address, address: address };

    var storedOk = false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(destination));
      storedOk = true;
    } catch (err) {
      storedOk = false;
    }

    var target = 'navigation.html';
    if (!storedOk) target += '?newDest=' + encodeURIComponent(JSON.stringify(destination));

    window.location.href = target;
  });

  addressInput.addEventListener('input', function () {
    if (addressInput.value.trim()) {
      addressField.classList.remove('is-invalid');
      status.classList.remove('is-error');
      status.textContent = '';
    }
  });
}());
