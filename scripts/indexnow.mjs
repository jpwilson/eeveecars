#!/usr/bin/env node
/**
 * Ping IndexNow (Bing, Yandex, Seznam, Naver — Bing also feeds Copilot and
 * DuckDuckGo) with EV Lineup's URLs after a deploy.
 *
 *   node scripts/indexnow.mjs --dry-run      # print the payload, send nothing
 *   node scripts/indexnow.mjs                # submit the marketing pages
 *   node scripts/indexnow.mjs --sitemap      # submit every URL in sitemap.xml
 *   node scripts/indexnow.mjs --url /faq --url /alternatives
 *
 * The key must be live at https://www.evlineup.org/<key>.txt containing the
 * key as its only content — that file is public/f11384617e608b47251b97b2756d6c40.txt
 * in this repo. See SEO.md.
 *
 * Google does not use IndexNow; it discovers changes from sitemap.xml.
 */

const HOST = "www.evlineup.org";
const ORIGIN = `https://${HOST}`;
const KEY = process.env.INDEXNOW_KEY || "f11384617e608b47251b97b2756d6c40";
const ENDPOINT = "https://api.indexnow.org/indexnow";

const DEFAULT_PATHS = [
  "/",
  "/what-is-ev-lineup",
  "/faq",
  "/alternatives",
  "/vs/edmunds",
  "/vs/kelley-blue-book",
  "/vs/car-and-driver",
  "/vs/fueleconomy-gov",
  "/best/longest-range-evs",
  "/best/cheapest-evs",
  "/best/evs-under-40k",
  "/best/fastest-evs",
  "/best/3-row-evs",
  "/best/electric-trucks",
  "/best/300-mile-range-evs",
];

function parseArgs(argv) {
  const opts = { dryRun: false, sitemap: false, urls: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run" || a === "-n") opts.dryRun = true;
    else if (a === "--sitemap") opts.sitemap = true;
    else if (a === "--url") opts.urls.push(argv[++i]);
    else if (a.startsWith("--url=")) opts.urls.push(a.slice(6));
  }
  return opts;
}

async function urlsFromSitemap() {
  const res = await fetch(`${ORIGIN}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const toAbsolute = (u) => (u.startsWith("http") ? u : `${ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`);

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  let urlList;
  if (opts.urls.length) urlList = opts.urls.map(toAbsolute);
  else if (opts.sitemap) urlList = await urlsFromSitemap();
  else urlList = DEFAULT_PATHS.map(toAbsolute);

  // IndexNow rejects URLs outside the submitted host, and caps a batch at 10,000.
  urlList = [...new Set(urlList)].filter((u) => u.startsWith(ORIGIN)).slice(0, 10000);

  const payload = { host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList };

  if (opts.dryRun) {
    console.log(`DRY RUN — would POST ${urlList.length} URL(s) to ${ENDPOINT}`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  // 200 = accepted, 202 = accepted but key still validating, 4xx = problem.
  console.log(`IndexNow responded ${res.status} ${res.statusText} for ${urlList.length} URL(s)`);
  if (!res.ok) {
    console.error(await res.text());
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
