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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/car_detail/:id" element={<CarDetail />} />
      <Route path="/model_detail/:make_model_slug" element={<ModelDetails />} />
      <Route path="/layout_test" element={<Layouts />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
