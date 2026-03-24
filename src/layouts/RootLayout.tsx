import { Outlet } from "react-router-dom";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react";
import { Box } from "@chakra-ui/react";

export default function RootLayout() {
  return (
    <Box as="main" minH="100vh" display="flex" flexDirection="column">
      <Analytics />
      <GoogleAnalytics />
      <Box flex="1">
        <Outlet />
      </Box>
    </Box>
  );
}
