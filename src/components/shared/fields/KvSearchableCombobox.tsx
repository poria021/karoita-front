'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { Command } from 'cmdk';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvOverlayScrollMoreCue } from '@/components/shared/KvOverlayScrollMoreCue';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  kvOverlayItemClassName,
  kvOverlayListScrollClassName,
  kvOverlayPanelClassName,
} from '@/components/shared/kvOverlayMenu';
import { Spinner } from '@/components/ui/spinner';
import { useEdgeAutoScroll } from '@/hooks/useEdgeAutoScroll';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

export type KvSearchableComboboxItem = {
  id: string;
  label: string;
};

export type KvSearchableComboboxProps = {
  id?: string;
  value: string;
  onChange: (query: string) => void;
  items: KvSearchableComboboxItem[];
  onSelect: (item: KvSearchableComboboxItem) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  emptyLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDismiss?: () => void;
  className?: string;
  inputClassName?: string;
};

export function KvSearchableCombobox({
  id: idProp,
  value,
  onChange,
  items,
  onSelect,
  placeholder,
  disabled = false,
  isLoading = false,
  emptyLabel = 'نتیجه‌ای یافت نشد.',
  open: openProp,
  onOpenChange,
  onDismiss,
  className,
  inputClassName,
}: KvSearchableComboboxProps) {
  const autoId = useId();
  const fieldId = idProp ?? autoId;
  const listId = `${fieldId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    ref: edgeScrollRef,
    onPointerMove,
    onPointerLeave,
    canScrollDown,
    nudgeDown,
    stop,
  } = useEdgeAutoScroll<HTMLDivElement>();
  const openRef = useRef(false);
  const onOpenChangeRef = useRef(onOpenChange);
  const onDismissRef = useRef(onDismiss);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (openProp === undefined) setUncontrolledOpen(next);
  };

  const hasValue = value.trim().length > 0;
  const showClear = !disabled && hasValue;

  function handleClear(event: ReactMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    onChange('');
    setOpen(true);
  }

  useEffect(() => {
    if (disabled) return;

    const close = (event: MouseEvent) => {
      if (
        !(event.target instanceof Node) ||
        rootRef.current?.contains(event.target)
      ) {
        return;
      }

      if (!openRef.current) return;
      onOpenChangeRef.current?.(false);
      if (openProp === undefined) setUncontrolledOpen(false);
      onDismissRef.current?.();
    };

    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [disabled, openProp]);

  return (
    <div
      ref={rootRef}
      className={cn('relative', className)}
      role="combobox"
      aria-expanded={open && !disabled}
      aria-controls={listId}
      aria-haspopup="listbox"
      aria-autocomplete="list"
      aria-disabled={disabled || undefined}
    >
      <div
        className={cn(
          'relative flex h-9 w-full items-center rounded-kv-control border bg-kv-surface transition-all focus-within:border-kv-brand',
          disabled
            ? 'cursor-not-allowed border-kv-border bg-kv-surface-muted/50 opacity-60'
            : open
              ? 'border-kv-brand'
              : 'border-kv-border',
          inputClassName
        )}
      >
        <input
          id={fieldId}
          type="text"
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          className="h-full w-full min-w-0 bg-transparent ps-kv-group pe-1 text-start text-xs font-medium text-kv-text outline-none placeholder:text-kv-text-faint disabled:cursor-not-allowed"
          onFocus={() => {
            if (disabled) return;
            setOpen(true);
          }}
          onChange={(event) => {
            if (disabled) return;
            onChange(event.target.value);
            setOpen(true);
          }}
        />

        {showClear ? (
          <span className="flex h-full shrink-0 items-center gap-0.5 pe-kv-pair">
            <KvButton
              type="button"
              color="error"
              appearance="text"
              size="xs"
              tabIndex={-1}
              aria-label="پاک کردن جستجو"
              onClick={handleClear}
              icon={<FaIcon icon={faIcons.xmark} size="sm" />}
              className="text-kv-danger hover:text-kv-danger"
            />
          </span>
        ) : null}
      </div>

      {open && !disabled ? (
        <Command
          id={listId}
          role="listbox"
          aria-label="گزینه‌های جستجو"
          shouldFilter={false}
          loop
          className={cn(
            kvOverlayPanelClassName,
            'absolute start-0 top-full z-50 mt-1 flex w-full max-h-56 flex-col overflow-hidden'
          )}
        >
          <Command.List
            ref={edgeScrollRef}
            data-edge-auto-scroll=""
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className={cn(kvOverlayListScrollClassName, 'outline-none')}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-kv-pair px-kv-group py-kv-pair">
                <Spinner className="size-3.5" aria-hidden="true" />
                <KvTypography variant="caption" as="span">
                  در حال بارگذاری...
                </KvTypography>
              </div>
            ) : items.length > 0 ? (
              items.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.id}::${item.label}`}
                  role="option"
                  aria-selected={false}
                  onSelect={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  className={cn(
                    kvOverlayItemClassName(
                      'cursor-pointer text-start text-xs font-bold text-kv-text-secondary outline-none',
                      'data-[selected=true]:bg-kv-surface-muted'
                    )
                  )}
                >
                  {item.label}
                </Command.Item>
              ))
            ) : (
              <Command.Empty className="px-kv-group py-kv-pair text-start">
                <KvTypography variant="caption" as="span">
                  {emptyLabel}
                </KvTypography>
              </Command.Empty>
            )}
          </Command.List>

          <KvOverlayScrollMoreCue
            visible={canScrollDown}
            onHoverStart={nudgeDown}
            onHoverEnd={stop}
          />
        </Command>
      ) : null}
    </div>
  );
}