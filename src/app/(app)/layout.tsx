import type { ReactNode } from 'react';

import { AppAuthGuard } from '@/components/shared/shell/AppAuthGuard';
import { DashboardChrome } from '@/components/shared/shell/DashboardChrome';
import { HydrationSafe } from '@/components/shared/shell/HydrationSafe';
import { SkipToMainContent } from '@/components/shared/shell/SkipToMainContent';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <SkipToMainContent />
      <HydrationSafe>
        <AppAuthGuard>
          <DashboardChrome>{children}</DashboardChrome>
        </AppAuthGuard>
      </HydrationSafe>
    </>
  );
}
