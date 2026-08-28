import type { ReactNode } from 'react';

import { KvCard } from '@/components/shared/KvCard';
import { kvTabsBodyBorderClassName } from '@/components/shared/shell/shellChrome';
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
 * Border + equal vertical padding sit on the content below tabs (not under the tab track).
 */
export function KvWorkspace({
  tabs,
  toolbar,
  children,
  className,
  panel = true,
}: KvWorkspaceProps) {
  const body = (
    <>
      {toolbar ? (
        <div data-slot="kv-workspace-toolbar">{toolbar}</div>
      ) : null}
      {panel ? (
        <KvCard data-slot="kv-workspace-panel">{children}</KvCard>
      ) : (
        <div
          data-slot="kv-workspace-panel"
          className="flex min-h-0 flex-1 flex-col"
        >
          {children}
        </div>
      )}
    </>
  );

  return (
    <div
      className={cn('flex flex-col gap-kv-group', className)}
      dir="rtl"
      data-slot="kv-workspace"
    >
      {tabs ? <div data-slot="kv-workspace-tabs">{tabs}</div> : null}
      <div
        data-slot="kv-workspace-body"
        className={cn(
          'flex flex-col gap-kv-group',
          tabs && cn(kvTabsBodyBorderClassName, 'py-kv-group')
        )}
      >
        {body}
      </div>
    </div>
  );
}
