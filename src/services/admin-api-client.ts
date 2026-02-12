import axios from "axios";

const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL as string,
});

adminApiClient.interceptors.request.use((config) => {
  const adminKey = sessionStorage.getItem("ev_admin_key");
  if (adminKey) {
    config.headers["X-Admin-Key"] = adminKey;
  }
  config.headers[import.meta.env.VITE_API_SECRET_KEY_NAME as string] =
    import.meta.env.VITE_API_SECRET_KEY as string;
  return config;
});

export default adminApiClient;
