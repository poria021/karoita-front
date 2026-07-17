import type { ReactNode } from 'react';

import { KarvitaModuleAccessGuard } from '@/components/shared/KarvitaModuleAccessGuard';

/**
 * Karvita dashboard route group — shell comes from `/(app)/layout.tsx`.
 * Module access is gated until identity approval (except roles that opt out).
 */
export const dynamic = 'force-dynamic';

export default function KarvitaDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <KarvitaModuleAccessGuard>{children}</KarvitaModuleAccessGuard>;
}
