'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
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
import {
  KvTableRowIndexCell,
  KvTableRowIndexHead,
} from '@/components/shared/table/KvTableRowIndex';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import { KvTypography } from '@/components/shared/KvTypography';
import type { StaffAdminAccount } from '@/types/admin-user-creation';
import { formatJalaliSlashDisplay } from '@/utils/formatJalaliDate';
import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

function statusLabel(name: string): string {
  if (name === 'active') return 'فعال';
  if (name === 'inactive' || name === 'disabled') return 'غیرفعال';
  return name || '—';
}

function createdLabel(iso: string): string {
  if (!iso.trim()) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return formatJalaliSlashDisplay(date);
}

interface StaffAdminsTableProps {
  items: StaffAdminAccount[];
  selectedId: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreError: string | null;
  onLoadMore: () => void;
  onRetryLoadMore: () => void;
  onSelect: (id: string) => void;
}

export function StaffAdminsTable({
  items,
  selectedId,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMoreError,
  onLoadMore,
  onRetryLoadMore,
  onSelect,
}: StaffAdminsTableProps) {
  const columnCount = 6;
  const bodyPhase = getAdminTableBodyPhase(isLoading, items.length);

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
      >
        <KvTable>
          <KvTableHeader>
            <KvTableRow>
              <KvTableRowIndexHead />
              <KvTableHead>نام</KvTableHead>
              <KvTableHead align="center">موبایل</KvTableHead>
              <KvTableHead align="center">نقش</KvTableHead>
              <KvTableHead align="center">وضعیت</KvTableHead>
              <KvTableHead align="center">تاریخ ایجاد</KvTableHead>
            </KvTableRow>
          </KvTableHeader>
          <KvTableBody>
            {bodyPhase === 'busy' ? (
              <KvTableBusy colSpan={columnCount} />
            ) : bodyPhase === 'empty' ? (
              <KvTableEmpty colSpan={columnCount}>
                <KvTypography variant="body" tone="muted">
                  حساب ستادی ثبت نشده است
                </KvTypography>
              </KvTableEmpty>
            ) : (
              items.map((admin, index) => {
                const fullName =
                  `${admin.firstName} ${admin.lastName}`.trim() || '—';
                return (
                  <KvTableRow
                    key={admin.id}
                    interactive
                    selected={selectedId === admin.id}
                    onClick={() => onSelect(admin.id)}
                  >
                    <KvTableRowIndexCell index={index} />
                    <KvTableCell emphasis>{fullName}</KvTableCell>
                    <KvTableCell
                      align="center"
                      className="font-mono text-kv-text-muted"
                      dir="ltr"
                    >
                      {admin.mobile
                        ? toPersianDigits(admin.mobile)
                        : '—'}
                    </KvTableCell>
                    <KvTableCell align="center" className="text-kv-text-muted">
                      {getRoleStrategy(admin.role).label}
                    </KvTableCell>
                    <KvTableCell align="center" className="text-kv-text-muted">
                      {statusLabel(admin.statusName)}
                    </KvTableCell>
                    <KvTableCell align="center" className="text-kv-text-muted">
                      {createdLabel(admin.createdAt)}
                    </KvTableCell>
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
