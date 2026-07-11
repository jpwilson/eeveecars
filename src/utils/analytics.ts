import ReactGA from "react-ga4";

/**
 * GA4 custom-event helper. Business events we optimize against:
 *  - newsletter_subscribe  (audience building)
 *  - advertise_contact_click (sponsorship pipeline)
 *  - sponsor_spot_click    (advertiser interest in the featured slot)
 *  - featured_card_click   (does the featured slot earn its placement?)
 *  - compare_mode_toggled  (core engagement loop)
 * Never throws — analytics must not break the product.
 */
export const track = (name: string, params?: Record<string, unknown>) => {
  try {
    ReactGA.event(name, params);
  } catch {
    /* no-op */
  }
};
