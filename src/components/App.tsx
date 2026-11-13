import { lazy } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";

import RootLayout from "../layouts/RootLayout";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import LegacyRedirect from "./catalog/LegacyRedirect";

// Route-level code splitting: HomePage stays eager (the landing view);
// everything else loads on demand, keeping the main chunk small.
const CarDetail = lazy(() => import("../pages/CarDetailPage"));
const Layouts = lazy(() => import("../pages/Layouts"));
const ModelDetails = lazy(() => import("./ModelDetails"));
const PeoplePage = lazy(() => import("../pages/PeoplePage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const MarketplacePage = lazy(() => import("../pages/MarketplacePage"));
const ManufacturerPage = lazy(() => import("../pages/ManufacturerPage"));
const AdminPage = lazy(() => import("../pages/AdminPage"));
const AuthCallbackPage = lazy(() => import("../pages/AuthCallbackPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const PrivacyPage = lazy(() => import("../pages/PrivacyPage"));
const TermsPage = lazy(() => import("../pages/TermsPage"));
const AdvertisePage = lazy(() => import("../pages/AdvertisePage"));
const ComparePage = lazy(() => import("../pages/ComparePage"));
const BestPage = lazy(() => import("../pages/BestPage"));
const CompareIndexPage = lazy(() => import("../pages/CompareIndexPage"));
const BestIndexPage = lazy(() => import("../pages/BestIndexPage"));
// Catalog pages (make → model → generation → variant) and the browse page
const AllCarsPage = lazy(() => import("../pages/AllCarsPage"));
const MakesIndexPage = lazy(() => import("../pages/catalog/MakesIndexPage"));
const MakePage = lazy(() => import("../pages/catalog/MakePage"));
const ModelPage = lazy(() => import("../pages/catalog/ModelPage"));
const GenerationPage = lazy(() => import("../pages/catalog/GenerationPage"));
const VariantPage = lazy(() => import("../pages/catalog/VariantPage"));
const GenerationChangesPage = lazy(() => import("../pages/catalog/GenerationChangesPage"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />} errorElement={<NotFoundPage />}>
      <Route index element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/cars" element={<AllCarsPage />} />
      <Route path="/make" element={<MakesIndexPage />} />
      <Route path="/make/:make" element={<MakePage />} />
      <Route path="/make/:make/:model" element={<ModelPage />} />
      <Route path="/make/:make/:model/changes/:pair" element={<GenerationChangesPage />} />
      <Route path="/make/:make/:model/:generation" element={<GenerationPage />} />
      <Route path="/make/:make/:model/:generation/:variant" element={<VariantPage />} />
      {/* Legacy URLs redirect to the catalog pages; the old pages remain as the
          fallback while the catalog is not available on the backend (503). */}
      <Route
        path="/car_detail/:id"
        element={<LegacyRedirect kind="variant" param="id" fallback={<CarDetail />} />}
      />
      <Route
        path="/model_detail/:make_model_slug"
        element={<LegacyRedirect kind="model" param="make_model_slug" fallback={<ModelDetails />} />}
      />
      <Route
        path="/manufacturer/:make_name"
        element={<LegacyRedirect kind="make" param="make_name" fallback={<ManufacturerPage />} />}
      />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/news" element={<MarketplacePage />} /> {/* TODO: replace with NewsPage */}
      <Route path="/insights" element={<Navigate to="/news" replace />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/advertise" element={<AdvertisePage />} />
      <Route path="/advertize" element={<Navigate to="/advertise" replace />} />
      <Route path="/compare" element={<CompareIndexPage />} />
      <Route path="/compare/:pair" element={<ComparePage />} />
      <Route path="/best" element={<BestIndexPage />} />
      <Route path="/best/:criteria" element={<BestPage />} />
      <Route path="/layout_test" element={<Layouts />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
