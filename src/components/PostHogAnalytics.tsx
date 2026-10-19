import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || "";
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
  isInitialized = true;
}

const PostHogAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (POSTHOG_KEY && isInitialized) {
      posthog.capture("$pageview", {
        $current_url: window.location.href,
        path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
};

export default PostHogAnalytics;
