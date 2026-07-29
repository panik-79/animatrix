export const AUTH_CONFIG = {
  COOKIE_NAME: "animatrix_session",
  SESSION_DURATION: 7 * 24 * 60 * 60, // 7 days in seconds
  OAUTH_COOKIE_MAX_AGE: 10 * 60,       // 10 minutes in seconds

  get JWT_SECRET(): Uint8Array {
    return new TextEncoder().encode(
      process.env.JWT_SECRET || "animatrix-secret-jwt-key-production-grade-2026"
    );
  },

  PROTECTED_ROUTES: ["/library", "/stats", "/dashboard", "/collections", "/settings", "/account", "/onboarding"],
  AUTH_ROUTES: ["/login", "/register"],

  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
} as const;
