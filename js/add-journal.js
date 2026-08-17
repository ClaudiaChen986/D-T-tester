/* ============================================================================
   归途 GuiTu — "Adding journal": real form, real save
   ----------------------------------------------------------------------------
   Save requires only the body text (a journal entry with nothing written in
   it isn't an entry) — the title is optional, same "one required field,
   the rest optional" posture as add-contact.js's name field. Saving writes
   the new entry to localStorage ("guitu.journal") *ahead* of whatever's
   already there (unshift, not push) so it reads newest-first on
   journal.html, then navigates back.

   Some browsers (Firefox, notably) disable localStorage entirely for
   file:// pages and throw on the first write — with no build step this
   whole prototype IS file://, so that's not hypothetical. If the write
   throws, Save must still visibly do its job: it falls back to handing the
   new entry to journal.html via a URL parameter instead of silently going
   nowhere, the same fallback add-contact.js uses for contacts.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'guitu.journal';

  /* add-journal-en.html/add-journal-cn.html reuse this file verbatim (see
     lang-en.css/lang-cn.css) — route the post-Save redirect through here
     so a single-language track lands back on its own journal page
     instead of the bilingual journal.html. */
  function langPath(path) {
    var v = document.body.dataset.variant;
    return v ? path.replace(/\.html$/, '-' + v + '.html') : path;
  }
  var IS_CN = document.body.dataset.variant === 'cn';

  var stage      = document.querySelector('.stage');
  var form       = document.getElementById('journalForm');
  var titleInput = document.getElementById('titleInput');
  var bodyInput  = document.getElementById('bodyInput');
  var status     = document.getElementById('formStatus');

  /* ---------------------------------------------------------------- scaling
     Same fit-to-viewport approach as the other fixed-size screens. */
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
  function loadEntries() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var body = bodyInput.value.trim();
    if (!body) {
      bodyInput.classList.add('is-invalid');
      bodyInput.focus();
      status.classList.add('is-error');
      status.textContent = IS_CN ? '保存前请输入内容。' : 'Please write something before saving.';
      return;
    }
    bodyInput.classList.remove('is-invalid');
    status.classList.remove('is-error');

    var entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      title: titleInput.value.trim(),
      body: body,
    };

    var storedOk = false;
    try {
      var entries = loadEntries();
      entries.unshift(entry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      storedOk = true;
    } catch (err) {
      storedOk = false;
    }

    var target = langPath('journal.html');
    if (!storedOk) {
      target += '?new=' + encodeURIComponent(JSON.stringify(entry));
    }

    // Always navigate — Save must never look like it did nothing, whether
    // or not the write above actually succeeded.
    window.location.href = target;
  });

  bodyInput.addEventListener('input', function () {
    if (bodyInput.value.trim()) {
      bodyInput.classList.remove('is-invalid');
      status.classList.remove('is-error');
      status.textContent = '';
    }
  });
}());
