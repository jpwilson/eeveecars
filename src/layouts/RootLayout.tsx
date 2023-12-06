import { Outlet } from "react-router-dom";
import GoogleAnalytics from "../components/GoogleAnalytics";

export default function RootLayout() {
  return (
    <div>
      <GoogleAnalytics />
      <Outlet />
    </div>
  );
}
