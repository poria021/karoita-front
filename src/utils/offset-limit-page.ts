/**
 * Pure offset/limit page slice — matches Nest-style list pages (limit=10).
 */

export const DEFAULT_PAGE_LIMIT = 10;

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
