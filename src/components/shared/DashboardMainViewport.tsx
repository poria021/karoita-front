'use client';

import type { ReactNode } from 'react';

import { useUserStore } from '@/store/useUserStore';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';
import { cn } from '@/lib/utils';

interface DashboardMainViewportProps {
  children: ReactNode;
}

/**
 * `<main>` shell for every Karvita dashboard page: matches the rounded-3xl
 * card viewport from `original-karvita.html` and applies the active role's
 * `layoutWidthClass` (rule 00, #10 — width constraints come from
 * `RoleStrategyMap`, never an inline role check).
 */
export function DashboardMainViewport({ children }: DashboardMainViewportProps) {
  const activeUser = useUserStore((state) => state.activeUser);
  const layoutWidthClass = activeUser ? getRoleStrategy(activeUser.role).layoutWidthClass : 'max-w-6xl';

  return (
    <main
      className={cn(
        'flex min-w-0 flex-1 flex-col rounded-none border border-slate-300/80 bg-white p-5 shadow-sm sm:p-8 md:rounded-3xl lg:min-h-[calc(100vh-112px)] lg:rounded-3xl',
        'mx-auto w-full',
        layoutWidthClass
      )}
    >
      {children}
    </main>
  );
}
