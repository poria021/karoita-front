'use client';

import { useEffect, useRef, useState, forwardRef } from 'react';
import { Command } from 'cmdk';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import { KvOverlayScrollMoreCue } from '@/components/shared/KvOverlayScrollMoreCue';
import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  kvOverlayItemClassName,
  kvOverlayListScrollClassName,
  kvOverlayPanelClassName,
} from '@/components/shared/kvOverlayMenu';
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
import { faIcons } from '@/utils/iconMap';
import type { UserRole } from '@/types/auth';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

import { isBlockedByMissingDependency } from './organization-select/dependency';
import { OrganizationOptionsList } from './organization-select/OrganizationOptionsList';
import { SelectionChip } from './organization-select/SelectionChip';
import {
  multiCheckboxItemClassName,
  multiTriggerClassName,
  multiTriggerLockedClassName,
} from './organization-select/styles';

export type KvSearchableOrganizationSelectProps =
  | SingleSelectProps
  | MultiSelectProps;

type BaseProps = {
  type: OrganizationField;
  label?: string | false;
  required?: boolean;
  optionalHint?: boolean;
  placeholder: string;
  locked?: boolean;
  showLockIcon?: boolean;
  error?: string;
  dependsOn?: OrganizationDependsOn;
  role?: UserRole;
};

type SingleSelectProps = BaseProps & {
  multi?: false;
  value: string;
  onChange: (value: string) => void;
};

type MultiSelectProps = BaseProps & {
  multi: true;
  value: string[];
  onChange: (value: string[]) => void;
};

export const KvSearchableOrganizationSelect = forwardRef<
  HTMLInputElement,
  KvSearchableOrganizationSelectProps
>(function KvSearchableOrganizationSelect(props, ref) {
  const {
    type,
    label = false,
    required = false,
    optionalHint = false,
    placeholder,
    locked = false,
    showLockIcon,
    error,
    dependsOn,
    role,
  } = props;

  const isMulti = props.multi === true;

  const selectedLabels: string[] = isMulti
    ? (props.value as string[])
    : props.value
    ? [props.value as string]
    : [];

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const edgeScroll = useEdgeAutoScroll<HTMLDivElement>();
  const [open, setOpen] = useState(false);

  // مقدار بیرونی را حین رندر sync کن — `useEffect` یک رندر اضافه و cascade می‌داد:
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const singleValue = !isMulti ? (props as SingleSelectProps).value : undefined;
  // `query` اولیه همان `singleValue` تا تک‌انتخابی بعد از mount مقدار را نشان دهد.
  const [query, setQuery] = useState(singleValue ?? '');
  const [prevSingleValue, setPrevSingleValue] = useState(singleValue);
  // وقتی کاربر در حال تایپ است، تایپ خودش باعث `onChange('')` به والد می‌شود؛
  // بدون این پرچم همان تغییرِ خودمان در رندر بعدی `query` تازه‌تایپ‌شده را با '' جایگزین می‌کرد
  // (کاراکترها گم/جابه‌جا می‌شدند). فقط تغییرات واقعاً بیرونی باید `query` را sync کنند.
  const [isEditing, setIsEditing] = useState(false);
  if (!isMulti && singleValue !== prevSingleValue) {
    setPrevSingleValue(singleValue);
    if (!isEditing) {
      setQuery(singleValue ?? '');
    }
  }

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
        setIsEditing(false);
        // جستجوی نیمه‌کاره را به مقدار انتخاب‌شده برگردان
        if (!isMulti) {
          setQuery((props as SingleSelectProps).value ?? '');
        }
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isMulti, props]);

  const listQuery = isMulti ? query : query === (props as SingleSelectProps).value ? '' : query;

  const blockedByParent = isBlockedByMissingDependency(type, dependsOn);

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
    // چندانتخابی از mount fetch می‌کند مگر والد خالی باشد؛ تک‌انتخابی فقط با دراپ‌داون باز.
    enabled: locked
      ? false
      : blockedByParent
      ? false
      : isMulti
      ? true
      : open,
    dependsOn,
    role,
  });

  const handleListScroll = () => {
    const list = listRef.current;
    if (!list || !hasMore || isLoadingMore) return;
    const nearBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 32;
    if (nearBottom) loadMore();
  };

  const handleSelect = (option: OrganizationOption) => {
    if (isMulti) {
      const current = props.value as string[];
      if (current.includes(option.label)) {
        (props as MultiSelectProps).onChange(current.filter((v) => v !== option.label));
      } else {
        (props as MultiSelectProps).onChange([...current, option.label]);
      }
      // چندانتخابی باز می‌ماند تا چند مورد پشت‌سرهم انتخاب شوند
      setQuery('');
    } else {
      setIsEditing(false);
      setQuery(option.label);
      (props as SingleSelectProps).onChange(option.label);
      setOpen(false);
    }
  };

  const handleRemoveChip = (labelToRemove: string) => {
    if (isMulti) {
      const current = props.value as string[];
      (props as MultiSelectProps).onChange(current.filter((v) => v !== labelToRemove));
    } else {
      (props as SingleSelectProps).onChange('');
      setQuery('');
    }
  };

  const showSearchIcon = query.trim().length === 0 && selectedLabels.length === 0;

  if (isMulti) {
    const fieldId = `org-select-${type}`;
    const labelId = `${fieldId}-label`;
    const listboxId = `${fieldId}-listbox`;

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
                setOpen((prev) => !prev);
              }}
              onKeyDown={(event) => {
                if (locked) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setOpen((prev) => !prev);
                }
                if (event.key === 'Escape') setOpen(false);
              }}
              className={cn(
                multiTriggerClassName,
                locked && multiTriggerLockedClassName,
                !locked &&
                  'can-hover:not-focus-visible:hover:border-kv-border-hover data-[state=open]:hover:border-kv-brand',
                !locked && selectedLabels.length === 0 && 'ps-3.5 text-kv-text-placeholder',
                locked && 'ps-3.5'
              )}
            >
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-start">
                {selectedLabels.length === 0
                  ? placeholder
                  : locked
                  ? selectedLabels.map((lbl, idx) => (
                      <span key={lbl} className="inline-flex items-center gap-1">
                        <SelectionChip
                          label={lbl}
                          disabled
                          onRemove={() => handleRemoveChip(lbl)}
                        />
                        {idx < selectedLabels.length - 1 && (
                          <span className="shrink-0 text-kv-text-disabled">و</span>
                        )}
                      </span>
                    ))
                  : selectedLabels.map((lbl) => (
                      <SelectionChip
                        key={lbl}
                        label={lbl}
                        disabled={false}
                        onRemove={() => handleRemoveChip(lbl)}
                      />
                    ))}
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
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>

                <Command.List
                  id={listboxId}
                  role="listbox"
                  aria-label="گزینه‌های قابل انتخاب"
                  ref={mergeEdgeAutoScrollRef(edgeScroll.ref, listRef)}
                  data-edge-auto-scroll=""
                  onScroll={handleListScroll}
                  onPointerMove={edgeScroll.onPointerMove}
                  onPointerLeave={edgeScroll.onPointerLeave}
                  className={cn(kvOverlayListScrollClassName, 'p-1 outline-none')}
                >
                  <OrganizationOptionsList
                    type={type}
                    isLoading={isLoading}
                    loadError={loadError}
                    blockedByParent={blockedByParent}
                    items={items}
                    isLoadingMore={isLoadingMore}
                    hasMore={hasMore}
                    reachedLimit={reachedLimit}
                    onLoadMore={loadMore}
                    renderItem={(option) => {
                      const isSelected = selectedLabels.includes(option.label);
                      return (
                        <Command.Item
                          key={option.id}
                          value={`${option.id}::${option.label}`}
                          role="option"
                          aria-selected={isSelected}
                          onSelect={() => handleSelect(option)}
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
                    }}
                  />
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
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      role="combobox"
      aria-expanded={open && !locked}
      aria-controls={`org-select-${type}`}
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
          const val = event.target.value;
          setIsEditing(true);
          setQuery(val);
          if ((props as SingleSelectProps).value) {
            (props as SingleSelectProps).onChange('');
          }
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
            className={cn(kvOverlayListScrollClassName, 'outline-none')}
          >
            <OrganizationOptionsList
              type={type}
              isLoading={isLoading}
              loadError={loadError}
              blockedByParent={blockedByParent}
              items={items}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              reachedLimit={reachedLimit}
              onLoadMore={loadMore}
              renderItem={(option) => (
                <Command.Item
                  key={option.id}
                  value={`${option.id}::${option.label}`}
                  onSelect={() => handleSelect(option)}
                  className={cn(
                    kvOverlayItemClassName('cursor-pointer text-start outline-none')
                  )}
                >
                  <KvTypography variant="label" as="span">
                    {option.label}
                  </KvTypography>
                </Command.Item>
              )}
            />
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
