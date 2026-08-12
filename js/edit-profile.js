/* ============================================================================
   归途 GuiTu — "Your profile (edit)" — personal info form (Figma node 2:552)
   ----------------------------------------------------------------------------
   Step 1 of "edit profile": prefills from whatever's already saved
   (guitu.profile in localStorage) so editing starts from your current
   values rather than blank fields every time — Figma's own mockup shows
   the empty/placeholder state, which is just the first-ever-visit case
   here. Save writes the fields back to localStorage and hands off to
   edit-contacts.html (node 2:688) for step 2, reordering emergency
   contacts; that page's own Save then returns to profile.html, where
   everything entered here is what gets displayed.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'guitu.profile';
  var FIELDS = ['email', 'address', 'phone', 'birthday'];

  var stage = document.querySelector('.stage');
  var form = document.getElementById('editProfileForm');

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

  /* --------------------------------------------------------------- prefill */
  function loadProfile() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return raw && typeof raw === 'object' ? raw : {};
    } catch (e) { return {}; }
  }

  var saved = loadProfile();
  FIELDS.forEach(function (field) {
    var input = document.getElementById(field + 'Input');
    if (input && saved[field]) input.value = saved[field];
  });

  /* ------------------------------------------------------------------ save */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var profile = {};
    FIELDS.forEach(function (field) {
      var input = document.getElementById(field + 'Input');
      profile[field] = input.value.trim();
    });

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch (err) { /* best effort only */ }

    // Step 2 of the same "edit profile" flow — reorder emergency contacts.
    window.location.href = 'edit-contacts.html';
  });
}());
