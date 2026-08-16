/* ============================================================================
   归途 GuiTu — "Display page" (Figma node 7:928)
   ----------------------------------------------------------------------------
   Reads which phrase to show from sessionStorage ("guitu.showPhrase") —
   same handoff pattern calling.html uses for guitu.callTarget: whoever
   tapped a phrase row writes it there right before navigating here (see
   js/phrase-library.js). Opened directly with nothing set (or a saved
   phrase with no Chinese translation) falls back to Figma's own sample
   phrase, same seed-data reasoning every other page's fallback uses.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'guitu.showPhrase';
  var FALLBACK = { en: 'I am lost, please help me.', cn: '我迷路了，请帮助我' };

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

  function loadPhrase() {
    try {
      var raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      return raw && typeof raw === 'object' && raw.en ? raw : null;
    } catch (e) { return null; }
  }

  var phrase = loadPhrase() || FALLBACK;
  document.getElementById('showPhraseEn').textContent = phrase.en;
  document.getElementById('showPhraseCn').textContent = phrase.cn || '';
}());
