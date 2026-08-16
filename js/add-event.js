/* ============================================================================
   归途 GuiTu — Adding event behaviour (Figma node 19:1501)
     · the round icon-picker toggles a small selection bar of Material
       Symbols (fonts.google.com/icons) — pick one, it lands in the circle
     · Time is a drag-left-to-right range slider (0:00-24:00 in 5-minute
       steps) rather than Figma's own wheel picker — the live value label
       and the teal/cream fill both update on every `input` event, so
       dragging shows the picked time continuously instead of only on
       release
     · Save doesn't write the event yet — it's only step 1 of the flow.
       It hands the title/icon/date/time/duration to
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

  var form        = document.getElementById('eventForm');
  var iconPicker  = document.getElementById('iconPicker');
  var iconDisplay = document.getElementById('iconDisplay');
  var iconBar     = document.getElementById('iconBar');
  var titleInput  = document.getElementById('titleInput');
  var dateInput   = document.getElementById('dateInput');
  var timeInput   = document.getElementById('timeInput');
  var timeValue   = document.getElementById('timeValue');
  var durationRow = document.getElementById('durationRow');
  var status      = document.getElementById('formStatus');

  var ICONS = [
    'directions_walk', 'restaurant', 'groups', 'home', 'bedtime',
    'medication', 'shopping_cart', 'fitness_center', 'work',
    'favorite', 'book', 'celebration',
  ];

  var selectedIcon = null;
  var selectedMinutes = 60;

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

  /* ------------------------------------------------------------- duration */
  durationRow.addEventListener('click', function (e) {
    var chip = e.target.closest('.durationchip');
    if (!chip) return;
    selectedMinutes = parseInt(chip.dataset.minutes, 10);
    durationRow.querySelectorAll('.durationchip').forEach(function (c) {
      c.classList.toggle('is-selected', c === chip);
    });
  });

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

  /* ----------------------------------------------------------- time slider */
  function formatTime(minutes) {
    var h = Math.floor(minutes / 60), m = minutes % 60;
    var isPm = h >= 12;
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + pad(m) + ' ' + (isPm ? 'pm' : 'am');
  }

  function updateTimeSlider() {
    var minutes = parseInt(timeInput.value, 10);
    var pct = (minutes / timeInput.max) * 100;
    timeValue.textContent = formatTime(minutes);
    timeInput.setAttribute('aria-valuetext', formatTime(minutes));
    timeInput.style.background =
      'linear-gradient(to right, #37848c ' + pct + '%, #edd8b4 ' + pct + '%)';
  }

  var now = new Date();
  now.setMinutes(Math.round(now.getMinutes() / 5) * 5, 0, 0);
  timeInput.value = String(now.getHours() * 60 + now.getMinutes());
  updateTimeSlider();
  timeInput.addEventListener('input', updateTimeSlider);

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

    var startMinutes = parseInt(timeInput.value, 10);

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
