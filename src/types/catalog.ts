// Types for the catalog read API (`/catalog/*`), documented in
// ev_backend/docs/catalog-api.md. Every field except slug/key/path may be null.

export type CatalogStatus = "upcoming" | "current" | "discontinued" | "cancelled";
export type MakeStatus = "active" | "pre-production" | "defunct" | "acquired";
export type MakeDisplayStatus = "current" | "upcoming" | "discontinued" | "defunct";
export type Market = "US" | "CA" | "EU" | "UK" | "CN" | "JP" | "KR" | "IN" | "AU";

export interface CatalogSource {
  url: string | null;
  name: string | null;
  fields: string[] | null;
}

export interface CatalogImageData {
  url: string | null;
  source: "commons" | "press" | "legacy" | string | null;
  page_url: string | null;
  credit: string | null;
  license: string | null;
  view: string | null;
  alt: string | null;
  is_primary: boolean | null;
  width: number | null;
  height: number | null;
}

export interface VariantRef {
  id: number | null;
  slug: string;
  name: string | null;
  path: string;
}

export interface PriceFigure {
  value: number | null;
  currency: string | null;
  basis: string | null;
  market: string | null;
  model_year: number | null;
  is_estimate: boolean | null;
  variant: VariantRef | null;
}

export interface RangeFigure {
  value: number | null;
  unit: string | null;
  cycle: string | null;
  market: string | null;
  model_year: number | null;
  is_estimate: boolean | null;
  variant: VariantRef | null;
}

export interface AccelFigure {
  value: number | null;
  unit: string | null;
  variant: VariantRef | null;
}

export interface Headline {
  market?: string | null;
  from_price: PriceFigure | null;
  max_range: RangeFigure | null;
  quickest_0_60: AccelFigure | null;
  quickest_0_100: AccelFigure | null;
}

export interface MakeRef {
  slug: string;
  name: string | null;
  path: string;
  status: MakeStatus | null;
  brand_status: string | null;
  status_date: string | null;
}

export interface ModelCounts {
  upcoming: number;
  current: number;
  discontinued: number;
  cancelled: number;
}

export interface CatalogMakeSummary extends MakeRef {
  display_status: MakeDisplayStatus | null;
  status_details: string | null;
  country: string | null;
  founded: number | null;
  logo_url: string | null;
  model_counts: ModelCounts | null;
}

export interface CatalogMakeDetail extends CatalogMakeSummary {
  headquarters: string | null;
  parent_group: string | null;
  website_url: string | null;
  description: string | null;
  sources: CatalogSource[] | null;
  legacy_id: number | null;
}

export interface Years {
  start: number | null;
  end: number | null;
}

export interface GenerationRef {
  slug: string;
  name: string | null;
  path: string;
}

export interface CatalogModelCard extends Headline {
  slug: string;
  key: string;
  url_slug: string;
  path: string;
  name: string | null;
  make: MakeRef;
  status: CatalogStatus | null;
  own_status: CatalogStatus | null;
  brand_status: string | null;
  body_style: string | null;
  is_commercial: boolean | null;
  aliases: string[] | null;
  years: Years | null;
  markets: string[] | null;
  default_generation: GenerationRef | null;
  image: CatalogImageData | null;
  headline_market: string | null;
  variant_count: number | null;
  market_status?: CatalogStatus | null;
}

export interface CatalogModelsResponse {
  count: number;
  offset: number;
  market: string | null;
  models: CatalogModelCard[];
}

export interface CatalogMakesResponse {
  count: number;
  makes: CatalogMakeSummary[];
}

export interface CatalogMakeResponse {
  make: CatalogMakeDetail;
  models: Record<CatalogStatus, CatalogModelCard[]>;
}

export interface Offering {
  market: string | null;
  model_year: number | null;
  price: number | null;
  launch_price: number | null;
  currency: string | null;
  price_basis: string | null;
  range: number | null;
  range_unit: string | null;
  range_cycle: string | null;
  connector: string | null;
  is_estimate: boolean | null;
}

export interface CatalogVariant {
  id: number | null;
  slug: string;
  key: string;
  path: string;
  name: string | null;
  status: CatalogStatus | null;
  own_status: CatalogStatus | null;
  year_from: number | null;
  year_to: number | null;
  drivetrain: string | null;
  body_type: string | null;
  seats: number | null;
  battery_kwh: number | null;
  battery_basis: string | null;
  power_hp: number | null;
  torque_lbft: number | null;
  accel_0_60_s: number | null;
  accel_0_100_s: number | null;
  top_speed_mph: number | null;
  dc_kw: number | null;
  offerings: Offering[] | null;
  sources: CatalogSource[] | null;
  updated_at: string | null;
}

export interface CatalogGeneration {
  id: number | null;
  slug: string;
  key: string;
  path: string;
  name: string | null;
  kind: "generation" | "refresh" | string | null;
  ordinal: number | null;
  code_name: string | null;
  platform: string | null;
  start_year: number | null;
  end_year: number | null;
  status: CatalogStatus | null;
  own_status: CatalogStatus | null;
  description: string | null;
  is_default: boolean | null;
  images: CatalogImageData[] | null;
  sources: CatalogSource[] | null;
  updated_at: string | null;
  variants?: CatalogVariant[] | null;
}

export interface ModelMarket {
  market: string;
  status: CatalogStatus | null;
  own_status: CatalogStatus | null;
  local_name: string | null;
  launch: string | null;
  end: string | null;
}

export interface CatalogModelInfo {
  slug: string;
  key: string;
  url_slug: string;
  path: string;
  name: string | null;
  aliases: string[] | null;
  body_style: string | null;
  is_commercial: boolean | null;
  status: CatalogStatus | null;
  own_status: CatalogStatus | null;
  brand_status: string | null;
  years: Years | null;
  description: string | null;
  official_url: string | null;
  markets: ModelMarket[] | null;
  sources: CatalogSource[] | null;
}

export interface ModelRelation {
  relation: "twin" | "successor" | "predecessor" | string;
  model: {
    slug: string;
    name: string | null;
    path: string;
    make: MakeRef | null;
    status: CatalogStatus | null;
  };
}

/** One adjacent version pair on the model tree (newest first). Link only when `indexable`. */
export interface ModelChangeLink {
  path: string;
  older: { slug: string; name: string | null };
  newer: { slug: string; name: string | null };
  indexable: boolean | null;
}

export interface CatalogModelResponse {
  make: CatalogMakeDetail;
  model: CatalogModelInfo;
  headline: Headline | null;
  default_generation: string | null;
  generations: CatalogGeneration[];
  relations: ModelRelation[] | null;
  changes?: ModelChangeLink[] | null;
  updated_at: string | null;
}

export interface VariantSibling {
  id: number | null;
  slug: string;
  name: string | null;
  path: string;
  status: CatalogStatus | null;
}

export interface GenerationSummary {
  slug: string;
  name: string | null;
  path: string;
  status: CatalogStatus | null;
  start_year: number | null;
  end_year: number | null;
}

export interface CatalogVariantResponse {
  make: CatalogMakeDetail;
  model: {
    slug: string;
    name: string | null;
    path: string;
    status: CatalogStatus | null;
    own_status: CatalogStatus | null;
    body_style: string | null;
    is_commercial: boolean | null;
    official_url: string | null;
    years: Years | null;
  };
  generation: CatalogGeneration;
  variant: CatalogVariant;
  siblings: VariantSibling[] | null;
  generations: GenerationSummary[] | null;
}

export interface ResolveResponse {
  kind: string;
  key: string;
  path: string;
  entity_type: string | null;
  entity_id: number | null;
  reason: string | null;
}

export interface CatalogMeta {
  counts: Record<string, number>;
  models_by_status: Record<string, number>;
  makes_by_display_status: Record<string, number>;
  markets: string[];
  dataAsOf: string | null;
  data_updated_at: string | null;
}

export interface CatalogBestItem {
  model: CatalogModelCard;
  /** the ranked figure: price (unit = currency), range (unit = mi) or 0-60 (unit = s) */
  value: number | null;
  unit: string | null;
  variant: VariantRef | null;
  rank: number | null;
}

export interface CatalogBestResponse {
  key: string;
  title: string | null;
  market: string | null;
  metric: "price" | "range" | "accel" | string | null;
  items: CatalogBestItem[];
  count: number | null;
}

// ---- version changes (`/catalog/changes/{make}/{model}/{older}/{newer}`)

export type ChangeStatus =
  | "increased"
  | "decreased"
  | "unchanged"
  | "changed"
  | "not_comparable"
  | "missing_older"
  | "missing_newer"
  | "info"
  | string;

/** One side of a changes row. `value` is a number, a list (set rows) or text (span rows). */
export interface ChangeSide {
  value: number | string | (string | number)[] | null;
  unit: string | null;
  cycle: string | null;
  market: string | null;
  model_year: number | null;
  price_kind: "price" | "launch" | string | null;
  basis: string | null;
  is_estimate: boolean | null;
  variant: VariantRef | null;
  from?: number | null;
  to?: number | null;
}

export interface ChangeRow {
  key: string;
  label: string | null;
  kind: "number" | "set" | "count" | "span" | string | null;
  older: ChangeSide | null;
  newer: ChangeSide | null;
  change: {
    status: ChangeStatus | null;
    delta: number | null;
    unit: string | null;
    reason: string | null;
    added?: (string | number)[] | null;
    removed?: (string | number)[] | null;
    basis_unknown?: boolean | null;
  } | null;
  qualifier: string | null;
  text: string | null;
}

export interface ChangeGeneration extends Omit<CatalogGeneration, "variants"> {
  model_years: Record<string, { from: number | null; to: number | null }> | null;
  years_text: string | null;
}

export interface ChangeTrimRef {
  id?: number | null;
  slug: string;
  name: string | null;
  path?: string | null;
  status?: CatalogStatus | null;
}

export interface CatalogChangesResponse {
  path: string;
  key: string;
  indexable: boolean | null;
  quality: {
    comparable_facts: number | null;
    default_market?: string | null;
    default_market_comparable_facts?: number | null;
    min_for_indexing?: number | null;
  } | null;
  make: MakeRef;
  model: {
    slug: string;
    name: string | null;
    path: string;
    official_url: string | null;
    status: CatalogStatus | null;
    years: Years | null;
  };
  relation: "refresh" | "new_generation" | string | null;
  older: ChangeGeneration;
  newer: ChangeGeneration;
  market: string | null;
  markets: string[] | null;
  summary: string[] | null;
  rows: ChangeRow[] | null;
  trims: {
    matched: { older: ChangeTrimRef; newer: ChangeTrimRef; match: string | null; rows: ChangeRow[] | null }[] | null;
    only_older: ChangeTrimRef[] | null;
    only_newer: ChangeTrimRef[] | null;
  } | null;
  faq: { q: string; a: string }[] | null;
  notes: string[] | null;
  sources: CatalogSource[] | null;
  updated_at: string | null;
}
