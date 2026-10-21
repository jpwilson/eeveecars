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

function checkRobots() {
  section("robots.txt");
  const file = join(DIST, "robots.txt");
  if (!existsSync(file)) return fail("robots.txt in dist/");
  const txt = readFileSync(file, "utf8");
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
  for (const agent of required) {
    expect(
      new RegExp(`^User-agent:\\s*${agent}\\s*$`, "mi").test(txt),
      `robots.txt allows ${agent}`
    );
  }
  expect(/^User-agent:\s*\*$/mi.test(txt) && /^Allow:\s*\/$/mi.test(txt), "robots.txt: * Allow: /");
  for (const priv of ["/admin", "/dashboard", "/auth/"]) {
    expect(new RegExp(`^Disallow:\\s*${priv}`, "mi").test(txt), `robots.txt disallows ${priv}`);
  }
  expect(
    txt.includes(`Sitemap: ${HOST}/sitemap.xml`),
    "robots.txt has absolute Sitemap: line"
  );
  // Public content must not be blocked.
  for (const path of ["/faq", "/best/", "/model_detail/", "/vs/"]) {
    expect(
      !new RegExp(`^Disallow:\\s*${path.replace(/\//g, "\\/")}`, "mi").test(txt),
      `robots.txt does not block ${path}`
    );
  }
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
