import { cn } from '@/lib/utils';
import { KvTypography } from '@/components/shared/KvTypography';

interface KvBrandLinearLoaderProps {
  /** `overlay` تمام‌ویوپورت — فقط دو مرز احراز (ورود به داشبورد، خروج). */
  fullViewport?: boolean;
  /** توضیح آرام زیر مارک (مثلاً «در حال ورود…»). */
  label?: string;
  className?: string;
}

/**
 * مارک + پیشرفت نامعین — فقط صفحهٔ گذار مرز احراز (ورود، خروج، بوت سرد داشبورد).
 * ناوبار داخلی ماژول/تب باید صفحهٔ قبلی را تا paint بعدی نگه دارد (بدون `loading.tsx`).
 * شلوغی داده همان `KvTableBusy` / `KvBusySurface` است.
 * تمام‌ویوپورت بوم مارکتینگ (`kv-brand-atmosphere` + `kv-blueprint-bg`) تا ورود/خروج با لندینگ یکی باشد.
 */
export function KvBrandLinearLoader({
  fullViewport = false,
  label,
  className,
}: KvBrandLinearLoaderProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-kv-section',
        fullViewport
          ? 'kv-brand-atmosphere kv-blueprint-bg min-h-dvh'
          : 'min-h-40 bg-kv-canvas',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span aria-hidden="true" className="kv-brand-mark size-10 text-kv-brand sm:size-12" />

      <div className="flex w-40 flex-col items-center gap-kv-field sm:w-48">
        <div className="kv-linear-indeterminate h-1 w-full overflow-hidden rounded-full bg-kv-brand-soft" />
        {label ? (
          <KvTypography variant="overline" tone="muted" align="center">
            {label}
          </KvTypography>
        ) : null}
      </div>

      <span className="sr-only">در حال بارگذاری…</span>
    </div>
  );
}
