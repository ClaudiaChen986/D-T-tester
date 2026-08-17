/* ============================================================================
   归途 GuiTu — "Your profile (edit)" — personal info form (Figma node 2:552)
   ----------------------------------------------------------------------------
   Step 1 of "edit profile": prefills from whatever's already saved
   (guitu.profile in localStorage) so editing starts from your current
   values rather than blank fields every time — Figma's own mockup shows
   the empty/placeholder state, which is just the first-ever-visit case
   here. Save writes the fields back to localStorage and hands off to
   edit-contacts.html (node 2:688) for step 2, reordering emergency
   contacts; that page's own Save then returns to profile.html, where
   everything entered here is what gets displayed.

   Choose photo → the OS photo/file picker → FileReader renders the chosen
   image into the avatar circle immediately, same as add-contact.html's
   picker (including its downscale-before-storing step: a raw phone photo
   can be several MB, comfortably over localStorage's ~5MB quota once
   base64-encoded, which is exactly what made saved photos vanish
   silently elsewhere in this app before that fix — see add-contact.js).
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'guitu.profile';
  var FIELDS = ['email', 'address', 'phone', 'birthday'];

  /* edit-profile-en.html reuses this file verbatim (see lang-en.css) —
     route the step-2 handoff through here so the English track lands on
     edit-contacts-en.html instead of the bilingual edit-contacts.html. */
  function langPath(path) {
    var v = document.body.dataset.variant;
    return v ? path.replace(/\.html$/, '-' + v + '.html') : path;
  }

  var stage           = document.querySelector('.stage');
  var form             = document.getElementById('editProfileForm');
  var choosePhotoBtn   = document.getElementById('choosePhotoBtn');
  var photoInput       = document.getElementById('photoInput');
  var avatarPreview    = document.getElementById('avatarPreview');

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

  /* --------------------------------------------------------------- prefill */
  function loadProfile() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return raw && typeof raw === 'object' ? raw : {};
    } catch (e) { return {}; }
  }

  var saved = loadProfile();
  var photoDataUrl = saved.photo || null;
  if (photoDataUrl) avatarPreview.src = photoDataUrl;

  FIELDS.forEach(function (field) {
    var input = document.getElementById(field + 'Input');
    if (input && saved[field]) input.value = saved[field];
  });

  /* ------------------------------------------------------- choose a photo
     Avatar is only ever shown at up to 196px, so there's no reason to
     store it at full camera resolution — downscale onto a canvas and
     re-encode as a modest-quality JPEG first. */
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
    });
  });

  /* ------------------------------------------------------------------ save */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var profile = { photo: photoDataUrl };
    FIELDS.forEach(function (field) {
      var input = document.getElementById(field + 'Input');
      profile[field] = input.value.trim();
    });

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch (err) { /* best effort only */ }

    // Step 2 of the same "edit profile" flow — reorder emergency contacts.
    window.location.href = langPath('edit-contacts.html');
  });
}());
