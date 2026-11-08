import posthog from "posthog-js";

// PostHog: pageviews (including the agent switches that only rewrite the
// path), clicks and sessions. Events go through /ingest on our own domain
// (see next.config.ts) so ad blockers don't drop them.
try {
  posthog.init("phc_wHmU9xGagja5baLnbfXbBsDSepVnU7h5bBB6Do6DAdGs", {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-08-30",
  });
  // Every event carries which product it came from.
  posthog.register({ product: "gpty" });
} catch {
  // Analytics never gets to break the app.
}
