import { Outlet } from "react-router-dom";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout() {
  return (
    <div>
      <Analytics />
      <GoogleAnalytics />
      <Outlet />
    </div>
  );
}
