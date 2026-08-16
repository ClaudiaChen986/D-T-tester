/* ============================================================================
   归途 GuiTu — Adding event behaviour (Figma node 19:1501)
     · literal static mockup pass: the icon circle, Date, Time, and
       Duration are all plain, non-interactive markup (see add-event.css)
       matching Figma's mock exactly, including its own literal sample
       values (Jun 5 2023, 8:00 pm, 1h) — real interactivity for them is
       a later pass, per instruction. Only the title field is live,
       matching what Figma's own mock actually is there.
     · Save still works end to end in the meantime: it uses those same
       fixed values (event 8:00 pm start, 1h duration, a generic "event"
       icon) rather than reading them from the static markup, so the
       calendar → add-event → add-event-continue flow doesn't break while
       these fields wait for their real behaviour. ?day= off the URL
       still decides which of the 3-day lanes the event lands in — "plan
       tomorrow" on calendar.html carries ?day=1 — even though the date
       shown on screen is Figma's own static sample text, not that date.
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

  var form       = document.getElementById('eventForm');
  var titleInput = document.getElementById('titleInput');
  var status     = document.getElementById('formStatus');

  /* --------------------------------------------------------- day default
     Plain query param, no persistence involved — "plan tomorrow" on
     calendar.html links here with ?day=1; the plain Add button carries
     nothing, which defaults to today. */
  var params = new URLSearchParams(window.location.search);
  var dayParam = parseInt(params.get('day'), 10);
  var day = (dayParam === 1 || dayParam === 2) ? dayParam : 0;

  /* ------------------------------------------------------------------ save
     Fixed values matching what the static mockup displays (8:00 pm,
     1h) — not read from the page, since Date/Time/Duration aren't real
     controls yet. `date` still tracks the real `day` offset (today, or
     +1/+2 from ?day=) rather than Figma's literal "Jun 5, 2023" sample —
     add-event-continue.html's summary reads it to show a real date, and
     the calendar needs a real ISO date to place the event in the right
     lane regardless of what this page's own static mock displays. */
  var FIXED_START = 20 * 60;   // 8:00 pm
  var FIXED_DURATION = 60;     // 1h
  var FIXED_ICON = 'event';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var dateForDay = new Date();
  dateForDay.setDate(dateForDay.getDate() + day);
  var isoDate = dateForDay.getFullYear() + '-' + pad(dateForDay.getMonth() + 1) + '-' + pad(dateForDay.getDate());

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';

    var title = titleInput.value.trim();
    if (!title) {
      status.textContent = 'Please enter a title 请输入标题';
      titleInput.focus();
      return;
    }

    var draft = {
      title: title,
      icon: FIXED_ICON,
      day: day,
      date: isoDate,
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
