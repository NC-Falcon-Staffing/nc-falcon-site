/* NC Falcon — shared site scripts */
(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      var expanded = links.classList.contains("open");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  }

  // Mark current page link active. Compare filenames, because links are
  // relative in the English tree ("about.html") and absolute in the Spanish
  // one ("/es/about.html").
  var here = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href.charAt(0) === "#" || /^(https?:|mailto:|tel:)/.test(href)) return;
    var target = href.split("#")[0].split("/").pop() || "index.html";
    if (target === here) a.classList.add("active");
  });

  /* Forms POST natively to Netlify Forms and redirect to /thank-you.html.
     This only adds a submitting state and guards double-clicks.
     Do NOT preventDefault here, or submissions stop sending. */
  document.querySelectorAll("form[data-nc-form]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    var submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener("submit", function () {
      // Let the browser run its own required-field validation first.
      if (typeof form.checkValidity === "function" && !form.checkValidity()) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.textContent = "Sending…";
      }
      if (status) {
        status.textContent = "Sending your message…";
        status.style.color = "#0f2542";
        status.style.fontWeight = "600";
      }

      // If the navigation is blocked or slow, restore the button so the
      // visitor isn't stuck staring at a dead form.
      setTimeout(function () {
        if (submitBtn && submitBtn.disabled) {
          submitBtn.disabled = false;
          if (submitBtn.dataset.label) submitBtn.textContent = submitBtn.dataset.label;
        }
      }, 10000);
    });
  });
})();
