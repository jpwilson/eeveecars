import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";

/**
 * Generic list fetcher backed by React Query: concurrent components asking
 * for the same endpoint share one request + cache (5-min staleTime is set on
 * the QueryClient in main.tsx). Return shape kept compatible with the old
 * hand-rolled hook: { data, error, isLoading }.
 */
const useData = <T>(endpoint: string) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["list", endpoint],
    queryFn: async ({ signal }) => {
      const res = await apiClient.get<T[]>(endpoint, { signal });
      return res.data;
    },
  });

  return {
    data: (data ?? []) as T[],
    error: error ? (error as Error).message : "",
    isLoading,
  };
};

export default useData;
