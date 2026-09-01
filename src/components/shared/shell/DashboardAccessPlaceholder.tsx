'use client';

/**
 * بوم خالی تا گیت نشست/نقش redirect را حل کند.
 * اسکلتون داده نیست؛ برای ناوبار داخل داشبورد هم نیست.
 */
export function DashboardAccessPlaceholder({
  fullViewport = false,
}: {
  /** گیت شل احراز/hydration که Header+Sidebar را عوض می‌کند. */
  fullViewport?: boolean;
} = {}) {
  return (
    <div
      className={
        fullViewport
          ? 'min-h-dvh w-full bg-kv-canvas'
          : 'min-h-40 w-full bg-kv-canvas'
      }
      aria-busy="true"
      aria-live="polite"
    />
  );
}
