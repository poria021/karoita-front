
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
 * `total` for backends that only report `hasNextPage` (no absolute count),
 * e.g. Nest admin list envelopes. Not an exact count — callers only use
 * `OffsetLimitPage.total` for optimistic +1/-1 bookkeeping, never as a
 * displayed figure, so "at least N" is safe.
 */
export function estimateHasNextPageTotal(
  offset: number,
  pageItemCount: number,
  hasNextPage: boolean
): number {
  const safeOffset = Math.max(0, Math.floor(offset));
  return safeOffset + pageItemCount + (hasNextPage ? 1 : 0);
}
