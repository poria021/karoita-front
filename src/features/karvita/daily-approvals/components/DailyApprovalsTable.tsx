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
import {
  KvTableRowIndexCell,
  KvTableRowIndexHead,
} from '@/components/shared/table/KvTableRowIndex';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import {
  IS_REAL_MODE_STUB_ACTIVE,
  RealModeStubTooltip,
} from '@/components/shared/RealModeStubNotice';
import type { DailyApprovalTrainee } from '@/types/daily-approvals';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

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
  const colSpan = (canDrop ? 4 : 3) + 1;

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
              <KvTableRowIndexHead />
              <KvTableHead>مشخصات کارورز</KvTableHead>
              <KvTableHead>درس</KvTableHead>
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
                  title={
                    hasActiveFilters
                      ? 'کارورزی مطابق فیلترها پیدا نشد'
                      : 'موردی یافت نشد'
                  }
                  description={
                    hasActiveFilters
                      ? 'عبارت جستجو یا فیلترهای پایش را تغییر دهید.'
                      : undefined
                  }
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
              trainees.map((trainee, index) => (
                <KvTableRow
                  key={trainee.id}
                  interactive
                  selected={selectedId === trainee.id}
                  onClick={() => onSelect(trainee)}
                >
                  <KvTableRowIndexCell index={index} />
                  <KvTableCell emphasis>{trainee.traineeName}</KvTableCell>
                  <KvTableCell>
                    {toPersianDigits(trainee.courseTitle)}
                  </KvTableCell>
                  <KvTableCell align="center">
                    <DailyApprovalUnreadBadge trainee={trainee} />
                  </KvTableCell>
                  {canDrop ? (
                    <KvTableCell
                      align="center"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <RealModeStubTooltip message="حذف کارورز هنوز به API واقعی وصل نشده است.">
                        <KvButton
                          type="button"
                          color="error"
                          appearance="ghost"
                          size="icon-xs"
                          aria-label="حذف کارورز از کلاس"
                          disabled={
                            actionBusy ||
                            trainee.status === 'dropped' ||
                            IS_REAL_MODE_STUB_ACTIVE
                          }
                          onClick={() => onDrop(trainee)}
                          icon={<FaIcon icon={faIcons.userMinus} size="2xs" />}
                        />
                      </RealModeStubTooltip>
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
