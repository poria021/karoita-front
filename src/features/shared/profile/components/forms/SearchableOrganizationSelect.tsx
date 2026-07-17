'use client';

import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { KvTextField } from '@/components/shared/KvTextField';
import { cn } from '@/lib/utils';

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

/** Search-on-type select — shell + label via {@link KvTextField}. */
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

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
          <span className="flex h-full items-center ps-3">
            <Search className="size-3.5" aria-hidden="true" />
          </span>
        }
        endAddon={
          <span className="flex h-full items-center pe-3">
            <ChevronDown
              className="size-3.5 text-slate-300"
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
        <div className="absolute start-0 z-50 mt-1 max-h-52 w-full overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
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
            ))
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
