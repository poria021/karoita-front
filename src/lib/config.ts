const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/**
 * Centralized authentication cookie name (rule 40, #3). Defaults to
 * Better-Auth's own session cookie during the migration phase; swap the
 * `NEXT_PUBLIC_AUTH_COOKIE_NAME` env var once NestJS issues its own
 * HTTP-only cookie. Never hardcode this literal name anywhere else.
 */
const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "better-auth.session_token";

export { DEFAULT_LOGIN_REDIRECT, AUTH_COOKIE_NAME };
