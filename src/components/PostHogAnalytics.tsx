import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import posthog from "posthog-js";

// PostHog project key for Bookmarker/EV Lineup shared analytics (project 588858, US cloud)
// This is a PUBLIC client-side key (phc_*), safe to commit and ship in the bundle.
// Sites are distinguished by $host; we also set app='evlineup' as a super property.
const POSTHOG_KEY =
  import.meta.env.VITE_POSTHOG_KEY || "phc_o34s8vv6TWjzDemdh39CAW8d4R52qFzVt2RZCnQEEKqx";
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

let isInitialized = false;

// Initialize PostHog
if (POSTHOG_KEY && !isInitialized) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false,
  });
  
  // Register super property to distinguish this app from others in the shared project
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
