// node --test --experimental-strip-types tests/buyMath.test.ts   (npm run test:buy)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chargingCycleCheck,
  chargingEstimate,
  deriveBuyBlock,
  domainOf,
  energyPer100,
  loanEstimate,
  monthlyPayment,
  officialLink,
  parseNum,
} from "../src/utils/buyMath.ts";
import type { BuyInput, BuyTrim } from "../src/utils/buyMath.ts";
import type { BuyAssumptions } from "../src/data/buyAssumptions.ts";

const A: BuyAssumptions = {
  loan: { aprPct: 7, downPct: 10, termMonths: 60, terms: [36, 48, 60, 72, 84] },
  chargingLossPct: 10,
  yearlyDistance: { mi: 12000, km: 15000 },
  electricity: {
    US: { pricePerKwh: 0.2, currency: "USD", label: "test", period: "test", source: "test", url: "https://example.org", checked: "2026-01-01" },
  },
  usFederalCredit: { text: "credit sentence", incentives: "state", source: "IRS", url: "https://www.irs.gov/x", checked: "2026-01-01" },
};

const offering = (o: Partial<NonNullable<BuyTrim["offerings"]>[number]>) => ({
  market: "US",
  model_year: 2026,
  price: null,
  launch_price: null,
  currency: "USD",
  price_basis: "msrp_excl_destination",
  range: null,
  range_unit: null,
  range_cycle: null,
  connector: null,
  is_estimate: false,
  ...o,
});

const trim = (t: Partial<BuyTrim>): BuyTrim => ({
  slug: "base",
  name: "Base",
  status: "current",
  battery_kwh: 75,
  battery_basis: null,
  offerings: [offering({ price: 40000, range: 300, range_unit: "mi", range_cycle: "EPA" })],
  ...t,
});

const input = (over: Partial<BuyInput> = {}): BuyInput => ({
  displayName: "Make Car",
  model: { status: "current", official_url: "https://www.make.com/car" },
  make: { status: "active", website_url: "https://www.make.com" },
  trims: [trim({})],
  ...over,
});

const close = (a: number | null | undefined, b: number, eps = 0.005) => {
  assert.ok(a !== null && a !== undefined, `expected a number near ${b}, got ${a}`);
  assert.ok(Math.abs(a - b) < eps, `${a} is not ~${b}`);
};

test("amortisation matches a known value", () => {
  // $30,000 at 6% APR over 60 months: $579.98/month (standard loan table value)
  close(monthlyPayment(30000, 6, 60), 579.98);
  const l = loanEstimate(33333.33, 3333.33, 6, 60);
  close(l?.monthly, 579.98);
  close(l?.totalInterest, 579.98 * 60 - 30000, 0.5);
});

test("0% APR is principal / months", () => {
  assert.equal(monthlyPayment(36000, 0, 60), 600);
  assert.equal(loanEstimate(40000, 4000, 0, 72)?.totalInterest, 0);
});

test("null and invalid inputs give null, never NaN", () => {
  assert.equal(monthlyPayment(null, 7, 60), null);
  assert.equal(monthlyPayment(30000, null, 60), null);
  assert.equal(monthlyPayment(30000, 7, 0), null);
  assert.equal(monthlyPayment(30000, -1, 60), null);
  assert.equal(loanEstimate(null, 0, 7, 60), null);
  assert.equal(loanEstimate(30000, 40000, 7, 60), null, "down payment above price");
  assert.equal(energyPer100(null, 300, 10), null);
  assert.equal(energyPer100(75, 0, 10), null);
  assert.equal(chargingEstimate({ batteryKwh: null, range: 300, lossPct: 10, pricePerKwh: 0.2, yearlyDistance: 12000 }), null);
  assert.equal(parseNum(""), null);
  assert.equal(parseNum("abc"), null);
  assert.equal(parseNum("$36,990"), 36990);
  assert.equal(parseNum("7.5"), 7.5);
});

test("energy per 100: battery / range x 100 x (1 + loss)", () => {
  close(energyPer100(75, 300, 10), 27.5);
  const c = chargingEstimate({ batteryKwh: 75, range: 300, lossPct: 10, pricePerKwh: 0.2, yearlyDistance: 12000 });
  close(c?.costPer100, 5.5);
  close(c?.yearlyKwh, 3300);
  close(c?.yearlyCost, 660);
  // no electricity price yet: energy only
  const e = chargingEstimate({ batteryKwh: 75, range: 300, lossPct: 10, pricePerKwh: null, yearlyDistance: 12000 });
  assert.equal(e?.costPer100, null);
  assert.equal(e?.yearlyCost, null);
  close(e?.yearlyKwh, 3300);
});

test("km stays km (WLTP), CLTC and other cycles are refused", () => {
  assert.deepEqual(chargingCycleCheck("km", "WLTP"), { ok: true, unit: "km" });
  assert.deepEqual(chargingCycleCheck("mi", "EPA"), { ok: true, unit: "mi" });
  for (const [u, c] of [["km", "CLTC"], ["km", "MIDC"], ["km", "EPA"], ["mi", "WLTP"], ["km", null]] as const) {
    const r = chargingCycleCheck(u, c);
    assert.equal(r.ok, false, `${u} ${c}`);
  }
  const eu = deriveBuyBlock(
    input({
      trims: [
        trim({
          offerings: [offering({ market: "EU", currency: "EUR", price: 44990, price_basis: "list_incl_vat", range: 500, range_unit: "km", range_cycle: "WLTP" })],
        }),
      ],
    }),
    A
  );
  assert.equal(eu?.market, "EU");
  assert.equal(eu?.charging?.unit, "km");
  assert.equal(eu?.charging?.range, 500);
  assert.equal(eu?.electricity, null, "no prefilled price outside the US");
  assert.equal(eu?.energyCurrency, "EUR");
  assert.equal(eu?.credit, null, "credit sentence is US only");
  assert.equal(eu?.payment?.currency, "EUR");

  const cn = deriveBuyBlock(
    input({
      trims: [trim({ offerings: [offering({ market: "CN", currency: "CNY", price: 99800, range: 500, range_unit: "km", range_cycle: "CLTC" })] })],
    }),
    A
  );
  assert.equal(cn?.charging, null);
  assert.match(cn?.chargingNote ?? "", /CLTC/);
  assert.equal(cn?.payment?.price, 99800);
});

test("deriveBuyBlock: US current model gets button, payment, charging, credit", () => {
  const b = deriveBuyBlock(input(), A);
  assert.equal(b?.link?.label, "Check price and availability");
  assert.equal(b?.link?.domain, "make.com");
  assert.equal(b?.payment?.price, 40000);
  assert.equal(b?.charging?.unit, "mi");
  assert.equal(b?.electricity?.pricePerKwh, 0.2);
  assert.equal(b?.credit?.text, "credit sentence");
});

test("deriveBuyBlock: upcoming model → official page button, estimate payment", () => {
  const b = deriveBuyBlock(
    input({ model: { status: "upcoming", official_url: "https://make.com/next" }, trims: [trim({ status: "upcoming" })] }),
    A
  );
  assert.equal(b?.link?.label, "Official Make Car page");
  assert.equal(b?.link?.kind, "upcoming");
  assert.equal(b?.payment?.isEstimate, true);
});

test("deriveBuyBlock: no official_url → make website", () => {
  const b = deriveBuyBlock(input({ model: { status: "current", official_url: null } }), A);
  assert.equal(b?.link?.label, "Visit make.com");
  assert.equal(b?.link?.kind, "make");
  assert.equal(officialLink({ status: "current", official_url: null }, { status: "active", website_url: null }, "X"), null);
  assert.equal(officialLink({ status: "current", official_url: "javascript:alert(1)" }, { status: "active", website_url: null }, "X"), null);
});

test("deriveBuyBlock: discontinued model → no button and no payment", () => {
  const b = deriveBuyBlock(
    input({ model: { status: "discontinued", official_url: "https://make.com/car" }, trims: [trim({ status: "discontinued" })] }),
    A
  );
  assert.equal(b?.link, null);
  assert.equal(b?.payment, null);
  assert.ok(b?.charging, "charging estimate still useful for a used car");
});

test("deriveBuyBlock: defunct brand → no button, no payment even if trim says current", () => {
  const b = deriveBuyBlock(input({ make: { status: "defunct", website_url: "https://gone.com" } }), A);
  assert.equal(b?.link, null);
  assert.equal(b?.payment, null);
});

test("deriveBuyBlock: nothing usable → null", () => {
  const none = deriveBuyBlock(
    input({
      model: { status: "discontinued", official_url: null },
      trims: [trim({ status: "discontinued", battery_kwh: null, offerings: [offering({ price: null, range: 300, range_unit: "mi", range_cycle: "EPA" })] })],
    }),
    A
  );
  assert.equal(none, null);
  // China-only, CLTC, no price, no website: only a refusal note → nothing usable
  const cnOnly = deriveBuyBlock(
    input({
      model: { status: "current", official_url: null },
      make: { status: "active", website_url: null },
      trims: [trim({ offerings: [offering({ market: "CN", currency: null, price: null, range: 500, range_unit: "km", range_cycle: "CLTC" })] })],
    }),
    A
  );
  assert.equal(cnOnly, null);
});

test("deriveBuyBlock: no price → no payment, button stays", () => {
  const b = deriveBuyBlock(input({ trims: [trim({ battery_kwh: null, offerings: [offering({ price: null })] })] }), A);
  assert.ok(b?.link);
  assert.equal(b?.payment, null);
  assert.equal(b?.charging, null);
});

test("deriveBuyBlock: launch price used and flagged when no current price; cheapest trim chosen", () => {
  const b = deriveBuyBlock(
    input({
      trims: [
        trim({ slug: "lr", name: "Long Range", offerings: [offering({ price: 50000 })] }),
        trim({ slug: "sr", name: "Standard", offerings: [offering({ price: null, launch_price: 35000, model_year: 2019 })] }),
      ],
    }),
    A
  );
  assert.equal(b?.trim, "sr");
  assert.equal(b?.payment?.isLaunchPrice, true);
  assert.equal(b?.payment?.modelYear, 2019);
  // a preferred trim without a usable price (discontinued) loses to a buyable priced one
  const d = deriveBuyBlock(
    input({
      preferredTrim: "old",
      trims: [trim({ slug: "old", status: "discontinued", offerings: [offering({ price: 30000 })] }), trim({ slug: "new" })],
    }),
    A
  );
  assert.equal(d?.trim, "new");
  assert.equal(d?.payment?.price, 40000);
  // a requested trim wins
  const c = deriveBuyBlock(input({ trim: "lr", trims: [trim({ slug: "lr" }), trim({ slug: "sr" })] }), A);
  assert.equal(c?.trim, "lr");
});

test("deriveBuyBlock: newest model year with a price in the market", () => {
  const b = deriveBuyBlock(
    input({
      trims: [
        trim({
          offerings: [
            offering({ model_year: 2025, price: 39000 }),
            offering({ model_year: 2027, price: null, range: 310, range_unit: "mi", range_cycle: "EPA" }),
            offering({ model_year: 2026, price: 40000, price_basis: "msrp_incl_destination" }),
          ],
        }),
      ],
    }),
    A
  );
  assert.equal(b?.payment?.price, 40000);
  assert.equal(b?.payment?.basis, "msrp_incl_destination");
  assert.equal(b?.charging?.range, 310, "range from the newest year that has one");
});

test("domainOf strips www and rejects non-http", () => {
  assert.equal(domainOf("https://www.kia.com/us/en/ev6"), "kia.com");
  assert.equal(domainOf("ftp://x.com"), null);
  assert.equal(domainOf("not a url"), null);
});
