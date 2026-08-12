# 归途 GuiTu — React app

A React (Vite + React Router) port of the static HTML/CSS/JS prototype that
lives one level up. Same four screens, same pixel-precise Figma layouts, same
behavior — now a real SPA you can run on a phone.

## Running it

**Use `C:\Users\cheny\dt-tester\app`, not `C:\Users\cheny\D&T tester\app`.**

The `&` in the real folder name breaks `npm`/`npx` on Windows — they're
`.cmd` files, which always run through `cmd.exe`, and `cmd.exe` treats `&` as
a command separator no matter which shell (PowerShell, Git Bash, cmd) you
launch it from. Renaming the real folder turned out to be blocked by a file
lock (likely an editor holding it open), so instead there's an NTFS junction
at `C:\Users\cheny\dt-tester` pointing at the same files — same project,
different path, same directory entry (not a copy: edits from either path
show up on both instantly). **Always `cd` into the `dt-tester` path before
running any npm command.**

```powershell
cd C:\Users\cheny\dt-tester\app
npm install       # first time only
npm run dev -- --host 0.0.0.0     # local dev server, reachable on your LAN
npm run build     # production build → dist/
npm run preview   # serve the production build locally to sanity-check it
```

Use PowerShell for these, not Git Bash — Git Bash's `cd` resolves the
junction back to the real (`&`-containing) path internally, which brings the
same failure back. This isn't a Claude-only issue: a plain PowerShell/cmd
window on this machine hits the identical error against the real path, so
the junction is the actual long-term fix, not a workaround specific to me.

## Testing on your phone

With `npm run dev -- --host 0.0.0.0` running, the terminal prints a
`Network:` URL (e.g. `http://192.168.1.75:5173/`). Open that on your phone's
browser — phone and computer need to be on the **same WiFi network**. If it
doesn't load, Windows Firewall may be blocking inbound connections to the
dev server's port; allow Node.js (or the specific port) through when
prompted, or add a rule manually.

This only works while `npm run dev` is running on your computer.

## Deploying to a public URL

`vercel.json` and `public/_redirects` are already in place (SPA fallback —
routes like `/contacts` need every path to resolve to `index.html` so
React Router can take over client-side). Deploying itself needs to happen
from your own machine/account — it's a one-time interactive login I can't
complete on your behalf:

```powershell
cd C:\Users\cheny\dt-tester\app
npx vercel        # first run: follow the prompts to log in / link a project
npx vercel --prod # promote to your production URL
```

(Netlify's `netlify deploy` works the same way if you'd rather use that —
the `_redirects` file is already there for it.)

## Architecture notes

- **`src/hooks/useStageScale.js`** — the fixed-390×844-design-scaled-to-fit
  approach every screen but Contacts uses, extracted from the static
  prototype's `app.js`/`edit.js`/`add-contact.js` (they'd each reimplemented
  the identical scaling logic).
- **`src/lib/contactsStore.jsx`** — a `ContactsProvider` Context holding
  user-added contacts for the app session, with `localStorage` as a
  best-effort persistence layer *underneath* that in-memory state, not the
  other way around. That ordering matters: some browsers (Firefox, notably)
  disable `localStorage` outright for pages not served over http(s), which
  the static prototype's `file://`-based pages actually hit. Routing every
  read through Context means Save always works this session regardless of
  whether the write beneath it succeeds — a real fix in the static site
  needed a URL-parameter fallback to get the same guarantee; here it's just
  what Context naturally gives you.
- **`src/components/BackButton.jsx`** — the return-button + wordmark chrome
  shared by every screen except Home, extracted since it was byte-identical
  across three pages in the static version.
- **Seed data** (`src/lib/seedContacts.js`) is verbatim from Figma, including
  a content inconsistency Figma itself has — Grandson Alex/Harry's Chinese
  names differ between the "My Contact" list and the reorder screen. Not
  this codebase's inconsistency to fix.
- **`.app-center`** (in `styles.css`) replaces what the static site did by
  styling `<body>` directly per-page (`.contacts-body` etc.) — fine when
  each screen was its own HTML document, not once they're routes sharing one
  `<body>`. Every fixed-390×844 page wraps its `.stage` in this; the
  real-scrolling Contacts page doesn't.

See the parent directory's `README.md` for the full design-fidelity notes
(soundwave animation, drag-to-reorder math, the `.crop`/`pointer-events`
gotcha, etc.) — all of that carried over unchanged; this file only covers
what's different about the React port itself.
