/* ============================================================================
   归途 GuiTu — "Calling…" (Figma node 7:365 / 7:438, button states 7:470)
   ----------------------------------------------------------------------------
   One template for every contact. Whoever tapped "Call" writes the target
   to sessionStorage (see the callTarget() helper other pages import this
   file for — home.html's js/app.js and contacts.js) right before
   navigating here; this page reads it back and fills in the name/avatar.
   No saved target (e.g. this page opened directly) → the sample "Daughter
   (Lily)" already baked into the HTML stays put, same reasoning as the
   other screens' seed-data fallbacks.

   Speaker/Mute/Location are simple on/off toggles — this is a prototype,
   there's no real audio routing, mic, or location sharing behind them,
   same as the reorder screen's drag doesn't move real contacts. Hung up
   ends the call and returns to wherever it was placed from.
   ========================================================================== */
(function () {
  'use strict';

  var TARGET_KEY = 'guitu.callTarget';

  var stage       = document.querySelector('.stage');
  var callName    = document.getElementById('callName');
  var callAvatar  = document.getElementById('callAvatar');

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

  /* ------------------------------------------------------------- contact */
  function loadTarget() {
    try {
      var raw = JSON.parse(sessionStorage.getItem(TARGET_KEY));
      return raw && typeof raw === 'object' ? raw : null;
    } catch (e) { return null; }
  }

  var target = loadTarget();
  if (target) {
    if (target.type === 'emergency') {
      callName.innerHTML =
        '<span class="t-en">Emergency service</span><span class="t-cn">紧急联络</span>';
      callAvatar.src = '../assets/call-avatar-emergency.svg';
    } else {
      var enHtml = target.en ? '<span class="t-en">' + target.en + '</span>' : '';
      var cnHtml = target.cn ? '<span class="t-cn">' + target.cn + '</span>' : '';
      if (enHtml || cnHtml) callName.innerHTML = enHtml + cnHtml;
      callAvatar.src = target.photo || '../assets/avatar.svg';
    }
  }

  /* -------------------------------------------------------------- toggles */
  function wireToggle(buttonId, iconId, offSrc, onSrc) {
    var btn = document.getElementById(buttonId);
    var icon = document.getElementById(iconId);
    btn.addEventListener('click', function () {
      var active = btn.classList.toggle('is-active');
      btn.setAttribute('aria-pressed', String(active));
      icon.src = active ? onSrc : offSrc;
    });
  }
  wireToggle('speakerBtn', 'speakerIcon', '../assets/icon-call-speaker-off.svg', '../assets/icon-call-speaker-on.svg');
  wireToggle('muteBtn', 'muteIcon', '../assets/icon-call-mute-off.svg', '../assets/icon-call-mute-on.svg');
  wireToggle('locationBtn', 'locationIcon', '../assets/icon-call-location-off.svg', '../assets/icon-call-location-on.svg');

  /* -------------------------------------------------------------- hang up */
  document.getElementById('hangupBtn').addEventListener('click', function () {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'home.html';
    }
  });
}());
