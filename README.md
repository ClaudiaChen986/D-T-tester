# 归途 GuiTu — screens

Nine screens from the Figma file
[`prototype-5`](https://www.figma.com/design/xeQNx3M5eHj129RIIwGdQO/prototype-5),
wired together into one click-through prototype. Open `index.html` in a
browser — no build step, no dependencies.

```
index.html                "Choose your language" (node 1:5) — the true entry
                           point, kept at the root so opening the project
                           always means this; every session starts here

pages/
  home.html                Home screen (node 2:40) — what index.html used to
                            be before the language screen became the entry
                            point; every language button leads here
  calling.html              "Calling…" (node 7:365 / 7:438) — one template
                             for every contact's call button across the app,
                             including Emergency
  profile.html              "Your profile" view (node 2:544) — Home's Profile
                             button leads here; shows the fields saved below
  edit-profile.html         "Your profile (edit)" (node 2:552) — step 1 of
                             editing: personal-info fields, Save hands off
                             to edit-contacts.html for step 2
  edit-contacts.html       "Your profile" reorder screen (node 2:688) — step
                            2 (final): emergency-contact order, Save returns
                            to profile.html
  contacts.html            "My Contact" list (node 7:1121) — real scrolling page
  add-contact.html         "Adding contact" form (node 120:408)
  other.html               "Other" menu (node 142:824) — Home's Other tile
                            leads here
  todays-events.html       "What's on today?" (node 7:1322, "Suggestion -
                            homepage") — real scrolling page, like
                            contacts.html; six seniors-resource cards and a
                            "More" button out to a real external site
  senior-events.html       "Senior event" (node 81:358) — todays-events.html's
                            Seniors events card leads here; real scrolling
                            page, two event cards with live-sourced dates
  event-location.html      Routed Google Maps view for a senior event's
                            venue — reads ?name=&address= off the link that
                            sent it here
  journal.html              "My Journal" (node 19:1577) — Other's My
                             Journal tile leads here; real scrolling page,
                             seeded with Figma's three sample entries plus
                             anything saved from add-journal.html
  add-journal.html          "Adding journal" (node 19:1534) — journal.html's
                             Add button leads here; title + body form, Save
                             writes a new entry and returns to journal.html
  calendar.html              "My Calendar" (node 56:218, "my calendar -
                              both") — Other's My Calendar tile leads here;
                              real scrolling page, a 3-day / 0:00-24:00
                              timeline plus a scrollable "today's events"
                              list, both empty until add-event.html adds
                              something
  add-event.html             "Adding event" (node 19:1501, "add task -
                              both") — calendar.html's Add button (or its
                              "plan tomorrow" button) leads here; icon
                              picker + title + date/time/duration form.
                              Step 1 of 2 — Save hands off to
                              add-event-continue.html rather than writing
                              the event itself
  add-event-continue.html    "Adding event (continue)" (node 19:1547, "add
                              task （continue） - both") — add-event.html's
                              Save leads here; step 1's title/icon/date/
                              time land read-only in the round shape and
                              text next to it, plus Repeat and an optional
                              sub-task. This Save is what actually writes
                              the event and returns to calendar.html

css/
  styles.css               shared tokens/reset, .stage/.screen scaling,
                            header/return/wordmark/crop helpers — every page
  soundwave.css             listening state: scrim + animated soundwave (home)
  language.css              index.html's own layout
  calling.css                calling.html's own layout
  profile.css                profile.html's own layout
  edit-profile.css           edit-profile.html's own layout
  edit.css                  edit-contacts.html's own layout
  contacts.css              contacts.html's own layout
  add-contact.css           add-contact.html's own layout
  other.css                 other.html's own layout
  todays-events.css          todays-events.html's own layout
  senior-events.css          senior-events.html's own layout
  event-location.css         event-location.html's own layout
  journal.css                journal.html's own layout
  add-journal.css            add-journal.html's own layout
  calendar.css                calendar.html's own layout
  add-event.css                add-event.html's own layout
  add-event-continue.css       add-event-continue.html's own layout

js/
  language.js               index.html: viewport fit, remembers the chosen
                             language (localStorage + ?lang= on the link)
  app.js                    pages/home.html: viewport fit, press-to-speak, slide-up
  calling.js                  calling.html: reads which contact was tapped,
                               Speaker/Mute/Location toggles, hang up
  profile.js                  profile.html: renders saved (or seed) profile fields
  edit-profile.js             edit-profile.html: prefill, validation, save + handoff
  edit.js                   edit-contacts.html: drag-to-reorder + save/persist
  contacts.js               contacts.html: renders seed + saved contacts
  add-contact.js            add-contact.html: photo picker, validation, save
  other.js                  other.html: viewport fit only
  event-location.js         event-location.html: viewport fit, reads
                             ?name=&address=, live routed Google Maps embed
  journal.js                 journal.html: seeds + saved-entry rendering,
                              CJK/Latin script-run splitting per entry
  add-journal.js              add-journal.html: validation, save, handoff
  calendar.js                  calendar.html: renders the timeline + today's
                                events list from localStorage, tick-box save
  add-event.js                 add-event.html: icon picker, date/time/
                                duration defaults, validation; Save hands
                                off a draft, doesn't write the event
  add-event-continue.js        add-event-continue.html: fills the summary
                                from the handed-off draft, Repeat chips,
                                sub-task toggle, and the real save

assets/                    PNGs/SVGs exported from Figma, shared by every page
```

`index.html` stays at the root; everything under `pages/` (now including
`home.html`) reaches it and the shared `assets/`/`css/`/`js/` with `../`.
Pages within `pages/` link to each other by bare filename
(`contacts.html` → `add-contact.html`) since they're siblings.

Every page beyond the language screen reuses `css/styles.css` for the shared
`:root` tokens and the `.stage`/`.screen` scaling, plus four helpers
three-or-more pages need: `.crop` (sprite-sheet cropping), `.wordmark`/
`.wordmark--return` (the rotated "返回 return" glyphs), `.return` (the
circular back button), and `.header-title-centered` (the centered white
bilingual title under it). Only each page's own layout lives in its own CSS
file under `css/`.

**Navigation wired between the pages:**
- `index.html`'s three language options each link to `pages/home.html`,
  carrying the choice as `?lang=cn|both|en` and in `localStorage` under
  `guitu.lang` — nothing branches on it yet (per-language content for the
  rest of the app is a later phase), but the choice is captured now so that
  phase doesn't also have to touch this screen.
- Home's *Contacts* tile → `contacts.html`. (Home's *Calls* pill still opens
  the quick-access slide-up card — that's a different, faster path to the
  same three emergency contacts, not a duplicate of the full list.)
- Home's *Profile* button (in the slide-up card) → `profile.html`. Its edit
  pencil → `edit-profile.html` (step 1: personal-info fields) → Save →
  `edit-contacts.html` (step 2: emergency-contact order) → Save →
  `profile.html`, now showing everything just entered.
- `contacts.html`'s **+ Add** card (one at the end of each group) →
  `add-contact.html`.
- `add-contact.html`'s **Save** button validates, writes the new contact to
  `localStorage`, and returns to `contacts.html`, where it now appears.
- Both new pages' return arrows go back to where navigating to them makes
  sense (`contacts.html` for add-contact's cancel arrow, `home.html` for
  contacts' arrow and its "Back to homepage" bar).
- Home's *Other* tile → `other.html`. Its *Today's new events* card →
  `todays-events.html`; same as Home's still-unbuilt Translation/Navigation
  tiles, nothing else on this menu is inert anymore. Other's own return
  arrow and "Back to homepage" bar both go to `home.html`.
- `todays-events.html`'s sticky **More** button opens
  <https://www.krg.nsw.gov.au/Community/Seniors> in a new tab — a real
  external link, not a placeholder. Its return arrow goes back to
  `other.html`; its "Back to homepage" bar goes to `home.html`. Its
  **Seniors events** card → `senior-events.html`.
- `senior-events.html`'s own sticky **More** button opens the more specific
  <https://www.krg.nsw.gov.au/Community/Seniors/Seniors-events> listing page
  (distinct from `todays-events.html`'s More, which points one level up).
  Each event's **Location** sub-card → `event-location.html`, carrying the
  venue as `?name=&address=` on the link. Its return arrow goes back to
  `todays-events.html`; its "Back to homepage" bar goes to `home.html`.
- `event-location.html` shows a live routed Google Maps embed to whatever
  venue it was sent (falling back to a destination-only pin if geolocation
  is denied/unavailable — same posture as every map on this project). Its
  return arrow goes back to `senior-events.html`; its "Back to homepage" bar
  goes to `home.html`.
- Other's *My Journal* tile → `journal.html`. Its **Add** button →
  `add-journal.html`; Save there validates, writes the new entry to
  `localStorage`, and returns to `journal.html`, where it now appears ahead
  of every other entry. `add-journal.html`'s return arrow (cancel) goes back
  to `journal.html`; `journal.html`'s own return arrow and "Back to
  homepage" bar go to `other.html` and `home.html` respectively.
- Other's *My Calendar* tile → `calendar.html`. Its **Add** pill and the
  today panel's **plan tomorrow** button both → `add-event.html` (the
  latter with `?day=1`, pre-selecting tomorrow's date). That page's Save
  validates step 1 (title/icon/date/time/duration) and hands off to
  `add-event-continue.html` (step 2: Repeat + optional sub-task) rather
  than writing anything yet; *that* page's own Save is what writes the
  finished event to `localStorage` and returns to `calendar.html`, where
  it now appears on the timeline and, if it's today's, in the today panel
  too. `add-event.html`'s return arrow (cancel) goes back to
  `calendar.html`; `add-event-continue.html`'s return arrow goes back to
  `add-event.html`; `calendar.html`'s own return arrow goes to
  `other.html`, and its nav row's home-logo link goes to `home.html`.

## "Choose your language" — the real entry point

`index.html` implements node `1:5`: three bilingual-label buttons (只有中文 /
English & Chinese 中英双语 / Only English), each cropping the same
`icon-language.png` sprite (English glyph / Chinese glyph / both, in Figma's
white-outline row — the sheet also ships a dark-outline row that isn't used
by this node) at a different column.

The header here is a taller variant of the shared curved header shape —
390×276 versus 209.144px on every other screen, same gradient, scaled up in
Figma to leave room for the title sitting *below* the logo instead of beside
it. Reusing `header.svg` and stretching it with CSS would have distorted the
curve rather than resized it (fixed `viewBox`, `preserveAspectRatio="none"`),
so it's its own asset, `header-lang.svg`. The background texture and the
logo medallion, by contrast, *are* pixel-identical to the assets other pages
already use (`background-texture.png`, `logo-sprite.png`) — confirmed by
comparing exported bytes — so those are reused outright rather than
re-exported.

The three button backgrounds came out of Figma as the same abutting-path
seam issue described below for `tile-bg.svg`/`contact-row.svg`/`sheet-bg.svg`
(small corner patches separate from the main fill), so `lang-button-bg.svg`
merges them into one `<path>` the same way, and all three buttons reuse that
one asset.

## "Your profile" — a two-step edit flow across three screens

Three Figma nodes, two different concepts easy to conflate since both are
titled "Your profile" in Figma: `profile.html` (node 2:544) and
`edit-profile.html` (node 2:552) are about **your own** contact details
(email/address/phone/birthday); `edit-contacts.html` (node 2:688, built
earlier) is about **reordering your emergency contacts**. Editing either now
lives behind the same "edit profile" action — Home's *Profile* button lands
on the read-only view (`profile.html`), its edit pencil starts a two-step
form (personal-info fields, then contact order), and completing either step
returns to the view with everything just entered.

Both new pages turned out to reuse almost every piece of shared chrome
byte-for-byte — `header.svg`, `return-button.png`, `background-texture.png`,
`bottomnav-bg.svg`, `logo-sprite.png`'s medallion crop, and `avatar-xl.svg`
all matched what other pages already ship (confirmed by comparing exported
bytes), so only what's genuinely new got added: `icon-field-backdrop.png`
(the hand-drawn red ring behind each field icon — one asset, cropped the
same way on every row since it's wider than it is tall), the four field
glyphs (`icon-mail.svg`, `icon-home-field.svg`, `icon-phone-field.svg`,
`icon-calendar.svg`), `icon-edit-pencil.svg` plus its `edit-ellipse.svg`
backdrop, and the two pages' dashed separator lines (`profile-lines.svg`,
`edit-profile-lines.svg` — different widths, one narrower card vs. one
full-bleed panel, so not the same asset).

`edit-profile.html` prefills its inputs from whatever's already saved
(`guitu.profile` in `localStorage`) rather than starting blank — Figma's own
mockup shows the empty/placeholder state, which is really just the
first-ever-visit case here; editing your own saved details starting from
blank fields every time would mean retyping everything to change one. First
visit (nothing saved yet) has `profile.html` fall back to Figma's own sample
values (`User.123@example.com` etc.) instead of showing an empty card, the
same seed-data reasoning `contacts.html` already uses for Family/Friends.

## "Calling…" — one template for every call

`calling.html` implements node `7:365` (a regular contact) and `7:438`
(Emergency) as a single page, since the two differ only in what's shown —
name/avatar vs. "Emergency service 紧急联络"/a warning-triangle icon, both
driven by the same `guitu.callTarget` handoff — not in layout. Every call
button across the app (`home.html`'s slide-up card rows, `contacts.html`'s
cards) now points here instead of a bare `tel:` link: the tapped contact
(name, phone, photo if it has one) is written to `sessionStorage` right
before the browser follows the link, and this page reads it back on load.
A saved contact's photo can be a sizeable data URL — too unwieldy to
round-trip through an HTML attribute on every card — so `contacts.js`
instead keeps the real contact objects in memory and has each call link
carry only an index into that list; a click handler resolves the actual
contact from it at the moment of navigation instead of ahead of time.

Speaker, Mute, and Location are plain on/off toggles (icon swap + a
red/cream background swap, both taken directly from Figma's own two states
for each button — see node `7:470`, a 9-variant component covering all
three toggle combinations) with no real audio routing, microphone, or
location sharing behind them — consistent with the rest of this
prototype's "the interaction is real, the backend isn't" posture. Hung up
ends the call via `history.back()`, returning to wherever the call was
placed from, since it can legitimately be either `home.html` or
`contacts.html`. This is also the one screen in the whole app with no
`.return` arrow at all — there's deliberately no way out except hanging up,
matching a real in-call screen.

The cream button panel is draggable: Figma's own layer tree names it
"Slide up card" and it's a literal instance of the *same* component
`home.html`'s slide-up card uses (confirmed via `get_metadata` — same
handle, same base frame), so it drags the same way too — dragged down past
a quarter of its travel, it *stays* down (a real collapsed/expanded
toggle, `js/calling.js`, not a spring-back), exposing the keypad
underneath and leaving the handle strip poking up above the bottom edge
to drag (or tap) back up by. The keypad's keys are real, clickable
buttons once revealed — kept out of the tab order via `tabindex`/
`aria-hidden` while the panel still covers them, toggled alongside the
panel's own state — though still no DTMF or typed-digits display behind
them, same as Location/Speaker having no real audio routing or location
sharing. Hung up rides along with the panel: while it's parked down
showing the keypad, dragging (or tapping the handle) back up is the way
to reach it again. Same deferred pointer-capture trick as the home sheet
(capture only engages once real movement crosses a threshold) so a plain
tap on Speaker/Mute/Location/Hung up — all of them descendants of the
same draggable panel — keeps working untouched.

Every contact's call button is a working link to this page, including
ones with no phone number on file anywhere in this prototype (both
Grandsons, every seed Friend) — this is a click-through prototype, so
there's nothing a phone number unlocks that calling.js needs (it never
reads one). Earlier these rendered as a disabled, dimmed `<span>` instead
of an `<a>`; that state is gone now, along with the CSS that styled it.

Nearly every supporting asset here turned out to already exist elsewhere in
the app — the background texture, and (surprisingly) even the hangup
button's hand-drawn ring backdrop, which is pixel-identical to
`icon-field-backdrop.png` from the profile pages, reused outright rather
than re-exported. The Speaker/Mute icons' "on" (white) variants aren't
separate Figma exports either: comparing the "off" and "on" SVGs Figma *did*
export for Location showed they're the exact same path data, just
recolored, so the other two buttons' "on" states were derived the same way
(swap `#37848C` for `white`) instead of two more round-trips to fetch
assets that would have come back identical anyway.

## "Other" — a second three-card menu, one Figma layout reused

`other.html` (node 142:824) is structurally the same menu Translation's
Figma node uses — same scalloped card shape, same round badge artwork, same
chevron and bottom-bar geometry — just with three different cards (Today's
new events, My Calendar, My Journal — all three now lead somewhere, see
below). Header, return
button, background texture, and
bottom bar are all pixel-identical assets to what every other return-button
page already ships (confirmed by comparing exported bytes), so the only
genuinely new assets are the card background/badge (re-exported under this
page's own name rather than assumed to match a previous export byte-for-
byte) and the three glyphs on top of the badge — which Figma exports in the
app's cream `#EDD8B4` here, not the white used elsewhere, so that's kept
as designed rather than normalized. (The calendar glyph looked like it
might already exist as `icon-calendar.svg` from the profile pages — same
icon, confirmed by comparing path data — but that copy is white and sized
for a different backdrop, so this page re-exports its own cream version
instead of recoloring a shared asset two other pages still depend on.)

This header also carries a subtitle Translation/Navigation don't ("Find
your activity today! 来寻找你喜欢的活动吧!"), wider than
`.header__welcome`'s default box — widened and forced to `nowrap` in
`other.css` the same way `contacts.css` widens `.header__title` for its
own longer title, rather than letting it wrap mid-phrase.

## "What's on today?" — a real link out, to a real government site

`todays-events.html` (node 7:1322, "Suggestion - homepage") is Other's
*Today's new events* card, and — like `contacts.html`/`phrase-library.html`
— a real scrolling page: six seniors-resource cards is genuine page-length
content, not something a fixed 390×844 mock scaled as one unit can hold.
Header, return button, bottom bar, and the regular-height card shape are
all pixel-identical assets to what other pages already ship (the card
background in particular is byte-identical to `other-card-bg.svg`,
confirmed by comparing exported path data — not assumed just because it
looks the same); the only genuinely new asset is the taller variant for
the one card with a description line under its title
(`today-card-bg-lg.svg`). Both language lines are bold here (`font-weight:
700` on English *and* Chinese), unlike Translation/Other's cards where
only English is — kept as Figma exports it rather than normalized to
match a different page's convention.

The header's sticky **More** button (same persistent-button-in-a-sticky-
header pattern as `phrase-library.html`'s Add) is a real link to
<https://www.krg.nsw.gov.au/Community/Seniors> (`target="_blank"
rel="noopener noreferrer"`) — the Ku-ring-gai Council's actual seniors
page, not a placeholder, since a link needs nothing this prototype can't
already do. Only the **Seniors events** card has a destination screen yet
(`senior-events.html`, below); the other five stay inert `<button>`s, same
posture as every other not-yet-designed destination in the app.

## "Senior event" — real dates pulled from the council's own events page

`senior-events.html` (node 81:358) is `todays-events.html`'s *Seniors
events* card, and — like every other multi-item list in this app — a real
scrolling page rather than a fixed 390×844 mock. Figma's own two event
cards (Nutrition and Health workshop, Chair yoga) turned out to be plain
CSS rounded rectangles, not the scalloped-ticket SVG shape every other
card list in this app uses (confirmed in the returned JSX: `bg-[#edd8b4]
... rounded-[30px]` on a bare `<div>`, no `<img>`) — a first for this
project, so `senior-events.css` positions everything with plain
`border-radius`/background-color instead of a card-background asset.
Photos, header, return button, and bottom bar are the only image assets
this page needs, and all but the two event photos already existed
byte-for-byte elsewhere in the app.

The "When" sub-card's date and time are **not** Figma's placeholder
sample text — they're the real next-occurrence date for each event, read
directly off the council's live events page,
<https://www.krg.nsw.gov.au/Community/Seniors/Seniors-events> (plus each
event's own detail page for the exact time, which isn't shown on the
listing itself). That site returns HTTP 403 to plain HTTP clients
(`curl`, this project's usual `WebFetch`) — bot-detection that a real
browser clears — so fetching it took a headless browser rather than a
simple request. This is necessarily a **snapshot taken at implementation
time**, not a live feed: a static, no-build prototype with no server has
nowhere to run a fetch against a site with no CORS headers, so the dates
will drift out of date the same way any hand-typed copy would. Treat them
as "accurate as of when this page was built," not as continuously
current.

Each event's **Location** sub-card is a real link to `event-location.html`,
carrying the venue's name and address as `?name=&address=` query-string
params rather than through `localStorage`/`sessionStorage` — the payload
is short, one-shot text with nothing to persist across visits, unlike a
saved contact or profile photo, so the simplest handoff that works is a
plain URL. `event-location.html` reuses the same routed-map pattern this
prototype already established elsewhere (destination-only pin loads
immediately; upgraded to full directions if geolocation succeeds within
8s) via the same keyless `maps.google.com/maps?...&output=embed` endpoint
— no API key, no billing. Its title bar switches from this app's usual
*centered* title (`.header-title-centered`, sized to short, known-length
titles like "Add phrase") to the *right-aligned* `.header__title` instead,
widened and set smaller than its default — a centered box sized to
content (`width: max-content`) works for short fixed strings, but an
event name is arbitrary, caller-supplied text that can run long enough to
span the whole screen and sit on top of the return button; a bounded,
right-aligned box wraps within itself instead of growing into it.

## "My Journal" — real entries, sized to whatever's actually written

`journal.html` (node 19:1577, "My journal - both") is Other's *My Journal*
tile, and — like every other open-ended list in this app — a real
scrolling page. Header, return button, and bottom bar are all
pixel-identical assets to what other pages already ship (confirmed by
comparing exported bytes); the only genuinely new asset is the entry card
shape itself, `journal-card-bg.svg` (Figma calls it "Union") — a scalloped
cream card distinct from the ticket shape `today-card-bg-lg.svg`/
`other-card-bg.svg` use elsewhere, so it isn't a reuse of either.

Figma's three sample entries are all sized to a fixed 365px-tall card,
eyeballed per sample. A real journal entry is arbitrary, user-typed text
with no predictable length, so — the same lesson `event-location.html`'s
title bar just taught above, applied to a list this time instead of a
header — the card sizes to its own content (padding, not a fixed height)
rather than risking overflow or an oddly empty box. The three Figma
samples are seeded as-is (`js/journal.js`) and always render last; entries
saved from `add-journal.html` are read from `localStorage`
(`guitu.journal`) and rendered *ahead* of them, newest first — the order
an actual journal reads in — since `add-journal.js` is the one that
`unshift`s a new entry onto the stored array rather than appending.

Figma's own "学习新单词" sample switches font mid-sentence — Chinese prose
quoting two English phrases in Inria Serif rather than Noto Serif SC.
Reproducing that for genuinely-typed entries (where nothing about the
split is known ahead of time) means detecting it at render time: each
entry's title and body are split into runs of CJK vs. non-CJK characters
and each run gets its own font span, the same script-detection idea
`contacts.js` already uses to pick a saved contact name's font
(`CJK_RE`/`nameFontClass` there; `journal.js` reuses the same character
ranges for its own `richTextHtml`). The three seed entries render through
this same function rather than hand-placed spans, since it reproduces
Figma's own mixed-script rendering anyway.

`add-journal.html` (node 19:1534, "add task - both") reuses
add-contact.html's established shape for a form screen — a teal band
under the header, a cream/gray fill below it, a pinned Save pill at the
bottom — with this node's own pixel offsets and just two fields: a bold
title input sitting directly in the teal band (styled to match Figma's
bold placeholder text, underlined the same way add-contact.css's Name
field is, via `border-bottom` rather than a separate line asset) and a
body textarea filling the rest of the panel. Only the body is required to
save — an entry with a title but nothing written in it isn't a journal
entry — matching the "one required field, the rest optional" posture
add-contact.js already established for Name. Save falls back to handing
the new entry to `journal.html` via a URL parameter if `localStorage`
throws (the same file://-Firefox contingency add-contact.js already
guards against), so Save never silently does nothing.

## "My Calendar" — a 3-day timeline that starts empty

`calendar.html` (node 56:218, "my calendar - both") is Other's *My
Calendar* tile, and — like `todays-events.html`/`journal.html` — a real
scrolling page: a 0:00–24:00 timeline across three day-columns plus a
scrollable events list is genuine page-length content, not something a
fixed 390×844 mock scaled as one unit can hold. Figma's own mockup ships
the timeline pre-populated with sample events (a whole day planned out);
this build deliberately does **not** seed any of that — a fresh visit
shows only the hour axis and its guide line, three empty lanes underneath
(`today`/`Tomorrow`/`2 Days`), and an empty today panel, since nothing has
actually been scheduled yet. Events only appear once added through
`add-event.html`, read back out of `localStorage`
(`guitu.calendarEvents`) by `js/calendar.js`.

Header, return button, and the "Add" pill's icon are all reused
byte-for-byte from existing assets (`header.svg`, `return-button.png`,
and — confirmed by comparing Figma's own crop percentages against
`add-icon.png`'s existing crop in `journal.html` — the same add-icon
sprite, just cropped identically), so nothing new needed exporting for
this screen. The bottom nav (Calls / a home-logo / Profile) reuses the
same three-pill arrangement Figma's own "Slide up card" component ships
elsewhere in this file (see `calling.html`'s notes on that component)
but, unlike `home.html`'s version, isn't draggable here — on a page this
tall, a fixed 844px sheet that slides over the timeline doesn't apply;
it's simply the page's own in-flow navigation row, same posture as every
other page's bottom bar.

**Each pill's colour is a live progress indicator**, not a fixed
category colour: for *today's* lane only, `js/calendar.js` compares the
event's start/end against the real clock — a pill entirely in the past
renders fully teal, one entirely in the future stays the plain unfilled
cream track, and one straddling *now* renders a soft gradient split at
however far through it the clock has gotten. Tomorrow/2-days pills always
render as plain track, since "how much has elapsed" isn't a meaningful
question for a day that hasn't started. A dashed "now" line marks the
live time on today's lane specifically, for the same reason. The today
panel below mirrors this — each row's icon badge turns red while its
event is the one currently in progress — and adds the one piece of
real interactivity Figma's mock doesn't show any state for: a tickable
checkbox per event (`role="checkbox"`, toggled on click), persisted back
into the same stored event and rendered with a struck-through title once
checked.

`add-event.html` (node 19:1501, "add task - both") is reached from either
of `calendar.html`'s two entry points — the header's **Add** pill (which
defaults the date to today) and the today panel's **plan tomorrow**
button (which arrives with `?day=1`, pre-selecting tomorrow) — and, like
those other two pages, is a real scrolling page rather than a fixed
stage: the icon-selection bar and the fields beneath it are more content
than one screen reliably holds once the bar is open, so the page needs to
be able to grow and scroll instead of clipping it.

The round shape at the top of the teal band — Figma's placeholder circle
— is a real clickable icon picker here: tapping it reveals a horizontal,
scrollable strip of common Material Symbols (the
[fonts.google.com/icons](https://fonts.google.com/icons) library, loaded
as the `Material Symbols Outlined` webfont alongside the existing Inria
Serif/Noto Serif SC fonts) — walking, meals, socialising, home tasks,
sleep, medication, shopping, exercise, work, health, reading, and
celebrations — and picking one both closes the strip and renders that
glyph inside the circle, which is also what shows up as the event's icon
back on `calendar.html`'s pills and list rows. Figma's own "Date and Time
- Wheels" component (an iOS-style scroll picker, per its own linked Apple
HIG docs) is approximated here with native `<input type="date">` /
`<input type="time">` fields, styled to match the app's pill language
rather than reproduced as a custom wheel widget — the same kind of
native-control simplification this app already makes elsewhere. Duration
keeps Figma's own preset-chip design (5/10/15/30 min, 1h/2h/3h) as plain
selectable buttons.

This is step 1 of 2 — Figma's own next node in the flow, `19:1547` ("add
task （continue） - both"), is a second screen, not this one finishing.
Save here validates that a title, date, and time are all set, then hands
everything off as a `sessionStorage` draft (`guitu.addEventDraft`) and
moves on to `add-event-continue.html`, rather than writing anything to
the real calendar yet — `sessionStorage`, not `localStorage`, for the
same reason `js/app.js` uses it for `guitu.callTarget`: it's scoped to
this one handoff, so abandoning the flow on step 2 (closing the tab,
navigating away) doesn't leave a half-finished event sitting in
`guitu.calendarEvents`.

`add-event-continue.html` reads that draft back out on load — if it's
missing (a direct visit, or a refresh after the draft was already
cleared) it bounces straight back to `add-event.html` rather than
rendering an empty summary. Figma's mock shows the round shape and the
"Enter text here" line next to it as placeholder text; here they're
filled in for real, from the draft: the icon picked on step 1 renders
inside the (taller, pill-shaped) white shape, the title sits where the
placeholder was, and the date/time render as formatted bilingual text
(`Jun 5 （6月5日）, 2023` / `8:00 pm （下午）`) built from the picked
values rather than Figma's own hardcoded sample. Repeat is a single-select
grid of six chips (Figma's own set — No repetition/Daily/Weekly/Every
fortnight/Monthly/Yearly), defaulting to "No repetition" same as the
mock. The "add sub-task" checkbox gates its textarea's `disabled` state
— per Figma's Material checkbox component, unticked by default, so the
field starts inert until opted into. This page's own Save is what
finally writes `{ title, icon, day, start, duration, done, repeat,
subtask? }` to `guitu.calendarEvents`, clears the draft, and returns to
`calendar.html`.
