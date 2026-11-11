import { ReactNode } from "react";
import { Center, Spinner } from "@chakra-ui/react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { isNotFound, useCatalogResolve } from "../../hooks/useCatalog";
import NotFoundPage from "../../pages/NotFoundPage";

interface Props {
  kind: "model" | "make" | "variant";
  /** route param holding the legacy key */
  param: string;
  /** the old page, rendered while the catalog is not available (503 / network error) */
  fallback: ReactNode;
}

/**
 * Old URLs (/model_detail/:slug, /manufacturer/:slug, /car_detail/:id) ask the
 * backend resolver for the new path and replace the history entry with it.
 * A miss is a 404; if the catalog is not available yet the legacy page renders.
 * (Crawlers get a real 301 from api/prerender.js before the SPA loads.)
 */
export default function LegacyRedirect({ kind, param, fallback }: Props) {
  const params = useParams();
  const { search, hash } = useLocation();
  const key = (params[param] ?? "").toLowerCase().replace(/\/+$/, "");
  const { data, error, isLoading } = useCatalogResolve(kind, key || undefined);

  if (!key) return <NotFoundPage />;
  if (isLoading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="green.500" thickness="4px" />
      </Center>
    );
  }
  if (data?.path) return <Navigate to={`${data.path}${search}${hash}`} replace />;
  if (isNotFound(error)) return <NotFoundPage />;
  return <>{fallback}</>;
}
