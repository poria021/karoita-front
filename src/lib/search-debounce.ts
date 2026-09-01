/**
 * debounce مشترک جست‌وجوی لیست ادمین / typeahead.
 * یک‌بار در لایهٔ صفحه/هوک — داخل `KvSearchField` هرگز debounce نکنید.
 */
export const SEARCH_DEBOUNCE_MS = 300;

/** جست‌وجوی خالی/پاک‌شده فوری به لیست می‌خورد؛ غیرخالی منتظر debounce می‌ماند. */
export function resolveListSearchQuery(
  rawQuery: string,
  debouncedQuery: string
): string {
  return rawQuery.trim() === '' ? '' : debouncedQuery;
}
