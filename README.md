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
  translation.html         "Translation" menu (node 7:705) — Home's Translation
                            tile leads here
  daily-english.html       "Daily English" (node 7:812) — a word-of-the-day
                            card with real, spoken pronunciation
  voice-translation.html   "Voice translation" (node 7:886; listening
                            257:444; swapped 255:1584; swapped+listening
                            257:489) — real (MyMemory API) translation as
                            you type or speak, a direction-swap button, and
                            home.html's press-and-hold listening overlay
  phrase-library.html      "Phrase library" (node 136:1498) — real scrolling
                            page, like contacts.html; sixteen seed phrases +
                            anything saved from add-phrase.html
  add-phrase.html          "Add phrase" — modeled on Figma's "Set destination"
                            (node 120:387) with the map removed and its copy
                            swapped for phrase entry
  show-phrase.html         "Display page" (node 7:928) — flash-card view of
                            one phrase (white/black, not the app's red theme),
                            held up for someone else to read; every phrase
                            row in phrase-library.html, seed or saved, opens
                            its own text here
  navigation.html          "Maps" — Navigation's home (node 7:1284) — Home's
                            Navigation tile leads here; the third row still
                            has no destination screen
  go-home.html              "Go home" (node 120:317) — a live Google Maps
                             route to whatever address is saved on
                             profile.html
  add-destination.html      "Set destination" (node 120:387) — same template
                             add-phrase.html borrows on another branch, but
                             keeps its map, now a live preview of the typed
                             address
  navigate-destination.html "Navigation" (node 120:363) — a live Google Maps
                             route to whatever add-destination.html saved
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
                              both", plus node 56:546 "Slide up card" for
                              the bottom panel) — Other's My Calendar tile
                              leads here; real scrolling page, a 3-day /
                              0:00-24:00 overview timeline plus a
                              scrollable, more detailed timeline just for
                              today, both empty until add-event.html adds
                              something
  add-event.html             "Adding event" (node 19:1501, "add task -
                              both") — calendar.html's Add button (or its
                              "plan tomorrow" button) leads here; every
                              field is real — icon picker, title, Date,
                              a scroll-snap Time roller, and a
                              drag-left-right Duration slider. Step 1 of
                              2 — Save hands off to
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
  translation.css           translation.html's own layout
  daily-english.css         daily-english.html's own layout
  voice-translation.css     voice-translation.html's own layout
  phrase-library.css        phrase-library.html's own layout
  add-phrase.css            add-phrase.html's own layout
  show-phrase.css           show-phrase.html's own layout
  navigation.css             navigation.html's own layout
  go-home.css                go-home.html's own layout
  add-destination.css        add-destination.html's own layout
  navigate-destination.css   navigate-destination.html's own layout
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
  translation.js            translation.html: viewport fit only
  daily-english.js          daily-english.html: viewport fit, speaks the word/
                             sentence aloud via the Web Speech API
  voice-translation.js      voice-translation.html: viewport fit, press-to-speak
                             listening overlay, direction swap, real MyMemory-API
                             translation, speech-to-text where the browser
                             supports it
  phrase-library.js         phrase-library.html: renders seed + saved phrases,
                             each linking to show-phrase.html
  add-phrase.js             add-phrase.html: validation, save + handoff
  show-phrase.js            show-phrase.html: reads the tapped phrase from
                             sessionStorage, falls back to Figma's sample
  navigation.js              navigation.html: viewport fit, share-location
                              toggle, slide-up card drag (same as app.js's),
                              renders the saved-destination row
  go-home.js                 go-home.html: viewport fit, builds the maps
                              embed URL from the saved profile address +
                              (if granted) real geolocation
  add-destination.js         add-destination.html: live address→map preview,
                              validation, save + handoff
  navigate-destination.js    navigate-destination.html: same as go-home.js,
                              routed to the saved destination instead
  other.js                  other.html: viewport fit only
  event-location.js         event-location.html: viewport fit, reads
                             ?name=&address=, live routed Google Maps embed
  journal.js                 journal.html: seeds + saved-entry rendering,
                              CJK/Latin script-run splitting per entry
  add-journal.js              add-journal.html: validation, save, handoff
  calendar.js                  calendar.html: renders the 3-day overview
                                timeline plus today's own detail timeline
                                from localStorage, tick-box save
  add-event.js                 add-event.html: icon picker, real date
                                picker, scroll-snap time roller,
                                drag-range duration, validation; Save
                                hands off a draft, doesn't write the
                                event
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
- Home's *Translation* tile → `translation.html`, all three of whose cards
  now lead somewhere (Daily English, Voice translation, Phrase library);
  its return arrow and "Back to homepage" bar both go to `home.html`.
- Translation's *Daily English* card → `daily-english.html`; its two
  speaker buttons actually speak (Web Speech API), no destination screen
  needed for that. Its return arrow and "Back to homepage" bar both go to
  `translation.html`.
- Translation's *Voice translation* card → `voice-translation.html`. No
  return "Back to homepage" bar on this one — Figma's own node doesn't
  have one — so only its return arrow goes back to `translation.html`.
- Translation's *Phrase library* card → `phrase-library.html`. Its **Add**
  button (in the sticky header) → `add-phrase.html`, whose **Save** button
  validates the English phrase, writes it to `localStorage`, and returns to
  `phrase-library.html`, where it now appears after the sixteen seed
  phrases. Its return arrow goes back to `translation.html`.
- Every row in `phrase-library.html` — seed or saved — → `show-phrase.html`,
  the flash-card display of that one phrase. Its return arrow goes back to
  `phrase-library.html`; its "Back to homepage" bar goes to `home.html`.
- Home's *Navigation* tile → `navigation.html`. Its "Go home" row →
  `go-home.html`. Its second "Set destination" row → `add-destination.html`
  until something's saved, then it shows that destination's name and
  → `navigate-destination.html` instead; the third row is still a plain
  "Set destination" placeholder with no destination screen of its own yet.
  Navigation's own return arrow goes to `home.html`.
- `go-home.html`'s and `navigate-destination.html`'s return arrows both go
  back to `navigation.html`; their "Back to homepage" bars go to `home.html`.
- `add-destination.html`'s **Save** button validates the address, writes
  `{ name, address }` to `localStorage`, and returns to `navigation.html`,
  where the second row now shows it. Its return arrow also goes back to
  `navigation.html`.
- Home's *Other* tile → `other.html`. Its *Today's new events* card →
  `todays-events.html`; nothing else on this menu is inert anymore. Other's
  own return arrow and "Back to homepage" bar both go to `home.html`.
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
  latter with `?day=1`, which still decides the lane the eventual event
  lands in, even though this page's own Date field is currently Figma's
  static "Jun 5, 2023" sample text, not a real field). That page's Save
  validates step 1's title (the only real field right now — see its own
  section below) and hands off to `add-event-continue.html` (step 2:
  Repeat + optional sub-task) rather than writing anything yet; *that*
  page's own Save is what writes the
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

## "Translation" — first of three Home tile menus

`translation.html` (node 7:705) is the first of Home's four tiles to get a
destination screen (Navigation and Other are still the plain, non-navigating
`<button>`s they were before). Header, return button, background texture,
and bottom "Back to homepage" bar are all pixel-identical assets/geometry to
what `profile.html` already uses, so nothing new was exported for those.
What *is* new: `translation-card-bg.svg` (the scalloped ticket shape behind
each of the three menu rows — one asset, reused three times, same seam-bleed
pattern as `tile-bg.svg`), `translation-icon-badge.png` (the round teal
badge, also reused identically all three times — the badge itself never
changes), and one small glyph per row (`translation-icon-book.svg`,
`translation-icon-voice.svg`, `translation-icon-phrase.svg`) laid on top of
that badge — the only thing that actually differs between Daily English,
Voice translation, and Phrase library. Each row's chevron reuses
`icon-chevron.svg` via the same `.chevron` helper the Home tiles use.

## "Daily English" — the one screen with a real, working sound button

`daily-english.html` (node 7:812) is a word-of-the-day card: a translucent
word panel (headword, phonetic spelling, part of speech, definition, a
photo) over a solid sentence panel (one example sentence), each with its
own "play pronunciation" speaker button. Header, return button, background
texture, and bottom bar are the same pixel-identical assets every other
Translation sub-page uses; genuinely new here are the word's illustration
photo, the round red speaker badge (a different hand-drawn artwork than
Translation's teal menu badge — same idea, different color/shape, so kept
as its own asset rather than recolored), and the white volume glyph.
Figma's dashed divider under the headword (node 7:817) is a plain
`border-top: 2px dashed`, cheaper as CSS than round-tripping an SVG for a
single straight dashed line.

The two speaker buttons are the one place in the whole app where a
"the interaction is real, the backend isn't" affordance actually *is*
real: they call the browser's built-in Web Speech API
(`speechSynthesis`/`SpeechSynthesisUtterance` in `js/daily-english.js`) to
read the word or sentence aloud, rather than sitting there decoratively
the way, say, Speaker/Mute/Location do on the calling screen. No backend,
API key, or audio asset needed — every evergreen browser ships this — so
there was no reason to fake it. A brief pulse (`.is-speaking`, plain CSS
`@keyframes`) plays on the badge while speech is in progress so the button
gives feedback instead of looking inert once tapped; browsers without
speech synthesis available just get a quiet no-op.

## "Voice translation" — home.html's press-and-hold, borrowed whole

`voice-translation.html` (node 7:886; listening state node 257:444) reuses
home.html's "Translate/Voice assistant" button — background, mic ring,
badge, mic icon, all pixel-identical assets — just moved to this page's
own position, and its press-and-hold listening overlay (scrim + animated
soundwave) *exactly*: `js/voice-translation.js`'s `startListening`/
`stopListening` pair is app.js's, unchanged, toggling the same
`.screen.is-listening` class `soundwave.css` already animates off of. That
was the one explicit ask here — "the animation of the soundwave is the
same as the one on homepage" — and reusing the actual component instead
of re-implementing it is what guarantees that.

The English/Chinese boxes are real `<textarea>`s, and the translation
between them is real too — [MyMemory](https://mymemory.translated.net)'s
free, keyless translation API, called from `js/voice-translation.js` and
debounced (600ms) so it fires after a pause instead of on every
keystroke. Typing into either box translates into the other; each source
box gets its own debounce timer and request-sequence number, so a fast
typist doesn't fire one request per keystroke and a slow response that's
since been superseded can't clobber the target box with stale text. Where
the browser exposes live speech recognition (`webkitSpeechRecognition` —
Chrome/Edge; not universal, same tier of support as the calendar/location
APIs elsewhere in the platform), holding the mic also transcribes real
speech into the top box — and that transcription feeds the same
translate-on-pause pipeline — while the soundwave plays; unsupported
browsers still get the full press-and-hold animation and can still type.
MyMemory's anonymous tier is rate-limited and occasionally slow to
respond; a translation that fails just leaves the existing text in place
rather than erroring visibly, since it's a nicety layered on top of a
click-through prototype, not something the rest of the page depends on.
Swapping direction cancels any translation still in flight — one scheduled
for the pre-swap language pairing landing after the swap would overwrite
whatever's now in that box with a stale, mismatched result.

**Swap** (node 255:1584, listening: 257:489) turned out to be a direction
toggle, not a text-exchange button: Figma's swapped node shows the top
card's *style* change too — translucent becomes solid and vice versa,
traveling with the language — while the keyboard button stays on the top
physical slot regardless of which language ends up there. So the two
fields are two fixed slots whose label/card-style/placeholder is set by
`js/voice-translation.js` from one `topLang` flag rather than hardcoded
per position, and swapping moves each field's typed text along with its
language (English text stays labeled English after a swap, wherever it
physically lands) instead of leaving it mislabeled in place. Recognition
language follows the same flag, so holding the mic recognizes whichever
language currently sits on top.

Two longer titles on this page ("Voice translation" in the header,
"Translate by voice" on the button) needed the same fix every longer title
elsewhere in the app does — `.header__title`/`.voice__title` were both
sized for shorter Home-screen copy, so without widening the box and
stopping mid-phrase wrapping, the browser breaks the English words
themselves instead of only between the English and Chinese lines.

## "Phrase library" and "Add phrase" — the app's second real scrolling page

`phrase-library.html` (node 136:1498) is a real scrolling page for the same
reason `contacts.html` is one: sixteen phrases is genuine page-length
content, not something a fixed 390×844 mock scaled as one unit can hold.
Figma's own canvas for this node is 2827px tall and repeats the header and
"bottom navigation" bar's coordinates from the fixed-page template partway
down the design — an artifact of reusing that component, not meaningful
position data for a page that actually scrolls — so, like `contacts.html`
already does with its own raw coordinates, this page doesn't try to honor
them literally: the header is sticky (`.phrasehead`, same treatment as
`contacts.css`'s `.chheader`) and the "Back to homepage" bar sits at the
true end of the list, after the sixteenth phrase, not stranded mid-scroll.
The header also carries a persistent **Add** button (Figma's "Group 55")
that stays visible while the list scrolls beneath it.

Row backgrounds come in three heights (100/123/151px, one asset each —
`phrase-row-bg-sm/md/lg.svg`) that Figma hand-picked per phrase to fit its
wrapped line count; the seed phrases keep their designer-assigned height,
and anything typed into `add-phrase.html` picks the closest tier from the
English text's length (`js/phrase-library.js`'s `pickSize`) since a
free-text phrase has no such assignment — close enough for a click-through
prototype where exact pixel wrapping isn't load-bearing. One thing Figma
does differently here than everywhere else in the app: the Chinese line is
**bold** and the English line isn't (every other bilingual pair in the app
is the reverse or matched) — kept as designed rather than normalized.

`add-phrase.html` reuses Figma's "Set destination" node (120:387) — a
teal-label-band-over-grey-fill template `add-contact.html`'s own field
styles don't share — as asked, with two changes: the map image (node
120:403) is gone, since this form has nothing to put on a map, and its
copy is swapped for phrase entry (English phrase / Chinese translation
instead of Place name / Address). Deleting the map leaves the grey panel
with far less content than Figma's own version, so **Save** moves up to
sit right under the second field instead of staying pinned at Figma's
y763 — anchoring it there would just strand it under several hundred
pixels of empty grey space where the map used to be. Its own save flow
mirrors `add-contact.js` exactly, down to the same `?new=` URL-parameter
fallback for browsers (Firefox, for `file://` pages) that disable
`localStorage` outright.

## "Display page" — the one screen that isn't red

`show-phrase.html` (node 7:928) is a flash-card view of a single phrase,
reached by tapping any row in `phrase-library.html` — seed or user-added
alike. It's the one screen in the whole app that isn't built on the red
theme: white background, black text and wordmark, a very faint (5%,
against the usual 20%) version of the shared hexagon texture, because the
point of this screen is to be held up and read by someone else (a
stranger being asked for help), where the app's usual dark-red-on-cream
palette would just be harder to read at arm's length. Return button,
bottom bar, and logo medallion are the same pixel-identical assets every
other page uses; only the background texture is a new export — same
artwork, re-colored black instead of red-tinted, since it now sits on
white instead of on `var(--c-red)`.

Which phrase to show is a `sessionStorage` handoff (`guitu.showPhrase`),
the same pattern `calling.html` uses for `guitu.callTarget`: `js/phrase-
library.js` keeps the real phrase objects in an in-memory array (seed
*and* saved) rather than baking them into each row's markup — a saved
phrase's text could contain quotes or other HTML-sensitive characters
awkward to round-trip through a `data-` attribute — and a delegated click
handler on the list resolves the tapped row back to its phrase and writes
it to `sessionStorage` right before the browser follows the link. Opened
directly with nothing set, `show-phrase.html` falls back to Figma's own
sample phrase ("I am lost, please help me." / 我迷路了，请帮助我), the
same seed-data-fallback reasoning every other page's fallback uses.
## "Maps" — Navigation's home, and the first non-contacts slide-up card

`navigation.html` (node 7:1284) reuses the exact same "Slide up card"
component `home.html` and `calling.html` already reuse for their own
bottom panels (confirmed via `get_metadata` — same handle, same base
frame, same 390×685 geometry), so `js/navigation.js`'s drag logic is
`js/app.js`'s sheet section carried over verbatim; only the dynamic
contact-row rendering is gone, since this card's three rows ("Go home" →
`go-home.html`; second "Set destination" row → `add-destination.html`,
covered below; third row still inert) are static markup instead — only
the second row's label/link get patched at runtime. Header,
return button, background texture, and every piece of the card's own chrome
(background, panel, handle, medallion, Calls/Profile pills, even the
contact-row background shape the new rows sit on) are pixel-identical
assets to what `home.html` already ships (confirmed by comparing exported
bytes) — the only genuinely new asset is the small medallion icon on the
two "Set destination" rows (`navigation-destination-icon.png`, a different
art iteration of the same knot logo used elsewhere, not a crop of the
existing sprite — confirmed those don't match byte-for-byte).

The **map itself is a live, embedded Google Map** (`.navmap > iframe`),
not the static screenshot Figma's own mock uses — draggable and
pinch/scroll-zoomable the way any Google Maps view is, via Maps' keyless
embed endpoint (`maps.google.com/maps?...&output=embed`), which needs
neither an API key nor billing to render. The query centers it on the
same Chatswood/Roseville corner of Sydney Figma's mock shows. This also
means `navigation-map.png` is gone from `assets/` — nothing renders it
anymore.

The **share-location button** reuses Figma's two authored states (idle:
cream circle, drop shadow; active: red circle, inset shadow) but not as
images — that's the exact same visual convention `calling.css`'s
Speaker/Mute/Location `.callbtn` toggle already uses, cream `#fbecd1` and
red `#d42628` included, so it's built the same way (CSS background + box-
shadow) instead of re-exporting Figma's two button variants as PNGs, and
the pin glyph itself reuses `icon-call-location-off.svg`/`-on.svg` already
in `assets/` for that same in-call Location toggle. Figma's component has
no authored motion between the two states (`get_motion_context` came back
empty), so the one piece of original motion design here is what happens
*while* sharing is on: a ring pulses outward from the button and fades,
signaling a live share the same way Home's listening soundwave signals a
live mic — `js/navigation.js` just toggles one `.is-active` class; the
animation itself is a plain CSS `@keyframes` loop, off by default and
skipped under `prefers-reduced-motion`.

## "Go home" — a routed map, to wherever you've actually said home is

`go-home.html` (node 120:317) is the first page in the app with no
`header.svg` at all — Figma's own node doesn't use the shared curved
header shape here, just the plain `.screen` red background with the
usual texture, a return button, and a centered title (`.header-title-
centered` from styles.css already matches this page's 24px/22px styling
exactly, so no new title CSS was needed). Return button, bottom bar, and
logo are the same pixel-identical assets every other page ships.

The map is real and *routed*, not just centered like Navigation's own
map: same keyless Google Maps embed endpoint, but now with `saddr`/
`daddr` so it draws an actual route. The destination is never hardcoded —
`js/go-home.js` reads `guitu.profile.address` out of `localStorage`, the
exact field `edit-profile.html` writes and `profile.html` displays, so
changing your address on the profile screen changes where this page
routes to (verified: saved a different address, reloaded, the map
re-centered on it). The origin is the browser's *real* current position
via `navigator.geolocation`, when the page has permission — a capability
this prototype hadn't reached for yet, unlike speech recognition/
synthesis and the Maps embeds already in place. A plain map centered on
just the destination loads immediately either way, so the page never
looks broken while geolocation is pending; if it succeeds, that map is
swapped for the routed one. Denied, unsupported, or timed out (8s) all
fall back to that same destination-only view — no address unlocks
nothing here, same "real capability, quiet fallback" posture as every
other browser-API feature in the app.

## "Set destination" and "Navigation" — a second saved place, with its own route

`add-destination.html` (node 120:387) is the same teal-band-over-grey-fill
template `add-phrase.html` borrows on the `translation` branch — but here
it keeps its original job, so the layout is untouched from Figma's own
mock (Save stays at Figma's y763; nothing needed to move up the way it
does on `add-phrase.html`, since the map is still there). The one real
change: the map (node 120:403) is a **live preview** of whatever's typed
into Address, not the static screenshot Figma's own mock shows — same
keyless Google Maps embed as everywhere else, debounced 700ms so it
doesn't re-request on every keystroke, held behind a plain placeholder
until there's at least three characters worth geocoding. Save validates
Address (the field the map/route actually depends on — Place name is a
friendly label only, and falls back to the address itself if left blank),
writes `{ name, address }` to `localStorage` as a single
`guitu.savedDestination` slot (not a list — only one row on
`navigation.html`'s sheet is wired to show a saved destination right now),
and returns to `navigation.html`.

That second sheet row is genuinely stateful, not just a link: unset, it
reads "Set destination" (muted, matching the still-unbuilt third row) and
points at `add-destination.html`; once something's saved, `js/
navigation.js` swaps its label to the saved name — in whichever font
(`t-en`/`t-cn`) actually fits it, picked the same way `contacts.js`'s
`nameFontClass` picks a saved contact's, since free-typed text isn't
reliably one language or the other — turns the text from muted grey to
black, and re-points the row at `navigate-destination.html` (node
120:363) instead. That page is `go-home.html` again in every way but
which address it routes to: same live, routed Google Maps embed, same
destination-only-map-loads-first-then-upgrades-if-geolocation-succeeds
posture, just reading `guitu.savedDestination` instead of
`guitu.profile.address`. Verified end to end: saving "Bondi Beach" updates
the row's label and link, and tapping it routes there.
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
Calendar* tile, and — unlike most of this app's list-style pages — a
fixed 390×844 stage, the same posture as `home.html`, not a scrolling
page: the 3-day / 0:00–24:00 overview timeline lives in its own bounded,
independently-scrollable region, and a real draggable slide-up card
(Figma's "Slide up card" component, node `56:546`/`56:729`) sits on top
of it holding "Today's events" — collapsed, only its nav row peeks up
from the bottom edge; dragged open with the *exact* same pointer
mechanic as `home.html`'s own `.sheet` (threshold-gated pointer capture,
`--scale`-compensated deltas, a fractional-drag-distance decides which
state it settles into on release — see `js/calendar.js`, ported from
`js/app.js`), it reveals the day's schedule. An earlier pass at this
page built the overview as one long scrolling page with the today panel
as in-flow content at the bottom instead; that didn't match how Figma
actually composes this screen (a genuinely fixed card floating over
scrolling content, not everything scrolling together), so this rebuilds
it as two independently-scrollable regions — the overview behind, the
card's own body in front — under one non-scrolling stage, which is also
what makes the card draggable at all: a sheet that's part of page flow
has nothing to drag *relative to*.

Figma's own mockup ships the timeline pre-populated with sample events
(a whole day planned out); this build deliberately does **not** seed any
of that — a fresh visit shows only the hour axis and its guide line,
three empty lanes underneath (`today`/`Tomorrow`/`2 Days`), and an empty
card, since nothing has actually been scheduled yet. Events only appear
once added through `add-event.html`, read back out of `localStorage`
(`guitu.calendarEvents`) by `js/calendar.js`.

Header, return button, and the "Add" pill's icon are all reused
byte-for-byte from existing assets (`header.svg`, `return-button.png`,
and — confirmed by comparing Figma's own crop percentages against
`add-icon.png`'s existing crop in `journal.html` — the same add-icon
sprite, just cropped identically). The 3-day overview's own geometry is
lifted straight from Figma's numbers: an 83px axis column feeding three
50px lanes at x=83/194/298 (356px total content width, 61px/54px gaps
between lanes), and Figma's own 907px 0:00–24:00 axis span used as a
uniform px/hour scale — Figma's hand-placed hour labels aren't quite
evenly spaced, and a real implementation needs one that is. Those axis
labels are set in `Inter` at font-weight 900 specifically (loaded
alongside the app's usual Inria Serif/Noto Serif SC pair), matching
Figma's own choice of a different font just for this one element.

The bottom nav turned out to be a real exported asset, not a shape worth
redrawing in CSS: `calendar-nav-bg.svg` is Figma's own scalloped
background (390×128, with a circular notch carved out of its top-centre
for the medallion logo to nest into — confirmed by reading the exported
path data), and the Profile pill's glyph (`icon-profile-outline.svg`) and
the small centre arrow (`icon-nav-arrow.svg`) are likewise the real
exported vectors rather than a Material Symbols substitute. Calls still
uses a Material "call" glyph, since Figma's own icon there is a Code
Connect reference to a design-system "Phone" component with no
exportable path behind it. This whole nav row is the card's own header
strip — it reuses the same three-pill arrangement Figma's own "Slide up
card" component ships elsewhere in this file (see `calling.html`'s notes
on that component), and *is* draggable here, same as `home.html`'s
version: the card is 700px tall with the 128px nav fixed at its top via
`flex: none` and the rest (`plan tomorrow` + today's detail timeline)
filling the remainder as its own `overflow-y: auto` region
(`.calsheet__body`) — "inside the slide-up card the timeline should also
be scrollable," so a busy day scrolls within the card instead of forcing
the card itself to grow. At rest the card sits at `top: 716px` (844 minus
the nav's own 128px — matching Figma's own "715" rest position for this
component almost exactly), and drags up by 556px to reveal the rest;
dragging past a quarter of that distance and releasing snaps it the rest
of the way, exactly like `home.html`'s own sheet.

**Each pill's colour is a live progress indicator**, not a fixed
category colour: for *today's* lane only, `js/calendar.js` compares the
event's start/end against the real clock — a pill entirely in the past
renders fully teal, one entirely in the future stays the plain unfilled
cream track, and one straddling *now* renders a soft gradient split at
however far through it the clock has gotten. Tomorrow/2-days pills always
render as plain track, since "how much has elapsed" isn't a meaningful
question for a day that hasn't started. A dashed "now" line marks the
live time on today's lane specifically, for the same reason. Populated
pills use Figma's own exact shape too — a 50px-wide, 40px-radius stadium
filling the whole lane column, in cream (`#edd8b4`) or teal
(`#37848c`) — even though what's *inside* each pill (a Material Symbol
the user picked on add-event.html) is this app's own feature, not
Figma's fixed demo icon set.

**Overlapping events used to render invisibly on top of each other** —
two events with the same (or crossing) start/end times got the exact
same `top`/`height`, so only whichever pill was drawn last actually
showed; the other was still saved, just hidden underneath, which looked
like events were silently disappearing rather than a rendering gap.
`assignColumns()` (`js/calendar.js`) is the standard greedy
interval-colouring layout every real calendar view uses for this: sort
by start time, and each event claims the first column whose previous
occupant has already ended by the time this one starts, opening a new
column only if none is free. Column 0 renders exactly where it always
did; column 1+ offsets right by 10px per column on the 3-day overview,
12px on the more detailed today timeline (whose text label and tick
checkbox shift the same amount, so an overlapping event's whole row
moves together rather than just its pill) — a small stagger that
doesn't fully separate them within a lane this narrow, but the "this is
a second, distinct event" signal doesn't need full separation to read;
Figma's own mock never showed this state at all, since nothing in a
static design can overlap two things you'd both need to see.

**The today panel turned out not to be a simple checklist.** Reading
Figma's own "Slide up card" component (`56:546`/`56:729`) closely showed
it's actually a *second*, more detailed timeline just for today — its
own axis, the same coloured-pill language as the 3-day overview (just at
a taller px/hour scale), thin 8px connector stems between events, event
text beside each pill, and a small tick-box square beside *that* — not a
stack of list rows, which is what an earlier pass at this page had built
instead. `js/calendar.js` now renders it that way: the displayed hour
range is whatever covers today's events (rounded out to 3-hour
boundaries, Figma's own label increment), each event gets a pill sized
to its real duration and coloured by the same elapsed-fraction logic as
the overview above, and the tick box — a plain teal square that gains a
red Material "check" glyph once ticked, matching Figma's own two-tone
checkbox rendering exactly rather than the inverted-white-box look an
earlier version used — is the one piece of real interactivity Figma's
mock doesn't show any state for: `role="checkbox"`, toggled on click,
persisted back into the same stored event, with the row's text struck
through once done.

`add-event.html` (node 19:1501, "add task - both") is reached from either
of `calendar.html`'s two entry points — the header's **Add** pill and the
today panel's **plan tomorrow** button (which arrives with `?day=1`) —
and, like those other two pages, is a real scrolling page rather than a
fixed stage: even in its current form there's more content here than one
screen reliably holds.

**Every field on this page is real now** — icon circle, title, Date,
Time, and Duration. The full history: an earlier pass turned all four
non-title fields (plus the icon picker) into live controls; matching
Figma's actual mock pixel-for-pixel meant reverting all four to plain,
non-interactive markup that reproduced its literal sample values; then
each came back real again, one at a time, as its own intended behaviour
got specified — icon picker and Date first, then Time as a genuine
iOS-style scroll-snap roller (not a native `<input>`), then Duration as
a drag-left-right `<input type="range">` styled so its thumb *is*
Figma's own darker-teal capsule shape. Concretely, right now:

- The **icon circle** (`19:1506`) is a real button again: tapping it
  reveals a horizontal, scrollable strip of common Material Symbols (the
  [fonts.google.com/icons](https://fonts.google.com/icons) library) —
  walking, meals, socialising, home tasks, sleep, medication, shopping,
  exercise, work, health, reading, celebrations — and picking one renders
  that glyph inside the circle, which is also what shows up as the
  event's icon back on `calendar.html`'s pills. At rest it's plain white
  (matching Figma's own empty placeholder) with a faint hint glyph
  (`add_photo_alternate`, ~35% opacity) marking it as tappable — Figma's
  own mock has no such hint, since its circle isn't meant to be
  interactive at all.
- **Title** stays real input, unchanged — matching what Figma's own mock
  actually is there too (a text field shown in its placeholder/empty
  state, the same convention every other text field in this app
  follows). Its placeholder is a custom two-line overlay rather than the
  native `placeholder` attribute — see the "two-line, two-font
  placeholder" note further down.
- **Date** is real again. Its visual is matched directly against a fresh
  `get_design_context` + screenshot of its own node (`19:1529`) rather
  than a reference photo: a plain black calendar glyph sitting straight
  on the `#37848c` pill — no background box, border, or shadow behind
  it — plus the date text in its own nested lighter pill
  (`rgba(255,255,255,.16)`) to its right. Which piece is the actual
  `<button>` moved around a few times before landing where it is now:
  first the icon alone, then (per instruction) the icon stays purely
  decorative — matching Figma, where the "Calendar" component isn't
  interactive either — and **the nested text pill itself
  (`.datepill__text`) is the real button and date-picker trigger**. It
  calls a hidden `<input type="date">`'s own `showPicker()` to open the
  browser's native date-picker pop-up (falling back to `.focus()`/
  `.click()` where `showPicker` isn't supported); `change` re-renders
  the button's own text in the "Jun 5 （6月5日）, 2023" format rather
  than the input's own locale-formatted display. Defaults to today (or
  the date `?day=` implies), and picking a different one now genuinely
  changes which of the 3-day lanes the saved event lands in.
- **Time** (`19:1527`, "Date and Time - Wheels") is a real roller now —
  the frosted, blurred card is unchanged, but its three columns
  (hour/minute/AM-PM) are each a native CSS scroll-snap track
  (`js/add-event.js`'s `buildWheel()`) instead of five static rows. Each
  real row is `scroll-snap-align: center`, flanked by a `.wheelcol__pad`
  top and bottom sized to exactly half the column's visible height minus
  half a row — that's what lets the very first/last value (1 and 12,
  00 and 59, AM and PM) scroll all the way to the fixed selection band
  in the middle rather than stopping short of it. Native scroll-snap
  owns the momentum, rubber-banding, and settling — no hand-rolled
  pointer-event drag physics — while a `scroll` listener continuously
  figures out which row is nearest centre and bolds/fades the rows
  around it live, correcting once more (`settle()`) a beat after
  scrolling actually stops in case of sub-pixel rounding. Tapping any
  row scrolls it to centre directly; the focused column also responds to
  Arrow Up/Down. Defaults to 8:00 pm, the value Figma's own mock shows
  selected, and Save now reads the real picked time instead of a fixed
  default.
- **Duration** is real too, and drag-left-right rather than a discrete
  chip row. The darker-teal capsule (`#37848C`, `19:1516`) Figma uses to
  mark "1h" as selected is the actual thumb of a native
  `<input type="range">` (`min=0 max=6`, one stop per value), styled via
  `::-webkit-slider-thumb`/`::-moz-range-thumb` to be that exact capsule
  (49×42, radius 21), so dragging it *is* dragging that shape. The
  lighter-teal capsule (`#56A8B0`, `19:1514`/`19:1515`) isn't a fixed
  backdrop either anymore — it's a **fill that follows the thumb**,
  recomputed on every `input` event from the same track-width-minus-
  thumb-width math the browser itself uses to place the thumb, so its
  right edge always lands exactly on the thumb's right edge at whichever
  of the seven stops it's on. Figma's own static mock only shows that
  relationship holding at "1h" (where the two capsules' right edges
  happen to align); now it holds everywhere. The seven value labels sit
  visually on top of the thumb/track (`pointer-events: none`, so drags
  and clicks — including tapping a number directly, which
  `<input type="range">` already treats as "jump here" — pass straight
  through to the input underneath) and `js/add-event.js` repaints which
  one is white/bold on every `input` event, live while dragging rather
  than only once you let go.

  Getting the thumb to actually sit vertically centred on the pill (and
  therefore on the text) took an explicit `margin-top` on
  `::-webkit-slider-thumb` — WebKit doesn't auto-centre a custom-height
  thumb against a custom-height `::-webkit-slider-runnable-track` the
  way Firefox's `::-moz-range-thumb` does; left alone, it renders
  anchored near the track's top edge instead, which is what "the darker
  blue button is a bit off, a little bit higher" during this pass turned
  out to be.

The title field's **placeholder is a custom two-line overlay**
(`.titleinput__placeholder`), not the input's native `placeholder`
attribute — Figma's own placeholder (`56:747`) is two lines in two
different fonts/sizes ("Enter text here" 18px Inria Serif / "在此输入文本"
16px Noto Serif SC), which a native `placeholder="…"` string can only
ever render as one line in one font. The overlay sits behind the real
input (`z-index`) and `js/add-event.js` toggles its `hidden` attribute on
every `input` event, so it disappears the moment there's real text and
comes back if the field is cleared — matching Figma's two-line look
while the field stays a genuine, typeable input underneath.

The gap between the title field and Date used to look too big: `14px`
of top padding on `.addevent__fields` (Figma's own number — the teal
band ends at 269, Date's own label starts at 283) was getting stacked
under an *empty* `.formstatus` paragraph that still reserved its full
line-height and margin even with nothing to say. `.formstatus` now
collapses to zero height/margin while empty and only claims space once
there's an actual validation message to show.

Every `.fieldgroup__label` (Date/Time/Duration) had a bare space
character between its `t-en` and `t-cn` spans — `<span
class="t-en">Date</span> <span class="t-cn">日期</span>` — which
inherited `font-size: 0` from the label's own `font-size: 0` reset
(everywhere else in this app sizes text through the child spans, not the
parent) since the space itself isn't inside either span, collapsing it
to zero width and running the two words together ("Date日期"). Fixed the
same way `Save&nbsp;`/`Add&nbsp;` already handle it elsewhere in this
app: the space moved *inside* the sized `t-en` span as `&nbsp;`.

Save reads every real field now — icon, title, date, time, and duration.
The `?day=` query param still picks which of the 3-day lanes the event
lands in — that's plumbing, invisible on this screen, not something
Figma's mock shows either way.

This is step 1 of 2 — Figma's own next node in the flow, `19:1547` ("add
task （continue） - both"), is a second screen, not this one finishing.
Save here validates that a title
is set, then hands everything off as a `sessionStorage` draft
(`guitu.addEventDraft`) and moves on to `add-event-continue.html`, rather
than writing anything to the real calendar yet — `sessionStorage`, not
`localStorage`, for the same reason `js/app.js` uses it for
`guitu.callTarget`: it's scoped to this one handoff, so abandoning the
flow on step 2 (closing the tab, navigating away) doesn't leave a
half-finished event sitting in `guitu.calendarEvents`.

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
mock. The "add sub-task" control is a `check_box_outline_blank` /
`check_box` Material Symbol toggle rather than a native checkbox input —
Figma's own component here (`19:1562`, Code Connect–mapped to a Material 3
`CheckBoxOutlineBlank`) is that same icon pair, so matching it meant
reaching for the same icon font already used for the event-icon picker
rather than a plain HTML checkbox — and it gates the sub-task textarea's
`disabled` state, unticked by default, so the field starts inert until
opted into. This page's own Save is what
finally writes `{ title, icon, day, start, duration, done, repeat,
subtask? }` to `guitu.calendarEvents`, clears the draft, and returns to
`calendar.html`.
