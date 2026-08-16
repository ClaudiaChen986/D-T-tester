/* ============================================================================
   归途 GuiTu — "Maps" (Navigation home, Figma node 7:1284)
   ----------------------------------------------------------------------------
   Fits the fixed 390 × 844 design to the viewport, drives the share-location
   toggle, and drags the slide-up card — the drag logic below is js/app.js's
   sheet section verbatim (same component Figma reuses for both), just
   without the dynamic contact-row rendering: this card's three rows (Go
   home / Set destination ×2) are static markup instead.
   ========================================================================== */
(function () {
  'use strict';

  var stage  = document.querySelector('.stage');
  var sheet  = document.getElementById('sheet');
  var handle = document.getElementById('sheetHandle');

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

  /* ------------------------------------------------------- share location
     A prototype toggle — no real location-sharing session behind it, same
     "the interaction is real, the backend isn't" posture as calling.js's
     Speaker/Mute/Location buttons (whose exact colors and icon this reuses,
     see navigation.css). The pulsing ring (navshare.is-active in CSS) is
     purely CSS-driven off this one class. */
  var shareBtn  = document.getElementById('shareLocationBtn');
  var shareIcon = document.getElementById('shareLocationIcon');
  shareBtn.addEventListener('click', function () {
    var active = shareBtn.classList.toggle('is-active');
    shareBtn.setAttribute('aria-pressed', String(active));
    shareIcon.src = active ? '../assets/icon-call-location-on.svg' : '../assets/icon-call-location-off.svg';
  });

  /* ------------------------------------------------------- slide-up card */
  function setSheet(expanded) {
    sheet.dataset.state = expanded ? 'expanded' : 'collapsed';
    handle.setAttribute('aria-expanded', String(expanded));
    handle.setAttribute('aria-label', expanded ? 'Collapse navigation' : 'Expand navigation');
  }

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
    var draggedFraction = Math.abs(endY - drag.startY) / sheetOffset;

    if (moved) {
      sheet.classList.remove('is-dragging');
      sheet.style.transform = '';
      try { sheet.releasePointerCapture(drag.pointerId); } catch (err) { /* ignore */ }
    }
    drag = null;

    if (moved) {
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
