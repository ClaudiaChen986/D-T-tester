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

  /* calling-en.html reuses this file verbatim (see lang-en.css) — route
     the hang-up redirect through here so the English track lands back on
     home-en.html instead of the bilingual home.html. */
  function enPath(path) {
    return document.body.dataset.variant === 'en' ? path.replace(/\.html$/, '-en.html') : path;
  }

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

  /* ---------------------------------------------------- call panel: drag
     Same collapsed/expanded drag as home.html's slide-up card (see
     js/app.js: deferred pointer capture so a plain tap on Speaker/Mute/
     Location/Hung up — all descendants of the panel, which is the whole
     drag target — keeps working untouched; only real movement past the
     threshold takes over the gesture). Dragged down past a quarter of
     PANEL_OFFSET, it *stays* down (collapsed) instead of springing back,
     exposing the keypad underneath and making its keys real, clickable
     buttons — tabindex/aria-hidden on them tracks the panel's state so
     they're not reachable by keyboard while the panel still covers them.
     PANEL_OFFSET (320px) clears the keypad's lowest row (0) with the
     panel's own handle strip still poking up above the bottom edge to
     drag back up by. */
  var callpanel       = document.getElementById('callpanel');
  var callpanelHandle = document.getElementById('callpanelHandle');
  var keypad           = document.getElementById('keypad');
  var keypadButtons    = keypad.querySelectorAll('.callkey');
  var PANEL_OFFSET = 320;
  var DRAG_THRESHOLD = 4;
  var panelDrag = null;
  var justDraggedPanel = false;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function setPanelState(collapsed) {
    callpanel.dataset.state = collapsed ? 'collapsed' : 'expanded';
    keypad.setAttribute('aria-hidden', String(!collapsed));
    keypadButtons.forEach(function (btn) { btn.tabIndex = collapsed ? 0 : -1; });
    callpanelHandle.setAttribute('aria-expanded', String(collapsed));
    callpanelHandle.setAttribute('aria-label', collapsed ? 'Show call controls' : 'Show keypad');
  }
  function currentTranslateY() { return callpanel.dataset.state === 'collapsed' ? PANEL_OFFSET : 0; }

  callpanel.addEventListener('pointerdown', function (e) {
    if (e.button != null && e.button !== 0) return;
    panelDrag = {
      pointerId: e.pointerId,
      startClientY: e.clientY,
      startY: currentTranslateY(),
      scale: parseFloat(getComputedStyle(stage).getPropertyValue('--scale')) || 1,
      moved: false,
    };
  });

  callpanel.addEventListener('pointermove', function (e) {
    if (!panelDrag || e.pointerId !== panelDrag.pointerId) return;
    var deltaScreen = e.clientY - panelDrag.startClientY;
    if (!panelDrag.moved) {
      if (Math.abs(deltaScreen) <= DRAG_THRESHOLD) return;
      panelDrag.moved = true;
      callpanel.classList.add('is-dragging');
      try { callpanel.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }
    var y = clamp(panelDrag.startY + deltaScreen / panelDrag.scale, 0, PANEL_OFFSET);
    callpanel.style.transform = 'translateY(' + y + 'px)';
  });

  function endPanelDrag(e) {
    if (!panelDrag || e.pointerId !== panelDrag.pointerId) return;
    var deltaScreen = e.clientY - panelDrag.startClientY;
    var endY = clamp(panelDrag.startY + deltaScreen / panelDrag.scale, 0, PANEL_OFFSET);
    var moved = panelDrag.moved;
    var wasCollapsed = panelDrag.startY !== 0;
    var draggedFraction = Math.abs(endY - panelDrag.startY) / PANEL_OFFSET;

    if (moved) {
      callpanel.classList.remove('is-dragging');
      callpanel.style.transform = '';
      try { callpanel.releasePointerCapture(panelDrag.pointerId); } catch (err) { /* ignore */ }
    }
    panelDrag = null;

    if (moved) {
      justDraggedPanel = true;
      setTimeout(function () { justDraggedPanel = false; }, 0);
      setPanelState(draggedFraction > 0.25 ? !wasCollapsed : wasCollapsed);
    }
  }
  callpanel.addEventListener('pointerup', endPanelDrag);
  callpanel.addEventListener('pointercancel', function (e) {
    if (!panelDrag || e.pointerId !== panelDrag.pointerId) return;
    if (panelDrag.moved) {
      callpanel.classList.remove('is-dragging');
      callpanel.style.transform = '';
    }
    panelDrag = null;
  });

  callpanelHandle.addEventListener('click', function () {
    if (justDraggedPanel) { justDraggedPanel = false; return; }
    setPanelState(callpanel.dataset.state !== 'collapsed');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && callpanel.dataset.state === 'collapsed') setPanelState(false);
  });

  /* -------------------------------------------------------------- hang up */
  document.getElementById('hangupBtn').addEventListener('click', function () {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = enPath('home.html');
    }
  });
}());
