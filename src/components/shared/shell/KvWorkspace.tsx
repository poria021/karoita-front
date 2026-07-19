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
 * Toolbar sits above a raised surface card — same table chrome as
 * onboarding (`KvCard` + `KvTable`), so admin tables stay visually unified.
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
      {toolbar ? (
        <div data-slot="kv-workspace-toolbar">{toolbar}</div>
      ) : null}
      <KvCard data-slot="kv-workspace-panel">
        {children}
      </KvCard>
    </div>
  );
}
