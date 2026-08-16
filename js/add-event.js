/* ============================================================================
   归途 GuiTu — Adding event behaviour (Figma node 19:1501)
     · the round icon-picker is a real button: tapping it reveals a
       horizontal, scrollable strip of common Material Symbols
       (fonts.google.com/icons) — pick one, it lands in the circle
     · title stays real input, same as it's always been
     · Date is real again too: the small round badge is a real button
       that calls a hidden native <input type="date">'s showPicker() to
       open the browser's own date-picker pop-up (falling back to
       .focus()/.click() on browsers without showPicker); its `change`
       re-renders the visible text in Figma's own style
       ("Jun 5 （6月5日）, 2023") instead of the input's native locale
       format
     · "Date and Time - Wheels" and Duration are still plain,
       non-interactive markup matching Figma's mock exactly (its own
       literal sample values — 8:00 pm, 1h) — real interactivity for
       those is a later pass, per instruction. Save uses fixed values
       for them meanwhile (not read from the static markup), so the
       flow keeps working while they wait.
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
  var dateText         = document.getElementById('dateText');
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
    dateText.textContent = dateInput.value ? formatDate(dateInput.value) : '';
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

  /* ------------------------------------------------------------------ save
     Time/Duration are still fixed values matching what the static
     mockup displays (8:00 pm, 1h) — not read from the page, since
     they're not real controls yet. */
  var FIXED_START = 20 * 60;   // 8:00 pm
  var FIXED_DURATION = 60;     // 1h

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
      start: FIXED_START,
      time: FIXED_START,
      duration: FIXED_DURATION,
    };

    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      window.location.href = 'add-event-continue.html';
    } catch (err) {
      status.textContent = 'Could not continue — storage unavailable 无法继续';
    }
  });
}());
