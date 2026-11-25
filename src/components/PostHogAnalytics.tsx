import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY?.trim();
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

let isInitialized = false;

if (POSTHOG_KEY && !isInitialized) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false,
  });
  
  // Distinguish EV Lineup events when a PostHog project serves multiple apps.
  posthog.register({ app: "evlineup" });
  
  isInitialized = true;
}

const PostHogAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (POSTHOG_KEY && isInitialized) {
      // Capture pageview with UTM parameters
      const params = new URLSearchParams(location.search);
      const utmParams: Record<string, string> = {};
      
      // Extract all UTM parameters
      params.forEach((value, key) => {
        if (key.startsWith("utm_")) {
          utmParams[key] = value;
        }
      });

      posthog.capture("$pageview", {
        $current_url: window.location.href,
        path: location.pathname + location.search,
        ...utmParams,
      });
    }
  }, [location]);

  return null;
};

export default PostHogAnalytics;
