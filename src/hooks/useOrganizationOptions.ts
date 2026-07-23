'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  ORGANIZATION_OPTIONS_PAGE_SIZE,
  OrganizationOptionsService,
  type OrganizationOption,
} from '@/services/organization-options.service';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

const DEBOUNCE_MS = 300;
const MAX_ORG_OPTION_PAGES = 20;
const MAX_ORG_OPTIONS_IN_DOM = 200;

export type OrganizationDependsOn = {
  province?: string;
  district?: string;
};

export type UseOrganizationOptionsArgs = {
  type: OrganizationField;
  query: string;
  enabled: boolean;
  dependsOn?: OrganizationDependsOn;
};

export type UseOrganizationOptionsResult = {
  items: OrganizationOption[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  error: Error | undefined;
  reachedLimit: boolean;
};

/**
 * Paginated typeahead options for organization fields.
 * TanStack `useInfiniteQuery` + OrganizationOptionsService (not the admin-table list stack).
 */
export function useOrganizationOptions({
  type,
  query,
  enabled,
  dependsOn,
}: UseOrganizationOptionsArgs): UseOrganizationOptionsResult {
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  const province = dependsOn?.province ?? '';
  const district = dependsOn?.district ?? '';

  const {
    data,
    error,
    isPending,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['org-options', type, debouncedQuery, province, district],
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      OrganizationOptionsService.getOptions({
        type,
        query: debouncedQuery,
        page: pageParam,
        limit: ORGANIZATION_OPTIONS_PAGE_SIZE,
        province: province || undefined,
        district: district || undefined,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      if (allPages.length >= MAX_ORG_OPTION_PAGES) return undefined;
      return allPages.length + 1;
    },
  });

  const pageCount = data?.pages.length ?? 0;

  const { items, totalMerged, reachedLimit } = useMemo(() => {
    if (!data) {
      return {
        items: [] as OrganizationOption[],
        totalMerged: 0,
        reachedLimit: false,
      };
    }
    const seen = new Set<string>();
    const merged: OrganizationOption[] = [];
    for (const page of data.pages) {
      for (const item of page.items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
      }
    }
    const hitDomCap = merged.length > MAX_ORG_OPTIONS_IN_DOM;
    const hitPageCap = pageCount >= MAX_ORG_OPTION_PAGES;
    return {
      items: merged.slice(0, MAX_ORG_OPTIONS_IN_DOM),
      totalMerged: merged.length,
      reachedLimit: hitDomCap || hitPageCap,
    };
  }, [data, pageCount]);

  const hasMore =
    Boolean(hasNextPage) && !reachedLimit && pageCount < MAX_ORG_OPTION_PAGES;
  const isLoadingMore = isFetchingNextPage && items.length > 0;
  const isInitialLoading =
    Boolean(enabled) && isPending && items.length === 0;

  const loadMore = () => {
    if (!hasMore || isFetching || isFetchingNextPage) return;
    void fetchNextPage();
  };

  return {
    items,
    hasMore,
    isLoading: isInitialLoading,
    isLoadingMore,
    loadMore,
    error: error instanceof Error ? error : error ? new Error(String(error)) : undefined,
    reachedLimit: reachedLimit || totalMerged > MAX_ORG_OPTIONS_IN_DOM,
  };
}
