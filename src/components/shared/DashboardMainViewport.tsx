import type { ReactNode } from 'react';

import { DashboardFooter } from '@/components/shared/DashboardFooter';
import { cn } from '@/lib/utils';

interface DashboardMainViewportProps {
  children: ReactNode;
}

/**
 * <main> shell for every authenticated dashboard page.
 * Pure presentational RSC — no client hooks.
 * Footer is part of the main composition (matches original-karvita.html).
 */
export function DashboardMainViewport({ children }: DashboardMainViewportProps) {
  return (
    <main
      className={cn(
        'flex min-h-[550px] min-w-0 flex-1 flex-col rounded-none border border-slate-300/80 bg-white p-5 text-start shadow-sm sm:p-8 md:rounded-3xl lg:min-h-[calc(100vh-112px)] lg:rounded-3xl'
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <DashboardFooter />
    </main>
  );
}
