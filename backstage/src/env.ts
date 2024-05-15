const env =
  (window as any).SERVER_DATA && (window as any).SERVER_DATA.env ? (window as any).SERVER_DATA.env : {};
export const NODE_ENV = env.NODE_ENV || "development";
// export const DEBUG_ENABLED = env.DEBUG_ENABLED || 1;
export const DEBUG_ENABLED = 1;
export const API_URL = env.API_URL || "http://localhost:4000";
export const EMBED_URL = env.EMBED_URL || 'http://localhost:3002';
export const GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY || null;
export const MAPBOX_TOKEN =
  "pk.eyJ1IjoibWlrZXRoZXNlbGxvdXQiLCJhIjoiY2s1ZnZzanRkMDFqMTNwbDNjYmt2OGg3byJ9.ZXejRJcln7vehTgvGieVcg";
export const SENTRY_DSN = env.SENTRY_DSN || null;