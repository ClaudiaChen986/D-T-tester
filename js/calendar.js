/* ============================================================================
   归途 GuiTu — My Calendar behaviour (Figma node 56:218)
     · fits the fixed 390×844 design to whatever viewport it's opened in,
       same as home.html — this is a stage, not a scrolling page
     · the slide-up card (id="sheet") drags open/closed with the exact
       same pointer mechanic as home.html's own sheet (js/app.js) — drag
       threshold before capture engages, --scale-compensated deltas, a
       fractional-drag-distance decides the resting state on release
     · renders the 3-day / 0:00-24:00 overview timeline from localStorage
       (`guitu.calendarEvents`, written by add-event.html), using Figma's
       own 907px axis span as a uniform px/hour scale — this lives in its
       own independently-scrollable region behind the card, reachable
       regardless of the card's own collapsed/expanded state
     · renders the card's body as a *second*, more detailed timeline for
       just today (Figma's "Slide up card" component, 56:546/56:729) —
       same pill/axis language, a taller scale, event text and a tick box
       beside each pill instead of just an icon — inside the card's own
       scrollable region, so a busy day scrolls independently too
     · both timelines colour each pill by how much of it has already
       happened, measured against the real clock; only today's events
       ever show a partial/full fill, since "now" doesn't apply to
       tomorrow/2-days
     · overlapping events (same day, same or crossing time ranges) used
       to render exactly on top of each other — same top/height, so only
       the last-drawn one was ever visible, which looked like events
       were silently going missing. assignColumns() below is the classic
       greedy interval-colouring calendar layout: events that don't
       overlap share column 0; anything that overlaps an already-placed
       event gets pushed to the next column over, offset a little to the
       right (both timelines), so every saved event actually shows up.
   ========================================================================== */
(function () {
  'use strict';

  var DESIGN_W = 390;
  var DESIGN_H = 844;

  var stage  = document.querySelector('.stage');
  var sheet  = document.getElementById('sheet');
  var handle = document.getElementById('sheetHandle');

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

  /* ------------------------------------------------------------- slide-up
     Drag anywhere on the card to open/close it; the handle stays the only
     *tap*-to-toggle target. Pointer capture is deliberately deferred until
     real movement crosses the threshold below — capturing eagerly breaks
     every button/link inside the card (nav pills, tick boxes, plan
     tomorrow): a plain tap's trailing click gets silently dropped once an
     ancestor holds capture. See js/app.js for the fuller version of this
     same comment — this is the same mechanic, just re-targeted at
     .calsheet instead of .sheet. */
  var sheetOffset = 556;
  var DRAG_THRESHOLD = 4;
  var drag = null;
  var justDragged = false;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function currentTranslateY() { return sheet.dataset.state === 'expanded' ? -sheetOffset : 0; }

  function setSheet(expanded) {
    sheet.dataset.state = expanded ? 'expanded' : 'collapsed';
    handle.setAttribute('aria-expanded', String(expanded));
    handle.setAttribute('aria-label', expanded ? 'Collapse today’s events' : 'Expand today’s events');
  }

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

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet.dataset.state === 'expanded') setSheet(false);
  });

  /* -------------------------------------------------------------- events */
  var STORAGE_KEY = 'guitu.calendarEvents';
  var HOUR_PX = 907 / 24;         // Figma's own 0:00-24:00 axis span
  var DAY_MIN = 24 * 60;

  var body      = document.getElementById('timelineBody');
  var axis      = document.getElementById('timelineAxis');
  var lanes     = [document.getElementById('lane0'), document.getElementById('lane1'), document.getElementById('lane2')];
  var todayList = document.getElementById('todayList');

  var ICONS = {
    directions_walk: 'directions_walk', restaurant: 'restaurant', groups: 'groups',
    home: 'home', bedtime: 'bedtime', medication: 'medication',
    shopping_cart: 'shopping_cart', fitness_center: 'fitness_center', work: 'work',
    favorite: 'favorite', book: 'book', celebration: 'celebration',
  };

  function loadEvents() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  /* Greedy interval-colouring: sorted by start time, each event claims
     the first column whose last-placed event has already ended by the
     time this one starts; if none is free, it opens a new column.
     Returns [{ event, column }, …] in start-time order — column 0 never
     needs an offset, column 1+ do. */
  function assignColumns(evs) {
    var sorted = evs.slice().sort(function (a, b) { return a.start - b.start; });
    var columnEnds = [];
    return sorted.map(function (ev) {
      var end = ev.start + ev.duration;
      for (var c = 0; c < columnEnds.length; c++) {
        if (columnEnds[c] <= ev.start) {
          columnEnds[c] = end;
          return { event: ev, column: c };
        }
      }
      columnEnds.push(end);
      return { event: ev, column: columnEnds.length - 1 };
    });
  }

  function saveEvents(events) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); } catch (e) { /* best effort only */ }
  }

  var events = loadEvents();
  var now = new Date();
  var nowMinutes = now.getHours() * 60 + now.getMinutes();

  function minutesLabel(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    return h + ':' + (m < 10 ? '0' : '') + m;
  }

  function fillFraction(ev) {
    // How much of `ev` has already elapsed, as a 0-1 fraction — only
    // meaningful for today, where "now" is a real point in time.
    var end = ev.start + ev.duration;
    if (nowMinutes <= ev.start) return 0;
    if (nowMinutes >= end) return 1;
    return (nowMinutes - ev.start) / ev.duration;
  }

  function pillBackground(isToday, ev) {
    if (!isToday) return 'var(--c-track)';
    var frac = fillFraction(ev);
    if (frac <= 0) return 'var(--c-track)';
    if (frac >= 1) return 'var(--c-accent)';
    var lo = Math.max(0, frac * 100 - 12);
    var hi = Math.min(100, frac * 100 + 12);
    return 'linear-gradient(to bottom, #37848c ' + lo + '%, var(--c-track) ' + hi + '%)';
  }

  /* ------------------------------------------------------- 3-day overview */
  body.style.setProperty('--tl-h', (DAY_MIN / 60) * HOUR_PX + 'px');

  [0, 3, 6, 9, 12, 15, 18, 21, 24].forEach(function (h) {
    var label = document.createElement('span');
    label.className = 'timeline__hour';
    label.style.top = (h * HOUR_PX) + 'px';
    label.textContent = h + ':00';
    axis.appendChild(label);
  });

  var nowLine = document.createElement('div');
  nowLine.className = 'timeline__now';
  nowLine.style.top = ((nowMinutes / 60) * HOUR_PX) + 'px';
  lanes[0].appendChild(nowLine);

  [0, 1, 2].forEach(function (day) {
    var lane = lanes[day];
    var laneEvents = events.filter(function (ev) { return ev.day === day; });
    assignColumns(laneEvents).forEach(function (placed) {
      var ev = placed.event;
      var pill = document.createElement('div');
      pill.className = 'tlpill' + (ev.done ? ' tlpill--done' : '');
      pill.style.top = ((ev.start / 60) * HOUR_PX) + 'px';
      pill.style.left = (placed.column * 10) + 'px';
      pill.style.height = Math.max(34, (ev.duration / 60) * HOUR_PX) + 'px';
      pill.style.background = ev.done ? 'var(--c-accent)' : pillBackground(day === 0, ev);
      pill.title = ev.title + ' (' + minutesLabel(ev.start) + '–' + minutesLabel(ev.start + ev.duration) + ')';
      pill.innerHTML = '<span class="material-symbols-outlined">' + (ICONS[ev.icon] || 'event') + '</span>';
      lane.appendChild(pill);
    });
  });

  /* --------------------------------------------------- today mini-timeline
     A second, more detailed timeline for just today — Figma's own "Slide
     up card" component draws it with the same pill/axis language as the
     3-day overview above, just scaled taller with event text and a tick
     box beside each pill. Range shown is whatever covers today's events
     (rounded out to 3-hour boundaries), so an empty today renders nothing
     here beyond the empty-state message. */
  var todays = events.filter(function (ev) { return ev.day === 0; })
    .sort(function (a, b) { return a.start - b.start; });
  var todaysPlaced = assignColumns(todays);

  if (!todays.length) {
    var empty = document.createElement('p');
    empty.className = 'today-panel__empty';
    var todayLang = document.body.dataset.variant;
    empty.innerHTML = todayLang === 'en' ? 'Nothing planned yet — tap Add to plan today.'
      : todayLang === 'cn' ? '还没有日程，点击“添加”来安排今天吧。'
      : 'Nothing planned yet — tap Add to plan today.<br>还没有日程，点击“添加”来安排今天吧。';
    todayList.appendChild(empty);
  } else {
    var minStart = todays.reduce(function (m, ev) { return Math.min(m, ev.start); }, todays[0].start);
    var maxEnd = todays.reduce(function (m, ev) { return Math.max(m, ev.start + ev.duration); }, 0);
    var rangeStart = Math.max(0, Math.floor(minStart / 60 / 3) * 3);
    var rangeEnd = Math.min(24, Math.ceil(maxEnd / 60 / 3) * 3);
    if (rangeEnd - rangeStart < 6) rangeEnd = Math.min(24, rangeStart + 6);
    var mtlHeight = (rangeEnd - rangeStart) * HOUR_PX;

    var mtl = document.createElement('div');
    mtl.className = 'mtl';
    mtl.style.height = mtlHeight + 'px';

    var mtlAxis = document.createElement('div');
    mtlAxis.className = 'mtl__axis';
    mtlAxis.style.height = mtlHeight + 'px';
    for (var h = rangeStart; h <= rangeEnd; h += 3) {
      var hourLabel = document.createElement('span');
      hourLabel.className = 'mtl__hour';
      hourLabel.style.top = ((h - rangeStart) * HOUR_PX) + 'px';
      hourLabel.textContent = h + ':00';
      mtlAxis.appendChild(hourLabel);
    }

    var mtlRail = document.createElement('div');
    mtlRail.className = 'mtl__rail';
    mtlRail.style.height = mtlHeight + 'px';

    var mtlBody = document.createElement('div');
    mtlBody.className = 'mtl__body';
    mtlBody.style.position = 'relative';
    mtlBody.style.height = mtlHeight + 'px';

    var mtlTickCol = document.createElement('div');
    mtlTickCol.className = 'mtl__tickcol';
    mtlTickCol.style.height = mtlHeight + 'px';

    var prevEndPx = 0;
    todaysPlaced.forEach(function (placed) {
      var ev = placed.event;
      var col = placed.column;
      var topPx = ((ev.start / 60) - rangeStart) * HOUR_PX;
      var heightPx = Math.max(34, (ev.duration / 60) * HOUR_PX);

      // Connector stems only track the main (column 0) sequence — an
      // overlapping event sitting in a side column is a parallel event,
      // not the next stop along the day, so it doesn't get its own stem.
      if (col === 0 && topPx > prevEndPx + 1) {
        var stem = document.createElement('div');
        stem.className = 'mtl__stem';
        stem.style.top = prevEndPx + 'px';
        stem.style.height = (topPx - prevEndPx) + 'px';
        mtlRail.appendChild(stem);
      }
      if (col === 0) prevEndPx = topPx + heightPx;

      var pill = document.createElement('div');
      pill.className = 'mtl__pill' + (ev.done ? ' mtl__pill--done' : '');
      pill.style.top = topPx + 'px';
      pill.style.left = (col * 12) + 'px';
      pill.style.height = heightPx + 'px';
      pill.style.background = ev.done ? 'var(--c-accent)' : pillBackground(true, ev);
      pill.innerHTML = '<span class="material-symbols-outlined">' + (ICONS[ev.icon] || 'event') + '</span>';
      mtlRail.appendChild(pill);

      var isNow = nowMinutes >= ev.start && nowMinutes < ev.start + ev.duration;
      var entry = document.createElement('div');
      entry.className = 'mtl__entry' + (ev.done ? ' is-done' : '') + (isNow ? ' is-now' : '');
      entry.style.top = topPx + 'px';
      if (col > 0) entry.style.marginLeft = (col * 12) + 'px';
      entry.innerHTML =
        '<p class="mtl__time">' + minutesLabel(ev.start) + ' – ' + minutesLabel(ev.start + ev.duration) + '</p>' +
        '<p class="mtl__title"><span class="t-en">' + escapeHtml(ev.title) + '</span></p>';
      mtlBody.appendChild(entry);

      var tick = document.createElement('button');
      tick.className = 'mtl__tick';
      tick.type = 'button';
      tick.setAttribute('role', 'checkbox');
      tick.setAttribute('aria-checked', ev.done ? 'true' : 'false');
      tick.setAttribute('aria-label', 'Mark done');
      tick.style.top = (topPx + heightPx / 2 - 14.5 + col * 6) + 'px';
      tick.innerHTML = '<span class="material-symbols-outlined">check</span>';
      tick.addEventListener('click', function () {
        ev.done = !ev.done;
        saveEvents(events);
        entry.classList.toggle('is-done', ev.done);
        pill.classList.toggle('mtl__pill--done', ev.done);
        pill.style.background = ev.done ? 'var(--c-accent)' : pillBackground(true, ev);
        tick.setAttribute('aria-checked', String(ev.done));
      });
      mtlTickCol.appendChild(tick);
    });

    mtl.appendChild(mtlAxis);
    mtl.appendChild(mtlRail);
    mtl.appendChild(mtlBody);
    mtl.appendChild(mtlTickCol);
    todayList.appendChild(mtl);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
}());
