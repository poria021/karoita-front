'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
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
import { Badge } from '@/components/ui/badge';
import type { Bulletin } from '@/types/bulletins';
import { formatNotificationTime } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

type BulletinsTableProps = {
  rows: Bulletin[];
  onEdit: (row: Bulletin) => void;
  onDelete: (row: Bulletin) => void;
};

const COL_COUNT = 5;

/** فهرست انتشارهای پنل جاری به‌صورت سطر به سطر. */
export function BulletinsTable({ rows, onEdit, onDelete }: BulletinsTableProps) {
  return (
    <KvTableViewport>
      <KvTable>
        <KvTableHeader>
          <KvTableRow>
            <KvTableRowIndexHead />
            <KvTableHead>عنوان</KvTableHead>
            <KvTableHead align="center">مخاطبان</KvTableHead>
            <KvTableHead align="center">تاریخ انتشار</KvTableHead>
            <KvTableHead align="center">عملیات</KvTableHead>
          </KvTableRow>
        </KvTableHeader>
        <KvTableBody>
          {rows.length === 0 ? (
            <KvTableRow>
              <KvTableCell colSpan={COL_COUNT}>
                <KvEmptyState title="موردی یافت نشد" />
              </KvTableCell>
            </KvTableRow>
          ) : (
            rows.map((row, index) => (
              <KvTableRow key={row.id}>
                <KvTableRowIndexCell index={index} />
                <KvTableCell emphasis>
                  <div className="flex min-w-0 items-center gap-kv-pair">
                    {row.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- data URL در mock؛ next/image اعمال نمی‌شود
                      <img
                        src={row.imageUrl}
                        alt=""
                        loading="lazy"
                        className="size-10 shrink-0 rounded-kv-control border border-kv-border bg-kv-surface-muted object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <span className="line-clamp-1">{row.title}</span>
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
                  </div>
                </KvTableCell>
                <KvTableCell align="center">
                  <span
                    title={row.audienceRoles
                      .map((role) => getRoleStrategy(role).label)
                      .join('، ')}
                  >
                    <Badge variant="brand">
                      {toPersianDigits(String(row.audienceRoles.length))} نقش
                    </Badge>
                  </span>
                </KvTableCell>
                <KvTableCell align="center">
                  {formatNotificationTime(row.createdAt)}
                </KvTableCell>
                <KvTableCell align="center">
                  <div className="flex items-center justify-center gap-1">
                    <KvButton
                      type="button"
                      appearance="text"
                      color="neutral"
                      size="sm"
                      aria-label={`ویرایش «${row.title}»`}
                      icon={<FaIcon icon={faIcons.penToSquare} size="xs" />}
                      onClick={() => onEdit(row)}
                    />
                    <KvButton
                      type="button"
                      appearance="text"
                      color="error"
                      size="sm"
                      aria-label={`حذف «${row.title}»`}
                      icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
                      onClick={() => onDelete(row)}
                    />
                  </div>
                </KvTableCell>
              </KvTableRow>
            ))
          )}
        </KvTableBody>
      </KvTable>
    </KvTableViewport>
  );
}
