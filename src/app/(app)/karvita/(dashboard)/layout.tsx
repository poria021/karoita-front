import type { ReactNode } from 'react';

import { KarvitaModuleAccessGuard } from '@/components/shared/shell/KarvitaModuleAccessGuard';

export default function KarvitaDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <KarvitaModuleAccessGuard>{children}</KarvitaModuleAccessGuard>;
}
