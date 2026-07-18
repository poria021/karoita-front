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
import type { OrgStructureListItem } from '@/services/org-structure.service';
import { faIcons } from '@/utils/iconMap';

import type { OrgStructureTabConfig } from '../constants';

interface OrgStructureTableProps {
  tabConfig: OrgStructureTabConfig;
  items: OrgStructureListItem[];
  isLoading: boolean;
  onEdit: (row: OrgStructureListItem) => void;
  onDelete: (row: OrgStructureListItem) => void;
}

/** Desktop table — only name + actions (product override vs full HTML columns). */
export function OrgStructureTable({
  tabConfig,
  items,
  isLoading,
  onEdit,
  onDelete,
}: OrgStructureTableProps) {
  if (isLoading) {
    return (
      <div
        className="hidden min-h-40 items-center justify-center lg:flex"
        aria-busy="true"
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="hidden lg:block">
        <KvEmptyState
          icon={<FaIcon icon={tabConfig.icon} size="lg" />}
          title="موردی یافت نشد"
          description="با جستجوی دیگر امتحان کنید یا مورد جدیدی اضافه کنید."
        />
      </div>
    );
  }

  return (
    <div className="hidden lg:block">
      <KvTable>
        <KvTableHeader>
          <tr>
            <KvTableHead>{tabConfig.nameColumnLabel}</KvTableHead>
            <KvTableHead className="text-center">عملیات</KvTableHead>
          </tr>
        </KvTableHeader>
        <KvTableBody>
          {items.map((row) => (
            <KvTableRow key={row.id}>
              <KvTableCell className="text-right font-extrabold text-kv-text">
                {row.name}
              </KvTableCell>
              <KvTableCell>
                <div className="flex items-center justify-center gap-1.5">
                  <KvButton
                    type="button"
                    appearance="secondary"
                    size="sm"
                    className="size-7 min-w-0 px-0"
                    aria-label="ویرایش"
                    onClick={() => onEdit(row)}
                    icon={<FaIcon icon={faIcons.penToSquare} size="xs" />}
                  />
                  <KvButton
                    type="button"
                    color="error"
                    appearance="ghost"
                    size="sm"
                    className="size-7 min-w-0 px-0"
                    aria-label="حذف"
                    disabled={row.deleteBlocked}
                    onClick={() => onDelete(row)}
                    icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
                  />
                </div>
              </KvTableCell>
            </KvTableRow>
          ))}
        </KvTableBody>
      </KvTable>
    </div>
  );
}
