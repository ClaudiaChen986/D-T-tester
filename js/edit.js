/* ============================================================================
   归途 GuiTu — "Your profile": drag to rearrange emergency contacts
   ----------------------------------------------------------------------------
   Step 2 (final) of the "edit profile" flow — step 1 is edit-profile.html
   (node 2:552), which edits your personal-info fields and hands off here
   for contact order; this page's own Save returns to profile.html (node
   2:544), where both are now reflected.

   Layout constants below are literal Figma pixel values (node 2:688):
     row 1 (Son) top = 300px, row 2 (Daughter) top = 394px — a 94px step.
     The dashed "top 3" frame (22,288,346×287) hugs those three rows with a
     12px pad top & bottom. Rows 4–5 keep the same 94px step in Figma too
     (within ~2–6px, an export rounding artifact) — so one formula,
     `top = LIST_TOP + index * STEP`, reproduces the whole list and stays
     correct as items are dragged past each other.
   ========================================================================== */
(function () {
  'use strict';

  var LIST_TOP = 300;
  var STEP     = 94;
  var ROW_H    = 76;
  var PAD      = 12;

  var STORAGE_KEY = 'guitu.emergencyContactOrder';

  var CONTACTS = {
    son:       { en: 'Son (David)',       cn: '儿子（大卫）',   icon: 'avatar' },
    daughter:  { en: 'Daughter (Lily)',   cn: '女儿（莉莉）',   icon: 'avatar' },
    emergency: { en: 'Emergency',         cn: '紧急联络',       icon: 'emergency' },
    alex:      { en: 'Grandson (Alex)',   cn: '孙子（亚历克斯）', icon: 'avatar' },
    harry:     { en: 'Grandson (Harry)',  cn: '孙子（哈利）',    icon: 'avatar' },
  };
  var DEFAULT_ORDER = ['son', 'daughter', 'emergency', 'alex', 'harry'];

  var ICON_SRC = {
    avatar:    '../assets/avatar-sm.svg',
    emergency: '../assets/icon-emergency-badge.svg',
  };

  var stage      = document.querySelector('.stage');
  var list       = document.getElementById('crowlist');
  var frame      = document.getElementById('top3frame');
  var saveBtn    = document.getElementById('saveBtn');
  var statusLine = document.getElementById('reorderStatus');

  var nodes = {};   // id -> <li>
  var order = loadOrder();

  /* ---------------------------------------------------------------- scaling
     Same fit-to-viewport approach as the home screen — see app.js there. */
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

  /* --------------------------------------------------------------- storage */
  function loadOrder() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(raw) && raw.length === DEFAULT_ORDER.length &&
          raw.every(function (id) { return CONTACTS[id]; })) {
        return raw;
      }
    } catch (e) { /* ignore malformed storage */ }
    return DEFAULT_ORDER.slice();
  }

  /* ---------------------------------------------------------------- build */
  function buildRow(id) {
    var c = CONTACTS[id];
    var li = document.createElement('li');
    li.className = 'crow';
    li.dataset.id = id;

    li.innerHTML =
      '<img class="crow__bg" alt="">' +
      '<img class="crow__avatar" src="' + ICON_SRC[c.icon] + '" alt="">' +
      '<span class="crow__text">' +
        '<span class="t-en">' + c.en + '</span>' +
        '<span class="t-cn">' + c.cn + '</span>' +
      '</span>' +
      '<button class="crow__handle" type="button" aria-label="Reorder ' + c.en +
        '. Drag, or press Arrow Up or Arrow Down." aria-roledescription="Draggable item">' +
        '<img src="../assets/icon-handle.svg" alt="">' +
      '</button>';

    return li;
  }

  order.forEach(function (id) {
    var li = buildRow(id);
    nodes[id] = li;
    list.appendChild(li);
    wireHandle(li.querySelector('.crow__handle'), id);
  });

  /* ------------------------------------------------------------- layout */
  function topFor(index) { return LIST_TOP + index * STEP; }

  function render(skipId) {
    order.forEach(function (id, i) {
      var li = nodes[id];
      list.appendChild(li);                     // reorders DOM to match `order`
      if (id !== skipId) li.style.top = topFor(i) + 'px';

      var isTop3 = i < 3;
      li.classList.toggle('crow--top3', isTop3);
      li.querySelector('.crow__bg').src = isTop3 ? '../assets/row-top3.svg' : '../assets/row-plain.svg';
    });

    var frameTop = LIST_TOP - PAD;
    var frameBottom = topFor(2) + ROW_H + PAD;
    frame.style.top = frameTop + 'px';
    frame.style.height = (frameBottom - frameTop) + 'px';
  }

  render();

  /* ---------------------------------------------------------- pointer drag */
  function wireHandle(handle, id) {
    var li = nodes[id];
    var startY, startTop, pointerId;

    handle.addEventListener('pointerdown', function (e) {
      pointerId = e.pointerId;
      handle.setPointerCapture(pointerId);
      startY = e.clientY;
      startTop = parseFloat(li.style.top || topFor(order.indexOf(id)));
      li.classList.add('is-dragging');
      e.preventDefault();
    });

    handle.addEventListener('pointermove', function (e) {
      if (e.pointerId !== pointerId || !li.classList.contains('is-dragging')) return;

      // scale compensates for the .stage zoom — pointer deltas arrive in
      // screen pixels, but `top` lives in the unscaled 390×844 design space.
      var scale = parseFloat(getComputedStyle(stage).getPropertyValue('--scale')) || 1;
      var newTop = startTop + (e.clientY - startY) / scale;
      li.style.top = newTop + 'px';

      var centerY = newTop + ROW_H / 2;
      var targetIndex = Math.round((centerY - LIST_TOP) / STEP);
      targetIndex = Math.max(0, Math.min(order.length - 1, targetIndex));

      var currentIndex = order.indexOf(id);
      if (targetIndex !== currentIndex) {
        order.splice(currentIndex, 1);
        order.splice(targetIndex, 0, id);
        render(id);
      }
    });

    function endDrag(e) {
      if (e.pointerId !== pointerId) return;
      li.classList.remove('is-dragging');
      li.style.top = topFor(order.indexOf(id)) + 'px';
      handle.releasePointerCapture(pointerId);
      announce(CONTACTS[id].en + ' is now position ' + (order.indexOf(id) + 1) + ' of ' + order.length + '.');
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);

    /* -------------------------------------------------------- keyboard */
    handle.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault();
      var currentIndex = order.indexOf(id);
      var targetIndex = currentIndex + (e.key === 'ArrowUp' ? -1 : 1);
      if (targetIndex < 0 || targetIndex >= order.length) return;
      order.splice(currentIndex, 1);
      order.splice(targetIndex, 0, id);
      render();
      handle.focus();
      announce(CONTACTS[id].en + ' moved to position ' + (targetIndex + 1) + ' of ' + order.length + '.');
    });
  }

  function announce(text) { statusLine.textContent = text; }

  /* ------------------------------------------------------------------ save
     Step 2 (final) of the "edit profile" flow that starts at
     edit-profile.html: that page's own Save already persisted the
     personal-info fields and handed off here for the contact order. This
     Save persists the order and returns to profile.html, where both are
     now reflected. */
  saveBtn.addEventListener('click', function () {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    announce('Contact order saved.');
    window.location.href = 'profile.html';
  });
}());
