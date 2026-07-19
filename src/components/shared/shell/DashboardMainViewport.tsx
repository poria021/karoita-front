'use client';

import type { ReactNode } from 'react';

import { DashboardFooter } from '@/components/shared/shell/DashboardFooter';
import { ModulePageHeader } from '@/components/shared/shell/ModulePageHeader';

interface DashboardMainViewportProps {
  children: ReactNode;
}

/**
 * <main> shell for every authenticated dashboard page.
 * Module title comes from `ModulePageHeader` (pathname + role).
 * Content is full-width inside the shell (no role max-width clamp).
 */
export function DashboardMainViewport({ children }: DashboardMainViewportProps) {
  return (
    <main className="flex min-h-[550px] min-w-0 flex-1 flex-col rounded-none border border-kv-border-strong/80 bg-kv-surface p-kv-inset text-start shadow-kv-raised sm:p-kv-page md:rounded-kv-shell lg:min-h-[calc(100dvh-4rem-2*var(--spacing-kv-group))] lg:rounded-kv-shell">
      <ModulePageHeader />
      <div className="flex min-h-0 w-full flex-1 flex-col py-kv-pair">
        {children}
      </div>
      <DashboardFooter />
    </main>
  );
}
