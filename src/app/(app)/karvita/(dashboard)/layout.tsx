import type { ReactNode } from 'react';

import { KarvitaModuleAccessGuard } from '@/components/shared/shell/KarvitaModuleAccessGuard';

/**
 * Karvita dashboard route group — shell comes from `/(app)/layout.tsx`.
 * Module + role-home gating is a single client guard (rule 45).
 * Client-gated auth lives in AppAuthGuard; no force-dynamic required.
 */
export default function KarvitaDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <KarvitaModuleAccessGuard>{children}</KarvitaModuleAccessGuard>;
}
