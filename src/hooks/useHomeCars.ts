import { useMemo } from "react";
import { useCatalogModels } from "./useCatalog";
import { Car, SelectedFeature } from "./useCars";
import { CatalogMakeSummary, CatalogModelCard, CatalogStatus } from "../types/catalog";
import { bodyStyleLabel } from "../utils/catalogFormat";

/**
 * Home page data: model cards from `/catalog/models`, mapped onto the `Car`
 * shape the existing grid, table and compare components use. `market` fixes
 * the headline figures (US by default; "" = all markets). Defunct brands are
 * never current: the API's effective status already says so.
 */

/** Markets offered in the home page's market picker ("" = all). */
export const HOME_MARKETS: { value: string; label: string }[] = [
  { value: "US", label: "US" },
  { value: "CA", label: "Canada" },
  { value: "EU", label: "Europe" },
  { value: "UK", label: "UK" },
  { value: "CN", label: "China" },
  { value: "", label: "All markets" },
];

function toCar(m: CatalogModelCard, i: number): Car {
  // The compare tool loads full specs from /cars/{id}; catalog variant ids are cars.id.
  const variantId =
    m.from_price?.variant?.id ?? m.max_range?.variant?.id ?? m.quickest_0_60?.variant?.id ?? m.quickest_0_100?.variant?.id ?? null;
  const status = (m.market_status ?? m.status) as CatalogStatus | null;
  return {
    id: variantId ?? -(i + 1),
    make_name: m.make?.name ?? "",
    model: m.name ?? "",
    submodel: m.from_price?.variant?.name ?? "",
    generation: m.default_generation?.name ?? "",
    image_url: m.image?.url ?? "",
    trim_first_released: m.years?.start ? String(m.years.start) : "",
    carmodel_first_released: m.years?.start ? String(m.years.start) : "",
    current_price: m.from_price?.value ?? 0,
    average_rating: null,
    epa_range: m.max_range?.value ?? 0,
    acceleration_0_60: m.quickest_0_60?.value ?? 0,
    top_speed: 0,
    make_model_slug: m.slug,
    vehicle_class: bodyStyleLabel(m.body_style) ?? "",
    availability_desc: status ?? undefined,
    production_availability: status === "current",
    catalog: m,
  };
}

export function useHomeCatalog(market: string) {
  const query = useCatalogModels(market ? { market } : {});
  const cars = useMemo(() => (query.data?.models ?? []).map(toCar), [query.data]);
  return { cars, isLoading: query.isLoading, error: query.error };
}

const statusOf = (c: Car) => (c.catalog?.market_status ?? c.catalog?.status ?? null) as CatalogStatus | null;

/** Filtered home list (same filters as the legacy useCars). */
export default function useHomeCars(
  market: string,
  selectedMake: CatalogMakeSummary | null,
  selectedFeatures: SelectedFeature[],
  searchTerm: string,
  showDiscontinuedCars?: boolean,
  showComingSoonCars?: boolean
) {
  const { cars, isLoading, error } = useHomeCatalog(market);

  const data = useMemo(() => {
    let list = cars.filter((c) => {
      const s = statusOf(c);
      if (s === "current") return true;
      if (s === "upcoming") return !!showComingSoonCars;
      return !!showDiscontinuedCars; // discontinued, cancelled
    });

    if (selectedMake) list = list.filter((c) => c.catalog?.make?.slug === selectedMake.slug);

    const words = (searchTerm ?? "").toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length) {
      list = list.filter((c) => {
        const m = c.catalog;
        const hay = [m?.make?.name, m?.make?.slug, m?.name, m?.slug, ...(m?.aliases ?? [])].join(" ").toLowerCase();
        return words.every((w) => hay.includes(w));
      });
    }

    // Union within a feature category, intersection across categories.
    if (selectedFeatures.length) {
      const grouped = new Map<string, Set<number>>();
      for (const f of selectedFeatures) {
        const set = grouped.get(f.featureName) ?? new Set<number>();
        f.carIds.forEach((id) => set.add(id));
        grouped.set(f.featureName, set);
      }
      list = list.filter((c) => [...grouped.values()].every((set) => set.has(c.id)));
    }
    return list;
  }, [cars, selectedMake, selectedFeatures, searchTerm, showDiscontinuedCars, showComingSoonCars]);

  return { data, isLoading, error: error ? (error as Error).message : "" };
}

// ---------- feature buckets (computed from the cards, replaces legacy /car_features) ----------

export type FeatureBuckets = Record<string, Record<string, number[]>>;

const PRICE_STEPS: Record<string, number[]> = {
  USD: [30000, 40000, 50000, 70000, 100000],
  CAD: [40000, 50000, 60000, 80000, 120000],
  EUR: [30000, 40000, 50000, 70000, 100000],
  GBP: [25000, 35000, 45000, 60000, 90000],
  CNY: [100000, 150000, 200000, 300000, 500000],
};

function bucketize(values: [number, number][], steps: number[], name: (lo: number | null, hi: number | null) => string) {
  const out: Record<string, number[]> = {};
  for (const [id, v] of values) {
    let lo: number | null = null;
    let hi: number | null = null;
    for (const s of steps) {
      if (v < s) {
        hi = s;
        break;
      }
      lo = s;
    }
    const key = name(lo, hi);
    (out[key] ??= []).push(id);
  }
  // keep bucket order = step order
  const ordered: Record<string, number[]> = {};
  const keys = [name(null, steps[0]), ...steps.slice(0, -1).map((s, i) => name(s, steps[i + 1])), name(steps[steps.length - 1], null)];
  for (const k of keys) if (out[k]) ordered[k] = out[k];
  return ordered;
}

const bucketName = (suffix = "") => (lo: number | null, hi: number | null) =>
  lo === null ? `under_${hi}${suffix}` : hi === null ? `over_${lo}${suffix}` : `${lo}_${hi}${suffix}`;

/** Price / range / 0-60 buckets over the home list, like the legacy /car_features. */
export function useHomeFeatures(market: string) {
  const { cars, isLoading, error } = useHomeCatalog(market);
  const features = useMemo<FeatureBuckets>(() => {
    const result: FeatureBuckets = {};
    const withIds = cars.filter((c) => c.id > 0);
    // Price: only when every price is in one currency (a single market).
    const currencies = new Set(withIds.map((c) => c.catalog?.from_price?.currency).filter(Boolean));
    const currency = currencies.size === 1 ? [...currencies][0]! : null;
    if (currency && PRICE_STEPS[currency]) {
      const vals = withIds.filter((c) => c.current_price).map((c) => [c.id, c.current_price] as [number, number]);
      result[`prices_${currency}`] = bucketize(vals, PRICE_STEPS[currency], bucketName());
    }
    // Range: only within one unit + test cycle.
    const cycles = new Set(withIds.map((c) => (c.catalog?.max_range ? `${c.catalog.max_range.unit} ${c.catalog.max_range.cycle}` : null)).filter(Boolean));
    if (cycles.size === 1) {
      const [unit] = ([...cycles][0] as string).split(" ");
      const steps = unit === "mi" ? [200, 250, 300, 350] : [300, 400, 500, 600];
      const vals = withIds.filter((c) => c.epa_range).map((c) => [c.id, c.epa_range] as [number, number]);
      result[`range_${([...cycles][0] as string).replace(" ", "_")}`] = bucketize(vals, steps, bucketName());
    }
    const accel = withIds.filter((c) => c.acceleration_0_60).map((c) => [c.id, c.acceleration_0_60] as [number, number]);
    if (accel.length) result.acceleration = bucketize(accel, [3, 4, 5, 6, 7], bucketName("s"));
    return result;
  }, [cars]);
  return { features, isLoading, error: error ? (error as Error).message : "" };
}
