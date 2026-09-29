/* =====================================================================
   SPIRIT ATLAS — DATA LAYER
   ---------------------------------------------------------------------
   Every piece of content on the site lives in this one file.
   The pages never hard-code drinks; they read from window.ATLAS_DATA.

   Every entity gets the same "base" fields (added by the entity() helper):
     id          → stable unique id (never change it once published)
     type        → "family" | "category" | "company" | "brand" | "sku" | ...
     tags        → free-form labels, used for search & future quizzes
     difficulty  → 1 (easy) to 3 (expert) — used by the Phase 2 quiz engine
     sources     → optional list of source notes / URLs
     gamification→ { xpValue, quizEligible, badgeTags } — UNUSED in Phase 1

   Uncertain facts carry  flag: "..."  and show a ⚠️ in the UI.
   Brand ownership is stated "as of 2026".
   ===================================================================== */
(function () {
  "use strict";

  // Helper: adds the shared base fields to any entity.
  // Anything passed in `fields` overrides the defaults.
  function entity(type, fields) {
    return Object.assign(
      {
        type: type,
        tags: [],
        difficulty: 1,
        sources: [],
        // PHASE 2 HOOK: the XP / quiz / badge engine will read this object.
        gamification: { xpValue: 10, quizEligible: true, badgeTags: [] }
      },
      fields
    );
  }

  /* ---------- 1. FAMILIES (top of the tree) ---------- */
  // `accent` is a CSS variable name so every page colours families the same way.
  var families = [
    entity("family", { id: "fermented", name: "Fermented", accent: "--fam-fermented",
      blurb: "Yeast eats sugar, makes alcohol. Stops at roughly 15–16% because the yeast gives up." }),
    entity("family", { id: "distilled", name: "Distilled", accent: "--fam-distilled",
      blurb: "Heat a fermented liquid, catch the vapour. Alcohol boils before water, so you concentrate it." }),
    entity("family", { id: "liqueur", name: "Liqueur & Fortified", accent: "--fam-liqueur",
      blurb: "Spirits sweetened and flavoured, or wines 'fortified' with extra spirit." }),
    entity("family", { id: "rtd", name: "Ready-to-Drink", accent: "--fam-rtd",
      blurb: "Pre-mixed, canned or bottled. The convenience play." })
  ];

  /* ---------- 2. CATEGORIES ---------- */
  // abv is always a RANGE: [min, max] in %.
  var categories = [
    entity("category", { id: "beer", name: "Beer", familyId: "fermented", abv: [4, 8],
      base: "Malted barley (sometimes rice, wheat, maize) + hops",
      howMade: "Grain is mashed to release sugars, boiled with hops for bitterness, then fermented by yeast.",
      flavour: "Crisp, malty, bitter; wheat beers are fruity and cloudy.",
      serve: "Well chilled", glass: "Pint, pilsner or beer mug",
      funFact: "In India, 'strong' beer (5%+) makes up a large majority of volume — more alcohol per rupee is the pitch." }),
    entity("category", { id: "wine", name: "Wine", familyId: "fermented", abv: [9, 15],
      base: "Grapes",
      howMade: "Crushed grapes ferment on their own yeasts or added ones; reds ferment with skins for colour and tannin.",
      flavour: "Ranges from crisp and citrusy (whites) to dark fruit and tannic grip (reds).",
      serve: "Whites and sparkling chilled; reds slightly below room temperature", glass: "Wine glass or flute",
      funFact: "Nashik in Maharashtra is called India's wine capital; Sula planted its first vines there in the late 1990s." }),
    entity("category", { id: "whisky", name: "Whisky", familyId: "distilled", abv: [40, 46],
      base: "Grain (barley, corn, rye, wheat); many Indian 'whiskies' use molasses spirit",
      howMade: "Grain beer is distilled, then aged in wooden casks — the wood gives colour and most of the flavour.",
      flavour: "Vanilla, caramel, dried fruit, smoke (if peated), spice.",
      serve: "Neat, with water, on the rocks, or as a highball", glass: "Tumbler / Glencairn",
      funFact: "Much Indian whisky is made largely from molasses spirit, which is why the EU doesn't let it be sold as 'whisky'." }),
    entity("category", { id: "vodka", name: "Vodka", familyId: "distilled", abv: [37.5, 40],
      base: "Grain, potato, or anything fermentable (even grapes)",
      howMade: "Distilled to very high strength, often charcoal-filtered, diluted, bottled. No ageing.",
      flavour: "Clean and neutral by design; subtle grain or creamy potato notes.",
      serve: "Chilled shot, or mixed", glass: "Shot glass or highball",
      funFact: "Vodka isn't aged because its whole point is neutrality — wood would add the flavour it's trying to avoid." }),
    entity("category", { id: "rum", name: "Rum", familyId: "distilled", abv: [37.5, 42.8],
      base: "Molasses or fresh sugarcane juice",
      howMade: "Sugarcane products are fermented, distilled, and often aged; dark rums may get caramel for colour.",
      flavour: "Molasses, brown sugar, banana, vanilla, spice.",
      serve: "With cola or soda, neat, or in cocktails", glass: "Highball or tumbler",
      funFact: "India is one of the world's largest rum markets — molasses from its sugar industry is cheap and plentiful." }),
    entity("category", { id: "gin", name: "Gin", familyId: "distilled", abv: [37.5, 47],
      base: "Neutral grain spirit + juniper and other botanicals",
      howMade: "Neutral spirit is re-distilled with botanicals; juniper must be the dominant flavour.",
      flavour: "Pine (juniper), citrus peel, coriander, floral and spice notes.",
      serve: "Gin & tonic, martini, negroni", glass: "Copa (balloon) or highball",
      funFact: "Tonic's bitterness is quinine, once used against malaria in British India — the G&T began as a medicine." }),
    entity("category", { id: "tequila", name: "Tequila", familyId: "distilled", abv: [35, 55],
      base: "Blue Weber agave",
      howMade: "Agave hearts (piñas) are cooked, crushed, fermented and distilled; some are aged in oak.",
      flavour: "Earthy, peppery, citrus; aged versions add vanilla and caramel.",
      serve: "Sipped neat (good ones) or in a margarita / paloma", glass: "Copita or rocks glass",
      funFact: "The 'worm in the bottle' is a mezcal marketing gimmick, not a tequila tradition." }),
    entity("category", { id: "brandy", name: "Brandy / Cognac", familyId: "distilled", abv: [36, 42.8],
      base: "Grapes (wine) — or other fruit for fruit brandies",
      howMade: "Wine is distilled and aged in oak. Cognac must come from the Cognac region and be double-distilled in copper pot stills.",
      flavour: "Dried fruit, raisin, vanilla, toffee, oak.",
      serve: "Neat, or in South India often with water or soda", glass: "Snifter / tulip",
      funFact: "South India is one of the world's biggest brandy markets — Tamil Nadu and Kerala drink far more of it than the north." }),
    entity("category", { id: "liqueur", name: "Liqueurs", familyId: "liqueur", abv: [11, 40],
      base: "A spirit + sugar + flavouring (herbs, fruit, cream, coffee)",
      howMade: "Spirit is infused or blended with flavourings and sweetened.",
      flavour: "Sweet first; then whatever the theme is — bitter orange, coffee, cream, herbs.",
      serve: "Over ice, in cocktails, or after dinner", glass: "Rocks glass or cordial glass",
      funFact: "Aperol is only about 11% ABV — about a third of Campari's bitter punch — hence the 'spritz' boom." }),
    entity("category", { id: "rtd", name: "RTD / Cider", familyId: "rtd", abv: [4, 7],
      base: "Spirit, malt base or apples + mixer",
      howMade: "A base alcohol is pre-mixed with flavour, sugar and fizz, then canned or bottled.",
      flavour: "Sweet, fruity, fizzy.",
      serve: "Straight from the bottle, chilled", glass: "Bottle / can, or highball",
      funFact: "Sweet RTDs hide the taste of alcohol — which is exactly why they're easy to over-drink." })
  ];

  /* ---------- 3. COMPANIES (parent groups, as of 2026) ---------- */
  var companies = [
    entity("company", { id: "diageo", name: "Diageo", hq: "UK", note: "Owns United Spirits Ltd in India (the old McDowell's group)." }),
    entity("company", { id: "pernod", name: "Pernod Ricard", hq: "France", note: "Big in India through Royal Stag, Blenders Pride and Chivas." }),
    entity("company", { id: "bacardi", name: "Bacardi", hq: "Bermuda", note: "Family-owned; one of the largest privately held spirits companies." }),
    entity("company", { id: "abinbev", name: "AB InBev", hq: "Belgium", note: "The world's largest brewer." }),
    entity("company", { id: "heineken", name: "Heineken / United Breweries", hq: "Netherlands", note: "Heineken is the majority owner of United Breweries, maker of Kingfisher." }),
    entity("company", { id: "carlsberg", name: "Carlsberg", hq: "Denmark", note: "Strong in India via Tuborg and Carlsberg Elephant." }),
    entity("company", { id: "lvmh", name: "LVMH (Moët Hennessy)", hq: "France", note: "Luxury group; Diageo holds a minority stake in Moët Hennessy." }),
    entity("company", { id: "williamgrant", name: "William Grant & Sons", hq: "Scotland", note: "Family-owned Scotch house." }),
    entity("company", { id: "brownforman", name: "Brown-Forman", hq: "USA", note: "Owner of Jack Daniel's." }),
    entity("company", { id: "suntory", name: "Suntory Global Spirits", hq: "Japan / USA", note: "Formerly Beam Suntory; renamed in 2024." }),
    entity("company", { id: "radico", name: "Radico Khaitan", hq: "India", note: "Homegrown; moving up-market with Rampur and Jaisalmer." }),
    entity("company", { id: "abd", name: "Allied Blenders & Distillers", hq: "India", note: "Maker of Officer's Choice." }),
    entity("company", { id: "mohanmeakin", name: "Mohan Meakin", hq: "India", note: "Makers of Old Monk; famously light on advertising." }),
    entity("company", { id: "sula", name: "Sula Vineyards", hq: "India", note: "India's largest winemaker, based in Nashik." }),
    entity("company", { id: "grover", name: "Grover Zampa", hq: "India", note: "Vineyards near Bengaluru and Nashik." }),
    entity("company", { id: "twe", name: "Treasury Wine Estates", hq: "Australia", note: "Owner of Penfolds." }),
    entity("company", { id: "b9", name: "B9 Beverages", hq: "India", note: "The company behind Bira 91." }),
    entity("company", { id: "amrut", name: "Amrut Distilleries", hq: "India", note: "Bengaluru; pioneer of Indian single malt." }),
    entity("company", { id: "johndist", name: "John Distilleries", hq: "India", note: "Goa-based maker of Paul John." }),
    entity("company", { id: "piccadilly", name: "Piccadilly Agro Industries", hq: "India", note: "Haryana-based maker of Indri and Camikara." }),
    entity("company", { id: "nao", name: "Nao Spirits", hq: "India", note: "Goa craft gin pioneer." }),
    entity("company", { id: "thirdeye", name: "Third Eye Distillery", hq: "India", note: "Goa craft gin maker." }),
    entity("company", { id: "tilaknagar", name: "Tilaknagar Industries", hq: "India", note: "Maker of Mansion House brandy." }),
    entity("company", { id: "becle", name: "Becle (Jose Cuervo)", hq: "Mexico", note: "Family-controlled tequila giant." }),
    entity("company", { id: "remy", name: "Rémy Cointreau", hq: "France", note: "Cognac and liqueur specialist." }),
    entity("company", { id: "campari", name: "Campari Group", hq: "Italy", note: "Owner of Campari and Aperol." }),
    entity("company", { id: "mast", name: "Mast-Jägermeister", hq: "Germany", note: "Family-owned; essentially a one-brand company." }),
    entity("company", { id: "independent", name: "Independent / other", hq: "—", note: "Smaller or privately held producers." })
  ];

  /* ---------- 4. BRANDS ---------- */
  // tier: "value" | "mainstream" | "premium" | "luxury"
  // Keep one brand per line so it's easy to scan and edit.
  function brand(id, name, companyId, categoryId, origin, tier, abv, extra) {
    return entity("brand", Object.assign({ id: id, name: name, companyId: companyId,
      categoryId: categoryId, origin: origin, tier: tier, abv: abv }, extra || {}));
  }

  var brands = [
    // --- Beer ---
    brand("kingfisher", "Kingfisher", "heineken", "beer", "India", "mainstream", [4.5, 8], { funFact: "Kingfisher is one of India's best-selling beers; the Strong variant outsells the mild one." }),
    brand("heineken-lager", "Heineken", "heineken", "beer", "Netherlands", "premium", [5, 5]),
    brand("amstel", "Amstel", "heineken", "beer", "Netherlands", "mainstream", [5, 8], { note: "ABV varies by variant and market." }),
    brand("budweiser", "Budweiser", "abinbev", "beer", "USA", "premium", [4.5, 5]),
    brand("magnum", "Budweiser Magnum", "abinbev", "beer", "India", "mainstream", [6, 8], { note: "A strong-beer extension built for India." }),
    brand("corona", "Corona", "abinbev", "beer", "Mexico", "premium", [4.5, 4.5], { funFact: "The lime wedge is marketing lore, not a Mexican tradition." }),
    brand("hoegaarden", "Hoegaarden", "abinbev", "beer", "Belgium", "premium", [4.9, 4.9], { funFact: "A Belgian witbier brewed with coriander and orange peel." }),
    brand("stella", "Stella Artois", "abinbev", "beer", "Belgium", "premium", [4.6, 5.2]),
    brand("carlsberg-beer", "Carlsberg", "carlsberg", "beer", "Denmark", "premium", [4.5, 8], { note: "'Elephant' is the strong variant." }),
    brand("tuborg", "Tuborg", "carlsberg", "beer", "Denmark", "mainstream", [4.5, 8]),
    brand("bira91", "Bira 91", "b9", "beer", "India", "premium", [4.5, 7], { funFact: "Launched in 2015, it helped make 'craft-style' beer mainstream in Indian cities." }),
    brand("simba", "Simba", "independent", "beer", "India", "premium", [4.5, 8], { flag: "Current ownership and portfolio not verified." }),
    brand("whiteowl", "White Owl", "independent", "beer", "India", "premium", [4.5, 7], { flag: "Current ownership and operating status not verified." }),

    // --- Wine ---
    brand("sula-wine", "Sula", "sula", "wine", "India", "mainstream", [11.5, 14.5]),
    brand("grover-wine", "Grover Zampa", "grover", "wine", "India", "premium", [12, 14]),
    brand("moet", "Moët & Chandon", "lvmh", "wine", "France", "luxury", [12, 12.5], { funFact: "Only sparkling wine from France's Champagne region may be called Champagne." }),
    brand("domperignon", "Dom Pérignon", "lvmh", "wine", "France", "luxury", [12.5, 12.5], { funFact: "Only released as a vintage — made only in years judged good enough." }),
    brand("jacobscreek", "Jacob's Creek", "independent", "wine", "Australia", "mainstream", [12, 14.5], { flag: "Formerly Pernod Ricard; Pernod sold its wine brands around 2024–25. Current owner to verify." }),
    brand("penfolds", "Penfolds", "twe", "wine", "Australia", "luxury", [13.5, 15], { funFact: "Penfolds Grange is often called Australia's most famous wine." }),

    // --- Whisky: Diageo / United Spirits ---
    brand("johnniewalker", "Johnnie Walker", "diageo", "whisky", "Scotland", "premium", [40, 40], { funFact: "The colour-coded labels (Red → Blue) are a textbook 'good-better-best' pricing ladder." }),
    brand("blackdog", "Black Dog", "diageo", "whisky", "India", "premium", [42.8, 42.8]),
    brand("signature", "Signature", "diageo", "whisky", "India", "mainstream", [42.8, 42.8]),
    brand("royalchallenge", "Royal Challenge", "diageo", "whisky", "India", "mainstream", [42.8, 42.8]),
    brand("antiquity", "Antiquity", "diageo", "whisky", "India", "mainstream", [42.8, 42.8]),
    brand("mcdowells-whisky", "McDowell's No.1", "diageo", "whisky", "India", "value", [42.8, 42.8], { funFact: "One of the world's biggest-selling whiskies by volume." }),
    brand("talisker", "Talisker", "diageo", "whisky", "Scotland", "premium", [45.8, 45.8], { funFact: "From the Isle of Skye — peppery, smoky, sea-salty." }),
    brand("singleton", "The Singleton", "diageo", "whisky", "Scotland", "premium", [40, 40]),
    brand("godawan", "Godawan", "diageo", "whisky", "India", "premium", [42.8, 46], { funFact: "A Rajasthan single malt named after the endangered Great Indian Bustard (godawan).", flag: "ABV by edition not verified." }),
    // --- Whisky: Pernod Ricard ---
    brand("royalstag", "Royal Stag", "pernod", "whisky", "India", "mainstream", [42.8, 42.8], { funFact: "Among India's largest whisky brands by volume." }),
    brand("blenderspride", "Blenders Pride", "pernod", "whisky", "India", "premium", [42.8, 42.8]),
    brand("100pipers", "100 Pipers", "pernod", "whisky", "Scotland", "mainstream", [40, 42.8]),
    brand("chivas", "Chivas Regal", "pernod", "whisky", "Scotland", "premium", [40, 40]),
    brand("ballantines", "Ballantine's", "pernod", "whisky", "Scotland", "mainstream", [40, 40]),
    brand("glenlivet", "The Glenlivet", "pernod", "whisky", "Scotland", "premium", [40, 43]),
    brand("jameson", "Jameson", "pernod", "whisky", "Ireland", "premium", [40, 40], { funFact: "Irish whiskey is typically triple-distilled, making it smoother and lighter." }),
    // --- Whisky: others ---
    brand("glenfiddich", "Glenfiddich", "williamgrant", "whisky", "Scotland", "premium", [40, 40]),
    brand("monkeyshoulder", "Monkey Shoulder", "williamgrant", "whisky", "Scotland", "premium", [40, 40], { funFact: "Named after a shoulder injury maltmen got from turning barley by hand." }),
    brand("jackdaniels", "Jack Daniel's", "brownforman", "whisky", "USA", "premium", [40, 40], { funFact: "Filtered through sugar-maple charcoal before ageing — the 'Lincoln County Process'." }),
    brand("jimbeam", "Jim Beam", "suntory", "whisky", "USA", "mainstream", [40, 40]),
    brand("makersmark", "Maker's Mark", "suntory", "whisky", "USA", "premium", [45, 45], { funFact: "Every bottle is hand-dipped in red wax." }),
    brand("teachers", "Teacher's", "suntory", "whisky", "Scotland", "mainstream", [40, 42.8]),
    brand("oaka", "Oaka", "suntory", "whisky", "India", "mainstream", [42.8, 42.8], { flag: "Launch details and positioning not verified." }),
    brand("hibiki", "Hibiki", "suntory", "whisky", "Japan", "luxury", [43, 43], { funFact: "The 24-faceted bottle represents the 24 seasons of the old Japanese calendar." }),
    brand("toki", "Toki", "suntory", "whisky", "Japan", "premium", [43, 43]),
    brand("8pm", "8PM", "radico", "whisky", "India", "value", [42.8, 42.8]),
    brand("rampur", "Rampur", "radico", "whisky", "India", "luxury", [43, 45]),
    brand("officerschoice", "Officer's Choice", "abd", "whisky", "India", "value", [42.8, 42.8]),
    brand("amrut", "Amrut", "amrut", "whisky", "India", "premium", [46, 50], { funFact: "Bengaluru's heat ages whisky fast — it loses far more to evaporation each year than in Scotland." }),
    brand("pauljohn", "Paul John", "johndist", "whisky", "India", "premium", [46, 55]),
    brand("indri", "Indri", "piccadilly", "whisky", "India", "premium", [46, 46], { funFact: "Launched in 2021 and quickly racked up international awards." }),

    // --- Vodka ---
    brand("smirnoff", "Smirnoff", "diageo", "vodka", "USA / UK", "mainstream", [37.5, 40], { funFact: "Often cited as the world's best-selling vodka." }),
    brand("ketelone", "Ketel One", "diageo", "vodka", "Netherlands", "premium", [40, 40]),
    brand("ciroc", "Cîroc", "diageo", "vodka", "France", "premium", [40, 40], { funFact: "Distilled from grapes, not grain." }),
    brand("absolut", "Absolut", "pernod", "vodka", "Sweden", "premium", [40, 40]),
    brand("greygoose", "Grey Goose", "bacardi", "vodka", "France", "luxury", [40, 40]),
    brand("belvedere", "Belvedere", "lvmh", "vodka", "Poland", "luxury", [40, 40], { funFact: "Made from Polish rye." }),
    brand("magicmoments", "Magic Moments", "radico", "vodka", "India", "mainstream", [37.5, 42.8], { funFact: "India's best-selling vodka brand for years." }),

    // --- Rum ---
    brand("oldmonk", "Old Monk", "mohanmeakin", "rum", "India", "mainstream", [42.8, 42.8], { funFact: "Built a cult following with almost no advertising." }),
    brand("bacardi-rum", "Bacardi", "bacardi", "rum", "Puerto Rico / Cuba heritage", "mainstream", [37.5, 40], { funFact: "The bat logo came from fruit bats living in the rafters of the first distillery." }),
    brand("captainmorgan", "Captain Morgan", "diageo", "rum", "Caribbean", "mainstream", [35, 40]),
    brand("mcdowells-rum", "McDowell's No.1 Celebration", "diageo", "rum", "India", "value", [42.8, 42.8]),
    brand("camikara", "Camikara", "piccadilly", "rum", "India", "luxury", [42.8, 50], { flag: "ABV by edition not verified." }),
    brand("makazai", "Maka Zai", "independent", "rum", "India", "premium", [40, 42.8], { flag: "Producer and ABV not verified." }),

    // --- Gin ---
    brand("tanqueray", "Tanqueray", "diageo", "gin", "UK", "premium", [41.3, 47.3]),
    brand("gordons", "Gordon's", "diageo", "gin", "UK", "mainstream", [37.5, 40]),
    brand("beefeater", "Beefeater", "pernod", "gin", "UK", "mainstream", [40, 40]),
    brand("monkey47", "Monkey 47", "pernod", "gin", "Germany", "luxury", [47, 47], { funFact: "47 botanicals, 47% ABV — hence the name." }),
    brand("malfy", "Malfy", "pernod", "gin", "Italy", "premium", [41, 41]),
    brand("bombay", "Bombay Sapphire", "bacardi", "gin", "UK", "premium", [40, 47]),
    brand("hendricks", "Hendrick's", "williamgrant", "gin", "Scotland", "premium", [41.4, 44], { funFact: "Infused with cucumber and rose — serve it with a cucumber slice, not lime." }),
    brand("greaterthan", "Greater Than", "nao", "gin", "India", "premium", [40, 42.8], { funFact: "Often credited as India's first craft gin (2017)." }),
    brand("hapusa", "Hapusa", "nao", "gin", "India", "premium", [43, 43], { funFact: "Uses Himalayan juniper — 'hapusha' is a Sanskrit word for juniper." }),
    brand("strangersons", "Stranger & Sons", "thirdeye", "gin", "India", "premium", [42.8, 42.8]),
    brand("jaisalmer", "Jaisalmer", "radico", "gin", "India", "premium", [43, 43]),
    brand("samsara", "Samsara", "independent", "gin", "India", "premium", [40, 43], { flag: "Producer and ABV not verified." }),

    // --- Tequila ---
    brand("donjulio", "Don Julio", "diageo", "tequila", "Mexico", "premium", [38, 40]),
    brand("casamigos", "Casamigos", "diageo", "tequila", "Mexico", "premium", [40, 40], { funFact: "Co-founded by George Clooney; Diageo bought it in 2017." }),
    brand("patron", "Patrón", "bacardi", "tequila", "Mexico", "premium", [40, 40]),
    brand("josecuervo", "Jose Cuervo", "becle", "tequila", "Mexico", "mainstream", [35, 40]),
    brand("olmeca", "Olmeca", "pernod", "tequila", "Mexico", "mainstream", [35, 38]),

    // --- Brandy / Cognac ---
    brand("hennessy", "Hennessy", "lvmh", "brandy", "France", "premium", [40, 40], { funFact: "The world's best-selling Cognac." }),
    brand("remymartin", "Rémy Martin", "remy", "brandy", "France", "premium", [40, 40]),
    brand("martell", "Martell", "pernod", "brandy", "France", "premium", [40, 40]),
    brand("mansionhouse", "Mansion House", "tilaknagar", "brandy", "India", "mainstream", [42.8, 42.8]),
    brand("mcdowells-brandy", "McDowell's No.1 Brandy", "diageo", "brandy", "India", "value", [42.8, 42.8]),

    // --- Liqueurs ---
    brand("baileys", "Baileys", "diageo", "liqueur", "Ireland", "premium", [17, 17], { funFact: "Launched in 1974; cream and whiskey stay mixed thanks to clever emulsification." }),
    brand("kahlua", "Kahlúa", "pernod", "liqueur", "Mexico", "mainstream", [16, 20]),
    brand("malibu", "Malibu", "pernod", "liqueur", "Barbados", "mainstream", [18, 21]),
    brand("jagermeister", "Jägermeister", "mast", "liqueur", "Germany", "mainstream", [35, 35], { funFact: "Made with 56 herbs, fruits, roots and spices." }),
    brand("cointreau", "Cointreau", "remy", "liqueur", "France", "premium", [40, 40]),
    brand("campari-l", "Campari", "campari", "liqueur", "Italy", "premium", [20.5, 28], { note: "ABV varies by market." }),
    brand("aperol", "Aperol", "campari", "liqueur", "Italy", "mainstream", [11, 11]),

    // --- RTD ---
    brand("breezer", "Bacardi Breezer", "bacardi", "rtd", "—", "mainstream", [4, 5]),
    brand("smirnoffice", "Smirnoff Ice", "diageo", "rtd", "—", "mainstream", [4, 5]),
    brand("hardseltzer", "Hard seltzers (category)", "independent", "rtd", "—", "mainstream", [4, 5], { note: "Sparkling water + alcohol + light flavour. Pitched as low-sugar." })
  ];

  /* ---------- 5. SKUs (specific bottles) ---------- */
  function sku(id, name, brandId, abv, extra) {
    return entity("sku", Object.assign({ id: id, name: name, brandId: brandId, abv: abv }, extra || {}));
  }
  var skus = [
    sku("kf-premium", "Kingfisher Premium", "kingfisher", [4.5, 5]),
    sku("kf-strong", "Kingfisher Strong", "kingfisher", [7, 8]),
    sku("kf-ultra", "Kingfisher Ultra", "kingfisher", [4.5, 5]),
    sku("tuborg-green", "Tuborg Green", "tuborg", [4.5, 5]),
    sku("tuborg-strong", "Tuborg Strong", "tuborg", [7, 8]),
    sku("sula-brut", "Sula Brut", "sula-wine", [12, 12.5]),
    sku("sula-rasa", "Rasa Shiraz", "sula-wine", [13.5, 14.5]),
    sku("sula-dindori", "Dindori Reserve Shiraz", "sula-wine", [13.5, 14]),
    sku("sula-sb", "Sula Sauvignon Blanc", "sula-wine", [11.5, 12.5]),
    sku("gz-lareserve", "La Réserve", "grover-wine", [13, 14]),
    sku("gz-soiree", "Soirée Brut", "grover-wine", [12, 12.5]),
    sku("jw-red", "Red Label", "johnniewalker", [40, 40], { tier: "mainstream" }),
    sku("jw-black", "Black Label 12", "johnniewalker", [40, 40], { tier: "premium" }),
    sku("jw-dblack", "Double Black", "johnniewalker", [40, 40], { tier: "premium" }),
    sku("jw-gold", "Gold Label Reserve", "johnniewalker", [40, 40], { tier: "premium" }),
    sku("jw-blue", "Blue Label", "johnniewalker", [40, 40], { tier: "luxury" }),
    sku("chivas-12", "Chivas Regal 12", "chivas", [40, 40]),
    sku("chivas-18", "Chivas Regal 18", "chivas", [40, 40], { tier: "luxury" }),
    sku("glenlivet-12", "Glenlivet 12", "glenlivet", [40, 40]),
    sku("glenlivet-15", "Glenlivet 15", "glenlivet", [40, 40]),
    sku("glenlivet-18", "Glenlivet 18", "glenlivet", [40, 43], { tier: "luxury" }),
    sku("om-xxx", "Old Monk XXX", "oldmonk", [42.8, 42.8]),
    sku("om-supreme", "Old Monk Supreme", "oldmonk", [42.8, 42.8]),
    sku("om-gold", "Old Monk Gold Reserve", "oldmonk", [42.8, 42.8]),
    sku("bac-blanca", "Carta Blanca", "bacardi-rum", [37.5, 40]),
    sku("bac-negra", "Carta Negra", "bacardi-rum", [37.5, 40]),
    sku("bac-8", "Reserva Ocho (8 yr)", "bacardi-rum", [40, 40], { tier: "premium" }),
    sku("hen-vs", "Hennessy VS", "hennessy", [40, 40]),
    sku("hen-vsop", "Hennessy VSOP", "hennessy", [40, 40]),
    sku("hen-xo", "Hennessy XO", "hennessy", [40, 40], { tier: "luxury" })
  ];

  /* ---------- 6. REGIONS (for the Atlas) ---------- */
  // India uses a stylised "tile map": each state sits at [column, row] on a grid.
  // It is deliberately NOT to scale — it's a readable cartogram.
  var regions = [
    // scope: "india"
    { id: "jk", code: "JK", name: "Jammu & Kashmir", scope: "india", tile: [3, 1] },
    { id: "ladakh", code: "LA", name: "Ladakh", scope: "india", tile: [4, 1] },
    { id: "punjab", code: "PB", name: "Punjab", scope: "india", tile: [3, 2] },
    { id: "himachal", code: "HP", name: "Himachal Pradesh", scope: "india", tile: [4, 2] },
    { id: "uttarakhand", code: "UK", name: "Uttarakhand", scope: "india", tile: [5, 2] },
    { id: "rajasthan", code: "RJ", name: "Rajasthan", scope: "india", tile: [2, 3] },
    { id: "haryana", code: "HR", name: "Haryana", scope: "india", tile: [3, 3] },
    { id: "delhi", code: "DL", name: "Delhi", scope: "india", tile: [4, 3] },
    { id: "up", code: "UP", name: "Uttar Pradesh", scope: "india", tile: [5, 3] },
    { id: "bihar", code: "BR", name: "Bihar", scope: "india", tile: [6, 3] },
    { id: "sikkim", code: "SK", name: "Sikkim", scope: "india", tile: [7, 3] },
    { id: "arunachal", code: "AR", name: "Arunachal Pradesh", scope: "india", tile: [9, 3] },
    { id: "gujarat", code: "GJ", name: "Gujarat", scope: "india", tile: [1, 4] },
    { id: "mp", code: "MP", name: "Madhya Pradesh", scope: "india", tile: [3, 4] },
    { id: "chhattisgarh", code: "CG", name: "Chhattisgarh", scope: "india", tile: [4, 4] },
    { id: "jharkhand", code: "JH", name: "Jharkhand", scope: "india", tile: [5, 4] },
    { id: "wb", code: "WB", name: "West Bengal", scope: "india", tile: [6, 4] },
    { id: "assam", code: "AS", name: "Assam", scope: "india", tile: [8, 4] },
    { id: "nagaland", code: "NL", name: "Nagaland", scope: "india", tile: [9, 4] },
    { id: "maharashtra", code: "MH", name: "Maharashtra", scope: "india", tile: [2, 5] },
    { id: "telangana", code: "TS", name: "Telangana", scope: "india", tile: [3, 5] },
    { id: "odisha", code: "OD", name: "Odisha", scope: "india", tile: [5, 5] },
    { id: "meghalaya", code: "ML", name: "Meghalaya", scope: "india", tile: [8, 5] },
    { id: "manipur", code: "MN", name: "Manipur", scope: "india", tile: [9, 5] },
    { id: "goa", code: "GA", name: "Goa", scope: "india", tile: [2, 6] },
    { id: "karnataka", code: "KA", name: "Karnataka", scope: "india", tile: [3, 6] },
    { id: "ap", code: "AP", name: "Andhra Pradesh", scope: "india", tile: [4, 6] },
    { id: "kerala", code: "KL", name: "Kerala", scope: "india", tile: [3, 7] },
    { id: "tn", code: "TN", name: "Tamil Nadu", scope: "india", tile: [4, 7] },
    // scope: "world" — grouped by continent instead of a map
    { id: "korea", name: "South Korea", scope: "world", continent: "Asia" },
    { id: "japan", name: "Japan", scope: "world", continent: "Asia" },
    { id: "china", name: "China", scope: "world", continent: "Asia" },
    { id: "srilanka", name: "Sri Lanka", scope: "world", continent: "Asia" },
    { id: "nepal", name: "Nepal", scope: "world", continent: "Asia" },
    { id: "mexico", name: "Mexico", scope: "world", continent: "Americas" },
    { id: "peru-chile", name: "Peru & Chile", scope: "world", continent: "Americas" },
    { id: "brazil", name: "Brazil", scope: "world", continent: "Americas" },
    { id: "greece", name: "Greece", scope: "world", continent: "Europe" },
    { id: "turkey", name: "Türkiye & Levant", scope: "world", continent: "Europe / W. Asia" },
    { id: "switzerland", name: "Switzerland & France", scope: "world", continent: "Europe" },
    { id: "italy", name: "Italy", scope: "world", continent: "Europe" },
    { id: "nordics", name: "Nordics", scope: "world", continent: "Europe" },
    { id: "hungary", name: "Hungary & Central Europe", scope: "world", continent: "Europe" },
    { id: "portugal", name: "Portugal", scope: "world", continent: "Europe" },
    { id: "spain", name: "Spain", scope: "world", continent: "Europe" },
    { id: "ethiopia", name: "Ethiopia", scope: "world", continent: "Africa" }
  ].map(function (r) { return entity("region", r); });

  /* ---------- 7. REGIONAL / HERITAGE DRINKS ---------- */
  // abvText is TEXT on purpose: home brews get "varies / low ABV" instead of fake precision.
  function regional(id, name, regionIds, abvText, base, consumed, context, example, extra) {
    return entity("regional", Object.assign({ id: id, name: name, regionIds: regionIds,
      abvText: abvText, base: base, consumed: consumed, context: context, example: example }, extra || {}));
  }
  var regionalDrinks = [
    // India
    regional("cashew-feni", "Cashew Feni", ["goa"], "~40–45%", "Fermented juice of the cashew apple",
      "Neat, or long with lime, soda or a lemon soft drink.",
      "GI-tagged in 2009 and later notified as a Goan 'heritage spirit'. Traditionally distilled in clay pots.",
      "Cazulo is one of the few widely bottled brands; much is local.", { difficulty: 2 }),
    regional("coconut-feni", "Coconut Feni", ["goa"], "varies", "Fermented coconut palm toddy",
      "Neat or mixed; drunk mostly in coastal south Goa.", "Older than cashew feni — cashews arrived with the Portuguese.",
      "Mostly local / unbranded.", { difficulty: 2 }),
    regional("urrak", "Urrak", ["goa"], "varies (lower than feni)", "First distillation of cashew apple juice",
      "Fresh and cold, usually with lime and salt — a summer-only drink.", "Available only in the cashew season (roughly March–May).",
      "Mostly local / unbranded.", { difficulty: 2 }),
    regional("mahua", "Mahua", ["mp", "chhattisgarh", "jharkhand", "odisha"], "varies", "Dried flowers of the mahua tree (Madhuca longifolia)",
      "Distilled locally; drunk at festivals, weddings and rituals.",
      "Central to many Adivasi communities. Madhya Pradesh has moved to recognise it as a heritage liquor.",
      "A few craft brands exist; mostly local.", { difficulty: 2, flag: "Exact year and terms of MP's heritage-liquor policy to verify." }),
    regional("arrack-kerala", "Arrack (Kerala)", ["kerala"], "varies", "Distilled coconut / palm toddy",
      "Historically sold through licensed arrack shops.", "Kerala banned arrack in 1996 — a landmark prohibition move.",
      "No legal brands in Kerala since the ban.", { difficulty: 2 }),
    regional("toddy", "Toddy / Kallu", ["kerala", "tn", "ap", "telangana"], "low; rises as it ferments through the day", "Sap of coconut or palmyra palm",
      "Fresh from the tree at toddy shops, often with spicy fish or meat.", "Starts sweet in the morning and turns sour and stronger by evening.",
      "Mostly local / unbranded.", { difficulty: 1 }),
    regional("desi-daru", "Desi daru (country liquor)", ["maharashtra", "up", "rajasthan", "haryana"], "varies by state", "Usually molasses spirit, sometimes flavoured",
      "Sold in small bottles or pouches at country-liquor shops.", "Legal, taxed 'country liquor' is separate from illicit hooch — the illicit kind is where methanol deaths happen.",
      "Many regional brands; flavours like 'santra' (orange) are classics.", { difficulty: 1 }),
    regional("kesar-kasturi", "Kesar Kasturi", ["rajasthan"], "~40% (verify)", "Spirit infused with saffron and herbs",
      "Sipped in small measures; a royal-court recipe.", "Revived as a 'heritage liquor' of Rajasthan's royal households.",
      "Produced by the state-run Rajasthan State Ganganagar Sugar Mills.", { difficulty: 3, flag: "ABV not verified." }),
    regional("handia", "Handia", ["jharkhand", "odisha", "chhattisgarh"], "low ABV", "Rice, fermented with 'ranu' herbal tablets",
      "Shared from earthen pots at festivals like Sarhul and Karma.", "A ritual and social drink among Santhal, Munda and Oraon communities.",
      "Mostly local / unbranded.", { difficulty: 2 }),
    regional("apong", "Apong", ["assam", "arunachal"], "low ABV", "Rice (sometimes with charred husk)",
      "Offered to guests and at festivals like Ali-Aye-Ligang.", "Especially associated with the Mising and Adi communities.",
      "Mostly local / unbranded.", { difficulty: 2 }),
    regional("zutho", "Zutho", ["nagaland"], "low ABV", "Sprouted rice",
      "Milky, sour-sweet; drunk from bamboo mugs.", "Nagaland has had prohibition since 1989, but rice beer remains part of community life.",
      "Mostly local / unbranded.", { difficulty: 3 }),
    regional("chhang", "Chhang", ["ladakh", "sikkim", "himachal"], "low ABV", "Barley, millet or rice",
      "Served in brass or wooden vessels, often warm in winter.", "A hospitality drink across the Himalaya — refusing a refill takes practice.",
      "Mostly local / unbranded.", { difficulty: 2 }),
    regional("tongba", "Tongba", ["sikkim", "nepal"], "low ABV", "Fermented millet",
      "Hot water is poured over millet in a bamboo vessel, sipped through a bamboo straw, and topped up again.", "A Limbu tradition from eastern Nepal and Sikkim; perfect for cold nights.",
      "Mostly local / unbranded.", { difficulty: 2 }),
    regional("lugdi", "Lugdi", ["himachal"], "low ABV", "Rice",
      "Drunk at festivals and in the cold months.", "Common in Kullu, Lahaul and Kinnaur.",
      "Mostly local / unbranded.", { difficulty: 3 }),
    // World
    regional("soju", "Soju", ["korea"], "~16–25%", "Rice, wheat, sweet potato or tapioca",
      "Shots with food. Pour for elders with two hands and turn away to drink.", "Cheap, everywhere, and at the heart of Korean after-work culture.",
      "Jinro (HiteJinro).", { difficulty: 1 }),
    regional("makgeolli", "Makgeolli", ["korea"], "~6–8%", "Rice",
      "Milky and fizzy, from bowls — classically with pajeon (savoury pancake) on rainy days.", "One of Korea's oldest alcoholic drinks.",
      "Seoul Jangsu.", { difficulty: 2 }),
    regional("sake", "Sake", ["japan"], "~14–17%", "Polished rice + koji mould",
      "Chilled, room temperature or warm, from small cups.", "Brewed more like beer than wine; the more the rice is polished, the more premium the grade.",
      "Dassai.", { difficulty: 1 }),
    regional("shochu", "Shochu", ["japan"], "~25% (up to ~40%)", "Sweet potato, barley or rice",
      "On the rocks, with water, or with hot water.", "Japan's most-drunk distilled spirit, especially in Kyushu.",
      "iichiko.", { difficulty: 2 }),
    regional("baijiu", "Baijiu", ["china"], "~40–60%", "Sorghum (and other grains)",
      "In tiny glasses at banquets, with repeated 'ganbei' (dry-cup) toasts.", "Among the most-consumed spirits in the world by volume.",
      "Kweichow Moutai.", { difficulty: 1 }),
    regional("arrack-lk", "Coconut Arrack", ["srilanka"], "~33–40%", "Sap of coconut flowers",
      "With ginger beer or soda, or in cocktails.", "Sri Lanka's national spirit — a different drink from Middle-Eastern 'arak'.",
      "Several Sri Lankan distillers bottle it.", { difficulty: 2 }),
    regional("mezcal", "Mezcal", ["mexico"], "~35–55%", "Many species of agave, roasted in earth pits",
      "Sipped slowly, often with orange slices and sal de gusano.", "All tequila is a mezcal, but not all mezcal is tequila. The pit-roasting gives the smoke.",
      "Del Maguey.", { difficulty: 2 }),
    regional("pulque", "Pulque", ["mexico"], "low ABV", "Fermented agave sap (aguamiel)",
      "Fresh in pulquerías, sometimes flavoured ('curado').", "Drunk since Aztec times — older than distilled tequila.",
      "Mostly local / unbranded.", { difficulty: 3 }),
    regional("cachaca", "Cachaça", ["brazil"], "~38–48%", "Fresh sugarcane juice",
      "In a caipirinha: lime, sugar, ice.", "Unlike most rum it comes from fresh juice, not molasses — which gives a grassy, funky taste.",
      "Cachaça 51.", { difficulty: 2 }),
    regional("pisco", "Pisco", ["peru-chile"], "~38–48%", "Grapes (distilled wine)",
      "In a Pisco Sour — lime, sugar, egg white, bitters.", "Peru and Chile both claim it; each has its own rules.",
      "Capel (Chile).", { difficulty: 2 }),
    regional("ouzo", "Ouzo", ["greece"], "~37.5–50%", "Grape spirit + anise",
      "With water and ice alongside meze — it turns cloudy ('louche').", "The cloudiness happens because anise oils fall out of solution when diluted.",
      "Ouzo 12.", { difficulty: 1 }),
    regional("raki", "Rakı / Arak", ["turkey"], "~40–50%", "Grapes + aniseed",
      "Diluted with water (turns milky — 'lion's milk'), with meze and fish.", "Rakı tables are long, slow, conversational affairs.",
      "Yeni Rakı.", { difficulty: 2 }),
    regional("absinthe", "Absinthe", ["switzerland"], "~45–74%", "Spirit + wormwood, anise, fennel",
      "Iced water dripped over a sugar cube into the glass.", "Banned in much of Europe in the early 1900s; the 'hallucination' reputation is a myth.",
      "Pernod Absinthe.", { difficulty: 2 }),
    regional("grappa", "Grappa", ["italy"], "~37.5–60%", "Pomace (grape skins, seeds, stems left after winemaking)",
      "Small glass after dinner, or in espresso ('caffè corretto').", "Born as a zero-waste peasant spirit.",
      "Nonino.", { difficulty: 2 }),
    regional("aquavit", "Aquavit", ["nordics"], "~40%", "Grain or potato spirit + caraway or dill",
      "Chilled shots at festive meals, with a 'skål'.", "Linie Aquavit is shipped across the equator and back in casks before it's bottled.",
      "Linie.", { difficulty: 2 }),
    regional("palinka", "Pálinka / Slivovitz", ["hungary"], "~37.5–50%+", "Fruit — apricot, plum, pear",
      "Room-temperature shot, often as a welcome drink.", "'Pálinka' is a protected name for Hungarian fruit spirits.",
      "Mostly craft / local producers.", { difficulty: 3 }),
    regional("port", "Port", ["portugal"], "~19–22%", "Grapes; fermentation stopped with grape spirit",
      "After dinner, with cheese or dessert.", "Fortifying mid-fermentation keeps natural sugar — that's why port is sweet.",
      "Taylor's, Graham's.", { difficulty: 2 }),
    regional("sherry", "Sherry", ["spain"], "~15–22%", "White grapes from around Jerez",
      "Dry styles chilled with tapas; sweet styles after dinner.", "Aged in a 'solera' — a pyramid of casks where young wine tops up older wine.",
      "Tío Pepe.", { difficulty: 2 }),
    regional("vermouth", "Vermouth", ["italy"], "~15–18%", "Wine + botanicals + spirit",
      "On ice with soda, or in a martini, Negroni or Manhattan.", "Named after the German word for wormwood.",
      "Martini & Rossi.", { difficulty: 2 }),
    regional("tej", "Tej (honey wine)", ["ethiopia"], "varies", "Honey + gesho leaves",
      "Served in a round-bottomed flask called a berele.", "Ethiopia's mead, drunk at celebrations for centuries.",
      "Mostly local / unbranded.", { difficulty: 3 })
  ];

  /* ---------- 8. GLOSSARY ---------- */
  function term(id, name, definition, extra) {
    return entity("glossary", Object.assign({ id: id, name: name, definition: definition }, extra || {}));
  }
  var glossary = [
    term("abv", "ABV", "Alcohol By Volume — the % of the liquid that is pure alcohol. A 40% spirit is 40 ml alcohol per 100 ml."),
    term("proof", "Proof", "An older strength scale. US proof = 2 × ABV. The old British scale is why Indian labels say '25 UP' (25 under proof) = 42.8% ABV."),
    term("imfl", "IMFL", "Indian-Made Foreign Liquor — 'foreign'-style spirits (whisky, rum, vodka) made in India. Separate from country liquor."),
    term("single-malt", "Single malt", "Whisky made only from malted barley, at a single distillery, in pot stills."),
    term("blended", "Blended whisky", "A mix of malt whiskies and (usually cheaper) grain whisky. Most of the world's whisky is blended."),
    term("cask-strength", "Cask strength", "Bottled straight from the cask without diluting to 40% — often 50–60%+ ABV."),
    term("nas", "NAS", "No Age Statement — the label doesn't promise a minimum age. Not automatically worse, but you're trusting the brand."),
    term("vs-vsop-xo", "VS / VSOP / XO", "Cognac age grades: VS ≥ 2 years, VSOP ≥ 4 years, XO ≥ 10 years in oak (for the youngest brandy in the blend)."),
    term("reposado", "Reposado / Añejo", "Tequila age grades: blanco (unaged), reposado (2–12 months in oak), añejo (1–3 years), extra añejo (3+ years)."),
    term("botanicals", "Botanicals", "Plants used to flavour gin: juniper, coriander, citrus peel, angelica, and more."),
    term("congeners", "Congeners", "Flavour by-products of fermentation and ageing (e.g. methanol traces, fusel oils). Darker drinks usually have more — and they're linked to worse hangovers."),
    term("gi-tag", "GI tag", "Geographical Indication — a legal label saying a product is tied to a place, e.g. Goan cashew feni or Champagne."),
    term("rtd", "RTD", "Ready-To-Drink: pre-mixed alcoholic drinks in cans or bottles."),
    term("peg", "Peg", "Indian bar measure: a small peg is 30 ml, a large (patiala-style) peg is 60 ml."),
    term("angels-share", "Angel's share", "Alcohol that evaporates from casks as they age — roughly 2% a year in Scotland, much more in hot climates like India."),
    term("pot-still", "Pot still", "A copper kettle distilled in batches. Slower, keeps more flavour. Used for single malts and Cognac."),
    term("column-still", "Column still", "A tall continuous still. Efficient, gives lighter, purer spirit. Used for vodka, grain whisky and most rum."),
    term("neat", "Neat / on the rocks", "Neat = straight, no ice. On the rocks = over ice. 'Up' = chilled, then strained into a stemmed glass."),
    term("highball", "Highball", "A spirit topped with a larger amount of fizzy mixer in a tall glass (e.g. whisky-soda, gin & tonic)."),
    term("premiumisation", "Premiumisation", "When consumers 'drink less but better' — trading up to pricier brands. Big theme for India's alcohol industry.")
  ];

  /* ---------- 9. MYTHS vs FACTS (flip cards) ---------- */
  var myths = [
    entity("myth", { id: "myth-redwine", myth: "Red wine is heart medicine.",
      fact: "Evidence for 'healthy drinking' has weakened a lot. The WHO says no level of alcohol is safe; any benefit from compounds in grapes you can get from grapes." }),
    entity("myth", { id: "myth-beer-liquor", myth: "Beer before liquor, never been sicker.",
      fact: "A 2019 study found the order made no difference. How much alcohol you drink (and how fast) is what matters." }),
    entity("myth", { id: "myth-coffee", myth: "Coffee sobers you up.",
      fact: "Only your liver clears alcohol, at a fixed pace. Coffee just makes you a more awake drunk person." }),
    entity("myth", { id: "myth-dark", myth: "Dark spirits give worse hangovers.",
      fact: "Partly true! Darker drinks carry more congeners, which studies link to worse hangovers. But the total amount still matters most." }),
    entity("myth", { id: "myth-beer-weak", myth: "Beer can't get you as drunk as whisky.",
      fact: "Alcohol is alcohol. A 650 ml strong beer has about as much as two large whisky pegs." }),
    entity("myth", { id: "myth-shower", myth: "A cold shower sobers you up.",
      fact: "It might wake you up. Your blood alcohol stays exactly the same." })
  ];

  /* ---------- 10. "DID YOU KNOW?" FACTS (ticker) ---------- */
  var facts = [
    "Indian spirits are often 42.8% ABV because that equals '25 under proof' on the old British scale.",
    "A 30 ml peg of 42.8% whisky is about 10 g of alcohol — almost exactly one WHO standard drink.",
    "Linie Aquavit crosses the equator twice in casks on a ship before it's bottled.",
    "Tongba is sipped through a bamboo straw and topped up with hot water — the same millet lasts all evening.",
    "Monkey 47 gin: 47 botanicals, bottled at 47%.",
    "Vodka isn't aged because oak would add exactly the flavour it's trying to avoid.",
    "Hot Indian summers make whisky age fast — casks lose far more to the 'angel's share' than in Scotland.",
    "The gin & tonic began as a way to make anti-malaria quinine drinkable in colonial India.",
    "Cognac must be double-distilled in copper pot stills in the Cognac region of France.",
    "Kerala banned arrack in 1996.",
    "Surrogate advertising: alcohol brands advertise 'soda', 'music CDs' or 'glassware' with the same name and logo.",
    "Goan cashew feni got a GI tag in 2009."
  ].map(function (text, i) { return entity("fact", { id: "fact-" + (i + 1), text: text }); });

  /* ---------- 11. OCCASIONS (Matchmaker) ---------- */
  var occasions = [
    entity("occasion", { id: "date", name: "Date / partner",
      picks: ["A glass of wine (Sula Sauvignon Blanc or a Shiraz)", "A gin & tonic", "A spritz (Aperol + prosecco + soda)"],
      why: "Moderate ABV, easy to pace, and signals 'I'm here for the conversation'.",
      etiquette: "Match their pace. Order one, see how the evening goes.",
      watchOut: "Don't let 'liquid courage' do the talking." }),
    entity("occasion", { id: "house-party", name: "House party",
      picks: ["Beer or a light lager", "Highballs (whisky-soda, rum-cola)", "A big batch of punch — clearly labelled"],
      why: "Long drinks last longer. Batched drinks let the host control strength.",
      etiquette: "Bring something. Always put out water and a proper zero-proof option.",
      watchOut: "Punch hides its strength. Know what's in the bowl." }),
    entity("occasion", { id: "friends", name: "Friends night out",
      picks: ["Beer or a pitcher", "Old Monk & cola, for nostalgia", "A shared cocktail round"],
      why: "Social, relaxed, easy to pace with food.",
      etiquette: "Rounds are a contract — keep up your end, or opt out early.",
      watchOut: "Rounds speed everyone up to the fastest drinker. Skip one." }),
    entity("occasion", { id: "colleagues", name: "Colleagues",
      picks: ["A beer or a single highball", "A glass of wine", "A mocktail — nobody should care"],
      why: "You're still 'at work'. Low ABV, one or two, done.",
      etiquette: "Never push drinks on anyone. Leave while you're still sharp.",
      watchOut: "Office parties become office stories." }),
    entity("occasion", { id: "client-dinner", name: "Client / senior dinner",
      picks: ["Follow the host's lead", "A glass of wine with food", "One whisky, with water or soda"],
      why: "It's about signalling judgement. A good single malt or a glass of wine reads as 'refined, in control'.",
      etiquette: "Let the senior or host order first. Toast when they toast.",
      watchOut: "One drink under the table is worth two over the line." }),
    entity("occasion", { id: "celebration", name: "Celebration",
      picks: ["Sparkling wine (Sula Brut, or Champagne if the budget stretches)", "A toast, then switch to something lighter"],
      why: "Bubbles signal 'occasion'. One glass is enough to mark it.",
      etiquette: "Make eye contact when you clink — it matters in many cultures.",
      watchOut: "Bubbles speed up absorption. Eat something." }),
    entity("occasion", { id: "after-dinner", name: "After-dinner",
      picks: ["A small Cognac or brandy", "Port", "A digestif like Jägermeister or grappa"],
      why: "Small measures, big flavour, slow sipping.",
      etiquette: "Sip, don't shoot.",
      watchOut: "If you've already had a few, this is the one to skip." }),
    entity("occasion", { id: "solo-tasting", name: "Solo tasting",
      picks: ["An Indian single malt (Amrut, Paul John, Indri)", "A flight of three 15 ml pours", "A good tequila, neat"],
      why: "Learning mode: small pours, water on the side, notes.",
      etiquette: "Add a few drops of water — it opens up flavours in high-ABV spirits.",
      watchOut: "Tasting ≠ drinking. Watch the running total." }),
    entity("occasion", { id: "zero-proof", name: "None of the above / zero-proof",
      picks: ["Alcohol-free beer", "Tonic with bitters, lime and cucumber", "Kokum or aam panna soda", "Non-alcoholic spirits in a proper glass"],
      why: "Same ritual, same glass, zero alcohol. More and more brands make serious zero-proof drinks.",
      etiquette: "'I'm not drinking tonight' is a complete sentence.",
      watchOut: "Nothing — enjoy it." })
  ];

  /* ---------- 12. HOW IT'S MADE (process steps) ---------- */
  var process = [
    entity("step", { id: "ferment", n: 1, meter: { label: "Typical strength after fermenting", value: "~5–15%", fill: 0.14 }, title: "Ferment", short: "Yeast eats sugar → alcohol + CO₂",
      body: "Any sugar will do: grape juice, malted grain, molasses, cashew apple, mahua flowers. Yeast turns it into alcohol and bubbles. Around 15–16% the alcohol poisons the yeast, so fermentation stops there.",
      points: ["Beer, wine, sake, toddy and rice beers stop here.", "That's why no 'natural' drink is much stronger than ~16%."] }),
    entity("step", { id: "distil", n: 2, meter: { label: "Fresh spirit off the still (clear!)", value: "~60–70%", fill: 0.68 }, title: "Distil", short: "Boil, catch the vapour, concentrate",
      body: "Alcohol boils at about 78 °C, water at 100 °C. Heat the fermented liquid and the vapour is richer in alcohol; cool it back to liquid and you've concentrated it.",
      points: ["Pot still: a copper kettle, one batch at a time. Slower, keeps more flavour — single malt, Cognac.",
        "Column still: a tall tower that runs non-stop. Efficient, cleaner and lighter spirit — vodka, grain whisky, most rum.",
        "Distillers discard the first 'heads' (harsh, where methanol concentrates) and the last 'tails' — keeping the 'hearts'."] }),
    entity("step", { id: "age", n: 3, meter: { label: "In the cask, gaining colour", value: "~60%+", fill: 0.62 }, title: "Age", short: "Wood does the talking",
      body: "Fresh spirit is clear and fiery. Oak casks add colour, vanilla, caramel and spice, and slowly soften the harsh edges.",
      points: ["Ex-bourbon American oak → vanilla, coconut, honey.", "Ex-sherry European oak → dried fruit, nuts, spice.",
        "Whisky is aged because the wood IS the flavour. Vodka isn't, because its whole point is neutrality.",
        "Heat speeds ageing: Indian casks lose far more to the 'angel's share' each year than Scottish ones."] }),
    entity("step", { id: "bottle", n: 4, meter: { label: "Diluted for bottling", value: "40–42.8%", fill: 0.42 }, title: "Blend & bottle", short: "Consistency, strength, label",
      body: "Blenders mix casks so every bottle tastes the same year after year, then dilute with water to bottling strength.",
      points: ["Proof: US proof is simply 2 × ABV (80 proof = 40%).",
        "Old British proof is why Indian labels say '25 UP' — 25 under proof = 42.8% ABV.",
        "Scotch may legally add caramel colouring (E150a) for a consistent colour."] })
  ];

  /* ---------- 13. HEALTH & SAFETY ---------- */
  var health = {
    headline: [
      { id: "h-who", title: "No risk-free level", text: "The WHO's position (2023): there is no level of alcohol consumption that is safe for health." },
      { id: "h-iarc", title: "Group 1 carcinogen", text: "IARC classifies alcohol as Group 1 — the same group as tobacco. That describes how sure the evidence is, not how big the risk is." },
      { id: "h-methanol", title: "Illicit hooch can kill", text: "Illicit liquor can contain methanol, which causes blindness and death. Symptoms can take 12–24 hours to appear. Blurred vision after drinking = go to emergency care now." }
    ],
    body: [
      { id: "h-liver", title: "Liver", text: "Fatty liver can start with regular heavy drinking; it can progress to hepatitis and cirrhosis." },
      { id: "h-heart", title: "Heart & BP", text: "Alcohol raises blood pressure and can trigger irregular heartbeats — especially after a binge." },
      { id: "h-sleep", title: "Sleep", text: "It knocks you out, then disrupts REM sleep in the second half of the night. Hence tired-but-slept-8-hours." },
      { id: "h-weight", title: "Weight", text: "7 kcal per gram of alcohol, plus sugary mixers, plus the 2 a.m. snack decisions." },
      { id: "h-hangover", title: "Hangovers", text: "Dehydration, poor sleep and congeners. Darker drinks usually carry more congeners." }
    ],
    combos: [
      "Energy drinks: caffeine hides how drunk you are, so people drink more.",
      "Medicines: painkillers like paracetamol, sedatives, antihistamines and many others don't mix with alcohol. Ask a pharmacist.",
      "'Mixing drinks' isn't the problem by itself — it usually just means more total alcohol, faster."
    ],
    // "Into you" slider (story mode). One row per number of LARGE pegs (60 ml at 42.8%).
    // Bars are ILLUSTRATIVE (0–100) — real effects vary with body weight, sex, food,
    // tolerance and speed of drinking. Lines are deliberately witty, never glamorising.
    pegDisclaimer: "Illustrative only. Effects vary a lot with body weight, sex, food, pace and tolerance. There is no safe number for driving: zero.",
    heavyEpisodicGrams: 60, // WHO definition of heavy episodic ("binge") drinking: 60 g+ pure alcohol on one occasion
    rotiKcal: 100,          // rough kcal in one roti, used for the calorie comparison
    dimensions: [
      { id: "judgement", name: "Judgement" }, { id: "coordination", name: "Coordination" },
      { id: "sleep", name: "Sleep quality lost" }, { id: "tomorrow", name: "Tomorrow-you" }
    ],
    pegScale: [
      { pegs: 0, mood: "Zero-proof", line: "Your liver sends its warmest regards.", judgement: 0, coordination: 0, sleep: 0, tomorrow: 0 },
      { pegs: 1, mood: "Mellow", line: "You still remember everyone's name. Even the new intern's.", judgement: 12, coordination: 8, sleep: 15, tomorrow: 8 },
      { pegs: 2, mood: "Chatty", line: "Your jokes are funnier. To you. Driving is already off the table.", judgement: 28, coordination: 20, sleep: 30, tomorrow: 20 },
      { pegs: 3, mood: "Heavy episode", line: "Congratulations: the WHO now calls this 'heavy episodic drinking'.", judgement: 45, coordination: 38, sleep: 45, tomorrow: 38 },
      { pegs: 4, mood: "Wobbly", line: "Your texting judgement has left the building. Hand someone your phone.", judgement: 60, coordination: 55, sleep: 60, tomorrow: 55 },
      { pegs: 5, mood: "Unsteady", line: "Balance, memory and dignity are now optional extras.", judgement: 72, coordination: 70, sleep: 72, tomorrow: 70 },
      { pegs: 6, mood: "Foggy", line: "Tomorrow-you is drafting a strongly worded letter.", judgement: 82, coordination: 80, sleep: 82, tomorrow: 84 },
      { pegs: 7, mood: "Blackout zone", line: "Memory stops recording here. Stop. Water, food, and a sober friend nearby.", judgement: 92, coordination: 90, sleep: 90, tomorrow: 93 },
      { pegs: 8, mood: "Danger", line: "This is how nights end in hospital. Unresponsive, vomiting or slow breathing? Call 112.", judgement: 100, coordination: 100, sleep: 100, tomorrow: 100 }
    ],
    pacing: [
      "Eat before and while you drink.", "Alternate every drink with water.", "Decide your number before the first drink.",
      "Pour your own; know your peg size.", "Never drink and drive. Ever."
    ]
  };

  /* ---------- 14. BUSINESS OF BOOZE ---------- */
  var business = {
    majors: ["diageo", "pernod", "bacardi", "abinbev", "heineken", "lvmh"],
    cards: [
      { id: "biz-house", title: "House of brands", text: "The giants own ladders of brands across price tiers — one company can sell you a value whisky and a luxury one, and you'd never know. Think of it as portfolio strategy." },
      { id: "biz-states", title: "28 states, 28 markets", text: "Alcohol is a state subject in India: each state sets its own excise, prices and retail rules — some sell through state-run shops. The same bottle can cost very different amounts across a state border." },
      { id: "biz-whisky", title: "Whisky nation", text: "India is often described as the world's largest whisky market by volume. The South skews to brandy; rum has its own loyal pockets." },
      { id: "biz-surrogate", title: "Surrogate advertising", text: "Direct alcohol ads are banned in India. So brands advertise 'soda', 'music CDs' or 'glassware' with the same name and logo. Regulators have tightened rules against this since 2022." },
      { id: "biz-premium", title: "Premiumisation", text: "'Drink less, but better.' Rising incomes push people up the price ladder — which is why Indian single malts, craft gins and luxury rums have exploded." }
    ]
  };

  /* ---------- 15. SERVE & ETIQUETTE ---------- */
  var serve = {
    pours: [
      { id: "p-small", name: "Small peg", ml: 30, note: "The Indian bar standard." },
      { id: "p-large", name: "Large peg", ml: 60, note: "Two small pegs." },
      { id: "p-wine", name: "Glass of wine", ml: 150, note: "Restaurants vary: 125–175 ml." },
      { id: "p-bottle", name: "Beer bottle", ml: 650, note: "India's classic big bottle; 330 ml is the small one." }
    ],
    styles: [
      { id: "s-neat", name: "Neat", text: "Straight, room temperature. For tasting good spirits." },
      { id: "s-rocks", name: "On the rocks", text: "Over ice. Softens and chills, dilutes as it melts." },
      { id: "s-highball", name: "Highball", text: "Spirit + lots of fizzy mixer in a tall glass. The slow-and-social option." },
      { id: "s-cocktail", name: "Cocktail", text: "A recipe of several ingredients. Taste can hide strength." }
    ],
    glasses: [
      { id: "g-tumbler", name: "Tumbler / rocks", use: "Whisky, rum, neat or on ice" },
      { id: "g-highball", name: "Highball", use: "G&T, whisky-soda, rum-cola" },
      { id: "g-wine", name: "Wine glass", use: "Bowl shape to swirl and smell" },
      { id: "g-flute", name: "Flute", use: "Sparkling wine — keeps the bubbles" },
      { id: "g-snifter", name: "Snifter", use: "Cognac, brandy — cupped to warm" },
      { id: "g-pint", name: "Pint / beer mug", use: "Beer" }
    ],
    toasts: [
      { lang: "English", word: "Cheers" },{ lang: "Japanese", word: "Kanpai" },
      { lang: "Chinese", word: "Ganbei" }, { lang: "Korean", word: "Geonbae" }, { lang: "Spanish", word: "Salud" },
      { lang: "Nordic", word: "Skål" }, { lang: "German", word: "Prost" }, { lang: "French", word: "Santé" }, { lang: "Irish", word: "Sláinte" }
    ],
    pairings: [
      "Beer + spicy food: carbonation cools the heat.", "Crisp white wine + seafood.", "Shiraz + grilled or tandoori meats.",
      "Peated whisky + dark chocolate.", "Sparkling wine + fried snacks — yes, even pakoras."
    ]
  };

  /* ---------- 16. LOCALE SETTINGS ---------- */
  // Change these to adapt the site to another country.
  var locale = {
    country: "India",
    ageGateText: "Are you of legal drinking age in your state? (It ranges from 18 to 25 across India, and some states are dry.)",
    // Bottom notice shown for 5 seconds, once a day (see Atlas.initNotice in core.js)
    noticeText: "Spirit Atlas is for adults of legal drinking age in your state (18–25 across India; some states are dry). Drink safely: pace yourself, eat, hydrate, and never drink and drive.",
    standardDrinks: [
      { id: "who", label: "WHO / India (10 g)", grams: 10 },
      { id: "us", label: "USA (14 g)", grams: 14 },
      { id: "uk", label: "UK unit (8 g)", grams: 8 }
    ],
    defaultStandard: "who",
    helpResources: [
      { name: "Tele-MANAS (national mental health helpline)", contact: "14416 or 1-800-891-4416" },
      { name: "Emergency", contact: "112" }
    ]
  };

  // Expose everything on one global object that the pages read from.
  window.ATLAS_DATA = {
    version: "0.1-mvp",
    ownershipAsOf: 2026,
    families: families, categories: categories, companies: companies, brands: brands,
    skus: skus, regions: regions, regionalDrinks: regionalDrinks, glossary: glossary,
    myths: myths, facts: facts, occasions: occasions, locale: locale,
    process: process, health: health, business: business, serve: serve
  };
})();
