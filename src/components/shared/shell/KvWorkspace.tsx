import type { ReactNode } from 'react';

import { KvCard } from '@/components/shared/KvCard';
import { cn } from '@/lib/utils';

export type KvWorkspaceProps = {
  tabs?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
  /** پنل کارت دور محتوا؛ برای صفحات چندکارته بدون بردر بیرونی خاموش کنید. */
  panel?: boolean;
};

/**
 * اسکلت ورک‌اسپیس تک‌ستونهٔ ماژول ادمین — تب / تولبار / کارت جدول.
 */
export function KvWorkspace({
  tabs,
  toolbar,
  children,
  className,
  panel = true,
}: KvWorkspaceProps) {
  return (
    <div
      className={cn('space-y-kv-group', className)}
      dir="rtl"
      data-slot="kv-workspace"
    >
      {tabs}
      {toolbar ? (
        <div data-slot="kv-workspace-toolbar">{toolbar}</div>
      ) : null}
      {panel ? (
        <KvCard data-slot="kv-workspace-panel">{children}</KvCard>
      ) : (
        <div data-slot="kv-workspace-panel">{children}</div>
      )}
    </div>
  );
}
