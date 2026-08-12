/* ============================================================================
   归途 GuiTu — home screen behaviour
     · fits the fixed 390 × 844 design to whatever viewport it is opened in
     · press-and-hold the voice assistant → listening state + animated soundwave
     · slide-up card open / close
   ========================================================================== */
(function () {
  'use strict';

  var DESIGN_W = 390;
  var DESIGN_H = 844;

  var screen   = document.getElementById('screen');
  var stage    = document.querySelector('.stage');
  var voiceBtn = document.getElementById('voiceBtn');
  var sheet    = document.getElementById('sheet');
  var handle   = document.getElementById('sheetHandle');
  var status   = document.getElementById('status');

  /* ---------------------------------------------------------------- scaling */
  function fit() {
    var pad = window.innerWidth < 480 ? 0 : 32;
    var scale = Math.min(
      (window.innerWidth  - pad) / DESIGN_W,
      (window.innerHeight - pad) / DESIGN_H
    );
    stage.style.setProperty('--scale', Math.max(0.3, Math.min(scale, 1.6)));
  }
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);

  /* ------------------------------------------------- press-to-speak (voice) */
  var isListening = false;

  function startListening() {
    if (isListening) return;
    isListening = true;
    screen.classList.add('is-listening');
    voiceBtn.setAttribute('aria-pressed', 'true');
    status.textContent = 'Listening… 正在聆听';
  }

  function stopListening() {
    if (!isListening) return;
    isListening = false;
    screen.classList.remove('is-listening');
    voiceBtn.setAttribute('aria-pressed', 'false');
    status.textContent = '';
  }

  voiceBtn.addEventListener('pointerdown', function (e) {
    // Capture the pointer so releasing outside the button still ends the press.
    if (voiceBtn.setPointerCapture) {
      try { voiceBtn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }
    startListening();
  });
  voiceBtn.addEventListener('pointerup', stopListening);
  voiceBtn.addEventListener('pointercancel', stopListening);
  voiceBtn.addEventListener('lostpointercapture', stopListening);

  // Keyboard equivalent: hold Space or Enter.
  voiceBtn.addEventListener('keydown', function (e) {
    if (e.key !== ' ' && e.key !== 'Enter' && e.key !== 'Spacebar') return;
    e.preventDefault();                  // Space would otherwise scroll
    if (e.repeat) return;
    startListening();
  });
  voiceBtn.addEventListener('keyup', function (e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') stopListening();
  });
  voiceBtn.addEventListener('blur', stopListening);

  // Suppress the long-press callout / context menu on touch devices.
  voiceBtn.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // A press interrupted by tab-away or a system gesture should not stick.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopListening();
  });

  /* ------------------------------------------------- slide-up card: rows
     The three contact rows shown here are the top 3 of whatever order was
     last saved on the reorder screen (edit-contacts.html,
     localStorage["guitu.emergencyContactOrder"]) — same key, same five
     ids, same default order that page falls back to when nothing's been
     saved yet, so a fresh install shows exactly what used to be
     hardcoded here (Son, Daughter, Emergency, in that order).

     Alex and Harry don't have a phone number on file anywhere in this
     prototype (contacts.html's own seed data leaves theirs blank too),
     so if a reorder promotes one into the top 3, its call button renders
     disabled instead of linking a fake tel:. They don't have a real photo
     either, so they fall back to the same generic avatar.svg placeholder
     Son and Daughter use — no `avatar` override below, same as those two.

     Row 1 sits fractionally lower in Figma than rows 2–3 (26/26/36 vs
     24/24/34 for avatar/text/call-button --y) — an export quirk of the
     row artwork's first slot, not something tied to which contact is in
     it, so it's keyed to slot index here, not to a contact id. */
  var CONTACTS = {
    son:       { en: 'Son (David)',       cn: '儿子（大卫）',     phone: '0412345678', type: 'person' },
    daughter:  { en: 'Daughter (Lily)',   cn: '女儿（莉莉）',     phone: '0423456789', type: 'person' },
    emergency: { en: 'Emergency',         cn: '紧急联络',         phone: '000',        type: 'emergency' },
    alex:      { en: 'Grandson (Alex)',   cn: '孙子（亚历克斯）', phone: '',           type: 'person' },
    harry:     { en: 'Grandson (Harry)',  cn: '孙子（哈利）',     phone: '',           type: 'person' },
  };
  var DEFAULT_ORDER = ['son', 'daughter', 'emergency', 'alex', 'harry'];
  var ORDER_STORAGE_KEY = 'guitu.emergencyContactOrder';

  var SLOTS = [
    { y: 194, avatarY: 26, textY: 26, callY: 36 },
    { y: 343, avatarY: 24, textY: 24, callY: 34 },
    { y: 492, avatarY: 24, textY: 24, callY: 34 },
  ];

  function loadContactOrder() {
    try {
      var raw = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY));
      if (Array.isArray(raw) && raw.length === DEFAULT_ORDER.length &&
          raw.every(function (id) { return CONTACTS[id]; })) {
        return raw;
      }
    } catch (e) { /* ignore malformed storage */ }
    return DEFAULT_ORDER.slice();
  }

  function formatAuPhone(digits) {
    // 0412345678 -> "0412 345 678"
    return digits.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
  }

  function personRowHtml(id, slot) {
    var c = CONTACTS[id];
    var numHtml = c.phone ? '<span class="t-num">' + formatAuPhone(c.phone) + '</span>' : '';
    var callHtml = c.phone
      ? '<a class="row__call" href="tel:' + c.phone + '" style="--y:' + slot.callY + 'px" aria-label="Call ' + c.en + '">' +
          '<img src="../assets/call-btn.svg" alt="">' +
        '</a>'
      : '<span class="row__call" aria-hidden="true" style="--y:' + slot.callY + 'px">' +
          '<img src="../assets/call-btn.svg" alt="">' +
        '</span>';
    return (
      '<div class="row" style="--y:' + slot.y + 'px">' +
        '<img class="row__bg" src="../assets/contact-row.svg" alt="">' +
        '<img class="row__avatar" src="' + (c.avatar || '../assets/avatar.svg') + '" alt="" style="--y:' + slot.avatarY + 'px">' +
        '<span class="row__text" style="--y:' + slot.textY + 'px">' +
          '<span class="t-en">' + c.en + '</span>' +
          '<span class="t-cn">' + c.cn + '</span>' +
          numHtml +
        '</span>' +
        callHtml +
      '</div>'
    );
  }

  function emergencyRowHtml(slot) {
    var c = CONTACTS.emergency;
    return (
      '<div class="row row--emergency" style="--y:' + slot.y + 'px">' +
        '<img class="row__bg" src="../assets/contact-row.svg" alt="">' +
        '<img class="row__avatar" src="../assets/emergency-ellipse.svg" alt="" style="--y:' + slot.avatarY + 'px">' +
        '<img class="row__warn" src="../assets/emergency-triangle.svg" alt="">' +
        '<span class="row__warn-mark" aria-hidden="true">！</span>' +
        '<span class="row__text" style="--y:' + slot.textY + 'px">' +
          '<span class="t-en">' + c.en + '</span>' +
          '<span class="t-cn">' + c.cn + '</span>' +
          '<span class="t-num">' + c.phone + '</span>' +
        '</span>' +
        '<a class="row__call row__call--sos" href="tel:' + c.phone + '" style="--y:' + slot.callY + 'px" aria-label="Call emergency ' + c.phone + '">' +
          '<img src="../assets/call-btn-plain.svg" alt="">' +
          '<img class="row__call-glyph" src="../assets/icon-phone-white.svg" alt="">' +
        '</a>' +
      '</div>'
    );
  }

  var sheetRows = document.getElementById('sheetRows');
  sheetRows.innerHTML = loadContactOrder().slice(0, 3).map(function (id, i) {
    var slot = SLOTS[i];
    return CONTACTS[id].type === 'emergency' ? emergencyRowHtml(slot) : personRowHtml(id, slot);
  }).join('');

  /* ------------------------------------------------------- slide-up card */
  function setSheet(expanded) {
    sheet.dataset.state = expanded ? 'expanded' : 'collapsed';
    handle.setAttribute('aria-expanded', String(expanded));
    handle.setAttribute('aria-label', expanded ? 'Collapse contacts' : 'Expand contacts');
  }

  /* Drag anywhere on the card frame to open/close it; the arrow stays the
     only *tap*-to-toggle target (see the click listener at the bottom).
     The drag listeners live on `sheet`, not `handle`, so grabbing any part
     of the card — not just the small 70×49 arrow hit area — starts a drag;
     `handle`'s own bubbled pointerdown reaches the same listeners since
     it's a descendant.

     Pointer capture is deliberately NOT taken on pointerdown. It has to
     wait until movement actually crosses the drag threshold below —
     capturing eagerly was tried first and broke every button and tel:
     link inside the sheet (nav pills, call buttons): Chrome silently
     drops the `click` that would normally follow a plain tap's pointerup
     once an *ancestor* holds capture, even though only pointermove/
     pointerup are documented as being re-targeted. Deferring capture to
     "this is a real drag now" means a plain tap never triggers it, so
     every descendant's native click keeps working exactly as if this
     listener weren't here; only an actual drag ever takes over the
     gesture.

     Same --scale-compensation pattern as the reorder screen's drag handle
     (see edit.js) — pointer deltas arrive in real screen pixels, but the
     sheet's travel (--sheet-offset) is expressed in the unscaled 390×844
     design space. */
  var sheetOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sheet-offset')) || 540;
  var DRAG_THRESHOLD = 4;
  var drag = null;
  var justDragged = false;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function currentTranslateY() { return sheet.dataset.state === 'expanded' ? -sheetOffset : 0; }

  sheet.addEventListener('pointerdown', function (e) {
    if (e.button != null && e.button !== 0) return;
    drag = {
      pointerId: e.pointerId,
      startClientY: e.clientY,
      startY: currentTranslateY(),
      scale: parseFloat(getComputedStyle(stage).getPropertyValue('--scale')) || 1,
      moved: false,
    };
  });

  sheet.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    var deltaScreen = e.clientY - drag.startClientY;
    if (!drag.moved) {
      if (Math.abs(deltaScreen) <= DRAG_THRESHOLD) return;
      drag.moved = true;
      sheet.classList.add('is-dragging');
      try { sheet.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }
    var y = clamp(drag.startY + deltaScreen / drag.scale, -sheetOffset, 0);
    sheet.style.transform = 'translateY(' + y + 'px)';
  });

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    var deltaScreen = e.clientY - drag.startClientY;
    var endY = clamp(drag.startY + deltaScreen / drag.scale, -sheetOffset, 0);
    var moved = drag.moved;
    var wasExpanded = drag.startY !== 0;
    // Threshold is a fraction of the travel *from wherever the drag
    // started*, not of the absolute position — so closing takes the same
    // amount of drag as opening, instead of "easy to open, hard to close"
    // (or vice versa) depending on which edge an absolute cutoff favors.
    var draggedFraction = Math.abs(endY - drag.startY) / sheetOffset;

    if (moved) {
      sheet.classList.remove('is-dragging');
      sheet.style.transform = '';
      try { sheet.releasePointerCapture(drag.pointerId); } catch (err) { /* ignore */ }
    }
    drag = null;

    if (moved) {
      // A drag that ends with the pointer back over the arrow can still
      // produce a trailing `click` there (capture was live by this point,
      // same class of quirk noted above), which would otherwise re-toggle
      // right after this already decided the outcome. But that trailing
      // click isn't guaranteed to fire at all — usually it doesn't — so
      // this flag can't just wait indefinitely for it to show up and
      // consume itself; it has to expire on its own almost immediately,
      // or it sits there and silently eats the *next*, completely
      // unrelated tap on the arrow instead.
      justDragged = true;
      setTimeout(function () { justDragged = false; }, 0);
      setSheet(draggedFraction > 0.25 ? !wasExpanded : wasExpanded);
    }
  }
  sheet.addEventListener('pointerup', endDrag);
  sheet.addEventListener('pointercancel', function (e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (drag.moved) {
      sheet.classList.remove('is-dragging');
      sheet.style.transform = '';
    }
    drag = null;
  });

  handle.addEventListener('click', function () {
    // A drag that actually moved the sheet already set its end state
    // above; the click that follows the pointerup shouldn't then toggle
    // it back. A plain tap never sets this — capture (and therefore any
    // risk of a suppressed/duplicated click) never engages for it — so it
    // reaches this listener completely normally.
    if (justDragged) { justDragged = false; return; }
    setSheet(sheet.dataset.state !== 'expanded');
  });

  document.querySelectorAll('[data-action="open-contacts"]').forEach(function (el) {
    el.addEventListener('click', function () { setSheet(true); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet.dataset.state === 'expanded') setSheet(false);
  });
}());
