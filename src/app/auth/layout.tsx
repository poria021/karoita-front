import type { ReactNode } from 'react';

/**
 * Auth layout — wrapper for /auth/* routes (login, register, forgot, admin-gate).
 *
 * The Vazirmatn font variable (`--font-vazirmatn`) is already applied on
 * <body> inside the root layout (`src/app/layout.tsx`). Re-applying it here
 * caused Next.js to emit a duplicate <link rel="preload"> for the font CSS
 * chunk on every /auth/* page, triggering the browser warning:
 *   "preloaded but not used within a few seconds from the window's load event"
 *
 * Removing the redundant font class from this layout eliminates the duplicate
 * preload without affecting typography — the CSS variable is already in scope
 * from the root <body>.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
