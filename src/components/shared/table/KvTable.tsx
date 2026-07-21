'use client';

import * as React from 'react';
import type { ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

/** ارتفاع ویوپورت اسکرول جداول ادمین. */
export const KV_TABLE_VIEWPORT_HEIGHT = 'h-[min(28rem,55dvh)]';

/** پر کردن بدنهٔ خالی/busy هم‌ارتفاع با ویوپورت منهای هدر. */
export const KV_TABLE_EMPTY_FILL_HEIGHT =
  'min-h-[calc(min(28rem,55dvh)-3.5rem)]';

const ROW_HEIGHT = 'h-12';

const ALIGN_CLASS = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
} as const;

export type KvTableAlign = keyof typeof ALIGN_CLASS;

/* —— body phase (rule 80) —— */

export type AdminTableBodyPhase = 'busy' | 'empty' | 'rows';

export function getAdminTableBodyPhase(
  isLoading: boolean,
  itemCount: number
): AdminTableBodyPhase {
  if (itemCount > 0) return 'rows';
  if (isLoading) return 'busy';
  return 'empty';
}

/* —— table primitives —— */

export type KvTableProps = React.ComponentProps<typeof Table> & {
  scrollable?: boolean;
};

export function KvTable({
  className,
  scrollable = true,
  ...props
}: KvTableProps) {
  const table = (
    <Table
      data-slot="kv-table"
      className={cn(
        'w-full border-separate border-spacing-0 text-start text-xs font-sans',
        className
      )}
      {...props}
    />
  );

  if (!scrollable) return table;

  return (
    <div data-slot="kv-table-scroll" className="max-w-full overflow-x-auto">
      {table}
    </div>
  );
}

export function KvTableHeader({
  className,
  ...props
}: React.ComponentProps<typeof TableHeader>) {
  return (
    <TableHeader
      data-slot="kv-table-header"
      className={cn(
        'sticky top-0 z-10 bg-kv-surface-muted font-bold text-kv-text-faint',
        className
      )}
      {...props}
    />
  );
}

export function KvTableBody({
  className,
  ...props
}: React.ComponentProps<typeof TableBody>) {
  return (
    <TableBody
      data-slot="kv-table-body"
      className={cn('[&_tr:last-child>td]:border-b-0', className)}
      {...props}
    />
  );
}

export function KvTableFooter({
  className,
  ...props
}: React.ComponentProps<typeof TableFooter>) {
  return (
    <TableFooter
      data-slot="kv-table-footer"
      className={cn(
        'border-t border-kv-border bg-kv-surface-muted/50 font-bold text-kv-text-faint',
        className
      )}
      {...props}
    />
  );
}

export type KvTableRowProps = React.ComponentProps<typeof TableRow> & {
  interactive?: boolean;
  selected?: boolean;
};

export function KvTableRow({
  className,
  interactive = false,
  selected = false,
  ...props
}: KvTableRowProps) {
  return (
    <TableRow
      data-slot="kv-table-row"
      data-selected={selected || undefined}
      data-interactive={interactive || undefined}
      className={cn(
        'font-bold text-kv-text transition-colors',
        'in-[data-slot=kv-table-body]:hover:bg-kv-surface-muted',
        'data-[selected]:bg-kv-brand-soft data-[selected]:font-extrabold data-[selected]:text-kv-brand',
        'data-[selected]:in-[data-slot=kv-table-body]:hover:bg-kv-brand-soft',
        interactive && 'cursor-pointer',
        className
      )}
      {...props}
    />
  );
}

export type KvTableHeadProps = Omit<
  React.ComponentProps<typeof TableHead>,
  'align'
> & {
  align?: KvTableAlign;
};

export function KvTableHead({
  className,
  align = 'start',
  ...props
}: KvTableHeadProps) {
  return (
    <TableHead
      data-slot="kv-table-head"
      className={cn(
        ROW_HEIGHT,
        'border-b border-kv-border px-3.5 py-0 font-bold whitespace-nowrap',
        ALIGN_CLASS[align],
        className
      )}
      {...props}
    />
  );
}

export type KvTableCellProps = Omit<
  React.ComponentProps<typeof TableCell>,
  'align'
> & {
  align?: KvTableAlign;
  emphasis?: boolean;
  mono?: boolean;
};

export function KvTableCell({
  className,
  align = 'start',
  emphasis = false,
  mono = false,
  ...props
}: KvTableCellProps) {
  return (
    <TableCell
      data-slot="kv-table-cell"
      className={cn(
        ROW_HEIGHT,
        'border-b border-kv-border px-3.5 py-0 whitespace-normal text-kv-text-secondary',
        ALIGN_CLASS[align],
        emphasis && 'font-extrabold text-kv-text',
        mono && 'font-mono',
        className
      )}
      {...props}
    />
  );
}

export function KvTableCaption({
  className,
  ...props
}: React.ComponentProps<typeof TableCaption>) {
  return (
    <TableCaption
      data-slot="kv-table-caption"
      className={cn('text-xs text-kv-text-faint', className)}
      {...props}
    />
  );
}

/* —— empty / busy —— */

export type KvTableEmptyProps = {
  colSpan: number;
  children: ReactNode;
  className?: string;
};

export function KvTableEmpty({
  colSpan,
  children,
  className,
}: KvTableEmptyProps) {
  return (
    <KvTableRow className="in-[data-slot=kv-table-body]:hover:bg-transparent">
      <KvTableCell
        colSpan={colSpan}
        align="center"
        className={cn('h-auto min-h-0 p-0', className)}
      >
        <div
          className={cn('flex w-full flex-col', KV_TABLE_EMPTY_FILL_HEIGHT)}
        >
          {children}
        </div>
      </KvTableCell>
    </KvTableRow>
  );
}

export type KvBusySurfaceProps = {
  tableViewport?: boolean;
  className?: string;
};

export function KvBusySurface({
  tableViewport = false,
  className,
}: KvBusySurfaceProps) {
  return (
    <div
      data-slot="kv-busy-surface"
      className={cn(
        'w-full bg-kv-surface',
        tableViewport ? KV_TABLE_VIEWPORT_HEIGHT : 'min-h-40 bg-kv-canvas',
        className
      )}
      aria-busy="true"
    />
  );
}

export type KvTableBusyProps = {
  colSpan: number;
  className?: string;
};

/** First-load busy row — keeps header; plain surface in body. */
export function KvTableBusy({ colSpan, className }: KvTableBusyProps) {
  return (
    <KvTableEmpty colSpan={colSpan} className={className}>
      <KvBusySurface className="min-h-full flex-1 bg-kv-surface" />
    </KvTableEmpty>
  );
}

/* —— scroll viewport + infinite load —— */

export type KvTableViewportProps = {
  children: React.ReactNode;
  className?: string;
  heightClassName?: string;
  resetKey?: string | number;
  onEndReached?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isBusy?: boolean;
  endMessage?: string;
  showEndMessage?: boolean;
  loadingMoreLabel?: string;
};

/**
 * هاست اسکرول با ارتفاع ثابت.
 * اسکرولر بیرونی `ltr` (اسکرولبار راست فیزیکی)؛ محتوا `rtl`.
 */
export function KvTableViewport({
  children,
  className,
  heightClassName = KV_TABLE_VIEWPORT_HEIGHT,
  resetKey,
  onEndReached,
  hasMore = false,
  isLoadingMore = false,
  isBusy = false,
  endMessage = 'همه موارد بارگذاری شد',
  showEndMessage = false,
  loadingMoreLabel = 'در حال بارگذاری ۱۰ مورد بعدی…',
}: KvTableViewportProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (resetKey === undefined) return;
    const root = rootRef.current;
    if (root) root.scrollTop = 0;
  }, [resetKey]);

  React.useEffect(() => {
    if (!onEndReached || !hasMore || isLoadingMore || isBusy) return;
    const root = rootRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onEndReached();
        }
      },
      { root, rootMargin: '96px', threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onEndReached, hasMore, isLoadingMore, isBusy, resetKey]);

  return (
    <div
      ref={rootRef}
      data-slot="kv-table-viewport"
      dir="ltr"
      className={cn(
        'max-w-full overflow-auto overscroll-contain',
        heightClassName,
        className
      )}
      aria-busy={isBusy || isLoadingMore || undefined}
    >
      <div dir="rtl" className="min-h-full">
        {children}

        <div
          ref={sentinelRef}
          data-slot="kv-table-end-sentinel"
          className="h-px w-full shrink-0"
          aria-hidden="true"
        />

        {isLoadingMore ? (
          <div
            className="sticky bottom-0 z-10 flex items-center justify-center gap-kv-pair border-t border-kv-border bg-kv-surface/95 px-kv-group py-kv-stack backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <Spinner className="size-5 text-kv-brand" />
            <KvTypography variant="caption" tone="muted" weight="bold">
              {loadingMoreLabel}
            </KvTypography>
          </div>
        ) : null}

        {!hasMore && showEndMessage && !isBusy && !isLoadingMore ? (
          <div className="py-kv-group text-center">
            <KvTypography variant="caption" tone="muted" weight="bold">
              {endMessage}
            </KvTypography>
          </div>
        ) : null}
      </div>
    </div>
  );
}
