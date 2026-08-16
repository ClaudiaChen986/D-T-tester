/* ============================================================================
   归途 GuiTu — "Phrase library" (Figma node 136:1498)
   ----------------------------------------------------------------------------
   Same seed + saved pattern as contacts.js: the sixteen phrases from Figma
   are kept verbatim as seed data, anything saved from add-phrase.html is
   read from localStorage and appended after them. No fit()/--scale here —
   like contacts.html, this is a real scrolling page, not a fixed stage.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'guitu.phrases';

  var SEED_PHRASES = [
    { en: 'I‘m lost',                             cn: '我迷路了',           size: 'sm' },
    { en: 'I need help',                               cn: '我需要帮助',         size: 'sm' },
    { en: 'Call family',                                cn: '联系家人',           size: 'sm' },
    { en: 'I don’t speak English',                 cn: '我不会说英文',       size: 'sm' },
    { en: 'Thank you',                                  cn: '谢谢你',             size: 'sm' },
    { en: 'Where is the toilet?',                       cn: '洗手间在哪里？',     size: 'sm' },
    { en: 'How much is this?',                          cn: '这个多少钱？',       size: 'sm' },
    { en: 'Where is this address?',                     cn: '这个地址在哪里？',   size: 'sm' },
    { en: 'Please take me to this address',             cn: '请带我去这个地址',   size: 'md' },
    { en: 'You are a very kind person.',                cn: '你是个善良的人',     size: 'md' },
    { en: 'I am very touched by your help.',            cn: '你的帮助让我很感动', size: 'md' },
    { en: 'Please come in and have some tea.',          cn: '请进来喝杯茶',       size: 'md' },
    { en: 'Australia is a beautiful country.',          cn: '澳大利亚是一个美丽的国家', size: 'lg' },
    { en: 'The air here is very fresh.',                cn: '这里的空气特别好',   size: 'md' },
    { en: 'I enjoy the blue sky and sunshine here.',    cn: '我很喜欢这里的蓝天和阳光', size: 'lg' },
    { en: 'People here are very kind.',                 cn: '这里的人都很友善',   size: 'md' },
  ];

  /* --y per size tier — how far the label sits below its row's own top,
     same for every row of that height (see phrase-library.css). */
  var LABEL_Y = { sm: 18, md: 16, lg: 14 };
  var CHEVRON = { sm: { y: 32, s: 36 }, md: { y: 45, s: 33.744 }, lg: { y: 59, s: 33.744 } };

  /* User-typed phrases don't come with a designer-picked row height —
     approximate the same short/medium/long tiers Figma used from the
     English text's length. Good enough for a click-through prototype;
     exact pixel wrapping isn't load-bearing here. */
  function pickSize(en) {
    if (en.length <= 25) return 'sm';
    if (en.length <= 42) return 'md';
    return 'lg';
  }

  function loadSaved() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  /* If add-phrase.js couldn't write to localStorage (Firefox disables it
     for file:// pages), the new phrase arrives as a ?new= URL parameter
     instead — same handoff contacts.js already does for add-contact.html. */
  function takePendingFromUrl() {
    var raw = new URLSearchParams(window.location.search).get('new');
    if (!raw) return null;
    try {
      var phrase = JSON.parse(raw);
      return phrase && phrase.id && phrase.en ? phrase : null;
    } catch (e) { return null; }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var BG_SRC = {
    sm: '../assets/phrase-row-bg-sm.svg',
    md: '../assets/phrase-row-bg-md.svg',
    lg: '../assets/phrase-row-bg-lg.svg',
  };

  function rowHtml(phrase) {
    var size = phrase.size || pickSize(phrase.en);
    var chevron = CHEVRON[size];
    return (
      '<button class="phraserow phraserow--' + size + '" type="button">' +
        '<img class="phraserow__bg" src="' + BG_SRC[size] + '" alt="">' +
        '<span class="phraserow__label" style="--y:' + LABEL_Y[size] + 'px">' +
          '<span class="t-en">' + escapeHtml(phrase.en) + '</span>' +
          '<span class="t-cn">' + escapeHtml(phrase.cn) + '</span>' +
        '</span>' +
        '<span class="chevron" style="--x:302px;--y:' + chevron.y + 'px;--s:' + chevron.s + 'px">' +
          '<img src="../assets/icon-chevron.svg" alt="">' +
        '</span>' +
      '</button>'
    );
  }

  var saved = loadSaved();

  var pending = takePendingFromUrl();
  if (pending && !saved.some(function (p) { return p.id === pending.id; })) {
    saved.push(pending);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (e) { /* still render it below either way */ }
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  var list = document.getElementById('phraseList');
  list.innerHTML = SEED_PHRASES.map(rowHtml).join('') + saved.map(rowHtml).join('');
}());
