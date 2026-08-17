/* ============================================================================
   归途 GuiTu — "Choose your language" (Figma node 1:5)
   ----------------------------------------------------------------------------
   The true entry point: every session starts here. "Only English" links
   to pages/home-en.html and "Only Chinese" to pages/home-cn.html; the
   bilingual choice still falls back to pages/home.html?lang=both, since
   that option was never meant to get its own single-language homepage.
   The choice is recorded in localStorage either way.
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
