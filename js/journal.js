/* ============================================================================
   归途 GuiTu — "My Journal": real entries, real save
   ----------------------------------------------------------------------------
   The three sample entries from Figma (A Walk by the Sea / 今天的晚饭 /
   学习新单词) are seeded here exactly as designed, and always render last —
   anything saved from add-journal.html is read from localStorage
   ("guitu.journal") and rendered *ahead* of them, newest entry first, since
   that's the order a real journal reads in. add-journal.js is the one that
   unshifts a new entry onto the front of the stored array, so this file
   just trusts whatever order it finds there.

   If localStorage was unavailable when an entry was saved (some browsers
   disable it for file:// pages), it arrives instead as a ?new= URL
   parameter — same fallback add-contact.js/contacts.js already use. That
   gets folded into the saved list below, re-attempted into localStorage,
   and stripped from the URL.

   Entry titles/bodies are free-typed text in whichever language the user
   wrote in — sometimes both in the same sentence, the way Figma's own
   "学习新单词" sample quotes English phrases mid-paragraph. richTextHtml()
   below reproduces that by splitting on runs of CJK vs. non-CJK characters
   and giving each run its own font, the same script-detection idea
   contacts.js already uses for saved contact names (see CJK_RE there).
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'guitu.journal';

  var SEED = [
    {
      title: 'A Walk by the Sea',
      body: 'Today the weather was very nice, so I went for a short walk near the water. The wind was gentle and the sky was clear. I sat on a bench for a while and watched the birds flying above the ocean. It reminded me of the days when I used to go walking with my family.'
    },
    {
      title: '今天的晚饭',
      body: '今天晚上做了番茄炒蛋和青菜。虽然只是简单的家常菜，但吃起来很舒服。吃饭的时候和家里人聊了聊天，也让我想起以前在中国一家人围在一起吃饭的时候。平平淡淡的一天，也很幸福。'
    },
    {
      title: '学习新单词',
      body: '今天学了新的英文句子“How are you?”和“I am fine.”，虽然发音还不太熟练，但觉得自己慢慢有进步。有时候在澳洲不会说英文会让我有点害怕，不知道怎么和别人沟通。不过今天觉得，如果每天学一点点，也许以后会越来越容易。'
    }
  ];

  function loadSaved() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  function takePendingFromUrl() {
    var raw = new URLSearchParams(window.location.search).get('new');
    if (!raw) return null;
    try {
      var entry = JSON.parse(raw);
      return entry && entry.id && entry.body ? entry : null;
    } catch (e) { return null; }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Same CJK ranges contacts.js uses for nameFontClass — 一-鿿 covers
     the main CJK Unified Ideographs block, 㐀-䶿/豈-﫿 the rarer
     extension/compatibility ones. */
  var CJK_RE = /[㐀-䶿一-鿿豈-﫿]/;
  var CJK_RUN_RE = /[㐀-䶿一-鿿豈-﫿]+|[^㐀-䶿一-鿿豈-﫿]+/g;

  function richTextHtml(text) {
    var runs = text.match(CJK_RUN_RE) || [];
    return runs.map(function (run) {
      var cls = CJK_RE.test(run) ? 't-cn' : 't-en';
      return '<span class="' + cls + '">' + escapeHtml(run) + '</span>';
    }).join('');
  }

  function entryHtml(entry) {
    var titleHtml = entry.title ? '<p class="entry__title">' + richTextHtml(entry.title) + '</p>' : '';
    return (
      '<article class="entry">' +
        '<img class="entry__bg" src="../assets/journal-card-bg.svg" alt="">' +
        titleHtml +
        '<p class="entry__body">' + richTextHtml(entry.body) + '</p>' +
      '</article>'
    );
  }

  var saved = loadSaved();

  var pending = takePendingFromUrl();
  if (pending && !saved.some(function (e) { return e.id === pending.id; })) {
    saved.unshift(pending);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (e) { /* still render it below either way */ }
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  /* journal-en.html reuses this file verbatim (see lang-en.css), which
     hides every `.t-cn` run richTextHtml() produces — fine for a mixed-
     language entry (the English runs still show), but the two wholly-
     Chinese seed entries above would render as an empty card instead of
     just untranslated text, so skip them rather than show that. */
  var IS_EN = document.body.dataset.variant === 'en';
  var seedEntries = IS_EN
    ? SEED.filter(function (e) { return !CJK_RE.test(e.title) && !CJK_RE.test(e.body); })
    : SEED;

  var entries = saved.concat(seedEntries);
  document.getElementById('journalList').innerHTML = entries.map(entryHtml).join('');
}());
