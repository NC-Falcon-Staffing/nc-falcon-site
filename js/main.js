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

  // Mark current page link active
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });

  /* ------------------------------------------------------------------
     Form handling.
     Forms POST natively to Netlify Forms (data-netlify="true" in the
     markup) and redirect to /thank-you.html on success. Submissions
     appear in the Netlify dashboard under Forms, and can be emailed on
     to info@ / careers@ via Netlify's notification settings.

     This script only adds a submitting state and guards against
     double-clicks; it must NOT preventDefault, or nothing gets sent.
     ------------------------------------------------------------------ */
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
