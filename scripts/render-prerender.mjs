#!/usr/bin/env node
/**
 * Renders api/prerender.js locally by calling the handler with a mock
 * req/res, so the crawler-visible HTML can be checked and screenshotted
 * without deploying. Needs network access: the handler fetches the SPA shell
 * from the live host and the data from the live backend API.
 *
 *   node scripts/render-prerender.mjs                 # render the default set
 *   node scripts/render-prerender.mjs --out dist/__preview
 *   node scripts/render-prerender.mjs --page best --slug electric-trucks
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "www.evlineup.org";

export const DEFAULT_TARGETS = [
  { name: "home", page: "home", slug: "", path: "/" },
  { name: "model-tesla-model-3", page: "model", slug: "tesla-model-3", path: "/model_detail/tesla-model-3" },
  { name: "make-hyundai", page: "make", slug: "hyundai", path: "/manufacturer/hyundai" },
  {
    name: "compare-model-3-vs-i4",
    page: "compare",
    slug: "tesla-model-3-vs-bmw-i4",
    path: "/compare/tesla-model-3-vs-bmw-i4",
  },
  { name: "best-longest-range", page: "best", slug: "longest-range-evs", path: "/best/longest-range-evs" },
];

/** Calls the Vercel handler with a mock req/res and returns { status, html }. */
export async function renderPrerender(page, slug) {
  const { default: handler } = await import("../api/prerender.js");
  const req = { query: { page, ...(slug ? { slug } : {}) }, headers: { host: HOST } };
  let status = 200;
  let body = "";
  const res = {
    status(c) {
      status = c;
      return res;
    },
    setHeader() {
      return res;
    },
    send(b) {
      body = b;
      return res;
    },
  };
  await handler(req, res);
  return { status, html: body };
}

async function main() {
  const argv = process.argv.slice(2);
  const outIdx = argv.indexOf("--out");
  const out = outIdx >= 0 ? argv[outIdx + 1] : "dist/__preview";
  const pageIdx = argv.indexOf("--page");
  const slugIdx = argv.indexOf("--slug");

  const targets =
    pageIdx >= 0
      ? [
          {
            name: `${argv[pageIdx + 1]}-${argv[slugIdx + 1] || "index"}`,
            page: argv[pageIdx + 1],
            slug: slugIdx >= 0 ? argv[slugIdx + 1] : "",
          },
        ]
      : DEFAULT_TARGETS;

  const dir = join(ROOT, out);
  mkdirSync(dir, { recursive: true });
  for (const t of targets) {
    const { status, html } = await renderPrerender(t.page, t.slug);
    const file = join(dir, `${t.name}.html`);
    writeFileSync(file, html);
    console.log(`  ${status} ${t.page}/${t.slug || "-"} -> ${out}/${t.name}.html (${html.length} bytes)`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("render-prerender.mjs")) {
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
