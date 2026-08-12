/* ============================================================================
   归途 GuiTu — "Your profile" view (Figma node 2:544)
   ----------------------------------------------------------------------------
   Reads whatever was last saved by edit-profile.html (localStorage key
   guitu.profile) and fills the four fields with it. Nothing saved yet
   (first visit) → the sample values already baked into the HTML stay put,
   matching Figma's own mockup instead of showing an empty page.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'guitu.profile';

  var stage = document.querySelector('.stage');
  var editBtn = document.getElementById('editBtn');

  /* ---------------------------------------------------------------- scaling */
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

  /* -------------------------------------------------------------- render */
  function loadProfile() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return raw && typeof raw === 'object' ? raw : null;
    } catch (e) { return null; }
  }

  var profile = loadProfile();
  if (profile) {
    ['email', 'address', 'phone', 'birthday'].forEach(function (field) {
      var el = document.getElementById(field + 'Value');
      if (el && profile[field]) el.textContent = profile[field];
    });
  }

  editBtn.addEventListener('click', function () {
    window.location.href = 'edit-profile.html';
  });
}());
