/* ============================================================================
   归途 GuiTu — Adding event behaviour (Figma node 19:1501)
     · the round icon-picker toggles a small selection bar of Material
       Symbols (fonts.google.com/icons) — pick one, it lands in the circle
     · no Time field — the event's start defaults silently to right now
       (rounded to the nearest 5 minutes), same value this page used to
       prefill a now-removed time picker with
     · Duration is a drag-left-to-right range slider snapping between
       Figma's own seven preset stops (5/10/15/30 min, 1h/2h/3h) rather
       than separate chip buttons; the fill and which tick is highlighted
       both update on every `input` event, so dragging shows the picked
       duration continuously instead of only on release. Tapping a tick
       label directly also jumps the slider there.
     · Save doesn't write the event yet — it's only step 1 of the flow.
       It hands the title/icon/date/start/duration to
       add-event-continue.html (node 19:1547, Repeat + optional sub-task)
       as a sessionStorage draft; that page's own Save is what actually
       commits the event to localStorage. sessionStorage (not localStorage)
       because this is a single-flow handoff, same reasoning as
       `guitu.callTarget` in js/app.js — abandoning the flow on step 2
       shouldn't leave a half-finished event lying around.
   ========================================================================== */
(function () {
  'use strict';

  var DRAFT_KEY = 'guitu.addEventDraft';

  var form           = document.getElementById('eventForm');
  var iconPicker     = document.getElementById('iconPicker');
  var iconDisplay    = document.getElementById('iconDisplay');
  var iconBar        = document.getElementById('iconBar');
  var titleInput     = document.getElementById('titleInput');
  var dateInput      = document.getElementById('dateInput');
  var durationInput  = document.getElementById('durationInput');
  var durationTicks  = document.getElementById('durationTicks');
  var status         = document.getElementById('formStatus');

  var ICONS = [
    'directions_walk', 'restaurant', 'groups', 'home', 'bedtime',
    'medication', 'shopping_cart', 'fitness_center', 'work',
    'favorite', 'book', 'celebration',
  ];

  var selectedIcon = null;

  /* ------------------------------------------------------------- icon bar */
  ICONS.forEach(function (name) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'iconbar__btn';
    btn.dataset.icon = name;
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', 'false');
    btn.innerHTML = '<span class="material-symbols-outlined">' + name + '</span>';
    btn.addEventListener('click', function () {
      selectedIcon = name;
      iconBar.querySelectorAll('.iconbar__btn').forEach(function (b) {
        b.classList.toggle('is-selected', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      iconDisplay.innerHTML = '<span class="material-symbols-outlined">' + name + '</span>';
      setIconBar(false);
    });
    iconBar.appendChild(btn);
  });

  function setIconBar(open) {
    iconBar.hidden = !open;
    iconPicker.setAttribute('aria-expanded', String(open));
  }
  iconPicker.addEventListener('click', function () { setIconBar(iconBar.hidden); });

  /* --------------------------------------------------------- date default
     Plain query param, no persistence involved — "plan tomorrow" on
     calendar.html links here with ?day=1 to pre-select tomorrow's date;
     the plain Add button carries nothing, which defaults to today. */
  var params = new URLSearchParams(window.location.search);
  var dayParam = parseInt(params.get('day'), 10);
  var defaultDate = new Date();
  if (dayParam === 1 || dayParam === 2) defaultDate.setDate(defaultDate.getDate() + dayParam);
  dateInput.value = toDateInputValue(defaultDate);

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function toDateInputValue(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  /* -------------------------------------------------------------- start
     No Time field on this page — the event just starts "now". */
  var now = new Date();
  now.setMinutes(Math.round(now.getMinutes() / 5) * 5, 0, 0);
  var startMinutes = now.getHours() * 60 + now.getMinutes();

  /* ------------------------------------------------------- duration slider */
  var DURATIONS = [5, 10, 15, 30, 60, 120, 180];
  var selectedMinutes = DURATIONS[parseInt(durationInput.value, 10)];
  var durationTickEls = durationTicks.querySelectorAll('.durationslider__tick');

  function updateDurationSlider() {
    var index = parseInt(durationInput.value, 10);
    selectedMinutes = DURATIONS[index];
    var pct = (index / (DURATIONS.length - 1)) * 100;
    durationInput.style.background =
      'linear-gradient(to right, #37848c ' + pct + '%, #edd8b4 ' + pct + '%)';
    durationInput.setAttribute('aria-valuetext', selectedMinutes + ' minutes');
    durationTickEls.forEach(function (tick) {
      tick.classList.toggle('is-selected', parseInt(tick.dataset.index, 10) === index);
    });
  }
  updateDurationSlider();
  durationInput.addEventListener('input', updateDurationSlider);

  durationTickEls.forEach(function (tick) {
    tick.addEventListener('click', function () {
      durationInput.value = tick.dataset.index;
      updateDurationSlider();
    });
  });

  /* ------------------------------------------------------------------ save */
  function dayOffset(dateValue) {
    var picked = new Date(dateValue + 'T00:00:00');
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var diffDays = Math.round((picked - today) / 86400000);
    return Math.max(0, Math.min(2, diffDays));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';

    var title = titleInput.value.trim();
    if (!title) {
      status.textContent = 'Please enter a title 请输入标题';
      titleInput.focus();
      return;
    }
    if (!dateInput.value) {
      status.textContent = 'Please set a date 请设置日期';
      return;
    }

    var draft = {
      title: title,
      icon: selectedIcon || 'event',
      day: dayOffset(dateInput.value),
      date: dateInput.value,
      time: startMinutes,
      start: startMinutes,
      duration: selectedMinutes,
    };

    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      window.location.href = 'add-event-continue.html';
    } catch (err) {
      status.textContent = 'Could not continue — storage unavailable 无法继续';
    }
  });
}());
