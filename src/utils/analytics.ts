import ReactGA from "react-ga4";
import posthog from "posthog-js";

/**
 * Unified analytics helper that sends events to both GA4 and PostHog.
 * Business events we optimize against:
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
    if (import.meta.env.VITE_POSTHOG_KEY) {
      posthog.capture(name, params);
    }
  } catch {
    /* no-op */
  }
};
