'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvButtonGroup } from '@/components/shared/KvButtonGroup';
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
import type {
  ApprovalFilterTab,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';
import { getModuleEmptyCopy } from '@/utils/moduleDiscoverability';
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
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

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
  hasActiveFilters = false,
  onClearFilters,
}: OnboardingApprovalsTableProps) {
  const showActions = tab === 'pending_admin';
  const columnCount = showActions ? 4 : 3;
  const bodyPhase = getAdminTableBodyPhase(isLoading, users.length);
  const emptyCopy = getModuleEmptyCopy('onboarding_list');

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
        hasMore={bodyPhase === 'rows' && hasMore}
        isLoadingMore={isLoadingMore}
        isBusy={isLoading}
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
            {bodyPhase === 'busy' ? (
              <KvTableBusy colSpan={columnCount} />
            ) : bodyPhase === 'empty' ? (
              <KvTableEmpty colSpan={columnCount}>
                <KvEmptyState
                  icon={<FaIcon icon={faIcons.idCard} size="lg" />}
                  title={emptyCopy.title}
                  description={emptyCopy.description}
                  actions={
                    hasActiveFilters && onClearFilters ? (
                      <KvButton
                        type="button"
                        color="cta"
                        appearance="solid"
                        size="sm"
                        onClick={onClearFilters}
                      >
                        {emptyCopy.actionLabel}
                      </KvButton>
                    ) : (
                      <KvButton
                        type="button"
                        color="neutral"
                        appearance="secondary"
                        size="sm"
                        onClick={onRetryLoadMore}
                      >
                        تلاش مجدد
                      </KvButton>
                    )
                  }
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
                            size="icon-xs"
                            aria-label="رد صلاحیت"
                            disabled={actionBusy}
                            onClick={() => onStartReject(user)}
                            icon={<FaIcon icon={faIcons.xmark} size="xs" />}
                          />
                          <KvButton
                            type="button"
                            color="success"
                            appearance="ghost"
                            size="icon-xs"
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
