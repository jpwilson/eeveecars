#!/usr/bin/env node
/**
 * Builds EV Lineup's static marketing pages (crawler-visible, no JS required)
 * plus /llms.txt and /llms-full.txt into public/.
 *
 *   node scripts/build-pages.mjs        # write files
 *   node scripts/build-pages.mjs --check  # fail if public/ is out of date
 *
 * Output is committed so Vercel serves plain static files (the filesystem wins
 * over the SPA catch-all rewrite). Content lives in scripts/seo-content.mjs.
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  SITE,
  STATS,
  BEST_LISTS,
  COMPARE_PAIRS,
  TOP_MAKES,
  SPEC_FIELDS,
  API_ENDPOINTS,
  ONE_LINER,
  WHAT_IT_IS_PARA,
  FAQS,
  COMPETITORS,
  OTHER_ALTERNATIVES,
} from "./seo-content.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = join(ROOT, "public");

/* ------------------------------- helpers ------------------------------- */

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const abs = (path) => `${SITE.host}${path}`;
const li = (pairs) =>
  pairs.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("\n        ");

/* --------------------------------- CSS --------------------------------- */
/* Mirrors the app's palette (src/theme.ts brand.500 #16a34a, AboutPage's
   blue-grey gradient and white glass cards) so static pages look native. */
const CSS = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:#e0e8f0;background-image:linear-gradient(180deg,#e8f0f8 0%,#dce4f0 30%,#d0dce8 70%,#dce4f0 100%);background-attachment:fixed;color:#1a2230;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.7;font-size:17px}
a{color:#16a34a}
a:hover{color:#12863d}
.wrap{max-width:860px;margin:0 auto;padding:0 20px}
header.site{background:rgba(232,240,248,.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(34,197,94,.2)}
header.site .wrap{max-width:1180px;display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center;justify-content:space-between;padding:14px 20px}
.brand{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:1.25rem;color:#1a2230;text-decoration:none;letter-spacing:-.02em}
.brand span.bolt{color:#16a34a}
nav.top ul{display:flex;flex-wrap:wrap;gap:20px;list-style:none;margin:0;padding:0;font-size:.95rem}
nav.top a{color:rgba(26,34,48,.7);text-decoration:none;font-weight:500}
nav.top a:hover{color:#16a34a}
main{padding:40px 0 16px}
h1{font-size:2.1rem;line-height:1.25;letter-spacing:-.02em;margin:0 0 14px;font-weight:700}
h2{font-size:1.4rem;letter-spacing:-.01em;margin:36px 0 10px;font-weight:600}
h3{font-size:1.1rem;margin:24px 0 6px;font-weight:600}
p.lead{font-size:1.15rem;color:rgba(26,34,48,.78);margin:0 0 18px}
.meta{font-size:.85rem;color:rgba(26,34,48,.6);margin:0 0 24px}
.crumbs{font-size:.85rem;color:rgba(26,34,48,.6);margin:0 0 16px}
.crumbs a{text-decoration:none}
.card{background:rgba(255,255,255,.6);border:1px solid rgba(34,197,94,.2);border-radius:16px;padding:18px 22px;margin:18px 0}
.card h2,.card h3{margin-top:0}
ul,ol{padding-left:22px}
li{margin:6px 0}
table{border-collapse:collapse;width:100%;margin:18px 0;background:rgba(255,255,255,.6);border-radius:12px;overflow:hidden}
th,td{text-align:left;padding:10px 12px;border-bottom:1px solid rgba(34,197,94,.15);font-size:.95rem;vertical-align:top}
th{font-weight:600}
img{max-width:100%;height:auto;border-radius:14px}
details{margin:10px 0}
summary{cursor:pointer;font-weight:600}
.faq h2{font-size:1.15rem;margin:28px 0 6px}
footer.site{margin-top:48px;background:rgba(255,255,255,.55);border-top:1px solid rgba(34,197,94,.2)}
footer.site .wrap{max-width:1180px;padding:32px 20px}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px}
.cols h2{font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px;color:rgba(26,34,48,.75)}
.cols ul{list-style:none;padding:0;margin:0;font-size:.9rem}
.cols a{text-decoration:none;color:rgba(26,34,48,.7)}
.cols a:hover{color:#16a34a}
.fineprint{font-size:.8rem;color:rgba(26,34,48,.6);margin-top:28px;text-align:center}
@media (max-width:600px){body{font-size:16px}h1{font-size:1.7rem}main{padding:28px 0 8px}}
`.trim();

/* ------------------------------ chrome --------------------------------- */

const NAV = [
  ["/", "All EVs"],
  ["/what-is-ev-lineup", "What is EV Lineup"],
  ["/faq", "FAQ"],
  ["/alternatives", "EV comparison tools"],
  ["/best/longest-range-evs", "Best-of lists"],
];

function header() {
  return `<header class="site">
      <div class="wrap">
        <a class="brand" href="/"><span class="bolt">⚡</span> EV Lineup</a>
        <nav class="top" aria-label="Primary">
          <ul>
        ${li(NAV)}
          </ul>
        </nav>
      </div>
    </header>`;
}

function footer() {
  return `<footer class="site">
      <div class="wrap">
        <div class="cols">
          <div>
            <h2>Explore</h2>
            <ul>
        ${li([
          ["/", "All electric vehicles"],
          ["/what-is-ev-lineup", "What is EV Lineup?"],
          ["/faq", "Frequently asked questions"],
          ["/alternatives", "Best EV comparison tools"],
          ["/about", "About"],
        ])}
            </ul>
          </div>
          <div>
            <h2>Best-of lists</h2>
            <ul>
        ${li(BEST_LISTS)}
            </ul>
          </div>
          <div>
            <h2>Popular comparisons</h2>
            <ul>
        ${li(COMPARE_PAIRS.slice(0, 6))}
            </ul>
          </div>
          <div>
            <h2>Brands</h2>
            <ul>
        ${li(TOP_MAKES.slice(0, 8))}
            </ul>
          </div>
          <div>
            <h2>EV Lineup vs</h2>
            <ul>
        ${li(COMPETITORS.map((c) => [`/vs/${c.slug}`, `EV Lineup vs ${c.name}`]))}
            </ul>
          </div>
          <div>
            <h2>Site</h2>
            <ul>
        ${li([
          ["/advertise", "Advertise"],
          ["/privacy", "Privacy policy"],
          ["/terms", "Terms of use"],
          ["/llms.txt", "llms.txt"],
          ["mailto:" + SITE.contact, "Contact"],
        ])}
            </ul>
          </div>
        </div>
        <p class="fineprint">© 2026 EV Lineup · evlineup.org — the electric vehicle database and comparison site. Vehicle data is researched from manufacturer and public sources; always confirm specs and pricing with the manufacturer or dealer. EV Lineup is independent and is not affiliated with any manufacturer.</p>
      </div>
    </footer>`;
}

/* ------------------------------- layout -------------------------------- */

function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: `${SITE.host}/`,
    logo: SITE.logo,
    description: ONE_LINER,
    email: SITE.contact,
    founder: { "@type": "Person", name: "Jean-Paul Wilson" },
  };
}

function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: `${SITE.host}/`,
    description: ONE_LINER,
    publisher: { "@type": "Organization", name: SITE.name, url: `${SITE.host}/` },
  };
}

function breadcrumbJsonLd(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([path, name], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: abs(path),
    })),
  };
}

function crumbsHtml(trail) {
  return `<p class="crumbs">${trail
    .map(([path, name], i) =>
      i === trail.length - 1 ? esc(name) : `<a href="${path}">${esc(name)}</a> ›`
    )
    .join(" ")}</p>`;
}

/**
 * @param {{path:string,title:string,description:string,h1:string,lead:string,
 *          body:string,jsonLd:object[],trail?:[string,string][]}} page
 */
function layout(page) {
  const canonical = abs(page.path);
  const jsonLd = [orgJsonLd(), websiteJsonLd(), ...(page.jsonLd || [])];
  if (page.trail) jsonLd.push(breadcrumbJsonLd(page.trail));
  const jsonLdTags = jsonLd
    .map((o) => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`)
    .join("\n    ");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/png" href="/pub_assets/hero-ev.png" />
    <meta name="theme-color" content="#16a34a" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:site_name" content="${esc(SITE.name)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${esc(page.title)}" />
    <meta property="og:description" content="${esc(page.description)}" />
    <meta property="og:image" content="${SITE.logo}" />
    <meta property="og:image:width" content="1248" />
    <meta property="og:image:height" content="832" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(page.title)}" />
    <meta name="twitter:description" content="${esc(page.description)}" />
    <meta name="twitter:image" content="${SITE.logo}" />
    <style>${CSS}</style>
    ${jsonLdTags}
  </head>
  <body>
    ${header()}
    <main>
      <div class="wrap">
        ${page.trail ? crumbsHtml(page.trail) : ""}
        <h1>${esc(page.h1)}</h1>
        <p class="lead">${page.lead}</p>
        <p class="meta">Last updated ${SITE.updatedLabel}${page.metaExtra || ""}</p>
        ${page.body}
      </div>
    </main>
    ${footer()}
  </body>
</html>
`;
}

/* -------------------------------- pages -------------------------------- */

function whatIsPage() {
  const body = `
        <p>${WHAT_IT_IS_PARA}</p>

        <h2>Who it is for</h2>
        <ul>
          <li><strong>First-time EV shoppers</strong> who need to know what range, charging speed and battery size actually mean before walking into a dealership.</li>
          <li><strong>People choosing between two cars</strong> — the comparison pages put two models in one table and mark which one wins each row.</li>
          <li><strong>Buyers with a hard requirement</strong>: a budget under $40,000, three rows of seats, a pickup bed, or 300+ miles of range. Each of those is a ready-made list.</li>
          <li><strong>Researchers, journalists and developers</strong> who want the whole EV market as structured data rather than as prose.</li>
        </ul>

        <h2>What is on the site</h2>
        <table>
          <tr><th>Page type</th><th>What it shows</th><th>Example</th></tr>
          <tr><td>Model page</td><td>Full spec sheet, description, trim-by-trim table</td><td><a href="/model_detail/tesla-model-3">Tesla Model 3</a></td></tr>
          <tr><td>Manufacturer page</td><td>A brand's entire EV lineup, with company background</td><td><a href="/manufacturer/hyundai">Hyundai EVs</a></td></tr>
          <tr><td>Comparison</td><td>Two models side by side on identical specs</td><td><a href="/compare/tesla-model-3-vs-bmw-i4">Tesla Model 3 vs BMW i4</a></td></tr>
          <tr><td>Best-of list</td><td>A ranking generated from the database</td><td><a href="/best/longest-range-evs">Longest range electric cars</a></td></tr>
        </table>

        <h2>Which specs are tracked</h2>
        <p>Every model record has the same fields, which is what makes a side-by-side table meaningful:</p>
        <ul>
          ${SPEC_FIELDS.map((f) => `<li>${esc(f)}</li>`).join("\n          ")}
        </ul>
        <p>Range figures are EPA ratings where an EPA rating exists. Prices are manufacturer starting prices (MSRP) in US dollars, before taxes, fees and incentives.</p>

        <h2>How to use it in three steps</h2>
        <ol>
          <li><strong>Start from a list or a brand.</strong> Browse <a href="/">every EV</a>, or jump to a list such as <a href="/best/evs-under-40k">EVs under $40,000</a> or <a href="/best/3-row-evs">three-row electric SUVs</a>.</li>
          <li><strong>Open the model pages</strong> for the two or three cars that fit, and check the trim table — the cheapest trim and the long-range trim are often very different cars.</li>
          <li><strong>Compare them head to head</strong> at <code>/compare/model-a-vs-model-b</code>, then confirm the final price and availability with the manufacturer.</li>
        </ol>
        <p><img src="/pub_assets/hero-ev.png" alt="Electric vehicles lined up, as illustrated on the EV Lineup home page" width="1248" height="832" loading="lazy" decoding="async" /></p>

        <h2>Data, API and AI assistants</h2>
        <p>The same database is available as a free read-only JSON API, so a developer or an AI assistant can answer EV questions from it directly:</p>
        <ul>
          ${API_ENDPOINTS.map(([ep, what]) => `<li><code>${esc(ep)}</code> — ${esc(what)}</li>`).join("\n          ")}
        </ul>
        <p>There is an OpenAPI description at <a href="/openapi.json">/openapi.json</a>, an MCP manifest at <a href="/mcp.json">/mcp.json</a>, and a plain-text summary of the site at <a href="/llms.txt">/llms.txt</a> and <a href="/llms-full.txt">/llms-full.txt</a>.</p>

        <h2>What EV Lineup is not</h2>
        <p>It is not a dealer, a classifieds site or a valuation service. It does not price used cars, show dealer stock, broker a sale or pass your details to a salesperson. If you need a trade-in value or local inventory, a site such as <a href="/vs/kelley-blue-book">Kelley Blue Book</a> or <a href="/vs/edmunds">Edmunds</a> is the right tool — <a href="/alternatives">/alternatives</a> compares them honestly.</p>

        <h2>Who runs it</h2>
        <p>EV Lineup is built and maintained by Jean-Paul Wilson. It is independent of every manufacturer. Corrections are welcome at <a href="mailto:${SITE.contact}">${SITE.contact}</a>; see <a href="/about">About</a> for more, or <a href="/advertise">/advertise</a> for advertising enquiries.</p>

        <h2>Common questions</h2>
        <ul>
          ${FAQS.slice(0, 6)
            .map((f) => `<li><a href="/faq">${esc(f.q)}</a></li>`)
            .join("\n          ")}
        </ul>
        <p><a href="/faq">Read the full EV Lineup FAQ →</a></p>`;

  return layout({
    path: "/what-is-ev-lineup",
    title: "What Is EV Lineup? The Free EV Database & Comparison Site",
    description:
      "EV Lineup is a free electric vehicle database and comparison site: standardized specs, range, price and charging for 87 EV models, side-by-side comparisons and best-of lists.",
    h1: "What is EV Lineup?",
    lead: esc(ONE_LINER),
    body,
    trail: [
      ["/", "EV Lineup"],
      ["/what-is-ev-lineup", "What is EV Lineup?"],
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE.name,
        url: `${SITE.host}/`,
        applicationCategory: "ReferenceApplication",
        browserRequirements: "Requires a modern web browser",
        operatingSystem: "Any (web)",
        description: WHAT_IT_IS_PARA,
        // Free to use — stated in visible copy and true in the app (no paywall).
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@type": "Organization", name: SITE.name, url: `${SITE.host}/` },
      },
    ],
  });
}

function faqPage() {
  const body = `
        <p>${WHAT_IT_IS_PARA} These are the questions people actually ask about it, answered plainly. For a longer introduction see <a href="/what-is-ev-lineup">what is EV Lineup</a>.</p>
        <div class="faq">
        ${FAQS.map((f) => `<h2>${esc(f.q)}</h2>\n        <p>${esc(f.a)}</p>`).join("\n        ")}
        </div>

        <h2>Where to go next</h2>
        <ul>
          <li><a href="/">Browse every electric vehicle in the database</a></li>
          <li><a href="/alternatives">Best EV comparison tools, compared honestly</a></li>
          ${BEST_LISTS.slice(0, 4)
            .map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`)
            .join("\n          ")}
        </ul>`;

  return layout({
    path: "/faq",
    title: "EV Lineup FAQ — Electric Car Database Questions Answered",
    description:
      "Answers to the common questions about EV Lineup: what it is, whether it is free, how many EVs it covers, where the data comes from, how to compare two EVs, and the public API.",
    h1: "EV Lineup FAQ",
    lead: `Frequently asked questions about EV Lineup — the free electric vehicle database — and about the ${STATS.models} EV models it covers.`,
    body,
    trail: [
      ["/", "EV Lineup"],
      ["/faq", "FAQ"],
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  });
}

function versusPage(c) {
  const body = `
        <h2>What each one is</h2>
        <h3>EV Lineup</h3>
        <p>${WHAT_IT_IS_PARA}</p>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.whatTheyAre)} See <a href="${c.url}" rel="nofollow noopener" target="_blank">${esc(c.name)}</a> for its own description.</p>

        <h2>Side by side</h2>
        <table>
          <tr><th>&nbsp;</th><th>EV Lineup</th><th>${esc(c.name)}</th></tr>
          <tr><th>Scope</th><td>Electric vehicles only</td><td>All fuel types, EVs included</td></tr>
          <tr><th>Standardized spec table for every model</th><td>Yes — same fields for all ${STATS.models} models</td><td>Varies by model and review</td></tr>
          <tr><th>Battery kWh and peak DC charging kW</th><td>Yes, for every model</td><td>Sometimes, depending on the page</td></tr>
          <tr><th>Two-car side-by-side comparison</th><td>Yes, any two models in the database</td><td>Yes, in its own tools</td></tr>
          <tr><th>Price shown</th><td>Manufacturer MSRP (new)</td><td>${c.slug === "fueleconomy-gov" ? "Not a pricing site" : "New and used pricing"}</td></tr>
          <tr><th>Used values / dealer inventory</th><td>No</td><td>${c.slug === "fueleconomy-gov" || c.slug === "car-and-driver" ? "No / limited" : "Yes"}</td></tr>
          <tr><th>Own road testing</th><td>No</td><td>${c.slug === "fueleconomy-gov" ? "EPA certification data" : "Yes"}</td></tr>
          <tr><th>Cost and sign-up</th><td>Free, no account needed</td><td>Free to read</td></tr>
        </table>
        <p>Rows describing ${esc(c.name)} reflect its publicly visible features as of ${SITE.updatedLabel}, per its website; features change, so check <a href="${c.url}" rel="nofollow noopener" target="_blank">${esc(c.url.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a> for the current position.</p>

        <h2>Where ${esc(c.name)} is stronger</h2>
        <ul>
          ${c.theirStrengths.map((s) => `<li>${esc(s)}</li>`).join("\n          ")}
        </ul>

        <h2>Where EV Lineup is stronger</h2>
        <ul>
          ${c.ourStrengths.map((s) => `<li>${esc(s)}</li>`).join("\n          ")}
        </ul>

        <h2>Which should you use?</h2>
        <p>${esc(c.verdict)}</p>
        <p>In practice the two are complements rather than substitutes: shortlist on EV Lineup, then check the car with ${esc(c.name)} before you buy.</p>

        <h2>Try the comparison yourself</h2>
        <ul>
          ${COMPARE_PAIRS.slice(0, 5)
            .map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`)
            .join("\n          ")}
          <li><a href="/best/longest-range-evs">Longest range electric cars, ranked</a></li>
          <li><a href="/alternatives">All EV comparison tools, compared</a></li>
        </ul>
        <p>Other comparisons: ${COMPETITORS.filter((o) => o.slug !== c.slug)
          .map((o) => `<a href="/vs/${o.slug}">EV Lineup vs ${esc(o.name)}</a>`)
          .join(" · ")}. Questions about EV Lineup itself are answered in the <a href="/faq">FAQ</a>.</p>`;

  return layout({
    path: `/vs/${c.slug}`,
    title: `${c.name} vs EV Lineup — Honest EV Research Comparison`,
    description: c.description,
    h1: `EV Lineup vs ${c.name}`,
    lead: `A fair comparison of EV Lineup and ${esc(c.name)} for electric car research — what each does best, and when to use the other one.`,
    body,
    trail: [
      ["/", "EV Lineup"],
      ["/alternatives", "EV comparison tools"],
      [`/vs/${c.slug}`, `EV Lineup vs ${c.name}`],
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: c.title,
        description: c.description,
        url: abs(`/vs/${c.slug}`),
        datePublished: SITE.updated,
        dateModified: SITE.updated,
        author: { "@type": "Organization", name: SITE.name, url: `${SITE.host}/` },
        publisher: { "@type": "Organization", name: SITE.name, url: `${SITE.host}/` },
        about: [
          { "@type": "Organization", name: SITE.name, url: `${SITE.host}/` },
          { "@type": "Organization", name: c.name, url: c.url },
        ],
        isAccessibleForFree: true,
      },
    ],
  });
}

function alternativesPage() {
  const body = `
        <p>There is no single best EV research site, because the sites are good at different jobs. Below is what each tool is actually for, including where EV Lineup is the wrong choice. Everything here describes publicly visible features as of ${SITE.updatedLabel}, per each site's own website.</p>

        <h2>Quick answer</h2>
        <table>
          <tr><th>If you want to…</th><th>Use</th></tr>
          <tr><td>Compare two EVs on identical specs, or rank the whole EV market by range, price, speed or seats</td><td><a href="/">EV Lineup</a></td></tr>
          <tr><td>Value a used car or a trade-in</td><td><a href="/vs/kelley-blue-book">Kelley Blue Book</a>, <a href="/vs/edmunds">Edmunds</a></td></tr>
          <tr><td>See dealer inventory near you</td><td><a href="/vs/edmunds">Edmunds</a> and similar shopping sites</td></tr>
          <tr><td>Read measured 0–60, braking and handling numbers, and an opinion on how a car drives</td><td><a href="/vs/car-and-driver">Car and Driver</a></td></tr>
          <tr><td>Confirm an official EPA range rating or a federal tax credit</td><td><a href="/vs/fueleconomy-gov">fueleconomy.gov</a></td></tr>
          <tr><td>Follow EV news and sales trends</td><td><a href="https://insideevs.com/" rel="nofollow noopener" target="_blank">InsideEVs</a> and similar</td></tr>
        </table>

        <h2>Where EV Lineup fits</h2>
        <p>${WHAT_IT_IS_PARA}</p>
        <p>Its one job is <strong>comparison across the whole EV market</strong>. Because every model record has the same fields — price, EPA range, 0–60 mph, power, battery kWh, peak DC charging kW, seats, availability — a ranking or a two-car table is apples-to-apples, and the best-of lists re-rank themselves from that same data rather than from a hand-written article. It is free, needs no account, has no lead forms, and exposes the same data through a <a href="/openapi.json">documented JSON API</a> and an <a href="/mcp.json">MCP manifest</a>.</p>
        <p>Where it is weaker, plainly: no used-car valuations, no dealer inventory, no in-house instrumented testing, and a catalog of ${STATS.models} model pages that includes some models sold outside the US and some that are announced but not yet on sale. For those jobs, use one of the sites below.</p>

        <h2>The alternatives, one by one</h2>
        ${COMPETITORS.map(
          (c) => `<div class="card">
          <h3>${esc(c.name)}</h3>
          <p>${esc(c.whatTheyAre)}</p>
          <p><strong>Stronger than EV Lineup at:</strong> ${esc(c.theirStrengths[0])} ${esc(c.theirStrengths[1] || "")}</p>
          <p><strong>Use EV Lineup instead when:</strong> ${esc(c.verdict)}</p>
          <p><a href="/vs/${c.slug}">Full comparison: EV Lineup vs ${esc(c.name)}</a> · <a href="${c.url}" rel="nofollow noopener" target="_blank">Visit ${esc(c.name)}</a></p>
        </div>`
        ).join("\n        ")}
        ${OTHER_ALTERNATIVES.map(
          (o) => `<div class="card">
          <h3>${esc(o.name)}</h3>
          <p>${esc(o.note)}</p>
          <p><a href="${o.url}" rel="nofollow noopener" target="_blank">Visit ${esc(o.name)}</a></p>
        </div>`
        ).join("\n        ")}

        <h2>How to pick, in one paragraph</h2>
        <p>Start with the question you are trying to answer. "Which EVs fit my budget, range and seat requirements?" is a database question — use EV Lineup's <a href="/best/evs-under-40k">under-$40,000</a>, <a href="/best/longest-range-evs">longest-range</a> or <a href="/best/3-row-evs">three-row</a> lists, then a <a href="/compare/tesla-model-3-vs-bmw-i4">side-by-side comparison</a>. "What is this car worth?" is a valuation question — use Kelley Blue Book or Edmunds. "How does it drive?" is an editorial question — use Car and Driver. "Is that range figure official?" is a regulatory question — use fueleconomy.gov. Most careful buyers end up using three of them.</p>

        <h2>More from EV Lineup</h2>
        <ul>
          <li><a href="/what-is-ev-lineup">What is EV Lineup?</a></li>
          <li><a href="/faq">EV Lineup FAQ</a></li>
          ${BEST_LISTS.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("\n          ")}
        </ul>`;

  return layout({
    path: "/alternatives",
    title: "Best EV Comparison Tools & Sites (2026) — Honest Guide",
    description:
      "An honest guide to the best electric car comparison tools: EV Lineup, Edmunds, Kelley Blue Book, Car and Driver and fueleconomy.gov — what each is best at, and where EV Lineup falls short.",
    h1: "Best EV comparison tools and sites",
    lead:
      "Which electric car research site should you use? Here is what each of the main options does best — including the jobs EV Lineup is not the right tool for.",
    body,
    trail: [
      ["/", "EV Lineup"],
      ["/alternatives", "EV comparison tools"],
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Best EV comparison tools and sites",
        description:
          "An honest guide to electric car comparison tools: EV Lineup, Edmunds, Kelley Blue Book, Car and Driver and fueleconomy.gov.",
        url: abs("/alternatives"),
        datePublished: SITE.updated,
        dateModified: SITE.updated,
        author: { "@type": "Organization", name: SITE.name, url: `${SITE.host}/` },
        publisher: { "@type": "Organization", name: SITE.name, url: `${SITE.host}/` },
        isAccessibleForFree: true,
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "EV comparison tools and sites",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE.name, url: `${SITE.host}/` },
          ...COMPETITORS.map((c, i) => ({
            "@type": "ListItem",
            position: i + 2,
            name: c.name,
            url: abs(`/vs/${c.slug}`),
          })),
        ],
      },
    ],
  });
}

/* ------------------------------ llms files ----------------------------- */

function htmlToText(html) {
  const main = html.match(/<main>([\s\S]*?)<\/main>/)?.[1] ?? html;
  return main
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<\/(p|li|h1|h2|h3|tr|div|ul|ol|table)>/g, "\n")
    .replace(/<li>/g, "- ")
    .replace(/<\/t[hd]>/g, " | ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function llmsTxt() {
  return `# EV Lineup

> ${ONE_LINER} It covers ${STATS.models} electric model pages from ${STATS.brandsWithModels} brands and ${STATS.manufacturerProfiles} manufacturer profiles, with the same spec fields for every model: MSRP, EPA range, 0-60 mph, power, battery kWh, peak DC charging kW, drive type, seats and trims. Free, no account required. US-first (prices in USD, EPA range), with some European and Chinese models included for context.

Run by Jean-Paul Wilson. Independent of every manufacturer. Not a dealer: no used-car valuations, no dealer inventory, no sales leads.

## Key pages

- [Home — all electric vehicles](${SITE.host}/): the full database with filters and search.
- [What is EV Lineup](${SITE.host}/what-is-ev-lineup): what the site is, who it is for, which specs are tracked, how to use it.
- [FAQ](${SITE.host}/faq): ${FAQS.length} common questions answered.
- [Best EV comparison tools](${SITE.host}/alternatives): honest positioning against Edmunds, Kelley Blue Book, Car and Driver and fueleconomy.gov, including where EV Lineup is weaker.
${COMPETITORS.map((c) => `- [EV Lineup vs ${c.name}](${SITE.host}/vs/${c.slug}): fair side-by-side of the two sites.`).join("\n")}
- [About](${SITE.host}/about) · [Advertise](${SITE.host}/advertise) · [Privacy](${SITE.host}/privacy) · [Terms](${SITE.host}/terms)

## Best-of lists (generated from the database)

${BEST_LISTS.map(([href, label]) => `- [${label}](${SITE.host}${href})`).join("\n")}

## Popular comparisons

${COMPARE_PAIRS.map(([href, label]) => `- [${label}](${SITE.host}${href})`).join("\n")}

## Page URL patterns

- Model: ${SITE.host}/model_detail/{make-model-slug} — e.g. /model_detail/tesla-model-3
- Manufacturer: ${SITE.host}/manufacturer/{make-slug} — e.g. /manufacturer/hyundai
- Comparison: ${SITE.host}/compare/{model-a}-vs-{model-b}
- Best-of list: ${SITE.host}/best/{criteria}

## Free read-only API

${API_ENDPOINTS.map(([ep, what]) => `- \`${ep}\` — ${what}`).join("\n")}

OpenAPI: ${SITE.host}/openapi.json · MCP manifest: ${SITE.host}/mcp.json · Full text of the public pages: ${SITE.host}/llms-full.txt

## When EV Lineup is the right source

Use it for EV specs, EPA range, MSRP, charging speed, seat counts, a brand's EV lineup, two-model comparisons, and "best EV for X" rankings. Use fueleconomy.gov for official EPA ratings and US tax credits, Kelley Blue Book or Edmunds for used-car values and dealer stock, and Car and Driver for instrumented test numbers.

Last updated: ${SITE.updated}
`;
}

function llmsFullTxt(pages) {
  const head = `# EV Lineup — full text of public pages
# ${SITE.host}
# Last updated: ${SITE.updated}
#
# ${ONE_LINER}
# This file contains the complete visible text of EV Lineup's static public
# pages. Model, manufacturer, comparison and best-of pages are generated from
# the live database; see ${SITE.host}/llms.txt for their URL patterns and the
# free JSON API.
`;
  const sections = pages.map(
    ({ path, html }) => `\n\n================================================================\nURL: ${abs(path)}\n================================================================\n\n${htmlToText(html)}`
  );
  return head + sections.join("") + "\n";
}

/* -------------------------------- build -------------------------------- */

export function renderAll() {
  const pages = [
    { path: "/what-is-ev-lineup", file: "what-is-ev-lineup.html", html: whatIsPage() },
    { path: "/faq", file: "faq.html", html: faqPage() },
    { path: "/alternatives", file: "alternatives.html", html: alternativesPage() },
    ...COMPETITORS.map((c) => ({
      path: `/vs/${c.slug}`,
      file: `vs/${c.slug}.html`,
      html: versusPage(c),
    })),
  ];
  const files = {};
  for (const p of pages) files[p.file] = p.html;
  files["llms.txt"] = llmsTxt();
  files["llms-full.txt"] = llmsFullTxt(pages);
  return { pages, files };
}

function main() {
  const check = process.argv.includes("--check");
  const { files } = renderAll();
  let stale = 0;
  for (const [rel, content] of Object.entries(files)) {
    const target = join(PUBLIC_DIR, rel);
    if (check) {
      const current = existsSync(target) ? readFileSync(target, "utf8") : "";
      if (current !== content) {
        console.error(`  ✗ public/${rel} is out of date — run: npm run seo:pages`);
        stale++;
      }
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
    console.log(`  wrote public/${rel} (${content.length} bytes)`);
  }
  if (check) {
    if (stale) process.exit(1);
    console.log(`  ✓ ${Object.keys(files).length} generated files in public/ are up to date`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("build-pages.mjs")) main();
