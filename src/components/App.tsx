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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />} errorElement={<NotFoundPage />}>
      <Route index element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/car_detail/:id" element={<CarDetail />} />
      <Route path="/model_detail/:make_model_slug" element={<ModelDetails />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/news" element={<MarketplacePage />} /> {/* TODO: replace with NewsPage */}
      <Route path="/insights" element={<Navigate to="/news" replace />} />
      <Route path="/manufacturer/:make_name" element={<ManufacturerPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/advertise" element={<AdvertisePage />} />
      <Route path="/advertize" element={<Navigate to="/advertise" replace />} />
      <Route path="/compare/:pair" element={<ComparePage />} />
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
