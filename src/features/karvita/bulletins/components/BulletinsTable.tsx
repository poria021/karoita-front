'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Bulletin, BulletinKind } from '@/types/bulletins';
import { formatNotificationTime } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

type BulletinsTableProps = {
  rows: Bulletin[];
  /** ستون «عکس» فقط برای تبلیغات نمایش داده می‌شود. */
  kind: BulletinKind;
  isLoading: boolean;
  /** عنوان حالت خالی؛ جدول (با سرستون) همیشه نمایش داده می‌شود. */
  emptyTitle: string;
  /** نشان استان فقط برای پنل‌هایی که مخاطب را روی استان محدود می‌کنند. */
  showProvinces: boolean;
  onEdit: (row: Bulletin) => void;
  onToggleActive: (row: Bulletin) => void;
  onDelete: (row: Bulletin) => void;
};

/** فهرست انتشارهای پنل جاری به‌صورت سطر به سطر. */
export function BulletinsTable({
  rows,
  kind,
  isLoading,
  emptyTitle,
  showProvinces,
  onEdit,
  onToggleActive,
  onDelete,
}: BulletinsTableProps) {
  const isAd = kind === 'advertisement';
  const colCount = isAd ? 6 : 5;
  const bodyPhase = getAdminTableBodyPhase(isLoading, rows.length);

  return (
    <KvTableViewport resetKey={kind} hasMore={false} isBusy={isLoading}>
      <KvTable scrollable={false}>
        <KvTableHeader>
          <KvTableRow>
            <KvTableRowIndexHead />
            {isAd ? <KvTableHead align="center">عکس</KvTableHead> : null}
            <KvTableHead>نام</KvTableHead>
            <KvTableHead align="center">مخاطب</KvTableHead>
            <KvTableHead align="center">تاریخ</KvTableHead>
            <KvTableHead align="center">عملیات</KvTableHead>
          </KvTableRow>
        </KvTableHeader>
        <KvTableBody>
          {bodyPhase === 'busy' ? (
            <KvTableBusy colSpan={colCount} />
          ) : bodyPhase === 'empty' ? (
            <KvTableEmpty colSpan={colCount}>
              <KvEmptyState title={emptyTitle} />
            </KvTableEmpty>
          ) : (
            rows.map((row, index) => {
              const roleLabels = row.audienceRoles
                .map((role) => getRoleStrategy(role).label)
                .join('، ');
              const dimmed = !row.isActive;
              const allProvinces = row.provinces.length === 0;
              return (
                <KvTableRow key={row.id}>
                  <KvTableRowIndexCell index={index} />
                  {isAd ? (
                    <KvTableCell align="center">
                      <div
                        className={cn(
                          'mx-auto size-10 shrink-0',
                          dimmed && 'opacity-60'
                        )}
                      >
                        {row.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- data URL در mock؛ next/image اعمال نمی‌شود
                          <img
                            src={row.imageUrl}
                            alt=""
                            loading="lazy"
                            className="size-10 rounded-kv-control border border-kv-border bg-kv-surface-muted object-cover"
                          />
                        ) : (
                          <span
                            aria-label="بدون تصویر"
                            className="flex size-10 items-center justify-center rounded-kv-control border border-dashed border-kv-border text-kv-empty-icon"
                          >
                            <FaIcon icon={faIcons.image} size="xs" />
                          </span>
                        )}
                      </div>
                    </KvTableCell>
                  ) : null}
                  <KvTableCell emphasis>
                    <div
                      className={cn(
                        'flex min-w-0 flex-col items-start gap-1',
                        dimmed && 'opacity-60'
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-kv-pair">
                        <span className="line-clamp-1">{row.title}</span>
                        {dimmed ? <Badge variant="default">غیرفعال</Badge> : null}
                      </div>
                      {row.body ? (
                        <KvTypography
                          variant="caption"
                          tone="muted"
                          as="span"
                          className="line-clamp-1 max-w-[16rem] font-normal"
                        >
                          {row.body}
                        </KvTypography>
                      ) : null}
                    </div>
                  </KvTableCell>
                  <KvTableCell align="center">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      <span title={roleLabels}>
                        <Badge variant="brand">
                          {toPersianDigits(String(row.audienceRoles.length))} نقش
                        </Badge>
                      </span>
                      {showProvinces ? (
                        <span
                          title={allProvinces ? undefined : row.provinces.join('، ')}
                        >
                          <Badge variant="info">
                            {allProvinces
                              ? 'همه استان‌ها'
                              : `${toPersianDigits(String(row.provinces.length))} استان`}
                          </Badge>
                        </span>
                      ) : null}
                    </div>
                  </KvTableCell>
                  <KvTableCell align="center">
                    {formatNotificationTime(row.createdAt)}
                  </KvTableCell>
                  <KvTableCell align="center">
                    <div className="flex items-center justify-center gap-1.5">
                      <KvButton
                        type="button"
                        color="neutral"
                        appearance="ghost"
                        size="icon-xs"
                        aria-label={`ویرایش ${row.title}`}
                        title="ویرایش"
                        onClick={() => onEdit(row)}
                        icon={<FaIcon icon={faIcons.penToSquare} size="xs" />}
                      />
                      <KvButton
                        type="button"
                        color="neutral"
                        appearance="ghost"
                        size="xs"
                        aria-label={
                          row.isActive
                            ? `غیرفعال‌سازی ${row.title}`
                            : `فعال‌سازی ${row.title}`
                        }
                        onClick={() => onToggleActive(row)}
                      >
                        {row.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                      </KvButton>
                      <KvButton
                        type="button"
                        color="error"
                        appearance="ghost"
                        size="icon-xs"
                        aria-label={`حذف ${row.title}`}
                        title="حذف"
                        onClick={() => onDelete(row)}
                        icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
                      />
                    </div>
                  </KvTableCell>
                </KvTableRow>
              );
            })
          )}
        </KvTableBody>
      </KvTable>
    </KvTableViewport>
  );
}
