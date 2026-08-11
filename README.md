# NC Falcon — Website

Static site for NC Falcon Electrical Staffing. Plain HTML, CSS and JavaScript. No build step, no framework, no database.

Live at **ncfalconstaffing.com**, hosted on Netlify, deployed automatically from the `main` branch.

## Files

```
index.html            Home
about.html            About
contractors.html      For Contractors + manpower request form
electricians.html     For Electricians + application form (resume upload)
contact.html          Contact + message form + meeting request form
gallery.html          Gallery (hidden unless enabled — see below)
privacy.html          Privacy policy. Not CMS-editable — edit the HTML directly.
thank-you.html        Shown after any form submit
404.html              Not found

css/styles.css        All styling. Colours and spacing are variables at the top.
js/main.js            Mobile nav, active link, form submit state
js/cms-content.js     Loads /content JSON into the pages; holds the icon set

content/*.json        Editable page text, English + Spanish (see Editing content)
content/publish.json  The publish marker. Saving it is what deploys (see Publishing).
es/                   Spanish page set. Same structure, data-lang="es".
admin/                Site editor (Decap CMS)
images/               Logo, favicons, social preview image
images/uploads/       Photos uploaded through the site editor
scripts/              Build helpers. Never served — netlify.toml 404s /scripts/*.
netlify.toml          Publish settings, security headers, 404 rules for docs
robots.txt            Crawler rules
sitemap.xml           Public page list; update if pages are added or removed

_local-docs/          Working notes. Not committed (see .gitignore).
```

## Editing content

Text lives in `content/*.json` and is edited at **/admin** (Decap CMS). Changes commit to GitHub immediately, but **do not go live until someone presses Publish** — see [Publishing](#publishing).

**Each string exists in two places:** the JSON holds the live value, and the HTML holds the same text as a fallback shown if the JSON fails to load. If you hand-edit a file, change both or the old text reappears when JavaScript is blocked.

**Two languages.** Every text field has an English key and a Spanish twin (`title` and `title_es`). Pages under `/es/` carry `data-lang="es"` and read the `_es` value, falling back to English when it's blank, so nothing is ever empty. Nav labels, footer headings and page titles are translated in the HTML of the `/es/` tree, not through the CMS — change them there. Form field labels are still English on both trees.

**Adding a page** means adding it to both trees, with matching `hreflang` tags and two `sitemap.xml` entries.

**Paths must be root-absolute** (`/content/...`, `/css/...`). Pages exist at both `/` and `/es/`, so anything relative resolves to `/es/content/...` on a Spanish page and 404s, which silently disables the whole CMS layer there.

**Icons** are named, not pasted. `content/*.json` stores a name like `"clock"`; the SVG paths live in `ICON_PATHS` in `js/cms-content.js`, and the picker list is in `admin/config.yml`. To add one, update both. An unknown name falls back to `bolt`.

**Gallery** is toggled by `show_gallery` in `content/settings.json`, exposed in the editor as "Show the Gallery page". When off, every Gallery link is hidden and `gallery.html` redirects home. It is currently **off** and omitted from `sitemap.xml`.

## Forms

Four forms run on Netlify Forms: `contractor-request`, `electrician-application`, `contact-message`, `meeting-request`. Each needs `data-netlify="true"`, a hidden `form-name` input matching the form's name, and the `bot-field` honeypot. Submissions appear in the Netlify dashboard and are emailed on via Netlify's notification settings.

`js/main.js` must not call `preventDefault` on submit or nothing sends.

Each form carries a one-line data notice above its submit button, linking to
the privacy policy. The electrician form's wording is different from the other
three because it's the only one that collects a resume and the only one whose
data gets shared with contractors — keep them distinct.

## Privacy policy

`privacy.html` and `es/privacy.html`, linked from every footer and every form.
Not CMS-editable: it's a legal document, so it changes by commit, not by a text
box someone can edit by accident.

Three things in it are claims about how the business actually operates, not
boilerplate, and they need to stay true:

- **Retention** — two years for applications, three for enquiries. If you keep
  data longer, change the page.
- **Sharing with contractors** — it says applicant details go to a contractor
  only when NC Falcon puts that person forward for a job.
- **No cookies or tracking** — true today. **The moment anyone adds Google
  Analytics, a Meta pixel, a chat widget, or an embedded font, this becomes
  false** and the "Cookies and tracking" section has to change with it.

Update the date at the top of both language versions when you change either.

## Local preview

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Opening `index.html` directly also works, but the CMS fetches need a server.

## Publishing

Every Netlify deploy costs credits, and the site editor commits on every single
save. So not every commit deploys.

`scripts/netlify-should-build.sh` runs as Netlify's build-ignore command and
decides:

| What changed since the last deploy | What happens |
| --- | --- |
| Only `content/*.json` and/or `images/uploads/` | **No deploy.** Saved, not live. |
| `content/publish.json` | **Deploys**, carrying every change that piled up. |
| Anything else (HTML, CSS, JS, config) | **Deploys.** Developer work always ships. |

**⚠️ There is no Save button.** Decap only splits Save from Publish under
`publish_mode: editorial_workflow`, which we don't use. On every screen, the
teal **Publish** button is the only commit action — and on ordinary page
screens it means nothing more than "save my work". The gate is what decides
whether a commit becomes a deploy, not the button.

So the same button does two different things depending on where you are:

| Screen | Pressing Publish |
| --- | --- |
| Any page, settings, gallery, testimonials | Commits to GitHub. **No deploy. Not live.** |
| **🚀 GO LIVE** | Commits the marker. **Deploys everything that piled up.** |

This is why the marker collection is called **GO LIVE** and not "Publish Site" —
"press Publish to publish" would be indistinguishable from "press Publish to
save". Don't rename it back. Every other collection's description repeats the
reminder, because the sidebar is where an editor decides what to do next.

**For editors:** edit as many pages as you like, pressing Publish on each — the
work is safe in GitHub, it just isn't on the public site yet. When you're done,
open **🚀 GO LIVE**, set the date to now, write a line about what changed, and
press Publish there. That one commit pushes everything live at once. Ten pages
of edits cost one deploy instead of ten.

If the Publish button is greyed out on the GO LIVE screen, nothing on it has
changed yet — adjust the date or the note and it will enable.

**Caveat:** edits are invisible until published. There is no preview of pending
changes; the live site keeps showing the last published version, which is the
point. If you need to see something before it ships, publish it and check.

**To deploy without a content change** (rolling out code, or forcing a rebuild),
push any file outside `content/`, or hit *Trigger deploy* in the Netlify
dashboard — a manual trigger has no previous commit to compare against, so it
always builds.

Failed builds leave the previous version live; the Deploys tab has the log and
lets you roll back. A skipped build shows in the Deploys list as cancelled,
with the reason in the log.

## Security headers

`netlify.toml` sets HSTS, a Permissions-Policy, `Cross-Origin-Opener-Policy`
and a Content-Security-Policy on top of the nosniff / frame / referrer headers.

The CSP is **one policy for the whole site, including `/admin`**, and it has to
stay that way. Netlify merges every matching `[[headers]]` block, and a browser
that receives two CSP headers enforces the intersection — so adding a second,
stricter policy for the public pages would silently break the editor.

`connect-src` and `script-src` list the four hosts the editor talks to
(unpkg, auth/gateway.decapbridge.com, api.github.com). If DecapBridge ever
changes hosts, or you add an analytics or font provider, it must be added here
or the browser will block it. Symptoms are a blank editor or a silent network
failure, with the reason in the browser console.

The Decap script in `admin/index.html` is pinned **and** hash-locked with
`integrity=`. Bumping the version without regenerating the hash stops the
editor loading. The command to regenerate it is in the comment above the tag.
