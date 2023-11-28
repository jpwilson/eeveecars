import { Car } from "../hooks/useCars";

export interface SortOption {
    field: keyof Car;
    direction: 'asc' | 'desc';
  }