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
const STATIC_URLS = [
  ["/", "1.0"],
  ["/what-is-ev-lineup", "0.9"],
  ["/faq", "0.9"],
  ["/alternatives", "0.8"],
  ["/vs/edmunds", "0.7"],
  ["/vs/kelley-blue-book", "0.7"],
  ["/vs/car-and-driver", "0.7"],
  ["/vs/fueleconomy-gov", "0.7"],
  ["/about", "0.6"],
  ["/advertise", "0.5"],
  ["/privacy", "0.4"],
  ["/terms", "0.4"],
  // Best-of lists: the backend sitemap currently omits these two.
  ["/best/electric-trucks", "0.8"],
  ["/best/300-mile-range-evs", "0.8"],
];

function urlBlock(loc, lastmod, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
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
  const today = new Date().toISOString().slice(0, 10);
  const backend = await fetchBackend();

  // Only add URLs the backend sitemap doesn't already list.
  const extra = STATIC_URLS.filter(
    ([path]) => !backend || !backend.includes(`<loc>${CANONICAL_HOST}${path}</loc>`)
  ).map(([path, priority]) => urlBlock(`${CANONICAL_HOST}${path}`, today, priority));

  let xml;
  if (backend) {
    xml = extra.length
      ? backend.replace("</urlset>", `${extra.join("\n")}\n</urlset>`)
      : backend;
  } else {
    xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${STATIC_URLS.map(
      ([path, priority]) => urlBlock(`${CANONICAL_HOST}${path}`, today, priority)
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
