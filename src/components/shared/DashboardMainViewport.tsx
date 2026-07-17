'use client';

import type { ReactNode } from 'react';

import { DashboardFooter } from '@/components/shared/DashboardFooter';
import { ModulePageHeader } from '@/components/shared/ModulePageHeader';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/useUserStore';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

interface DashboardMainViewportProps {
  children: ReactNode;
}

/**
 * <main> shell for every authenticated dashboard page.
 * Module title comes from `ModulePageHeader` (pathname + role), matching
 * original-karvita.html `currentTabData`. Footer stays in the composition.
 * Content width follows role `layoutWidthClass` from RoleStrategyMap.
 */
export function DashboardMainViewport({ children }: DashboardMainViewportProps) {
  const role = useUserStore((state) => state.activeUser?.role);
  const layoutWidthClass = role
    ? getRoleStrategy(role).layoutWidthClass
    : 'max-w-6xl';

  return (
    <main
      className={cn(
        'flex min-h-[550px] min-w-0 flex-1 flex-col rounded-none border border-kv-border-strong/80 bg-kv-surface p-kv-inset text-start shadow-kv-raised sm:p-kv-page md:rounded-kv-shell lg:min-h-[calc(100dvh-4rem-2*var(--spacing-kv-group))] lg:rounded-kv-shell'
      )}
    >
      <ModulePageHeader />
      <div
        className={cn(
          'mx-auto flex min-h-0 w-full flex-1 flex-col py-kv-pair',
          layoutWidthClass
        )}
      >
        {children}
      </div>
      <DashboardFooter />
    </main>
  );
}
