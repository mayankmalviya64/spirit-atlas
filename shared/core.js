/* =====================================================================
   SPIRIT ATLAS — CORE (shared building blocks)
   ---------------------------------------------------------------------
   Each function here renders ONE feature into a container element,
   reading everything from window.ATLAS_DATA. Pages decide WHERE to put
   features; this file decides HOW they work.

   Contents:
     1. Event bus (no-op for now — Phase 2 feeds XP/badges from it)
     2. Lookups & small helpers
     3. Theme toggle + age gate
     4. Detail drawer
     5. Category explorer (filters + tree)
     6. Regional atlas
     7. Alcohol math calculator
     8. Myths, glossary, matchmaker, portfolios, ticker, global search
   ===================================================================== */
(function () {
  "use strict";
  var D = window.ATLAS_DATA;
  var Atlas = {};

  /* ---------------- 1. EVENT BUS ---------------- */
  // Every interesting user action calls Atlas.bus.emit("event_name", {...}).
  // Right now nothing listens. PHASE 2 HOOK: register listeners with
  // Atlas.bus.on(...) to award XP, unlock badges, stamp the passport, etc.
  Atlas.bus = {
    listeners: {},
    on: function (name, fn) { (this.listeners[name] = this.listeners[name] || []).push(fn); },
    emit: function (name, payload) {
      (this.listeners[name] || []).forEach(function (fn) { fn(payload); });
    }
  };

  /* ---------------- 2. LOOKUPS & HELPERS ---------------- */
  // Build "id → entity" maps once, so we can find anything instantly.
  function indexById(list) {
    var map = {};
    list.forEach(function (item) { map[item.id] = item; });
    return map;
  }
  var byId = {
    family: indexById(D.families), category: indexById(D.categories),
    company: indexById(D.companies), brand: indexById(D.brands),
    sku: indexById(D.skus), region: indexById(D.regions),
    regional: indexById(D.regionalDrinks), glossary: indexById(D.glossary)
  };
  Atlas.byId = byId;

  // Escape text before putting it into HTML (keeps the markup safe and valid).
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  Atlas.esc = esc;

  // [40, 40] → "40%"   [4.5, 8] → "4.5–8%"
  function fmtAbv(range) {
    if (!range) return "—";
    return range[0] === range[1] ? range[0] + "%" : range[0] + "–" + range[1] + "%";
  }
  Atlas.fmtAbv = fmtAbv;

  var TIERS = ["value", "mainstream", "premium", "luxury"];
  function tierLabel(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : "—"; }

  // Walk up the tree: brand → category → family
  function familyOfBrand(b) { return byId.family[byId.category[b.categoryId].familyId]; }

  // Small ⚠️ badge for facts we're not sure about.
  function flagHtml(item) {
    return item.flag ? '<p class="flag" role="note">⚠️ Unverified: ' + esc(item.flag) + "</p>" : "";
  }

  // Respect users who prefer less motion.
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Count a number up from 0 (the "animated counter" micro-interaction).
  function animateNumber(el, to, decimals) {
    if (reduceMotion) { el.textContent = to.toFixed(decimals); return; }
    var start = performance.now(), from = parseFloat(el.dataset.last || 0), dur = 450;
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (from + (to - from) * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(step);
    }
    el.dataset.last = to;
    requestAnimationFrame(step);
  }

  /* ---------------- 3. THEME + AGE GATE ---------------- */
  // Theme: light/dark. The choice is remembered in localStorage (a convenience only).
  Atlas.initTheme = function (button) {
    var saved = null;
    try { saved = localStorage.getItem("atlas-theme"); } catch (e) { /* storage blocked: fine */ }
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    function current() {
      var t = document.documentElement.getAttribute("data-theme");
      if (t) return t;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    function label() { button.setAttribute("aria-label", "Switch to " + (current() === "dark" ? "light" : "dark") + " mode"); button.textContent = current() === "dark" ? "☀" : "☾"; }
    label();
    button.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("atlas-theme", next); } catch (e) {}
      label();
    });
  };

  // Drinking-age notice: slides up in the bottom bar on first visit of the day,
  // disappears after 5 seconds (or when × is pressed). Replaces the old modal age gate.
  // "Once per day" = we store today's date in localStorage (only in this browser, never sent anywhere).
  // `link` = where "Know your limits" points, e.g. { href: "#health" } or { href: "#hub", jump: "health" }.
  Atlas.initNotice = function (link) {
    var KEY = "atlas-notice-day", today = new Date().toDateString();
    var seen = null;
    try { seen = localStorage.getItem(KEY); } catch (e) { /* storage blocked: just show it */ }
    if (seen === today) return; // already shown today

    var bar = document.createElement("div");
    bar.className = "disclaimer";
    bar.setAttribute("role", "note");
    bar.innerHTML = "<p>" + esc(D.locale.noticeText) + ' <a href="' + esc(link.href) + '"' +
      (link.jump ? ' data-jump="' + esc(link.jump) + '"' : "") + ">Know your limits →</a></p>" +
      '<button class="disclaimer-close" type="button" aria-label="Dismiss notice">×</button>';
    document.body.appendChild(bar);
    try { localStorage.setItem(KEY, today); } catch (e) {}

    // Slide out, then remove from the page once the animation has finished.
    function hide() {
      bar.classList.add("is-hiding");
      setTimeout(function () { bar.remove(); }, 400);
    }
    bar.querySelector(".disclaimer-close").addEventListener("click", hide);
    setTimeout(hide, 5000);
  };

  /* ---------------- 4. DETAIL DRAWER ---------------- */
  // One <dialog> slides in from the side and shows details for any entity.
  var drawer;
  function ensureDrawer() {
    if (drawer) return drawer;
    drawer = document.createElement("dialog");
    drawer.className = "drawer";
    drawer.setAttribute("aria-label", "Details");
    drawer.innerHTML = '<button class="drawer-close" aria-label="Close details">×</button><div class="drawer-body"></div>';
    document.body.appendChild(drawer);
    drawer.querySelector(".drawer-close").addEventListener("click", function () { drawer.close(); });
    // Clicking the dark backdrop (outside the panel) closes it.
    drawer.addEventListener("click", function (e) { if (e.target === drawer) drawer.close(); });
    return drawer;
  }

  // A row of "label: value" facts inside the drawer.
  function facts(rows) {
    return '<dl class="facts">' + rows.filter(function (r) { return r[1]; }).map(function (r) {
      return "<dt>" + esc(r[0]) + "</dt><dd>" + r[1] + "</dd>";
    }).join("") + "</dl>";
  }
  function chip(text, type, id, famId) {
    return '<button class="chip" data-open-type="' + type + '" data-open-id="' + id + '"' +
      (famId ? ' style="--fam: var(--fam-' + famId + ')"' : "") + ">" + esc(text) + "</button>";
  }

  // Build the drawer HTML for each kind of entity.
  function detailHtml(type, id) {
    var e, cat, fam, co, html = "";
    if (type === "family") {
      e = byId.family[id];
      html = '<p class="eyebrow">Family</p><h2>' + esc(e.name) + "</h2><p>" + esc(e.blurb) + "</p>" +
        "<h3>Categories</h3><div class=\"chips\">" +
        D.categories.filter(function (c) { return c.familyId === id; }).map(function (c) { return chip(c.name, "category", c.id, id); }).join("") + "</div>";
      return { html: html, fam: id };
    }
    if (type === "category") {
      e = byId.category[id]; fam = byId.family[e.familyId];
      var tiers = TIERS.filter(function (t) { return D.brands.some(function (b) { return b.categoryId === id && b.tier === t; }); });
      html = '<p class="eyebrow">' + esc(fam.name) + " · Category</p><h2>" + esc(e.name) + "</h2>" +
        facts([["ABV range", fmtAbv(e.abv)], ["Base", esc(e.base)], ["How it's made", esc(e.howMade)],
          ["Flavour", esc(e.flavour)], ["Serve", esc(e.serve)], ["Glass", esc(e.glass)],
          ["Price tiers", tiers.map(tierLabel).join(" · ")]]) +
        '<div class="funfact"><strong>Did you know?</strong> ' + esc(e.funFact) + "</div>";
      return { html: html, fam: fam.id };
    }
    if (type === "company") {
      e = byId.company[id];
      var owned = D.brands.filter(function (b) { return b.companyId === id; });
      html = '<p class="eyebrow">Parent company · as of ' + D.ownershipAsOf + "</p><h2>" + esc(e.name) + "</h2>" +
        facts([["Headquarters", esc(e.hq)], ["In this atlas", owned.length + " brands"]]) + "<p>" + esc(e.note) + "</p>" +
        "<h3>Brands</h3><div class=\"chips\">" + owned.map(function (b) { return chip(b.name, "brand", b.id, familyOfBrand(b).id); }).join("") + "</div>";
      return { html: html };
    }
    if (type === "brand" || type === "sku") {
      var s = null;
      if (type === "sku") { s = byId.sku[id]; e = byId.brand[s.brandId]; } else { e = byId.brand[id]; }
      cat = byId.category[e.categoryId]; fam = byId.family[cat.familyId]; co = byId.company[e.companyId];
      var kids = D.skus.filter(function (k) { return k.brandId === e.id; });
      html = '<p class="eyebrow">' + esc(cat.name) + " · " + (s ? "Bottle" : "Brand") + "</p><h2>" + esc(s ? s.name : e.name) + "</h2>" +
        facts([["ABV", fmtAbv(s ? s.abv : e.abv)], ["Owner (2026)", chip(co.name, "company", co.id)],
          ["Origin", esc(e.origin)], ["Price tier", tierLabel((s && s.tier) || e.tier)],
          ["Base", esc(cat.base)], ["How it's made", esc(cat.howMade)], ["Flavour", esc(cat.flavour)],
          ["Serve & glass", esc(cat.serve + " · " + cat.glass)]]) +
        (e.note ? "<p>" + esc(e.note) + "</p>" : "") +
        '<div class="funfact"><strong>Did you know?</strong> ' + esc(e.funFact || cat.funFact) + "</div>" +
        flagHtml(e) +
        (kids.length ? "<h3>Bottles</h3><div class=\"chips\">" + kids.map(function (k) { return chip(k.name + " · " + fmtAbv(k.abv), "sku", k.id, fam.id); }).join("") + "</div>" : "");
      return { html: html, fam: fam.id };
    }
    if (type === "regional") {
      e = byId.regional[id];
      html = '<p class="eyebrow">Heritage drink</p><h2>' + esc(e.name) + "</h2>" +
        facts([["Where", e.regionIds.map(function (r) { return esc(byId.region[r].name); }).join(", ")],
          ["ABV", esc(e.abvText)], ["Base", esc(e.base)], ["How it's drunk", esc(e.consumed)],
          ["Culture", esc(e.context)], ["Example", esc(e.example)]]) + flagHtml(e);
      return { html: html };
    }
    if (type === "glossary") {
      e = byId.glossary[id];
      return { html: '<p class="eyebrow">Glossary</p><h2>' + esc(e.name) + "</h2><p>" + esc(e.definition) + "</p>" };
    }
    return { html: "<p>Not found.</p>" };
  }

  Atlas.openDetail = function (type, id) {
    var d = ensureDrawer(), res = detailHtml(type, id);
    d.querySelector(".drawer-body").innerHTML = res.html;
    d.style.setProperty("--fam", res.fam ? "var(--fam-" + res.fam + ")" : "var(--accent)");
    if (!d.open) d.showModal();
    d.querySelector(".drawer-body").scrollTop = 0;
    Atlas.bus.emit("node_opened", { type: type, id: id });
  };

  // Any element with data-open-type/data-open-id opens the drawer when clicked.
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-open-type]");
    if (t) Atlas.openDetail(t.getAttribute("data-open-type"), t.getAttribute("data-open-id"));
  });

  /* ---------------- 5. CATEGORY EXPLORER ---------------- */
  // Filter state is a simple object; changing it re-draws the tree.
  Atlas.renderExplorer = function (root) {
    var state = { families: {}, abvMin: 0, abvMax: 60, tier: "", origin: "" };
    // Which tree rows are open. Families start open.
    var open = {};
    D.families.forEach(function (f) { open["f:" + f.id] = true; });

    var origins = Array.from(new Set(D.brands.map(function (b) { return b.origin; }))).filter(function (o) { return o !== "—"; }).sort();

    root.innerHTML =
      '<div class="filters" role="group" aria-label="Filters">' +
      '<div class="filter-fams">' + D.families.map(function (f) {
        return '<button class="chip fam-chip" aria-pressed="false" data-fam="' + f.id + '" style="--fam: var(--fam-' + f.id + ')">' + esc(f.name) + "</button>";
      }).join("") + "</div>" +
      '<label class="filter"><span>ABV <output data-out="min">0</output>% to <output data-out="max">60</output>%</span>' +
      '<span class="range2"><input type="range" min="0" max="60" step="0.5" value="0" data-abv="min" aria-label="Minimum ABV">' +
      '<input type="range" min="0" max="60" step="0.5" value="60" data-abv="max" aria-label="Maximum ABV"></span></label>' +
      '<label class="filter">Price tier <select data-tier><option value="">All tiers</option>' +
      TIERS.map(function (t) { return '<option value="' + t + '">' + tierLabel(t) + "</option>"; }).join("") + "</select></label>" +
      '<label class="filter">Origin <select data-origin><option value="">Everywhere</option>' +
      origins.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select></label>" +
      '<p class="filter-count" aria-live="polite"></p></div>' +
      '<div class="tree-wrap"><ul class="tree"></ul></div>';

    var treeEl = root.querySelector(".tree"), countEl = root.querySelector(".filter-count");

    // Does a brand pass the current filters?
    function passes(b) {
      var anyFam = Object.keys(state.families).some(function (k) { return state.families[k]; });
      if (anyFam && !state.families[familyOfBrand(b).id]) return false;
      if (b.abv[1] < state.abvMin || b.abv[0] > state.abvMax) return false; // ranges must overlap
      if (state.tier && b.tier !== state.tier) return false;
      if (state.origin && b.origin !== state.origin) return false;
      return true;
    }

    // One row of the tree. `key` identifies it in `open`; kids = child HTML.
    function row(key, level, label, meta, openType, openId, famId, kidsHtml) {
      var hasKids = !!kidsHtml, isOpen = !!open[key];
      return '<li class="lvl-' + level + (isOpen ? " is-open" : "") + '" style="--fam: var(--fam-' + famId + ')">' +
        '<div class="node">' +
        (hasKids ? '<button class="node-toggle" data-key="' + key + '" aria-expanded="' + isOpen + '" aria-label="' + (isOpen ? "Collapse " : "Expand ") + esc(label) + '"><span aria-hidden="true">›</span></button>'
                 : '<span class="node-toggle is-leaf" aria-hidden="true">•</span>') +
        '<button class="node-label" data-open-type="' + openType + '" data-open-id="' + openId + '">' + esc(label) +
        (meta ? ' <span class="node-meta">' + esc(meta) + "</span>" : "") + "</button></div>" +
        (hasKids && isOpen ? "<ul>" + kidsHtml + "</ul>" : "") + "</li>";
    }

    function draw() {
      var visible = D.brands.filter(passes);
      countEl.textContent = visible.length + " of " + D.brands.length + " brands shown";
      var html = D.families.map(function (f) {
        var catsHtml = D.categories.filter(function (c) { return c.familyId === f.id; }).map(function (c) {
          var catBrands = visible.filter(function (b) { return b.categoryId === c.id; });
          if (!catBrands.length) return "";
          // Group this category's brands by parent company.
          var coIds = Array.from(new Set(catBrands.map(function (b) { return b.companyId; })));
          var cosHtml = coIds.map(function (coId) {
            var brandsHtml = catBrands.filter(function (b) { return b.companyId === coId; }).map(function (b) {
              var skusHtml = D.skus.filter(function (s) { return s.brandId === b.id; }).map(function (s) {
                return row("s:" + s.id, 5, s.name, fmtAbv(s.abv), "sku", s.id, f.id, "");
              }).join("");
              return row("b:" + b.id, 4, b.name + (b.flag ? " ⚠️" : ""), fmtAbv(b.abv) + " · " + tierLabel(b.tier), "brand", b.id, f.id, skusHtml);
            }).join("");
            var n = catBrands.filter(function (b) { return b.companyId === coId; }).length;
            return row("co:" + c.id + ":" + coId, 3, byId.company[coId].name, n + (n === 1 ? " brand" : " brands"), "company", coId, f.id, brandsHtml);
          }).join("");
          return row("c:" + c.id, 2, c.name, fmtAbv(c.abv), "category", c.id, f.id, cosHtml);
        }).join("");
        if (!catsHtml) return "";
        return row("f:" + f.id, 1, f.name, "", "family", f.id, f.id, catsHtml);
      }).join("");
      treeEl.innerHTML = html || '<li class="empty">Nothing matches those filters. Loosen one?</li>';
    }

    // Expand / collapse (event delegation: one listener handles every row).
    treeEl.addEventListener("click", function (e) {
      var t = e.target.closest(".node-toggle[data-key]");
      if (!t) return;
      var key = t.getAttribute("data-key");
      open[key] = !open[key];
      draw();
      // Keep keyboard focus on the same toggle after re-drawing.
      var again = treeEl.querySelector('[data-key="' + key + '"]');
      if (again) again.focus();
    });

    // Filter controls
    root.querySelectorAll(".fam-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-fam");
        state.families[id] = !state.families[id];
        btn.setAttribute("aria-pressed", state.families[id]);
        draw();
      });
    });
    root.querySelectorAll("[data-abv]").forEach(function (input) {
      input.addEventListener("input", function () {
        var mn = root.querySelector('[data-abv="min"]'), mx = root.querySelector('[data-abv="max"]');
        // Don't let the handles cross.
        if (+mn.value > +mx.value) { if (input === mn) mn.value = mx.value; else mx.value = mn.value; }
        state.abvMin = +mn.value; state.abvMax = +mx.value;
        root.querySelector('[data-out="min"]').textContent = state.abvMin;
        root.querySelector('[data-out="max"]').textContent = state.abvMax;
        draw();
      });
    });
    root.querySelector("[data-tier]").addEventListener("change", function (e) { state.tier = e.target.value; draw(); });
    root.querySelector("[data-origin]").addEventListener("change", function (e) { state.origin = e.target.value; draw(); });

    // Public helper so pages can jump straight into a category.
    root.expandCategory = function (catId) {
      var c = byId.category[catId];
      open["f:" + c.familyId] = true; open["c:" + catId] = true; draw();
    };
    draw();
  };

  /* ---------------- 6. REGIONAL ATLAS ---------------- */
  Atlas.renderAtlas = function (root) {
    function drinksFor(regionId) { return D.regionalDrinks.filter(function (d) { return d.regionIds.indexOf(regionId) !== -1; }); }
    var india = D.regions.filter(function (r) { return r.scope === "india"; });
    var world = D.regions.filter(function (r) { return r.scope === "world"; });
    var continents = Array.from(new Set(world.map(function (r) { return r.continent; })));

    root.innerHTML =
      '<div class="seg" role="tablist" aria-label="Map">' +
      '<button role="tab" class="seg-btn" aria-selected="true" data-scope="india">India</button>' +
      '<button role="tab" class="seg-btn" aria-selected="false" data-scope="world">World</button></div>' +
      '<div class="atlas-grid">' +
      '<div class="atlas-map" data-panel="india"><div class="tilemap" aria-label="Stylised tile map of India, not to scale">' +
      india.map(function (r) {
        var n = drinksFor(r.id).length;
        var style = ' style="grid-column:' + r.tile[0] + ";grid-row:" + r.tile[1] + '"';
        // Tiles show a short state code; the full name is in the tooltip and screen-reader label.
        return n ? '<button class="tile has-drinks" data-region="' + r.id + '"' + style + ' title="' + esc(r.name) + '" aria-label="' + esc(r.name) + ", " + n + (n === 1 ? " drink" : " drinks") + '"><span>' + esc(r.code) + "</span><em>" + n + "</em></button>"
                 : '<div class="tile"' + style + ' title="' + esc(r.name) + '" aria-hidden="true"><span>' + esc(r.code) + "</span></div>";
      }).join("") + '</div><p class="small muted">Stylised tile map — not to scale. Highlighted states have heritage drinks.</p></div>' +
      '<div class="atlas-map" data-panel="world" hidden>' + continents.map(function (c) {
        return '<div class="continent"><h4>' + esc(c) + '</h4><div class="chips">' + world.filter(function (r) { return r.continent === c; }).map(function (r) {
          return '<button class="chip region-chip" data-region="' + r.id + '">' + esc(r.name) + " <em>" + drinksFor(r.id).length + "</em></button>";
        }).join("") + "</div></div>";
      }).join("") + "</div>" +
      '<div class="atlas-cards" aria-live="polite"><p class="muted">Tap a highlighted region to see its drinks.</p></div></div>';

    var cards = root.querySelector(".atlas-cards");
    function show(regionId) {
      root.querySelectorAll("[data-region]").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-region") === regionId); });
      var r = byId.region[regionId];
      cards.innerHTML = '<h3 class="atlas-title">' + esc(r.name) + "</h3>" + drinksFor(regionId).map(function (d) {
        return '<article class="drink-card"><h4>' + esc(d.name) + ' <span class="abv-pill">' + esc(d.abvText) + "</span></h4>" +
          '<p><strong>Made from:</strong> ' + esc(d.base) + "</p><p>" + esc(d.consumed) + "</p>" +
          '<p class="muted">' + esc(d.context) + "</p>" + '<p class="small"><strong>Example:</strong> ' + esc(d.example) + "</p>" +
          (d.flag ? '<p class="flag small">⚠️ ' + esc(d.flag) + "</p>" : "") + "</article>";
      }).join("");
      Atlas.bus.emit("region_viewed", { regionId: regionId });
    }
    root.addEventListener("click", function (e) {
      var r = e.target.closest("[data-region]"); if (r) show(r.getAttribute("data-region"));
      var tab = e.target.closest("[data-scope]");
      if (tab) {
        root.querySelectorAll("[data-scope]").forEach(function (b) { b.setAttribute("aria-selected", b === tab); });
        root.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== tab.getAttribute("data-scope"); });
      }
    });
  };

  /* ---------------- 7. ALCOHOL MATH ---------------- */
  // The core formula, kept separate so it's easy to test and reuse.
  Atlas.alcoholGrams = function (volumeMl, abvPercent) {
    return volumeMl * (abvPercent / 100) * 0.789; // 0.789 g/ml = density of ethanol
  };

  Atlas.renderCalculator = function (root) {
    var presets = [
      { label: "Beer (5%)", abv: 5, ml: 330 }, { label: "Strong beer (8%)", abv: 8, ml: 650 },
      { label: "Wine (13%)", abv: 13, ml: 150 }, { label: "Indian whisky/rum (42.8%)", abv: 42.8, ml: 60 },
      { label: "Vodka / gin (40%)", abv: 40, ml: 30 }, { label: "Breezer / RTD (4.8%)", abv: 4.8, ml: 275 }
    ];
    root.innerHTML =
      '<div class="calc">' +
      '<div class="calc-inputs">' +
      '<label>Drink <select data-preset>' + presets.map(function (p, i) { return '<option value="' + i + '">' + esc(p.label) + "</option>"; }).join("") + "</select></label>" +
      '<label>Volume (ml) <input type="number" min="0" max="3000" step="5" data-ml></label>' +
      '<div class="quick" aria-label="Quick volumes">' + [30, 60, 150, 330, 650].map(function (v) { return '<button class="chip" data-quick="' + v + '">' + v + " ml</button>"; }).join("") + "</div>" +
      '<label>ABV (%) <input type="number" min="0" max="96" step="0.1" data-abvin></label>' +
      '<label>Standard drink <select data-std>' + D.locale.standardDrinks.map(function (s) {
        return '<option value="' + s.grams + '"' + (s.id === D.locale.defaultStandard ? " selected" : "") + ">" + esc(s.label) + "</option>";
      }).join("") + "</select></label></div>" +
      '<div class="calc-out">' +
      '<p class="formula"><span class="muted">Formula</span><br>Grams of alcohol = Volume (ml) × ABV (decimal) × 0.789</p>' +
      '<p class="formula sub" data-sub></p>' +
      '<div class="stats"><div class="stat"><b data-g>0</b><span>grams of alcohol</span></div>' +
      '<div class="stat"><b data-sd>0</b><span>standard drinks</span></div>' +
      '<div class="stat"><b data-kcal>0</b><span>kcal from alcohol</span></div></div>' +
      '<p class="small muted">Calories: 7 kcal per gram of alcohol — before mixers. A 250 ml cola adds roughly another 100 kcal of sugar.</p>' +
      "</div></div>" +
      '<div class="compare"><h4>Same alcohol, different glass</h4><ul>' +
      "<li>650 ml strong beer at 8% ≈ <b>41 g</b> ≈ two large (60 ml) whisky pegs at 42.8% (≈ 40.5 g).</li>" +
      "<li>30 ml whisky at 42.8% ≈ <b>10 g</b> — about one WHO standard drink.</li>" +
      "<li>A 150 ml glass of 13% wine ≈ <b>15 g</b> — one and a half standard drinks.</li></ul></div>";

    var q = function (s) { return root.querySelector(s); };
    var used = false;
    function calc() {
      var ml = parseFloat(q("[data-ml]").value) || 0, abv = parseFloat(q("[data-abvin]").value) || 0, std = parseFloat(q("[data-std]").value);
      var g = Atlas.alcoholGrams(ml, abv);
      q("[data-sub]").textContent = "= " + ml + " × " + (abv / 100).toFixed(3) + " × 0.789 = " + g.toFixed(1) + " g";
      animateNumber(q("[data-g]"), g, 1);
      animateNumber(q("[data-sd]"), g / std, 1);
      animateNumber(q("[data-kcal]"), g * 7, 0);
      if (used) Atlas.bus.emit("calculator_used", { ml: ml, abv: abv, grams: g });
    }
    function applyPreset(i) { var p = presets[i]; q("[data-preset]").value = i; q("[data-ml]").value = p.ml; q("[data-abvin]").value = p.abv; calc(); }
    q("[data-preset]").addEventListener("change", function (e) { used = true; applyPreset(+e.target.value); });
    root.querySelectorAll("[data-quick]").forEach(function (b) { b.addEventListener("click", function () { used = true; q("[data-ml]").value = b.getAttribute("data-quick"); calc(); }); });
    ["[data-ml]", "[data-abvin]", "[data-std]"].forEach(function (s) { q(s).addEventListener("input", function () { used = true; calc(); }); });
    applyPreset(1); // start with the strong-beer example
  };

  /* ---------------- 8. SMALLER FEATURES ---------------- */
  // Myth-vs-fact flip cards.
  Atlas.renderMyths = function (root) {
    root.innerHTML = D.myths.map(function (m) {
      return '<button class="flip" aria-pressed="false" data-myth="' + m.id + '">' +
        '<span class="flip-inner"><span class="flip-front"><em>Myth</em>' + esc(m.myth) + '<small>Tap to flip</small></span>' +
        '<span class="flip-back"><em>Fact</em>' + esc(m.fact) + "</span></span></button>";
    }).join("");
    root.addEventListener("click", function (e) {
      var b = e.target.closest(".flip"); if (!b) return;
      var on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on);
      if (on) Atlas.bus.emit("myth_flipped", { id: b.getAttribute("data-myth") });
    });
  };

  // Searchable glossary.
  Atlas.renderGlossary = function (root) {
    root.innerHTML = '<input type="search" class="gloss-search" placeholder="Search terms… e.g. proof, NAS, IMFL" aria-label="Search glossary"><dl class="gloss"></dl>';
    var list = root.querySelector(".gloss");
    function draw(qs) {
      qs = (qs || "").toLowerCase();
      var hits = D.glossary.filter(function (t) { return !qs || (t.name + " " + t.definition).toLowerCase().indexOf(qs) !== -1; });
      list.innerHTML = hits.map(function (t) { return '<div class="gloss-item"><dt>' + esc(t.name) + "</dt><dd>" + esc(t.definition) + "</dd></div>"; }).join("") ||
        '<p class="muted">No term found. Try "ABV" or "cask".</p>';
    }
    root.querySelector("input").addEventListener("input", function (e) { draw(e.target.value); });
    draw("");
  };

  // Occasion matchmaker.
  Atlas.renderMatchmaker = function (root) {
    root.innerHTML = '<div class="chips occasion-picks">' + D.occasions.map(function (o) {
      return '<button class="chip" data-occ="' + o.id + '" aria-pressed="false">' + esc(o.name) + "</button>";
    }).join("") + '</div><div class="match-out" aria-live="polite"><p class="muted">Pick an occasion.</p></div>';
    var out = root.querySelector(".match-out");
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-occ]"); if (!b) return;
      root.querySelectorAll("[data-occ]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      var o = D.occasions.filter(function (x) { return x.id === b.getAttribute("data-occ"); })[0];
      out.innerHTML = '<article class="match-card"><h3>' + esc(o.name) + "</h3><h4>Try</h4><ul>" +
        o.picks.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" +
        "<h4>Why</h4><p>" + esc(o.why) + "</p><h4>Etiquette</h4><p>" + esc(o.etiquette) + "</p>" +
        '<p class="watchout"><strong>Watch out:</strong> ' + esc(o.watchOut) + "</p></article>";
      Atlas.bus.emit("occasion_matched", { id: o.id });
    });
  };

  // "House of brands" portfolio cards — computed from the data layer, so the numbers are honest.
  Atlas.renderPortfolios = function (root, companyIds) {
    root.innerHTML = companyIds.map(function (id) {
      var co = byId.company[id], owned = D.brands.filter(function (b) { return b.companyId === id; });
      var cats = Array.from(new Set(owned.map(function (b) { return byId.category[b.categoryId].name; })));
      var bars = TIERS.map(function (t) {
        var n = owned.filter(function (b) { return b.tier === t; }).length;
        return '<div class="tier-bar"><span>' + tierLabel(t) + '</span><i style="--n:' + n + '"></i><b>' + n + "</b></div>";
      }).join("");
      return '<button class="portfolio" data-open-type="company" data-open-id="' + id + '"><h4>' + esc(co.name) + "</h4>" +
        '<p class="small muted">' + esc(cats.join(" · ")) + "</p>" + bars + "</button>";
    }).join("") ;
  };

  // Health & safety block (headline warnings, body effects, combos, pacing).
  Atlas.renderHealth = function (root) {
    var H = D.health;
    function cards(list, cls) {
      return list.map(function (c) { return '<article class="' + cls + '"><h4>' + esc(c.title) + "</h4><p>" + esc(c.text) + "</p></article>"; }).join("");
    }
    root.innerHTML =
      '<div class="health-top">' + cards(H.headline, "warn-card") + "</div>" +
      '<h3 class="sub-h">What it does to your body</h3><div class="card-grid">' + cards(H.body, "info-card") + "</div>" +
      '<div class="two-col"><div><h3 class="sub-h">Dangerous combos</h3><ul class="list">' + H.combos.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul></div>" +
      '<div><h3 class="sub-h">Pacing tips</h3><ol class="list">' + H.pacing.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ol></div></div>" +
      '<h3 class="sub-h">Myth or fact?</h3><div class="myths"></div>' +
      '<div class="help-box"><h3 class="sub-h">Need help?</h3>' + D.locale.helpResources.map(function (r) {
        return "<p><strong>" + esc(r.name) + ":</strong> " + esc(r.contact) + "</p>";
      }).join("") + "</div>";
    Atlas.renderMyths(root.querySelector(".myths"));
  };

  // Business of booze: explainer cards + portfolio charts.
  Atlas.renderBusiness = function (root) {
    root.innerHTML = '<div class="card-grid">' + D.business.cards.map(function (c) {
      return '<article class="info-card"><h4>' + esc(c.title) + "</h4><p>" + esc(c.text) + "</p></article>";
    }).join("") + '</div><h3 class="sub-h">Portfolio ladders <span class="muted small">— brands per price tier, counted from this atlas (not full company portfolios)</span></h3><div class="portfolios"></div>';
    Atlas.renderPortfolios(root.querySelector(".portfolios"), D.business.majors);
  };

  // Serve & etiquette: pours, styles, glassware, pairings, toasts.
  Atlas.renderServe = function (root) {
    var S = D.serve;
    var maxMl = Math.max.apply(null, S.pours.map(function (p) { return p.ml; }));
    root.innerHTML =
      '<h3 class="sub-h">Standard pours</h3><div class="pours">' + S.pours.map(function (p) {
        return '<div class="pour"><div class="pour-glass"><i style="height:' + Math.max(8, Math.round(p.ml / maxMl * 100)) + '%"></i></div><b>' + p.ml + " ml</b><span>" + esc(p.name) + '</span><small class="muted">' + esc(p.note) + "</small></div>";
      }).join("") + "</div>" +
      '<div class="two-col"><div><h3 class="sub-h">How to serve</h3><dl class="gloss">' + S.styles.map(function (s) {
        return '<div class="gloss-item"><dt>' + esc(s.name) + "</dt><dd>" + esc(s.text) + "</dd></div>"; }).join("") + "</dl></div>" +
      '<div><h3 class="sub-h">Glassware</h3><dl class="gloss">' + S.glasses.map(function (g) {
        return '<div class="gloss-item"><dt>' + esc(g.name) + "</dt><dd>" + esc(g.use) + "</dd></div>"; }).join("") + "</dl></div></div>" +
      '<div class="two-col"><div><h3 class="sub-h">Food pairings</h3><ul class="list">' + S.pairings.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></div>" +
      '<div><h3 class="sub-h">Say it right</h3><div class="toasts">' + S.toasts.map(function (t) {
        return '<span class="toast"><b>' + esc(t.word) + "</b><small>" + esc(t.lang) + "</small></span>"; }).join("") + "</div></div></div>";
  };

  // "Did you know?" rotating ticker.
  Atlas.startTicker = function (el) {
    var i = Math.floor(Math.random() * D.facts.length);
    function show() {
      el.classList.remove("in"); void el.offsetWidth; // restart the fade animation
      el.textContent = D.facts[i % D.facts.length].text; el.classList.add("in"); i++;
    }
    show();
    if (!reduceMotion) setInterval(show, 7000);
  };

  // Global search across brands, categories, companies, heritage drinks and glossary.
  Atlas.initSearch = function (input, results) {
    var index = []
      .concat(D.categories.map(function (x) { return { t: "category", id: x.id, name: x.name, kind: "Category" }; }))
      .concat(D.companies.map(function (x) { return { t: "company", id: x.id, name: x.name, kind: "Company" }; }))
      .concat(D.brands.map(function (x) { return { t: "brand", id: x.id, name: x.name, kind: byId.category[x.categoryId].name }; }))
      .concat(D.skus.map(function (x) { return { t: "sku", id: x.id, name: x.name, kind: "Bottle" }; }))
      .concat(D.regionalDrinks.map(function (x) { return { t: "regional", id: x.id, name: x.name, kind: "Heritage · " + byId.region[x.regionIds[0]].name }; }))
      .concat(D.glossary.map(function (x) { return { t: "glossary", id: x.id, name: x.name, kind: "Glossary" }; }));
    function close() { results.hidden = true; input.setAttribute("aria-expanded", "false"); }
    input.setAttribute("aria-expanded", "false");
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      if (q.length < 2) { close(); return; }
      var hits = index.filter(function (h) { return h.name.toLowerCase().indexOf(q) !== -1; }).slice(0, 8);
      results.innerHTML = hits.length ? hits.map(function (h) {
        return '<li><button data-open-type="' + h.t + '" data-open-id="' + h.id + '">' + esc(h.name) + " <small>" + esc(h.kind) + "</small></button></li>";
      }).join("") : '<li class="muted">No matches</li>';
      results.hidden = false; input.setAttribute("aria-expanded", "true");
    });
    results.addEventListener("click", function () { close(); input.value = ""; });
    document.addEventListener("click", function (e) { if (e.target !== input && !results.contains(e.target)) close(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowDown") { var f = results.querySelector("button"); if (f) { e.preventDefault(); f.focus(); } }
    });
  };

  // Scroll-reveal: elements with class "reveal" fade in as they enter the screen.
  Atlas.initReveal = function () {
    var els = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("shown"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("shown"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -10% 0px" });
    els.forEach(function (el) { io.observe(el); });
  };

  window.Atlas = Atlas;
})();
