import React, { Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Box, Spinner, Flex } from "@chakra-ui/react";

import RootLayout from "../layouts/RootLayout";
import HomePage from "../pages/HomePage";

// Lazy-loaded routes for code splitting
const CarDetail = React.lazy(() => import("../pages/CarDetailPage"));
const ModelDetails = React.lazy(() => import("./ModelDetails"));
const PeoplePage = React.lazy(() => import("../pages/PeoplePage"));
const AboutPage = React.lazy(() => import("../pages/AboutPage"));
const MarketplacePage = React.lazy(() => import("../pages/MarketplacePage"));
const InsightsPage = React.lazy(() => import("../pages/InsightsPage"));
const ManufacturerPage = React.lazy(() => import("../pages/ManufacturerPage"));
const AdminPage = React.lazy(() => import("../pages/AdminPage"));
const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"));
const Layouts = React.lazy(() => import("../pages/Layouts"));

const PageLoader = () => (
  <Flex minH="60vh" align="center" justify="center">
    <Spinner size="lg" color="green.500" thickness="3px" />
  </Flex>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/about" element={<Suspense fallback={<PageLoader />}><AboutPage /></Suspense>} />
      <Route path="/car_detail/:id" element={<Suspense fallback={<PageLoader />}><CarDetail /></Suspense>} />
      <Route path="/model_detail/:make_model_slug" element={<Suspense fallback={<PageLoader />}><ModelDetails /></Suspense>} />
      <Route path="/people" element={<Suspense fallback={<PageLoader />}><PeoplePage /></Suspense>} />
      <Route path="/marketplace" element={<Suspense fallback={<PageLoader />}><MarketplacePage /></Suspense>} />
      <Route path="/insights" element={<Suspense fallback={<PageLoader />}><InsightsPage /></Suspense>} />
      <Route path="/manufacturer/:make_name" element={<Suspense fallback={<PageLoader />}><ManufacturerPage /></Suspense>} />
      <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
      <Route path="/layout_test" element={<Suspense fallback={<PageLoader />}><Layouts /></Suspense>} />
      <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
