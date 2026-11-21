/**
 * استایل مشترک تب شاخص در صفحهٔ مقایسه (هم جدول هم نمودار):
 * دکمه‌ای و کوچک‌تر از تب اصلی «جدول | نمودار»؛ بدون قاب دور لیست.
 */
export const METRIC_TABS_LIST_CLASS =
  'h-auto flex-wrap gap-1.5 border-0 bg-transparent p-0 shadow-none dark:bg-transparent';

export const METRIC_TAB_CLASS = [
  'min-h-8 rounded-full px-3 py-1 text-[0.6875rem] md:min-h-8 md:px-3 md:py-1',
  'border-kv-border bg-kv-surface',
  'data-[state=active]:border-kv-brand/40 data-[state=active]:bg-kv-brand-soft data-[state=active]:text-kv-brand-soft-fg data-[state=active]:shadow-none',
  'dark:data-[state=active]:border-kv-brand/40 dark:data-[state=active]:bg-kv-brand-soft dark:data-[state=active]:text-kv-brand-soft-fg',
].join(' ');
