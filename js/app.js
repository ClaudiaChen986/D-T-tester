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
