import type { ReactNode } from 'react';

import HydrationSafe from '@/components/shared/HydrationSafe';
import { Header } from '@/components/shared/Header';
import { Sidebar } from '@/components/shared/Sidebar';
import { DashboardMainViewport } from '@/components/shared/DashboardMainViewport';

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
      <div className="flex min-h-screen w-full flex-col bg-[#faf9f8]">
        <Header />
        <div className="relative flex w-full flex-1 flex-col items-stretch gap-6 px-0 py-6 sm:px-6 lg:flex-row lg:px-6 lg:py-6 xl:px-8 2xl:px-16">
          <Sidebar />
          <DashboardMainViewport>{children}</DashboardMainViewport>
        </div>
      </div>
    </HydrationSafe>
  );
}
