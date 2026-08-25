/* ============================================================================
   归途 GuiTu — Adding event behaviour (Figma node 19:1501)
     · the round icon-picker is a real button: tapping it reveals a
       horizontal, scrollable strip of common Material Symbols
       (fonts.google.com/icons) — pick one, it lands in the circle
     · title stays real input, same as it's always been
     · Date is real again too: the nested text pill itself (not the
       calendar icon beside it, which is purely decorative) is a real
       button that calls a hidden native <input type="date">'s
       showPicker() to open the browser's own date-picker pop-up
       (falling back to .focus()/.click() on browsers without
       showPicker); its `change` re-renders the button's own text in
       Figma's own style ("Jun 5 （6月5日）, 2023") instead of the
       input's native locale format
     · "Date and Time - Wheels" is a real iOS-style roller now: each of
       the three columns (hour/minute/AM-PM) is its own CSS scroll-snap
       track — native scroll-snap owns the momentum/settling, this file
       just figures out which row ended up nearest the fixed selection
       band and treats that as the picked value (also updated live while
       dragging, and tapping any row scrolls it to centre directly).
     · Duration is a real drag-left-right control too now: a native
       <input type="range"> whose thumb is styled to *be* Figma's own
       darker-teal "1h" capsule (49×42, radius 21), sitting under the
       seven value labels (which sit visually on top but let clicks/
       drags pass through to the input beneath via pointer-events:none).
       Every `input` event repaints which label is white/bold — live
       while dragging, not just on release.
     · Save doesn't write the event yet — it's only step 1 of the flow.
       It hands the title/icon/day/start/duration to
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

  var form            = document.getElementById('eventForm');
  var iconPicker       = document.getElementById('iconPicker');
  var iconDisplay      = document.getElementById('iconDisplay');
  var iconBar          = document.getElementById('iconBar');
  var titleInput       = document.getElementById('titleInput');
  var titlePlaceholder = document.getElementById('titlePlaceholder');
  var dateButton       = document.getElementById('dateButton');
  var dateInput        = document.getElementById('dateInput');
  var status           = document.getElementById('formStatus');

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

  /* Figma's own two-line, two-font placeholder — see the CSS comment on
     .titleinput__placeholder for why this isn't the input's native
     placeholder attribute. Shown only while the field is empty. */
  titleInput.addEventListener('input', function () {
    titlePlaceholder.hidden = titleInput.value.length > 0;
  });

  /* ------------------------------------------------------------------ date
     Plain query param, no persistence involved — "plan tomorrow" on
     calendar.html links here with ?day=1 to default the date picker to
     tomorrow; the plain Add button carries nothing, which defaults to
     today. Picking a different date afterwards is real: the change
     handler below reads whatever the user actually chose. */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function toDateInputValue(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  var params = new URLSearchParams(window.location.search);
  var dayParam = parseInt(params.get('day'), 10);
  var defaultDate = new Date();
  if (dayParam === 1 || dayParam === 2) defaultDate.setDate(defaultDate.getDate() + dayParam);
  dateInput.value = toDateInputValue(defaultDate);

  var MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function formatDate(dateValue) {
    var d = new Date(dateValue + 'T00:00:00');
    return MONTHS_EN[d.getMonth()] + ' ' + d.getDate() +
      ' （' + (d.getMonth() + 1) + '月' + d.getDate() + '日）, ' + d.getFullYear();
  }

  function updateDateText() {
    dateButton.textContent = dateInput.value ? formatDate(dateInput.value) : '';
  }
  updateDateText();
  dateInput.addEventListener('change', updateDateText);

  dateButton.addEventListener('click', function () {
    if (typeof dateInput.showPicker === 'function') {
      try { dateInput.showPicker(); return; } catch (err) { /* fall through */ }
    }
    dateInput.focus();
    dateInput.click();
  });

  function dayOffset(dateValue) {
    var picked = new Date(dateValue + 'T00:00:00');
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var diffDays = Math.round((picked - today) / 86400000);
    return Math.max(0, Math.min(2, diffDays));
  }

  /* ----------------------------------------------------------- time wheels
     Each column is a native scroll-snap track: .wheelcol__pad top/bottom
     (half the visible height minus half a row) lets the first/last real
     row scroll all the way to the centre selection band, and every real
     row is scroll-snap-align:center. `settle()` figures out which row is
     nearest centre — called continuously on `scroll` (so dragging shows
     the pick updating live, not just on release) and once more after
     scrolling stops, to correct for any sub-pixel rounding and make sure
     the value reported matches exactly what's visually centred. */
  var ITEM_H = 35;

  function buildWheel(col, values) {
    col.innerHTML = '';
    var topPad = document.createElement('div');
    topPad.className = 'wheelcol__pad';
    col.appendChild(topPad);

    var items = values.map(function (v) {
      var item = document.createElement('div');
      item.className = 'wheelcol__item';
      item.textContent = v.label;
      item.dataset.value = v.value;
      col.appendChild(item);
      return item;
    });

    var bottomPad = document.createElement('div');
    bottomPad.className = 'wheelcol__pad';
    col.appendChild(bottomPad);

    var selectedIndex = 0;
    var settleTimer = null;

    function sizePads() {
      var half = Math.max(0, (col.clientHeight - ITEM_H) / 2);
      topPad.style.height = half + 'px';
      bottomPad.style.height = half + 'px';
    }

    function paintSelection(index) {
      items.forEach(function (item, i) {
        item.classList.toggle('is-selected', i === index);
        var dist = Math.abs(i - index);
        item.style.opacity = String(Math.max(.18, 1 - dist * .38));
      });
    }

    function settle(smooth) {
      var index = Math.max(0, Math.min(items.length - 1,
        Math.round(col.scrollTop / ITEM_H)));
      selectedIndex = index;
      paintSelection(index);
      var target = index * ITEM_H;
      if (Math.abs(col.scrollTop - target) > 1) {
        col.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' });
      }
      return index;
    }

    col.addEventListener('scroll', function () {
      // live-update the bolded/faded rows while dragging or momentum-
      // scrolling, then settle (and correct) once motion actually stops.
      var index = Math.max(0, Math.min(items.length - 1,
        Math.round(col.scrollTop / ITEM_H)));
      if (index !== selectedIndex) { selectedIndex = index; paintSelection(index); }
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () { settle(false); }, 120);
    });

    items.forEach(function (item, i) {
      item.addEventListener('click', function () {
        col.scrollTo({ top: i * ITEM_H, behavior: 'smooth' });
      });
    });

    col.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); col.scrollTo({ top: (selectedIndex + 1) * ITEM_H, behavior: 'smooth' }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); col.scrollTo({ top: (selectedIndex - 1) * ITEM_H, behavior: 'smooth' }); }
    });

    return {
      init: function (index) {
        sizePads();
        col.scrollTop = index * ITEM_H;
        settle(false);
      },
      getValue: function () { return values[selectedIndex].value; },
    };
  }

  var HOURS = [];
  for (var h = 1; h <= 12; h++) HOURS.push({ value: h, label: String(h) });
  var MINUTES = [];
  for (var m = 0; m < 60; m++) MINUTES.push({ value: m, label: pad(m) });
  var AMPM = [{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }];

  var hourWheel = buildWheel(document.getElementById('hourWheel'), HOURS);
  var minuteWheel = buildWheel(document.getElementById('minuteWheel'), MINUTES);
  var ampmWheel = buildWheel(document.getElementById('ampmWheel'), AMPM);

  // Default to 8:00 pm — the value Figma's own mock shows selected.
  hourWheel.init(7);   // index 7 -> HOURS[7].value === 8
  minuteWheel.init(0);
  ampmWheel.init(1);   // index 1 -> AMPM[1].value === 'PM'

  function wheelStartMinutes() {
    var hour12 = hourWheel.getValue();
    var minute = minuteWheel.getValue();
    var isPm = ampmWheel.getValue() === 'PM';
    var hour24 = (hour12 % 12) + (isPm ? 12 : 0);
    return hour24 * 60 + minute;
  }

  /* -------------------------------------------------------------- duration
     The lighter capsule is a fill: its width is recomputed from the
     thumb's own track math (the same formula the browser itself uses to
     place the thumb — track width minus thumb width, times how far
     along the 7 stops the current value is) so its right edge always
     lands exactly on the thumb's right edge, whichever stop that is —
     not just at "1h", which is the only place Figma's own static mock
     shows that relationship holding. */
  var DURATIONS = [5, 10, 15, 30, 60, 120, 180];
  var THUMB_W = 49;
  var HIGHLIGHT_LEFT = 6;
  var durationInput = document.getElementById('durationInput');
  var durationHighlight = document.querySelector('.durationpill__highlight');
  var durationValues = document.querySelectorAll('.durationpill__value');

  function paintDuration() {
    var index = parseInt(durationInput.value, 10);
    durationValues.forEach(function (v) {
      v.classList.toggle('is-selected', parseInt(v.dataset.index, 10) === index);
    });

    var frac = index / (DURATIONS.length - 1);
    var trackW = durationInput.offsetWidth;
    var thumbRight = frac * (trackW - THUMB_W) + THUMB_W;
    durationHighlight.style.width = Math.max(THUMB_W - HIGHLIGHT_LEFT, thumbRight - HIGHLIGHT_LEFT) + 'px';
  }
  paintDuration();
  durationInput.addEventListener('input', paintDuration);
  window.addEventListener('resize', paintDuration);

  function selectedDuration() {
    return DURATIONS[parseInt(durationInput.value, 10)];
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

    var startMinutes = wheelStartMinutes();
    var draft = {
      title: title,
      icon: selectedIcon || 'event',
      day: dayOffset(dateInput.value),
      date: dateInput.value,
      start: startMinutes,
      time: startMinutes,
      duration: selectedDuration(),
    };

    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      window.location.href = 'add-event-continue.html';
    } catch (err) {
      status.textContent = 'Could not continue — storage unavailable 无法继续';
    }
  });
}());
