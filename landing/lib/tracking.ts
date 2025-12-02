"use client";

type EventPayload = Record<string, string | number | boolean | undefined>;

export const track = (event: string, payload: EventPayload = {}) => {
  if (typeof window === "undefined") return;
  const gtag = (window as any).gtag;
  if (typeof gtag === "function") {
    gtag("event", event, payload);
    return;
  }
  // Lightweight fallback so clicks are still observable in dev/demo.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[track]", event, payload);
  }
};
