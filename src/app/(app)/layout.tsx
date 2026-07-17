import type { ReactNode } from 'react';

import { DashboardMainViewport } from '@/components/shared/DashboardMainViewport';
import { Header } from '@/components/shared/Header';
import HydrationSafe from '@/components/shared/HydrationSafe';
import { Sidebar } from '@/components/shared/Sidebar';

/**
 * Shared authenticated shell for every route under `/(app)/*`
 * (portal + domain dashboards). Domain layouts may add extras but must
 * not re-mount Header/Sidebar (rule 00, #6).
 */
export const dynamic = 'force-dynamic';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <HydrationSafe>
      <div className="flex min-h-dvh w-full flex-col bg-kv-canvas">
        <Header />
        <div className="relative flex w-full flex-1 flex-col items-stretch gap-kv-group px-0 py-kv-group sm:px-6 lg:flex-row lg:px-6 lg:py-kv-group xl:px-8 2xl:px-16">
          <Sidebar />
          <DashboardMainViewport>{children}</DashboardMainViewport>
        </div>
      </div>
    </HydrationSafe>
  );
}
