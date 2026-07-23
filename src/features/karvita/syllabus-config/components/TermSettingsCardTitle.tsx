import type { ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';

/** Shared card heading for term-settings panels — one size + weight everywhere. */
export function TermSettingsCardTitle({ children }: { children: ReactNode }) {
  return (
    <KvTypography variant="subtitle" weight="black" as="h4">
      {children}
    </KvTypography>
  );
}
