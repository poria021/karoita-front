'use client';

import { ChevronDown, Search } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';

import { KvTextField } from '@/components/shared/KvTextField';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

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
        'w-full border-b border-slate-200 px-3.5 py-2.5 text-start text-xs font-bold text-slate-800 last:border-b-0',
        'hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none',
        selected && 'bg-slate-50'
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
          <span className="flex h-full w-9 items-center justify-center">
            <Search className="size-3.5 shrink-0" aria-hidden="true" />
          </span>
        }
        endAddon={
          <span className="flex h-full w-9 items-center justify-center">
            <ChevronDown
              className="size-3.5 shrink-0 text-slate-400"
              strokeWidth={2}
              aria-hidden="true"
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
          className="absolute start-0 z-50 mt-1 max-h-52 w-full overflow-y-auto overflow-x-hidden rounded-kv-control border border-slate-200 bg-white"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3.5 py-3 text-xs text-slate-400">
              <Spinner className="size-3.5" aria-hidden="true" />
              در حال بارگذاری...
            </div>
          ) : loadError ? (
            <p className="px-3.5 py-2.5 text-center text-xs font-bold text-rose-600">
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
                <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-3.5 py-2.5 text-xs text-slate-400">
                  <Spinner className="size-3.5" aria-hidden="true" />
                  در حال بارگذاری...
                </div>
              ) : hasMore ? (
                <button
                  type="button"
                  className="w-full border-t border-slate-100 px-3.5 py-2.5 text-center text-xs font-bold text-brand-600 hover:bg-slate-50"
                  onClick={loadMore}
                >
                  نمایش ۱۰ مورد بعدی
                </button>
              ) : null}
            </>
          ) : (
            <p className="px-3.5 py-2.5 text-center text-xs text-slate-500">
              نتیجه‌ای یافت نشد.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
