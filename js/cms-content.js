/* NC Falcon — CMS content loader
   Reads the JSON files in /content (managed through the site editor at /admin)
   and fills them into the page. The HTML keeps its original text as a
   fallback, so the site still renders if a file is missing. */
(function () {
  "use strict";

  var page = document.body.getAttribute("data-page");

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function get(obj, path) {
    return path.split(".").reduce(function (o, k) {
      return o == null ? undefined : o[k];
    }, obj);
  }
  function imgSrc(p) { return String(p || "").replace(/^\//, ""); }
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

  // ---------- list renderers: data-cms-list="path" data-cms-type="cards" ----------
  var renderers = {
    cards: function (items) {
      return items.map(function (i) {
        return '<div class="card"><div class="icon">' + esc(i.icon) + "</div><h3>" +
          esc(i.title) + "</h3><p>" + esc(i.text) + "</p></div>";
      }).join("");
    },
    steps: function (items) {
      return items.map(function (i, n) {
        return '<div class="card"><div class="icon">' + (n + 1) + "</div><h3>" +
          esc(i.title) + "</h3><p>" + esc(i.text) + "</p></div>";
      }).join("");
    },
    stats: function (items) {
      return items.map(function (i) {
        return '<div class="stat"><div class="num">' + esc(i.number) +
          '</div><div class="label">' + esc(i.label) + "</div></div>";
      }).join("");
    },
    pills: function (items) {
      return items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("");
    },
    positions: function (items) {
      return items.map(function (i) {
        return "<li><strong>" + esc(i.name) + "</strong> — " + esc(i.description) + "</li>";
      }).join("");
    },
    checksStrong: function (items) {
      return items.map(function (i) { return "<li><strong>" + esc(i) + "</strong></li>"; }).join("");
    },
    checksPlain: function (items) {
      return items.map(function (i) { return "<li>" + esc(i.text == null ? i : i.text) + "</li>"; }).join("");
    },
    storyParas: function (items) {
      return items.map(function (i, n) {
        var last = n === items.length - 1 ? "margin-bottom:0;" : "";
        return '<p style="color:var(--gray-200);' + last + '">' + esc(i.text) + "</p>";
      }).join("");
    },
    teamCards: function (items) {
      return items.map(function (i) {
        return '<div class="card" style="background:var(--navy-700);border-color:var(--navy-500);">' +
          '<h3 style="color:#fff;">' + esc(i.title) + '</h3>' +
          '<p style="color:var(--gray-200);">' + esc(i.text) + "</p></div>";
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

    // Footer description + motto
    var desc = document.querySelector(".site-footer .footer-brand p");
    if (desc && s.footer_description) desc.textContent = s.footer_description;
    var bottom = document.querySelectorAll(".site-footer .footer-bottom > span");
    if (bottom.length > 1 && s.footer_motto) bottom[1].textContent = s.footer_motto;

    // Footer contact column. Order: info email, careers email, phone,
    // location, service area. Match the plain-text items (no link inside)
    // by position among themselves so adding/removing linked items above
    // them doesn't silently shift the wrong text.
    var lists = document.querySelectorAll(".site-footer ul.footer-links");
    var contactList = lists.length ? lists[lists.length - 1] : null;
    if (contactList) {
      var plain = [].filter.call(contactList.children, function (li) {
        return !li.querySelector("a");
      });
      if (plain[0] && s.location) plain[0].textContent = s.location;
      if (plain[1] && s.service_area) plain[1].textContent = s.service_area;
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
      var v = s[el.getAttribute("data-cms-setting")];
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
        if (eb && data.section.eyebrow) eb.textContent = data.section.eyebrow;
        if (h2 && data.section.title) h2.textContent = data.section.title;
      }
      grid.innerHTML = items.map(function (t) {
        return '<div class="card testimonial">' +
          "<blockquote>“" + esc(t.quote) + "”</blockquote>" +
          '<div class="who"><strong>' + esc(t.author) + "</strong>" +
          (t.role ? '<span> · ' + esc(t.role) + "</span>" : "") + "</div></div>";
      }).join("");
      section.hidden = false;
    }
  }

  // ---------- boot ----------
  var jobs = [loadJSON("content/settings.json").then(applySettings)];

  if (page) {
    jobs.push(loadJSON("content/" + page + ".json").then(function (data) {
      if (!data) return;
      bindText(data);
      bindLists(data);
      if (page === "gallery") applyGallery(data);
    }));
  }
  if (page === "home") {
    jobs.push(loadJSON("content/testimonials.json").then(applyTestimonials));
  }
})();
