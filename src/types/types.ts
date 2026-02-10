import { Car } from "../hooks/useCars";

export interface SortOption {
  field: keyof Car | "popularity";
  direction: "asc" | "desc";
}