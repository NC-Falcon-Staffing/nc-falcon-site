/* NC Falcon — CMS content loader
   Reads the JSON files in /content (managed through the site editor at /admin)
   and fills them into the page. The HTML keeps its original text as a
   fallback, so the site still renders if a file is missing. */
(function () {
  "use strict";

  var page = document.body.getAttribute("data-page");

  /* Language. Spanish pages live in /es/ and carry data-lang="es".
     Every text field in /content has an English key and a Spanish twin
     ("title" and "title_es"). On a Spanish page we read the _es value and
     fall back to English when it is empty, so the page is never blank while
     translation is still in progress. */
  var LANG = document.body.getAttribute("data-lang") === "es" ? "es" : "en";
  var IS_ES = LANG === "es";

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* Pick the right language off an object. Pass the object and the English
     key; on Spanish pages this tries key_es first. Empty or missing Spanish
     falls through to English. */
  function tr(obj, key) {
    if (!obj) return undefined;
    if (IS_ES) {
      var es = obj[key + "_es"];
      if (typeof es === "string" && es.trim().length) return es;
      if (Array.isArray(es) && es.length) return es;
    }
    return obj[key];
  }

  /* Same, for a dotted path like "hero.title". Only the final segment has a
     Spanish twin; the parent objects are structure, not text. */
  function get(obj, path) {
    var parts = path.split(".");
    var last = parts.pop();
    var parent = parts.reduce(function (o, k) {
      return o == null ? undefined : o[k];
    }, obj);
    return tr(parent, last);
  }

  /* Root-absolute paths. Pages exist at / and /es/, so anything relative
     resolves differently in each tree and 404s in one of them. */
  function imgSrc(p) { return "/" + String(p || "").replace(/^\//, ""); }
  function loadJSON(path) {
    return fetch(path, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  // ---------- simple text bindings: data-cms="path.in.json" ----------
  function bindText(data) {
    document.querySelectorAll("[data-cms]").forEach(function (el) {
      var v = get(data, el.getAttribute("data-cms"));
      if (typeof v === "string" && v.length) el.textContent = v;
    });
  }

  /* Icon set. 24x24 stroke paths; stroke="currentColor" so CSS sets the colour.
     Content files store an icon NAME ("clock"); unknown names fall back to bolt.
     To add one: add the path here AND the name to the dropdown in admin/config.yml. */
  var ICON_PATHS = {
    "clock": '<circle cx="12" cy="12" r="8.7"/><path d="M12 6.8V12l3.4 2.2"/>',
    "phone": '<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 4.9 5.1 1.5 1.5 0 0 1 6.5 3.5z"/>',
    "shield-check": '<path d="M12 3l7.5 2.8v5.7c0 4.7-3.2 7.6-7.5 8.5-4.3-.9-7.5-3.8-7.5-8.5V5.8z"/><path d="M8.8 12.2l2.2 2.2 4.2-4.4"/>',
    "shield": '<path d="M12 3l7.5 2.8v5.7c0 4.7-3.2 7.6-7.5 8.5-4.3-.9-7.5-3.8-7.5-8.5V5.8z"/>',
    "sliders": '<path d="M4 8h9M19 8h1M4 16h5M15 16h5"/><circle cx="16" cy="8" r="2.4"/><circle cx="12" cy="16" r="2.4"/>',
    "map-pin": '<path d="M12 21.2c4.4-4.6 6.6-8.1 6.6-10.6a6.6 6.6 0 1 0-13.2 0c0 2.5 2.2 6 6.6 10.6z"/><circle cx="12" cy="10.4" r="2.4"/>',
    "banknote": '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6.2 12h.01M17.8 12h.01"/>',
    "users": '<circle cx="8.6" cy="8.2" r="3.2"/><path d="M2.8 19.6a5.8 5.8 0 0 1 11.6 0"/><circle cx="17.4" cy="9.6" r="2.4"/><path d="M16 14.4a4.8 4.8 0 0 1 5.2 5.2"/>',
    "chat": '<path d="M20.5 12a8 8 0 0 1-8.5 8 9 9 0 0 1-3.2-.6L3.5 21l1.3-4.5A8 8 0 1 1 20.5 12z"/>',
    "trend-up": '<path d="M3 16.5l5.6-5.6 3.5 3.5L20.2 6"/><path d="M15 6h5.2v5.2"/>',
    "home": '<path d="M3.5 10.8L12 3.5l8.5 7.3"/><path d="M5.9 9.6V20h12.2V9.6"/>',
    "calendar": '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M8 2.8v4M16 2.8v4M3.5 10.5h17"/>',
    "envelope": '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.9 7.2l9.1 6 9.1-6"/>',
    "briefcase": '<rect x="2.5" y="7.5" width="19" height="12" rx="2"/><path d="M8.5 7.5V5.8a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.7"/><path d="M2.5 12.6h19"/>',
    "clipboard": '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.6V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5v1.1"/><path d="M9 11h6M9 14.8h4"/>',
    "bolt": '<path d="M13.6 2.4L5 13.6h5.6l-1.2 8L18.6 10.4H13z"/>',
    "hard-hat": '<path d="M2.6 18h18.8"/><path d="M5.6 18v-1.4a6.4 6.4 0 0 1 12.8 0V18"/><path d="M9.9 16.6v-4.3a2.1 2.1 0 0 1 4.2 0v4.3"/>'
  };

  function icon(name) {
    var p = ICON_PATHS[name] || ICON_PATHS.bolt;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>";
  }

  // ---------- list renderers: data-cms-list="path" data-cms-type="cards" ----------
  var renderers = {
    cards: function (items) {
      return items.map(function (i) {
        return '<div class="card"><div class="icon">' + icon(i.icon) + "</div><h3>" +
          esc(tr(i, "title")) + "</h3><p>" + esc(tr(i, "text")) + "</p></div>";
      }).join("");
    },
    steps: function (items) {
      return items.map(function (i, n) {
        return '<div class="card"><div class="icon">' + (n + 1) + "</div><h3>" +
          esc(tr(i, "title")) + "</h3><p>" + esc(tr(i, "text")) + "</p></div>";
      }).join("");
    },
    stats: function (items) {
      return items.map(function (i) {
        return '<div class="stat"><div class="num">' + esc(tr(i, "number")) +
          '</div><div class="label">' + esc(tr(i, "label")) + "</div></div>";
      }).join("");
    },
    pills: function (items) {
      return items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("");
    },
    positions: function (items) {
      return items.map(function (i) {
        return "<li><strong>" + esc(tr(i, "name")) + "</strong> — " + esc(tr(i, "description")) + "</li>";
      }).join("");
    },
    checksStrong: function (items) {
      return items.map(function (i) { return "<li><strong>" + esc(i) + "</strong></li>"; }).join("");
    },
    checksPlain: function (items) {
      return items.map(function (i) {
        return "<li>" + esc(typeof i === "string" ? i : tr(i, "text")) + "</li>";
      }).join("");
    },
    storyParas: function (items) {
      return items.map(function (i, n) {
        var last = n === items.length - 1 ? "margin-bottom:0;" : "";
        return '<p style="color:var(--gray-200);' + last + '">' + esc(tr(i, "text")) + "</p>";
      }).join("");
    },
    teamCards: function (items) {
      return items.map(function (i) {
        return '<div class="card" style="background:var(--navy-700);border-color:var(--navy-500);">' +
          '<h3 style="color:#fff;">' + esc(tr(i, "title")) + '</h3>' +
          '<p style="color:var(--gray-200);">' + esc(tr(i, "text")) + "</p></div>";
      }).join("");
    }
  };

  function bindLists(data) {
    document.querySelectorAll("[data-cms-list]").forEach(function (el) {
      var items = get(data, el.getAttribute("data-cms-list"));
      var type = el.getAttribute("data-cms-type");
      if (Array.isArray(items) && items.length && renderers[type]) {
        el.innerHTML = renderers[type](items);
      }
    });
  }

  // ---------- site-wide settings (footer, emails, contact details) ----------
  function applySettings(s) {
    if (!s) return;

    // Gallery on/off, set by "Show the Gallery page" in the site editor.
    // When off: hide every Gallery link, and redirect gallery.html to home.
    if (s.show_gallery !== true) {
      document.querySelectorAll('a[href$="gallery.html"]').forEach(function (a) {
        var li = a.closest("li");
        (li || a).style.display = "none";
      });
      if (page === "gallery") {
        window.location.replace(IS_ES ? "/es/index.html" : "/index.html");
        return;
      }
    }

    // Footer description + motto
    var desc = document.querySelector(".site-footer .footer-brand p");
    var fd = tr(s, "footer_description");
    if (desc && fd) desc.textContent = fd;
    var bottom = document.querySelectorAll(".site-footer .footer-bottom > span");
    var fm = tr(s, "footer_motto");
    if (bottom.length > 1 && fm) bottom[1].textContent = fm;

    // Footer contact column. Match the plain-text items (those with no link)
    // by position among themselves, so adding a linked item above them
    // doesn't shift the wrong line.
    var lists = document.querySelectorAll(".site-footer ul.footer-links");
    var contactList = lists.length ? lists[lists.length - 1] : null;
    if (contactList) {
      var plain = [].filter.call(contactList.children, function (li) {
        return !li.querySelector("a");
      });
      var loc = tr(s, "location"), area = tr(s, "service_area");
      if (plain[0] && loc) plain[0].textContent = loc;
      if (plain[1] && area) plain[1].textContent = area;
    }

    // Every phone link on the site (footer + contact page)
    if (s.phone) {
      var telHref = "tel:+1" + s.phone.replace(/[^0-9]/g, "").replace(/^1/, "");
      document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
        a.setAttribute("href", telHref);
        a.textContent = s.phone;
      });
    }

    // Every email link on the site (footer + inline text)
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      var href = a.getAttribute("href").toLowerCase();
      var email = null;
      if (href.indexOf("info@ncfalconstaffing.com") !== -1 && s.email_general) email = s.email_general;
      if (href.indexOf("careers@ncfalconstaffing.com") !== -1 && s.email_careers) email = s.email_careers;
      if (email) {
        a.setAttribute("href", "mailto:" + email);
        if (a.textContent.indexOf("@") !== -1) a.textContent = email;
      }
    });

    // Explicit settings bindings (contact page details)
    document.querySelectorAll("[data-cms-setting]").forEach(function (el) {
      var v = tr(s, el.getAttribute("data-cms-setting"));
      if (typeof v === "string" && v.length) el.textContent = v;
    });
  }

  // ---------- gallery ----------
  function applyGallery(data) {
    var grid = document.querySelector("[data-gallery]");
    if (!grid || !data) return;
    var photos = data.photos;
    if (Array.isArray(photos) && photos.length) {
      grid.innerHTML = photos.map(function (p) {
        return '<figure class="gallery-photo"><img src="' + esc(imgSrc(p.image)) +
          '" alt="' + esc(p.caption) + '" loading="lazy" />' +
          "<figcaption>" + esc(p.caption) + "</figcaption></figure>";
      }).join("");
      var notice = document.querySelector("[data-gallery-notice]");
      if (notice) notice.remove();
    }
  }

  // ---------- testimonials (home page) ----------
  function applyTestimonials(data) {
    var section = document.querySelector("[data-testimonials-section]");
    var grid = document.querySelector("[data-testimonials]");
    if (!section || !grid || !data) return;
    var items = data.items;
    if (Array.isArray(items) && items.length) {
      if (data.section) {
        var eb = section.querySelector(".eyebrow");
        var h2 = section.querySelector("h2");
        // Read through tr() like every other binding, or the Spanish page
        // shows the English heading no matter what eyebrow_es / title_es say.
        var ebTxt = tr(data.section, "eyebrow");
        var h2Txt = tr(data.section, "title");
        if (eb && ebTxt) eb.textContent = ebTxt;
        if (h2 && h2Txt) h2.textContent = h2Txt;
      }
      grid.innerHTML = items.map(function (t) {
        // Same for role: test the translated value, not the English key, so a
        // testimonial with only role_es filled in still shows its role.
        var role = tr(t, "role");
        return '<div class="card testimonial">' +
          "<blockquote>“" + esc(tr(t, "quote")) + "”</blockquote>" +
          '<div class="who"><strong>' + esc(tr(t, "author")) + "</strong>" +
          (role ? '<span> · ' + esc(role) + "</span>" : "") + "</div></div>";
      }).join("");
      section.hidden = false;
    }
  }

  // ---------- boot ----------
  var jobs = [loadJSON("/content/settings.json").then(applySettings)];

  if (page) {
    jobs.push(loadJSON("/content/" + page + ".json").then(function (data) {
      if (!data) return;
      bindText(data);
      bindLists(data);
      if (page === "gallery") applyGallery(data);
    }));
  }
  if (page === "home") {
    jobs.push(loadJSON("/content/testimonials.json").then(applyTestimonials));
  }
})();
