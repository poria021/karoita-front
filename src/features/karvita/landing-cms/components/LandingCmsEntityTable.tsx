'use client';

import type { ReactNode } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { getAdminTableBodyPhase } from '@/components/shared/table/adminTableBodyPhase';
import { KvTableBusy } from '@/components/shared/table/KvTableBusy';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import { faIcons } from '@/utils/iconMap';

export type LandingCmsTableColumn = {
  key: string;
  label: string;
  align?: 'start' | 'center' | 'end';
  className?: string;
};

type LandingCmsEntityTableProps<T extends { id: string }> = {
  resetKey: string;
  columns: readonly LandingCmsTableColumn[];
  items: T[];
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription: string;
  renderCells: (item: T, index: number) => ReactNode;
  onDelete: (item: T) => void;
  deleteAriaLabel: (item: T) => string;
};

export function LandingCmsEntityTable<T extends { id: string }>({
  resetKey,
  columns,
  items,
  isLoading,
  emptyTitle,
  emptyDescription,
  renderCells,
  onDelete,
  deleteAriaLabel,
}: LandingCmsEntityTableProps<T>) {
  const bodyPhase = getAdminTableBodyPhase(isLoading, items.length);
  const colSpan = columns.length + 1;

  return (
    <KvTableViewport
      resetKey={resetKey}
      hasMore={false}
      isLoadingMore={false}
      isBusy={isLoading && items.length === 0}
    >
      <KvTable scrollable={false}>
        <KvTableHeader>
          <KvTableRow>
            {columns.map((column) => (
              <KvTableHead
                key={column.key}
                align={column.align}
                className={column.className}
              >
                {column.label}
              </KvTableHead>
            ))}
            <KvTableHead align="center" className="w-16">
              عملیات
            </KvTableHead>
          </KvTableRow>
        </KvTableHeader>
        <KvTableBody>
          {bodyPhase === 'busy' ? <KvTableBusy colSpan={colSpan} /> : null}
          {bodyPhase === 'empty' ? (
            <KvTableEmpty colSpan={colSpan}>
              <KvEmptyState
                title={emptyTitle}
                description={emptyDescription}
              />
            </KvTableEmpty>
          ) : null}
          {bodyPhase === 'rows'
            ? items.map((item, index) => (
                <KvTableRow key={item.id}>
                  {renderCells(item, index)}
                  <KvTableCell align="center">
                    <KvButton
                      type="button"
                      color="error"
                      appearance="ghost"
                      size="icon-xs"
                      aria-label={deleteAriaLabel(item)}
                      onClick={() => onDelete(item)}
                      icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
                    />
                  </KvTableCell>
                </KvTableRow>
              ))
            : null}
        </KvTableBody>
      </KvTable>
    </KvTableViewport>
  );
}
