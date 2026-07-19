import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type KvWorkspaceProps = {
  /** Module sub-nav (tabs, segment control, …). */
  tabs?: ReactNode;
  /** Filters / actions above the main content. */
  toolbar?: ReactNode;
  /** Main body (table, list, form, alert, …). */
  children: ReactNode;
  className?: string;
};

/**
 * Single-column module workspace skeleton.
 * Tabs + optional toolbar + panel chrome — no domain UI.
 */
export function KvWorkspace({
  tabs,
  toolbar,
  children,
  className,
}: KvWorkspaceProps) {
  return (
    <div
      className={cn('space-y-kv-section', className)}
      dir="rtl"
      data-slot="kv-workspace"
    >
      {tabs}
      <div
        className="space-y-kv-stack rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group sm:p-kv-section"
        data-slot="kv-workspace-panel"
      >
        {toolbar}
        {children}
      </div>
    </div>
  );
}
