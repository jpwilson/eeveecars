// Dated, sourced assumptions for the buy block (src/components/catalog/BuyBlock.tsx).
// Every value here was read from the official source on `checked`; change the value,
// the date and the URL together. api/_seo.js repeats the tax-credit sentence for the
// crawler HTML, and scripts/check-seo.mjs fails if the two drift apart.

export interface BuyAssumptions {
  /** Loan defaults: examples the reader can change, not offers. */
  loan: { aprPct: number; downPct: number; termMonths: number; terms: number[] };
  /** Charging losses added on top of the rated consumption (percent). */
  chargingLossPct: number;
  /** Yearly distance used for the yearly cost, per range unit. Labelled as an assumption. */
  yearlyDistance: Record<"mi" | "km", number>;
  /** Electricity prices prefilled per market (price per kWh in that market's currency). */
  electricity: Partial<
    Record<
      string,
      { pricePerKwh: number; currency: string; label: string; period: string; source: string; url: string; checked: string }
    >
  >;
  /** The one US federal tax-credit sentence (no per-model eligibility). */
  usFederalCredit: { text: string; incentives: string; source: string; url: string; checked: string };
}

export const BUY_ASSUMPTIONS: BuyAssumptions = {
  loan: { aprPct: 7.0, downPct: 10, termMonths: 60, terms: [36, 48, 60, 72, 84] },
  chargingLossPct: 10,
  yearlyDistance: { mi: 12000, km: 15000 },
  electricity: {
    // EIA Electric Power Monthly, Table 5.6.A, "U.S. Total", residential sector:
    // 18.16 cents/kWh for August 2026 (preliminary; release of 23 October 2026).
    US: {
      pricePerKwh: 0.1816,
      currency: "USD",
      label: "US average residential price",
      period: "August 2026, preliminary",
      source: "EIA Electric Power Monthly, Table 5.6.A",
      url: "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a",
      checked: "2026-11-12",
    },
  },
  usFederalCredit: {
    // Verbatim from the IRS page (update notice; page last reviewed or updated 13 July 2026).
    text: "The New Clean Vehicle Credit is not available for vehicles acquired after Sept. 30, 2025.",
    incentives: "State or utility incentives may apply.",
    source: "IRS: Credits for new clean vehicles purchased in 2023 or after",
    url: "https://www.irs.gov/credits-deductions/credits-for-new-clean-vehicles-purchased-in-2023-or-after",
    checked: "2026-11-12",
  },
};
