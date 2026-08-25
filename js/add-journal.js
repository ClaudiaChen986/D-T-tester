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

  var stage      = document.querySelector('.stage');
  var form       = document.getElementById('journalForm');
  var titleInput = document.getElementById('titleInput');
  var bodyInput  = document.getElementById('bodyInput');
  var status     = document.getElementById('formStatus');

  /* Editing an existing entry reuses this same form rather than a
     separate screen — journal.js's own "Edit" toggle links here with
     ?edit=<id>, so Save below needs to update that record in place
     instead of unshifting a new one. Only ever a saved (id-bearing)
     entry, never one of the three hardcoded seed samples. loadEntries
     is declared further down but hoisted, so it's already callable. */
  var editId = new URLSearchParams(window.location.search).get('edit');
  var editingEntry = editId
    ? loadEntries().filter(function (en) { return en.id === editId; })[0] || null
    : null;
  if (editingEntry) {
    titleInput.value = editingEntry.title || '';
    bodyInput.value = editingEntry.body || '';
  }

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
      status.textContent = 'Please write something before saving.';
      return;
    }
    bodyInput.classList.remove('is-invalid');
    status.classList.remove('is-error');

    var entry = {
      id: editingEntry ? editingEntry.id : Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      title: titleInput.value.trim(),
      body: body,
    };

    var storedOk = false;
    try {
      var entries = loadEntries();
      var existingIndex = entries.findIndex(function (en) { return en.id === entry.id; });
      if (existingIndex === -1) entries.unshift(entry); else entries[existingIndex] = entry;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      storedOk = true;
    } catch (err) {
      storedOk = false;
    }

    var target = 'journal.html';
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
