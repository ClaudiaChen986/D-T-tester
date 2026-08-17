/* ============================================================================
   归途 GuiTu — "Add phrase": real form, real save, real translation
   ----------------------------------------------------------------------------
   The typed field is Chinese (required) — English is never typed, it's a
   read-only preview auto-translated live as the Chinese field is typed
   into, via MyMemory's free, keyless translation API (same endpoint/
   debounce/sequence-number pattern as js/voice-translation.js: a request
   superseded by a newer one can't clobber the preview with stale text).

   Save validates the Chinese phrase, makes sure a translation actually
   landed in the preview (kicking one final translate-and-wait if the
   debounce timer hadn't fired yet, falling back to the Chinese text itself
   if the API is unreachable — a phrase always needs *something* in `en`,
   since phrase-library.js sizes rows off its length and treats an empty
   `en` as "not a real phrase" in its file://-fallback path below), writes
   a { en, cn } phrase to localStorage ("guitu.phrases", the key
   phrase-library.js reads) and navigates back to phrase-library.html,
   where it appears after the sixteen seed phrases.

   Same file:// localStorage fallback as add-contact.js: if the write
   throws (Firefox disables localStorage for file:// pages, and this whole
   prototype ships as file://), Save still has to visibly do its job, so
   the new phrase rides along as a ?new= URL parameter instead of silently
   going nowhere.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'guitu.phrases';

  var stage      = document.querySelector('.stage');
  var form       = document.getElementById('addPhraseForm');
  var cnField    = document.querySelector('.phrasefield--source');
  var cnInput    = document.getElementById('cnInput');
  var previewField = document.querySelector('.phrasefield--preview');
  var enPreview  = document.getElementById('enPreview');
  var saveBtn    = document.getElementById('saveBtn');
  var status     = document.getElementById('formStatus');

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

  /* -------------------------------------------------------------- translate
     Same MyMemory endpoint voice-translation.js uses. */
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

  var TRANSLATE_DEBOUNCE_MS = 600;
  var translateTimer = null;
  var translateSeq = 0;

  function scheduleTranslate() {
    clearTimeout(translateTimer);
    var text = cnInput.value.trim();
    if (!text) {
      previewField.classList.remove('is-loading');
      enPreview.value = '';
      return;
    }
    translateTimer = setTimeout(function () {
      var seq = ++translateSeq;
      previewField.classList.add('is-loading');
      translateText(text, 'zh-CN', 'en')
        .then(function (translated) {
          if (seq !== translateSeq) return; // a newer request already superseded this one
          enPreview.value = translated;
        })
        .catch(function () { /* offline or the endpoint hiccuped — leave existing preview as-is */ })
        .then(function () {
          if (seq === translateSeq) previewField.classList.remove('is-loading');
        });
    }, TRANSLATE_DEBOUNCE_MS);
  }

  cnInput.addEventListener('input', function () {
    if (cnInput.value.trim()) {
      cnField.classList.remove('is-invalid');
      status.classList.remove('is-error');
      status.textContent = '';
    }
    scheduleTranslate();
  });

  /* ------------------------------------------------------------------ save */
  function loadPhrases() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  function savePhrase(en, cn) {
    var phrase = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
                    en: en, cn: cn };

    var storedOk = false;
    try {
      var phrases = loadPhrases();
      phrases.push(phrase);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
      storedOk = true;
    } catch (err) {
      storedOk = false;
    }

    var target = 'phrase-library.html';
    if (!storedOk) target += '?new=' + encodeURIComponent(JSON.stringify(phrase));

    // Always navigate — Save must never look like it did nothing, whether
    // or not the write above actually succeeded.
    window.location.href = target;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var cn = cnInput.value.trim();
    if (!cn) {
      cnField.classList.add('is-invalid');
      cnInput.focus();
      status.classList.add('is-error');
      status.textContent = 'Please enter a Chinese phrase before saving.';
      return;
    }
    cnField.classList.remove('is-invalid');
    status.classList.remove('is-error');

    var en = enPreview.value.trim();
    if (en) { savePhrase(en, cn); return; }

    // The debounce timer hadn't landed a translation yet (a fast Save right
    // after typing) — ask for one last translation rather than saving a
    // phrase with no English at all, but don't let a slow/offline API leave
    // Save looking like it did nothing: fall back to the Chinese text itself.
    clearTimeout(translateTimer);
    saveBtn.disabled = true;
    status.classList.remove('is-error');
    status.textContent = 'Translating…';
    translateText(cn, 'zh-CN', 'en')
      .catch(function () { return ''; })
      .then(function (translated) {
        saveBtn.disabled = false;
        savePhrase(translated.trim() || cn, cn);
      });
  });
}());
