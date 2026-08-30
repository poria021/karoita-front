import { cn } from '@/lib/utils';

/**
 * کروم مشترک پنل‌های اورلی (سلکت، منوی دراپ‌داون، اعلان‌ها).
 * همهٔ دراپ‌باکس‌های محصول باید از همین توکن‌ها استفاده کنند.
 */
export const kvOverlayPanelClassName = [
  'overflow-hidden rounded-kv-control border border-kv-border/70 bg-kv-surface p-0',
  'shadow-kv-overlay',
].join(' ');

/** جداکنندهٔ افقی نرم بین ردیف‌های اورلی (آخرین آیتم بدون بردر). */
export const kvOverlayItemDividerClassName =
  'border-b border-kv-border/40 last:border-b-0';

/** جداکنندهٔ سکشن (هدر/فوتر داخل پنل) — بدون قانون last. */
export const kvOverlaySectionDividerClassName = 'border-b border-kv-border/40';

/** بردر بالای سکشن داخلی (مثلاً بدنهٔ بازشده). */
export const kvOverlaySectionTopDividerClassName = 'border-t border-kv-border/40';

/** کلاس پایهٔ ردیف آیتم داخل اورلی. */
export function kvOverlayItemClassName(
  ...extras: Array<string | undefined | false | null>
) {
  return cn(
    'rounded-none px-3.5 py-2.5',
    kvOverlayItemDividerClassName,
    ...extras
  );
}

/** خط جداکنندهٔ مستقل (جایگزین Separatorهای پررنگ). */
export const kvOverlaySeparatorClassName = 'h-px w-full bg-kv-border/40';

/**
 * بدنهٔ اسکرول‌شوندهٔ لیست اورلی — اسکرول‌بار نازک همیشه وقتی overflow هست.
 * کلاس `kv-overlay-list-scroll` در globals.css عرض thumb را برای Radix/cmdk اجبار می‌کند.
 */
export const kvOverlayListScrollClassName = [
  'kv-overlay-list-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto',
].join(' ');
