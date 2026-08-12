# 归途 GuiTu — screens

Five screens from the Figma file
[`prototype-5`](https://www.figma.com/design/xeQNx3M5eHj129RIIwGdQO/prototype-5),
wired together into one click-through prototype. Open `index.html` in a
browser — no build step, no dependencies.

```
index.html                Home screen (node 2:40) — the entry point, kept at
                           the root so opening the project always means this

pages/
  edit-contacts.html       "Your profile" reorder screen (node 2:688)
  contacts.html            "My Contact" list (node 7:1121) — real scrolling page
  add-contact.html         "Adding contact" form (node 120:408)

css/
  styles.css               shared tokens/reset, .stage/.screen scaling,
                            header/return/wordmark/crop helpers — every page
  soundwave.css             listening state: scrim + animated soundwave (index)
  edit.css                  edit-contacts.html's own layout
  contacts.css              contacts.html's own layout
  add-contact.css           add-contact.html's own layout

js/
  app.js                    index.html: viewport fit, press-to-speak, slide-up
  edit.js                   edit-contacts.html: drag-to-reorder + save/persist
  contacts.js               contacts.html: renders seed + saved contacts
  add-contact.js            add-contact.html: photo picker, validation, save

assets/                    PNGs/SVGs exported from Figma, shared by every page
```

`index.html` stays at the root — everything under `pages/` reaches it and its
assets with `../`. Pages within `pages/` link to each other by bare filename
(`contacts.html` → `add-contact.html`) since they're siblings.

Every page beyond the home screen reuses `css/styles.css` for the shared
`:root` tokens and the `.stage`/`.screen` scaling, plus four helpers
three-or-more pages need: `.crop` (sprite-sheet cropping), `.wordmark`/
`.wordmark--return` (the rotated "返回 return" glyphs), `.return` (the
circular back button), and `.header-title-centered` (the centered white
bilingual title under it). Only each page's own layout lives in its own CSS
file under `css/`.

**Navigation wired between the three new pages:**
- Home's *Contacts* tile → `contacts.html`. (Home's *Calls* pill still opens
  the quick-access slide-up card — that's a different, faster path to the
  same three emergency contacts, not a duplicate of the full list.)
- `contacts.html`'s **+ Add** card (one at the end of each group) →
  `add-contact.html`.
- `add-contact.html`'s **Save** button validates, writes the new contact to
  `localStorage`, and returns to `contacts.html`, where it now appears.
- Both new pages' return arrows go back to where navigating to them makes
  sense (`contacts.html` for add-contact's cancel arrow, `index.html` for
  contacts' arrow and its "Back to homepage" bar).

## How the geometry is expressed

Every coordinate in the CSS is a **literal Figma value in the design's own
390 × 844 pixel space**. Nothing is re-derived or eyeballed, so a change in
Figma maps to one number here. `app.js` scales the whole screen as a single
unit (`--scale` on `.stage`) so it fits any viewport without touching layout.

Icons and illustrations are the assets Figma exported. Several of them are
crops of a larger sprite sheet (the medallion, the four tile glyphs, the mic
button), which is what the `.crop` helper is for: the frame gets the visible
window, the `<img>` inside gets the sprite's offset and size.

**`.crop` sets `pointer-events: none`** — correct for the many purely
decorative crops (tile icons, the medallion), wrong for the one crop that's
also a click target: the circular `.return` back-button on every page besides
home uses `class="crop return"` for its sizing. `.return` explicitly sets
`pointer-events: auto` back on to undo that — without it, the button looks
and measures perfectly normal (right position, right size, right cursor) and
is simply unclickable. If a future crop needs to be interactive too, it needs
the same override.

Three exported SVGs — `tile-bg.svg`, `contact-row.svg`, `sheet-bg.svg` — came
out of Figma as 2–3 *abutting* paths of the same fill. Rasterised separately,
each shared edge antialiases against transparency and shows up in the browser
as a hairline seam across the shape. The paths were merged into a single
`<path>` (several subpaths, default `nonzero` fill-rule) so the renderer
covers each seam in one pass.

## Press-and-hold → animated soundwave

Holding the voice assistant button puts `.is-listening` on `.screen`, which
reveals the scrim (`rgba(0,0,0,.3)`, Figma node `276:746`) and the 290 × 187
soundwave at (50, 328) (node `276:806`) — matching the design's listening
frame, `home - both` at node `276:649`.

The waveform is not invented. Figma's `Soundwave` component (node `253:974`)
ships **four authored states**, so each of the 12 bars interpolates through
*its own* four designed heights:

```
0% / 100%  Default      25%  Variant2      50%  Variant3      75%  Variant4
```

Those heights live in `soundwave.css` as `--h1 … --h4` per bar, and a single
`@keyframes wave-morph` animates `height` between them. Every quarter of the
cycle therefore lands exactly on a frame the designer drew; the eased
interpolation only fills the gaps. Bars carry a 12 ms-per-bar phase offset —
small enough to preserve the designed silhouettes, enough to make the wave
read as travelling rather than blinking.

Timing is one variable, `--wave-cycle` (default `1.6s`).

The press is wired for pointer, touch and keyboard (hold <kbd>Space</kbd> or
<kbd>Enter</kbd>), uses pointer capture so releasing off-target still ends the
press, and cannot get stuck on tab-away. Under `prefers-reduced-motion` the
wave holds the Default frame instead of animating.

## Slide-up card

The card is the `Slide up card` component (node `245:1081`) at its designed
position. Tapping the handle, the Calls pill, or the Contacts tile opens it;
the handle or <kbd>Esc</kbd> closes it.

**One value here is a judgement call, not a measurement.** The Figma file
defines the card's collapsed position and its full contents, but no 390 × 844
frame showing it open, so the travel distance is set to `--sheet-offset: 540px`
in `styles.css` — which lands the card top at y=170 and the last contact row
at y=784. Adjust that single value if the intended open position differs.

## Verification

The idle screen and the listening state were rendered at 1:1 and diffed
against Figma renders of nodes `2:40` and `276:649`:

- all 12 soundwave bars match the reference exactly (top and height, 0 px error)
- tile, card, sheet and icon geometry match to the pixel
- residual difference is text antialiasing only (Chrome's rasteriser vs
  Figma's), plus a 2–3 px baseline offset on two text blocks caused by
  `line-height: normal` resolving differently in the two engines

Fonts (Inria Serif, Noto Serif SC) load from Google Fonts, with a local serif
fallback if the page is opened offline.

## "Your profile" — drag to reorder, top-3 highlighting

`edit-contacts.html` implements node `2:688`: a list of emergency contacts the
user can drag into priority order, where the top 3 (dashed box, node `2:744`)
are the ones the homepage's emergency card will show.

**Layout formula, not five hand-placed rows.** Figma places row 1 at y=300 and
row 2 at y=394 — a 94px step (76px row + 18px gap). Rows 4–5 use the same step
too, within 2–6px (an export-rounding artifact, not a different rhythm). So
one formula reproduces the whole list and stays correct as rows change order:

```
top(index) = 300 + index * 94
```

The dashed frame hugs rows 0–2 with a 12px pad — `frame.top = top(0) − 12`,
`frame.height = top(2) + 76 + 12 − frame.top` — recomputed on every reorder so
it always wraps whichever three contacts currently lead the list.

**Reordering** works three ways, all driven by the same `order` array and the
same `render()` call:
- **Drag** the hamburger handle (Pointer Events, capture the pointer so a
  release outside the handle still ends the drag). While dragging, the row's
  center is checked against `top(index)` for every slot; crossing a boundary
  splices the array and animates the other rows out of the way immediately —
  the color swap (red ↔ cream) and the dashed frame both update live, not
  only after drop.
- **Keyboard**: focus a handle, <kbd>↑</kbd>/<kbd>↓</kbd> swaps it one slot at
  a time. An `aria-live` region announces the new position.
- Both paths reorder the actual `<li>` elements in the DOM (`appendChild` in
  the new sequence) rather than destroying and rebuilding them, so a focused
  handle stays focused across a keyboard move.

**Persistence is explicit.** Dragging only changes the on-screen order; the
arrangement is written to `localStorage` (`guitu.emergencyContactOrder`) when
**Save** is pressed, matching the design's dedicated Save button — a reload
without saving reverts to the last saved order.

Two row-background SVGs (`row-top3.svg`, `row-plain.svg`, 320×84) had the same
abutting-path seam issue described above and were merged the same way.

## "My Contact" — a real scrolling page, not a fixed frame

Every other screen is a fixed 390×844 design scaled to fit the viewport
(`.stage`/`.screen` in `styles.css`). `contacts.html` can't work that way: the
list of contacts genuinely grows — Figma's 4 seed family members + 7 seed
friends is a snapshot, not a ceiling, once people can add their own. So this
page is a real scrolling document instead: width capped at 390px and
centered, height whatever the content needs, header `position: sticky` so
the way back is always reachable without scrolling up.

That has one consequence worth flagging: **the contact cards are flow-laid-
out, not pixel-positioned.** Figma's seed cards come in two hand-placed
heights (153px for a one-line name, 162px for two lines); a card with
arbitrary user-entered text can't be squeezed into either number. The grid
uses CSS Grid (2 columns, 16px/18px gaps — matching Figma's spacing exactly)
with `align-items: stretch`, and each card is padded flexbox rather than
absolutely-positioned children, so it naturally grows for a two-line name (or
a name and a photo) instead of clipping or overlapping.

The same reasoning applies to the section background: Figma's family/friends
wrapper is a decorative scalloped "ticket" shape (`Vector`, rotated
838×327) exported as a fixed-size SVG. A fixed-size decorative border can't
stretch to an unknown number of rows without 9-slice tiling the design
doesn't provide for, so the wrapper here is a plain rounded rectangle in the
ticket's own fill color (`#D7BB89` at 82% opacity) instead — same color
language, none of the scalloped-edge artwork.

One more thing worth flagging: Figma's own two content screens disagree on
two people's Chinese names — Grandson Alex/Harry read "孙子（强强）"/"孙子（小
睿）" on this page but "孙子（亚历克斯）"/"孙子（哈利）" on the reorder screen.
Each page keeps its own screen's text verbatim rather than silently
reconciling a content inconsistency that isn't this codebase's to fix.

The **"Back to homepage" bar** sits, in Figma's canvas, overlapping the
family section's Add-card row — an artifact of how Figma stacked three
844px-tall screenshots to depict one long scroll, not a real "floats mid-list
forever" instruction. It's placed here as its own clearly-separated section
between Family and Friends, keeping the artwork and behavior, dropping the
overlap.

## "Adding contact" — real inputs, a real photo picker, real persistence

`add-contact.html` implements node `120:408` as a working form, not a static
mock of one:

- **Name** is an inline `label: value` field — Figma draws it as static label
  text sitting above a decorative underline (`Line 2`); here the underline is
  a real `<input>`'s `border-bottom`, sharing one line with the label so the
  typed name appears right where Figma drew the line.
- **Relationship** and the **phone number** are real text inputs styled as
  Figma's teal pills, including the placeholder copy and colors. The phone
  field keeps "04" as a fixed prefix chip (matching Figma's literal "04" —
  read as the standard leading digits of an Australian mobile number) with
  a `type="tel"` input for the rest.
- **Choose photo** (the pencil button) triggers a real `<input type="file"
  accept="image/*">` — on a phone this opens the OS photo library/camera
  chooser, exactly as asked. The chosen image is read with `FileReader` and
  drawn into the avatar circle immediately, before Save is even pressed.
- **Save** validates that a name was entered. The error used to be
  screen-reader-only (`aria-live`, no visible text) — which meant a sighted
  user who left Name empty clicked Save, saw *nothing* happen, and
  reasonably concluded the button was broken. It's now also a visible red
  line above the button (`.formstatus`), clearing itself as soon as a name
  is typed.
- On success, Save writes `{ id, name, relationship, phone, photo, group }`
  to the same `localStorage` key `contacts.js` reads, then navigates to
  `contacts.html` — where the new contact is now visible, call button and
  photo included, in whichever group's **+ Add** card was clicked (each
  group's Add card links here with `?group=family` or `?group=friends`;
  `add-contact.js` reads it, defaulting to `friends` if it's missing).
- **The write is allowed to fail, and Save still has to work when it does.**
  Some browsers — Firefox, notably — disable `localStorage` outright for
  `file://` pages, and this whole prototype *is* `file://` since there's no
  server. Without a build step, exercising this isn't hypothetical the way
  it usually is. The `localStorage.setItem` call is wrapped in `try/catch`;
  on failure, Save instead hands the new contact to `contacts.html` via a
  `?new=` URL parameter (everything except the photo — a data-URL photo can
  be large enough to blow past a URL's length limit, so it's the one field
  this fallback drops). `contacts.js` picks that parameter up, renders the
  contact immediately, makes one more best-effort attempt to persist it, and
  strips the parameter from the URL either way. **Save always navigates** —
  that line runs unconditionally after the `try/catch`, not inside it — so
  the button can never again look like it did nothing.

One label-layout bug worth naming since it's easy to reintroduce: Figma's
Relationship/Phone/Avatar labels are each a **single line** mixing English
and Chinese (`Relationship 与您的关系：`) — not the two-line stacked pattern
used elsewhere in this app (`Home` / `首页` on separate lines). Copying that
stacked pattern here by reflex made every label collide with the input below
it; `.fieldlabel` deliberately does *not* set `display: block` on its child
spans for this reason.

A related, more general fix lives in `contacts.css`: the browser's own
Latin/CJK line-breaking is what neatly stacks "Home" over "首页" with zero
extra CSS (a break is always allowed right before a CJK character). But that
same rule breaks a *longer* bilingual title like "My Contact 我的联系人" in
the wrong places — mid-word in the English, and between arbitrary Chinese
characters — once the line doesn't fit in the box's nominal width. The fix
was two-fold: a real space (not `&nbsp;`) between the English and Chinese
`<span>`s so exactly one break point exists, and `white-space: nowrap` on
each span so it can't fragment internally. `&nbsp;` looks like the more
"correct" non-breaking choice, but it actively suppresses the one break
point this layout depends on.
