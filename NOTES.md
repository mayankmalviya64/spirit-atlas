# Spirit Atlas — Planning Notes (MVP stage)

## 1. Site map (information architecture)

| # | Section | What's in it | Status in MVPs |
|---|---|---|---|
| 0 | Age gate | Soft "are you of legal age in your state?" check. Nothing stored. | Both |
| 1 | Hero | Animated tagline, "pick your path" buttons, "Did you know?" ticker | Both |
| 2 | Category explorer | Family → Category → Company → Brand → Bottle tree, detail drawer, filters (family, ABV, tier, origin) | Both |
| 3 | Regional & heritage atlas | India tile map (stylised, not to scale) + world list by continent → drink cards | Both (real maps in final build) |
| 4 | How it's made | Ferment → distil → age → bottle; pot vs column, casks, proof | Atlas: step-through · Story mode: scroll story |
| 5 | Alcohol math | Formula → substituted values → grams, standard drinks (10/14/8 g), kcal | Both |
| 6 | Health & safety | WHO, IARC, body effects, combos, methanol, pacing, myth flip cards, helplines | Both |
| 7 | Occasion matchmaker | 8 occasions + zero-proof | Both |
| 8 | Business of booze | Explainer cards + portfolio "ladders" computed from the data | Both |
| 9 | Serve & etiquette | Pours, serve styles, glassware, pairings, toasts | Both |
| 10 | Glossary | Searchable terms | Both |
| — | Global search, dark/light, footer disclaimer | Always on | Both |

## 2. Data blueprint (`shared/data.js`)

Every entity has: `id`, `type`, `tags[]`, `difficulty (1–3)`, `sources[]`, `gamification { xpValue, quizEligible, badgeTags[] }`, and optional `flag` for unverified facts.

```
family    { id, name, accent, blurb }
category  { id, name, familyId, abv:[min,max], base, howMade, flavour, serve, glass, funFact }
company   { id, name, hq, note }                       // ownership "as of 2026"
brand     { id, name, companyId, categoryId, origin, tier, abv:[min,max], funFact?, note?, flag? }
sku       { id, name, brandId, abv:[min,max], tier? }
region    { id, name, scope:"india"|"world", tile:[col,row] | continent }
regional  { id, name, regionIds[], abvText, base, consumed, context, example, flag? }
glossary  { id, name, definition }
myth      { id, myth, fact }
fact      { id, text }
occasion  { id, name, picks[], why, etiquette, watchOut }
step      { id, n, title, short, body, points[], meter }
+ health, business, serve, locale (plain config objects)
```

Price tiers: `value | mainstream | premium | luxury`.

**Event bus** (`Atlas.bus.emit`), which is a no-op for now: `node_opened`, `region_viewed`, `calculator_used`, `myth_flipped`, `occasion_matched`, `process_step_viewed`, `story_chapter_viewed`, `hub_tool_opened`.
Phase 2 will subscribe with `Atlas.bus.on(...)` to award XP, badges and passport stamps.

## 3. Facts to verify (⚠️ in the UI)

- Simba, White Owl, Maka Zai, Samsara: current owner/producer and operating status
- Oaka (Suntory, India): positioning and launch details
- Jacob's Creek: owner after Pernod Ricard's wine-portfolio sale (~2024–25)
- Godawan, Camikara: ABV by edition
- Mahua: year and terms of MP's heritage-liquor policy
- Kesar Kasturi: ABV
- India has no official "standard drink": 10 g (WHO) is used as the default and labelled as such
- Legal drinking age varies by state (18–25), and some states are dry
- No market-share or price numbers are used. The business section is qualitative, and portfolio charts count only brands in this atlas.
- Imperial Blue (reportedly sold by Pernod to Tilaknagar in 2025) is not yet included

## 4. Still to do for the final build
- Real SVG maps (India states + world) instead of the tile map and continent list
- Expand SKUs (more bottles per brand) and source notes
- Decide the direction (Option 1 / 3 / mix), then merge into a single self-contained HTML file for GitHub Pages
