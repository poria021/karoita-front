'use client';

import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { KvButton } from '@/components/shared/KvButton';
import { KvTextField } from '@/components/shared/KvTextField';
import { cn } from '@/lib/utils';

interface SearchableOrganizationSelectProps {
  value: string;
  options: string[];
  placeholder: string;
  locked?: boolean;
  error?: string;
  onChange: (value: string) => void;
}

/** Accessible search-on-type selector used by profile organization fields. */
export function SearchableOrganizationSelect({
  value,
  options,
  placeholder,
  locked = false,
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
        label={false}
        value={query}
        locked={locked}
        error={error}
        placeholder={placeholder}
        autoComplete="off"
        startAddon={
          <span className="ps-3">
            <Search className="size-4" aria-hidden="true" />
          </span>
        }
        endAddon={
          <span className="pe-3">
            <ChevronDown
              className="size-4 text-slate-300 rtl:rotate-180"
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
        <div className="absolute start-0 z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <KvButton
                key={option}
                type="button"
                color="neutral"
                appearance="ghost"
                fullWidth
                icon={
                  <Check
                    className={cn(
                      'size-4 text-emerald-600',
                      value === option ? 'opacity-100' : 'opacity-0'
                    )}
                    aria-hidden="true"
                  />
                }
                onClick={() => {
                  setQuery(option);
                  onChange(option);
                  setOpen(false);
                }}
              >
                {option}
              </KvButton>
            ))
          ) : (
            <p className="py-4 text-center text-xs text-slate-500">
              نتیجه‌ای یافت نشد.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
