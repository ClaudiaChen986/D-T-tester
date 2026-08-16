/* ============================================================================
   归途 GuiTu — "Daily English" (Figma node 7:812)
   ----------------------------------------------------------------------------
   Fits the fixed 390 × 844 design to the viewport, same as every other
   fixed-size screen. The two speaker buttons are wired to the Web Speech
   API (window.speechSynthesis) — a real, built-in browser capability, so
   unlike Speaker/Mute/Location elsewhere in this prototype ("the
   interaction is real, the backend isn't") this one doesn't need to fake
   anything: tapping it actually reads the word or sentence aloud. Browsers
   without speech synthesis (or a page opened non-interactively) just get a
   quiet no-op instead of an error.
   ========================================================================== */
(function () {
  'use strict';

  var stage = document.querySelector('.stage');

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

  /* --------------------------------------------------------- pronunciation */
  var synth = window.speechSynthesis;

  document.querySelectorAll('.dailyspeaker[data-say]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!synth) return;
      synth.cancel(); // don't stack a second reading on top of one still playing
      var utterance = new SpeechSynthesisUtterance(btn.dataset.say);
      utterance.lang = 'en-US';
      utterance.onstart = function () { btn.classList.add('is-speaking'); };
      utterance.onend = function () { btn.classList.remove('is-speaking'); };
      utterance.onerror = function () { btn.classList.remove('is-speaking'); };
      synth.speak(utterance);
    });
  });
}());
