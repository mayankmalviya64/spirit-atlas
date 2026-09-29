/* =====================================================================
   Spirit Atlas — Google Analytics (GA4)
   ---------------------------------------------------------------------
   What this file does:
     1. Loads Google's tracking script (gtag.js) using our Measurement ID.
        GA4 then records page views automatically.
     2. Listens to the site's event bus (Atlas.bus in core.js) and sends
        every interaction event (story_chapter_viewed, hub_tool_opened,
        myth_flipped, …) to GA as a custom event.

   Setup: paste your GA4 Measurement ID (looks like "G-XXXXXXXXXX") below.
   While it is empty, this file does nothing at all, so it is safe to ship.

   Load order matters: include this AFTER shared/core.js on each page.
   ===================================================================== */
(function () {
  "use strict";

  var GA_ID = ""; // ← paste your Measurement ID here, e.g. "G-AB12CD34EF"

  // No ID yet → skip tracking completely.
  if (!GA_ID) return;

  /* ---------- 1. Load gtag.js (Google's standard snippet) ---------- */
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  // gtag() just queues commands in dataLayer until Google's script loads.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID); // sends the page_view

  /* ---------- 2. Forward event-bus events to GA ---------- */
  var bus = window.Atlas && window.Atlas.bus;
  if (!bus) return; // core.js not loaded — page views still work

  // Some events fire many times in a row (e.g. dragging the calculator
  // slider fires on every tiny move). We only need to know they were used,
  // so these are sent at most once per page load.
  var ONCE_PER_PAGE = { calculator_used: true };
  var alreadySent = {};

  // Wrap the existing emit() so every event also goes to GA.
  // The original listeners still run exactly as before.
  var originalEmit = bus.emit;
  bus.emit = function (name, payload) {
    originalEmit.call(bus, name, payload);

    if (ONCE_PER_PAGE[name]) {
      if (alreadySent[name]) return;
      alreadySent[name] = true;
    }
    window.gtag("event", name, payload || {});
  };
})();
