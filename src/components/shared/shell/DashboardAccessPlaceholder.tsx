'use client';

import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';

/**
 * لودر تا گیت نشست/نقش redirect را حل کند.
 * اسکلتون داده نیست؛ برای ناوبار داخل داشبورد هم نیست.
 */
export function DashboardAccessPlaceholder({
  fullViewport = false,
}: {
  /** گیت شل احراز/hydration که Header+Sidebar را عوض می‌کند. */
  fullViewport?: boolean;
} = {}) {
  return (
    <KvBrandLinearLoader
      fullViewport={fullViewport}
      className={fullViewport ? undefined : 'flex-1'}
    />
  );
}
