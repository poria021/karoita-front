'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/KvTable';
import { KvTableViewport } from '@/components/shared/KvTableViewport';
import type { OrgStructureListItem } from '@/services/org-structure.service';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import type { OrgStructureTabConfig } from '../constants';

interface OrgStructureTableProps {
  tabConfig: OrgStructureTabConfig;
  items: OrgStructureListItem[];
  total: number;
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
  total,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMoreError,
  onLoadMore,
  onRetryLoadMore,
  onEdit,
  onDelete,
}: OrgStructureTableProps) {
  if (isLoading) {
    return (
      <div
        className="h-[min(28rem,55dvh)] w-full bg-kv-surface"
        aria-busy="true"
      />
    );
  }

  if (items.length === 0) {
    return (
      <KvEmptyState
        icon={<FaIcon icon={tabConfig.icon} size="lg" />}
        title="موردی یافت نشد"
        description="با جستجوی دیگر امتحان کنید یا مورد جدیدی اضافه کنید."
      />
    );
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
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onEndReached={onLoadMore}
        showEndMessage={items.length > 0 && !hasMore}
        endMessage={`همه موارد بارگذاری شد (${toPersianDigits(total)})`}
        loadingMoreLabel="در حال بارگذاری ۱۰ سطر بعدی…"
      >
        <KvTable scrollable={false}>
          <KvTableHeader>
            <KvTableRow>
              <KvTableHead>{tabConfig.nameColumnLabel}</KvTableHead>
              <KvTableHead className="text-center">عملیات</KvTableHead>
            </KvTableRow>
          </KvTableHeader>
          <KvTableBody>
            {items.map((row) => (
              <KvTableRow key={row.id}>
                <KvTableCell className="text-right font-extrabold text-kv-text">
                  {row.name}
                </KvTableCell>
                <KvTableCell>
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
            ))}
          </KvTableBody>
        </KvTable>
      </KvTableViewport>
    </div>
  );
}
