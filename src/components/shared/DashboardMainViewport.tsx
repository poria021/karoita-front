'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardMainViewportProps {
  children: ReactNode;
}

/**
 * <main> shell for every Karvita dashboard page.
 * Replicates the exact spacious, fully-stretched look from original-karvita.html.
 * Removes restrictive max-widths to let the viewport expand naturally.
 */
export function DashboardMainViewport({ children }: DashboardMainViewportProps) {
  return (
    <main
      className={cn(
        'flex-1 min-w-0 bg-white border border-slate-300/80 shadow-sm p-5 sm:p-8 rounded-none md:rounded-3xl lg:rounded-3xl lg:min-h-[calc(100vh-112px)] min-h-[550px] flex flex-col'
      )}
    >
      {children}
    </main>
  );
}