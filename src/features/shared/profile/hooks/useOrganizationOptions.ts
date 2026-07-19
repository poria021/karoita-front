'use client';

import { useEffect, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  ORGANIZATION_OPTIONS_PAGE_SIZE,
  OrganizationOptionsService,
  type OrganizationOption,
  type OrganizationOptionsResult,
} from '@/services/organization-options.service';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

const DEBOUNCE_MS = 300;
/** Hard stop so a buggy hasMore=true cannot load forever. */
const MAX_ORG_OPTION_PAGES = 20;
/** Cap merged DOM list; ask user to refine search beyond this. */
const MAX_ORG_OPTIONS_IN_DOM = 200;

/**
 * Org typeahead options use SWR infinite (dependent select cache), not the
 * admin-table `useOffsetLimitInfiniteList` stack — see rule 40 + ADR-007.
 */

export type OrganizationDependsOn = {
  province?: string;
  district?: string;
};

export type UseOrganizationOptionsArgs = {
  type: OrganizationField;
  /** Local search text (not yet debounced). */
  query: string;
  /** When false, no network/SWR request is made. */
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
  /** True when page/DOM caps stop further loading. */
  reachedLimit: boolean;
};

type OrgOptionsKey = readonly [
  'org-options',
  OrganizationField,
  string,
  number,
  string,
  string,
];

/**
 * Paginated organization options — fetch-on-open, debounced search, SWR cache.
 * Pages append via `useSWRInfinite`; page 1 replaces when the key root changes.
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

  const getKey = (
    pageIndex: number,
    previousPageData: OrganizationOptionsResult | null
  ): OrgOptionsKey | null => {
    if (!enabled) return null;
    if (pageIndex >= MAX_ORG_OPTION_PAGES) return null;
    if (previousPageData && !previousPageData.hasMore) return null;

    return [
      'org-options',
      type,
      debouncedQuery,
      pageIndex + 1,
      province,
      district,
    ] as const;
  };

  const { data, error, size, setSize, isLoading, isValidating } =
    useSWRInfinite<OrganizationOptionsResult, Error, typeof getKey>(
      getKey,
      async (key) => {
        const page = key[3];
        return OrganizationOptionsService.getOptions({
          type: key[1],
          query: key[2],
          page,
          limit: ORGANIZATION_OPTIONS_PAGE_SIZE,
          province: key[4] || undefined,
          district: key[5] || undefined,
        });
      },
      {
        revalidateOnFocus: false,
        revalidateFirstPage: false,
      }
    );

  useEffect(() => {
    void setSize(1);
  }, [debouncedQuery, type, province, district, setSize]);

  const { items, totalMerged, reachedLimit } = useMemo(() => {
    if (!data) {
      return { items: [] as OrganizationOption[], totalMerged: 0, reachedLimit: false };
    }
    const seen = new Set<string>();
    const merged: OrganizationOption[] = [];
    for (const page of data) {
      for (const item of page.items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
      }
    }
    const hitDomCap = merged.length > MAX_ORG_OPTIONS_IN_DOM;
    const hitPageCap = size >= MAX_ORG_OPTION_PAGES;
    return {
      items: merged.slice(0, MAX_ORG_OPTIONS_IN_DOM),
      totalMerged: merged.length,
      reachedLimit: hitDomCap || hitPageCap,
    };
  }, [data, size]);

  const serverHasMore = Boolean(data?.[data.length - 1]?.hasMore);
  const hasMore = serverHasMore && !reachedLimit && size < MAX_ORG_OPTION_PAGES;
  const isLoadingMore = isValidating && size > 1 && items.length > 0;
  const isInitialLoading = Boolean(enabled) && isLoading && items.length === 0;

  const loadMore = () => {
    if (!hasMore || isValidating) return;
    void setSize(size + 1);
  };

  return {
    items,
    hasMore,
    isLoading: isInitialLoading,
    isLoadingMore,
    loadMore,
    error: error ?? undefined,
    reachedLimit: reachedLimit || totalMerged > MAX_ORG_OPTIONS_IN_DOM,
  };
}
