
export const DEFAULT_PAGE_LIMIT = 20;

export type OffsetLimitPage<T> = {
  items: T[];
  total: number;
  hasMore: boolean;
};

export function sliceOffsetLimitPage<T>(
  all: readonly T[],
  offset: number,
  limit: number = DEFAULT_PAGE_LIMIT
): OffsetLimitPage<T> {
  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.max(1, Math.floor(limit));
  const total = all.length;
  const items = all.slice(safeOffset, safeOffset + safeLimit);
  const hasMore = safeOffset + items.length < total;
  return { items, total, hasMore };
}

/**
 * `total` برای بک‌اندهایی که فقط `hasNextPage` می‌دهند (بدون شمار مطلق)،
 * مثل envelope لیست ادمین Nest. عدد نمایشی نیست — فقط برای حسابداری خوش‌بینانهٔ +۱/−۱.
 */
export function estimateHasNextPageTotal(
  offset: number,
  pageItemCount: number,
  hasNextPage: boolean
): number {
  const safeOffset = Math.max(0, Math.floor(offset));
  return safeOffset + pageItemCount + (hasNextPage ? 1 : 0);
}
