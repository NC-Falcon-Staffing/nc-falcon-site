# NC Falcon — Website

Static website for NC Falcon, a family-owned electrical staffing company in Charlotte, NC. Built as plain HTML/CSS/JavaScript so it loads fast, costs nothing to host, and isn't locked to any platform.

## Pages

| File | Page |
|------|------|
| `index.html` | Home |
| `about.html` | About Us (mission, story, values, team, future growth) |
| `contractors.html` | For Contractors + manpower request form |
| `electricians.html` | For Electricians + application form (resume upload) |
| `contact.html` | Contact + general message form + meeting request form |
| `gallery.html` | Gallery (placeholder tiles for real photos) |

Shared assets: `css/styles.css` (navy/gray/white theme) and `js/main.js` (mobile nav + form handling).

## Logo & favicon

The real Falcon logo is used site-wide (the "ELECTRICAL SERVICE" tagline was cropped off per the brand's request). Files in `images/`:

| File | Use |
|------|-----|
| `falcon-logo.png` | Full-res navy logo, transparent background (master — use for print/large sizes) |
| `falcon-logo-white.png` | Full-res white version for dark backgrounds (master) |
| `falcon-logo-web.png` | Optimized navy logo shown in the header |
| `falcon-logo-white-web.png` | Optimized white logo shown in the navy footer |
| `favicon.ico`, `favicon-16/32/48/180.png` | Browser tab + mobile home-screen icons (the eagle mark) |
| `updatedfalconlogo.jpeg` | Original supplied logo (source, kept for reference) |

Note: these are raster (PNG) versions traced/derived from the supplied image. For truck wraps, signage, or large print, get the original **vector** file (`.ai`, `.eps`, or `.svg`) from the logo designer.

## Viewing it locally

Double-click `index.html` to open in a browser. For a closer-to-production preview, run a quick local server from this folder:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Going live (hosting)

Any static host works. Easiest free options:

- **Netlify** — drag this whole folder onto app.netlify.com. Bonus: Netlify Forms works automatically (see Forms below).
- **GitHub Pages** — push the folder to a repo, enable Pages.
- **Your own domain** — upload these files to any web host's public folder.

## Forms (important — currently in demo mode)

The three forms (contractor request, electrician application, contact/meeting) do **not** send anywhere yet. On submit they show a confirmation message but no email goes out. To activate them, pick one:

**Option A — Formspree (works on any host)**
1. Create a free form at https://formspree.io and copy your form URL (looks like `https://formspree.io/f/abcd1234`).
2. Open `js/main.js`, find the line `var FORM_ENDPOINT = "";` and put your URL between the quotes.
3. Set the form to forward to `info@ncfalcon.com` (and `careers@ncfalcon.com` for the application form) in Formspree's settings.

**Option B — Netlify Forms (only if hosted on Netlify)**
1. Add `netlify` to each `<form ...>` tag, e.g. `<form data-nc-form name="contractor-request" netlify>`.
2. Deploy. Submissions appear in your Netlify dashboard and can email you.

Resume upload on the electrician form activates automatically once an endpoint is connected (Formspree paid tier or Netlify handle file uploads).

## Hero background video (Home page)

The Home page hero plays a muted, looping background video behind the headline, with a dark navy overlay so the text stays readable. Until a video file is added, it shows `images/hero-poster.svg` (a clean branded gradient) — so it never looks broken.

**To add the video:**
1. Download a free construction/electrical clip (see links below).
2. Save it as `images/hero.mp4`. That's it — the hero picks it up automatically.

Tips for a good hero video:
- Landscape, ~1920×1080, ideally under ~10–15 MB so the page loads fast (trim to 10–20 seconds; it loops).
- Slow, steady footage reads better than fast cuts behind text.
- Want a still-image fallback poster instead of the gradient? Save a `hero-poster.jpg` and change the `poster="images/hero-poster.svg"` attribute in `index.html` to `.jpg`.

**Free, license-friendly sources (no attribution required):**
- Pexels Videos — https://www.pexels.com/search/videos/construction/ and https://www.pexels.com/search/videos/electrician/
- Coverr — https://coverr.co/s?q=construction
- Mixkit — https://mixkit.co/free-stock-video/construction/

Download the MP4, rename to `hero.mp4`, drop it in `images/`.

## Adding real photos (gallery)

The brief calls for real photos over stock. To replace the gallery placeholders:
1. Put image files in an `images/` folder (create it).
2. In `gallery.html`, replace each `<div class="ph">…</div>` with `<img src="images/your-photo.jpg" alt="description" />`.

Suggested shots: team group photo, crew working, electrical installations, jobsites, ownership, company gatherings, candid culture shots.

## Still to add (from the project brief)

- Final company logo (currently a ⚡ placeholder in the header/footer)
- Real phone number (placeholder on Contact page)
- Real photos
- Contractor & electrician testimonials (sections can be added)
- Social media links
- Spanish version (site is built English-first; see below)

## Spanish version (EN/ES)

The brief requires English + Spanish. The site is built English-first with an "ES" toggle already in the nav (currently inactive). When ready, the cleanest approach: duplicate each page into an `/es/` folder with translated copy, and point the toggle at the matching Spanish page.

## Editing tips

- Header and footer are repeated in each HTML file. If you change one (e.g. add the phone number), update it across all six pages.
- Colors, fonts, and spacing are all controlled by the variables at the top of `css/styles.css`.
- The amber accent color (`--accent`) is used sparingly for buttons/highlights against the navy.
