'use client';

import { FaIcon } from '@/components/shared/FaIcon';
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
  isLoading: boolean;
  actionBusy: boolean;
  onSelect: (user: OnboardingApprovalUser) => void;
  onApprove: (user: OnboardingApprovalUser) => void;
  onStartReject: (user: OnboardingApprovalUser) => void;
}

export function OnboardingApprovalsTable({
  users,
  selectedId,
  tab,
  isLoading,
  actionBusy,
  onSelect,
  onApprove,
  onStartReject,
}: OnboardingApprovalsTableProps) {
  const showActions = tab === 'pending_admin';

  if (isLoading) {
    return (
      <div
        className="flex h-[min(28rem,55dvh)] w-full items-center justify-center bg-kv-surface"
        aria-busy="true"
      >
        <FaIcon
          icon={faIcons.spinner}
          size="md"
          spin
          className="text-kv-brand"
        />
      </div>
    );
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
    <div className="max-h-[min(32rem,60dvh)] overflow-auto">
      <KvTable scrollable={false}>
        <KvTableHeader>
          <KvTableRow>
            <KvTableHead>مشخصات</KvTableHead>
            <KvTableHead className="text-center">شماره تماس</KvTableHead>
            <KvTableHead className="text-center">استان</KvTableHead>
            <KvTableHead className="text-center">نقش</KvTableHead>
            {showActions ? (
              <KvTableHead className="text-center">عملیات</KvTableHead>
            ) : null}
          </KvTableRow>
        </KvTableHeader>
        <KvTableBody>
          {users.map((user) => {
            const selected = selectedId === user.id;
            return (
              <KvTableRow
                key={user.id}
                className={`cursor-pointer ${
                  selected
                    ? 'border-s-4 border-s-kv-brand bg-kv-brand-soft font-extrabold text-kv-brand'
                    : 'hover:bg-kv-surface-muted/80'
                }`}
                onClick={() => onSelect(user)}
              >
                <KvTableCell className="text-right text-xs font-extrabold text-kv-text">
                  {user.fullName}
                </KvTableCell>
                <KvTableCell className="text-center font-mono text-xs font-bold text-kv-text-secondary">
                  {user.mobile
                    ? toPersianDigits(`0${user.mobile}`)
                    : '---'}
                </KvTableCell>
                <KvTableCell className="text-center text-xs font-bold text-kv-text-secondary">
                  {user.province || '---'}
                </KvTableCell>
                <KvTableCell className="text-center">
                  <span className="inline-flex items-center rounded-full bg-kv-surface-muted px-2.5 py-0.5 text-xs font-black text-kv-text-secondary">
                    {getRoleStrategy(user.role).label}
                  </span>
                </KvTableCell>
                {showActions ? (
                  <KvTableCell
                    className="text-center"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1.5">
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
                    </div>
                  </KvTableCell>
                ) : null}
              </KvTableRow>
            );
          })}
        </KvTableBody>
      </KvTable>
    </div>
  );
}
