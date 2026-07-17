'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import type { OrganizationField } from '../data/organization-catalog';
import {
  ORGANIZATION_OPTIONS_PAGE_SIZE,
  OrganizationOptionsService,
  type OrganizationOption,
  type OrganizationOptionsResult,
} from '../services/organization-options.service';

const DEBOUNCE_MS = 300;

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
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

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

  const items = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();
    const merged: OrganizationOption[] = [];
    for (const page of data) {
      for (const item of page.items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
      }
    }
    return merged;
  }, [data]);

  const hasMore = Boolean(data?.[data.length - 1]?.hasMore);
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
  };
}
