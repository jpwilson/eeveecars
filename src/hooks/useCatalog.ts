import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import catalogClient from "../services/catalog-client";
import {
  CatalogBestResponse,
  CatalogChangesResponse,
  CatalogMakeResponse,
  CatalogMakesResponse,
  CatalogMeta,
  CatalogModelResponse,
  CatalogModelsResponse,
  CatalogVariantResponse,
  ResolveResponse,
} from "../types/catalog";

/** HTTP status of a failed catalog request (0 = network error / no response). */
export function errorStatus(error: unknown): number | null {
  if (!error) return null;
  if (axios.isAxiosError(error)) return error.response?.status ?? 0;
  return 0;
}

/**
 * 503 = the catalog migration has not been applied on this backend yet.
 * Pages treat it as "fall back to the legacy page", never as a 404.
 */
export const isCatalogUnavailable = (error: unknown) => errorStatus(error) === 503;
export const isNotFound = (error: unknown) => errorStatus(error) === 404;

// Do not retry 4xx or 503: they are answers, not glitches.
const retry = (count: number, error: unknown) => {
  const s = errorStatus(error);
  if (s !== null && s !== 0 && (s < 500 || s === 503)) return false;
  return count < 1;
};

async function get<T>(url: string, params?: Record<string, unknown>, signal?: AbortSignal) {
  const res = await catalogClient.get<T>(url, { params, signal });
  return res.data;
}

export interface ModelsQuery {
  market?: string;
  status?: string;
  make?: string;
  body_style?: string;
  q?: string;
  commercial?: boolean;
  limit?: number;
  offset?: number;
}

/** Model cards (browse, home, sidebar counts). Defaults to every model. */
export function useCatalogModels(query: ModelsQuery = {}, enabled = true) {
  const params: Record<string, unknown> = { limit: 1000, ...query };
  Object.keys(params).forEach((k) => (params[k] === undefined || params[k] === "") && delete params[k]);
  return useQuery({
    queryKey: ["catalog", "models", params],
    queryFn: ({ signal }) => get<CatalogModelsResponse>("/catalog/models", params, signal),
    retry,
    enabled,
  });
}

export function useCatalogMakes() {
  return useQuery({
    queryKey: ["catalog", "makes"],
    queryFn: ({ signal }) => get<CatalogMakesResponse>("/catalog/makes", undefined, signal),
    retry,
    staleTime: 30 * 60 * 1000,
  });
}

export function useCatalogMake(slug: string | undefined, market?: string) {
  return useQuery({
    queryKey: ["catalog", "make", slug, market ?? null],
    queryFn: ({ signal }) =>
      get<CatalogMakeResponse>(`/catalog/makes/${encodeURIComponent(slug ?? "")}`, market ? { market } : undefined, signal),
    enabled: !!slug,
    retry,
  });
}

export function useCatalogModel(make: string | undefined, model: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "model", make, model],
    queryFn: ({ signal }) =>
      get<CatalogModelResponse>(
        `/catalog/models/${encodeURIComponent(make ?? "")}/${encodeURIComponent(model ?? "")}`,
        undefined,
        signal
      ),
    enabled: !!make && !!model,
    retry,
  });
}

export function useCatalogVariant(
  make: string | undefined,
  model: string | undefined,
  generation: string | undefined,
  variant: string | undefined
) {
  return useQuery({
    queryKey: ["catalog", "variant", make, model, generation, variant],
    queryFn: ({ signal }) =>
      get<CatalogVariantResponse>(
        `/catalog/variants/${[make, model, generation, variant].map((s) => encodeURIComponent(s ?? "")).join("/")}`,
        undefined,
        signal
      ),
    enabled: !!make && !!model && !!generation && !!variant,
    retry,
  });
}

export function useCatalogResolve(kind: "model" | "make" | "variant", key: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "resolve", kind, key],
    queryFn: ({ signal }) => get<ResolveResponse>("/catalog/resolve", { kind, key }, signal),
    enabled: !!key,
    retry,
    staleTime: 60 * 60 * 1000,
  });
}

/** Best-of list (`/catalog/best/{key}`): US figures, each naming its variant. */
export function useCatalogBest(key: string | undefined, limit?: number) {
  return useQuery({
    queryKey: ["catalog", "best", key, limit ?? null],
    queryFn: ({ signal }) =>
      get<CatalogBestResponse>(`/catalog/best/${encodeURIComponent(key ?? "")}`, limit ? { limit } : undefined, signal),
    enabled: !!key,
    retry,
  });
}

/**
 * A model by its API slug (`tesla-model-3`, also legacy slugs such as
 * `polestar-two`): the resolver gives the model path, then the full tree loads.
 * `error` is the first failure (404 = no such model, 503 = catalog not migrated).
 */
export function useCatalogModelBySlug(slug: string | undefined) {
  const resolved = useCatalogResolve("model", slug ? slug.toLowerCase() : undefined);
  const m = /^\/make\/([^/]+)\/([^/]+)$/.exec(resolved.data?.path ?? "");
  const model = useCatalogModel(m?.[1], m?.[2]);
  const wrongPath = !!resolved.data && !m;
  return {
    data: model.data,
    error: resolved.error ?? model.error,
    notFound: isNotFound(resolved.error) || isNotFound(model.error) || wrongPath,
    isLoading: resolved.isLoading || (!!m && model.isLoading),
  };
}

/**
 * What changed between two adjacent versions. Either order is accepted; the response
 * carries the canonical `path` (older first). `market` switches the rows shown.
 */
export function useCatalogChanges(
  make: string | undefined,
  model: string | undefined,
  older: string | undefined,
  newer: string | undefined,
  market?: string | null
) {
  return useQuery({
    queryKey: ["catalog", "changes", make, model, older, newer, market ?? null],
    queryFn: ({ signal }) =>
      get<CatalogChangesResponse>(
        `/catalog/changes/${[make, model, older, newer].map((s) => encodeURIComponent(s ?? "")).join("/")}`,
        market ? { market } : undefined,
        signal
      ),
    enabled: !!make && !!model && !!older && !!newer,
    retry,
    // Switching market keeps the same pair on screen while the new rows load
    // (never another pair's data: the page redirects on a path mismatch).
    placeholderData: (prev, prevQuery) =>
      prevQuery && [make, model, older, newer].every((v, i) => prevQuery.queryKey[i + 2] === v) ? prev : undefined,
  });
}

export function useCatalogMeta() {
  return useQuery({
    queryKey: ["catalog", "meta"],
    queryFn: ({ signal }) => get<CatalogMeta>("/catalog/meta", undefined, signal),
    retry,
    staleTime: 30 * 60 * 1000,
  });
}
