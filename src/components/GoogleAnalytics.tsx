import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga";

const TRACKING_ID = import.meta.env.REACT_APP_GA_TRACKING_ID || "";

// Initialize ReactGA
if (TRACKING_ID) {
  ReactGA.initialize(TRACKING_ID);
} else {
  console.error("Google Analytics tracking ID not set");
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
