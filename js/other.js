/* ============================================================================
   归途 GuiTu — "Other" (Figma node 142:824)
   Fits the fixed 390 × 844 design to whatever viewport it is opened in; same
   approach as every other fixed-size screen (see app.js / translation.js).
   ========================================================================== */
(function () {
  'use strict';

  var stage = document.querySelector('.stage');

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
}());
