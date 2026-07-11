import axios from "axios";
import { supabase } from "./supabase-client";

/**
 * Authenticated API client.
 * Attaches JWT Bearer token from Supabase auth session on every request.
 * Does NOT cache the token — calls getSession() per-request for freshness.
 */
const authApiClient = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL as string,
});

authApiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

export default authApiClient;
