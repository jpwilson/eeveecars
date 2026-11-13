import { Car } from "../hooks/useCars";

/** The pinned comparison pairs (ev_backend routers/seo.py COMPARE_PAIRS), canonical
 * form: the two catalog model slugs in alphabetical order. The backend is the source of
 * truth for which pairs exist; this copy is used only by the legacy fallback (catalog
 * answers 503) and the /compare hub's 503 fallback. */
export const COMPARE_PAIRS: { pair: string; label: string }[] = [
  { pair: "bmw-i4-vs-tesla-model-3", label: "BMW i4 vs Tesla Model 3" },
  { pair: "hyundai-ioniq-5-vs-kia-ev6", label: "Ioniq 5 vs KIA EV6" },
  { pair: "ford-mustang-mach-e-vs-tesla-model-y", label: "Mach-E vs Model Y" },
  { pair: "rivian-r1s-vs-tesla-model-x", label: "Rivian R1S vs Model X" },
  { pair: "hyundai-ioniq-6-vs-tesla-model-3", label: "Ioniq 6 vs Model 3" },
  { pair: "ford-f150-lightning-vs-tesla-cybertruck", label: "F-150 Lightning vs Cybertruck" },
  { pair: "chevrolet-equinox-ev-vs-tesla-model-y", label: "Equinox EV vs Model Y" },
  { pair: "kia-ev9-vs-rivian-r1s", label: "KIA EV9 vs Rivian R1S" },
  { pair: "hyundai-ioniq-5-vs-tesla-model-y", label: "Ioniq 5 vs Model Y" },
  { pair: "ford-f150-lightning-vs-rivian-r1t", label: "F-150 Lightning vs R1T" },
];

export interface BestPageConfig {
  title: string;
  /** describes the legacy list (the catalog page shows the API's own blurb) */
  blurb: string;
  /** the old wording, shown only by the legacy fallback when it ranks differently */
  legacyBlurb?: string;
  filter: (c: Car) => boolean;
  sort: (a: Car, b: Car) => number;
  limit: number;
}

const isAvailable = (c: Car) => c.availability_desc === "available";

/** The 7 original lists, used ONLY by the legacy fallback (catalog answers 503) and the
 * /best hub's 503 fallback. The catalog registry (ev_backend services/catalog_lists.py,
 * `/catalog/lists`) is the source of truth for every list, its title, blurb and ranking;
 * `blurb` here describes the legacy list. Mirrors BEST_CONFIGS in api/prerender.js. */
export const BEST_PAGES: Record<string, BestPageConfig> = {
  "evs-under-40k": {
    title: "Best EVs Under $40,000",
    blurb:
      "Every electric vehicle you can buy in the US for under $40k MSRP, cheapest first. Prices are before taxes and incentives — some makers quote them with destination, some without.",
    legacyBlurb:
      "Every electric vehicle you can buy for under $40k MSRP, ranked by review score. Prices exclude taxes, fees, and incentives. The federal clean vehicle credit is not available for vehicles acquired after Sept. 30, 2025 (IRS); state or utility incentives may apply.",
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
      "The most affordable EVs on the market, ranked by MSRP. Entry EV pricing changes fast — this list is generated from our database.",
    filter: (c) => isAvailable(c) && !!c.current_price,
    sort: (a, b) => (a.current_price ?? 0) - (b.current_price ?? 0),
    limit: 12,
  },
  "3-row-evs": {
    title: "Best 3-Row Electric SUVs (6+ Seats)",
    blurb:
      "Every electric vehicle on sale in the US with three rows or six-plus seats — the family-hauler list, ranked by EPA range.",
    legacyBlurb:
      "Every electric vehicle with three rows or six-plus seats — the family-hauler list, ranked by review score.",
    filter: (c) => isAvailable(c) && (c.number_of_full_adult_seats ?? 0) >= 6,
    sort: (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0),
    limit: 12,
  },
  "electric-trucks": {
    title: "Electric Pickup Trucks",
    blurb:
      "Every electric pickup truck on sale in the US, then the ones coming soon — from work trucks to luxury pickups, ranked by EPA range.",
    legacyBlurb:
      "Every electric pickup truck on the market and coming soon — from work trucks to luxury pickups.",
    filter: (c) => c.vehicle_class?.toLowerCase().includes("pickup") && c.availability_desc !== "discontinued",
    sort: (a, b) => {
      const availOrder: Record<string, number> = {available: 0, coming_soon: 1};
      const aOrder = a.availability_desc ? (availOrder[a.availability_desc] ?? 2) : 2;
      const bOrder = b.availability_desc ? (availOrder[b.availability_desc] ?? 2) : 2;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (b.average_rating ?? 0) - (a.average_rating ?? 0);
    },
    limit: 12,
  },
  "300-mile-range-evs": {
    title: "EVs with 300+ Miles of Range",
    blurb:
      "Every electric vehicle that goes 300 miles or more on a charge. Long-range road-trip EVs ranked by EPA range.",
    filter: (c) => isAvailable(c) && (c.epa_range ?? 0) >= 300,
    sort: (a, b) => (b.epa_range ?? 0) - (a.epa_range ?? 0),
    limit: 15,
  },
};
