/* ============================================================================
   归途 GuiTu — "My Contact" list
   ----------------------------------------------------------------------------
   Family and Friends are seeded from the Figma content (kept verbatim,
   including a naming inconsistency Figma itself has: this page's Grandson
   Alex/Harry use different Chinese names than the same two people on the
   reorder screen — see README). Anything saved from add-contact.html is
   read from localStorage and appended after the seed contacts, before the
   trailing "+ Add" card, in whichever group it was saved to — each group's
   own "+ Add" card links to add-contact.html with ?group=family/friends so
   a contact added from Family actually lands back in Family.

   If localStorage was unavailable when the contact was saved (some browsers
   disable it for file:// pages — see add-contact.js), it arrives instead as
   a ?new= URL parameter. That gets folded in below, re-attempted into
   localStorage for next time, and stripped from the URL.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'guitu.contacts';

  var SEED_FAMILY = [
    { name: 'Son (David)',      cn: '儿子（大卫）', phone: '0412345678' },
    { name: 'Daughter (Lily)',  cn: '女儿（莉莉）', phone: '0423456789' },
    { name: 'Grandson (Alex)',  cn: '孙子（强强）', phone: '' },
    { name: 'Grandson (Harry)', cn: '孙子（小睿）', phone: '' },
  ];

  var SEED_FRIENDS = [
    { name: 'Grace',  cn: '小雅' },
    { name: 'Kevin',  cn: '王伟' },
    { name: 'Amy',    cn: '陈倩倩' },
    { name: 'Jason',  cn: '张强' },
    { name: 'Linda',  cn: '黄琳达' },
    { name: 'Sarah',  cn: '杨丽' },
    { name: 'Daniel', cn: '王建国' },
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
      var contact = JSON.parse(raw);
      return contact && contact.id && contact.name ? contact : null;
    } catch (e) { return null; }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Saved contacts only ever get one free-text name field (unlike the seed
     contacts above, which come with hand-split English/Chinese strings) —
     see cardHtml below. A name typed in Chinese still needs the app's
     Chinese serif (--font-cn / Noto Serif SC) or it falls back to whatever
     generic serif the OS ships, not the app's own style. 一-鿿 is
     the main CJK Unified Ideographs block; 㐀-䶿 and 豈-﫿
     cover the rarer extension/compatibility ideographs. */
  var CJK_RE = /[㐀-䶿一-鿿豈-﫿]/;
  function nameFontClass(name) {
    return CJK_RE.test(name) ? 't-cn' : 't-en';
  }

  function avatarHtml(contact) {
    if (contact.photo) return '<img src="' + contact.photo + '" alt="">';
    return '<img src="../assets/avatar-sm.svg" alt="">';
  }

  function callButtonHtml(contact) {
    var icon = '<img src="../assets/icon-call-white.svg" alt="">';
    if (contact.phone) {
      return '<a class="card__call" href="tel:' + escapeHtml(contact.phone) + '" ' +
             'aria-label="Call ' + escapeHtml(contact.name) + '">' + icon + '</a>';
    }
    return '<span class="card__call" aria-hidden="true">' + icon + '</span>';
  }

  function cardHtml(contact) {
    var nameLines = '<span class="' + nameFontClass(contact.name) + '">' + escapeHtml(contact.name) + '</span>';
    if (contact.cn) nameLines += '<span class="t-cn">' + escapeHtml(contact.cn) + '</span>';
    return (
      '<div class="card">' +
        '<div class="card__top">' +
          '<div class="card__avatar">' + avatarHtml(contact) + '</div>' +
          callButtonHtml(contact) +
        '</div>' +
        '<p class="card__name">' + nameLines + '</p>' +
      '</div>'
    );
  }

  var ADD_ICON_CROP =
    '<span class="crop" style="--x:0px;--y:0px;--w:87px;--h:87px">' +
      '<img src="../assets/add-icon.png" alt="" ' +
           'style="--iw:408.19px;--ih:283.65px;--ix:-163.27px;--iy:-29.92px">' +
    '</span>';

  function addCardHtml(group) {
    return (
      '<a class="card card--add" href="add-contact.html?group=' + group + '" ' +
         'aria-label="Add contact 添加联系人">' +
        ADD_ICON_CROP +
        '<p class="card__name"><span class="t-en">Add</span><span class="t-cn">添加</span></p>' +
      '</a>'
    );
  }

  function renderGrid(el, seed, group, saved) {
    var extra = saved.filter(function (c) { return c.group === group; });
    var html = seed.map(cardHtml).join('') + extra.map(cardHtml).join('') + addCardHtml(group);
    el.innerHTML = html;
  }

  var saved = loadSaved();

  var pending = takePendingFromUrl();
  if (pending && !saved.some(function (c) { return c.id === pending.id; })) {
    pending.photo = pending.photo || null;
    saved.push(pending);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (e) { /* still render it below either way */ }
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  renderGrid(document.getElementById('familyGrid'), SEED_FAMILY, 'family', saved);
  renderGrid(document.getElementById('friendsGrid'), SEED_FRIENDS, 'friends', saved);
}());
