/* ============================================================================
   归途 GuiTu — "Voice translation" (Figma node 7:886, listening state 257:444)
   ----------------------------------------------------------------------------
   Press-and-hold the mic → the exact same listening overlay (scrim +
   animated soundwave) as home.html's voice assistant — this page reuses
   soundwave.css unchanged and just toggles the same `.screen.is-listening`
   class app.js does.

   Two small real interactions on top of that, in keeping with "the
   interaction is real, the backend isn't" (there's no translation backend
   here to fake, so nothing pretends to translate):
     - the keyboard button focuses the English box, since it really is a
       plain, real textarea a person can type into
     - the swap button swaps the two boxes' text, a real (if modest) thing
       to do given there's nothing to actually translate
   Where the browser supports live speech recognition (webkitSpeechRecognition
   — Chrome/Edge; not universal), holding the mic also transcribes real
   speech into the English box while the soundwave plays, same graceful
   no-op-if-unsupported posture as daily-english.js's speech synthesis.
   ========================================================================== */
(function () {
  'use strict';

  var screen   = document.getElementById('screen');
  var stage    = document.querySelector('.stage');
  var voiceBtn = document.getElementById('voiceBtn');
  var status   = document.getElementById('status');
  var enWell   = document.getElementById('enWell');
  var cnWell   = document.getElementById('cnWell');

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

  /* ---------------------------------------------------- type instead / swap */
  document.getElementById('keyboardBtn').addEventListener('click', function () {
    enWell.focus();
  });

  document.getElementById('swapBtn').addEventListener('click', function () {
    var en = enWell.value;
    enWell.value = cnWell.value;
    cnWell.value = en;
  });

  /* ------------------------------------------------------- press-to-speak
     Same startListening/stopListening shape as home.html's app.js. */
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognizer = null;
  if (SpeechRecognition) {
    recognizer = new SpeechRecognition();
    recognizer.lang = 'en-US';
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.onresult = function (e) {
      var text = '';
      for (var i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      enWell.value = text.trim();
    };
    recognizer.onerror = function () { /* mic denied, no network, etc. — the overlay/animation still ran */ };
  }

  var isListening = false;

  function startListening() {
    if (isListening) return;
    isListening = true;
    screen.classList.add('is-listening');
    voiceBtn.setAttribute('aria-pressed', 'true');
    status.textContent = 'Listening… 正在聆听';
    if (recognizer) {
      try { recognizer.start(); } catch (e) { /* already started, or mic unavailable */ }
    }
  }

  function stopListening() {
    if (!isListening) return;
    isListening = false;
    screen.classList.remove('is-listening');
    voiceBtn.setAttribute('aria-pressed', 'false');
    status.textContent = '';
    if (recognizer) {
      try { recognizer.stop(); } catch (e) { /* ignore */ }
    }
  }

  voiceBtn.addEventListener('pointerdown', function (e) {
    if (voiceBtn.setPointerCapture) {
      try { voiceBtn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }
    startListening();
  });
  voiceBtn.addEventListener('pointerup', stopListening);
  voiceBtn.addEventListener('pointercancel', stopListening);
  voiceBtn.addEventListener('lostpointercapture', stopListening);

  voiceBtn.addEventListener('keydown', function (e) {
    if (e.key !== ' ' && e.key !== 'Enter' && e.key !== 'Spacebar') return;
    e.preventDefault();
    if (e.repeat) return;
    startListening();
  });
  voiceBtn.addEventListener('keyup', function (e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') stopListening();
  });
  voiceBtn.addEventListener('blur', stopListening);

  voiceBtn.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopListening();
  });
}());
