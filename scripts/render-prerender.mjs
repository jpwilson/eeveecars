#!/usr/bin/env node
/**
 * Renders api/prerender.js locally by calling the handler with a mock
 * req/res, so the crawler-visible HTML can be checked and screenshotted
 * without deploying. Needs network access: the handler fetches the SPA shell
 * from the live host and the data from the live backend API.
 *
 *   node scripts/render-prerender.mjs                 # render the default set
 *   node scripts/render-prerender.mjs --out dist/__preview
 *   node scripts/render-prerender.mjs --page best --slug cheapest-evs-uk
 *   node scripts/render-prerender.mjs --query "page=compare-index"
 *   node scripts/render-prerender.mjs --query "page=catalog-changes&make=tesla&model=model-3&pair=2017-vs-2024"
 *
 * EV_API_BASE=http://localhost:8011 points the handler at another backend (e.g. a
 * local API); the shell still comes from the live host.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "www.evlineup.org";

// `query` is the query string vercel.json's rewrite passes to /api/prerender.
export const DEFAULT_TARGETS = [
  { name: "home", page: "home", slug: "", path: "/" },
  { name: "model-tesla-model-3", page: "model", slug: "tesla-model-3", path: "/model_detail/tesla-model-3" },
  { name: "make-hyundai", page: "make", slug: "hyundai", path: "/manufacturer/hyundai" },
  {
    // a pinned pair, canonical (alphabetical) order: the other order is a 301
    name: "compare-i4-vs-model-3",
    page: "compare",
    slug: "bmw-i4-vs-tesla-model-3",
    path: "/compare/bmw-i4-vs-tesla-model-3",
  },
  // a generated (same-make) pair, indexable
  { name: "compare-model-3-vs-model-y", page: "compare", slug: "tesla-model-3-vs-tesla-model-y", path: "/compare/tesla-model-3-vs-tesla-model-y" },
  // an unselected pair: renders for people, but must be noindex (and is never linked)
  { name: "compare-seagull-vs-model-3", page: "compare", slug: "byd-seagull-vs-tesla-model-3", path: "/compare/byd-seagull-vs-tesla-model-3", noindex: true },
  { name: "best-longest-range", page: "best", slug: "longest-range-evs", path: "/best/longest-range-evs" },
  // a generated list in another market, indexable
  { name: "best-cheapest-uk", page: "best", slug: "cheapest-evs-uk", path: "/best/cheapest-evs-uk" },
  // a gated list (too few on sale): renders, but noindex
  { name: "best-evs-under-30k", page: "best", slug: "evs-under-30k", path: "/best/evs-under-30k", noindex: true },
  { name: "compare-hub", query: { page: "compare-index" }, path: "/compare" },
  { name: "best-hub", query: { page: "best-index" }, path: "/best" },
  {
    name: "catalog-model-tesla-model-3",
    query: { page: "catalog-model", make: "tesla", model: "model-3" },
    path: "/make/tesla/model-3",
  },
  {
    name: "catalog-variant-tesla-model-3-premium-awd",
    query: { page: "catalog-variant", make: "tesla", model: "model-3", generation: "2024", variant: "premium-awd" },
    path: "/make/tesla/model-3/2024/premium-awd",
  },
  {
    name: "catalog-changes-tesla-model-3",
    query: { page: "catalog-changes", make: "tesla", model: "model-3", pair: "2017-vs-2024" },
    path: "/make/tesla/model-3/changes/2017-vs-2024",
  },
].map((t) => ({ ...t, query: t.query ?? { page: t.page, ...(t.slug ? { slug: t.slug } : {}) } }));

/**
 * Calls the Vercel handler with a mock req/res and returns { status, html, location }.
 * Takes the full query object (`{ page, make, model, pair }`), or the older
 * `(page, slug)` pair.
 */
export async function renderPrerender(pageOrQuery, slug) {
  const { default: handler } = await import("../api/prerender.js");
  const query =
    pageOrQuery && typeof pageOrQuery === "object" ? { ...pageOrQuery } : { page: pageOrQuery, ...(slug ? { slug } : {}) };
  const req = { query, headers: { host: HOST } };
  const headers = {};
  let status = 200;
  let body = "";
  const res = {
    status(c) {
      status = c;
      return res;
    },
    setHeader(k, v) {
      headers[k.toLowerCase()] = v;
      return res;
    },
    send(b) {
      body = b;
      return res;
    },
  };
  await handler(req, res);
  return { status, html: body, location: headers.location ?? null };
}

async function main() {
  const argv = process.argv.slice(2);
  const outIdx = argv.indexOf("--out");
  const out = outIdx >= 0 ? argv[outIdx + 1] : "dist/__preview";
  const pageIdx = argv.indexOf("--page");
  const slugIdx = argv.indexOf("--slug");
  const queryIdx = argv.indexOf("--query");

  let targets = DEFAULT_TARGETS;
  if (queryIdx >= 0) {
    const query = Object.fromEntries(new URLSearchParams(argv[queryIdx + 1] || ""));
    targets = [{ name: Object.values(query).join("-").replace(/[^\w.-]+/g, "_") || "query", query }];
  } else if (pageIdx >= 0) {
    const page = argv[pageIdx + 1];
    const slug = slugIdx >= 0 ? argv[slugIdx + 1] : "";
    targets = [{ name: `${page}-${slug || "index"}`, query: { page, ...(slug ? { slug } : {}) } }];
  }

  const dir = join(ROOT, out);
  mkdirSync(dir, { recursive: true });
  for (const t of targets) {
    const { status, html, location } = await renderPrerender(t.query);
    const file = join(dir, `${t.name}.html`);
    writeFileSync(file, html);
    const label = new URLSearchParams(t.query).toString();
    console.log(`  ${status}${location ? ` -> ${location}` : ""} ${label} -> ${out}/${t.name}.html (${html.length} bytes)`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("render-prerender.mjs")) {
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
