'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { AdminShellHeader } from '@/components/shared/shell/AdminShellHeader';
import { AdminSidebar } from '@/components/shared/shell/AdminSidebar';
import { DashboardMainViewport } from '@/components/shared/shell/DashboardMainViewport';
import { Header } from '@/components/shared/shell/Header';
import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';
import { Sidebar } from '@/components/shared/shell/Sidebar';
import {
  kvShellAdminMainGutterClassName,
  kvShellAdminRailClearanceClassName,
  kvShellAdminRailClearanceMotionClassName,
  kvShellContentPadXClassName,
  kvShellLearnerDashboardWidthClassName,
} from '@/components/shared/shell/shellChrome';
import { useShellCatalogReady } from '@/components/shared/shell/useShellCatalogReady';
import { isAdminReportsPath } from '@/features/karvita/reports/lib/report-path';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';
import {
  isLearnerDashboardRole,
  isStaffAdminRole,
} from '@/utils/RoleStrategyMap';

interface DashboardChromeProps {
  children: ReactNode;
}

/**
 * شل اپ: ادمین ستادی ریل تمام‌قد شروع (لوگو در ریل؛ هدر و `main` خالی می‌کنند).
 * نقش‌های دیگر همان پشتهٔ هدر سپس سایدبار کارتی.
 * روی ریلود، تا کاتالوگ منوی پویا آماده نشود لودر برند می‌ماند (بدون فلش سایدبار).
 */
export function DashboardChrome({ children }: DashboardChromeProps) {
  const role = useUserStore((state) => state.activeUser?.role);
  const catalogReady = useShellCatalogReady();

  if (!catalogReady) {
    return (
      <KvBrandLinearLoader fullViewport label="لطفا منتظر بمانید…" />
    );
  }

  if (isStaffAdminRole(role)) {
    return <AdminDashboardChrome>{children}</AdminDashboardChrome>;
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-kv-canvas">
      <Header />
      <div
        data-slot="kv-org-dashboard-frame"
        className={cn(
          'relative flex w-full flex-1 flex-col items-stretch gap-kv-group lg:flex-row',
          kvShellContentPadXClassName,
          isLearnerDashboardRole(role) && kvShellLearnerDashboardWidthClassName
        )}
      >
        <Sidebar />
        <DashboardMainViewport>{children}</DashboardMainViewport>
      </div>
    </div>
  );
}

function AdminDashboardChrome({ children }: DashboardChromeProps) {
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const pathname = usePathname();
  const reportsDual = isAdminReportsPath(pathname) && isCollapsed;

  return (
    <div className="flex min-h-dvh w-full flex-col bg-kv-canvas">
      <AdminSidebar />
      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
        {/* هدر فقط ریل اصلی را خالی می‌کند؛ با ریل دوم گزارش روی آن می‌نشیند. */}
        <div
          className={cn(
            kvShellAdminRailClearanceMotionClassName,
            kvShellAdminRailClearanceClassName(isCollapsed, false)
          )}
        >
          <AdminShellHeader />
        </div>
        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col',
            kvShellAdminRailClearanceMotionClassName,
            kvShellAdminRailClearanceClassName(isCollapsed, reportsDual),
            kvShellAdminMainGutterClassName
          )}
        >
          <DashboardMainViewport className="bg-transparent">
            {children}
          </DashboardMainViewport>
        </div>
      </div>
    </div>
  );
}
