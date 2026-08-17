/* ============================================================================
   归途 GuiTu — "Adding contact": real form, real photo picker, real save
   ----------------------------------------------------------------------------
   Choose photo → the OS photo/file picker (a plain <input type="file"
   accept="image/*">, triggered by the pencil button) → FileReader renders
   the chosen image into the avatar circle immediately.

   Save → validates the name, writes a contact object to localStorage
   ("guitu.contacts", the same key contacts.js reads) and navigates to
   contacts.html, where the new contact appears ahead of the "+ Add" card —
   in Family or Friends depending on which group's Add card was clicked
   (contacts.js links here with ?group=family or ?group=friends).

   Some browsers (Firefox, notably) disable localStorage entirely for
   file:// pages and throw on the first write — with no build step this
   whole prototype IS file://, so that's not a hypothetical. If the write
   throws, Save must still visibly do its job: it falls back to handing the
   new contact to contacts.html via a URL parameter (everything except the
   photo, which can be too large for a URL) instead of silently going
   nowhere.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'guitu.contacts';

  /* add-contact-en.html reuses this file verbatim (see lang-en.css) — route
     the post-Save redirect through here so the English track lands back on
     contacts-en.html instead of the bilingual contacts.html. */
  function enPath(path) {
    return document.body.dataset.variant === 'en' ? path.replace(/\.html$/, '-en.html') : path;
  }

  function targetGroup() {
    var g = new URLSearchParams(window.location.search).get('group');
    return g === 'family' ? 'family' : 'friends';
  }

  var stage           = document.querySelector('.stage');
  var form            = document.getElementById('addForm');
  var nameField        = document.querySelector('.namefield');
  var nameInput        = document.getElementById('nameInput');
  var relationshipInput = document.getElementById('relationshipInput');
  var phoneInput       = document.getElementById('phoneInput');
  var choosePhotoBtn   = document.getElementById('choosePhotoBtn');
  var photoInput       = document.getElementById('photoInput');
  var avatarPreview    = document.getElementById('avatarPreview');
  var status           = document.getElementById('formStatus');

  var photoDataUrl = null;

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

  /* ------------------------------------------------------- choose a photo
     A raw phone-camera photo read straight through FileReader can be
     several MB — once base64-encoded that alone can exceed localStorage's
     ~5MB per-origin quota, so the write silently fails (caught below) and
     the contact quietly vanishes on the next reload, photo and all. The
     avatar is only ever shown at up to 196px, so there's no reason to
     store it at full camera resolution: downscale it onto a canvas and
     re-encode as a modest-quality JPEG first, which keeps a typical photo
     to tens of KB instead of several MB. */
  var AVATAR_MAX_DIMENSION = 512;
  var AVATAR_JPEG_QUALITY = 0.85;

  function readAndResizeImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(reader.error); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = reject;
        img.onload = function () {
          var scale = Math.min(1, AVATAR_MAX_DIMENSION / Math.max(img.width, img.height));
          var w = Math.max(1, Math.round(img.width * scale));
          var h = Math.max(1, Math.round(img.height * scale));
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', AVATAR_JPEG_QUALITY));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  choosePhotoBtn.addEventListener('click', function () { photoInput.click(); });

  photoInput.addEventListener('change', function () {
    var file = photoInput.files && photoInput.files[0];
    if (!file) return;
    readAndResizeImage(file).then(function (dataUrl) {
      photoDataUrl = dataUrl;
      avatarPreview.src = photoDataUrl;
      status.classList.remove('is-error');
      status.textContent = 'Photo selected.';
    }, function () {
      status.classList.add('is-error');
      status.textContent = 'Could not read that photo — please try another.';
    });
  });

  /* ------------------------------------------------------------------ save */
  function loadContacts() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = nameInput.value.trim();
    if (!name) {
      nameField.classList.add('is-invalid');
      nameInput.focus();
      status.classList.add('is-error');
      status.textContent = 'Please enter a name before saving.';
      return;
    }
    nameField.classList.remove('is-invalid');
    status.classList.remove('is-error');

    var digits = phoneInput.value.trim();
    var contact = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: name,
      cn: '',
      relationship: relationshipInput.value.trim(),
      phone: digits ? '04' + digits.replace(/[^\d ]/g, '') : '',
      photo: photoDataUrl,
      group: targetGroup(),
    };

    var storedOk = false;
    try {
      var contacts = loadContacts();
      contacts.push(contact);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
      storedOk = true;
    } catch (err) {
      storedOk = false;
    }

    var target = enPath('contacts.html');
    if (!storedOk) {
      var carry = {
        id: contact.id, name: contact.name, cn: contact.cn,
        relationship: contact.relationship, phone: contact.phone, group: contact.group,
      };
      target += '?new=' + encodeURIComponent(JSON.stringify(carry));
    }

    // Always navigate — Save must never look like it did nothing, whether
    // or not the write above actually succeeded.
    window.location.href = target;
  });

  nameInput.addEventListener('input', function () {
    if (nameInput.value.trim()) {
      nameField.classList.remove('is-invalid');
      status.classList.remove('is-error');
      status.textContent = '';
    }
  });
}());
