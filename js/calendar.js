/* ============================================================================
   归途 GuiTu — My Calendar behaviour (Figma node 56:218)
     · renders the 3-day / 0:00-24:00 overview timeline from localStorage
       (`guitu.calendarEvents`, written by add-event.html), using Figma's
       own 907px axis span as a uniform px/hour scale
     · renders the today panel as a *second*, more detailed timeline for
       just today (Figma's "Slide up card" component, 56:546/56:729) —
       same pill/axis language, a taller scale, event text and a tick box
       beside each pill instead of just an icon
     · both colour each pill by how much of it has already happened,
       measured against the real clock; only today's events ever show a
       partial/full fill, since "now" doesn't apply to tomorrow/2-days
   ========================================================================== */
(function () {
  'use strict';

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

  events.forEach(function (ev) {
    var lane = lanes[ev.day];
    if (!lane) return;
    var pill = document.createElement('div');
    pill.className = 'tlpill' + (ev.done ? ' tlpill--done' : '');
    pill.style.top = ((ev.start / 60) * HOUR_PX) + 'px';
    pill.style.height = Math.max(34, (ev.duration / 60) * HOUR_PX) + 'px';
    pill.style.background = ev.done ? 'var(--c-accent)' : pillBackground(ev.day === 0, ev);
    pill.title = ev.title + ' (' + minutesLabel(ev.start) + '–' + minutesLabel(ev.start + ev.duration) + ')';
    pill.innerHTML = '<span class="material-symbols-outlined">' + (ICONS[ev.icon] || 'event') + '</span>';
    lane.appendChild(pill);
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

  if (!todays.length) {
    var empty = document.createElement('p');
    empty.className = 'today-panel__empty';
    empty.innerHTML = 'Nothing planned yet — tap Add to plan today.<br>还没有日程，点击“添加”来安排今天吧。';
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
    todays.forEach(function (ev, i) {
      var topPx = ((ev.start / 60) - rangeStart) * HOUR_PX;
      var heightPx = Math.max(34, (ev.duration / 60) * HOUR_PX);

      if (topPx > prevEndPx + 1) {
        var stem = document.createElement('div');
        stem.className = 'mtl__stem';
        stem.style.top = prevEndPx + 'px';
        stem.style.height = (topPx - prevEndPx) + 'px';
        mtlRail.appendChild(stem);
      }
      prevEndPx = topPx + heightPx;

      var pill = document.createElement('div');
      pill.className = 'mtl__pill' + (ev.done ? ' mtl__pill--done' : '');
      pill.style.top = topPx + 'px';
      pill.style.height = heightPx + 'px';
      pill.style.background = ev.done ? 'var(--c-accent)' : pillBackground(true, ev);
      pill.innerHTML = '<span class="material-symbols-outlined">' + (ICONS[ev.icon] || 'event') + '</span>';
      mtlRail.appendChild(pill);

      var isNow = nowMinutes >= ev.start && nowMinutes < ev.start + ev.duration;
      var entry = document.createElement('div');
      entry.className = 'mtl__entry' + (ev.done ? ' is-done' : '') + (isNow ? ' is-now' : '');
      entry.style.top = topPx + 'px';
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
      tick.style.top = (topPx + heightPx / 2 - 14.5) + 'px';
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
