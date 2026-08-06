'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { getAdminTableBodyPhase } from '@/components/shared/table/adminTableBodyPhase';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { KvTableBusy } from '@/components/shared/table/KvTableBusy';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import type { DailyApprovalTrainee } from '@/types/daily-approvals';
import { faIcons } from '@/utils/iconMap';

import { DailyApprovalUnreadBadge } from './DailyApprovalUnreadBadge';

type DailyApprovalsTableProps = {
  trainees: DailyApprovalTrainee[];
  selectedId: string | null;
  resetKey: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreError: string | null;
  actionBusy: boolean;
  canDrop: boolean;
  hasActiveFilters: boolean;
  onSelect: (trainee: DailyApprovalTrainee) => void;
  onDrop: (trainee: DailyApprovalTrainee) => void;
  onLoadMore: () => void;
  onRetryLoadMore: () => void;
  onClearFilters: () => void;
};

export function DailyApprovalsTable({
  trainees,
  selectedId,
  resetKey,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMoreError,
  actionBusy,
  canDrop,
  hasActiveFilters,
  onSelect,
  onDrop,
  onLoadMore,
  onRetryLoadMore,
  onClearFilters,
}: DailyApprovalsTableProps) {
  const bodyPhase = getAdminTableBodyPhase(isLoading, trainees.length);
  const colSpan = canDrop ? 3 : 2;

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
        resetKey={resetKey}
        hasMore={bodyPhase === 'rows' && hasMore}
        isLoadingMore={isLoadingMore}
        isBusy={isLoading}
        onEndReached={onLoadMore}
        loadingMoreLabel="در حال فراخوانی سطرهای جدید از پایگاه داده..."
      >
        <KvTable scrollable={false}>
          <KvTableHeader>
            <KvTableRow>
              <KvTableHead>مشخصات کارورز</KvTableHead>
              <KvTableHead align="center">خوانده نشده</KvTableHead>
              {canDrop ? (
                <KvTableHead align="center">عملیات</KvTableHead>
              ) : null}
            </KvTableRow>
          </KvTableHeader>
          <KvTableBody>
            {bodyPhase === 'busy' ? (
              <KvTableBusy colSpan={colSpan} />
            ) : bodyPhase === 'empty' ? (
              <KvTableEmpty colSpan={colSpan}>
                <KvEmptyState
                  title="کارورزی مطابق فیلترها پیدا نشد"
                  description="عبارت جستجو یا فیلترهای پایش را تغییر دهید."
                  actions={
                    hasActiveFilters ? (
                      <KvButton
                        type="button"
                        color="cta"
                        appearance="solid"
                        size="sm"
                        onClick={onClearFilters}
                      >
                        پاک کردن فیلترها
                      </KvButton>
                    ) : undefined
                  }
                />
              </KvTableEmpty>
            ) : (
              trainees.map((trainee) => (
                <KvTableRow
                  key={trainee.id}
                  interactive
                  selected={selectedId === trainee.id}
                  onClick={() => onSelect(trainee)}
                >
                  <KvTableCell emphasis>{trainee.traineeName}</KvTableCell>
                  <KvTableCell align="center">
                    <DailyApprovalUnreadBadge trainee={trainee} />
                  </KvTableCell>
                  {canDrop ? (
                    <KvTableCell
                      align="center"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <KvButton
                        type="button"
                        color="error"
                        appearance="ghost"
                        size="icon-xs"
                        aria-label="حذف کارورز از کلاس"
                        disabled={actionBusy || trainee.status === 'dropped'}
                        onClick={() => onDrop(trainee)}
                        icon={<FaIcon icon={faIcons.userMinus} size="2xs" />}
                      />
                    </KvTableCell>
                  ) : null}
                </KvTableRow>
              ))
            )}
          </KvTableBody>
        </KvTable>
      </KvTableViewport>
    </div>
  );
}
