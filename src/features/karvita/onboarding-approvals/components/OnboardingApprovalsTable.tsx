'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
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
} from '@/components/shared/table/KvTable';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import type {
  ApprovalFilterTab,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

interface OnboardingApprovalsTableProps {
  users: OnboardingApprovalUser[];
  selectedId: string | null;
  tab: ApprovalFilterTab;
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
  const columnCount = showActions ? 4 : 3;
  const isEmpty = !isLoading && users.length === 0;

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
        resetKey={tab}
        hasMore={!isEmpty && hasMore}
        isLoadingMore={isLoadingMore}
        onEndReached={onLoadMore}
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
            {isEmpty ? (
              <KvTableEmpty colSpan={columnCount}>
                <KvEmptyState
                  icon={<FaIcon icon={faIcons.idCard} size="lg" />}
                  title="پرونده‌ای یافت نشد"
                  description="با تغییر تب، جستجو یا فیلترها دوباره امتحان کنید."
                />
              </KvTableEmpty>
            ) : (
              users.map((user) => {
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
                      {getRoleStrategy(user.role).label}
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
              })
            )}
          </KvTableBody>
        </KvTable>
      </KvTableViewport>
    </div>
  );
}
