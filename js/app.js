/* ============================================================================
   归途 GuiTu — home screen behaviour
     · fits the fixed 390 × 844 design to whatever viewport it is opened in
     · press-and-hold the voice assistant → listening state + animated soundwave
     · slide-up card open / close
   ========================================================================== */
(function () {
  'use strict';

  var DESIGN_W = 390;
  var DESIGN_H = 844;

  var screen   = document.getElementById('screen');
  var stage    = document.querySelector('.stage');
  var voiceBtn = document.getElementById('voiceBtn');
  var sheet    = document.getElementById('sheet');
  var handle   = document.getElementById('sheetHandle');
  var status   = document.getElementById('status');

  /* ---------------------------------------------------------------- scaling */
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

  /* ------------------------------------------------- press-to-speak (voice) */
  var isListening = false;

  function startListening() {
    if (isListening) return;
    isListening = true;
    screen.classList.add('is-listening');
    voiceBtn.setAttribute('aria-pressed', 'true');
    status.textContent = 'Listening… 正在聆听';
  }

  function stopListening() {
    if (!isListening) return;
    isListening = false;
    screen.classList.remove('is-listening');
    voiceBtn.setAttribute('aria-pressed', 'false');
    status.textContent = '';
  }

  voiceBtn.addEventListener('pointerdown', function (e) {
    // Capture the pointer so releasing outside the button still ends the press.
    if (voiceBtn.setPointerCapture) {
      try { voiceBtn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }
    startListening();
  });
  voiceBtn.addEventListener('pointerup', stopListening);
  voiceBtn.addEventListener('pointercancel', stopListening);
  voiceBtn.addEventListener('lostpointercapture', stopListening);

  // Keyboard equivalent: hold Space or Enter.
  voiceBtn.addEventListener('keydown', function (e) {
    if (e.key !== ' ' && e.key !== 'Enter' && e.key !== 'Spacebar') return;
    e.preventDefault();                  // Space would otherwise scroll
    if (e.repeat) return;
    startListening();
  });
  voiceBtn.addEventListener('keyup', function (e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') stopListening();
  });
  voiceBtn.addEventListener('blur', stopListening);

  // Suppress the long-press callout / context menu on touch devices.
  voiceBtn.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // A press interrupted by tab-away or a system gesture should not stick.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopListening();
  });

  /* ------------------------------------------------------- slide-up card */
  function setSheet(expanded) {
    sheet.dataset.state = expanded ? 'expanded' : 'collapsed';
    handle.setAttribute('aria-expanded', String(expanded));
    handle.setAttribute('aria-label', expanded ? 'Collapse contacts' : 'Expand contacts');
  }

  handle.addEventListener('click', function () {
    setSheet(sheet.dataset.state !== 'expanded');
  });

  document.querySelectorAll('[data-action="open-contacts"]').forEach(function (el) {
    el.addEventListener('click', function () { setSheet(true); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet.dataset.state === 'expanded') setSheet(false);
  });
}());
