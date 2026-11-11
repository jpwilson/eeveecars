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

// EV_API_BASE (server-side env, optional) lets a preview or a local test point
// the prerenderer at another backend; production uses the live API.
const API_BASE = (process.env.EV_API_BASE || "https://ev-backend-three.vercel.app").replace(/\/$/, "");
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

// Commons originals are large and rate-limited when hotlinked; use a standard-width thumbnail.
function commonsThumb(url, width) {
  const m = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([0-9a-f])\/([0-9a-f]{2})\/([^/?#]+)$/i.exec(url || "");
  if (!m || !/\.(jpe?g|png|webp|gif)$/i.test(m[3])) return null;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${m[3]}/${width}px-${m[3]}`;
}

// Absolute image URL: Commons originals → 1280px thumbnail, remote URLs as-is,
// site paths (/pub_assets/...: legacy photos, press photos stored on the site,
// logos) → https://www.evlineup.org/...
function absImage(url) {
  if (!url) return `${CANONICAL_HOST}/pub_assets/hero-ev.png`;
  const thumb = commonsThumb(url, 1280);
  if (thumb) return thumb;
  if (/^https?:\/\//i.test(url)) return url;
  return `${CANONICAL_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
}

// A make logo as a page's og:image fallback. Social cards do not render SVG,
// so an SVG logo falls back to the site image.
function logoOgImage(url) {
  return url && !/\.svg(?:[?#].*)?$/i.test(url) ? url : null;
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
      image: absImage(models[0]?.image_url || logoOgImage(make.lrg_logo_img_url)),
      jsonLd,
    }),
    content,
  };
}

/** Home rows from the catalog (US, current, consumer models); null when the catalog is not available. */
async function homeRowsFromCatalog() {
  try {
    const [list, meta] = await Promise.all([
      catalogGet("/catalog/models?market=US&status=current&commercial=false&limit=1000"),
      catalogGet("/catalog/meta").catch(() => null),
    ]);
    const rows = list.models.map((m) => ({
      name: displayName(m.make && m.make.name, m.name),
      url: m.path,
      price: m.from_price && m.from_price.value ? money(m.from_price.value, m.from_price.currency) : null,
      range: m.max_range && m.max_range.value ? rangeText(m.max_range.value, m.max_range.unit, m.max_range.cycle) : null,
      accel: m.quickest_0_60 && m.quickest_0_60.value ? `${m.quickest_0_60.value}s` : null,
    }));
    return {
      rows,
      models: meta && meta.counts ? meta.counts.models : rows.length,
      makes: meta && meta.counts ? meta.counts.makes : null,
      onSale: rows.length,
    };
  } catch (e) {
    return null;
  }
}

async function homeRowsFromLegacy() {
  const res = await fetchWithTimeout(`${API_BASE}/cars/cards`);
  if (!res.ok) return null;
  const cars = await res.json();
  return {
    rows: cars.map((m) => ({
      name: `${m.make_name} ${m.model}`,
      url: `/model_detail/${m.make_model_slug}`,
      price: fmtPrice(m.current_price),
      range: m.epa_range ? `${m.epa_range} mi` : null,
      accel: m.acceleration_0_60 ? `${m.acceleration_0_60}s` : null,
    })),
    models: cars.length,
    makes: 37,
    onSale: cars.length,
  };
}

async function buildHomePage() {
  const data = (await homeRowsFromCatalog()) || (await homeRowsFromLegacy());
  if (!data) return null;
  const top = data.rows.slice(0, 30);
  const nModels = data.models;
  const nMakes = data.makes;
  const fromMakes = nMakes ? ` from ${nMakes} manufacturers` : "";

  const canonical = `${CANONICAL_HOST}/`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: canonical,
      description:
        "Every electric vehicle, current and past: specs, range, price, and charging — compared side by side.",
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: top.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: m.name,
        url: `${CANONICAL_HOST}${m.url}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is EV Lineup?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "EV Lineup is an electric vehicle database: specs, prices and range for electric cars on sale today, plus earlier versions, discontinued and cancelled models, and brands that have gone out of business.",
          },
        },
        {
          "@type": "Question",
          name: "How many electric cars are there?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `We track ${nModels} electric car models${fromMakes}, including sedans, SUVs, trucks, vans and sports cars; ${data.onSale} are on sale in the US.`,
          },
        },
        {
          "@type": "Question",
          name: "What's the cheapest electric car?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "See the electric cars with the lowest US MSRP at https://www.evlineup.org/best/cheapest-evs",
          },
        },
        {
          "@type": "Question",
          name: "Which EV has the longest range?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "See the electric cars with the longest EPA range at https://www.evlineup.org/best/longest-range-evs",
          },
        },
        {
          "@type": "Question",
          name: "What's the fastest electric car?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "See the fastest electric cars ranked by 0-60 mph time at https://www.evlineup.org/best/fastest-evs",
          },
        },
        {
          "@type": "Question",
          name: "Are there 3-row electric SUVs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, several electric SUVs offer 6+ seats with three rows. See them at https://www.evlineup.org/best/3-row-evs",
          },
        },
      ],
    },
  ];

  const rows = top
    .map(
      (m) =>
        `<tr><td><a href="${esc(m.url)}">${esc(m.name)}</a></td><td>${esc(m.price || "—")}</td><td>${esc(m.range || "—")}</td><td>${esc(m.accel || "—")}</td></tr>`
    )
    .join("");

  const content = `${CONTENT_STYLE}<div class="prerender">
  <h1>Every Electric Vehicle, Compared</h1>
  <p class="sub">Specs, range, price, and charging for ${nModels} EV models${fromMakes} — side by side.</p>
  <p><strong>EV Lineup is a database of electric vehicles, current and past.</strong> Compare specs, range, pricing, charging speeds, and performance, and see every earlier version of each model. <a href="/cars">Browse all electric cars</a> or <a href="/make">every maker</a>.</p>
  <h2>Electric Vehicles on Sale in the US</h2>
  <table><tr><th>Model</th><th>From</th><th>Range</th><th>0–60</th></tr>${rows}</table>
  <h2>Frequently Asked Questions</h2>
  <details><summary><strong>What is EV Lineup?</strong></summary><p>EV Lineup is an electric vehicle database: specs, prices and range for electric cars on sale today, plus earlier versions, discontinued and cancelled models, and brands that have gone out of business.</p></details>
  <details><summary><strong>How many electric cars are there?</strong></summary><p>We track ${nModels} electric car models${fromMakes}; ${data.onSale} are on sale in the US.</p></details>
  <details><summary><strong>What's the cheapest electric car?</strong></summary><p><a href="/best/cheapest-evs">See the full list of cheapest electric cars</a>.</p></details>
  <details><summary><strong>Which EV has the longest range?</strong></summary><p><a href="/best/longest-range-evs">See all long-range electric vehicles</a>.</p></details>
  <details><summary><strong>What's the fastest electric car?</strong></summary><p><a href="/best/fastest-evs">See the fastest electric cars ranked</a>.</p></details>
  <details><summary><strong>Are there 3-row electric SUVs?</strong></summary><p><a href="/best/3-row-evs">See all 3-row electric SUVs</a>.</p></details>
</div>`;

  return {
    meta: metaBlock({
      title: `${SITE_NAME} — Every Electric Vehicle, Compared`,
      description: `Browse every electric vehicle, current and past: specs, range, price, and charging for ${nModels} EV models${fromMakes}. Compare models side by side and find your next EV.`,
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

// Legacy compare page (/cars/model-details): used only while the catalog is not migrated.
async function buildLegacyComparePage(pair) {
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

// Mirror of src/data/seoPages.ts — keep slugs and logic in sync. `blurb` describes
// the catalog list (/catalog/best/{key}); filter/sort and `legacyBlurb` are only
// used by the legacy fallback while the catalog is not migrated.
const BEST_CONFIGS = {
  "evs-under-40k": {
    title: "Best EVs Under $40,000",
    blurb: "Every electric vehicle you can buy in the US for under $40k MSRP, cheapest first.",
    legacyBlurb: "Every electric vehicle under $40k MSRP, ranked by review score.",
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
    blurb: "Every EV on sale in the US with six or more seats, ranked by EPA range.",
    legacyBlurb: "Every EV with six or more seats, ranked by review score.",
    filter: (c) => c.availability_desc === "available" && (c.number_of_full_adult_seats ?? 0) >= 6,
    sort: (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0),
  },
  "electric-trucks": {
    title: "Electric Pickup Trucks",
    blurb: "Every electric pickup truck on sale in the US, then the ones coming soon — ranked by EPA range.",
    legacyBlurb: "Every electric pickup truck on the market and coming soon — from work trucks to luxury pickups.",
    filter: (c) => c.vehicle_class?.toLowerCase().includes("pickup") && c.availability_desc !== "discontinued",
    sort: (a, b) => {
      const availOrder = {available: 0, coming_soon: 1, null: 2};
      const aOrder = availOrder[a.availability_desc] ?? 2;
      const bOrder = availOrder[b.availability_desc] ?? 2;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (b.average_rating ?? 0) - (a.average_rating ?? 0);
    },
  },
  "300-mile-range-evs": {
    title: "EVs with 300+ Miles of Range",
    blurb: "Every electric vehicle that goes 300 miles or more on a charge, ranked by EPA range.",
    filter: (c) => c.availability_desc === "available" && (c.epa_range ?? 0) >= 300,
    sort: (a, b) => (b.epa_range ?? 0) - (a.epa_range ?? 0),
    limit: 15,
  },
};

// Legacy best list (/cars/cards): used only while the catalog is not migrated.
async function buildLegacyBestPage(criteria) {
  const cfg = BEST_CONFIGS[criteria];
  if (!cfg) return null;
  const res = await fetchWithTimeout(`${API_BASE}/cars/cards`);
  if (!res.ok) return null;
  const cars = await res.json();
  const ranked = cars.filter(cfg.filter).sort(cfg.sort).slice(0, 12);

  const canonical = `${CANONICAL_HOST}/best/${criteria}`;
  const title = `${cfg.title} (${new Date().getFullYear()}) | ${SITE_NAME}`;
  const blurb = cfg.legacyBlurb || cfg.blurb;
  const description = `${blurb} Generated live from the ${SITE_NAME} database of every EV on the market.`;

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
  <p class="sub">${esc(blurb)}</p>
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

// ---------- catalog pages (/make/..., /cars) ----------
//
// Data from the backend's /catalog/* API (ev_backend/docs/catalog-api.md).
// Figures keep their own unit, test cycle and currency (never converted), and
// JSON-LD never claims InStock.

class HttpError extends Error {
  constructor(status, message) {
    super(message || `HTTP ${status}`);
    this.status = status;
  }
}

/** GET a catalog endpoint; throws HttpError(404 | 503 | 502). */
async function catalogGet(path) {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE}${path}`);
  } catch (e) {
    throw new HttpError(503, "backend timeout or network error");
  }
  if (res.status === 404) throw new HttpError(404);
  if (res.status === 503) throw new HttpError(503, "catalog not migrated");
  if (!res.ok) throw new HttpError(502, `backend ${res.status}`);
  return res.json();
}

const enc = encodeURIComponent;
const abs = (path) => `${CANONICAL_HOST}${path}`;

const STATUS_TEXT = {
  current: "on sale",
  upcoming: "coming soon",
  discontinued: "discontinued",
  cancelled: "cancelled",
};

function displayName(makeName, modelName) {
  const mk = makeName || "";
  const md = modelName || "";
  return md.toLowerCase().startsWith(mk.toLowerCase()) ? md : `${mk} ${md}`.trim();
}

function money(value, currency) {
  if (!value) return null;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(value);
  } catch (e) {
    return `${value} ${currency || ""}`.trim();
  }
}

function rangeText(value, unit, cycle) {
  if (!value) return null;
  return [Math.round(value), unit, cycle].filter(Boolean).join(" ");
}

function yearsText(start, end, status) {
  if (!start && !end) return "";
  if (status === "upcoming") return start ? `due ${start}` : "";
  if (status === "cancelled") return start ? `planned for ${start}` : "";
  if (start && !end) return `${start}–present`;
  if (start === end) return `${start}`;
  return `${start || "?"}–${end || ""}`;
}

function primaryImage(images) {
  if (!images || !images.length) return null;
  return images.find((i) => i.is_primary) || images[0];
}

function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: abs(path),
    })),
  };
}

function crumbsHtml(items) {
  return `<p class="crumbs">${items
    .map(([name, path], i) => (i === items.length - 1 ? esc(name) : `<a href="${esc(path)}">${esc(name)}</a>`))
    .join(" › ")}</p>`;
}

function uniqueSourceUrls(sources) {
  const out = [];
  for (const s of sources || []) if (s && s.url && !out.includes(s.url)) out.push(s.url);
  return out;
}

function webPageLd(canonical, name, dateModified, sources) {
  const urls = uniqueSourceUrls(sources);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name,
    ...(dateModified ? { dateModified: String(dateModified).slice(0, 10) } : {}),
    ...(urls.length ? { isBasedOn: urls.slice(0, 20) } : {}),
  };
}

function imageCreditHtml(img) {
  if (!img || !(img.credit || img.license)) return "";
  const text = esc([img.credit, img.license].filter(Boolean).join(" · "));
  return `<p class="sub">Photo: ${img.page_url ? `<a href="${esc(img.page_url)}" rel="noopener">${text}</a>` : text}</p>`;
}

function heroHtml(img, alt) {
  if (!img || !img.url) return `<p class="sub">No photo of this version yet.</p>`;
  return `<img class="hero" src="${esc(absImage(img.url))}" alt="${esc(img.alt || alt)}" />${imageCreditHtml(img)}`;
}

function sourcesHtml(sources) {
  const urls = [];
  const items = [];
  for (const s of sources || []) {
    if (!s || !s.url || urls.includes(s.url)) continue;
    urls.push(s.url);
    items.push(`<li><a href="${esc(s.url)}" rel="noopener">${esc(s.name || s.url)}</a></li>`);
  }
  return items.length ? `<h2>Sources</h2><ul>${items.join("")}</ul>` : "";
}

function newestOffering(offerings, market) {
  const list = [...(offerings || [])].sort((a, b) => (b.model_year || 0) - (a.model_year || 0));
  return (market && list.find((o) => o.market === market)) || list.find((o) => o.market === "US") || list[0] || null;
}

function variantRowsHtml(variants, market) {
  return (variants || [])
    .map((v) => {
      const o = newestOffering(v.offerings, market);
      const price = o ? money(o.price || o.launch_price, o.currency) : null;
      const range = o ? rangeText(o.range, o.range_unit, o.range_cycle) : null;
      const accel = v.accel_0_60_s ? `${v.accel_0_60_s} s (0–60 mph)` : v.accel_0_100_s ? `${v.accel_0_100_s} s (0–100 km/h)` : null;
      return `<tr><td><a href="${esc(v.path)}">${esc(v.name || v.slug)}</a></td><td>${esc(v.drivetrain || "—")}</td><td>${v.battery_kwh ? esc(v.battery_kwh) + " kWh" : "—"}</td><td>${esc(range || "—")}</td><td>${esc(accel || "—")}</td><td>${esc(price ? `${price}${o.market ? ` (${o.market}${o.model_year ? ` MY${o.model_year}` : ""})` : ""}` : "—")}</td></tr>`;
    })
    .join("");
}

const VARIANT_TABLE_HEAD = "<tr><th>Variant</th><th>Drive</th><th>Battery</th><th>Range</th><th>Acceleration</th><th>Price</th></tr>";

/** schema.org Car for one variant. Offers only for sourced prices; never InStock. */
function variantCarLd(v, ctx) {
  const o = newestOffering(v.offerings, ctx.market);
  const props = [];
  for (const off of v.offerings || []) {
    if (off.range) {
      props.push({
        "@type": "PropertyValue",
        name: `Range (${off.range_cycle || "unspecified cycle"}${off.market ? `, ${off.market}` : ""}${off.model_year ? ` MY${off.model_year}` : ""})`,
        value: off.range,
        unitCode: off.range_unit === "mi" ? "SMI" : off.range_unit === "km" ? "KMT" : undefined,
        measurementTechnique: off.range_cycle || undefined,
      });
    }
  }
  if (v.battery_kwh)
    props.push({ "@type": "PropertyValue", name: `Battery capacity${v.battery_basis ? ` (${v.battery_basis})` : ""}`, value: v.battery_kwh, unitCode: "KWH" });
  if (v.dc_kw) props.push({ "@type": "PropertyValue", name: "Peak DC charging power", value: v.dc_kw, unitCode: "KWT" });
  if (o && o.connector) props.push({ "@type": "PropertyValue", name: "Charging connector", value: o.connector });

  const offers = (v.offerings || [])
    .filter((off) => off.price && off.currency && !off.is_estimate)
    .slice(0, 5)
    .map((off) => ({
      "@type": "Offer",
      price: off.price,
      priceCurrency: off.currency,
      ...(off.market ? { eligibleRegion: off.market === "EU" ? "EU" : off.market === "UK" ? "GB" : off.market } : {}),
      ...(v.status === "discontinued" ? { availability: "https://schema.org/Discontinued" } : {}),
    }));

  return {
    "@type": "Car",
    "@id": abs(v.path) + "#variant",
    name: `${ctx.name} ${v.name || ""}`.trim(),
    url: abs(v.path),
    brand: { "@type": "Brand", name: ctx.makeName },
    ...(ctx.modelPath ? { isVariantOf: { "@id": abs(ctx.modelPath) + "#model" } } : {}),
    ...(ctx.genPath ? { model: { "@id": abs(ctx.genPath) + "#generation" } } : {}),
    vehicleConfiguration: v.name || undefined,
    ...(v.year_from ? { vehicleModelDate: String(v.year_from) } : {}),
    ...(v.body_type ? { bodyType: v.body_type } : {}),
    ...(v.drivetrain ? { driveWheelConfiguration: v.drivetrain } : {}),
    ...(v.seats ? { seatingCapacity: v.seats } : {}),
    fuelType: "Electric",
    ...(v.accel_0_60_s
      ? { accelerationTime: { "@type": "QuantitativeValue", value: v.accel_0_60_s, unitCode: "SEC", valueReference: "0-60 mph" } }
      : v.accel_0_100_s
      ? { accelerationTime: { "@type": "QuantitativeValue", value: v.accel_0_100_s, unitCode: "SEC", valueReference: "0-100 km/h" } }
      : {}),
    ...(props.length ? { additionalProperty: props } : {}),
    ...(offers.length ? { offers } : {}),
    ...(ctx.image ? { image: absImage(ctx.image.url) } : {}),
  };
}

async function buildMakesIndexPage() {
  const data = await catalogGet("/catalog/makes");
  const canonical = abs("/make");
  const groups = { current: [], upcoming: [], discontinued: [], defunct: [] };
  for (const m of data.makes) (groups[m.display_status] || groups.discontinued).push(m);
  const labels = {
    current: "Selling electric cars now",
    upcoming: "Coming soon",
    discontinued: "No electric cars on sale right now",
    defunct: "Defunct or acquired",
  };
  const sections = Object.entries(groups)
    .filter(([, list]) => list.length)
    .map(
      ([k, list]) =>
        `<h2>${esc(labels[k])}</h2><ul>${list
          .map((m) => `<li><a href="${esc(m.path)}">${esc(m.name)}</a>${m.status_date && k === "defunct" ? ` (${esc(m.status)} ${esc(m.status_date)})` : ""}</li>`)
          .join("")}</ul>`
    )
    .join("");
  const content = `${CONTENT_STYLE}<div class="prerender">
  ${crumbsHtml([["Home", "/"], ["Makes", "/make"]])}
  <h1>Electric car makers</h1>
  <p class="sub">${data.count} brands, including the ones that have stopped making electric cars or gone out of business.</p>
  ${sections}
</div>`;
  const jsonLd = [
    breadcrumbLd([["Home", "/"], ["Makes", "/make"]]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Electric car makers",
      itemListElement: data.makes.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.name, url: abs(m.path) })),
    },
  ];
  return {
    meta: metaBlock({
      title: `All Electric Car Makers (${data.count}) | ${SITE_NAME}`,
      description: `Every electric car brand we track: ${data.count} makers, grouped by whether they sell EVs today, are coming soon, or have closed.`,
      canonical,
      image: `${CANONICAL_HOST}/pub_assets/hero-ev.png`,
      jsonLd,
    }),
    content,
  };
}

/** On a 404, an old or alias slug may still resolve (e.g. /make/mercedes → /make/mercedes-benz). */
async function getOrAlias(path, kind, key, selfPath) {
  try {
    return await catalogGet(path);
  } catch (e) {
    if (!(e instanceof HttpError) || e.status !== 404) throw e;
    const r = await resolveLegacy(kind, key);
    if (r.redirect && r.redirect !== selfPath) return { __redirect: r.redirect };
    throw e;
  }
}

async function buildCatalogMakePage(makeSlug) {
  const data = await getOrAlias(`/catalog/makes/${enc(makeSlug)}`, "make", makeSlug, `/make/${makeSlug}`);
  if (data.__redirect) return { redirect: data.__redirect };
  const make = data.make;
  // Legacy or alias slug: send to the canonical one.
  if (make.path !== `/make/${makeSlug}`) return { redirect: make.path };
  const canonical = abs(make.path);
  const all = [...data.models.current, ...data.models.upcoming, ...data.models.discontinued, ...data.models.cancelled];
  const gone = make.status === "defunct" || make.status === "acquired";
  const crumbs = [["Makes", "/make"], [make.name, make.path]];

  const section = (title, list) =>
    list.length
      ? `<h2>${esc(title)}</h2><table><tr><th>Model</th><th>Years</th><th>Status</th><th>From</th><th>Range</th></tr>${list
          .map(
            (m) =>
              `<tr><td><a href="${esc(m.path)}">${esc(m.name)}</a></td><td>${esc(yearsText(m.years && m.years.start, m.years && m.years.end, m.status))}</td><td>${esc(STATUS_TEXT[m.status] || m.status || "")}</td><td>${esc(
                (m.from_price && money(m.from_price.value, m.from_price.currency)) || "—"
              )}</td><td>${esc((m.max_range && rangeText(m.max_range.value, m.max_range.unit, m.max_range.cycle)) || "—")}</td></tr>`
          )
          .join("")}</table>`
      : "";

  const banner = gone
    ? `<p><strong>${esc(make.name)} ${make.status === "acquired" ? "was acquired" : "is no longer in business"}${make.status_date ? ` (${esc(make.status_date)})` : ""}.</strong> ${esc(make.status_details || "")} Its cars are kept here for reference.</p>`
    : "";

  const content = `${CONTENT_STYLE}<div class="prerender">
  ${crumbsHtml(crumbs)}
  <h1>${esc(make.name)} electric cars</h1>
  <p class="sub">${[make.country, make.headquarters, make.founded ? `founded ${make.founded}` : null, make.parent_group ? `part of ${make.parent_group}` : null]
    .filter(Boolean)
    .map(esc)
    .join(" · ")}</p>
  ${banner}
  <p>${esc(make.description || "")}</p>
  ${section("On sale now", data.models.current)}
  ${section("Coming soon", data.models.upcoming)}
  ${section("Discontinued and cancelled", [...data.models.discontinued, ...data.models.cancelled])}
  ${sourcesHtml(make.sources)}
</div>`;

  const brand = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "@id": `${canonical}#brand`,
    name: make.name,
    url: canonical,
    ...(make.logo_url ? { logo: absImage(make.logo_url) } : {}),
    ...(make.description ? { description: make.description } : {}),
    ...(make.website_url ? { sameAs: [make.website_url] } : {}),
  };
  const jsonLd = [brand];
  if (gone) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: make.name,
      url: canonical,
      ...(make.founded ? { foundingDate: String(make.founded) } : {}),
      ...(make.status === "defunct" && make.status_date ? { dissolutionDate: make.status_date } : {}),
      ...(make.status_details ? { description: make.status_details } : {}),
    });
  }
  jsonLd.push({
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: all.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: displayName(make.name, m.name), url: abs(m.path) })),
  });
  jsonLd.push(breadcrumbLd(crumbs));
  jsonLd.push(webPageLd(canonical, `${make.name} electric cars`, null, make.sources));

  const names = data.models.current.slice(0, 4).map((m) => m.name);
  const description = gone
    ? `${make.name} ${make.status === "acquired" ? "was acquired" : "went out of business"}${make.status_date ? ` (${make.status_date})` : ""}. Every ${make.name} electric car it made or announced, with specs and history.`
    : `Every ${make.name} electric car${names.length ? `: ${names.join(", ")}${data.models.current.length > 4 ? " and more" : ""}` : ""}. Specs, range, prices and earlier versions.`;
  const firstImage = all.find((m) => m.image && m.image.url);
  return {
    meta: metaBlock({
      title: `${make.name} Electric Cars: Every Model, Current and Past | ${SITE_NAME}`,
      description,
      canonical,
      image: absImage((firstImage && firstImage.image.url) || logoOgImage(make.logo_url)),
      jsonLd,
    }),
    content,
  };
}

function generationLd(gen, ctx, data, gensNewestFirst) {
  const idx = gensNewestFirst.findIndex((g) => g.slug === gen.slug);
  const newer = idx > 0 ? gensNewestFirst[idx - 1] : null;
  const older = idx >= 0 && idx < gensNewestFirst.length - 1 ? gensNewestFirst[idx + 1] : null;
  const img = primaryImage(gen.images);
  return {
    "@type": "ProductModel",
    "@id": abs(gen.path) + "#generation",
    name: `${ctx.name} ${gen.name || gen.slug}`,
    url: abs(gen.path),
    brand: { "@type": "Brand", name: data.make.name },
    isVariantOf: { "@id": abs(data.model.path) + "#model" },
    ...(gen.start_year ? { productionDate: String(gen.start_year) } : {}),
    ...(gen.description ? { description: gen.description } : {}),
    ...(img && img.url ? { image: absImage(img.url) } : {}),
    // successorOf: the generation this one replaced (older); predecessorOf: the one that replaced it (newer)
    ...(older ? { successorOf: { "@id": abs(older.path) + "#generation" } } : {}),
    ...(newer ? { predecessorOf: { "@id": abs(newer.path) + "#generation" } } : {}),
  };
}

async function buildCatalogModelPage(makeSlug, modelSlug, genSlug) {
  const legacyKey = modelSlug.startsWith(`${makeSlug}-`) ? modelSlug : `${makeSlug}-${modelSlug}`;
  const data = await getOrAlias(
    `/catalog/models/${enc(makeSlug)}/${enc(modelSlug)}`,
    "model",
    legacyKey,
    `/make/${makeSlug}/${modelSlug}`
  );
  if (data.__redirect) return { redirect: genSlug ? `${data.__redirect}/${genSlug}` : data.__redirect };
  const { make, model } = data;
  if (model.path !== `/make/${makeSlug}/${modelSlug}`) {
    return { redirect: genSlug ? `${model.path}/${genSlug}` : model.path };
  }
  const gens = data.generations || [];
  let gen = null;
  if (genSlug) {
    gen = gens.find((g) => g.slug === genSlug);
    if (!gen) {
      // A model year inside a generation → that generation.
      const y = /^\d{4}$/.test(genSlug) ? Number(genSlug) : null;
      const containing =
        y &&
        gens
          .filter((g) => g.status !== "cancelled" && g.start_year && g.start_year <= y && (g.end_year || 9999) >= y)
          .sort((a, b) => b.start_year - a.start_year)[0];
      if (containing) return { redirect: containing.path };
      throw new HttpError(404);
    }
  }
  const def = gens.find((g) => g.slug === data.default_generation) || gens[0] || null;
  const shown = gen || def;
  const name = displayName(make.name, model.name);
  const isGenPage = !!gen;
  const path = isGenPage ? gen.path : model.path;
  // The default generation is shown on the model page, so its page points there.
  const canonical = abs(isGenPage && !gen.is_default ? gen.path : model.path);
  const img = shown ? primaryImage(shown.images) : null;
  const h = data.headline || {};
  const crumbs = [["Makes", "/make"], [make.name, make.path], [model.name, model.path]];
  if (isGenPage) crumbs.push([gen.name || gen.slug, gen.path]);
  const gone = make.status === "defunct" || make.status === "acquired";
  const market = h.market || null;
  const ctx = { name, makeName: make.name, modelPath: model.path, market, image: img };

  // Headline figures name their variant and test cycle.
  const figures = [];
  if (!isGenPage && h.from_price && h.from_price.value)
    figures.push(
      `from ${money(h.from_price.value, h.from_price.currency)} (${[h.from_price.market, h.from_price.model_year ? `MY${h.from_price.model_year}` : null, h.from_price.variant && h.from_price.variant.name]
        .filter(Boolean)
        .join(", ")})`
    );
  if (!isGenPage && h.max_range && h.max_range.value)
    figures.push(`up to ${rangeText(h.max_range.value, h.max_range.unit, h.max_range.cycle)} (${(h.max_range.variant && h.max_range.variant.name) || ""})`);
  if (!isGenPage && h.quickest_0_60 && h.quickest_0_60.value)
    figures.push(`0–60 mph in ${h.quickest_0_60.value} s (${(h.quickest_0_60.variant && h.quickest_0_60.variant.name) || ""})`);

  const statusLine = [
    STATUS_TEXT[(isGenPage ? gen.status : model.status)] || null,
    isGenPage ? yearsText(gen.start_year, gen.end_year, gen.status) : yearsText(model.years && model.years.start, model.years && model.years.end, model.status),
    gone ? `${make.name} is ${make.status === "acquired" ? "acquired" : "defunct"}${make.status_date ? ` since ${make.status_date}` : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const earlier = isGenPage ? [] : gens.filter((g) => def && g.slug !== def.slug);
  const earlierHtml = earlier.length
    ? `<h2>Every version</h2><ul>${earlier
        .map(
          (g) =>
            `<li><a href="${esc(g.path)}">${esc(g.name || g.slug)}</a> (${esc(yearsText(g.start_year, g.end_year, g.status))}, ${esc(STATUS_TEXT[g.status] || "")})${g.description ? `: ${esc(g.description)}` : ""}</li>`
        )
        .join("")}</ul>`
    : "";

  const offeringsHtml = isGenPage
    ? (() => {
        const rows = (gen.variants || []).flatMap((v) =>
          (v.offerings || []).map(
            (o) =>
              `<tr><td>${esc(o.market || "")}</td><td>${esc(o.model_year || "current")}</td><td><a href="${esc(v.path)}">${esc(v.name || v.slug)}</a></td><td>${esc(money(o.price, o.currency) || "—")}</td><td>${esc(money(o.launch_price, o.currency) || "—")}</td><td>${esc(rangeText(o.range, o.range_unit, o.range_cycle) || "—")}</td></tr>`
          )
        );
        return rows.length
          ? `<h2>Prices and ranges by market and model year</h2><table><tr><th>Market</th><th>Model year</th><th>Variant</th><th>Price</th><th>Launch price</th><th>Range</th></tr>${rows.join("")}</table>`
          : "";
      })()
    : "";

  const relHtml = (data.relations || []).length
    ? `<h2>Related</h2><ul>${data.relations
        .map((r) => `<li>${esc({ twin: "Twin", successor: "Replaced by", predecessor: "Replaces" }[r.relation] || r.relation)}: <a href="${esc(r.model.path)}">${esc(displayName(r.model.make && r.model.make.name, r.model.name))}</a></li>`)
        .join("")}</ul>`
    : "";

  const sources = [
    ...(isGenPage ? [] : model.sources || []),
    ...(shown ? [...(shown.sources || []), ...(shown.variants || []).flatMap((v) => v.sources || [])] : []),
  ];

  const h1 = isGenPage ? `${name} ${gen.name || gen.slug}` : name;
  const content = `${CONTENT_STYLE}<div class="prerender">
  ${crumbsHtml(crumbs)}
  <h1>${esc(h1)}</h1>
  <p class="sub">${esc(statusLine)}</p>
  ${gone ? `<p><strong>${esc(make.status_details || "")}</strong></p>` : ""}
  ${heroHtml(img, h1)}
  ${figures.length ? `<p>${esc(figures.join(" · "))}</p>` : ""}
  <p>${esc(isGenPage ? gen.description || "" : model.description || "")}</p>
  ${shown && (shown.variants || []).length ? `<h2>${esc(isGenPage || gens.length < 2 ? "Variants" : `${shown.name || shown.slug} variants`)}</h2><table>${VARIANT_TABLE_HEAD}${variantRowsHtml(shown.variants, market)}</table>` : ""}
  ${offeringsHtml}
  ${earlierHtml}
  ${relHtml}
  ${sourcesHtml(sources)}
  ${data.updated_at ? `<p class="sub">Last updated ${esc(String(data.updated_at).slice(0, 10))}</p>` : ""}
</div>`;

  const jsonLd = [];
  if (isGenPage) {
    jsonLd.push({
      "@context": "https://schema.org",
      ...generationLd(gen, ctx, data, gens),
      hasVariant: undefined,
    });
    jsonLd.push({
      "@context": "https://schema.org",
      "@graph": (gen.variants || []).map((v) => variantCarLd(v, { ...ctx, genPath: gen.path })),
    });
  } else {
    const twins = (data.relations || []).filter((r) => r.relation === "twin");
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ProductGroup",
      "@id": abs(model.path) + "#model",
      name,
      url: abs(model.path),
      productGroupID: model.key,
      brand: { "@type": "Brand", name: make.name, url: abs(make.path) },
      ...(model.description ? { description: model.description } : {}),
      ...(img && img.url ? { image: absImage(img.url) } : {}),
      variesBy: ["https://schema.org/vehicleModelDate", "https://schema.org/vehicleConfiguration"],
      hasVariant: def ? (def.variants || []).map((v) => variantCarLd(v, { ...ctx, genPath: def.path })) : [],
      ...(twins.length ? { isSimilarTo: twins.map((r) => ({ "@type": "ProductGroup", name: displayName(r.model.make && r.model.make.name, r.model.name), url: abs(r.model.path) })) } : {}),
    });
    jsonLd.push({ "@context": "https://schema.org", "@graph": gens.map((g) => generationLd(g, ctx, data, gens)) });
    // FAQ from offering values that name their test cycle and market.
    const faq = [];
    if (h.max_range && h.max_range.value)
      faq.push({
        "@type": "Question",
        name: `What is the range of the ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Up to ${rangeText(h.max_range.value, h.max_range.unit, h.max_range.cycle)} (${(h.max_range.variant && h.max_range.variant.name) || "best variant"}${h.max_range.market ? `, ${h.max_range.market}` : ""}${h.max_range.model_year ? ` model year ${h.max_range.model_year}` : ""}).`,
        },
      });
    if (h.from_price && h.from_price.value)
      faq.push({
        "@type": "Question",
        name: `How much does the ${name} cost?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `From ${money(h.from_price.value, h.from_price.currency)} (${(h.from_price.variant && h.from_price.variant.name) || "base variant"}${h.from_price.market ? `, ${h.from_price.market}` : ""}${h.from_price.model_year ? ` model year ${h.from_price.model_year}` : ""}${h.from_price.basis ? `, ${h.from_price.basis.replace(/_/g, " ")}` : ""}${h.from_price.is_estimate ? ", manufacturer estimate" : ""}).`,
        },
      });
    if (faq.length) jsonLd.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq });
  }
  jsonLd.push(breadcrumbLd(crumbs));
  jsonLd.push(webPageLd(abs(path), h1, data.updated_at, sources));

  const descBits = [];
  if (isGenPage) {
    descBits.push(`${name} ${gen.name || gen.slug} (${yearsText(gen.start_year, gen.end_year, gen.status)})`);
    if (gen.description) descBits.push(gen.description);
  } else {
    descBits.push(`${name}${statusLine ? ` (${statusLine})` : ""}`);
    if (figures.length) descBits.push(figures.join(", "));
    if (gens.length > 1) descBits.push(`All ${gens.length} versions with specs and prices`);
  }
  return {
    meta: metaBlock({
      title: isGenPage
        ? `${name} ${gen.name || gen.slug} (${yearsText(gen.start_year, gen.end_year, gen.status)}): Specs & Prices | ${SITE_NAME}`
        : `${name}: Specs, Range, Price & Every Version | ${SITE_NAME}`,
      description: descBits.join(". ").slice(0, 300),
      canonical,
      image: absImage(img && img.url),
      ogType: "product",
      jsonLd,
    }),
    content,
  };
}

async function buildCatalogVariantPage(makeSlug, modelSlug, genSlug, variantSlug) {
  const data = await catalogGet(`/catalog/variants/${[makeSlug, modelSlug, genSlug, variantSlug].map(enc).join("/")}`);
  const { make, model, generation: gen, variant: v } = data;
  if (v.path !== `/make/${makeSlug}/${modelSlug}/${genSlug}/${variantSlug}`) return { redirect: v.path };
  const name = displayName(make.name, model.name);
  const title = `${name} ${v.name || v.slug}`;
  const canonical = abs(v.path);
  const img = primaryImage(gen.images);
  const crumbs = [["Makes", "/make"], [make.name, make.path], [model.name, model.path], [gen.name || gen.slug, gen.path], [v.name || v.slug, v.path]];
  const o = newestOffering(v.offerings, "US");

  const offerRows = [...(v.offerings || [])]
    .map(
      (off) =>
        `<tr><td>${esc(off.market || "")}</td><td>${esc(off.model_year || "current")}</td><td>${esc(money(off.price, off.currency) || "—")}</td><td>${esc(money(off.launch_price, off.currency) || "—")}</td><td>${esc(rangeText(off.range, off.range_unit, off.range_cycle) || "—")}</td><td>${esc(off.connector || "—")}</td></tr>`
    )
    .join("");

  const content = `${CONTENT_STYLE}<div class="prerender">
  ${crumbsHtml(crumbs)}
  <h1>${esc(title)}</h1>
  <p class="sub">${esc([gen.name, yearsText(gen.start_year, gen.end_year, gen.status), STATUS_TEXT[v.status]].filter(Boolean).join(" · "))}</p>
  ${make.status === "defunct" || make.status === "acquired" ? `<p><strong>${esc(make.name)} is ${make.status === "acquired" ? "acquired" : "defunct"}${make.status_date ? ` since ${esc(make.status_date)}` : ""}.</strong> ${esc(make.status_details || "")}</p>` : ""}
  ${heroHtml(img, title)}
  <h2>Specifications</h2>
  <table>
    ${specRow("Drivetrain", v.drivetrain)}
    ${specRow("Seats", v.seats)}
    ${specRow("Battery", v.battery_kwh ? `${v.battery_kwh} kWh${v.battery_basis ? ` (${v.battery_basis})` : ""}` : null)}
    ${specRow("Power", v.power_hp, " hp")}
    ${specRow("Torque", v.torque_lbft, " lb-ft")}
    ${specRow("0–60 mph", v.accel_0_60_s, " s")}
    ${specRow("0–100 km/h", v.accel_0_100_s, " s")}
    ${specRow("Top speed", v.top_speed_mph, " mph")}
    ${specRow("Peak DC charging", v.dc_kw, " kW")}
  </table>
  ${offerRows ? `<h2>Prices and range by market</h2><table><tr><th>Market</th><th>Model year</th><th>Price</th><th>Launch price</th><th>Range</th><th>Connector</th></tr>${offerRows}</table>` : ""}
  ${sourcesHtml(v.sources)}
  ${v.updated_at ? `<p class="sub">Last updated ${esc(String(v.updated_at).slice(0, 10))}</p>` : ""}
</div>`;

  const jsonLd = [
    { "@context": "https://schema.org", ...variantCarLd(v, { name, makeName: make.name, modelPath: model.path, genPath: gen.path, market: "US", image: img }) },
    breadcrumbLd(crumbs),
    webPageLd(canonical, title, v.updated_at, v.sources),
  ];
  const bits = [title, gen.name ? `(${gen.name})` : null].filter(Boolean).join(" ");
  const facts = [
    o && o.range ? `${rangeText(o.range, o.range_unit, o.range_cycle)} range` : null,
    o && (o.price || o.launch_price) ? `${money(o.price || o.launch_price, o.currency)}${o.market ? ` ${o.market}` : ""}` : null,
    v.accel_0_60_s ? `0–60 mph in ${v.accel_0_60_s} s` : null,
    v.battery_kwh ? `${v.battery_kwh} kWh battery` : null,
  ].filter(Boolean);
  return {
    meta: metaBlock({
      title: `${title} (${gen.name || gen.slug}): Full Specs | ${SITE_NAME}`,
      description: `${bits}${facts.length ? `: ${facts.join(", ")}` : ""}. Full specifications, prices by market and sources.`,
      canonical,
      image: absImage(img && img.url),
      ogType: "product",
      jsonLd,
    }),
    content,
  };
}

async function buildAllCarsPage() {
  const data = await catalogGet("/catalog/models?limit=1000");
  const canonical = abs("/cars");
  const rows = data.models
    .map(
      (m) =>
        `<tr><td><a href="${esc(m.path)}">${esc(displayName(m.make && m.make.name, m.name))}</a></td><td>${esc(yearsText(m.years && m.years.start, m.years && m.years.end, m.status))}</td><td>${esc(STATUS_TEXT[m.status] || "")}</td><td>${esc((m.from_price && money(m.from_price.value, m.from_price.currency)) || "—")}</td><td>${esc((m.max_range && rangeText(m.max_range.value, m.max_range.unit, m.max_range.cycle)) || "—")}</td></tr>`
    )
    .join("");
  const content = `${CONTENT_STYLE}<div class="prerender">
  ${crumbsHtml([["Home", "/"], ["All electric cars", "/cars"]])}
  <h1>All electric cars</h1>
  <p class="sub">Every battery-electric model we track, on sale or not: ${data.count} models.</p>
  <table><tr><th>Model</th><th>Years</th><th>Status</th><th>From</th><th>Range</th></tr>${rows}</table>
</div>`;
  return {
    meta: metaBlock({
      title: `All Electric Cars: ${data.count} Models, Current and Past | ${SITE_NAME}`,
      description: `Browse all ${data.count} electric car models: on sale, coming soon, discontinued and cancelled, with prices and ranges as published in each market.`,
      canonical,
      image: `${CANONICAL_HOST}/pub_assets/hero-ev.png`,
      jsonLd: [
        breadcrumbLd([["Home", "/"], ["All electric cars", "/cars"]]),
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          numberOfItems: data.count,
          itemListElement: data.models.slice(0, 200).map((m, i) => ({ "@type": "ListItem", position: i + 1, url: abs(m.path) })),
        },
      ],
    }),
    content,
  };
}

/**
 * Legacy URL → 301 to the catalog page via BE /catalog/resolve.
 * Hit: 301. Miss: 404. Backend error: 503. Catalog not migrated yet (503 from
 * the BE): serve the legacy page as before.
 */
async function resolveLegacy(kind, key) {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE}/catalog/resolve?kind=${enc(kind)}&key=${enc(String(key).toLowerCase())}`);
  } catch (e) {
    return { error: 503 };
  }
  if (res.status === 404) return { notFound: true };
  if (res.status === 503) {
    const body = await res.json().catch(() => null);
    // Only the "not migrated" answer means fall back; other 503s are outages.
    if (body && /migration/i.test(String(body.detail || ""))) return { fallback: true };
    return { error: 503 };
  }
  if (!res.ok) return { error: 503 };
  const data = await res.json();
  return data && data.path ? { redirect: data.path } : { notFound: true };
}

function noindex(meta) {
  return `${meta}\n    <meta name="robots" content="noindex" />`;
}

// ---------- best lists and compare pages from the catalog ----------
//
// /best/{key} reads /catalog/best/{key}; /compare/{a}-vs-{b} resolves each slug
// and reads /catalog/models/{make}/{model}. A real 404 stays a 404; anything
// else (not migrated = 503, backend trouble) falls back to the legacy builder.

const BEST_METRIC_CAPTION = { price: "Lowest price", range: "Longest range", accel: "Quickest 0–60" };

function num(v, digits = 1) {
  if (v === null || v === undefined) return null;
  return Number(Number(v).toFixed(digits)).toLocaleString("en-US");
}

function bestRankedText(item, metric) {
  const m = item.model || {};
  if (item.value === null || item.value === undefined) return null;
  if (metric === "price") {
    const est = m.from_price && m.from_price.is_estimate && m.from_price.value === item.value ? " (est.)" : "";
    const t = money(item.value, item.unit);
    return t ? t + est : null;
  }
  if (metric === "range") {
    const r = m.max_range;
    const same = r && r.value === item.value && r.unit === item.unit;
    return rangeText(item.value, item.unit, same ? r.cycle : null);
  }
  return `${num(item.value, 2)} ${item.unit || "s"}`;
}

async function buildBestPage(criteria) {
  const cfg = BEST_CONFIGS[criteria];
  if (!cfg) return null;
  let data;
  try {
    data = await catalogGet(`/catalog/best/${enc(criteria)}${cfg.limit ? `?limit=${cfg.limit}` : ""}`);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    return buildLegacyBestPage(criteria);
  }
  const items = (data && data.items) || [];
  const metric = data.metric;

  const canonical = `${CANONICAL_HOST}/best/${criteria}`;
  const title = `${cfg.title} (${new Date().getFullYear()}) | ${SITE_NAME}`;
  const description = `${cfg.blurb} Generated live from the ${SITE_NAME} database of every EV on the market.`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: cfg.title,
      numberOfItems: items.length,
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: it.rank || i + 1,
        name: displayName(it.model.make && it.model.make.name, it.model.name),
        url: abs(it.model.path),
      })),
    },
    breadcrumbLd([
      ["All EVs", "/"],
      [cfg.title, `/best/${criteria}`],
    ]),
  ];

  const rows = items
    .map((it, i) => {
      const m = it.model;
      const name = displayName(m.make && m.make.name, m.name);
      const status = m.market_status || m.status;
      const fp = m.from_price;
      const price = fp && fp.value ? `${money(fp.value, fp.currency)}${fp.is_estimate ? " (est.)" : ""}` : null;
      const r = m.max_range;
      const range = r ? rangeText(r.value, r.unit, r.cycle) : null;
      const q = m.quickest_0_60;
      const accel = q && q.value ? `${num(q.value, 2)} s` : null;
      const ranked = bestRankedText(it, metric);
      const trim =
        it.variant && ranked
          ? `${esc(BEST_METRIC_CAPTION[metric] || "Figure")}: <a href="${esc(it.variant.path)}">${esc(it.variant.name || it.variant.slug)}</a>`
          : "—";
      return `<tr><td>${it.rank || i + 1}</td><td><a href="${esc(m.path)}">${esc(name)}</a>${
        status && status !== "current" ? ` (${esc(STATUS_TEXT[status] || status)})` : ""
      }</td><td>${esc(price || "—")}</td><td>${esc(range || "—")}</td><td>${esc(accel || "—")}</td><td>${trim}</td></tr>`;
    })
    .join("");

  const content = `${CONTENT_STYLE}<div class="prerender">
  <p class="crumbs"><a href="/">All EVs</a> › Rankings</p>
  <h1>${esc(cfg.title)}</h1>
  <p class="sub">${esc(cfg.blurb)}</p>
  <table><tr><th>#</th><th>Model</th><th>From</th><th>Range</th><th>0–60</th><th>Trim</th></tr>${rows}</table>
  <p class="sub">US figures: price is the lowest current US MSRP (some makers include destination, some do not) and range is EPA. Each ranked figure names the trim it comes from.</p>
  <p><a href="/cars">Browse all electric vehicles →</a></p>
</div>`;

  const first = items.find((it) => it.model && it.model.image && it.model.image.url);
  return {
    meta: metaBlock({
      title,
      description,
      canonical,
      image: absImage(first && first.model.image.url),
      jsonLd,
    }),
    content,
  };
}

/** A model by API slug (legacy slugs too) → full /catalog/models tree. Throws HttpError. */
async function catalogModelBySlug(slug) {
  const r = await catalogGet(`/catalog/resolve?kind=model&key=${enc(String(slug).toLowerCase())}`);
  const m = /^\/make\/([^/]+)\/([^/]+)$/.exec((r && r.path) || "");
  if (!m) throw new HttpError(404);
  return catalogGet(`/catalog/models/${m[1]}/${m[2]}`);
}

/** Current version (default generation), headline market (US where sold, else main market), its trims. */
function compareSide(data) {
  const gens = data.generations || [];
  const gen = gens.find((g) => g.is_default) || gens.find((g) => g.slug === data.default_generation) || gens[0] || null;
  const market = (data.headline && data.headline.market) || (data.model.markets && data.model.markets[0] && data.model.markets[0].market) || null;
  const all = ((gen && gen.variants) || []).filter((v) => v.status !== "cancelled");
  const inMarket = market ? all.filter((v) => (v.offerings || []).some((o) => o.market === market)) : [];
  return {
    data,
    name: displayName(data.make && data.make.name, data.model.name),
    gen,
    market,
    variants: inMarket.length ? inMarket : all,
  };
}

function bestSpec(side, field, fmt, groupOf) {
  let top = null;
  for (const v of side.variants) {
    const n = v[field];
    if (n !== null && n !== undefined && (top === null || n > top[field])) top = v;
  }
  if (!top) return { text: null, value: null };
  return { text: fmt(top[field], top), value: top[field], group: groupOf ? groupOf(top) : "", variant: top };
}

const CATALOG_COMPARE_ROWS = [
  ["Starting price", "low", (s) => {
    const p = s.data.headline && s.data.headline.from_price;
    if (!p || !p.value) return { text: null, value: null };
    return { text: `${money(p.value, p.currency)}${p.is_estimate ? " (est.)" : ""}`, value: p.value, group: p.currency || "", variant: p.variant };
  }],
  ["Range", "high", (s) => {
    const r = s.data.headline && s.data.headline.max_range;
    if (!r || !r.value) return { text: null, value: null };
    return { text: `${rangeText(r.value, r.unit, r.cycle)}${r.is_estimate ? " (est.)" : ""}`, value: r.value, group: `${r.unit}|${r.cycle}`, variant: r.variant };
  }],
  ["0–60 mph", "low", (s) => {
    const q = s.data.headline && s.data.headline.quickest_0_60;
    return q && q.value ? { text: `${num(q.value, 2)} s`, value: q.value, group: "", variant: q.variant } : { text: null, value: null };
  }],
  ["0–100 km/h", "low", (s) => {
    const q = s.data.headline && s.data.headline.quickest_0_100;
    return q && q.value ? { text: `${num(q.value, 2)} s`, value: q.value, group: "", variant: q.variant } : { text: null, value: null };
  }],
  ["Top speed", "high", (s) => bestSpec(s, "top_speed_mph", (n) => `${num(n)} mph`)],
  ["Power", "high", (s) => bestSpec(s, "power_hp", (n) => `${num(n, 0)} hp`)],
  ["Battery", "high", (s) => bestSpec(s, "battery_kwh", (n, v) => `${num(n)} kWh${v.battery_basis ? ` (${v.battery_basis})` : ""}`, (v) => v.battery_basis || "")],
  ["Max DC charging", "high", (s) => bestSpec(s, "dc_kw", (n) => `${num(n, 0)} kW`)],
  ["Seats", "none", (s) => {
    const seats = [...new Set(s.variants.map((v) => v.seats).filter(Boolean))].sort((a, b) => a - b);
    return { text: seats.length ? seats.join(" / ") : null, value: null };
  }],
  ["Drive", "none", (s) => {
    const d = [...new Set(s.variants.map((v) => v.drivetrain).filter(Boolean))];
    return { text: d.length ? d.join(", ") : null, value: null };
  }],
];

function compareWinner(better, fa, fb) {
  if (better === "none" || !fa.value || !fb.value || fa.value === fb.value) return -1;
  if ((fa.group || "") !== (fb.group || "")) return -1; // different currency / test cycle / battery basis
  if (better === "high") return fa.value > fb.value ? 0 : 1;
  return fa.value < fb.value ? 0 : 1;
}

async function buildComparePage(pair) {
  const [slugA, slugB] = String(pair).split("-vs-");
  if (!slugA || !slugB) return null;
  let A, B;
  try {
    [A, B] = await Promise.all([catalogModelBySlug(slugA), catalogModelBySlug(slugB)]);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    return buildLegacyComparePage(pair);
  }
  // Canonical pair: current model slugs in alphabetical order (design 5); other forms 301.
  const canon = [A.model.slug, B.model.slug].sort().join("-vs-");
  if (canon !== pair) return { redirect: `/compare/${canon}` };

  const sides = [compareSide(A), compareSide(B)];
  const [nameA, nameB] = sides.map((s) => s.name);
  const canonical = `${CANONICAL_HOST}/compare/${canon}`;
  const rows = CATALOG_COMPARE_ROWS.map(([label, better, get]) => ({ label, better, figs: sides.map(get) })).filter(
    (r) => r.figs[0].text || r.figs[1].text
  );
  const byLabel = Object.fromEntries(rows.map((r) => [r.label, r]));

  const descParts = [];
  const faq = [];
  const range = byLabel["Range"];
  if (range && range.figs[0].value && range.figs[1].value && range.figs[0].group === range.figs[1].group) {
    descParts.push(`${range.figs[0].text} vs ${range.figs[1].text} range`);
    const w = compareWinner("high", range.figs[0], range.figs[1]);
    if (w !== -1) {
      const [wf, lf] = [range.figs[w], range.figs[1 - w]];
      faq.push({
        "@type": "Question",
        name: `Which has more range, the ${nameA} or the ${nameB}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The ${sides[w].name} goes further: up to ${wf.text} (${(wf.variant && wf.variant.name) || "best trim"}) vs ${lf.text} (${(lf.variant && lf.variant.name) || "best trim"}) for the ${sides[1 - w].name}.`,
        },
      });
    }
  }
  const price = byLabel["Starting price"];
  if (price && price.figs[0].value && price.figs[1].value && price.figs[0].group === price.figs[1].group) {
    descParts.push(`from ${price.figs[0].text} vs ${price.figs[1].text}`);
    const w = compareWinner("low", price.figs[0], price.figs[1]);
    if (w !== -1) {
      const mkt = sides[w].market === sides[1 - w].market && sides[w].market ? ` (${sides[w].market} prices)` : "";
      faq.push({
        "@type": "Question",
        name: `Which is cheaper, the ${nameA} or the ${nameB}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The ${sides[w].name} starts lower at ${price.figs[w].text} vs ${price.figs[1 - w].text}${mkt}.`,
        },
      });
    }
  }
  const title = `${nameA} vs ${nameB}: Price, Range & 0-60 Compared | ${SITE_NAME}`;
  const description = `${nameA} vs ${nameB} side by side${descParts.length ? `: ${descParts.join(", ")}.` : "."} Full spec comparison of the current versions on ${SITE_NAME}.`;

  const images = sides.map((s) => primaryImage(s.gen && s.gen.images));
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${nameA} vs ${nameB}`,
      itemListElement: sides.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Car",
          name: s.name,
          brand: { "@type": "Brand", name: (s.data.make && s.data.make.name) || "" },
          ...(images[i] && images[i].url ? { image: absImage(images[i].url) } : {}),
          url: abs(s.data.model.path),
          fuelType: "Electric",
        },
      })),
    },
  ];
  if (faq.length) jsonLd.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq });

  const cell = (f, win) =>
    `<td>${esc(f.text || "—")}${win ? " ✓" : ""}${
      f.text && f.variant && f.variant.path ? `<br><small><a href="${esc(f.variant.path)}">${esc(f.variant.name || f.variant.slug)}</a></small>` : ""
    }</td>`;
  const rowsHtml = rows
    .map((r) => {
      const w = compareWinner(r.better, r.figs[0], r.figs[1]);
      return `<tr><th>${esc(r.label)}</th>${cell(r.figs[0], w === 0)}${cell(r.figs[1], w === 1)}</tr>`;
    })
    .join("");
  const head = sides
    .map((s, i) => {
      const img = images[i];
      const years = s.gen ? yearsText(s.gen.start_year, s.gen.end_year, s.gen.status) : "";
      const gen = s.gen ? `<br><small><a href="${esc(s.gen.path)}">${esc([s.gen.name, years].filter(Boolean).join(" · "))}</a></small>` : "";
      const pic = img && img.url
        ? `<img src="${esc(absImage(img.url))}" alt="${esc(img.alt || s.name)}" width="220" style="max-width:100%;border-radius:8px" /><br>`
        : "";
      const status = s.data.model.status && s.data.model.status !== "current" ? ` (${esc(STATUS_TEXT[s.data.model.status] || s.data.model.status)})` : "";
      return `<th>${pic}<a href="${esc(s.data.model.path)}">${esc(s.name)}</a>${status}${gen}${s.market ? `<br><small>${esc(s.market)} figures</small>` : ""}</th>`;
    })
    .join("");
  const credits = images.map(imageCreditHtml).filter(Boolean).join("");

  const content = `${CONTENT_STYLE}<div class="prerender">
  <p class="crumbs"><a href="/">All EVs</a> › Compare</p>
  <h1>${esc(nameA)} vs ${esc(nameB)}</h1>
  <p class="sub">Side-by-side specs of the current version of each car from the live ${SITE_NAME} database, in the US where it is sold there, else its main market. Each figure names the trim it comes from; prices in different currencies and ranges on different test cycles are not compared.</p>
  <table>
    <tr><th></th>${head}</tr>
    ${rowsHtml}
  </table>
  ${credits}
  <p><a href="${esc(A.model.path)}">${esc(nameA)} details</a> · <a href="${esc(B.model.path)}">${esc(nameB)} details</a> · <a href="/cars">Browse all electric vehicles →</a></p>
</div>`;

  return {
    meta: metaBlock({
      title,
      description,
      canonical,
      image: absImage(images[0] && images[0].url ? images[0].url : images[1] && images[1].url),
      jsonLd,
    }),
    content,
  };
}

// ---------- handler ----------

export default async function handler(req, res) {
  const q = req.query || {};
  const { page, slug } = q;
  let template;
  try {
    template = await getTemplate(req.headers.host);
  } catch (e) {
    // Can't even get the shell — minimal hard fallback
    res.status(200).setHeader("Content-Type", "text/html").send("<!DOCTYPE html><html><body>EV Lineup</body></html>");
    return;
  }

  const redirect = (location) =>
    res
      .status(301)
      .setHeader("Location", location)
      .setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800")
      .send("");

  let built = null;
  let status = 200;
  let retryAfter = false;
  // Old routes: 301 to the catalog page; fall back to the old page only while
  // the catalog is not migrated on the backend.
  let legacyPage = page;
  if (page === "legacy") {
    const kind = q.kind;
    const key = String(slug || "").replace(/\/+$/, "");
    if (!["model", "make", "variant"].includes(kind) || !key) {
      status = 404;
    } else {
      const r = await resolveLegacy(kind, key);
      if (r.redirect) return redirect(r.redirect);
      if (r.notFound) status = 404;
      else if (r.error) {
        status = 503;
        retryAfter = true;
      } else if (r.fallback) legacyPage = kind === "model" ? "model" : kind === "make" ? "make" : "variant-legacy";
    }
  }

  const CATALOG_PAGES = ["makes", "catalog-make", "catalog-model", "catalog-generation", "catalog-variant", "cars"];
  try {
    if (status === 200) {
      if (legacyPage === "model" && slug) built = await buildModelPage(slug);
      else if (legacyPage === "make" && slug) built = await buildMakePage(slug);
      else if (page === "compare" && slug) built = await buildComparePage(slug);
      else if (page === "best" && slug) built = await buildBestPage(slug);
      else if (page === "home") built = await buildHomePage();
      else if (page === "makes") built = await buildMakesIndexPage();
      else if (page === "cars") built = await buildAllCarsPage();
      else if (page === "catalog-make" && q.make) built = await buildCatalogMakePage(q.make);
      else if (page === "catalog-model" && q.make && q.model) built = await buildCatalogModelPage(q.make, q.model, null);
      else if (page === "catalog-generation" && q.make && q.model && q.generation)
        built = await buildCatalogModelPage(q.make, q.model, q.generation);
      else if (page === "catalog-variant" && q.make && q.model && q.generation && q.variant)
        built = await buildCatalogVariantPage(q.make, q.model, q.generation, q.variant);
      if (built && built.redirect) return redirect(built.redirect);
      if (["model", "make", "compare", "best"].includes(legacyPage) && !built) status = 404;
    }
  } catch (e) {
    built = null;
    if (CATALOG_PAGES.includes(page) && e instanceof HttpError) {
      // Catalog pages: real 404s; backend trouble (incl. not migrated) is a 503 so
      // crawlers retry instead of indexing an empty shell.
      status = e.status === 404 ? 404 : 503;
      retryAfter = status === 503;
    }
    // Other pages fail open: serve the untouched shell.
  }

  let html = template;
  if (built) {
    html = html.replace(
      /<!-- meta:start[\s\S]*?meta:end -->/,
      `<!-- meta:start -->\n    ${built.meta}\n    <!-- meta:end -->`
    );
    html = html.replace('<div id="root"></div>', `<div id="root">${built.content}</div>`);
  } else if (status === 404) {
    html = html.replace(
      /<!-- meta:start[\s\S]*?meta:end -->/,
      `<!-- meta:start -->\n    ${noindex(`<title>Page not found | ${SITE_NAME}</title>`)}\n    <!-- meta:end -->`
    );
  }

  res.status(status).setHeader("Content-Type", "text/html; charset=utf-8");
  if (retryAfter) res.setHeader("Retry-After", "300");
  res
    .setHeader(
      "Cache-Control",
      built
        ? "public, s-maxage=3600, stale-while-revalidate=86400"
        : status === 503
        ? "no-store"
        : "public, s-maxage=60"
    )
    .send(html);
}
