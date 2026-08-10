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
thank-you.html        Shown after any form submit
404.html              Not found

css/styles.css        All styling. Colours and spacing are variables at the top.
js/main.js            Mobile nav, active link, form submit state
js/cms-content.js     Loads /content JSON into the pages; holds the icon set

content/*.json        Editable page text (see Editing content)
admin/                Site editor (Decap CMS)
images/               Logo, favicons, social preview image
netlify.toml          Publish settings, security headers, 404 rules for docs
robots.txt            Crawler rules
sitemap.xml           Public page list; update if pages are added or removed

_local-docs/          Working notes. Not committed (see .gitignore).
```

## Editing content

Text lives in `content/*.json` and is edited at **/admin** (Decap CMS). Changes commit to GitHub and redeploy automatically.

**Each string exists in two places:** the JSON holds the live value, and the HTML holds the same text as a fallback shown if the JSON fails to load. If you hand-edit a file, change both or the old text reappears when JavaScript is blocked.

**Icons** are named, not pasted. `content/*.json` stores a name like `"clock"`; the SVG paths live in `ICON_PATHS` in `js/cms-content.js`, and the picker list is in `admin/config.yml`. To add one, update both. An unknown name falls back to `bolt`.

**Gallery** is toggled by `show_gallery` in `content/settings.json`, exposed in the editor as "Show the Gallery page". When off, every Gallery link is hidden and `gallery.html` redirects home. It is currently **off** and omitted from `sitemap.xml`.

## Forms

Four forms run on Netlify Forms: `contractor-request`, `electrician-application`, `contact-message`, `meeting-request`. Each needs `data-netlify="true"`, a hidden `form-name` input matching the form's name, and the `bot-field` honeypot. Submissions appear in the Netlify dashboard and are emailed on via Netlify's notification settings.

`js/main.js` must not call `preventDefault` on submit or nothing sends.

## Local preview

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Opening `index.html` directly also works, but the CMS fetches need a server.

## Deploying

Commit to `main`. Netlify rebuilds in under a minute. Failed builds leave the previous version live; the Deploys tab has the log and lets you roll back.
