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
 * Master shell for every `/karvita/*` dashboard page (rule 00, #6): `Header`
 * and `Sidebar` are rendered once, here, outside the nested `page.tsx`
 * routes — Next.js keeps this layout mounted across client-side navigations
 * within the group, so neither one flashes or remounts on route changes.
 */
export default function KarvitaDashboardLayout({ children }: KarvitaDashboardLayoutProps) {
  return (
    <HydrationSafe>
      <div className="flex min-h-screen w-full flex-col bg-slate-50/50">
        <Header />

        <div className="flex w-full flex-1 flex-col items-stretch gap-6 px-0 py-6 sm:px-6 lg:flex-row lg:px-6 xl:px-8 2xl:px-16">
          <Sidebar />
          <DashboardMainViewport>{children}</DashboardMainViewport>
        </div>
      </div>
    </HydrationSafe>
  );
}
