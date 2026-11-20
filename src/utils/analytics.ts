import ReactGA from "react-ga4";
import posthog from "posthog-js";

/**
 * Unified analytics helper that sends events to both GA4 and PostHog.
 * Business events we optimize against:
 *  - signed_up             (account creation, key conversion metric)
 *  - newsletter_subscribe  (audience building)
 *  - advertise_contact_click (sponsorship pipeline)
 *  - sponsor_spot_click    (advertiser interest in the featured slot)
 *  - featured_card_click   (does the featured slot earn its placement?)
 *  - compare_mode_toggled  (core engagement loop)
 *  - model_viewed          (engagement)
 *  - filter_used           (engagement)
 *  - external_link_clicked (conversion tracking)
 * Never throws — analytics must not break the product.
 */
export const track = (name: string, params?: Record<string, unknown>) => {
  try {
    ReactGA.event(name, params);
  } catch {
    /* no-op */
  }

  try {
    posthog.capture(name, params);
  } catch {
    /* no-op */
  }
};

/**
 * Identify a user in analytics. Call this once when a user signs up or signs in.
 * @param userId - The internal user ID (not email, for privacy)
 * @param properties - Optional user properties (avoid PII)
 */
export const identifyUser = (userId: string, properties?: Record<string, unknown>) => {
  try {
    posthog.identify(userId, properties);
  } catch {
    /* no-op */
  }
};

/**
 * Track a successful signup. Call this ONCE when a new account is created.
 * @param userId - The internal user ID
 * @param method - How they signed up (e.g., 'email', 'google', 'twitter')
 */
export const trackSignup = (userId: string, method: string) => {
  try {
    posthog.identify(userId);
    posthog.capture("signed_up", { method });
  } catch {
    /* no-op */
  }
};
