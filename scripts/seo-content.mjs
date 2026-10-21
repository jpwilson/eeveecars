/**
 * Content source of truth for EV Lineup's static marketing pages.
 *
 * Every fact here must be checkable in this repo, in the live EV Lineup
 * database, or on the competitor's own public website (competitor claims are
 * general, hedged, and dated). No invented stats, ratings, or testimonials.
 *
 * Consumed by scripts/build-pages.mjs (writes public/*.html, llms.txt,
 * llms-full.txt) and scripts/check-seo.mjs (verifies the built output).
 */

export const SITE = {
  name: "EV Lineup",
  host: "https://www.evlineup.org",
  tagline: "Every electric vehicle, compared",
  contact: "jeanpaulwilson@gmail.com",
  logo: "https://www.evlineup.org/pub_assets/hero-ev.png",
  updated: "2026-10-21",
  updatedLabel: "October 21, 2026",
};

/** Counts verified against the live API on 2026-10-21:
 *  /cars/cards -> 87 model records, 32 brands with models
 *  /makes      -> 35 manufacturer profiles */
export const STATS = {
  models: 87,
  brandsWithModels: 32,
  manufacturerProfiles: 35,
};

/** Best-of list pages — slugs must stay in sync with src/data/seoPages.ts,
 *  api/prerender.js (BEST_CONFIGS) and api/ev/best.js. */
export const BEST_LISTS = [
  ["/best/longest-range-evs", "Longest range electric cars"],
  ["/best/cheapest-evs", "Cheapest electric cars"],
  ["/best/evs-under-40k", "Best EVs under $40,000"],
  ["/best/fastest-evs", "Fastest electric cars (0–60 mph)"],
  ["/best/3-row-evs", "Best 3-row electric SUVs (6+ seats)"],
  ["/best/electric-trucks", "Electric pickup trucks"],
  ["/best/300-mile-range-evs", "EVs with 300+ miles of range"],
];

/** Curated comparison pairs — mirror of COMPARE_PAIRS in src/data/seoPages.ts. */
export const COMPARE_PAIRS = [
  ["/compare/tesla-model-3-vs-bmw-i4", "Tesla Model 3 vs BMW i4"],
  ["/compare/hyundai-ioniq-5-vs-kia-ev6", "Hyundai Ioniq 5 vs Kia EV6"],
  ["/compare/tesla-model-y-vs-ford-mustang-mach-e", "Tesla Model Y vs Ford Mustang Mach-E"],
  ["/compare/rivian-r1s-vs-tesla-model-x", "Rivian R1S vs Tesla Model X"],
  ["/compare/tesla-model-3-vs-hyundai-ioniq-6", "Tesla Model 3 vs Hyundai Ioniq 6"],
  ["/compare/ford-f150-lightning-vs-tesla-cybertruck", "Ford F-150 Lightning vs Tesla Cybertruck"],
  ["/compare/chevrolet-equinox-ev-vs-tesla-model-y", "Chevrolet Equinox EV vs Tesla Model Y"],
  ["/compare/kia-ev9-vs-rivian-r1s", "Kia EV9 vs Rivian R1S"],
  ["/compare/tesla-model-y-vs-hyundai-ioniq-5", "Tesla Model Y vs Hyundai Ioniq 5"],
  ["/compare/rivian-r1t-vs-ford-f150-lightning", "Rivian R1T vs Ford F-150 Lightning"],
];

export const TOP_MAKES = [
  ["/manufacturer/tesla", "Tesla"],
  ["/manufacturer/hyundai", "Hyundai"],
  ["/manufacturer/kia", "KIA"],
  ["/manufacturer/ford", "Ford"],
  ["/manufacturer/rivian", "Rivian"],
  ["/manufacturer/bmw", "BMW"],
  ["/manufacturer/chevrolet", "Chevrolet"],
  ["/manufacturer/lucid", "Lucid"],
  ["/manufacturer/porsche", "Porsche"],
  ["/manufacturer/volvo", "Volvo"],
  ["/manufacturer/mercedes", "Mercedes"],
  ["/manufacturer/polestar", "Polestar"],
];

/** Specs stored for every model (fields returned by the EV Lineup API). */
export const SPEC_FIELDS = [
  "MSRP (starting price, USD)",
  "EPA range in miles",
  "0–60 mph acceleration",
  "Top speed",
  "Power in horsepower",
  "Usable battery capacity in kWh",
  "Maximum DC fast-charging speed in kW",
  "Drive type (RWD, FWD, AWD)",
  "Adult seat count",
  "Vehicle class and generation",
  "Availability status (available, coming soon, discontinued)",
  "Trim/variant breakdown for each model",
];

export const API_ENDPOINTS = [
  ["GET /api/ev/all", "every model in the database with its headline specs"],
  ["GET /api/ev/search?q=", "search models by name, with optional minRange, maxPrice, minSeats and availability filters"],
  ["GET /api/ev/specs?slug=", "the full spec sheet for one model"],
  ["GET /api/ev/compare?models=slug-a,slug-b", "a side-by-side comparison of two models"],
  ["GET /api/ev/best?criteria=", "a ranked best-of list (cheapest-evs, longest-range-evs, fastest-evs, evs-under-40k, 3-row-evs, electric-trucks, 300-mile-range-evs)"],
];

/* ------------------------------------------------------------------ *
 * Shared prose
 * ------------------------------------------------------------------ */

export const ONE_LINER =
  "EV Lineup is a free electric vehicle database and comparison site for anyone shopping for or researching an EV.";

export const WHAT_IT_IS_PARA = `${ONE_LINER} It holds a standardized spec sheet for ${STATS.models} electric models from ${STATS.brandsWithModels} brands — price, EPA range, 0–60 mph, power, battery size, DC fast-charging speed, seats and trims — plus profiles for ${STATS.manufacturerProfiles} manufacturers, side-by-side comparisons of any two models, and best-of lists generated from the same data. It is free, needs no account to browse, and has no dealer lead forms.`;

/* ------------------------------------------------------------------ *
 * FAQ — answers come from this repo, the live database, or the site itself
 * ------------------------------------------------------------------ */

export const FAQS = [
  {
    q: "What is EV Lineup?",
    a: `${ONE_LINER} Every model page carries the same spec fields — starting price, EPA range, 0–60 mph, horsepower, battery capacity in kWh, maximum DC charging speed, drive type and seat count — so two cars can be compared line by line instead of by reading two reviews. The database covers ${STATS.models} electric models from ${STATS.brandsWithModels} brands and profiles ${STATS.manufacturerProfiles} manufacturers.`,
  },
  {
    q: "Is EV Lineup free, and do I need an account?",
    a: "Yes, it is free, and no account is needed. Every model page, manufacturer page, comparison and best-of list is open to anyone. Signing in is optional and only unlocks a personal dashboard for saved EVs, saved comparisons and research notes; there is no paywall, trial or subscription, and no form to fill in before you see the data.",
  },
  {
    q: "How many electric cars are in the EV Lineup database?",
    a: `As of ${SITE.updatedLabel} the database holds ${STATS.models} electric model pages from ${STATS.brandsWithModels} brands, with profiles for ${STATS.manufacturerProfiles} manufacturers. Models are added as they are announced, which means the catalog includes cars that are on sale, coming soon and discontinued — each one is labelled with its availability status.`,
  },
  {
    q: "Which brands and regions does EV Lineup cover?",
    a: "The focus is the US market — Tesla, Ford, Chevrolet, GMC, Cadillac, Rivian, Lucid, Hyundai, Kia, Genesis, BMW, Mercedes, Audi, Porsche, Volvo, Polestar, Nissan, Subaru, Toyota, Mini, Jaguar, Volkswagen and more. Notable models from Europe and China are also listed, including Renault, Citroën, BYD, NIO, XPeng, Geely and Rimac, which are useful for context but are not all sold in the United States.",
  },
  {
    q: "Where does EV Lineup's data come from?",
    a: "Specs are researched from manufacturer material and public sources, and range figures are the EPA ratings where an EPA rating exists. Because prices and specs change often, always confirm the final numbers with the manufacturer or dealer before you buy. If you spot something wrong, email " + SITE.contact + " and it gets fixed.",
  },
  {
    q: "How do I compare two electric cars side by side?",
    a: "Open a comparison URL directly — for example /compare/tesla-model-3-vs-bmw-i4 — or pick two cars in the database and use the compare bar. The comparison table puts price, EPA range, 0–60 mph, top speed, power, battery capacity, DC charging speed and seat count in one view and marks which car wins each row.",
  },
  {
    q: "Which electric car has the longest range?",
    a: "The /best/longest-range-evs page ranks every model in the database by EPA range and is generated from live data, so it stays current. As of " + SITE.updatedLabel + " several models in the database are rated above 400 miles of EPA range. Real-world range is lower than the EPA figure in cold weather and at highway speeds.",
  },
  {
    q: "What is the cheapest electric car?",
    a: "The /best/cheapest-evs page ranks models by MSRP, and /best/evs-under-40k lists everything under $40,000. As of " + SITE.updatedLabel + " the entry end of the US market in the database sits around $34,000–$35,000 MSRP before taxes, fees and incentives; a federal or state incentive can lower the real cost further. Micro-EVs sold only outside the US, such as the Citroën AMI, are cheaper still.",
  },
  {
    q: "Are there electric SUVs with three rows of seats?",
    a: "Yes. The /best/3-row-evs page lists every model in the database with six or more adult seats; the Kia EV9 and Rivian R1S are both seven-seaters. Each listing shows its seat count so you can check before visiting a dealer.",
  },
  {
    q: "Does EV Lineup cover electric pickup trucks?",
    a: "Yes. /best/electric-trucks lists the electric pickups in the database — including the Ford F-150 Lightning, Rivian R1T, Tesla Cybertruck and GMC Hummer EV — with their availability status, because some are on sale and others are announced or cancelled.",
  },
  {
    q: "Does EV Lineup show used EV prices or dealer inventory?",
    a: "No. EV Lineup lists manufacturer starting prices (MSRP) for new models. It does not value used cars, track trade-in prices, or show dealer stock. For a used-car valuation, a site such as Kelley Blue Book or Edmunds is the better tool; see /alternatives for an honest comparison.",
  },
  {
    q: "Does EV Lineup have an API for developers and AI assistants?",
    a: "Yes. There is a free read-only JSON API at /api/ev/all, /api/ev/search, /api/ev/specs, /api/ev/compare and /api/ev/best, documented by an OpenAPI description at /openapi.json and an MCP manifest at /mcp.json, so assistants and scripts can query the same data the site shows.",
  },
  {
    q: "Is EV Lineup independent of the car makers?",
    a: "Yes. EV Lineup is an independent site run by Jean-Paul Wilson and is not owned by, or affiliated with, any manufacturer. It is not a dealer and does not sell cars or sell your details as a sales lead. Advertising enquiries are handled on /advertise.",
  },
  {
    q: "How often is the data updated?",
    a: "Model, price and availability records are maintained by hand and revised as manufacturers announce changes; the best-of lists and comparison tables are generated from the current database every time a page is served, so they never show a stale ranking. Treat prices as a guide and confirm them with the seller.",
  },
];

/* ------------------------------------------------------------------ *
 * Competitors — only general, well-known facts, hedged and dated.
 * ------------------------------------------------------------------ */

export const COMPETITORS = [
  {
    slug: "edmunds",
    name: "Edmunds",
    url: "https://www.edmunds.com/",
    title: "EV Lineup vs Edmunds: which EV research site should you use?",
    description:
      "An honest comparison of EV Lineup and Edmunds for electric car research: spec comparisons and best-of lists versus used-car pricing, dealer inventory and long-form reviews.",
    whatTheyAre:
      "Edmunds is a long-established US car-shopping site. As of October 2026, per its website, it covers new and used cars of every fuel type, publishes expert reviews and road tests, appraises used cars and trade-ins, and connects shoppers with dealer inventory and dealer quotes.",
    theirStrengths: [
      "Used-car and trade-in pricing, which EV Lineup does not do at all.",
      "Dealer inventory and local listings, so you can see what is actually on a lot near you.",
      "Long-form expert reviews and in-house road testing, including its own real-world EV range testing.",
      "Coverage of gasoline, hybrid and diesel cars, which matters if you have not settled on an EV.",
    ],
    ourStrengths: [
      "EV-only: nothing in the database is a gas car, so filters and rankings are about range, charging speed and battery size rather than MPG.",
      `Every one of the ${STATS.models} models carries the same spec fields, so a side-by-side table is apples-to-apples instead of two reviews written months apart.`,
      "Best-of lists are generated from the live database rather than hand-curated, so a price change moves the ranking.",
      "No account, no lead form and no dealer handoff; a read-only public API and MCP manifest make the same data available to scripts and AI assistants.",
    ],
    verdict:
      "If you want a used-car valuation, dealer stock near you or a 2,000-word review of one car, use Edmunds. If you want to put two EVs side by side on identical specs, or see every EV under $40,000 ranked, EV Lineup is faster and has no sales funnel attached.",
  },
  {
    slug: "kelley-blue-book",
    name: "Kelley Blue Book",
    url: "https://www.kbb.com/",
    title: "EV Lineup vs Kelley Blue Book (KBB) for electric car research",
    description:
      "How EV Lineup and Kelley Blue Book differ: standardized EV spec comparisons and live best-of lists versus KBB's car valuations, trade-in values and dealer listings.",
    whatTheyAre:
      "Kelley Blue Book (kbb.com) is best known for vehicle valuations. As of October 2026, per its website, it publishes Blue Book values for new and used cars, trade-in and private-party estimates, expert and owner reviews, and dealer listings across all fuel types.",
    theirStrengths: [
      "Vehicle valuations and trade-in estimates — the thing KBB is famous for, and something EV Lineup deliberately does not attempt.",
      "Resale-value and ownership-cost guidance, useful when an EV's depreciation is the deciding factor.",
      "Dealer listings and shopping tools for buying the car once you have chosen it.",
      "All-fuel coverage, including hybrids, for shoppers still weighing an EV against a gas car.",
    ],
    ourStrengths: [
      "A single standard spec table for every EV, including battery capacity in kWh and maximum DC charging speed — fields general car sites often omit.",
      "Comparison pages for any two models in the database, with the better figure in each row marked.",
      "Data-driven lists such as /best/longest-range-evs and /best/3-row-evs that re-rank themselves from the database.",
      "Free, no sign-in, no lead capture, and a documented public API for developers and AI assistants.",
    ],
    verdict:
      "Use KBB when the question is what a car is worth — new, used or as a trade-in. Use EV Lineup when the question is which EV has the range, charging speed, seats or price you need.",
  },
  {
    slug: "car-and-driver",
    name: "Car and Driver",
    url: "https://www.caranddriver.com/",
    title: "EV Lineup vs Car and Driver for comparing electric cars",
    description:
      "EV Lineup versus Car and Driver: a standardized EV spec database and live rankings compared with Car and Driver's instrumented testing and editorial reviews.",
    whatTheyAre:
      "Car and Driver is an American automotive magazine and website. As of October 2026, per its website, it publishes instrumented road tests, reviews, rankings and buyer's guides across every category of car, carried out by its own testing staff.",
    theirStrengths: [
      "Independent instrumented testing — its 0–60 mph, braking and handling numbers are measured by its own testers rather than taken from a manufacturer.",
      "Editorial judgment: how a car actually drives, which no spec table can tell you.",
      "Decades of archive, long-term tests and news coverage.",
      "Comparison tests that put rivals head to head on a track on the same day.",
    ],
    ourStrengths: [
      "Complete, structured coverage: every EV in the database gets the same fields filled in, including models a magazine has not got round to testing.",
      "Instant side-by-side tables for any two EVs, and lists you can sort by the thing you care about.",
      "Charging-focused data (battery kWh, peak DC kW) that matters for EV road trips.",
      "Free with no account and no paywall, plus an open API for the same data.",
    ],
    verdict:
      "Read Car and Driver for measured test numbers and an opinion on how a car drives. Use EV Lineup to shortlist which EVs are worth reading about, by comparing range, price, charging and seats across the whole market in one table.",
  },
  {
    slug: "fueleconomy-gov",
    name: "fueleconomy.gov",
    url: "https://www.fueleconomy.gov/",
    title: "EV Lineup vs fueleconomy.gov for EV range and efficiency data",
    description:
      "EV Lineup compared with the US government's fueleconomy.gov: official EPA range and efficiency ratings versus a full EV spec database with comparisons and best-of lists.",
    whatTheyAre:
      "fueleconomy.gov is the official US fuel-economy site run by the Department of Energy and the EPA. As of October 2026, per the site, it publishes EPA range and efficiency (MPGe) ratings for vehicles sold in the US, a side-by-side comparison tool, fuel-cost estimators and information on federal tax credits.",
    theirStrengths: [
      "It is the authoritative source for EPA ratings — every range figure elsewhere, including on EV Lineup, traces back to it.",
      "Federal tax-credit and incentive information, which EV Lineup does not track.",
      "Running-cost and emissions estimators, plus historical data going back decades.",
      "No commercial interest of any kind.",
    ],
    ourStrengths: [
      "Specs beyond efficiency: starting price, horsepower, 0–60 mph, top speed, battery capacity, peak DC charging speed, seats and trim breakdowns.",
      "Editorially useful groupings — cheapest, longest range, fastest, three-row, pickups — generated from live data.",
      "Manufacturer pages that show a brand's whole EV lineup in one place, and announced-but-unreleased models that an EPA database cannot yet list.",
      "A modern interface and a JSON API designed for comparison rather than regulatory lookup.",
    ],
    verdict:
      "Use fueleconomy.gov to confirm an official EPA rating or check a tax credit. Use EV Lineup to compare EVs on everything else and to see models that are not yet EPA-rated. Checking both is a reasonable habit; they disagree only when a manufacturer figure has not been EPA-certified yet.",
  },
];

/** Extra tools mentioned on /alternatives but without a dedicated page. */
export const OTHER_ALTERNATIVES = [
  {
    name: "InsideEVs",
    url: "https://insideevs.com/",
    note: "An EV-focused news site. As of October 2026, per its website, it publishes electric-vehicle news, reviews and sales data, and keeps model listings. Strong for news and market trends; EV Lineup is the better tool for a structured spec-by-spec comparison.",
  },
  {
    name: "Manufacturer configurators",
    url: "https://www.tesla.com/",
    note: "Every automaker's own site is the final word on trim pricing and current availability for its own cars, and should always be the last check before you buy. What they cannot do is show you a rival's car in the same table.",
  },
  {
    name: "EV Database (ev-database.org)",
    url: "https://ev-database.org/",
    note: "A long-running European EV spec database with its own range estimates. As of October 2026, per its website, its focus is the European market; EV Lineup's price and range data is US-first, using MSRP in dollars and EPA ratings.",
  },
];
