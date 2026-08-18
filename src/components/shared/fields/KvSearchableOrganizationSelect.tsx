'use client';

import { useEffect, useRef, useState, forwardRef } from 'react';
import { Command } from 'cmdk';

import { KvOverlayScrollMoreCue } from '@/components/shared/KvOverlayScrollMoreCue';
import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  kvOverlayItemClassName,
  kvOverlayPanelClassName,
  kvOverlaySectionTopDividerClassName,
} from '@/components/shared/kvOverlayMenu';
import { Spinner } from '@/components/ui/spinner';
import {
  useOrganizationOptions,
  type OrganizationDependsOn,
} from '@/hooks/useOrganizationOptions';
import {
  mergeEdgeAutoScrollRef,
  useEdgeAutoScroll,
} from '@/hooks/useEdgeAutoScroll';
import { cn } from '@/lib/utils';
import type { OrganizationOption } from '@/services/organization-options.service';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

export type KvSearchableOrganizationSelectProps = {
  type: OrganizationField;
  label?: string | false;
  required?: boolean;
  optionalHint?: boolean;
  value: string;
  placeholder: string;
  locked?: boolean;
  showLockIcon?: boolean;
  error?: string;
  dependsOn?: OrganizationDependsOn;
  onChange: (value: string) => void;
};

export const KvSearchableOrganizationSelect = forwardRef<
  HTMLInputElement,
  KvSearchableOrganizationSelectProps
>(function KvSearchableOrganizationSelect(
  {
    type,
    label = false,
    required = false,
    optionalHint = false,
    value,
    placeholder,
    locked = false,
    showLockIcon,
    error,
    dependsOn,
    onChange,
  },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const edgeScroll = useEdgeAutoScroll<HTMLDivElement>();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const listQuery = query === value ? '' : query;

  const {
    items,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    error: loadError,
    reachedLimit,
  } = useOrganizationOptions({
    type,
    query: listQuery,
    enabled: open && !locked,
    dependsOn,
  });

  const handleListScroll = () => {
    const list = listRef.current;
    if (!list || !hasMore || isLoadingMore) return;
    const nearBottom =
      list.scrollTop + list.clientHeight >= list.scrollHeight - 32;
    if (nearBottom) loadMore();
  };

  const handleSelect = (option: OrganizationOption) => {
    setQuery(option.label);
    onChange(option.label);
    setOpen(false);
  };

  const showSearchIcon = query.trim().length === 0;

  return (
    <div
      ref={rootRef}
      className="relative"
      role="combobox"
      aria-expanded={open && !locked}
      aria-controls={open ? `org-select-${type}` : undefined}
    >
      <KvSearchField
        ref={ref}
        label={label}
        required={required}
        optionalHint={optionalHint}
        size="md"
        value={query}
        locked={locked}
        showLockIcon={showLockIcon}
        error={error}
        placeholder={placeholder}
        showIcon={showSearchIcon}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          if (value) onChange('');
          setOpen(true);
        }}
      />

      {open && !locked ? (
        <Command
          id={`org-select-${type}`}
          shouldFilter={false}
          loop
          className={cn(
            kvOverlayPanelClassName,
            'absolute start-0 z-50 mt-1 flex w-full max-h-60 flex-col overflow-hidden'
          )}
        >
          <Command.List
            ref={mergeEdgeAutoScrollRef(edgeScroll.ref, listRef)}
            data-edge-auto-scroll=""
            onScroll={handleListScroll}
            onPointerMove={edgeScroll.onPointerMove}
            onPointerLeave={edgeScroll.onPointerLeave}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden outline-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-kv-pair px-3.5 py-3">
                <Spinner className="size-3.5" aria-hidden="true" />
                <KvTypography variant="caption" as="span">
                  در حال بارگذاری...
                </KvTypography>
              </div>
            ) : loadError ? (
              <div className="px-3.5 py-2.5 text-center">
                <KvTypography variant="error" align="center">
                  خطا در دریافت گزینه‌ها. دوباره تلاش کنید.
                </KvTypography>
              </div>
            ) : items.length > 0 ? (
              <>
                {items.map((option) => (
                  <Command.Item
                    key={option.id}
                    value={`${option.id}::${option.label}`}
                    onSelect={() => handleSelect(option)}
                    className={cn(
                      kvOverlayItemClassName(
                        'cursor-pointer text-start outline-none',
                        'data-[selected=true]:bg-kv-surface-muted',
                        value === option.label && 'bg-kv-surface-muted'
                      )
                    )}
                  >
                    <KvTypography variant="label" as="span">
                      {option.label}
                    </KvTypography>
                  </Command.Item>
                ))}
                {isLoadingMore ? (
                  <div
                    className={cn(
                      'flex items-center justify-center gap-kv-pair px-3.5 py-2.5',
                      kvOverlaySectionTopDividerClassName
                    )}
                  >
                    <Spinner className="size-3.5" aria-hidden="true" />
                    <KvTypography variant="caption" as="span">
                      در حال بارگذاری...
                    </KvTypography>
                  </div>
                ) : hasMore ? (
                  <Command.Item
                    value="__load-more__"
                    onSelect={() => loadMore()}
                    className={cn(
                      'cursor-pointer px-3.5 py-2.5 text-center outline-none data-[selected=true]:bg-kv-surface-muted',
                      kvOverlaySectionTopDividerClassName
                    )}
                  >
                    <KvTypography variant="label" tone="brand" as="span">
                      نمایش ۱۰ مورد بعدی
                    </KvTypography>
                  </Command.Item>
                ) : reachedLimit ? (
                  <div
                    className={cn(
                      'px-3.5 py-2.5 text-center',
                      kvOverlaySectionTopDividerClassName
                    )}
                  >
                    <KvTypography variant="caption" align="center">
                      نتایج زیاد است؛ جستجو را دقیق‌تر کنید.
                    </KvTypography>
                  </div>
                ) : null}
              </>
            ) : (
              <Command.Empty className="px-3.5 py-2.5 text-center">
                <KvTypography variant="caption" align="center">
                  نتیجه‌ای یافت نشد.
                </KvTypography>
              </Command.Empty>
            )}
          </Command.List>
          <KvOverlayScrollMoreCue
            visible={edgeScroll.canScrollDown}
            onHoverStart={edgeScroll.nudgeDown}
            onHoverEnd={edgeScroll.stop}
          />
        </Command>
      ) : null}
    </div>
  );
});

KvSearchableOrganizationSelect.displayName = 'KvSearchableOrganizationSelect';
