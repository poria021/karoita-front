'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { SEARCH_DEBOUNCE_MS } from '@/lib/search-debounce';
import {
  ORGANIZATION_OPTIONS_PAGE_SIZE,
  OrganizationOptionsService,
  type OrganizationOption,
} from '@/services/organization-options.service';
import type { UserRole } from '@/types/auth';
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
  /** برای رشته تحصیلی — scope به GET /admin/roles/{id}/degrees */
  role?: UserRole;
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

export function useOrganizationOptions({
  type,
  query,
  enabled,
  dependsOn,
  role,
}: UseOrganizationOptionsArgs): UseOrganizationOptionsResult {
  // Debounce even empty values so a clear action does not race with the previous request.
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);

  const provinceKey = toDependsOnKey(dependsOn?.province);
  const cityKey = toDependsOnKey(dependsOn?.city);
  const districtKey = toDependsOnKey(dependsOn?.district);

  const {
    data,
    error,
    isPending,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [
      ...DASHBOARD_QUERY.orgOptions,
      type,
      debouncedQuery,
      provinceKey,
      cityKey,
      districtKey,
      role ?? '',
    ],
    enabled,
    initialPageParam: 1,
    staleTime: QUERY_STALE_MS.list,
    queryFn: async ({ pageParam }) =>
      OrganizationOptionsService.getOptions({
        type,
        query: debouncedQuery,
        page: pageParam,
        limit: ORGANIZATION_OPTIONS_PAGE_SIZE,
        province: provinceKey ? dependsOn?.province : undefined,
        city: cityKey ? dependsOn?.city : undefined,
        district: districtKey ? dependsOn?.district : undefined,
        role,
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
      return { items: [] as OrganizationOption[], totalMerged: 0, reachedLimit: false };
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

  const hasMore = Boolean(hasNextPage) && !reachedLimit && pageCount < MAX_ORG_OPTION_PAGES;
  const isLoadingMore = isFetchingNextPage && items.length > 0;
  const isInitialLoading = Boolean(enabled) && isPending && items.length === 0;

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
