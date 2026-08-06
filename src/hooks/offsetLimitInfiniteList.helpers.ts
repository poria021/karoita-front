import type { OffsetLimitPage } from '@/utils/offset-limit-page';

export type OffsetLimitInfiniteData<T> = {
  pages: OffsetLimitPage<T>[];
  pageParams: number[];
};

export function offsetLimitListQueryKey(
  cacheNamespace: string | undefined,
  resetKey: string,
  pageSize: number
) {
  return [
    'offset-limit-list',
    cacheNamespace ?? 'default',
    resetKey,
    pageSize,
  ] as const;
}

export function mergeOffsetLimitPageItems<T>(
  existing: T[],
  page: OffsetLimitPage<T>
): T[] {
  return [...existing, ...page.items];
}

export function flattenOffsetLimitPages<T>(
  data: OffsetLimitInfiniteData<T> | undefined
): T[] {
  if (!data?.pages.length) return [];
  return data.pages.reduce<T[]>(
    (acc, page) => mergeOffsetLimitPageItems(acc, page),
    []
  );
}

/** Collapse infinite pages into one optimistic page after a local list patch. */
export function replaceOffsetLimitListItems<T>(
  old: OffsetLimitInfiniteData<T> | undefined,
  nextItems: T[],
  nextTotal: number
): OffsetLimitInfiniteData<T> {
  const hasMore = old?.pages.at(-1)?.hasMore ?? false;
  return {
    pages: [{ items: nextItems, total: nextTotal, hasMore }],
    pageParams: [0],
  };
}

export function mapOffsetLimitListError(
  err: unknown,
  fallback: string
): string {
  return err instanceof Error ? err.message : fallback;
}
