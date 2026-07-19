'use client';

import { useEffect, useRef, useState } from 'react';
import { Command } from 'cmdk';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { KvSpinner } from '@/components/shared/KvSpinner';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

import type { OrganizationField } from '@/utils/roleFieldStrategy';
import type { OrganizationOption } from '@/services/organization-options.service';
import {
  useOrganizationOptions,
  type OrganizationDependsOn,
} from '../../hooks/useOrganizationOptions';

interface SearchableOrganizationSelectProps {
  type: OrganizationField;
  /**
   * Label text string, or `false` to hide the label.
   * Same contract as {@link KvTextField}.
   */
  label?: string | false;
  required?: boolean;
  optionalHint?: boolean;
  /** Selected label stored in the form (RHF value). */
  value: string;
  placeholder: string;
  locked?: boolean;
  showLockIcon?: boolean;
  error?: string;
  dependsOn?: OrganizationDependsOn;
  /** Called with option label on select, or `''` when the user clears via typing. */
  onChange: (value: string) => void;
}

/**
 * Search-on-type organization select — cmdk list + KvTextField chrome.
 * Fetches pages of 10 via {@link useOrganizationOptions} while open.
 */
export function SearchableOrganizationSelect({
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
}: SearchableOrganizationSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setQuery(value);
  }

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
        endAddon={
          <span className="flex h-full items-center pe-2.5 ps-0.5">
            <FaIcon
              icon={faIcons.chevronDown}
              size="xs"
              className="shrink-0 text-kv-text-faint"
            />
          </span>
        }
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
          className="absolute start-0 z-50 mt-1 w-full overflow-hidden rounded-kv-control border border-kv-border bg-kv-surface shadow-kv-overlay"
        >
          <Command.List
            ref={listRef}
            onScroll={handleListScroll}
            className="max-h-52 overflow-y-auto overflow-x-hidden outline-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-3.5 py-3 text-xs text-kv-text-faint">
                <KvSpinner className="size-3.5" aria-hidden="true" />
                در حال بارگذاری...
              </div>
            ) : loadError ? (
              <p className="px-3.5 py-2.5 text-center text-xs font-bold text-kv-danger">
                خطا در دریافت گزینه‌ها. دوباره تلاش کنید.
              </p>
            ) : items.length > 0 ? (
              <>
                {items.map((option) => (
                  <Command.Item
                    key={option.id}
                    value={`${option.id}::${option.label}`}
                    onSelect={() => handleSelect(option)}
                    className={cn(
                      'cursor-pointer border-b border-kv-border px-3.5 py-2.5 text-start text-xs font-bold text-kv-text-secondary last:border-b-0',
                      'outline-none data-[selected=true]:bg-kv-surface-muted',
                      value === option.label && 'bg-kv-surface-muted'
                    )}
                  >
                    {option.label}
                  </Command.Item>
                ))}
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-2 border-t border-kv-border-muted px-3.5 py-2.5 text-xs text-kv-text-faint">
                    <KvSpinner className="size-3.5" aria-hidden="true" />
                    در حال بارگذاری...
                  </div>
                ) : hasMore ? (
                  <Command.Item
                    value="__load-more__"
                    onSelect={() => loadMore()}
                    className="cursor-pointer border-t border-kv-border-muted px-3.5 py-2.5 text-center text-xs font-bold text-kv-brand-soft-fg outline-none data-[selected=true]:bg-kv-surface-muted"
                  >
                    نمایش ۱۰ مورد بعدی
                  </Command.Item>
                ) : reachedLimit ? (
                  <p className="border-t border-kv-border-muted px-3.5 py-2.5 text-center text-xs font-bold text-kv-text-subtle">
                    نتایج زیاد است؛ جستجو را دقیق‌تر کنید.
                  </p>
                ) : null}
              </>
            ) : (
              <Command.Empty className="px-3.5 py-2.5 text-center text-xs text-kv-text-subtle">
                نتیجه‌ای یافت نشد.
              </Command.Empty>
            )}
          </Command.List>
        </Command>
      ) : null}
    </div>
  );
}
