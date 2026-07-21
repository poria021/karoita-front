'use client';

import type { ReactNode } from 'react';

import { DashboardFooter } from '@/components/shared/shell/DashboardFooter';
import { ModulePageHeader } from '@/components/shared/shell/ModulePageHeader';

interface DashboardMainViewportProps {
  children: ReactNode;
}

export function DashboardMainViewport({ children }: DashboardMainViewportProps) {
  return (
    <main className="flex min-h-[550px] min-w-0 flex-1 flex-col rounded-none border border-kv-border/80 bg-kv-main p-kv-inset text-start shadow-kv-raised sm:rounded-kv-shell sm:p-kv-page lg:min-h-[calc(100dvh-4rem-2*var(--spacing-kv-group))]">
      <ModulePageHeader />
      <div className="flex min-h-0 w-full flex-1 flex-col py-kv-pair">
        {children}
      </div>
      <DashboardFooter />
    </main>
  );
}
