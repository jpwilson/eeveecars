import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";

import RootLayout from "../layouts/RootLayout";
import HomePage from "../pages/HomePage";
import CarDetail from "../pages/CarDetailPage";
import Layouts from "../pages/Layouts";
import ModelDetails from "./ModelDetails";
import PeoplePage from "../pages/PeoplePage";
import AboutPage from "../pages/AboutPage";
import MarketplacePage from "../pages/MarketplacePage";
import ManufacturerPage from "../pages/ManufacturerPage";
import AdminPage from "../pages/AdminPage";
import AuthCallbackPage from "../pages/AuthCallbackPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import DashboardPage from "../pages/DashboardPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
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
      <Route path="/layout_test" element={<Layouts />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
