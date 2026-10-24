/**
 * Shared SEO helpers for api/prerender.js — site-wide JSON-LD, breadcrumbs,
 * the internal-link block every prerendered page ends with, and the richer
 * home-page content sections.
 *
 * Kept in its own module so prerender.js only needs a few small hooks.
 * Link lists mirror scripts/seo-content.mjs and src/data/seoPages.ts.
 */

const CANONICAL_HOST = "https://www.evlineup.org";
const SITE_NAME = "EV Lineup";
const CONTACT = "jeanpaulwilson@gmail.com";

const ONE_LINER =
  "EV Lineup is a free electric vehicle database and comparison site for anyone shopping for or researching an EV.";

export const BEST_LINKS = [
  ["/best/longest-range-evs", "Longest range electric cars"],
  ["/best/cheapest-evs", "Cheapest electric cars"],
  ["/best/evs-under-40k", "Best EVs under $40,000"],
  ["/best/fastest-evs", "Fastest electric cars (0–60 mph)"],
  ["/best/3-row-evs", "Best 3-row electric SUVs (6+ seats)"],
  ["/best/electric-trucks", "Electric pickup trucks"],
  ["/best/300-mile-range-evs", "EVs with 300+ miles of range"],
];

export const COMPARE_LINKS = [
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

export const GUIDE_LINKS = [
  ["/what-is-ev-lineup", "What is EV Lineup?"],
  ["/faq", "EV Lineup FAQ"],
  ["/alternatives", "Best EV comparison tools"],
  ["/vs/edmunds", "EV Lineup vs Edmunds"],
  ["/vs/kelley-blue-book", "EV Lineup vs Kelley Blue Book"],
  ["/vs/car-and-driver", "EV Lineup vs Car and Driver"],
  ["/vs/fueleconomy-gov", "EV Lineup vs fueleconomy.gov"],
];

/**
 * Everything below interpolates values that come from the database, so each
 * one goes through `esc` (HTML text/attribute), `num` (numeric fields) or
 * `safeUrl` (links) before it reaches a template. A spec field containing
 * markup must render as text, never as HTML.
 */
export const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** A finite number, or null — for spec fields that must never be free text. */
export const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** The finite numbers in a list of raw spec values. */
const nums = (list) => list.map(num).filter((n) => n !== null);

/** An http(s) URL, or null — blocks javascript:/data: links from the DB. */
export const safeUrl = (u) => {
  const s = String(u ?? "").trim();
  if (!/^https?:\/\//i.test(s)) return null;
  try {
    return new URL(s).href;
  } catch {
    return null;
  }
};

/** "Official site: example.com" link, or "" when there is no usable URL. */
function officialSite(url) {
  const safe = safeUrl(url);
  if (!safe) return "";
  const label = safe.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  return ` Official site: <a href="${esc(safe)}" rel="nofollow noopener">${esc(label)}</a>.`;
}

const links = (pairs) =>
  pairs.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("");

/** Organization + WebSite, identical on every prerendered page. */
export function siteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: `${CANONICAL_HOST}/`,
      logo: `${CANONICAL_HOST}/pub_assets/hero-ev.png`,
      description: ONE_LINER,
      email: CONTACT,
      founder: { "@type": "Person", name: "Jean-Paul Wilson" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: `${CANONICAL_HOST}/`,
      description: ONE_LINER,
      publisher: { "@type": "Organization", name: SITE_NAME, url: `${CANONICAL_HOST}/` },
    },
  ];
}

/** BreadcrumbList from [path, name] pairs. */
export function breadcrumbJsonLd(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([path, name], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${CANONICAL_HOST}${path}`,
    })),
  };
}

/**
 * Internal-link block appended to every prerendered page, so crawlers reach
 * the lists, comparisons and explainer pages from anywhere on the site.
 */
export function linksBlock() {
  return `<nav class="seo-links" aria-label="More on EV Lineup">
  <div><h2>Best-of lists</h2><ul>${links(BEST_LINKS)}</ul></div>
  <div><h2>Popular comparisons</h2><ul>${links(COMPARE_LINKS.slice(0, 6))}</ul></div>
  <div><h2>About EV Lineup</h2><ul>${links(GUIDE_LINKS)}</ul></div>
</nav>
<p class="seo-note">${esc(ONE_LINER)} Data is researched from manufacturer and public sources; confirm specs and pricing with the manufacturer or dealer. Corrections: <a href="mailto:${CONTACT}">${CONTACT}</a>.</p>`;
}

export const LINKS_STYLE = `<style>
.prerender .seo-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin:32px 0 8px;padding-top:20px;border-top:1px solid #e2e8f0}
.prerender .seo-links h2{font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px;color:#4a5568}
.prerender .seo-links ul{list-style:none;padding:0;margin:0;font-size:.9rem}
.prerender .seo-links li{margin:4px 0}
.prerender .seo-note{font-size:.8rem;color:#4a5568;margin-top:20px}
.prerender h2{font-size:1.25rem;margin:28px 0 8px}
.prerender ul.plain{padding-left:20px}
/* #seo-content sits outside #root, so it survives React mounting and has to
   follow the app's colour mode (Chakra puts the class on <body>). */
#seo-content{border-top:1px solid #e2e8f0;margin-top:0;padding-bottom:48px}
#seo-content details{margin:6px 0}
#seo-content summary{cursor:pointer}
body.chakra-ui-dark #seo-content{color:#e2e8f0;border-top-color:#2d3748}
body.chakra-ui-dark #seo-content .sub,body.chakra-ui-dark #seo-content .seo-note,body.chakra-ui-dark #seo-content .seo-links h2{color:#a0aec0}
body.chakra-ui-dark #seo-content .seo-links,body.chakra-ui-dark #seo-content th,body.chakra-ui-dark #seo-content td{border-color:#2d3748}
body.chakra-ui-dark #seo-content a{color:#48bb78}
</style>`;

/* ------------------------------------------------------------------ *
 * Home page
 * ------------------------------------------------------------------ */

/** Top makes by number of models in the database, for internal linking. */
function topMakes(cars, limit = 12) {
  const counts = new Map();
  for (const c of cars) {
    if (!c.make_name) continue;
    counts.set(c.make_name, (counts.get(c.make_name) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, n]) => [
      `/manufacturer/${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`,
      `${name} EVs (${n})`,
    ]);
}

/**
 * The prose sections of the home page: what it is, who it's for, how to use
 * it, what's tracked, and links to every list/comparison/explainer page.
 * Only facts derived from the live database (`cars`) or from the app itself.
 */
export function homeSections(cars) {
  const brands = new Set(cars.map((c) => c.make_name).filter(Boolean)).size;
  const withRange = cars.filter((c) => c.epa_range).length;

  return `
  <h2>What is EV Lineup?</h2>
  <p>${esc(ONE_LINER)} Every model in the database carries the same spec fields — starting price (MSRP), EPA range, 0–60 mph, horsepower, battery capacity in kWh, maximum DC fast-charging speed, drive type and adult seat count — so two cars can be compared line by line instead of by reading two reviews written months apart. The database currently holds ${cars.length} electric models from ${brands} brands, ${withRange} of them with a published range figure.</p>
  <p>It is free, no account is needed to browse, and there are no dealer lead forms. EV Lineup is independent and is not affiliated with any manufacturer. <a href="/what-is-ev-lineup">More about what EV Lineup is and who it is for →</a></p>

  <h2>Who it is for</h2>
  <ul class="plain">
    <li><strong>First-time EV buyers</strong> working out what range, battery size and charging speed mean in practice.</li>
    <li><strong>Shoppers deciding between two cars</strong> — a comparison page puts both in one table and marks which wins each row.</li>
    <li><strong>Buyers with a hard requirement</strong>: a budget under $40,000, three rows of seats, a pickup bed, or 300+ miles of range.</li>
    <li><strong>Researchers and developers</strong> who want the EV market as structured data, through the <a href="/openapi.json">public JSON API</a>.</li>
  </ul>

  <h2>How to use it</h2>
  <ol class="plain">
    <li><strong>Start with a list or a brand.</strong> Browse the table of popular models, open a best-of list, or jump to a manufacturer's full lineup.</li>
    <li><strong>Open the model pages</strong> for the cars that fit and check the trim table — the cheapest trim and the long-range trim are often very different cars.</li>
    <li><strong>Compare them head to head</strong> at <code>/compare/model-a-vs-model-b</code>, then confirm the final price and availability with the manufacturer.</li>
  </ol>

  <h2>Browse by what matters to you</h2>
  <ul class="plain">${links(BEST_LINKS)}</ul>

  <h2>EVs by brand</h2>
  <ul class="plain">${links(topMakes(cars))}</ul>

  <h2>Side-by-side comparisons</h2>
  <ul class="plain">${links(COMPARE_LINKS)}</ul>`;
}

/* ------------------------------------------------------------------ *
 * Intro prose for the data-driven pages (facts come from the API rows)
 * ------------------------------------------------------------------ */

const money = (n) => {
  const v = num(n);
  return v === null ? null : `$${v.toLocaleString("en-US")}`;
};

/** Plain-language intro for a /compare/a-vs-b page. */
export function compareIntro(A, B) {
  const nameA = `${A.make_name} ${A.model}`;
  const nameB = `${B.make_name} ${B.model}`;
  const line = (m) => {
    const bits = [];
    const price = money(m.current_price);
    const range = num(m.epa_range);
    const zeroSixty = num(m.acceleration_0_60);
    const battery = num(m.battery_capacity);
    const charge = num(m.battery_max_charging_speed);
    const seats = num(m.number_of_full_adult_seats);
    if (price) bits.push(`starts at ${price} MSRP`);
    if (range) bits.push(`${range} miles of EPA range`);
    if (zeroSixty) bits.push(`0–60 mph in ${zeroSixty} seconds`);
    if (battery) bits.push(`a ${battery} kWh battery`);
    if (charge) bits.push(`up to ${charge} kW DC charging`);
    if (seats) bits.push(`${seats} seats`);
    return bits.length ? `The ${esc(`${m.make_name} ${m.model}`)} ${bits.join(", ")}.` : "";
  };
  return `
  <p>This page compares the <strong>${esc(nameA)}</strong> and the <strong>${esc(nameB)}</strong> on the same spec fields, taken from the ${SITE_NAME} database, so the numbers match the rest of the site. ${line(A)} ${line(B)}</p>
  <p>The table below covers starting price, EPA range, 0–60 mph, top speed, power, battery capacity, maximum DC fast-charging speed and seat count; a ✓ marks the better figure in each row. Range figures are EPA ratings where one exists and real-world range is lower in cold weather and at highway speeds. Prices are manufacturer starting prices before taxes, fees and incentives — check the current price with the manufacturer before buying.</p>`;
}

/** Methodology paragraph for a /best/<criteria> page. */
export function bestIntro(title, blurb, ranked, total) {
  const prices = nums(ranked.map((m) => m.current_price));
  const ranges = nums(ranked.map((m) => m.epa_range));
  const bits = [];
  if (prices.length > 1)
    bits.push(`prices on this list run from ${money(Math.min(...prices))} to ${money(Math.max(...prices))}`);
  if (ranges.length > 1)
    bits.push(`EPA range runs from ${Math.min(...ranges)} to ${Math.max(...ranges)} miles`);
  const count = num(total);
  return `
  <p>This ranking is generated from the ${SITE_NAME} database and refreshed periodically rather than hand-written, so it keeps up with the${
    count ? ` ${count}` : ""
  } models on file instead of going stale. ${esc(blurb)}${bits.length ? ` As listed, ${bits.join(" and ")}.` : ""}</p>
  <p>Every row links to the full spec sheet for that model, where you can see each trim's own price, range and performance. Prices are manufacturer starting prices (MSRP) in US dollars before taxes, fees and incentives; range is the EPA rating where one has been published. Confirm the final figures with the manufacturer or dealer.</p>`;
}

/** Short factual summary for a /manufacturer/<slug> page. */
export function makeIntro(make, models) {
  const prices = nums(models.map((m) => m.current_price));
  const ranges = nums(models.map((m) => m.epa_range));
  const facts = [];
  if (make.headquarters) facts.push(`is headquartered in ${esc(make.headquarters)}`);
  if (make.founding_date) facts.push(`was founded in ${esc(make.founding_date)}`);
  if (make.country) facts.push(`is based in ${esc(make.country)}`);
  const spread = [];
  if (prices.length)
    spread.push(
      prices.length > 1
        ? `listed prices run from ${money(Math.min(...prices))} to ${money(Math.max(...prices))}`
        : `the listed price is ${money(prices[0])}`
    );
  if (ranges.length)
    spread.push(
      ranges.length > 1
        ? `EPA range from ${Math.min(...ranges)} to ${Math.max(...ranges)} miles`
        : `an EPA range of ${ranges[0]} miles`
    );

  if (!models.length) {
    return `
  <p>No ${esc(make.name)} models are listed in the ${SITE_NAME} database right now — either the brand has not brought an EV to the markets we track, or its models are still being added.${
      facts.length ? ` The company ${facts.join(" and ")}.` : ""
    }${officialSite(make.website_url)}</p>
  <p>In the meantime, every other brand's lineup is listed with the same spec fields — starting price, EPA range, 0–60 mph, power, battery capacity in kWh, maximum DC fast-charging speed and seat count. Start from <a href="/">the full database</a>, a ranked list such as <a href="/best/longest-range-evs">longest range electric cars</a>, or the <a href="/faq">FAQ</a> for how the data is put together.</p>`;
  }

  return `
  <p>${esc(make.name)} has <strong>${models.length} electric ${models.length === 1 ? "model" : "models"}</strong> in the ${SITE_NAME} database${
    spread.length ? `; ${spread.join(", ")}` : ""
  }.${facts.length ? ` The company ${facts.join(" and ")}.` : ""}${officialSite(make.website_url)}</p>
  <p>The table below lists every ${esc(make.name)} EV on file with its starting price, EPA range and availability status; each model links to a full spec sheet with trim-by-trim figures, battery capacity and DC fast-charging speed. Prices are MSRP before taxes, fees and incentives. To put a ${esc(make.name)} model against a rival, use a <a href="/alternatives">comparison</a> page or build one at <code>/compare/model-a-vs-model-b</code>.</p>`;
}
