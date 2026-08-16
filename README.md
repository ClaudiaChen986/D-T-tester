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
                            257:489) — real text fields, a direction-swap
                            button, and home.html's press-and-hold
                            listening overlay
  phrase-library.html      "Phrase library" (node 136:1498) — real scrolling
                            page, like contacts.html; sixteen seed phrases +
                            anything saved from add-phrase.html
  add-phrase.html          "Add phrase" — modeled on Figma's "Set destination"
                            (node 120:387) with the map removed and its copy
                            swapped for phrase entry

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
                             listening overlay, swap fields, live speech-to-text
                             where the browser supports it
  phrase-library.js         phrase-library.html: renders seed + saved phrases
  add-phrase.js             add-phrase.html: validation, save + handoff

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

The English/Chinese boxes are real `<textarea>`s, not fake output panels
that were only ever going to show placeholder text — there's no
translation backend to call, so pretending one of them displays a live
translation would be more dishonest than useful. Where the browser exposes
live speech recognition (`webkitSpeechRecognition` — Chrome/Edge; not
universal, same tier of support as the calendar/location APIs elsewhere in
the platform), holding the mic also transcribes real speech into the top
box, in whichever language currently sits there, while the soundwave
plays; unsupported browsers still get the full press-and-hold animation,
just not the transcription.

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
