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
handle, same base frame), so it drags too, revealing the decorative keypad
stacked underneath it (also visual-only, no DTMF or typed-digits display).
Unlike home's card, there's no separate collapsed state to leave it in —
Hung up has to stay reachable, and the panel is tall enough that fully
collapsing it would carry Hung up off-screen — so this is a bounded
rubber-band peek (`js/calling.js`) rather than a real toggle: drag down to
preview the keypad, let go, it always springs back. Same deferred
pointer-capture trick as the home sheet (capture only engages once real
movement crosses a threshold) so a plain tap on Speaker/Mute/Location/Hung
up — all of them descendants of the same draggable panel — keeps working
untouched.

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
