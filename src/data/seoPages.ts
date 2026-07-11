import { Car } from "../hooks/useCars";

/** Curated comparison pairs — keep in sync with backend routers/seo.py
 * (sitemap) and api/prerender.js (bot HTML). */
export const COMPARE_PAIRS: { pair: string; label: string }[] = [
  { pair: "tesla-model-3-vs-bmw-i4", label: "Tesla Model 3 vs BMW i4" },
  { pair: "hyundai-ioniq-5-vs-kia-ev6", label: "Ioniq 5 vs KIA EV6" },
  { pair: "tesla-model-y-vs-ford-mustang-mach-e", label: "Model Y vs Mach-E" },
  { pair: "rivian-r1s-vs-tesla-model-x", label: "Rivian R1S vs Model X" },
  { pair: "tesla-model-3-vs-hyundai-ioniq-6", label: "Model 3 vs Ioniq 6" },
  { pair: "ford-f150-lightning-vs-tesla-cybertruck", label: "F-150 Lightning vs Cybertruck" },
  { pair: "chevrolet-equinox-ev-vs-tesla-model-y", label: "Equinox EV vs Model Y" },
  { pair: "kia-ev9-vs-rivian-r1s", label: "KIA EV9 vs Rivian R1S" },
  { pair: "tesla-model-y-vs-hyundai-ioniq-5", label: "Model Y vs Ioniq 5" },
  { pair: "rivian-r1t-vs-ford-f150-lightning", label: "R1T vs F-150 Lightning" },
];

export interface BestPageConfig {
  title: string;
  blurb: string;
  filter: (c: Car) => boolean;
  sort: (a: Car, b: Car) => number;
  limit: number;
}

const isAvailable = (c: Car) => c.availability_desc === "available";

/** Best-of list pages — data-driven, always current. Slugs must match
 * backend BEST_PATHS and api/prerender.js. */
export const BEST_PAGES: Record<string, BestPageConfig> = {
  "evs-under-40k": {
    title: "Best EVs Under $40,000",
    blurb:
      "Every electric vehicle you can buy for under $40k MSRP, ranked by review score. Prices exclude taxes, fees, and incentives — the federal tax credit can push these even lower.",
    filter: (c) => isAvailable(c) && !!c.current_price && c.current_price < 40000,
    sort: (a, b) =>
      (b.average_rating ?? 0) - (a.average_rating ?? 0) ||
      (a.current_price ?? 0) - (b.current_price ?? 0),
    limit: 12,
  },
  "longest-range-evs": {
    title: "Longest Range Electric Cars",
    blurb:
      "The EVs that go furthest on a single charge, ranked by EPA range. Real-world range varies with speed, temperature, and driving style.",
    filter: (c) => isAvailable(c) && !!c.epa_range,
    sort: (a, b) => (b.epa_range ?? 0) - (a.epa_range ?? 0),
    limit: 12,
  },
  "fastest-evs": {
    title: "Fastest Electric Cars (0–60 mph)",
    blurb:
      "The quickest EVs on sale today, ranked by 0–60 mph acceleration. Electric torque means even family SUVs embarrass sports cars.",
    filter: (c) => isAvailable(c) && !!c.acceleration_0_60,
    sort: (a, b) => (a.acceleration_0_60 ?? 99) - (b.acceleration_0_60 ?? 99),
    limit: 12,
  },
  "cheapest-evs": {
    title: "Cheapest Electric Cars",
    blurb:
      "The most affordable EVs on the market, ranked by MSRP. Entry EV pricing changes fast — this list is generated from our live database.",
    filter: (c) => isAvailable(c) && !!c.current_price,
    sort: (a, b) => (a.current_price ?? 0) - (b.current_price ?? 0),
    limit: 12,
  },
  "3-row-evs": {
    title: "Best 3-Row Electric SUVs (6+ Seats)",
    blurb:
      "Every electric vehicle with three rows or six-plus seats — the family-hauler list, ranked by review score.",
    filter: (c) => isAvailable(c) && (c.number_of_full_adult_seats ?? 0) >= 6,
    sort: (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0),
    limit: 12,
  },
};
