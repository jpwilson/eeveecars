import axios from "axios";

// The catalog API (`/catalog/*`) lives on the same backend as the legacy
// endpoints. VITE_CATALOG_API_URL lets local dev point only the catalog at a
// different backend (e.g. http://localhost:8011); otherwise the normal
// VITE_REACT_APP_API_URL is used.
export const CATALOG_API_URL = ((import.meta.env.VITE_CATALOG_API_URL as string | undefined) ||
  (import.meta.env.VITE_REACT_APP_API_URL as string | undefined) ||
  "").replace(/\/$/, "");

const catalogClient = axios.create({ baseURL: CATALOG_API_URL });

export default catalogClient;
