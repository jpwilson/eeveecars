// Pure math and decisions for the buy block (src/components/catalog/BuyBlock.tsx).
// No runtime imports, so `node --test --experimental-strip-types tests/buyMath.test.ts`
// can load this file directly. Values are never converted between currencies or
// units: a price stays in its offering's currency, a range in mi or km as published.
import type { CatalogStatus, MakeStatus, Offering } from "../types/catalog";
import type { BuyAssumptions } from "../data/buyAssumptions";

const MARKET_ORDER = ["US", "CA", "EU", "UK", "CN", "JP", "KR", "AU", "IN"];

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** "36,990", "$36,990.50", " 7 " → number; empty or junk → null. */
export function parseNum(s: string | number | null | undefined): number | null {
  if (isNum(s)) return s;
  if (typeof s !== "string") return null;
  const cleaned = s.replace(/[\s,]/g, "").replace(/^[^\d.-]+/, "");
  if (!cleaned || !/^-?\d*\.?\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------- loan

/** Monthly payment: L·r / (1 − (1 + r)^−n), or L / n at 0% APR. Null on invalid input. */
export function monthlyPayment(principal: number | null, aprPct: number | null, months: number | null): number | null {
  if (!isNum(principal) || principal < 0 || !isNum(aprPct) || aprPct < 0 || !isNum(months) || months <= 0) return null;
  if (!Number.isInteger(months)) return null;
  const r = aprPct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export interface LoanEstimate {
  principal: number;
  monthly: number;
  totalInterest: number;
  totalPaid: number;
}

/** Price minus down payment, financed at `aprPct` over `months`. Null when any input is unusable. */
export function loanEstimate(
  price: number | null,
  down: number | null,
  aprPct: number | null,
  months: number | null
): LoanEstimate | null {
  if (!isNum(price) || price <= 0) return null;
  const d = down ?? 0;
  if (!isNum(d) || d < 0 || d > price) return null;
  const principal = price - d;
  const monthly = monthlyPayment(principal, aprPct, months);
  if (monthly === null || !isNum(months)) return null;
  const totalPaid = monthly * months;
  return { principal, monthly, totalInterest: totalPaid - principal, totalPaid };
}

// ---------------------------------------------------------------- charging

export type RangeUnit = "mi" | "km";

/** Only EPA miles and WLTP kilometres are used for an energy estimate; anything else is refused with a reason. */
export function chargingCycleCheck(
  unit: string | null | undefined,
  cycle: string | null | undefined
): { ok: true; unit: RangeUnit } | { ok: false; reason: string } {
  const c = (cycle ?? "").toUpperCase();
  if (unit === "mi" && c === "EPA") return { ok: true, unit: "mi" };
  if (unit === "km" && c === "WLTP") return { ok: true, unit: "km" };
  const what = [cycle || "an unstated test cycle", unit ? `(${unit})` : null].filter(Boolean).join(" ");
  return {
    ok: false,
    reason: `Charging cost is worked out only from EPA (mi) or WLTP (km) range; the range on file for this trim is ${what}.`,
  };
}

/** kWh per 100 mi or km = battery ÷ range × 100 × (1 + loss). */
export function energyPer100(batteryKwh: number | null, range: number | null, lossPct: number | null): number | null {
  if (!isNum(batteryKwh) || batteryKwh <= 0 || !isNum(range) || range <= 0) return null;
  if (!isNum(lossPct) || lossPct < 0 || lossPct > 100) return null;
  return (batteryKwh / range) * 100 * (1 + lossPct / 100);
}

export interface ChargingEstimate {
  /** kWh per 100 of the range's own unit */
  kwhPer100: number;
  /** cost per 100 mi/km; null until an electricity price is known */
  costPer100: number | null;
  yearlyKwh: number | null;
  yearlyCost: number | null;
}

export function chargingEstimate(opts: {
  batteryKwh: number | null;
  range: number | null;
  lossPct: number | null;
  pricePerKwh: number | null;
  yearlyDistance: number | null;
}): ChargingEstimate | null {
  const kwhPer100 = energyPer100(opts.batteryKwh, opts.range, opts.lossPct);
  if (kwhPer100 === null) return null;
  const price = isNum(opts.pricePerKwh) && opts.pricePerKwh >= 0 ? opts.pricePerKwh : null;
  const dist = isNum(opts.yearlyDistance) && opts.yearlyDistance > 0 ? opts.yearlyDistance : null;
  const yearlyKwh = dist !== null ? (kwhPer100 * dist) / 100 : null;
  return {
    kwhPer100,
    costPer100: price !== null ? kwhPer100 * price : null,
    yearlyKwh,
    yearlyCost: price !== null && yearlyKwh !== null ? yearlyKwh * price : null,
  };
}

// ---------------------------------------------------------------- official link

export function domainOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.hostname.replace(/^www\./i, "") || null;
  } catch {
    return null;
  }
}

export interface OfficialLink {
  href: string;
  label: string;
  domain: string;
  /** "Availability and prices vary by country." on the main button */
  note: string | null;
  kind: "model" | "upcoming" | "make";
}

/**
 * Current model of a working brand → "Check price and availability" on its own page;
 * upcoming → "Official {model} page"; no model page → the brand's site. Discontinued or
 * cancelled models and defunct or acquired brands get no button.
 */
export function officialLink(
  model: { status: CatalogStatus | null; official_url: string | null },
  make: { status: MakeStatus | string | null; website_url: string | null },
  displayName: string
): OfficialLink | null {
  if (make.status === "defunct" || make.status === "acquired") return null;
  if (model.status !== "current" && model.status !== "upcoming") return null;
  const modelDomain = domainOf(model.official_url);
  if (model.official_url && modelDomain) {
    return model.status === "upcoming"
      ? { href: model.official_url, label: `Official ${displayName} page`, domain: modelDomain, note: null, kind: "upcoming" }
      : {
          href: model.official_url,
          label: "Check price and availability",
          domain: modelDomain,
          note: "Availability and prices vary by country.",
          kind: "model",
        };
  }
  const makeDomain = domainOf(make.website_url);
  if (make.website_url && makeDomain) {
    return { href: make.website_url, label: `Visit ${makeDomain}`, domain: makeDomain, note: null, kind: "make" };
  }
  return null;
}

// ---------------------------------------------------------------- what the block shows

export interface BuyTrim {
  slug: string;
  name: string | null;
  status: CatalogStatus | null;
  battery_kwh: number | null;
  battery_basis: string | null;
  offerings: Offering[] | null;
}

export interface PaymentBasis {
  price: number;
  currency: string;
  basis: string | null;
  modelYear: number | null;
  /** price came from launch_price (no current price on file) */
  isLaunchPrice: boolean;
  /** manufacturer estimate (offering flagged, or the trim is upcoming) */
  isEstimate: boolean;
}

export interface ChargingBasis {
  batteryKwh: number;
  batteryBasis: string | null;
  range: number;
  unit: RangeUnit;
  cycle: string;
  modelYear: number | null;
  isEstimate: boolean;
}

export interface BuyBlockModel {
  link: OfficialLink | null;
  markets: string[];
  market: string | null;
  /** trims to choose from in this market */
  trims: { slug: string; name: string | null }[];
  trim: string | null;
  payment: PaymentBasis | null;
  charging: ChargingBasis | null;
  /** one line when a range exists but on a cycle we do not use */
  chargingNote: string | null;
  /** prefilled electricity price for this market (US only today) */
  electricity: BuyAssumptions["electricity"][string] | null;
  /** currency a typed electricity price is in (the offering's currency) */
  energyCurrency: string | null;
  credit: BuyAssumptions["usFederalCredit"] | null;
}

export interface BuyInput {
  displayName: string;
  model: { status: CatalogStatus | null; official_url: string | null };
  make: { status: MakeStatus | string | null; website_url: string | null };
  trims: BuyTrim[];
  market?: string | null;
  preferredMarket?: string | null;
  trim?: string | null;
  preferredTrim?: string | null;
}

const byYearDesc = (a: Offering, b: Offering) => (b.model_year ?? 0) - (a.model_year ?? 0);

/** Newest model year in `market` with a price (else a launch price, flagged). */
export function priceOffering(trim: BuyTrim, market: string | null): PaymentBasis | null {
  if (!market) return null;
  const list = (trim.offerings ?? []).filter((o) => o.market === market && o.currency).sort(byYearDesc);
  const withPrice = list.find((o) => isNum(o.price) && (o.price as number) > 0);
  const withLaunch = list.find((o) => isNum(o.launch_price) && (o.launch_price as number) > 0);
  const o = withPrice ?? withLaunch;
  if (!o) return null;
  return {
    price: (withPrice ? o.price : o.launch_price) as number,
    currency: o.currency as string,
    basis: o.price_basis,
    modelYear: o.model_year,
    isLaunchPrice: !withPrice,
    isEstimate: !!o.is_estimate || trim.status === "upcoming",
  };
}

/** Battery + newest range in `market`, or the reason the range cycle is not used. */
export function chargingBasis(trim: BuyTrim, market: string | null): { basis: ChargingBasis | null; note: string | null } {
  if (!market || !isNum(trim.battery_kwh) || trim.battery_kwh <= 0) return { basis: null, note: null };
  const o = (trim.offerings ?? [])
    .filter((x) => x.market === market && isNum(x.range) && (x.range as number) > 0)
    .sort(byYearDesc)[0];
  if (!o) return { basis: null, note: null };
  const check = chargingCycleCheck(o.range_unit, o.range_cycle);
  if (!check.ok) return { basis: null, note: check.reason };
  return {
    basis: {
      batteryKwh: trim.battery_kwh,
      batteryBasis: trim.battery_basis,
      range: o.range as number,
      unit: check.unit,
      cycle: (o.range_cycle ?? "").toUpperCase(),
      modelYear: o.model_year,
      isEstimate: !!o.is_estimate || trim.status === "upcoming",
    },
    note: null,
  };
}

function sortMarkets(markets: string[]) {
  const idx = (m: string) => (MARKET_ORDER.indexOf(m) === -1 ? 99 : MARKET_ORDER.indexOf(m));
  return [...markets].sort((a, b) => idx(a) - idx(b));
}

/**
 * Decides what the buy block shows. Null when nothing is usable (no button, no payment,
 * no charging estimate), and the block then renders nothing.
 */
export function deriveBuyBlock(input: BuyInput, assumptions: BuyAssumptions): BuyBlockModel | null {
  const link = officialLink(input.model, input.make, input.displayName);
  const gone = input.make.status === "defunct" || input.make.status === "acquired";

  const marketSet = new Set<string>();
  for (const t of input.trims) for (const o of t.offerings ?? []) if (o.market) marketSet.add(o.market);
  const markets = sortMarkets([...marketSet]);
  const pickMarket = [input.market, input.preferredMarket, "US"].find((m) => m && markets.includes(m)) ?? markets[0] ?? null;
  const market = pickMarket ?? null;

  const inMarket = market ? input.trims.filter((t) => (t.offerings ?? []).some((o) => o.market === market)) : [];
  const buyable = (t: BuyTrim) => !gone && (t.status === "current" || t.status === "upcoming");

  // Requested trim, else the preferred one when it has a usable price, else the cheapest buyable
  // trim with a price, else the preferred one, else one with charging data.
  const bySlug = (s: string | null | undefined) => (s ? inMarket.find((t) => t.slug === s) : undefined);
  const priced = inMarket
    .filter(buyable)
    .map((t) => ({ t, p: priceOffering(t, market) }))
    .filter((x) => x.p)
    .sort((a, b) => (a.p as PaymentBasis).price - (b.p as PaymentBasis).price);
  const preferred = bySlug(input.preferredTrim);
  const trim =
    bySlug(input.trim) ??
    (preferred && priced.some((x) => x.t === preferred) ? preferred : undefined) ??
    priced[0]?.t ??
    preferred ??
    inMarket.find((t) => chargingBasis(t, market).basis) ??
    inMarket[0] ??
    null;

  const payment = trim && buyable(trim) ? priceOffering(trim, market) : null;
  const ch = trim ? chargingBasis(trim, market) : { basis: null, note: null };

  if (!link && !payment && !ch.basis) return null;

  const currency =
    (trim && (trim.offerings ?? []).find((o) => o.market === market && o.currency)?.currency) ||
    inMarket.flatMap((t) => t.offerings ?? []).find((o) => o.market === market && o.currency)?.currency ||
    null;
  const prefilled = market ? assumptions.electricity[market] ?? null : null;

  return {
    link,
    markets,
    market,
    trims: inMarket.map((t) => ({ slug: t.slug, name: t.name })),
    trim: trim?.slug ?? null,
    payment,
    charging: ch.basis,
    chargingNote: ch.note,
    electricity: prefilled,
    energyCurrency: prefilled?.currency ?? currency,
    credit: market === "US" ? assumptions.usFederalCredit : null,
  };
}
