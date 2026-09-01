'use client';

import type { ReactNode } from 'react';

import { AdminShellHeader } from '@/components/shared/shell/AdminShellHeader';
import { AdminSidebar } from '@/components/shared/shell/AdminSidebar';
import { DashboardMainViewport } from '@/components/shared/shell/DashboardMainViewport';
import { Header } from '@/components/shared/shell/Header';
import { Sidebar } from '@/components/shared/shell/Sidebar';
import {
  kvShellAdminMainGutterClassName,
  kvShellAdminRailClearanceClassName,
  kvShellAdminRailClearanceMotionClassName,
  kvShellContentPadXClassName,
  kvShellLearnerDashboardWidthClassName,
} from '@/components/shared/shell/shellChrome';
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
 */
export function DashboardChrome({ children }: DashboardChromeProps) {
  const role = useUserStore((state) => state.activeUser?.role);

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

  return (
    <div className="flex min-h-dvh w-full flex-col bg-kv-canvas">
      <AdminSidebar />
      <div
        className={cn(
          'flex min-h-0 min-w-0 w-full flex-1 flex-col',
          kvShellAdminRailClearanceMotionClassName,
          kvShellAdminRailClearanceClassName(isCollapsed)
        )}
      >
        <AdminShellHeader />
        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col',
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
