'use client';

import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Command } from 'cmdk';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import { KvOverlayScrollMoreCue } from '@/components/shared/KvOverlayScrollMoreCue';
import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  kvOverlayListScrollClassName,
  kvOverlayPanelClassName,
} from '@/components/shared/kvOverlayMenu';
import { Spinner } from '@/components/ui/spinner';
import {
  mergeEdgeAutoScrollRef,
  useEdgeAutoScroll,
} from '@/hooks/useEdgeAutoScroll';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

import { SelectionChip } from './SelectionChip';
import {
  multiCheckboxItemClassName,
  multiTriggerClassName,
  multiTriggerLockedClassName,
} from './styles';

export type KvSearchableStaticOption = {
  id: string;
  label: string;
};

type StaticOptionsSelectBase = {
  options: readonly KvSearchableStaticOption[];
  label?: string | false;
  required?: boolean;
  optionalHint?: boolean;
  placeholder: string;
  locked?: boolean;
  showLockIcon?: boolean;
  error?: string;
  emptyLabel?: string;
  allowEmpty?: boolean;
  onQueryChange?: (query: string) => void;
  onOpen?: () => void;
  isLoading?: boolean;
  /** سقف انتخاب در حالت چندتایی؛ پیش‌فرض بدون سقف. */
  maxSelected?: number;
};

export type StaticOptionsSelectProps =
  | (StaticOptionsSelectBase & {
      multi?: false;
      value: string;
      onChange: (value: string) => void;
    })
  | (StaticOptionsSelectBase & {
      multi: true;
      value: string[];
      onChange: (value: string[]) => void;
    });

/**
 * همان ظاهر چندانتخابی پروفایل (`KvSearchableOrganizationSelect` با `multi`)
 * برای گزینه‌های ثابت — تریگر چیپ + جستجو داخل دراپ‌داون.
 */
export const StaticOptionsSelect = forwardRef<
  HTMLInputElement,
  StaticOptionsSelectProps
>(function StaticOptionsSelect(props, ref) {
  const {
    options,
    label = false,
    required = false,
    optionalHint = false,
    placeholder,
    locked = false,
    showLockIcon,
    error,
    emptyLabel = 'موردی یافت نشد.',
    allowEmpty = true,
    onQueryChange,
    onOpen,
    isLoading = false,
    maxSelected,
  } = props;

  const isMulti = props.multi === true;
  const selectedIds = useMemo(
    () =>
      isMulti
        ? (props.value as string[])
        : props.value
          ? [props.value as string]
          : [],
    [isMulti, props.value]
  );

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of options) map.set(option.id, option.label);
    return map;
  }, [options]);

  const selectedLabels = selectedIds.map(
    (id) => labelById.get(id) ?? id
  );

  const rawId = useId();
  const fieldId = `kv-static-select-${rawId.replace(/:/g, '')}`;
  const labelId = `${fieldId}-label`;
  const listboxId = `${fieldId}-listbox`;

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const edgeScroll = useEdgeAutoScroll<HTMLDivElement>();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const filtered = useMemo(() => {
    if (onQueryChange) return options;
    const q = query.trim();
    if (!q) return options;
    const needle = q.toLocaleLowerCase('fa');
    return options.filter((o) =>
      o.label.toLocaleLowerCase('fa').includes(needle)
    );
  }, [onQueryChange, options, query]);

  const atMax =
    isMulti &&
    typeof maxSelected === 'number' &&
    selectedIds.length >= maxSelected;

  const handleSelect = (option: KvSearchableStaticOption) => {
    if (isMulti) {
      const current = props.value as string[];
      if (current.includes(option.id)) {
        (props as Extract<StaticOptionsSelectProps, { multi: true }>).onChange(
          current.filter((id) => id !== option.id)
        );
      } else {
        if (atMax) return;
        (
          props as Extract<StaticOptionsSelectProps, { multi: true }>
        ).onChange([...current, option.id]);
      }
      setQuery('');
      return;
    }

    const singleOnChange = (
      props as Extract<StaticOptionsSelectProps, { multi?: false }>
    ).onChange;
    if (props.value === option.id) {
      if (allowEmpty) singleOnChange('');
    } else {
      singleOnChange(option.id);
    }
    setQuery('');
    setOpen(false);
  };

  const handleRemoveChip = (idToRemove: string) => {
    if (isMulti) {
      const current = props.value as string[];
      (props as Extract<StaticOptionsSelectProps, { multi: true }>).onChange(
        current.filter((id) => id !== idToRemove)
      );
      return;
    }
    if (!allowEmpty) return;
    (
      props as Extract<StaticOptionsSelectProps, { multi?: false }>
    ).onChange('');
  };

  return (
    <div ref={rootRef} className="relative">
      <KvFieldFrame
        id={labelId}
        label={label}
        required={required}
        optionalHint={optionalHint}
        locked={locked}
        showLockIcon={showLockIcon}
        error={error}
      >
        <div className="relative">
          <div
            id={fieldId}
            ref={ref as unknown as React.Ref<HTMLDivElement>}
            role="combobox"
            aria-autocomplete="list"
            tabIndex={locked ? -1 : 0}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-labelledby={labelId}
            aria-invalid={error ? true : undefined}
            aria-disabled={locked || undefined}
            data-state={open ? 'open' : 'closed'}
            onClick={() => {
              if (locked) return;
              setOpen((prev) => {
                const next = !prev;
                if (next) onOpen?.();
                return next;
              });
            }}
            onKeyDown={(event) => {
              if (locked) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setOpen((prev) => {
                  const next = !prev;
                  if (next) onOpen?.();
                  return next;
                });
              }
              if (event.key === 'Escape') setOpen(false);
            }}
            className={cn(
              multiTriggerClassName,
              locked && multiTriggerLockedClassName,
              !locked &&
                'can-hover:not-focus-visible:hover:border-kv-border-hover data-[state=open]:hover:border-kv-brand',
              !locked &&
                selectedLabels.length === 0 &&
                'ps-3.5 text-kv-text-placeholder',
              locked && 'ps-3.5'
            )}
          >
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-start">
              {selectedLabels.length === 0
                ? placeholder
                : selectedIds.map((id, idx) => {
                    const lbl = selectedLabels[idx] ?? id;
                    return locked ? (
                      <span key={id} className="inline-flex items-center gap-1">
                        <SelectionChip
                          label={lbl}
                          disabled
                          onRemove={() => handleRemoveChip(id)}
                        />
                        {idx < selectedIds.length - 1 && (
                          <span className="shrink-0 text-kv-text-disabled">
                            و
                          </span>
                        )}
                      </span>
                    ) : (
                      <SelectionChip
                        key={id}
                        label={lbl}
                        disabled={false}
                        onRemove={() => handleRemoveChip(id)}
                      />
                    );
                  })}
            </span>

            <FaIcon
              icon={faIcons.chevronDown}
              size="2xs"
              className="shrink-0 text-kv-text-placeholder"
            />
          </div>

          {open && !locked ? (
            <Command
              shouldFilter={false}
              loop
              className={cn(
                kvOverlayPanelClassName,
                'absolute start-0 z-50 mt-1 flex w-full max-h-64 flex-col overflow-hidden'
              )}
            >
              <div className="border-b border-kv-border p-1">
                <KvSearchField
                  autoFocus
                  label={false}
                  size="sm"
                  value={query}
                  placeholder={placeholder}
                  onChange={(event) => {
                    const next = event.target.value;
                    setQuery(next);
                    onQueryChange?.(next);
                  }}
                />
              </div>

              <Command.List
                id={listboxId}
                role="listbox"
                aria-label="گزینه‌های قابل انتخاب"
                ref={mergeEdgeAutoScrollRef(edgeScroll.ref, listRef)}
                data-edge-auto-scroll=""
                onPointerMove={edgeScroll.onPointerMove}
                onPointerLeave={edgeScroll.onPointerLeave}
                className={cn(kvOverlayListScrollClassName, 'p-1 outline-none')}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-kv-pair px-kv-group py-kv-pair">
                    <Spinner className="size-3.5" aria-hidden="true" />
                    <KvTypography variant="caption" as="span">
                      در حال بارگذاری...
                    </KvTypography>
                  </div>
                ) : filtered.length > 0 ? (
                  filtered.map((option) => {
                    const isSelected = selectedIdSet.has(option.id);
                    const blocked = atMax && !isSelected;
                    return (
                      <Command.Item
                        key={option.id}
                        value={`${option.id}::${option.label}`}
                        role="option"
                        aria-selected={isSelected}
                        disabled={blocked}
                        onSelect={() => {
                          if (blocked) return;
                          handleSelect(option);
                        }}
                        className={multiCheckboxItemClassName(isSelected)}
                      >
                        <span className="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center">
                          {isSelected ? (
                            <FaIcon icon={faIcons.check} size="sm" />
                          ) : null}
                        </span>
                        {option.label}
                      </Command.Item>
                    );
                  })
                ) : (
                  <Command.Empty className="px-kv-group py-kv-pair text-start">
                    <KvTypography variant="caption" as="span">
                      {emptyLabel}
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
      </KvFieldFrame>
    </div>
  );
});

StaticOptionsSelect.displayName = 'StaticOptionsSelect';
