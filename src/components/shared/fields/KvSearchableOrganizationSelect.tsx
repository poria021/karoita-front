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
  kvOverlayPanelClassName,
  kvOverlaySectionTopDividerClassName,
} from '@/components/shared/kvOverlayMenu';
import { Badge } from '@/components/ui/badge';
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
import { faIcons } from '@/utils/iconMap';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

/**
 * کلاس باکس تریگر — دقیقاً همان استایل باکس چندانتخابی «تمدید گروهی»
 * (KvCheckboxMultiSelect) در ارزیابی فراگیران، تا ظاهر یکسان باشد.
 */
const multiTriggerClassName = cn(
  'flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-kv-pair rounded-kv-control',
  'border border-kv-border bg-kv-field px-2 py-1',
  'font-sans text-xs font-medium text-kv-text shadow-none',
  'outline-none transition-[color,background-color,border-color,box-shadow]',
  'focus-visible:border-kv-brand focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
  'data-[state=open]:border-kv-brand data-[state=open]:ring-[3px] data-[state=open]:ring-kv-ring/15'
);

/** آیتم چک‌باکسی — دقیقاً هم‌استایل DropdownMenuCheckboxItem (چک‌باکس تمدید گروهی). */
function multiCheckboxItemClassName(isSelected: boolean): string {
  return cn(
    'relative flex cursor-pointer items-center gap-2 rounded-kv-control py-kv-pair ps-8 pe-2',
    'text-xs font-bold outline-none select-none',
    'data-[selected=true]:bg-kv-brand-soft data-[selected=true]:text-kv-brand-soft-fg',
    isSelected && 'bg-kv-brand-soft text-kv-brand-soft-fg'
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────

/** حالت single: value رشته است؛ حالت multi: value آرایه رشته‌ها */
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

// ─── Chip (برای multi-select) ──────────────────────────────────────────────────

function SelectionChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge
      variant="brand"
      className="max-w-full gap-0.5 rounded-kv-tight px-1.5 py-0.5 pe-0.5 font-medium leading-none"
    >
      <span className="min-w-0 truncate">{label}</span>
      <button
        type="button"
        tabIndex={-1}
        aria-label={`حذف ${label}`}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-kv-tight text-kv-brand-soft-fg outline-none transition-colors hover:bg-kv-brand/15 focus-visible:ring-2 focus-visible:ring-kv-ring/30"
      >
        <FaIcon icon={faIcons.xmark} size="2xs" />
      </button>
    </Badge>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

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
  } = props;

  const isMulti = props.multi === true;

  // ── مقادیر انتخابی ──
  // در single: selectedLabels حداکثر یک آیتم دارد
  const selectedLabels: string[] = isMulti
    ? (props.value as string[])
    : props.value
    ? [props.value as string]
    : [];

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const edgeScroll = useEdgeAutoScroll<HTMLDivElement>();
  const [open, setOpen] = useState(false);

  // در single-mode وقتی مقدار بیرونی عوض می‌شود input را sync کن — به‌جای useEffect (که باعث یک رندر اضافه و cascading render می‌شد)، طبق الگوی رسمی React مستقیم حین رندر state رو تنظیم می‌کنیم:
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const singleValue = !isMulti ? (props as SingleSelectProps).value : undefined;
  // query با مقدار اولیه singleValue مقداردهی می‌شه تا single-select (مثل رشته تحصیلی)
  // بلافاصله پس از mount مقدار خود را نشان بده — نه بعد از اولین تغییر.
  const [query, setQuery] = useState(singleValue ?? '');
  const [prevSingleValue, setPrevSingleValue] = useState(singleValue);
  if (!isMulti && singleValue !== prevSingleValue) {
    setPrevSingleValue(singleValue);
    setQuery(singleValue ?? '');
  }

  // بستن dropdown وقتی خارج از کامپوننت کلیک می‌شود
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
        // در single-mode اگر کاربر نیمه‌راه ول کرد، input را reset کن
        if (!isMulti) {
          setQuery((props as SingleSelectProps).value ?? '');
        }
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isMulti, props]);

  // query برای جستجو در لیست — در single-mode وقتی query != selected value است
  const listQuery = isMulti ? query : query === (props as SingleSelectProps).value ? '' : query;

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
    const nearBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 32;
    if (nearBottom) loadMore();
  };

  const handleSelect = (option: OrganizationOption) => {
    if (isMulti) {
      const current = props.value as string[];
      if (current.includes(option.label)) {
        // toggle off
        (props as MultiSelectProps).onChange(current.filter((v) => v !== option.label));
      } else {
        (props as MultiSelectProps).onChange([...current, option.label]);
      }
      // در multi-mode dropdown باز می‌ماند تا کاربر چند مورد انتخاب کند
      setQuery('');
    } else {
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

  // ─── حالت چندانتخابی: دقیقاً هم‌استایل KvCheckboxMultiSelect (تمدید گروهی) ───
  if (isMulti) {
    const fieldId = `org-select-${type}`;
    const listboxId = `${fieldId}-listbox`;

    return (
      <div ref={rootRef} className="relative">
        <KvFieldFrame
          id={fieldId}
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
                locked && 'cursor-not-allowed opacity-50',
                selectedLabels.length === 0 && 'ps-3.5 text-kv-text-placeholder'
              )}
            >
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-start">
                {selectedLabels.length === 0
                  ? placeholder
                  : selectedLabels.map((lbl) => (
                      <SelectionChip
                        key={lbl}
                        label={lbl}
                        onRemove={() => handleRemoveChip(lbl)}
                      />
                    ))}
              </span>

              <FaIcon
                icon={faIcons.chevronDown}
                size="2xs"
                className="shrink-0 text-kv-text-muted"
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
                  className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-1 outline-none"
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
                      {items.map((option) => {
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
                      })}

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
                            'cursor-pointer rounded-kv-control px-3.5 py-2.5 text-center text-xs font-bold outline-none data-[selected=true]:bg-kv-surface-muted',
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
        </KvFieldFrame>
      </div>
    );
  }

  // ─── حالت تک‌انتخابی: کومبوباکس جست‌وجوپذیر (بدون تغییر) ───
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
                      kvOverlayItemClassName('cursor-pointer text-start outline-none')
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
