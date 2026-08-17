/* ============================================================================
   归途 GuiTu — "Add phrase": real form, real save
   ----------------------------------------------------------------------------
   Save validates the English phrase (Chinese translation is optional, same
   as add-contact.js only requiring a name), writes a { en, cn } phrase to
   localStorage ("guitu.phrases", the key phrase-library.js reads) and
   navigates back to phrase-library.html, where it appears after the
   sixteen seed phrases.

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
  var enField    = document.querySelector('.phrasefield--en');
  var enInput    = document.getElementById('enInput');
  var cnInput    = document.getElementById('cnInput');
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

  /* ------------------------------------------------------------------ save */
  function loadPhrases() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var en = enInput.value.trim();
    if (!en) {
      enField.classList.add('is-invalid');
      enInput.focus();
      status.classList.add('is-error');
      status.textContent = 'Please enter an English phrase before saving.';
      return;
    }
    enField.classList.remove('is-invalid');
    status.classList.remove('is-error');

    var phrase = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
                    en: en, cn: cnInput.value.trim() };

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
  });

  enInput.addEventListener('input', function () {
    if (enInput.value.trim()) {
      enField.classList.remove('is-invalid');
      status.classList.remove('is-error');
      status.textContent = '';
    }
  });
}());
