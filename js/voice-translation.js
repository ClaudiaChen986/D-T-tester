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

   Translation is real too, via MyMemory's free, keyless translation API
   (no account/API key needed, same reasoning as the keyless Google Maps
   embed on the Navigation screen) — typing or speaking into either box
   translates into the other, debounced so it fires after a pause rather
   than on every keystroke/interim speech result. Where the browser
   supports live speech recognition (webkitSpeechRecognition — Chrome/
   Edge, not universal) holding the mic also transcribes real speech into
   the top box while the soundwave plays; unsupported browsers still get
   the full press-and-hold animation and can still type. MyMemory's
   anonymous tier is rate-limited (a few thousand words/day per IP) and
   can be slow or briefly unavailable — a translation that fails to load
   just leaves the existing text in place rather than erroring visibly,
   since this is a nicety layered on a click-through prototype, not
   something the rest of the page depends on.
   ========================================================================== */
(function () {
  'use strict';

  var screen   = document.getElementById('screen');
  var stage    = document.querySelector('.stage');
  var voiceBtn = document.getElementById('voiceBtn');
  var status   = document.getElementById('status');

  /* voice-translation-cn.html reuses this file verbatim (see
     lang-cn.css) — this page is Chinese-track-only (the English track
     never needs the CN↔EN phrase tool), so only a 'cn' branch is
     needed here, unlike the 3-way split elsewhere. */
  var IS_CN = document.body.dataset.variant === 'cn';

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
      translate: 'en',
    },
    cn: {
      label: '<span class="t-en">Chinese</span><span class="t-cn"> 中文：</span>',
      placeholder: '说中文或在此输入',
      style: 'transfield--solid',
      ariaLabel: 'Chinese text 中文',
      recognition: 'zh-CN',
      translate: 'zh-CN',
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
    // Any translation still in flight was scheduled for the pre-swap
    // language pairing — let it land on the wrong box after the swap
    // and it'd overwrite whatever's there with a stale result.
    clearTimeout(timers.top);
    clearTimeout(timers.bottom);
    var oldTopText = topWell.value;
    var oldBottomText = bottomWell.value;
    topLang = otherLang(topLang);
    topWell.value = oldBottomText;
    bottomWell.value = oldTopText;
    render();
  });

  /* -------------------------------------------------------------- translate
     MyMemory's free translation endpoint (https://mymemory.translated.net) —
     no API key. Each source well gets its own debounce timer and request
     sequence number so a fast typist (or a stream of interim speech
     results) doesn't fire one request per keystroke, and a slow response
     that's since been superseded by a newer one can't clobber the target
     box with stale text. */
  var TRANSLATE_DEBOUNCE_MS = 600;
  var timers = { top: null, bottom: null };
  var seqs   = { top: 0, bottom: 0 };

  function translateText(text, fromCode, toCode) {
    if (!text.trim()) return Promise.resolve('');
    var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) +
              '&langpair=' + fromCode + '|' + toCode;
    return fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        return (data && data.responseData && data.responseData.translatedText) || '';
      });
  }

  function scheduleTranslate(key, sourceWell, sourceLang, targetWell, targetLang) {
    clearTimeout(timers[key]);
    timers[key] = setTimeout(function () {
      var seq = ++seqs[key];
      translateText(sourceWell.value, LANG[sourceLang].translate, LANG[targetLang].translate)
        .then(function (translated) {
          if (seq !== seqs[key]) return; // a newer request already superseded this one
          targetWell.value = translated;
        })
        .catch(function () { /* offline or the endpoint hiccuped — leave existing text as-is */ });
    }, TRANSLATE_DEBOUNCE_MS);
  }

  topWell.addEventListener('input', function () {
    scheduleTranslate('top', topWell, topLang, bottomWell, otherLang(topLang));
  });
  bottomWell.addEventListener('input', function () {
    scheduleTranslate('bottom', bottomWell, otherLang(topLang), topWell, topLang);
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
      scheduleTranslate('top', topWell, topLang, bottomWell, otherLang(topLang));
    };
    recognizer.onerror = function () { /* mic denied, no network, etc. — the overlay/animation still ran */ };
  }

  var isListening = false;

  function startListening() {
    if (isListening) return;
    isListening = true;
    screen.classList.add('is-listening');
    voiceBtn.setAttribute('aria-pressed', 'true');
    status.textContent = IS_CN ? '正在聆听' : 'Listening… 正在聆听';
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
