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
  navigation.css             navigation.html's own layout
  go-home.css                go-home.html's own layout
  add-destination.css        add-destination.html's own layout
  navigate-destination.css   navigate-destination.html's own layout

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
- Home's *Navigation* tile → `navigation.html`. Its "Go home" row →
  `go-home.html`. Its second "Set destination" row → `add-destination.html`
  until something's saved, then it shows that destination's name and
  → `navigate-destination.html` instead; the third row is still a plain
  "Set destination" placeholder with no destination screen of its own —
  same as Home's still-unbuilt Translation/Other tiles. Navigation's own
  return arrow goes to `home.html`.
- `go-home.html`'s and `navigate-destination.html`'s return arrows both go
  back to `navigation.html`; their "Back to homepage" bars go to `home.html`.
- `add-destination.html`'s **Save** button validates the address, writes
  `{ name, address }` to `localStorage`, and returns to `navigation.html`,
  where the second row now shows it. Its return arrow also goes back to
  `navigation.html`.

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
