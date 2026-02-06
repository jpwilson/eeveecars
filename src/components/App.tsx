import {
  createBrowserRouter,
  createRoutesFromElements,
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
import InsightsPage from "../pages/InsightsPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/car_detail/:id" element={<CarDetail />} />
      <Route path="/model_detail/:make_model_slug" element={<ModelDetails />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/insights" element={<InsightsPage />} />
      <Route path="/layout_test" element={<Layouts />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
