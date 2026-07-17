'use client';

import { memo, useEffect, useRef, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTextField } from '@/components/shared/KvTextField';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

import type { OrganizationField } from '../../data/organization-catalog';
import {
  useOrganizationOptions,
  type OrganizationDependsOn,
} from '../../hooks/useOrganizationOptions';
import type { OrganizationOption } from '../../services/organization-options.service';

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

type OptionRowProps = {
  option: OrganizationOption;
  selected: boolean;
  onSelect: (option: OrganizationOption) => void;
};

const OrganizationOptionRow = memo(function OrganizationOptionRow({
  option,
  selected,
  onSelect,
}: OptionRowProps) {
  return (
    <button
      type="button"
      className={cn(
        'w-full border-b border-kv-border px-3.5 py-2.5 text-start text-xs font-bold text-kv-text-secondary last:border-b-0',
        'hover:bg-kv-surface-muted focus-visible:bg-kv-surface-muted focus-visible:outline-none',
        selected && 'bg-kv-surface-muted'
      )}
      onClick={() => onSelect(option)}
    >
      {option.label}
    </button>
  );
});

/**
 * Search-on-type organization select — fetches pages of 10 from
 * {@link useOrganizationOptions} only while open (production pagination pattern).
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

  const { items, hasMore, isLoading, isLoadingMore, loadMore, error: loadError } =
    useOrganizationOptions({
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
    <div ref={rootRef} className="relative">
      <KvTextField
        label={label}
        required={required}
        optionalHint={optionalHint}
        value={query}
        locked={locked}
        showLockIcon={showLockIcon}
        error={error}
        placeholder={placeholder}
        autoComplete="off"
        startAddon={
          showSearchIcon ? (
            <span className="flex h-full items-center ps-2.5 pe-0.5">
              <FaIcon icon={faIcons.magnifyingGlass} size="xs" />
            </span>
          ) : undefined
        }
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
        <div
          ref={listRef}
          onScroll={handleListScroll}
          className="absolute start-0 z-50 mt-1 max-h-52 w-full overflow-y-auto overflow-x-hidden rounded-kv-control border border-kv-border bg-kv-surface"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3.5 py-3 text-xs text-kv-text-faint">
              <Spinner className="size-3.5" aria-hidden="true" />
              در حال بارگذاری...
            </div>
          ) : loadError ? (
            <p className="px-3.5 py-2.5 text-center text-xs font-bold text-kv-danger">
              خطا در دریافت گزینه‌ها. دوباره تلاش کنید.
            </p>
          ) : items.length > 0 ? (
            <>
              {items.map((option) => (
                <OrganizationOptionRow
                  key={option.id}
                  option={option}
                  selected={value === option.label}
                  onSelect={handleSelect}
                />
              ))}
              {isLoadingMore ? (
                <div className="flex items-center justify-center gap-2 border-t border-kv-border-muted px-3.5 py-2.5 text-xs text-kv-text-faint">
                  <Spinner className="size-3.5" aria-hidden="true" />
                  در حال بارگذاری...
                </div>
              ) : hasMore ? (
                <button
                  type="button"
                  className="w-full border-t border-kv-border-muted px-3.5 py-2.5 text-center text-xs font-bold text-kv-brand-soft-fg hover:bg-kv-surface-muted"
                  onClick={loadMore}
                >
                  نمایش ۱۰ مورد بعدی
                </button>
              ) : null}
            </>
          ) : (
            <p className="px-3.5 py-2.5 text-center text-xs text-kv-text-subtle">
              نتیجه‌ای یافت نشد.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
