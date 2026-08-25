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

  /* contacts-en.html/contacts-cn.html reuse this file verbatim (see
     lang-en.css/lang-cn.css) — route every link this file builds through
     here so a single-language track's Call and Add-contact cards stay on
     it instead of dropping back into the bilingual pages. */
  var LANG = document.body.dataset.variant || '';
  function langPath(path) {
    return LANG ? path.replace(/\.html$/, '-' + LANG + '.html') : path;
  }

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

  /* Calls hand off to calling.html the same way home.html's rows do (see
     js/app.js) — except a saved contact's photo can be a sizeable data
     URL, too unwieldy to round-trip through an HTML attribute, so instead
     of stashing the target directly on the link, the link just carries an
     index into this in-memory list and a delegated click handler (below)
     looks the real contact up out of it right before the browser follows
     the href. Every card gets a working call button, even seed contacts
     with no phone on file (Grandsons, every Friend) — this is a
     prototype, so there's nothing a phone number unlocks that calling.js
     needs (it never reads it). */
  var CALL_TARGETS = [];

  function callButtonHtml(contact) {
    var icon = '<img src="../assets/icon-call-white.svg" alt="">';
    var index = CALL_TARGETS.push(contact) - 1;
    return '<a class="card__call" href="' + langPath('calling.html') + '" data-call-index="' + index + '" ' +
           'aria-label="Call ' + escapeHtml(contact.name) + '">' + icon + '</a>';
  }

  /* Only a saved contact (one with an `id`) can be edited or deleted —
     the seed Family/Friends above are hardcoded, not localStorage
     records, so there's nothing to update or remove them from. Their
     controls only ever render once a group's own manage toggle below
     has switched that grid into "is-managing". */
  function manageControlsHtml(contact) {
    if (!contact.id) return '';
    return (
      '<div class="card__manage">' +
        '<button type="button" class="card__managebtn card__managebtn--edit" data-edit-id="' + contact.id + '" ' +
           'aria-label="Edit ' + escapeHtml(contact.name) + '">' +
          '<img src="../assets/icon-edit.svg" alt="">' +
        '</button>' +
        '<button type="button" class="card__managebtn card__managebtn--delete" data-delete-id="' + contact.id + '" ' +
           'aria-label="Delete ' + escapeHtml(contact.name) + '">' +
          '<span aria-hidden="true">&times;</span>' +
        '</button>' +
      '</div>'
    );
  }

  function cardHtml(contact) {
    /* contact.name is a single free-typed field, not a real en/cn
       translation pair — nameFontClass just picks it the right font.
       Tag it `.savedname` so lang-en.css/lang-cn.css can force it
       visible regardless of which of .t-en/.t-cn it lands on; otherwise
       the single-language tracks' blanket hide rule would blank a saved
       contact whose name happens to be in the "wrong" language. */
    var nameLines = '<span class="savedname ' + nameFontClass(contact.name) + '">' + escapeHtml(contact.name) + '</span>';
    if (contact.cn) nameLines += '<span class="t-cn">' + escapeHtml(contact.cn) + '</span>';
    return (
      '<div class="card">' +
        '<div class="card__top">' +
          '<div class="card__avatar">' + avatarHtml(contact) + '</div>' +
          callButtonHtml(contact) +
        '</div>' +
        '<p class="card__name">' + nameLines + '</p>' +
        manageControlsHtml(contact) +
      '</div>'
    );
  }

  var ADD_ICON_CROP =
    '<span class="crop" style="--x:0px;--y:0px;--w:87px;--h:87px">' +
      '<img src="../assets/add-icon.png" alt="" ' +
           'style="--iw:408.19px;--ih:283.65px;--ix:-163.27px;--iy:-29.92px">' +
    '</span>';

  function addCardHtml(group) {
    var addLabel = LANG === 'en' ? 'Add contact' : LANG === 'cn' ? '添加联系人' : 'Add contact 添加联系人';
    return (
      '<a class="card card--add" href="' + langPath('add-contact.html') + '?group=' + group + '" ' +
         'aria-label="' + addLabel + '">' +
        ADD_ICON_CROP +
        '<p class="card__name"><span class="t-en">Add</span><span class="t-cn">添加</span></p>' +
      '</a>'
    );
  }

  /* The manage toggle sits right beside "+ Add" in the same grid, styled
     identically (same .card--add shell) so it reads as this section's
     other action rather than a one-off control — flipping it switches
     this one group's own saved cards into showing their edit/delete
     buttons, independent of the other group's toggle. */
  var managing = { family: false, friends: false };

  function manageToggleHtml(group) {
    var isOn = managing[group];
    var enLabel = isOn ? 'Done' : 'Edit';
    var cnLabel = isOn ? '完成' : '编辑';
    return (
      '<button type="button" class="card card--add card--manage' + (isOn ? ' is-active' : '') + '" ' +
         'data-manage-group="' + group + '" aria-pressed="' + String(isOn) + '" ' +
         'aria-label="' + enLabel + ' ' + cnLabel + '">' +
        '<img class="card--manage__icon" src="../assets/icon-edit.svg" alt="">' +
        '<p class="card__name"><span class="t-en">' + enLabel + '</span><span class="t-cn">' + cnLabel + '</span></p>' +
      '</button>'
    );
  }

  function renderGrid(el, seed, group, saved) {
    var extra = saved.filter(function (c) { return c.group === group; });
    el.classList.toggle('is-managing', managing[group]);
    el.innerHTML = seed.map(cardHtml).join('') + extra.map(cardHtml).join('') + addCardHtml(group) + manageToggleHtml(group);
  }

  var familyGrid = document.getElementById('familyGrid');
  var friendsGrid = document.getElementById('friendsGrid');

  function renderAll() {
    CALL_TARGETS.length = 0;
    var saved = loadSaved();
    renderGrid(familyGrid, SEED_FAMILY, 'family', saved);
    renderGrid(friendsGrid, SEED_FRIENDS, 'friends', saved);
  }

  (function foldInPending() {
    var saved = loadSaved();
    var pending = takePendingFromUrl();
    if (!pending) return;
    var existingIndex = saved.findIndex(function (c) { return c.id === pending.id; });
    pending.photo = pending.photo || null;
    if (existingIndex === -1) saved.push(pending); else saved[existingIndex] = pending;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (e) { /* still render it below either way */ }
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }());

  renderAll();

  document.addEventListener('click', function (e) {
    var call = e.target.closest('a[data-call-index]');
    if (call) {
      var contact = CALL_TARGETS[Number(call.dataset.callIndex)];
      if (!contact) return;
      var target = { en: contact.name, cn: contact.cn || '', phone: contact.phone, photo: contact.photo || null, type: 'person' };
      try { sessionStorage.setItem('guitu.callTarget', JSON.stringify(target)); } catch (err) { /* best effort only */ }
      return;
    }

    var manageToggle = e.target.closest('button[data-manage-group]');
    if (manageToggle) {
      var group = manageToggle.dataset.manageGroup;
      managing[group] = !managing[group];
      renderAll();
      return;
    }

    var editBtn = e.target.closest('button[data-edit-id]');
    if (editBtn) {
      window.location.href = langPath('add-contact.html') + '?edit=' + encodeURIComponent(editBtn.dataset.editId);
      return;
    }

    var deleteBtn = e.target.closest('button[data-delete-id]');
    if (deleteBtn) {
      var id = deleteBtn.dataset.deleteId;
      var confirmMsg = LANG === 'cn' ? '删除这个联系人？' : LANG === 'en' ? 'Delete this contact?' : 'Delete this contact? 删除这个联系人？';
      if (!window.confirm(confirmMsg)) return;
      var remaining = loadSaved().filter(function (c) { return c.id !== id; });
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining)); } catch (err) { /* best effort only */ }
      renderAll();
    }
  });
}());
