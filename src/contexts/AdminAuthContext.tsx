import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import adminApiClient from "../services/admin-api-client";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isVerifying: boolean;
  error: string | null;
  login: (key: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!sessionStorage.getItem("ev_admin_key")
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (key: string): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);
    sessionStorage.setItem("ev_admin_key", key);
    try {
      await adminApiClient.get("/admin/verify");
      setIsAuthenticated(true);
      setIsVerifying(false);
      return true;
    } catch {
      sessionStorage.removeItem("ev_admin_key");
      setIsAuthenticated(false);
      setError("Invalid admin key");
      setIsVerifying(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("ev_admin_key");
    setIsAuthenticated(false);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, isVerifying, error, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
}
