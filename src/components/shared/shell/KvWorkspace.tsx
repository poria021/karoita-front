import type { ReactNode } from 'react';

import { KvCard } from '@/components/shared/KvCard';
import { cn } from '@/lib/utils';

export type KvWorkspaceProps = {
  /** Module sub-nav (tabs, segment control, …). */
  tabs?: ReactNode;
  /** Filters / actions above the main content (outside the table card). */
  toolbar?: ReactNode;
  /** Main body (table, list, form, alert, …). */
  children: ReactNode;
  className?: string;
};

/**
 * Single-column module workspace skeleton.
 * Toolbar + table share one raised card. Mobile uses DS inset padding and
 * no full-bleed header rule; desktop table can still flush to the card edge.
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
      <KvCard data-slot="kv-workspace-panel">
        {toolbar ? (
          <div
            data-slot="kv-workspace-toolbar"
            className="px-kv-inset pt-kv-inset pb-kv-group"
          >
            {toolbar}
          </div>
        ) : null}
        <div
          data-slot="kv-workspace-body"
          className="max-lg:px-kv-inset max-lg:pb-kv-inset"
        >
          {children}
        </div>
      </KvCard>
    </div>
  );
}
