'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Command } from 'cmdk';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvOverlayScrollMoreCue } from '@/components/shared/KvOverlayScrollMoreCue';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  kvOverlayItemClassName,
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

/**
 * Generic searchable combobox (cmdk) for non-organization lists.
 * Organization typeahead stays on {@link KvSearchableOrganizationSelect}.
 */
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
  const edgeScroll = useEdgeAutoScroll<HTMLDivElement>();
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

  useEffect(() => {
    if (disabled) return;

    const close = (event: MouseEvent) => {
      if (!(event.target instanceof Node) || rootRef.current?.contains(event.target)) {
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
      aria-controls={open ? listId : undefined}
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
          aria-controls={open ? listId : undefined}
          className="h-full w-full bg-transparent px-kv-group text-start text-xs font-medium text-kv-text outline-none placeholder:text-kv-text-faint disabled:cursor-not-allowed"
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
        <span className="pointer-events-none pe-kv-pair text-kv-text-faint">
          <FaIcon icon={faIcons.chevronDown} size="2xs" />
        </span>
      </div>

      {open && !disabled ? (
        <Command
          id={listId}
          shouldFilter={false}
          loop
          className={cn(
            kvOverlayPanelClassName,
            'absolute start-0 top-full z-50 mt-1 flex w-full max-h-56 flex-col overflow-hidden'
          )}
        >
          <Command.List
            ref={edgeScroll.ref}
            data-edge-auto-scroll=""
            onPointerMove={edgeScroll.onPointerMove}
            onPointerLeave={edgeScroll.onPointerLeave}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden outline-none"
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
            visible={edgeScroll.canScrollDown}
            onHoverStart={edgeScroll.nudgeDown}
            onHoverEnd={edgeScroll.stop}
          />
        </Command>
      ) : null}
    </div>
  );
}
