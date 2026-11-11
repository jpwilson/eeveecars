// Display helpers for catalog data. Values are never converted between units or
// currencies: a figure is shown with the unit, cycle and currency it was stored with.
import { CatalogStatus, MakeDisplayStatus, Offering, PriceFigure, RangeFigure, Years } from "../types/catalog";

export const MARKET_LABELS: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  EU: "Europe",
  UK: "United Kingdom",
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
  IN: "India",
  AU: "Australia",
};

export const MARKET_ORDER = ["US", "CA", "EU", "UK", "CN", "JP", "KR", "AU", "IN"];

export const STATUS_LABELS: Record<CatalogStatus, string> = {
  current: "On sale",
  upcoming: "Coming soon",
  discontinued: "Discontinued",
  cancelled: "Cancelled",
};

export const STATUS_COLOR_SCHEME: Record<CatalogStatus, string> = {
  current: "green",
  upcoming: "blue",
  discontinued: "gray",
  cancelled: "red",
};

export const MAKE_GROUP_LABELS: Record<MakeDisplayStatus, string> = {
  current: "Selling electric cars now",
  upcoming: "Coming soon",
  discontinued: "No electric cars on sale right now",
  defunct: "Defunct or acquired",
};

export const BODY_STYLE_LABELS: Record<string, string> = {
  sedan: "Sedan",
  hatchback: "Hatchback",
  wagon: "Wagon",
  coupe: "Coupe",
  convertible: "Convertible",
  suv: "SUV",
  pickup: "Pickup",
  van: "Van",
  minivan: "Minivan",
  microcar: "Microcar",
};

export const bodyStyleLabel = (s: string | null | undefined) =>
  s ? BODY_STYLE_LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1) : null;

export const statusLabel = (s: CatalogStatus | null | undefined) => (s ? STATUS_LABELS[s] ?? s : null);

/** "2017–present", "2017–2023", "2028", "From 2026" (upcoming). */
export function formatYears(years: Years | { start: number | null; end: number | null } | null | undefined, status?: CatalogStatus | null) {
  const start = years?.start ?? null;
  const end = years?.end ?? null;
  if (!start && !end) return null;
  if (status === "upcoming") return start ? `Due ${start}` : null;
  if (status === "cancelled") return start ? `Planned for ${start}` : null;
  if (start && !end) return `${start}–present`;
  if (start && end && start === end) return `${start}`;
  if (start && end) return `${start}–${end}`;
  return `until ${end}`;
}

export function formatGenYears(start: number | null, end: number | null, status?: CatalogStatus | null) {
  return formatYears({ start, end }, status);
}

const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US",
  CAD: "en-CA",
  EUR: "de-DE",
  GBP: "en-GB",
  CNY: "zh-CN",
  JPY: "ja-JP",
  KRW: "ko-KR",
  INR: "en-IN",
  AUD: "en-AU",
};

/** "$38,380", "€119,900", "CN¥229,900". Null/0 → null. */
export function formatMoney(value: number | null | undefined, currency: string | null | undefined) {
  if (!value) return null;
  if (!currency) return value.toLocaleString("en-US");
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString(CURRENCY_LOCALE[currency] ?? "en-US")} ${currency}`;
  }
}

export const PRICE_BASIS_LABELS: Record<string, string> = {
  msrp_excl_destination: "MSRP excl. destination",
  msrp_incl_destination: "MSRP incl. destination",
  list_incl_vat: "list price incl. VAT",
};

export const priceBasisLabel = (b: string | null | undefined) => (b ? PRICE_BASIS_LABELS[b] ?? b.replace(/_/g, " ") : null);

/** "321 mi EPA", "670 km WLTP". */
export function formatRange(value: number | null | undefined, unit: string | null | undefined, cycle: string | null | undefined) {
  if (!value) return null;
  return [Math.round(value).toLocaleString("en-US"), unit, cycle].filter(Boolean).join(" ");
}

export const formatRangeFigure = (r: RangeFigure | null | undefined) => (r ? formatRange(r.value, r.unit, r.cycle) : null);

export const formatPriceFigure = (p: PriceFigure | null | undefined) => (p ? formatMoney(p.value, p.currency) : null);

export const formatOfferingPrice = (o: Offering) => formatMoney(o.price, o.currency);

/** Numbers: trim trailing ".0" (stored floats such as 130.0). */
export function num(v: number | null | undefined, digits = 1) {
  if (v === null || v === undefined) return null;
  const rounded = Number(v.toFixed(digits));
  return rounded.toLocaleString("en-US");
}

/** "2024-06-17" → "17 June 2024", "2024-06" → "June 2024", "2024" → "2024". */
export function formatPartialDate(d: string | null | undefined) {
  if (!d) return null;
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/.exec(d);
  if (!m) return d;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [, y, mo, da] = m;
  if (mo && da) return `${Number(da)} ${months[Number(mo) - 1]} ${y}`;
  if (mo) return `${months[Number(mo) - 1]} ${y}`;
  return y;
}

/** ISO timestamp → "10 November 2026". */
export function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  return formatPartialDate(iso.slice(0, 10));
}

export function marketLabel(m: string | null | undefined) {
  if (!m) return null;
  return MARKET_LABELS[m] ?? m;
}

export const sortMarkets = (markets: string[]) =>
  [...markets].sort((a, b) => {
    const ia = MARKET_ORDER.indexOf(a);
    const ib = MARKET_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

/** Display name "Tesla Model 3"; avoids "Polestar Polestar 2". */
export function modelDisplayName(makeName: string | null | undefined, modelName: string | null | undefined) {
  const mk = makeName ?? "";
  const md = modelName ?? "";
  if (mk && md.toLowerCase().startsWith(mk.toLowerCase())) return md;
  return `${mk} ${md}`.trim();
}

/** Offerings sorted by market order, then newest model year first. */
export function sortOfferings(offerings: Offering[] | null | undefined) {
  return [...(offerings ?? [])].sort((a, b) => {
    const ia = MARKET_ORDER.indexOf(a.market ?? "");
    const ib = MARKET_ORDER.indexOf(b.market ?? "");
    if (ia !== ib) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return (b.model_year ?? 0) - (a.model_year ?? 0);
  });
}

/** The newest offering for a market (or the first market with offerings). */
export function headlineOffering(offerings: Offering[] | null | undefined, market?: string | null) {
  const sorted = sortOfferings(offerings);
  if (market) {
    const m = sorted.find((o) => o.market === market);
    if (m) return m;
  }
  return sorted[0] ?? null;
}
