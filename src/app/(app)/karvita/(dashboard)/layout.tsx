import type { ReactNode } from 'react';

/**
 * Karvita dashboard route group — shell comes from `/(app)/layout.tsx`.
 * Domain-specific chrome can be added here later without duplicating Header/Sidebar.
 */
export const dynamic = 'force-dynamic';

export default function KarvitaDashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
