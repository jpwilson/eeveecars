/**
 * Prerenderer for content routes (/, /model_detail/:slug, /manufacturer/:slug).
 *
 * Serves the SPA's index.html with per-page <head> meta (title, description,
 * canonical, OG/Twitter, JSON-LD) and a semantic HTML content block inside
 * #root. Everyone — bots and humans — gets the same HTML (no UA sniffing, no
 * cloaking); React replaces the block when the bundle loads.
 *
 * Fails open: any error returns the untouched SPA shell.
 */

const API_BASE = "https://ev-backend-three.vercel.app";
const CANONICAL_HOST = "https://www.evlineup.org";
const SITE_NAME = "EV Lineup";

let templateCache = null; // per-lambda-instance cache of index.html

async function fetchWithTimeout(url, ms = 6000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { signal: ctl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function getTemplate(host) {
  if (templateCache) return templateCache;
  // The SPA shell is built as app.html (renamed from index.html) so the
  // filesystem never wins over the "/" rewrite to this function.
  const res = await fetchWithTimeout(`https://${host}/app.html`);
  if (!res.ok) throw new Error(`template fetch ${res.status}`);
  templateCache = await res.text();
  return templateCache;
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absImage(url) {
  if (!url) return `${CANONICAL_HOST}/pub_assets/hero-ev.png`;
  if (url.startsWith("http")) return url;
  return `${CANONICAL_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
}

function metaBlock({ title, description, canonical, image, ogType, jsonLd }) {
  const t = esc(title);
  const d = esc(description);
  const img = esc(image);
  const jsonLdTags = (jsonLd || [])
    .map(
      (obj) =>
        `<script type="application/ld+json">${JSON.stringify(obj)}</script>`
    )
    .join("\n    ");
  return `<title>${t}</title>
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="${ogType || "website"}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${img}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    ${jsonLdTags}`;
}

const CONTENT_STYLE = `<style>
.prerender{max-width:880px;margin:0 auto;padding:24px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1a202c}
.prerender h1{font-size:1.8rem;margin:0 0 4px}
.prerender .sub{color:#4a5568;margin:0 0 16px}
.prerender img.hero{max-width:100%;border-radius:12px}
.prerender table{border-collapse:collapse;width:100%;margin:16px 0}
.prerender th,.prerender td{text-align:left;padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:.95rem}
.prerender a{color:#16a34a}
.prerender .crumbs{font-size:.85rem;margin-bottom:12px}
</style>`;

function specRow(label, value, unit = "") {
  if (value === null || value === undefined || value === "" || value === 0)
    return "";
  return `<tr><th>${esc(label)}</th><td>${esc(value)}${unit}</td></tr>`;
}

function fmtPrice(p) {
  if (!p) return null;
  return `$${Number(p).toLocaleString("en-US")}`;
}

// ---------- page builders ----------

async function buildModelPage(slug) {
  const res = await fetchWithTimeout(
    `${API_BASE}/cars/model-details/${encodeURIComponent(slug)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const rep = data.representative_model;
  if (!rep) return null;
  const make = data.make_details || {};
  const subs = data.submodels || [];

  const name = `${rep.make_name} ${rep.model}`;
  const canonical = `${CANONICAL_HOST}/model_detail/${slug}`;
  const price = fmtPrice(rep.current_price);
  const bits = [];
  if (rep.epa_range) bits.push(`${rep.epa_range} mi range`);
  if (price) bits.push(`from ${price}`);
  if (rep.acceleration_0_60) bits.push(`0-60 in ${rep.acceleration_0_60}s`);
  const description = `${name} electric ${(rep.vehicle_class || "vehicle").toLowerCase()}: ${bits.join(", ")}. Full specs, variants, and comparisons on ${SITE_NAME}.`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Car",
      name,
      brand: { "@type": "Brand", name: rep.make_name },
      model: rep.model,
      image: absImage(rep.image_url),
      description: rep.model_description || rep.car_description || description,
      url: canonical,
      vehicleConfiguration: rep.submodel || undefined,
      fuelType: "Electric",
      ...(rep.current_price
        ? {
            offers: {
              "@type": "Offer",
              price: rep.current_price,
              priceCurrency: "USD",
              availability:
                rep.availability_desc === "available"
                  ? "https://schema.org/InStock"
                  : "https://schema.org/PreOrder",
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "EVs", item: `${CANONICAL_HOST}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: rep.make_name,
          item: `${CANONICAL_HOST}/manufacturer/${slugify(rep.make_name)}`,
        },
        { "@type": "ListItem", position: 3, name: rep.model, item: canonical },
      ],
    },
  ];

  const faq = [];
  if (rep.epa_range)
    faq.push({
      "@type": "Question",
      name: `What is the range of the ${name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `The ${name} (${rep.submodel || "base"}) has an EPA range of ${rep.epa_range} miles.`,
      },
    });
  if (price)
    faq.push({
      "@type": "Question",
      name: `How much does the ${name} cost?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `The ${name} starts at ${price} MSRP (before taxes, fees, and incentives).`,
      },
    });
  if (rep.acceleration_0_60)
    faq.push({
      "@type": "Question",
      name: `How fast is the ${name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `The ${name} accelerates 0-60 mph in ${rep.acceleration_0_60} seconds${rep.top_speed ? ` with a top speed of ${rep.top_speed} mph` : ""}.`,
      },
    });
  if (faq.length)
    jsonLd.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq });

  const variantRows = subs
    .map(
      (s) =>
        `<tr><td>${esc(s.submodel || "—")}</td><td>${esc(fmtPrice(s.current_price) || "—")}</td><td>${s.epa_range ? esc(s.epa_range) + " mi" : "—"}</td><td>${s.acceleration_0_60 ? esc(s.acceleration_0_60) + "s" : "—"}</td></tr>`
    )
    .join("");

  const content = `${CONTENT_STYLE}<div class="prerender">
  <p class="crumbs"><a href="/">All EVs</a> › <a href="/manufacturer/${slugify(rep.make_name)}">${esc(rep.make_name)}</a> › ${esc(rep.model)}</p>
  <h1>${esc(name)}</h1>
  <p class="sub">${esc(rep.vehicle_class || "Electric vehicle")}${rep.generation ? ` · ${esc(rep.generation)}` : ""}${price ? ` · from ${esc(price)}` : ""}</p>
  <img class="hero" src="${esc(absImage(rep.image_url))}" alt="${esc(name)}" />
  <p>${esc(rep.model_description || rep.car_description || "")}</p>
  <h2>Key specs</h2>
  <table>
    ${specRow("MSRP", price)}
    ${specRow("EPA range", rep.epa_range, " mi")}
    ${specRow("0–60 mph", rep.acceleration_0_60, " s")}
    ${specRow("Top speed", rep.top_speed, " mph")}
    ${specRow("Power", rep.power, " hp")}
    ${specRow("Battery", rep.battery_capacity, " kWh")}
    ${specRow("Max DC charging", rep.battery_max_charging_speed, " kW")}
    ${specRow("Drive", rep.drive_type)}
    ${specRow("Seats", rep.number_of_full_adult_seats)}
  </table>
  ${subs.length ? `<h2>Variants</h2><table><tr><th>Trim</th><th>Price</th><th>Range</th><th>0–60</th></tr>${variantRows}</table>` : ""}
  <p><a href="/">Browse all electric vehicles →</a></p>
</div>`;

  return {
    meta: metaBlock({
      title: `${name} — Specs, Range & Price | ${SITE_NAME}`,
      description,
      canonical,
      image: absImage(rep.image_url),
      ogType: "product",
      jsonLd,
    }),
    content,
  };
}

function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function buildMakePage(slug) {
  const res = await fetchWithTimeout(`${API_BASE}/makes`);
  if (!res.ok) return null;
  const makes = await res.json();
  const make = makes.find((m) => slugify(m.name) === slug);
  if (!make) return null;

  // Model reps for this make
  const carsRes = await fetchWithTimeout(`${API_BASE}/cars/model-reps`);
  const cars = carsRes.ok ? await carsRes.json() : [];
  const models = cars.filter((c) => c.make_id === make.id);

  const canonical = `${CANONICAL_HOST}/manufacturer/${slug}`;
  const title = `${make.name} Electric Vehicles — All ${make.name} EV Models | ${SITE_NAME}`;
  const description = `Every ${make.name} electric vehicle: ${models
    .slice(0, 4)
    .map((m) => m.model)
    .join(", ")}${models.length > 4 ? " and more" : ""} — specs, range, and prices compared.`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Brand",
      name: make.name,
      url: canonical,
      ...(make.lrg_logo_img_url ? { logo: absImage(make.lrg_logo_img_url) } : {}),
      ...(make.description ? { description: make.description } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: models.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${make.name} ${m.model}`,
        url: `${CANONICAL_HOST}/model_detail/${m.make_model_slug}`,
      })),
    },
  ];

  const rows = models
    .map(
      (m) =>
        `<tr><td><a href="/model_detail/${esc(m.make_model_slug)}">${esc(m.model)}</a></td><td>${esc(fmtPrice(m.current_price) || "—")}</td><td>${m.epa_range ? esc(m.epa_range) + " mi" : "—"}</td><td>${esc(m.availability_desc || "")}</td></tr>`
    )
    .join("");

  const content = `${CONTENT_STYLE}<div class="prerender">
  <p class="crumbs"><a href="/">All EVs</a> › ${esc(make.name)}</p>
  <h1>${esc(make.name)} Electric Vehicles</h1>
  <p class="sub">${esc(make.headquarters || "")}${make.founding_date ? ` · founded ${esc(make.founding_date)}` : ""}</p>
  <p>${esc(make.description || "")}</p>
  <h2>${esc(make.name)} EV lineup</h2>
  <table><tr><th>Model</th><th>From</th><th>Range</th><th>Status</th></tr>${rows}</table>
  <p><a href="/">Browse all electric vehicles →</a></p>
</div>`;

  return {
    meta: metaBlock({
      title,
      description,
      canonical,
      image: absImage(models[0]?.image_url || make.lrg_logo_img_url),
      jsonLd,
    }),
    content,
  };
}

async function buildHomePage() {
  const res = await fetchWithTimeout(`${API_BASE}/cars/cards`);
  if (!res.ok) return null;
  const cars = await res.json();
  const top = cars.slice(0, 30);

  const canonical = `${CANONICAL_HOST}/`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: canonical,
      description:
        "Every electric vehicle on the market: specs, range, price, and charging — compared side by side.",
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: top.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${m.make_name} ${m.model}`,
        url: `${CANONICAL_HOST}/model_detail/${m.make_model_slug}`,
      })),
    },
  ];

  const rows = top
    .map(
      (m) =>
        `<tr><td><a href="/model_detail/${esc(m.make_model_slug)}">${esc(m.make_name)} ${esc(m.model)}</a></td><td>${esc(fmtPrice(m.current_price) || "—")}</td><td>${m.epa_range ? esc(m.epa_range) + " mi" : "—"}</td><td>${m.acceleration_0_60 ? esc(m.acceleration_0_60) + "s" : "—"}</td></tr>`
    )
    .join("");

  const content = `${CONTENT_STYLE}<div class="prerender">
  <h1>Every Electric Vehicle, Compared</h1>
  <p class="sub">Specs, range, price, and charging for ${cars.length}+ EV models — side by side.</p>
  <table><tr><th>Model</th><th>From</th><th>Range</th><th>0–60</th></tr>${rows}</table>
</div>`;

  return {
    meta: metaBlock({
      title: `${SITE_NAME} — Every Electric Vehicle, Compared`,
      description:
        "Browse every electric vehicle on the market: specs, range, price, and charging for 200+ EVs from 37 manufacturers. Compare models side by side and find your next EV.",
      canonical,
      image: `${CANONICAL_HOST}/pub_assets/hero-ev.png`,
      jsonLd,
    }),
    content,
  };
}

async function fetchRep(slug) {
  const res = await fetchWithTimeout(
    `${API_BASE}/cars/model-details/${encodeURIComponent(slug)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.representative_model || null;
}

const COMPARE_ROWS = [
  ["Starting price", (m) => fmtPrice(m.current_price), "current_price", "low"],
  ["EPA range", (m) => (m.epa_range ? `${m.epa_range} mi` : null), "epa_range", "high"],
  ["0–60 mph", (m) => (m.acceleration_0_60 ? `${m.acceleration_0_60} s` : null), "acceleration_0_60", "low"],
  ["Top speed", (m) => (m.top_speed ? `${m.top_speed} mph` : null), "top_speed", "high"],
  ["Power", (m) => (m.power ? `${m.power} hp` : null), "power", "high"],
  ["Battery", (m) => (m.battery_capacity ? `${m.battery_capacity} kWh` : null), "battery_capacity", "high"],
  ["Max DC charging", (m) => (m.battery_max_charging_speed ? `${m.battery_max_charging_speed} kW` : null), "battery_max_charging_speed", "high"],
  ["Seats", (m) => m.number_of_full_adult_seats || null, "number_of_full_adult_seats", "high"],
];

async function buildComparePage(pair) {
  const [slugA, slugB] = String(pair).split("-vs-");
  if (!slugA || !slugB) return null;
  const [A, B] = await Promise.all([fetchRep(slugA), fetchRep(slugB)]);
  if (!A || !B) return null;

  const nameA = `${A.make_name} ${A.model}`;
  const nameB = `${B.make_name} ${B.model}`;
  const canonical = `${CANONICAL_HOST}/compare/${pair}`;
  const title = `${nameA} vs ${nameB}: Price, Range & 0-60 Compared | ${SITE_NAME}`;
  const description = `${nameA} vs ${nameB} side by side: ${
    A.epa_range && B.epa_range ? `${A.epa_range} vs ${B.epa_range} mi range, ` : ""
  }${
    A.current_price && B.current_price
      ? `from ${fmtPrice(A.current_price)} vs ${fmtPrice(B.current_price)}. `
      : ""
  }Full spec comparison on ${SITE_NAME}.`;

  const faq = [];
  if (A.epa_range && B.epa_range && A.epa_range !== B.epa_range) {
    const [w, l] = A.epa_range > B.epa_range ? [A, B] : [B, A];
    faq.push({
      "@type": "Question",
      name: `Which has more range, the ${nameA} or the ${nameB}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `The ${w.make_name} ${w.model} has more EPA range: ${w.epa_range} miles vs ${l.epa_range} miles.`,
      },
    });
  }
  if (A.current_price && B.current_price && A.current_price !== B.current_price) {
    const [w, l] = A.current_price < B.current_price ? [A, B] : [B, A];
    faq.push({
      "@type": "Question",
      name: `Which is cheaper, the ${nameA} or the ${nameB}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `The ${w.make_name} ${w.model} starts lower at ${fmtPrice(w.current_price)} vs ${fmtPrice(l.current_price)} MSRP.`,
      },
    });
  }

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${nameA} vs ${nameB}`,
      itemListElement: [A, B].map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Car",
          name: `${m.make_name} ${m.model}`,
          brand: { "@type": "Brand", name: m.make_name },
          image: absImage(m.image_url),
          url: `${CANONICAL_HOST}/model_detail/${m.make_model_slug}`,
          fuelType: "Electric",
        },
      })),
    },
  ];
  if (faq.length)
    jsonLd.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq });

  const rows = COMPARE_ROWS.map(([label, get, key, better]) => {
    const va = get(A) ?? "—";
    const vb = get(B) ?? "—";
    let wa = "", wb = "";
    if (A[key] && B[key] && A[key] !== B[key]) {
      const aWins = better === "high" ? A[key] > B[key] : A[key] < B[key];
      if (aWins) wa = " ✓"; else wb = " ✓";
    }
    return `<tr><th>${esc(label)}</th><td>${esc(va)}${wa}</td><td>${esc(vb)}${wb}</td></tr>`;
  }).join("");

  const content = `${CONTENT_STYLE}<div class="prerender">
  <p class="crumbs"><a href="/">All EVs</a> › Compare</p>
  <h1>${esc(nameA)} vs ${esc(nameB)}</h1>
  <p class="sub">Side-by-side specs from the live ${SITE_NAME} database.</p>
  <table>
    <tr><th></th><th><a href="/model_detail/${esc(A.make_model_slug)}">${esc(nameA)}</a></th><th><a href="/model_detail/${esc(B.make_model_slug)}">${esc(nameB)}</a></th></tr>
    ${rows}
  </table>
  <p><a href="/">Browse all electric vehicles →</a></p>
</div>`;

  return {
    meta: metaBlock({
      title,
      description,
      canonical,
      image: absImage(A.image_url),
      jsonLd,
    }),
    content,
  };
}

// Mirror of src/data/seoPages.ts — keep slugs and logic in sync.
const BEST_CONFIGS = {
  "evs-under-40k": {
    title: "Best EVs Under $40,000",
    blurb: "Every electric vehicle under $40k MSRP, ranked by review score.",
    filter: (c) => c.availability_desc === "available" && c.current_price && c.current_price < 40000,
    sort: (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0) || (a.current_price ?? 0) - (b.current_price ?? 0),
  },
  "longest-range-evs": {
    title: "Longest Range Electric Cars",
    blurb: "The EVs that go furthest on a charge, ranked by EPA range.",
    filter: (c) => c.availability_desc === "available" && c.epa_range,
    sort: (a, b) => (b.epa_range ?? 0) - (a.epa_range ?? 0),
  },
  "fastest-evs": {
    title: "Fastest Electric Cars (0–60 mph)",
    blurb: "The quickest EVs on sale, ranked by 0–60 acceleration.",
    filter: (c) => c.availability_desc === "available" && c.acceleration_0_60,
    sort: (a, b) => (a.acceleration_0_60 ?? 99) - (b.acceleration_0_60 ?? 99),
  },
  "cheapest-evs": {
    title: "Cheapest Electric Cars",
    blurb: "The most affordable EVs on the market, ranked by MSRP.",
    filter: (c) => c.availability_desc === "available" && c.current_price,
    sort: (a, b) => (a.current_price ?? 0) - (b.current_price ?? 0),
  },
  "3-row-evs": {
    title: "Best 3-Row Electric SUVs (6+ Seats)",
    blurb: "Every EV with six or more seats, ranked by review score.",
    filter: (c) => c.availability_desc === "available" && (c.number_of_full_adult_seats ?? 0) >= 6,
    sort: (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0),
  },
};

async function buildBestPage(criteria) {
  const cfg = BEST_CONFIGS[criteria];
  if (!cfg) return null;
  const res = await fetchWithTimeout(`${API_BASE}/cars/cards`);
  if (!res.ok) return null;
  const cars = await res.json();
  const ranked = cars.filter(cfg.filter).sort(cfg.sort).slice(0, 12);

  const canonical = `${CANONICAL_HOST}/best/${criteria}`;
  const title = `${cfg.title} (${new Date().getFullYear()}) | ${SITE_NAME}`;
  const description = `${cfg.blurb} Generated live from the ${SITE_NAME} database of every EV on the market.`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: cfg.title,
      itemListElement: ranked.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${m.make_name} ${m.model}`,
        url: `${CANONICAL_HOST}/model_detail/${m.make_model_slug}`,
      })),
    },
  ];

  const rows = ranked
    .map(
      (m, i) =>
        `<tr><td>${i + 1}</td><td><a href="/model_detail/${esc(m.make_model_slug)}">${esc(m.make_name)} ${esc(m.model)}</a></td><td>${esc(fmtPrice(m.current_price) || "—")}</td><td>${m.epa_range ? esc(m.epa_range) + " mi" : "—"}</td><td>${m.acceleration_0_60 ? esc(m.acceleration_0_60) + "s" : "—"}</td><td>${m.average_rating ? esc(m.average_rating) + "/10" : "—"}</td></tr>`
    )
    .join("");

  const content = `${CONTENT_STYLE}<div class="prerender">
  <p class="crumbs"><a href="/">All EVs</a> › Rankings</p>
  <h1>${esc(cfg.title)}</h1>
  <p class="sub">${esc(cfg.blurb)}</p>
  <table><tr><th>#</th><th>Model</th><th>From</th><th>Range</th><th>0–60</th><th>Score</th></tr>${rows}</table>
  <p><a href="/">Browse all electric vehicles →</a></p>
</div>`;

  return {
    meta: metaBlock({
      title,
      description,
      canonical,
      image: absImage(ranked[0]?.image_url),
      jsonLd,
    }),
    content,
  };
}

// ---------- handler ----------

export default async function handler(req, res) {
  const { page, slug } = req.query || {};
  let template;
  try {
    template = await getTemplate(req.headers.host);
  } catch (e) {
    // Can't even get the shell — minimal hard fallback
    res.status(200).setHeader("Content-Type", "text/html").send("<!DOCTYPE html><html><body>EV Lineup</body></html>");
    return;
  }

  let built = null;
  let status = 200;
  try {
    if (page === "model" && slug) built = await buildModelPage(slug);
    else if (page === "make" && slug) built = await buildMakePage(slug);
    else if (page === "compare" && slug) built = await buildComparePage(slug);
    else if (page === "best" && slug) built = await buildBestPage(slug);
    else if (page === "home") built = await buildHomePage();
    if (["model", "make", "compare", "best"].includes(page) && !built) status = 404;
  } catch (e) {
    built = null; // fail open: serve the untouched shell
  }

  let html = template;
  if (built) {
    html = html.replace(
      /<!-- meta:start[\s\S]*?meta:end -->/,
      `<!-- meta:start -->\n    ${built.meta}\n    <!-- meta:end -->`
    );
    html = html.replace('<div id="root"></div>', `<div id="root">${built.content}</div>`);
  }

  res
    .status(status)
    .setHeader("Content-Type", "text/html; charset=utf-8")
    .setHeader(
      "Cache-Control",
      built ? "public, s-maxage=3600, stale-while-revalidate=86400" : "public, s-maxage=60"
    )
    .send(html);
}
