import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga";

const TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || "";

// Initialize ReactGA
if (TRACKING_ID) {
  ReactGA.initialize(TRACKING_ID);
  console.log("The WOKRING tridis: " + TRACKING_ID.slice(0, 4));
} else {
  console.error("Google Analytics tracking ID not set");
  console.log("The NOT WORKING tridis: " + TRACKING_ID.slice(0, 4));
}

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (TRACKING_ID) {
      ReactGA.pageview(location.pathname + location.search);
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics;
