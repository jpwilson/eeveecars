# PostHog Analytics Setup

This project uses [PostHog](https://posthog.com/) for product analytics alongside Google Analytics to track user behavior, engagement, and conversion events.

## Environment Variables

PostHog analytics requires one environment variable to be configured:

### Required Variables

- **`VITE_POSTHOG_KEY`** - Your PostHog project API key
  - Get this from your PostHog project settings at https://us.posthog.com/project/settings
  - If this variable is not set, analytics will be **disabled gracefully** and the app will continue to work normally

### Optional Variables

- **`VITE_POSTHOG_HOST`** (optional) - PostHog API host URL
  - **Default**: `https://us.i.posthog.com` (PostHog Cloud US)
  - Only override this if you're using PostHog Cloud EU or self-hosted PostHog

## Vercel Deployment Setup

To enable PostHog analytics in your Vercel deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:
   - **Name**: `VITE_POSTHOG_KEY`
   - **Value**: Your PostHog API key (starts with `phc_`)
   - **Environments**: Select `Production`, `Preview`, and `Development` as needed
4. Optionally add `VITE_POSTHOG_HOST` if you're not using PostHog Cloud US
5. Redeploy your application for the changes to take effect

## What's Tracked

PostHog captures the following events to help understand user engagement:

### Automatic Events
- **Pageviews** - Tracked on every route change (SPA-aware)
- **Page exits** - When users leave the page

### Custom Events
- **`model_viewed`** - When a user views an EV model details page
  - Properties: `make`, `model`, `submodel`, `car_id`, `view_type`
- **`compare_mode_toggled`** - When comparison mode is enabled/disabled
  - Properties: `enabled`
- **`filter_used`** - When users apply or remove filters
  - Properties: `action`, `feature`, `bucket`, `matching_cars`
- **`external_link_clicked`** - When users click links to external sites
  - Properties: `link_type`, `destination`, and relevant context (make, model, etc.)
  - Tracked link types: manufacturer websites, reviews, news articles, model pages

### Referrer Tracking

PostHog automatically captures referrer information, including traffic from:
- `chatgpt.com`
- `perplexity.ai`
- Search engines
- Direct traffic
- Any other referring sites

## Privacy & Data Collection

- **No PII (Personally Identifiable Information)** is collected
- User profiles are only created for identified users (not anonymous visitors)
- Page leave events are captured for engagement metrics
- Autocapture is disabled - only explicit events are tracked

## Testing Analytics Locally

To test PostHog analytics in development:

1. Create a `.env.local` file in the project root
2. Add your PostHog credentials:
   ```
   VITE_POSTHOG_KEY=phc_your_key_here
   VITE_POSTHOG_HOST=https://us.i.posthog.com
   ```
3. Run the development server: `npm run dev`
4. Visit http://localhost:5173 and interact with the app
5. Check the PostHog dashboard to verify events are being captured

## Graceful Degradation

If PostHog is not configured (missing API key), the application will:
- Continue to function normally
- Skip PostHog initialization
- Not send any events to PostHog
- Still send events to Google Analytics (if configured)

This ensures analytics issues never break the user experience.
