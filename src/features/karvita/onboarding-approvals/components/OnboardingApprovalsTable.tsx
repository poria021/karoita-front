'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvBadge } from '@/components/shared/KvBadge';
import { KvBusySurface } from '@/components/shared/KvBusySurface';
import { KvButton } from '@/components/shared/KvButton';
import { KvButtonGroup } from '@/components/shared/KvButtonGroup';
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
import type {
  ApprovalFilterTab,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

interface OnboardingApprovalsTableProps {
  users: OnboardingApprovalUser[];
  selectedId: string | null;
  tab: ApprovalFilterTab;
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreError: string | null;
  actionBusy: boolean;
  onLoadMore: () => void;
  onRetryLoadMore: () => void;
  onSelect: (user: OnboardingApprovalUser) => void;
  onApprove: (user: OnboardingApprovalUser) => void;
  onStartReject: (user: OnboardingApprovalUser) => void;
}

/** Admin table — fixed viewport + infinite scroll (page size 10 via Facade). */
export function OnboardingApprovalsTable({
  users,
  selectedId,
  tab,
  total,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMoreError,
  actionBusy,
  onLoadMore,
  onRetryLoadMore,
  onSelect,
  onApprove,
  onStartReject,
}: OnboardingApprovalsTableProps) {
  const showActions = tab === 'pending_admin';

  if (isLoading) {
    return <KvBusySurface tableViewport />;
  }

  if (users.length === 0) {
    return (
      <KvEmptyState
        icon={<FaIcon icon={faIcons.idCard} size="lg" />}
        title="پرونده‌ای یافت نشد"
        description="با تغییر تب، جستجو یا فیلترها دوباره امتحان کنید."
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
        showEndMessage={users.length > 0 && !hasMore}
        endMessage={`همه موارد بارگذاری شد (${toPersianDigits(total)})`}
        loadingMoreLabel="در حال بارگذاری ۱۰ سطر بعدی…"
      >
        <KvTable scrollable={false}>
          <KvTableHeader>
            <KvTableRow>
              <KvTableHead>مشخصات</KvTableHead>
              <KvTableHead align="center">استان</KvTableHead>
              <KvTableHead align="center">نقش</KvTableHead>
              {showActions ? (
                <KvTableHead align="center">عملیات</KvTableHead>
              ) : null}
            </KvTableRow>
          </KvTableHeader>
          <KvTableBody>
            {users.map((user) => {
              const selected = selectedId === user.id;
              return (
                <KvTableRow
                  key={user.id}
                  interactive
                  selected={selected}
                  onClick={() => onSelect(user)}
                >
                  <KvTableCell emphasis>{user.fullName}</KvTableCell>
                  <KvTableCell align="center">
                    {user.province || '---'}
                  </KvTableCell>
                  <KvTableCell align="center">
                    <KvBadge variant="default">
                      {getRoleStrategy(user.role).label}
                    </KvBadge>
                  </KvTableCell>
                  {showActions ? (
                    <KvTableCell
                      align="center"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <KvButtonGroup align="center">
                        <KvButton
                          type="button"
                          color="error"
                          appearance="ghost"
                          size="icon-sm"
                          aria-label="رد صلاحیت"
                          disabled={actionBusy}
                          onClick={() => onStartReject(user)}
                          icon={<FaIcon icon={faIcons.xmark} size="xs" />}
                        />
                        <KvButton
                          type="button"
                          color="success"
                          appearance="ghost"
                          size="icon-sm"
                          aria-label="تایید صلاحیت"
                          disabled={actionBusy}
                          onClick={() => onApprove(user)}
                          icon={<FaIcon icon={faIcons.check} size="xs" />}
                        />
                      </KvButtonGroup>
                    </KvTableCell>
                  ) : null}
                </KvTableRow>
              );
            })}
          </KvTableBody>
        </KvTable>
      </KvTableViewport>
    </div>
  );
}
