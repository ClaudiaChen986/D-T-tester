# 归途 GuiTu

A bilingual (Chinese/English) everyday-life assistant — contacts, calling,
navigation, calendar, translation, and journaling — for newly-arrived
residents and their families. This is a **static, no-build-step** click-through
prototype: plain HTML/CSS/JS wired together into an installable PWA, built to
match the [Figma design file](https://www.figma.com/design/xeQNx3M5eHj129RIIwGdQO/prototype-5)
pixel-for-pixel.

A separate React (Vite + React Router) port of a subset of the screens lives
in [`app/`](app/README.md) — see that directory's own README if you're
working on it instead. Everything below is about the static site at the repo
root.

## Getting started

There's nothing to install and nothing to build. Clone the repo and open
[`index.html`](index.html) in a browser — that's the whole setup.

```
git clone <this-repo>
cd "D&T tester"
```

**Option A — open the file directly.** Double-click `index.html`, or
`file://` it in a browser. Everything works except the service
worker/install prompt (see [PWA notes](#pwa--service-worker) below) —
browsers refuse to register a service worker over `file://`.

**Option B — run a local static server.** Needed if you're testing PWA
install/offline behavior, since that requires `http://localhost` or HTTPS:

```
npx serve
```

> **Watch out for "clean URLs."** `serve` (and some other static hosts,
> including Vercel's own production hosting) redirects `page.html` to
> `/page` by default, and that redirect **drops any `?query=string`**.
> Any link relying on a URL query param to carry state across a navigation
> will silently lose it after that redirect. This bit a real feature (see
> `js/contacts.js`'s `guitu.addContactGroup` comment) — the fix was to stop
> relying on query params for anything that matters and hand state off via
> `sessionStorage` instead (see [State handoffs](#state-handoffs) below).
> If you need the URL to match what you clicked, run `npx serve --no-clean-urls`
> or drop a `serve.json` with `{"cleanUrls": false}` next to the site.

## Project structure

```
index.html              Entry point — "Choose your language". Every session
                          starts here; stays at the root so cloning/opening
                          the project always means this screen.
manifest.webmanifest    PWA install metadata (name, icons, theme colour).
sw.js                   Service worker — hand-maintained precache list +
                         runtime caching for everything else (see comments
                         in the file itself for the caching strategy).
offline.html            Fallback for a navigation that's neither cached nor
                         reachable — see PWA notes below.

pages/    One HTML file per screen. Bilingual by default; a page with
           real user-facing text may also ship -en.html/-cn.html siblings
           for the English-only/Chinese-only tracks — see Conventions.
css/      styles.css holds shared tokens (colours, fonts) and the handful
           of chrome helpers (.stage/.screen scaling, .crop, .return,
           .wordmark, .header-title-centered) every page reuses. Every
           other file is one page's own layout, named to match.
js/       One file per page's behaviour, same naming convention as css/.
           Single-language (-en/-cn) page variants reuse their bilingual
           counterpart's JS file verbatim rather than duplicating it.
assets/   PNGs/SVGs exported from Figma, shared across pages. Check
           whether something you need already exists (byte-identical
           reuse is common — icons/badges/backgrounds repeat across
           screens) before re-exporting it.
app/      A separate React/Vite port — see app/README.md.
```

Pages within `pages/` link to each other by bare filename
(`contacts.html` → `add-contact.html`); everything under `pages/` reaches
the shared `assets/`/`css`/`js/` via `../`.

## Conventions to follow when making changes

- **No build tools, no frameworks, no package manager** at the repo root —
  plain HTML, CSS, and ES5-style JavaScript (`var`, function expressions,
  no `let`/`const`/arrow functions/classes), each page's script wrapped in
  a `'use strict'` IIFE. Keep new code consistent with this rather than
  introducing modern syntax the rest of the file doesn't use.
- **Bilingual text** is two sibling spans, never one string with both
  languages baked in: `<span class="t-en">Home</span><span
  class="t-cn">首页</span>`. A single-language page variant hides one of
  the two via CSS (see `css/lang-en.css`/`css/lang-cn.css`); text that
  doesn't cleanly split into `.t-en`/`.t-cn` (a saved contact's free-typed
  name, a journal entry) gets its font picked at render time by detecting
  CJK characters instead (see `CJK_RE` in `js/contacts.js`/`js/journal.js`).
- **Two page layouts, pick deliberately:**
  - A **fixed 390×844 "stage"** (`js/app.js`'s `fit()` pattern — scales the
    whole screen as one unit via a CSS custom property, `--scale`) for a
    screen that matches one Figma frame with a fixed amount of content.
  - A **real scrolling page** (see `contacts.css`'s header comment) for
    anything with open-ended, growing content — a list of contacts,
    journal entries, phrases. Don't force list-like content into a fixed
    stage; it won't scale to real data.
- **Shared chrome** — reuse `styles.css`'s helpers instead of rebuilding
  them per page: `.crop` (sprite-sheet cropping via `--x/--y/--w/--h` +
  `--ix/--iy/--iw/--ih`), `.return` (the circular back button),
  `.wordmark`/`.wordmark--return` (the rotated "返回 return" glyphs), and
  `.header-title-centered` (centered bilingual title under the header).
- **State handoffs** — this app has no backend, so cross-page state always
  goes through the browser:
  - `localStorage` for anything that should persist across visits
    (`guitu.contacts`, `guitu.calendarEvents`, `guitu.journal`, …).
    Always wrap reads/writes in `try/catch` — some browsers (Firefox,
    notably) disable `localStorage` entirely for `file://` pages, which is
    a real code path here, not a hypothetical.
  - `sessionStorage` for a **one-shot handoff between two specific pages**
    in the same flow (`guitu.callTarget`, `guitu.addEventDraft`,
    `guitu.addContactGroup`) — set it right before navigating, read (and
    usually clear) it on the next page's load.
  - **Never a URL query param for anything that matters.** See the "clean
    URLs" warning above — a redirect a contributor doesn't control can
    silently drop it. Query params are fine only as a fallback for a
    directly-typed/bookmarked link, never the primary mechanism.
- **Seed data with a save-on-top fallback.** Pages with real content
  (Family/Friends contacts, journal entries, phrases) ship a hardcoded
  seed array matching Figma's own sample content, and anything the user
  saves is read from storage and rendered alongside it (usually ahead of
  it). Follow this pattern for a new list-style page rather than starting
  from an empty state.
- **`prefers-reduced-motion`** — any custom CSS animation you add (a
  pulse, a soundwave, a transition beyond a quick `transform`) needs a
  `@media (prefers-reduced-motion: reduce)` guard turning it off. Check an
  existing `css/*.css` file for the pattern.
- **Confirm destructive actions.** If you add a delete/remove control
  anywhere, gate it behind a confirmation (a plain `window.confirm(...)`
  is consistent with the rest of this prototype) — there's no undo
  anywhere in this app.

## Adding a new screen

1. Copy an existing page closest in shape to what you're building (a
   fixed-stage form vs. a scrolling list) and start from its HTML/CSS/JS
   rather than from scratch — the shared chrome (header, return button,
   background texture, bottom bar) is easiest to get pixel-right by
   reusing markup that already has it.
2. Give it its own `css/<page>.css` and, if it needs behaviour beyond
   static markup, `js/<page>.js` — both named to match the HTML file.
3. Add the manifest link and service-worker registration snippet every
   other page has in `<head>`/before `</body>`:
   ```html
   <link rel="manifest" href="../manifest.webmanifest">
   ...
   <script>
   if ('serviceWorker' in navigator) {
     window.addEventListener('load', function () {
       navigator.serviceWorker.register('../sw.js');
     });
   }
   </script>
   ```
4. Wire navigation in **both directions** — the link(s) leading to the new
   page, and its own return arrow / "Back to homepage" bar leading back
   out to wherever makes sense.
5. If the page carries real user-facing text and needs single-language
   tracks, duplicate it as `<page>-en.html`/`<page>-cn.html` reusing the
   bilingual version's own JS file (see `data-variant="en"`/`"cn"` on
   `<body>` and the `LANG`/`langPath()` pattern in e.g. `js/contacts.js`)
   rather than forking the script.
6. If you added a new shared asset referenced from many pages (not just
   this one), consider adding it to `PRECACHE_URLS` in `sw.js` and bump
   `CACHE_VERSION` — see the comment at the top of that file. Most assets
   don't need this; they get runtime-cached automatically the first time
   they're loaded.

## Testing your changes

There's no automated test suite — verify changes by hand in a real
browser:

- Click through the actual flow your change touches, not just the one
  screen — most features span at least two pages (an add form + the list
  it lands in).
- If localStorage-backed, reload the page after saving to confirm the
  data actually persisted, not just that the in-memory render looked
  right.
- If the page has `-en`/`-cn` siblings, check at least one of them too —
  they share the JS file, so a change usually affects all three, but
  layout/CSS issues can be language-specific (a longer English phrase
  wrapping where the Chinese one didn't, etc.).
- To test the service worker/install prompt/offline fallback, you must
  serve over `http://localhost` or HTTPS — see [Getting started](#getting-started).
- Check `prefers-reduced-motion` and keyboard/focus behavior for any new
  interactive control, not just mouse/touch.

## PWA / service worker

Every page registers `sw.js` and links `manifest.webmanifest`, so the site
installs to a phone/tablet home screen and works offline once visited.
`sw.js`'s own header comment explains the caching strategy (a small
hand-maintained precache list + network-first runtime caching for
everything else). Bump `CACHE_VERSION` there whenever the precache list
changes, or when a shipped fix needs previously-cached pages invalidated
outright — the activate handler deletes every cache that doesn't match the
current version.

Deploying anywhere other than `localhost` needs HTTPS for the service
worker to register at all (GitHub Pages, Netlify, Vercel, etc. all serve
HTTPS by default).
