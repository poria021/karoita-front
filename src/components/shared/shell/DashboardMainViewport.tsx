'use client';

import type { ReactNode } from 'react';

import { DashboardFooter } from '@/components/shared/shell/DashboardFooter';
import { ModulePageHeader } from '@/components/shared/shell/ModulePageHeader';
import { DASHBOARD_MAIN_ID } from '@/components/shared/shell/SkipToMainContent';

interface DashboardMainViewportProps {
  children: ReactNode;
}

export function DashboardMainViewport({ children }: DashboardMainViewportProps) {
  return (
    <main
      id={DASHBOARD_MAIN_ID}
      tabIndex={-1}
      className="flex min-h-[550px] min-w-0 flex-1 flex-col rounded-none bg-kv-main px-kv-inset py-kv-group text-start shadow-kv-raised outline-none sm:px-kv-page sm:py-kv-section lg:min-h-[calc(100dvh-4rem)]"
    >
      <ModulePageHeader />
      <div className="flex min-h-0 w-full flex-1 flex-col pt-kv-pair">
        {children}
      </div>
      <DashboardFooter />
    </main>
  );
}
