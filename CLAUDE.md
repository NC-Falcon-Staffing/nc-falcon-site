# NC Falcon site

Static HTML, CSS and JavaScript. No build step, no framework, no database.
`README.md` covers the file layout and how the CMS layer works.

## Writing

**Read `STYLE.md` before writing or editing any copy, and follow it.** It also
governs code comments, docs, commit messages, and your own replies. The rule
people forget: no em dashes, use a spaced hyphen " - " instead.

## Things that break silently in this repo

- **Paths must be root-absolute** (`/content/...`, `/css/...`). Pages exist at
  both `/` and `/es/`, so a relative path resolves to `/es/content/...` on a
  Spanish page and 404s. This once disabled the entire CMS layer on `/es/` with
  no visible error.
- **Every string lives twice**, once in `content/*.json` and once as an HTML
  fallback. Change both.
- **Spanish twins** are `_es` keys beside each English key. A filled `_es` value
  always beats its English twin, so stale Spanish is invisible from `/`.
- **`js/main.js` must not call `preventDefault` on form submit** or the Netlify
  Forms submissions stop sending.
- **Icons are named, not pasted.** `ICON_PATHS` in `js/cms-content.js` holds the
  SVG, `admin/config.yml` holds the picker list. Adding one means editing both.

## Deploying

Commit to `main` and Netlify rebuilds. Netlify bills **per production deploy**,
not per file, so batch changes into one commit. Deploy previews and branch
deploys are free.
