#!/usr/bin/env node
/**
 * SEO/answer-engine smoke test for EV Lineup.
 *
 *   npm run build && node scripts/check-seo.mjs
 *   node scripts/check-seo.mjs --no-live   # skip the checks that need network
 *
 * Asserts, for every public page, that the crawler-visible HTML (no JS) has a
 * unique title, a meta description, an absolute self-referencing canonical,
 * exactly one H1, JSON-LD that parses, and more than 300 words of text. Also
 * checks robots.txt, the llms files, the IndexNow key and the vercel.json
 * rewrites that make the clean URLs work.
 *
 * Static pages are read from dist/ (so it tests the built output); the
 * prerendered routes are rendered by calling api/prerender.js directly, which
 * needs network access to the live backend API and the live SPA shell.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderAll } from "./build-pages.mjs";
import { SITE, COMPETITORS, FAQS } from "./seo-content.mjs";
import { compareIntro, makeIntro, safeUrl } from "../api/_seo.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const HOST = SITE.host;
const MIN_WORDS = 300;

let failures = 0;
let checks = 0;

function ok(name) {
  checks++;
  console.log(`  ✓ ${name}`);
}
function fail(name, detail) {
  checks++;
  failures++;
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}
function expect(cond, name, detail) {
  cond ? ok(name) : fail(name, detail);
}
function section(title) {
  console.log(`\n${title}`);
}

/* ------------------------------- helpers ------------------------------- */

function visibleWords(html) {
  const text = html
    .replace(/<(script|style|noscript|svg|template)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
}

const titles = new Map();
const descriptions = new Map();

/** Runs the shared per-page assertions on one HTML document. */
function checkPage(label, path, html) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
  const desc = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1];
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/)?.[1];
  const h1s = html.match(/<h1\b/g) || [];
  const words = visibleWords(html);
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => m[1]
  );

  expect(!!title, `${label}: has <title>`);
  if (title) {
    expect(title.length <= 75, `${label}: title length ${title.length} <= 75`, title);
    if (titles.has(title)) fail(`${label}: title is unique`, `also used by ${titles.get(title)}`);
    else {
      titles.set(title, label);
      ok(`${label}: title is unique`);
    }
  }
  expect(!!desc, `${label}: has meta description`);
  if (desc) {
    expect(
      desc.length >= 80 && desc.length <= 230,
      `${label}: description length ${desc.length} in 80..230`
    );
    if (descriptions.has(desc)) fail(`${label}: description is unique`, descriptions.get(desc));
    else {
      descriptions.set(desc, label);
      ok(`${label}: description is unique`);
    }
  }
  expect(canonical === `${HOST}${path}`, `${label}: canonical is ${HOST}${path}`, canonical);
  expect(h1s.length === 1, `${label}: exactly one <h1>`, `found ${h1s.length}`);
  expect(/<html[^>]+lang="en"/.test(html), `${label}: html lang="en"`);
  expect(
    /<meta\s+property="og:title"/.test(html) &&
      /<meta\s+property="og:description"/.test(html) &&
      /<meta\s+property="og:image"/.test(html) &&
      /<meta\s+property="og:url"/.test(html),
    `${label}: Open Graph title/description/image/url`
  );
  expect(
    /<meta\s+name="twitter:card"\s+content="summary_large_image"/.test(html),
    `${label}: twitter:card summary_large_image`
  );
  expect(jsonLd.length > 0, `${label}: has JSON-LD`);
  let parsed = [];
  try {
    parsed = jsonLd.map((j) => JSON.parse(j));
    ok(`${label}: JSON-LD parses (${jsonLd.length} block${jsonLd.length === 1 ? "" : "s"})`);
  } catch (e) {
    fail(`${label}: JSON-LD parses`, e.message);
  }
  expect(
    jsonLd.every((j) => !j.includes("<")),
    `${label}: JSON-LD escapes "<" (no script-tag breakout)`
  );
  const types = parsed.flatMap((o) => (Array.isArray(o) ? o : [o])).map((o) => o["@type"]);
  expect(
    types.includes("Organization") && types.includes("WebSite"),
    `${label}: JSON-LD has Organization + WebSite`,
    types.join(",")
  );
  // No fake ratings, ever.
  expect(
    !/aggregateRating/i.test(html),
    `${label}: no aggregateRating (would need real reviews)`
  );
  expect(words > MIN_WORDS, `${label}: ${words} crawler-visible words > ${MIN_WORDS}`);
  return words;
}

/* ---------------------------- static pages ----------------------------- */

const STATIC_PAGES = [
  ["/what-is-ev-lineup", "what-is-ev-lineup.html"],
  ["/faq", "faq.html"],
  ["/alternatives", "alternatives.html"],
  ...COMPETITORS.map((c) => [`/vs/${c.slug}`, `vs/${c.slug}.html`]),
];

function checkStatic() {
  section("Static marketing pages (dist/)");
  const counts = {};
  for (const [path, file] of STATIC_PAGES) {
    const full = join(DIST, file);
    if (!existsSync(full)) {
      fail(`${path}: present in dist/`, `missing ${file} — run npm run build`);
      continue;
    }
    counts[path] = checkPage(path, path, readFileSync(full, "utf8"));
  }
  return counts;
}

function checkGeneratedUpToDate() {
  section("Generated files in public/ are current");
  const { files } = renderAll();
  for (const [rel, content] of Object.entries(files)) {
    const target = join(ROOT, "public", rel);
    const current = existsSync(target) ? readFileSync(target, "utf8") : "";
    expect(current === content, `public/${rel} matches generator`, "run npm run seo:pages");
  }
}

/**
 * Minimal robots.txt evaluator (RFC 9309 / Google's spec): group the rules by
 * user-agent, pick the most specific matching group, then apply the
 * longest-match Allow/Disallow. Named groups do NOT inherit the "*" group, so
 * asserting that a string appears in the file proves nothing about the rules
 * that agent actually gets — this evaluates the effective verdict.
 */
function parseRobots(txt) {
  const groups = [];
  let current = null;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const [field, ...rest] = line.split(":");
    const key = field.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      if (!current || current.rules.length) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow") && current) {
      current.rules.push({ allow: key === "allow", path: value });
    }
  }
  return groups;
}

/** true if `agent` may fetch `path` under these robots.txt rules. */
function robotsAllows(groups, agent, path) {
  const ua = agent.toLowerCase();
  let specific = null; // longest matching named agent wins
  let wildcard = null;
  for (const g of groups) {
    for (const a of g.agents) {
      if (a === "*") wildcard = wildcard || g;
      else if (ua.startsWith(a) && (!specific || a.length > specific.len))
        specific = { len: a.length, group: g };
    }
  }
  const group = specific ? specific.group : wildcard;
  if (!group) return true; // no group matches this agent at all
  let verdict = true;
  let longest = -1;
  for (const r of group.rules) {
    if (!r.path) continue;
    if (path.startsWith(r.path) && r.path.length > longest) {
      longest = r.path.length;
      verdict = r.allow;
    }
  }
  return verdict;
}

function checkRobots() {
  section("robots.txt");
  const file = join(DIST, "robots.txt");
  if (!existsSync(file)) return fail("robots.txt in dist/");
  const txt = readFileSync(file, "utf8");
  const groups = parseRobots(txt);
  const required = [
    "OAI-SearchBot",
    "ChatGPT-User",
    "GPTBot",
    "Claude-SearchBot",
    "Claude-User",
    "ClaudeBot",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Googlebot",
    "bingbot",
    "Applebot",
    "Applebot-Extended",
    "DuckAssistBot",
    "meta-externalagent",
    "CCBot",
  ];
  const PUBLIC_PATHS = ["/", "/faq", "/what-is-ev-lineup", "/alternatives", "/vs/edmunds", "/best/cheapest-evs", "/model_detail/tesla-model-3", "/llms.txt"];
  const PRIVATE_PATHS = ["/admin", "/auth/callback", "/dashboard", "/layout_test", "/api/prerender"];

  for (const agent of required) {
    expect(
      new RegExp(`^User-agent:\\s*${agent}\\s*$`, "mi").test(txt),
      `robots.txt names ${agent}`
    );
  }
  expect(/^User-agent:\s*\*\s*$/mi.test(txt), "robots.txt has a * group");
  // Every named agent, the wildcard, and an unlisted bot must all end up with
  // the same effective rules — a named group does not inherit the * group.
  for (const agent of [...required, "*", "SomeUnlistedBot"]) {
    const blockedPublic = PUBLIC_PATHS.filter((pth) => !robotsAllows(groups, agent, pth));
    expect(!blockedPublic.length, `robots.txt: ${agent} may crawl public paths`, blockedPublic.join(" "));
    const openPrivate = PRIVATE_PATHS.filter((pth) => robotsAllows(groups, agent, pth));
    expect(!openPrivate.length, `robots.txt: ${agent} is blocked from private paths`, openPrivate.join(" "));
  }
  expect(
    txt.includes(`Sitemap: ${HOST}/sitemap.xml`),
    "robots.txt has absolute Sitemap: line"
  );
}

function checkLlms() {
  section("llms.txt / llms-full.txt");
  for (const name of ["llms.txt", "llms-full.txt"]) {
    const file = join(DIST, name);
    if (!existsSync(file)) {
      fail(`${name} exists in dist/`);
      continue;
    }
    const txt = readFileSync(file, "utf8");
    expect(!/<!DOCTYPE html|<div id="root"/i.test(txt), `${name} is text, not the SPA shell`);
    expect(txt.includes(HOST), `${name} uses absolute URLs`);
    expect(
      visibleWords(txt) > (name === "llms.txt" ? 150 : 1500),
      `${name} has real content (${visibleWords(txt)} words)`
    );
  }
  const full = readFileSync(join(DIST, "llms-full.txt"), "utf8");
  for (const [path] of STATIC_PAGES) {
    expect(full.includes(`${HOST}${path}`), `llms-full.txt covers ${path}`);
  }
}

function checkIndexNow() {
  section("IndexNow");
  const keyFiles = STATIC_PAGES.length ? [] : [];
  const key = "f11384617e608b47251b97b2756d6c40";
  const file = join(DIST, `${key}.txt`);
  expect(existsSync(file), `key file /${key}.txt exists`);
  if (existsSync(file))
    expect(readFileSync(file, "utf8").trim() === key, "key file content equals the key");
  expect(existsSync(join(ROOT, "scripts/indexnow.mjs")), "scripts/indexnow.mjs exists");
  void keyFiles;
}

function checkVercelConfig() {
  section("vercel.json routing");
  const cfg = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
  const sources = cfg.rewrites.map((r) => r.source);
  for (const [path] of STATIC_PAGES) {
    expect(sources.includes(path), `rewrite for ${path}`);
  }
  expect(
    cfg.rewrites.some((r) => r.source === "/sitemap.xml" && r.destination === "/api/sitemap"),
    "sitemap.xml is served by api/sitemap.js"
  );
  expect(
    cfg.rewrites[cfg.rewrites.length - 1].source === "/(.*)",
    "SPA catch-all stays last so static pages win"
  );
  // The static pages must not be shadowed by an earlier catch-all.
  const catchAll = cfg.rewrites.findIndex((r) => r.source === "/(.*)");
  expect(
    STATIC_PAGES.every(([p]) => sources.indexOf(p) < catchAll),
    "static page rewrites come before the catch-all"
  );
}

function checkSitemapFunction() {
  section("api/sitemap.js");
  const src = readFileSync(join(ROOT, "api/sitemap.js"), "utf8");
  for (const [path] of STATIC_PAGES) {
    expect(src.includes(`"${path}"`), `sitemap lists ${path}`);
  }
  for (const path of ["/best/electric-trucks", "/best/300-mile-range-evs"]) {
    expect(src.includes(`"${path}"`), `sitemap lists ${path}`);
  }
  // SPA-only routes are served from app.html, whose canonical is "/", so
  // listing them would submit non-self-canonical URLs.
  for (const path of ["/about", "/advertise", "/privacy", "/terms"]) {
    expect(
      !new RegExp(`\\["${path}"`).test(src),
      `sitemap omits ${path} (no self-referencing canonical yet)`
    );
  }
  // lastmod must be a real content date, never "today".
  expect(!/new Date\(\)/.test(src), "sitemap does not stamp lastmod with today's date");
}

/**
 * Database fields end up inside generated HTML, so a model or make record
 * containing markup must render as text. These are the helpers that
 * interpolate raw API values.
 */
function checkEscaping() {
  section("Database values are escaped before they reach HTML");
  const PAYLOAD = '<img src=x onerror=alert(1)>';
  const hostileMake = {
    name: `Evil${PAYLOAD}`,
    headquarters: `Seoul${PAYLOAD}`,
    founding_date: `1967"><script>alert(1)</script>`,
    country: `<b>South Korea</b>`,
    website_url: "javascript:alert(1)",
  };
  const hostileModel = {
    make_name: `Evil${PAYLOAD}`,
    model: `Car${PAYLOAD}`,
    current_price: "</p><script>alert(1)</script>",
    epa_range: PAYLOAD,
    acceleration_0_60: PAYLOAD,
    battery_capacity: PAYLOAD,
    battery_max_charging_speed: PAYLOAD,
    number_of_full_adult_seats: PAYLOAD,
  };
  const outputs = {
    "makeIntro (with models)": makeIntro(hostileMake, [hostileModel]),
    "makeIntro (no models)": makeIntro(hostileMake, []),
    compareIntro: compareIntro(hostileModel, hostileModel),
  };
  for (const [name, html] of Object.entries(outputs)) {
    // The payload may appear as escaped text; it must never appear as markup.
    expect(!html.includes(PAYLOAD), `${name}: payload is not emitted verbatim`);
    expect(
      html.includes("&lt;img src=x onerror=alert(1)&gt;"),
      `${name}: payload is escaped into text`
    );
    expect(!/<(img|script|b)[\s>]/i.test(html), `${name}: no tag from a DB value`);
    expect(!/javascript:/i.test(html), `${name}: no javascript: URL`);
    expect(!/\bNaN\b/.test(html), `${name}: non-numeric spec values are dropped, not printed`);
  }
  expect(safeUrl("javascript:alert(1)") === null, "safeUrl rejects javascript:");
  expect(safeUrl("data:text/html,x") === null, "safeUrl rejects data:");
  expect(safeUrl("https://hyundai.com/") === "https://hyundai.com/", "safeUrl keeps https URLs");
}

function checkFaqContent() {
  section("FAQ content");
  expect(FAQS.length >= 8 && FAQS.length <= 15, `FAQ has ${FAQS.length} questions (8..15)`);
  expect(
    FAQS.every((f) => f.a.split(/\s+/).length >= 20),
    "every FAQ answer is a real answer (20+ words)"
  );
}

/* -------------------------- prerendered routes ------------------------- */

async function checkPrerendered() {
  section("Prerendered routes (api/prerender.js against the live API)");
  const { renderPrerender, DEFAULT_TARGETS } = await import("./render-prerender.mjs");
  const counts = {};
  for (const t of DEFAULT_TARGETS) {
    let html;
    try {
      const out = await renderPrerender(t.page, t.slug);
      if (out.status !== 200) {
        fail(`${t.path}: 200 from prerender`, `got ${out.status}`);
        continue;
      }
      html = out.html;
    } catch (e) {
      fail(`${t.path}: prerender ran`, e.message);
      continue;
    }
    expect(
      !html.includes('<div id="root"></div>'),
      `${t.path}: content was injected into #root (not the bare SPA shell)`
    );
    counts[t.path] = checkPage(t.path, t.path, html);
    // Internal links to the new pages must be reachable from every page.
    expect(
      html.includes('href="/faq"') && html.includes('href="/what-is-ev-lineup"'),
      `${t.path}: links to the explainer pages`
    );
    // The prose/FAQ/link block must sit outside #root, or React drops it on
    // mount and JS readers see different content from crawlers.
    const root = html.slice(html.indexOf('<div id="root">'));
    const seoIdx = root.indexOf('<div id="seo-content"');
    expect(seoIdx > 0, `${t.path}: #seo-content block is a sibling of #root`);
    const persisted = seoIdx > 0 ? root.slice(seoIdx) : "";
    expect(
      persisted.includes('class="seo-links"'),
      `${t.path}: internal links survive hydration`
    );
    expect(
      visibleWords(persisted) > 100,
      `${t.path}: ${visibleWords(persisted)} words stay visible after React mounts`
    );
    if (t.page === "home") {
      // The FAQPage JSON-LD on the home page describes these answers.
      expect(
        persisted.includes("Frequently Asked Questions") &&
          persisted.includes("What is EV Lineup?"),
        "/: home FAQ stays visible after React mounts"
      );
    }
  }
  return counts;
}

/* --------------------------------- run --------------------------------- */

const live = !process.argv.includes("--no-live");

if (!existsSync(DIST)) {
  console.error("dist/ not found — run `npm run build` first.");
  process.exit(1);
}

checkGeneratedUpToDate();
const staticCounts = checkStatic();
checkRobots();
checkLlms();
checkIndexNow();
checkVercelConfig();
checkSitemapFunction();
checkFaqContent();
checkEscaping();
const preCounts = live ? await checkPrerendered() : (console.log("\nSkipping live prerender checks (--no-live)"), {});

section("Crawler-visible word counts");
for (const [path, n] of Object.entries({ ...preCounts, ...staticCounts })) {
  console.log(`  ${String(n).padStart(5)}  ${path}`);
}

console.log(
  `\n${failures ? "FAIL" : "PASS"}: ${checks - failures}/${checks} checks passed${
    failures ? `, ${failures} failed` : ""
  }`
);
process.exit(failures ? 1 : 0);
