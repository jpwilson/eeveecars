import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react";
import Footer from "../components/Footer";

// Pages that manage their own chrome (or shouldn't carry the public footer)
const NO_FOOTER_PREFIXES = ["/admin", "/about", "/auth", "/layout_test"];

export default function RootLayout() {
  const { pathname } = useLocation();
  const showFooter = !NO_FOOTER_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <div>
      <Analytics />
      <GoogleAnalytics />
      <Suspense
        fallback={
          <Center minH="60vh">
            <Spinner size="xl" color="green.500" thickness="4px" />
          </Center>
        }
      >
        <Outlet />
      </Suspense>
      {showFooter && <Footer />}
    </div>
  );
}
