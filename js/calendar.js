/* ============================================================================
   归途 GuiTu — My Calendar behaviour (Figma node 56:218)
     · renders the 3-day / 0:00-24:00 timeline from localStorage
       (`guitu.calendarEvents`, written by add-event.html)
     · today's lane colours each pill by how much of it has already
       happened, measured against the real clock; tomorrow/2-days always
       render as plain unfilled track since "now" doesn't apply to them
     · today's-events list mirrors the same badge colour rule and adds a
       tickable checkbox, persisted back into the same stored event
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'guitu.calendarEvents';
  var HOUR_PX = 36;
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

  /* ---------------------------------------------------------------- axis */
  body.style.setProperty('--tl-h', (DAY_MIN / 60) * HOUR_PX + 'px');

  [0, 3, 6, 9, 12, 15, 18, 21, 24].forEach(function (h) {
    var label = document.createElement('span');
    label.className = 'timeline__hour';
    label.style.top = (h * HOUR_PX) + 'px';
    label.textContent = h + ':00';
    axis.appendChild(label);
  });

  var now = new Date();
  var nowMinutes = now.getHours() * 60 + now.getMinutes();
  var nowLine = document.createElement('div');
  nowLine.className = 'timeline__now';
  nowLine.style.top = ((nowMinutes / 60) * HOUR_PX) + 'px';
  lanes[0].appendChild(nowLine);

  /* --------------------------------------------------------------- pills */
  function minutesLabel(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    return h + ':' + (m < 10 ? '0' : '') + m;
  }

  function fillFraction(ev) {
    // How much of `ev` has already elapsed, as a 0-1 fraction — only
    // meaningful for today's lane, where "now" is a real point in time.
    var end = ev.start + ev.duration;
    if (nowMinutes <= ev.start) return 0;
    if (nowMinutes >= end) return 1;
    return (nowMinutes - ev.start) / ev.duration;
  }

  function pillBackground(day, ev) {
    if (day !== 0) return 'var(--c-track)';
    var frac = fillFraction(ev);
    if (frac <= 0) return 'var(--c-track)';
    if (frac >= 1) return 'var(--c-accent, #37848c)';
    var lo = Math.max(0, frac * 100 - 12);
    var hi = Math.min(100, frac * 100 + 12);
    return 'linear-gradient(to bottom, #37848c ' + lo + '%, var(--c-track) ' + hi + '%)';
  }

  events.forEach(function (ev) {
    var lane = lanes[ev.day];
    if (!lane) return;
    var pill = document.createElement('div');
    pill.className = 'tlpill' + (ev.done ? ' tlpill--done' : '');
    pill.style.top = ((ev.start / 60) * HOUR_PX) + 'px';
    pill.style.height = Math.max(34, (ev.duration / 60) * HOUR_PX) + 'px';
    pill.style.background = ev.done ? '#37848c' : pillBackground(ev.day, ev);
    pill.title = ev.title + ' (' + minutesLabel(ev.start) + '–' + minutesLabel(ev.start + ev.duration) + ')';
    pill.innerHTML = '<span class="material-symbols-outlined">' + (ICONS[ev.icon] || 'event') + '</span>';
    lane.appendChild(pill);
  });

  /* ---------------------------------------------------------- today list */
  var todays = events.filter(function (ev) { return ev.day === 0; })
    .sort(function (a, b) { return a.start - b.start; });

  if (!todays.length) {
    var empty = document.createElement('p');
    empty.className = 'today-panel__empty';
    empty.innerHTML = 'Nothing planned yet — tap Add to plan today.<br>还没有日程，点击“添加”来安排今天吧。';
    todayList.appendChild(empty);
  }

  todays.forEach(function (ev) {
    var isNow = nowMinutes >= ev.start && nowMinutes < ev.start + ev.duration;
    var row = document.createElement('div');
    row.className = 'evrow' + (isNow ? ' evrow--now' : '') + (ev.done ? ' is-done' : '');
    row.innerHTML =
      '<span class="evrow__badge"><span class="material-symbols-outlined">' + (ICONS[ev.icon] || 'event') + '</span></span>' +
      '<span class="evrow__text">' +
        '<p class="evrow__title">' + escapeHtml(ev.title) + '</p>' +
        '<p class="evrow__time">' + minutesLabel(ev.start) + ' – ' + minutesLabel(ev.start + ev.duration) + '</p>' +
      '</span>' +
      '<button class="evrow__tick" type="button" role="checkbox" aria-checked="' + (ev.done ? 'true' : 'false') + '" aria-label="Mark done">' +
        '<span class="material-symbols-outlined">check</span>' +
      '</button>';
    row.querySelector('.evrow__tick').addEventListener('click', function () {
      ev.done = !ev.done;
      saveEvents(events);
      row.classList.toggle('is-done', ev.done);
      this.setAttribute('aria-checked', String(ev.done));
    });
    todayList.appendChild(row);
  });

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
}());
