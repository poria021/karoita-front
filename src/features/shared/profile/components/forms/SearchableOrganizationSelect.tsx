'use client';

import { ChevronDown, Loader2, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { KvTextField } from '@/components/shared/KvTextField';
import { cn } from '@/lib/utils';

/** Page size for list windowing (mirrors server-side page size). */
const PAGE_SIZE = 10;

interface SearchableOrganizationSelectProps {
  /**
   * Label text string, or `false` to hide the label.
   * Same contract as {@link KvTextField}.
   */
  label?: string | false;
  required?: boolean;
  optionalHint?: boolean;
  value: string;
  options: string[];
  placeholder: string;
  locked?: boolean;
  showLockIcon?: boolean;
  error?: string;
  onChange: (value: string) => void;
}

/**
 * Search-on-type select — shell + label via {@link KvTextField}.
 * Options render in pages of {@link PAGE_SIZE}; scrolling loads the next page
 * (client window over the filtered list — same UX as server-side pagination).
 */
export function SearchableOrganizationSelect({
  label = false,
  required = false,
  optionalHint = false,
  value,
  options,
  placeholder,
  locked = false,
  showLockIcon,
  error,
  onChange,
}: SearchableOrganizationSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => setQuery(value), [value]);

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

  const filteredOptions = useMemo(
    () => options.filter((option) => option.includes(query.trim())),
    [options, query]
  );

  /** Reset pagination when the filter set or open state changes. */
  useEffect(() => {
    setPage(1);
    setIsLoadingMore(false);
  }, [query, options, open]);

  const visibleOptions = useMemo(
    () => filteredOptions.slice(0, page * PAGE_SIZE),
    [filteredOptions, page]
  );
  const hasMore = visibleOptions.length < filteredOptions.length;

  const loadNextPage = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    // Mimic a server round-trip; swap for a real fetch when NestJS is wired.
    window.setTimeout(() => {
      setPage((current) => current + 1);
      setIsLoadingMore(false);
    }, 180);
  };

  const handleListScroll = () => {
    const list = listRef.current;
    if (!list || !hasMore || isLoadingMore) return;
    const nearBottom =
      list.scrollTop + list.clientHeight >= list.scrollHeight - 32;
    if (nearBottom) loadNextPage();
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
          onChange('');
          setOpen(true);
        }}
      />

      {open && !locked && (
        <div
          ref={listRef}
          onScroll={handleListScroll}
          className="absolute start-0 z-50 mt-1 max-h-52 w-full overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white"
        >
          {visibleOptions.length > 0 ? (
            <>
              {visibleOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    'w-full border-b border-slate-200 px-3.5 py-2.5 text-start text-xs font-bold text-slate-800 last:border-b-0',
                    'hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none',
                    value === option && 'bg-slate-50'
                  )}
                  onClick={() => {
                    setQuery(option);
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  {option}
                </button>
              ))}
              {isLoadingMore ? (
                <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-3.5 py-2.5 text-xs text-slate-400">
                  <Loader2
                    className="size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                  در حال بارگذاری...
                </div>
              ) : hasMore ? (
                <button
                  type="button"
                  className="w-full border-t border-slate-100 px-3.5 py-2.5 text-center text-xs font-bold text-brand-600 hover:bg-slate-50"
                  onClick={loadNextPage}
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
      )}
    </div>
  );
}
