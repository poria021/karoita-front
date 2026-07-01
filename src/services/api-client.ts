import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// TODO (Backend Intercept): Point baseURL to NextJS proxy or actual NestJS Server backend
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor - runs before every outgoing request.
 *
 * Responsible for attaching the bearer token automatically so call sites
 * never have to remember to set `Authorization` themselves. The extraction
 * strategy is intentionally left as a placeholder since the final source of
 * truth depends on how auth is wired up:
 *   - if better-auth's session cookie is used server-side, this may not be
 *     needed at all (cookies are sent automatically by the browser); or
 *   - if a bearer token is issued (e.g. better-auth's bearer plugin, or a
 *     custom NestJS JWT), read it from `localStorage`/`useUserStore` here.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO (Backend Intercept): extract the real token, e.g.:
    //   const token = useUserStore.getState().currentUser?.token
    //     ?? localStorage.getItem("karvita_bearer_token");
    const token: string | null = null;

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response interceptor - runs on every response/error before it reaches the
 * calling code, so cross-cutting error handling lives in one place instead
 * of being repeated at every call site.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // TODO (Backend Intercept): trigger a global "session expired" alert
      // (e.g. `toast.error("Your session has expired, please sign in again.")`
      // via `sonner`) and redirect to the login page / call `logout()` from
      // `useUserStore` once that wiring is in place.
    }

    // TODO (Backend Intercept): surface other generic error statuses
    // (403, 404, 500, network/timeout errors) via the same global `sonner`
    // toast pipeline once it is introduced, instead of failing silently.

    return Promise.reject(error);
  }
);

export { apiClient };
