/* ============================================================================
   归途 GuiTu — Adding event, step 2 behaviour (Figma node 19:1547)
     · fills the round icon shape + title/date-time text from whatever was
       entered on add-event.html (sessionStorage `guitu.addEventDraft`)
     · Repeat is a single-select chip grid; "add sub-task" gates its
       textarea behind the checkbox next to it
     · Save is what actually commits the event to localStorage — step 1
       only ever holds a draft, so abandoning the flow here leaves nothing
       behind in the real calendar
   ========================================================================== */
(function () {
  'use strict';

  var DRAFT_KEY   = 'guitu.addEventDraft';
  var STORAGE_KEY = 'guitu.calendarEvents';

  var summaryIcon  = document.getElementById('summaryIcon');
  var summaryTitle = document.getElementById('summaryTitle');
  var summaryWhen  = document.getElementById('summaryWhen');
  var repeatGrid   = document.getElementById('repeatGrid');
  var subtaskToggle = document.getElementById('subtaskToggle');
  var subtaskInput  = document.getElementById('subtaskInput');
  var form         = document.getElementById('continueForm');

  /* ------------------------------------------------------------- draft in */
  var draft = null;
  try { draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY)); } catch (e) { /* ignore */ }

  if (!draft || !draft.title) {
    // Nothing to continue with (direct visit, refresh after the draft was
    // cleared, etc.) — back to step 1 rather than showing an empty summary.
    window.location.href = 'add-event.html';
    return;
  }

  summaryIcon.innerHTML = '<span class="material-symbols-outlined">' + (draft.icon || 'event') + '</span>';
  summaryTitle.textContent = draft.title;
  summaryWhen.innerHTML = formatWhen(draft.date, draft.time);

  function formatWhen(dateValue, timeValue) {
    var MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = new Date(dateValue + 'T00:00:00');
    var dateLine = MONTHS_EN[d.getMonth()] + ' ' + d.getDate() +
      ' <span class="t-cn">（' + (d.getMonth() + 1) + '月' + d.getDate() + '日）</span>, ' + d.getFullYear();

    var parts = timeValue.split(':');
    var h = parseInt(parts[0], 10), m = parts[1];
    var isPm = h >= 12;
    var h12 = h % 12 === 0 ? 12 : h % 12;
    var timeLine = h12 + ':' + m + ' ' + (isPm ? 'pm' : 'am') +
      ' <span class="t-cn">（' + (isPm ? '下午' : '上午') + '）</span>';

    return dateLine + '<br>' + timeLine;
  }

  /* --------------------------------------------------------------- repeat */
  var selectedRepeat = 'none';
  repeatGrid.addEventListener('click', function (e) {
    var chip = e.target.closest('.repeatchip');
    if (!chip) return;
    selectedRepeat = chip.dataset.repeat;
    repeatGrid.querySelectorAll('.repeatchip').forEach(function (c) {
      c.classList.toggle('is-selected', c === chip);
    });
  });

  /* -------------------------------------------------------------- subtask */
  subtaskToggle.addEventListener('change', function () {
    subtaskInput.disabled = !subtaskToggle.checked;
    if (subtaskToggle.checked) subtaskInput.focus();
  });

  /* ------------------------------------------------------------------ save */
  function loadEvents() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var events = loadEvents();
    var event = {
      id: 'ev-' + Date.now(),
      title: draft.title,
      icon: draft.icon || 'event',
      day: draft.day,
      start: draft.start,
      duration: draft.duration,
      done: false,
      repeat: selectedRepeat,
    };
    if (subtaskToggle.checked && subtaskInput.value.trim()) {
      event.subtask = subtaskInput.value.trim();
    }
    events.push(event);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      sessionStorage.removeItem(DRAFT_KEY);
    } catch (err) { /* best effort only */ }

    window.location.href = 'calendar.html';
  });
}());
