type AnalyticsEvent =
  | "story_view"
  | "story_post"
  | "message_send"
  | "credit_purchase"
  | "map_location"
  | "check_in"
  | "navigation";

export const track = (event: AnalyticsEvent, payload?: Record<string, unknown>) => {
  // Placeholder instrumentation hook; replace with Segment/Amplitude/Sentry as needed.
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, payload ?? {});
  }
};
