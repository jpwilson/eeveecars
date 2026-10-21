/**
 * /sitemap.xml — one sitemap for the whole site.
 *
 * The backend (ev-backend-three.vercel.app) generates the data-driven URLs
 * (every model, manufacturer, comparison and best-of page) from the live
 * database. This function merges in the static marketing pages that only
 * exist on the frontend, so there is a single canonical sitemap.
 *
 * Fails open: if the backend sitemap can't be fetched, the static URLs are
 * still served as a valid sitemap.
 */

const CANONICAL_HOST = "https://www.evlineup.org";
const BACKEND_SITEMAP = "https://ev-backend-three.vercel.app/sitemap.xml";

// Static/marketing URLs that live in this repo (public/*.html + prerender).
// Keep in sync with scripts/seo-content.mjs and scripts/build-pages.mjs.
//
// Only self-canonical URLs belong here. /about, /advertise, /privacy and
// /terms are React-only routes served from app.html, whose canonical is "/",
// so submitting them would submit non-self-canonical pages — they stay out
// until they have their own crawler-visible content and metadata (see SEO.md).
//
// lastmod is the date the page's content was last edited, not "today": a
// sitemap that claims every page changed today teaches crawlers to ignore the
// field. The data-driven routes (/ and the best-of lists) change whenever the
// database does, with no date we can point at, so they carry no lastmod.
const CONTENT_UPDATED = "2026-10-21"; // scripts/seo-content.mjs SITE.updated

const STATIC_URLS = [
  ["/", "1.0", null],
  ["/what-is-ev-lineup", "0.9", CONTENT_UPDATED],
  ["/faq", "0.9", CONTENT_UPDATED],
  ["/alternatives", "0.8", CONTENT_UPDATED],
  ["/vs/edmunds", "0.7", CONTENT_UPDATED],
  ["/vs/kelley-blue-book", "0.7", CONTENT_UPDATED],
  ["/vs/car-and-driver", "0.7", CONTENT_UPDATED],
  ["/vs/fueleconomy-gov", "0.7", CONTENT_UPDATED],
  // Best-of lists: the backend sitemap currently omits these two.
  ["/best/electric-trucks", "0.8", null],
  ["/best/300-mile-range-evs", "0.8", null],
];

function urlBlock(loc, lastmod, priority) {
  const mod = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>\n    <loc>${loc}</loc>${mod}\n    <priority>${priority}</priority>\n  </url>`;
}

async function fetchBackend() {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 6000);
  try {
    const res = await fetch(BACKEND_SITEMAP, { signal: ctl.signal });
    if (!res.ok) return null;
    const xml = await res.text();
    return xml.includes("<urlset") ? xml : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export default async function handler(req, res) {
  const backend = await fetchBackend();

  // Only add URLs the backend sitemap doesn't already list.
  const extra = STATIC_URLS.filter(
    ([path]) => !backend || !backend.includes(`<loc>${CANONICAL_HOST}${path}</loc>`)
  ).map(([path, priority, lastmod]) => urlBlock(`${CANONICAL_HOST}${path}`, lastmod, priority));

  let xml;
  if (backend) {
    xml = extra.length
      ? backend.replace("</urlset>", `${extra.join("\n")}\n</urlset>`)
      : backend;
  } else {
    xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${STATIC_URLS.map(
      ([path, priority, lastmod]) => urlBlock(`${CANONICAL_HOST}${path}`, lastmod, priority)
    ).join("\n")}\n</urlset>\n`;
  }

  res
    .status(200)
    .setHeader("Content-Type", "application/xml; charset=utf-8")
    .setHeader(
      "Cache-Control",
      backend ? "public, s-maxage=3600, stale-while-revalidate=86400" : "public, s-maxage=60"
    )
    .send(xml);
}
