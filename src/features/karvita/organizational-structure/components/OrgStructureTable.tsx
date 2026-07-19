'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import type { OrgStructureListItem } from '@/services/org-structure.service';
import { faIcons } from '@/utils/iconMap';

import type { OrgStructureTabConfig } from '../constants';

interface OrgStructureTableProps {
  tabConfig: OrgStructureTabConfig;
  items: OrgStructureListItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreError: string | null;
  onLoadMore: () => void;
  onRetryLoadMore: () => void;
  onEdit: (row: OrgStructureListItem) => void;
  onDelete: (row: OrgStructureListItem) => void;
}

/** Admin table — fixed viewport + infinite scroll (page size 10 via Facade). */
export function OrgStructureTable({
  tabConfig,
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMoreError,
  onLoadMore,
  onRetryLoadMore,
  onEdit,
  onDelete,
}: OrgStructureTableProps) {
  const isEmpty = !isLoading && items.length === 0;

  if (isLoading) {
    return <KvBusySurface tableViewport />;
  }

  return (
    <div className="space-y-kv-group">
      {loadMoreError ? (
        <KvAlert
          variant="error"
          title="بارگذاری ادامه فهرست ناموفق بود"
          description={loadMoreError}
          actions={
            <KvButton
              type="button"
              appearance="secondary"
              size="sm"
              onClick={onRetryLoadMore}
            >
              تلاش مجدد
            </KvButton>
          }
        />
      ) : null}

      <KvTableViewport
        hasMore={!isEmpty && hasMore}
        isLoadingMore={isLoadingMore}
        onEndReached={onLoadMore}
        loadingMoreLabel="در حال بارگذاری ۱۰ سطر بعدی…"
      >
        <KvTable scrollable={false}>
          <KvTableHeader>
            <KvTableRow>
              <KvTableHead>{tabConfig.nameColumnLabel}</KvTableHead>
              <KvTableHead align="center">عملیات</KvTableHead>
            </KvTableRow>
          </KvTableHeader>
          <KvTableBody>
            {isEmpty ? (
              <KvTableEmpty colSpan={2}>
                <KvEmptyState
                  icon={<FaIcon icon={tabConfig.icon} size="lg" />}
                  title="موردی یافت نشد"
                  description="با جستجوی دیگر امتحان کنید یا مورد جدیدی اضافه کنید."
                />
              </KvTableEmpty>
            ) : (
              items.map((row) => (
                <KvTableRow key={row.id}>
                  <KvTableCell emphasis>{row.name}</KvTableCell>
                  <KvTableCell align="center">
                    <div className="flex items-center justify-center gap-1.5">
                      <KvButton
                        type="button"
                        appearance="secondary"
                        size="icon-sm"
                        aria-label="ویرایش"
                        onClick={() => onEdit(row)}
                        icon={<FaIcon icon={faIcons.penToSquare} size="xs" />}
                      />
                      <KvButton
                        type="button"
                        color="error"
                        appearance="ghost"
                        size="icon-sm"
                        aria-label="حذف"
                        disabled={row.deleteBlocked}
                        onClick={() => onDelete(row)}
                        icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
                      />
                    </div>
                  </KvTableCell>
                </KvTableRow>
              ))
            )}
          </KvTableBody>
        </KvTable>
      </KvTableViewport>
    </div>
  );
}
