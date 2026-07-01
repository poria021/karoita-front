import { isPublicPath } from "@/lib/public-paths";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/config";
import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

/**
 * Route prefixes that carry authenticated, role-bearing UI (the dashboard
 * shell and the admin panel). These get an explicit, named guard below -
 * distinct from the generic public/private split - since they are the most
 * likely places to need role-specific authorization as the RBAC system
 * (see `src/config/role-strategy.ts`) matures.
 */
const GUARDED_ROUTE_PREFIXES = ["/dashboard", "/admin"];

function isGuardedRoute(pathname: string): boolean {
  return GUARDED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * NOTE: as of Next.js 16, the `middleware.ts` file convention is deprecated
 * in favor of `proxy.ts` (exported function renamed `middleware` -> `proxy`).
 * This file IS this project's route-protection entry point - do not also add
 * a `middleware.ts`, Next.js will only recognize `proxy` going forward.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cheap, edge-safe check: does a better-auth session cookie exist at all?
  // This only proves a cookie is present, NOT that the session is still
  // valid or which role/permissions the user has - see the TODOs below.
  const sessionCookie = getSessionCookie(request);

  // Already authenticated users shouldn't see the auth pages again.
  if (sessionCookie && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  // Public marketing/docs/auth pages never require a session.
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // --- Dedicated guard for role-bearing areas (/dashboard, /admin) --------
  if (isGuardedRoute(pathname)) {
    if (!sessionCookie) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // TODO (Auth Refactor): this proxy layer intentionally stays limited to
    // a cheap cookie-*presence* check. Next.js 16 explicitly recommends
    // against doing real authorization here (see
    // https://nextjs.org/docs/app/api-reference/file-conventions/proxy) -
    // proxy/edge code can't reliably hit the database, and a forged/stale
    // cookie would otherwise silently grant access. Once role-based access
    // control is needed for these prefixes, validate it *server-side*,
    // colocated with the routes it protects, e.g.:
    //   1. In `(dashboard)/layout.tsx` / `src/app/admin/layout.tsx`, call
    //      `auth.api.getSession({ headers: await headers() })` - this is
    //      already the pattern used in `src/app/admin/layout.tsx`.
    //   2. Reject/`notFound()`/redirect when `session` is null, mirroring
    //      the check already done for `session.user.role !== "admin"`.
    //   3. For finer-grained gating, cross-reference the Karvita business
    //      role (`session.user.appRole`, see `src/db/schema.ts`) against
    //      `getRoleStrategy(...)`/`hasModuleAccess(...)` from
    //      `src/config/role-strategy.ts` to decide per-module access,
    //      rather than trying to encode that logic at this network layer.
  }

  // Fallback: any other non-public path still requires a session cookie.
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

// Match all routes except for static files and Next.js internal routes
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
