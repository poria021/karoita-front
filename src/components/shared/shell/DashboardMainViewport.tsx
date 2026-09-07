'use client';

import type { ReactNode } from 'react';

import { AuthTransitionPaintRelease } from '@/components/shared/shell/AuthTransitionPaintRelease';
import { DashboardFooter } from '@/components/shared/shell/DashboardFooter';
import { ModulePageHeader } from '@/components/shared/shell/ModulePageHeader';
import { PullToRefresh } from '@/components/shared/shell/PullToRefresh';
import { DASHBOARD_MAIN_ID } from '@/components/shared/shell/SkipToMainContent';
import { cn } from '@/lib/utils';

interface DashboardMainViewportProps {
  children: ReactNode;
  className?: string;
}

export function DashboardMainViewport({
  children,
  className,
}: DashboardMainViewportProps) {
  return (
    <PullToRefresh className="flex min-h-[550px] min-w-0 flex-1 flex-col">
      <main
        id={DASHBOARD_MAIN_ID}
        tabIndex={-1}
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col rounded-none bg-kv-main px-kv-group py-kv-group text-start outline-none sm:px-kv-page sm:py-kv-section lg:min-h-[calc(100dvh-4rem)]',
          className
        )}
      >
        <ModulePageHeader />
        <div className="flex min-h-0 w-full flex-1 flex-col pt-kv-pair">
          {children}
        </div>
        <DashboardFooter />
        <AuthTransitionPaintRelease when="entering" />
      </main>
    </PullToRefresh>
  );
}
