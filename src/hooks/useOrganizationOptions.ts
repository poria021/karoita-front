'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import {
  resolveListSearchQuery,
  SEARCH_DEBOUNCE_MS,
} from '@/lib/search-debounce';
import {
  ORGANIZATION_OPTIONS_PAGE_SIZE,
  OrganizationOptionsService,
  type OrganizationOption,
} from '@/services/organization-options.service';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

const MAX_ORG_OPTION_PAGES = 20;
const MAX_ORG_OPTIONS_IN_DOM = 200;

export type OrganizationDependsOn = {
  province?: string | string[];
  city?: string | string[];
  district?: string | string[];
};

function toDependsOnKey(value: string | string[] | undefined): string {
  if (!value) return '';
  return Array.isArray(value) ? value.join('|') : value;
}

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
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const listQuery = resolveListSearchQuery(query, debouncedQuery);
  const province = dependsOn?.province ?? '';
  const city = dependsOn?.city ?? '';
  const district = dependsOn?.district ?? '';
  const provinceKey = toDependsOnKey(province);
  const cityKey = toDependsOnKey(city);
  const districtKey = toDependsOnKey(district);

  const {
    data,
    error,
    isPending,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['org-options', type, listQuery, provinceKey, cityKey, districtKey],
    enabled,
    initialPageParam: 1,
    staleTime: QUERY_STALE_MS.list,
    queryFn: async ({ pageParam }) =>
      OrganizationOptionsService.getOptions({
        type,
        query: listQuery,
        page: pageParam,
        limit: ORGANIZATION_OPTIONS_PAGE_SIZE,
        province: provinceKey ? province : undefined,
        city: cityKey ? city : undefined,
        district: districtKey ? district : undefined,
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
