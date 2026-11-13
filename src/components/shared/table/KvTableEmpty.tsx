'use client';

import type { ReactNode } from 'react';

import {
  KvTableCell,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { KV_TABLE_EMPTY_FILL_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';

export type KvTableEmptyProps = {
  colSpan: number;
  children: ReactNode;
  className?: string;
  /** ارتفاع پرکنندهٔ busy/empty؛ پیش‌فرض ویوپورت جداول ادمین. */
  fillClassName?: string;
};

/**
 * ردیف خالی/busy جدول.
 * تایپ و رنگ سلول را ریست می‌کند تا `KvEmptyState` / `KvBusySurface`
 * همان استایل بیرون از جدول را داشته باشند (نه text-xs/semibold سلول).
 */
export function KvTableEmpty({
  colSpan,
  children,
  className,
  fillClassName,
}: KvTableEmptyProps) {
  return (
    <KvTableRow className="font-normal can-hover:in-[data-slot=kv-table-body]:hover:bg-transparent">
      <KvTableCell
        colSpan={colSpan}
        align="center"
        className={cn(
          'h-auto min-h-0 border-b-0 bg-transparent p-0 font-normal text-kv-text',
          className
        )}
      >
        <div
          data-slot="kv-table-empty-surface"
          className={cn(
            'flex w-full flex-col items-center justify-center text-base font-normal text-kv-text',
            fillClassName ?? KV_TABLE_EMPTY_FILL_HEIGHT
          )}
        >
          {children}
        </div>
      </KvTableCell>
    </KvTableRow>
  );
}
