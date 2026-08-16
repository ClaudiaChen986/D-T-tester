/* ============================================================================
   归途 GuiTu — "Voice translation"
   (Figma node 7:886, listening 257:444, swapped 255:1584, swapped+listening
   257:489)
   ----------------------------------------------------------------------------
   Press-and-hold the mic → the exact same listening overlay (scrim +
   animated soundwave) as home.html's voice assistant — this page reuses
   soundwave.css unchanged and just toggles the same `.screen.is-listening`
   class app.js does.

   Two physical slots (top card, bottom card) that don't move; which
   language each one currently shows does. Swapping toggles `topLang` and
   re-renders both fields' label/card style/placeholder from it — and
   moves each field's typed text along with its language, so a sentence
   typed as English stays labeled English after a swap instead of quietly
   becoming mislabeled as Chinese. The keyboard button and the mic both
   always target the top slot, matching Figma (the keyboard button doesn't
   move to the bottom card in the swapped node either).

   In keeping with "the interaction is real, the backend isn't" (there's
   no translation backend here to fake, so nothing pretends to translate):
   the two boxes are plain, real textareas, and where the browser supports
   live speech recognition (webkitSpeechRecognition — Chrome/Edge, not
   universal) holding the mic transcribes real speech into the top box,
   in whichever language currently sits there, while the soundwave plays —
   same graceful no-op-if-unsupported posture as daily-english.js's speech
   synthesis.
   ========================================================================== */
(function () {
  'use strict';

  var screen   = document.getElementById('screen');
  var stage    = document.querySelector('.stage');
  var voiceBtn = document.getElementById('voiceBtn');
  var status   = document.getElementById('status');

  var topField    = document.getElementById('topField');
  var topLabel    = document.getElementById('topLabel');
  var topWell     = document.getElementById('topWell');
  var bottomField = document.getElementById('bottomField');
  var bottomLabel = document.getElementById('bottomLabel');
  var bottomWell  = document.getElementById('bottomWell');

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

  /* ------------------------------------------------------- language state */
  var LANG = {
    en: {
      label: '<span class="t-en">English</span><span class="t-cn"> 英语：</span>',
      placeholder: 'Speak or type in English…',
      style: 'transfield--light',
      ariaLabel: 'English text 英语',
      recognition: 'en-US',
    },
    cn: {
      label: '<span class="t-en">Chinese</span><span class="t-cn"> 中文：</span>',
      placeholder: '说中文或在此输入',
      style: 'transfield--solid',
      ariaLabel: 'Chinese text 中文',
      recognition: 'zh-CN',
    },
  };
  function otherLang(key) { return key === 'en' ? 'cn' : 'en'; }

  var topLang = 'en'; // bottom is always whichever language top isn't

  function applyField(fieldEl, labelEl, wellEl, langKey) {
    var lang = LANG[langKey];
    fieldEl.classList.remove('transfield--light', 'transfield--solid');
    fieldEl.classList.add(lang.style);
    labelEl.innerHTML = lang.label;
    wellEl.placeholder = lang.placeholder;
    wellEl.setAttribute('aria-label', lang.ariaLabel);
  }

  function render() {
    applyField(topField, topLabel, topWell, topLang);
    applyField(bottomField, bottomLabel, bottomWell, otherLang(topLang));
  }
  render();

  /* ---------------------------------------------------- type instead / swap */
  document.getElementById('keyboardBtn').addEventListener('click', function () {
    topWell.focus();
  });

  document.getElementById('swapBtn').addEventListener('click', function () {
    var oldTopText = topWell.value;
    var oldBottomText = bottomWell.value;
    topLang = otherLang(topLang);
    topWell.value = oldBottomText;
    bottomWell.value = oldTopText;
    render();
  });

  /* ------------------------------------------------------- press-to-speak
     Same startListening/stopListening shape as home.html's app.js. */
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognizer = null;
  if (SpeechRecognition) {
    recognizer = new SpeechRecognition();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.onresult = function (e) {
      var text = '';
      for (var i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      topWell.value = text.trim();
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
      recognizer.lang = LANG[topLang].recognition;
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
