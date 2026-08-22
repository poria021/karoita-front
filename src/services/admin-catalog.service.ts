/**
 * @deprecated Dead code — never imported anywhere in the app.
 * org-structure.service.ts calls `adminCatalogApi` (the lower-level HTTP
 * layer in `@/services/admin-catalog/admin-catalog.api`) directly instead
 * of going through this facade, which made this a duplicate/parallel HTTP
 * client for the same endpoints (violates the single-facade rule).
 *
 * This file is intentionally left as a no-op stub instead of being force-
 * deleted by an automated edit (no filesystem delete tool available here).
 * Please remove it by running:
 *
 *   git rm src/services/admin-catalog.service.ts
 *
 * Nothing in the codebase imports `AdminCatalogService` — verified by
 * scanning every source file under src/. Safe to delete immediately.
 */
export {};
