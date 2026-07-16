import type { ReactNode } from 'react';

import HydrationSafe from '@/components/shared/HydrationSafe';
import { Header } from '@/components/shared/Header';
import { Sidebar } from '@/components/shared/Sidebar';
import { DashboardMainViewport } from '@/components/shared/DashboardMainViewport';

/**
 * Dashboard sub-routes read live, per-request auth/role state — never
 * statically cache them (rule 20, "Dynamic Execution Guard").
 */
export const dynamic = 'force-dynamic';

interface KarvitaDashboardLayoutProps {
  children: ReactNode;
}

/**
 * Master shell for every `/karvita/*` dashboard page (rule 00, #6):
 * Matches the exact grid spacings and outer paddings of original-karvita.html.
 */
export default function KarvitaDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <HydrationSafe>
      <div className="flex min-h-screen w-full flex-col bg-[#faf9f8]">
        <Header />

        <div className="w-full px-0 sm:px-6 lg:px-6 xl:px-8 2xl:px-16 py-6 lg:py-6 flex-1 flex flex-col lg:flex-row gap-6 items-stretch relative">
          <Sidebar />
          <DashboardMainViewport>{children}</DashboardMainViewport>
        </div>
      </div>
    </HydrationSafe>
  );
}