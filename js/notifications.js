/* ============================================================================
   归途 GuiTu — Event start notifications
     · shared across every app page (not just calendar.html) so a due event
       still notifies while the user is elsewhere in the app
     · polls `guitu.calendarEvents` (the same localStorage record calendar.js
       reads) for today's (day === 0) events whose start time has just been
       reached, and fires a browser Notification carrying the event's title
     · `guitu.notifiedEventIds` remembers which events already fired so
       re-checking every few seconds — or reopening the app later the same
       day — never re-notifies the same event twice
     · an event whose start time is already more than a few minutes in the
       past when first seen (app opened late, tab was closed, etc.) is
       marked notified without ever firing — otherwise reopening the app
       hours later would replay every missed event of the day at once
   ========================================================================== */
(function () {
  'use strict';

  if (typeof Notification === 'undefined') return;

  var STORAGE_KEY = 'guitu.calendarEvents';
  var NOTIFIED_KEY = 'guitu.notifiedEventIds';
  var CHECK_INTERVAL_MS = 15000;
  var GRACE_MINUTES = 5;

  if (Notification.permission === 'default') {
    try { Notification.requestPermission(); } catch (e) {
      try { Notification.requestPermission(function () {}); } catch (err) { /* best effort only */ }
    }
  }

  function loadEvents() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  function loadNotified() {
    try {
      var raw = JSON.parse(localStorage.getItem(NOTIFIED_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  function saveNotified(ids) {
    try { localStorage.setItem(NOTIFIED_KEY, JSON.stringify(ids)); } catch (e) { /* best effort only */ }
  }

  function notify(ev) {
    try {
      new Notification(ev.title, {
        body: 'Your event is starting now.\n您的日程现在开始了。',
        tag: ev.id,
      });
    } catch (e) { /* best effort only */ }
  }

  function checkEvents() {
    if (Notification.permission !== 'granted') return;

    var events = loadEvents();
    var notified = loadNotified();
    var notifiedSet = {};
    notified.forEach(function (id) { notifiedSet[id] = true; });

    var now = new Date();
    var nowMinutes = now.getHours() * 60 + now.getMinutes();
    var changed = false;

    events.forEach(function (ev) {
      if (ev.day !== 0 || ev.done || !ev.id || notifiedSet[ev.id]) return;
      if (nowMinutes < ev.start) return;

      if (nowMinutes - ev.start <= GRACE_MINUTES) notify(ev);
      notifiedSet[ev.id] = true;
      notified.push(ev.id);
      changed = true;
    });

    if (changed) saveNotified(notified);
  }

  checkEvents();
  setInterval(checkEvents, CHECK_INTERVAL_MS);
}());
