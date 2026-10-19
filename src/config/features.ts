/**
 * Features that exist in the UI but are not live yet. Flip a flag only when
 * the real implementation (online play, store billing) is in place.
 */
export const FEATURES = {
  multiplayer: false,
  plusSubscription: false,
} as const;

export const APP_VERSION = "0.1.0";
