/* ============================================================================
   归途 GuiTu — "Choose your language" (Figma node 1:5)
   ----------------------------------------------------------------------------
   The true entry point: every session starts here. For now all three
   options lead to the same Home screen (per-language content is a later
   phase) — but the choice is still recorded, both in localStorage (so a
   future visit can remember it) and as the ?lang= the link already
   carries (so pages/home.html can read it this session even before
   anything actually branches on it).
   ========================================================================== */
(function () {
  'use strict';

  var DESIGN_W = 390;
  var DESIGN_H = 844;
  var STORAGE_KEY = 'guitu.lang';

  var stage = document.querySelector('.stage');

  /* ---------------------------------------------------------------- scaling
     Same fit-to-viewport approach as every other fixed-size screen. */
  function fit() {
    var pad = window.innerWidth < 480 ? 0 : 32;
    var scale = Math.min(
      (window.innerWidth  - pad) / DESIGN_W,
      (window.innerHeight - pad) / DESIGN_H
    );
    stage.style.setProperty('--scale', Math.max(0.3, Math.min(scale, 1.6)));
  }
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);

  /* ------------------------------------------------------ remember choice */
  document.querySelectorAll('.langbtn[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      try { localStorage.setItem(STORAGE_KEY, btn.dataset.lang); } catch (e) { /* best effort only */ }
    });
  });
}());
