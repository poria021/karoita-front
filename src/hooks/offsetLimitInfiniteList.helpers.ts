import type { OffsetLimitPage } from '@/utils/offset-limit-page';

export type OffsetLimitListState<T> = {
  items: T[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMoreError: string | null;
};

export type OffsetLimitListCachePayload<T> = {
  items: T[];
  total: number;
  hasMore: boolean;
};

export function initialOffsetLimitListState<T>(): OffsetLimitListState<T> {
  return {
    items: [],
    total: 0,
    hasMore: false,
    isLoading: true,
    isLoadingMore: false,
    error: null,
    loadMoreError: null,
  };
}

export function offsetLimitListStateFromCache<T>(
  cached: OffsetLimitListCachePayload<T>
): OffsetLimitListState<T> {
  return {
    items: cached.items,
    total: cached.total,
    hasMore: cached.hasMore,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    loadMoreError: null,
  };
}

export function canLoadMoreOffsetLimitList(args: {
  inFlight: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
}): boolean {
  return !(
    args.inFlight ||
    args.isLoading ||
    args.isLoadingMore ||
    !args.hasMore
  );
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

export function toOffsetLimitListCachePayload<T>(
  state: Pick<OffsetLimitListState<T>, 'items' | 'total' | 'hasMore'>
): OffsetLimitListCachePayload<T> {
  return {
    items: state.items,
    total: state.total,
    hasMore: state.hasMore,
  };
}
