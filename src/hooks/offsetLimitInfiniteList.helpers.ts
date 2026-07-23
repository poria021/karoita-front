import type { OffsetLimitPage } from '@/utils/offset-limit-page';

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

export function mapOffsetLimitListError(
  err: unknown,
  fallback: string
): string {
  return err instanceof Error ? err.message : fallback;
}
