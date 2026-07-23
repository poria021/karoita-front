'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
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
import type { OrgStructureListItem } from '@/services/org-structure.service';
import { getModuleEmptyCopy } from '@/utils/moduleDiscoverability';
import { faIcons } from '@/utils/iconMap';

import type { OrgStructureTabConfig } from '../constants';

interface OrgStructureTableProps {
  tabConfig: OrgStructureTabConfig;
  items: OrgStructureListItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreError: string | null;
  query: string;
  onLoadMore: () => void;
  onRetryLoadMore: () => void;
  onClearQuery: () => void;
  onAdd: () => void;
  onEdit: (row: OrgStructureListItem) => void;
  onDelete: (row: OrgStructureListItem) => void;
}

export function OrgStructureTable({
  tabConfig,
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMoreError,
  query,
  onLoadMore,
  onRetryLoadMore,
  onClearQuery,
  onAdd,
  onEdit,
  onDelete,
}: OrgStructureTableProps) {
  const bodyPhase = getAdminTableBodyPhase(isLoading, items.length);
  const emptyCopy = getModuleEmptyCopy('org_structure');
  const hasQuery = query.trim().length > 0;

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
        resetKey={tabConfig.key}
        hasMore={bodyPhase === 'rows' && hasMore}
        isLoadingMore={isLoadingMore}
        isBusy={isLoading}
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
            {bodyPhase === 'busy' ? (
              <KvTableBusy colSpan={2} />
            ) : bodyPhase === 'empty' ? (
              <KvTableEmpty colSpan={2}>
                <KvEmptyState
                  icon={<FaIcon icon={tabConfig.icon} size="lg" />}
                  title={emptyCopy.title}
                  description={
                    hasQuery
                      ? 'جستجوی فعلی نتیجه‌ای نداشت. عبارت را پاک کنید یا مورد جدیدی اضافه کنید.'
                      : emptyCopy.description
                  }
                  actions={
                    <KvButton
                      type="button"
                      color="cta"
                      appearance="solid"
                      size="sm"
                      onClick={hasQuery ? onClearQuery : onAdd}
                    >
                      {hasQuery ? 'پاک کردن جستجو' : emptyCopy.actionLabel}
                    </KvButton>
                  }
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
                        color="neutral"
                        appearance="ghost"
                        size="icon-xs"
                        aria-label="ویرایش"
                        onClick={() => onEdit(row)}
                        icon={<FaIcon icon={faIcons.penToSquare} size="xs" />}
                      />
                      <KvButton
                        type="button"
                        color="error"
                        appearance="ghost"
                        size="icon-xs"
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
