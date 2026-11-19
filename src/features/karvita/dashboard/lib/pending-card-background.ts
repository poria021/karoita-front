/** زردِ زمینهٔ کارت‌های «گزارش در انتظار بررسی». */
export const PENDING_YELLOW = 'hsl(48 96% 53%)';

/** شدت کامل زمینه از این تعداد گزارش به بالا؛ تا یک کارتِ تک‌گزارشی «پررنگ‌ترین» نشود. */
export const PENDING_FULL_INTENSITY_AT = 5;

/** زرد خیلی کم‌رنگ؛ حتی پررنگ‌ترین کارت هم فقط کمی ته‌رنگ دارد. */
export const PENDING_BG_MIN_PERCENT = 3;
export const PENDING_BG_MAX_PERCENT = 12;

/** نسبت شدت (۰..۱): `pending` به بیشترین تعداد بین کارت‌ها (حداقل ۵). */
export function pendingIntensity(pending: number, max: number): number {
  const base = Math.max(max, PENDING_FULL_INTENSITY_AT);
  return Math.min(1, Math.max(0, pending) / base);
}

/** درصد زرد در ترکیب با زمینه: ۳٪ (کم‌رنگ) تا ۱۲٪ (نسبتاً پررنگ‌تر). */
export function pendingBackgroundPercent(pending: number, max: number): number {
  return Math.round(
    PENDING_BG_MIN_PERCENT +
      (PENDING_BG_MAX_PERCENT - PENDING_BG_MIN_PERCENT) *
        pendingIntensity(pending, max)
  );
}

/**
 * زمینهٔ کارت: هرچه گزارش در انتظار بیشتر، زرد پررنگ‌تر؛ هرچه کمتر، کم‌رنگ‌تر.
 * با `--kv-surface` ترکیب می‌شود تا در حالت تیره هم متن خوانا بماند.
 */
export function pendingBackground(pending: number, max: number): string {
  return `color-mix(in srgb, ${PENDING_YELLOW} ${pendingBackgroundPercent(pending, max)}%, var(--kv-surface))`;
}
