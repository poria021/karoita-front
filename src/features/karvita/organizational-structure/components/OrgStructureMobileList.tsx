'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import type { OrgStructureListItem } from '@/services/org-structure.service';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import type { OrgStructureTabConfig } from '../constants';

interface OrgStructureMobileListProps {
  tabConfig: OrgStructureTabConfig;
  items: OrgStructureListItem[];
  isLoading: boolean;
  canLoadMore: boolean;
  onLoadMore: () => void;
  onEdit: (row: OrgStructureListItem) => void;
  onDelete: (row: OrgStructureListItem) => void;
}

export function OrgStructureMobileList({
  tabConfig,
  items,
  isLoading,
  canLoadMore,
  onLoadMore,
  onEdit,
  onDelete,
}: OrgStructureMobileListProps) {
  if (isLoading) {
    return (
      <div className="min-h-32 lg:hidden" aria-busy="true" />
    );
  }

  if (items.length === 0) {
    return (
      <div className="lg:hidden">
        <KvEmptyState
          icon={<FaIcon icon={tabConfig.icon} size="lg" />}
          title="موردی یافت نشد"
          description="با جستجوی دیگر امتحان کنید یا مورد جدیدی اضافه کنید."
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 lg:hidden">
      {items.map((row) => (
        <div
          key={row.id}
          className="flex flex-col rounded-kv-panel border border-kv-border bg-kv-surface p-4 shadow-kv-raised"
        >
          <span className="text-xs font-black text-kv-text">{row.name}</span>
          <div className="mt-3 flex gap-2 border-t border-kv-border pt-3">
            <KvButton
              type="button"
              appearance="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(row)}
              icon={<FaIcon icon={faIcons.penToSquare} size="xs" />}
            >
              ویرایش
            </KvButton>
            <KvButton
              type="button"
              color="error"
              appearance="ghost"
              size="sm"
              className="flex-1"
              disabled={row.deleteBlocked}
              onClick={() => onDelete(row)}
              icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
            >
              حذف
            </KvButton>
          </div>
        </div>
      ))}

      {canLoadMore ? (
        <KvButton
          type="button"
          appearance="secondary"
          fullWidth
          onClick={onLoadMore}
        >
          بارگذاری بیشتر ({toPersianDigits(String(items.length))} نمایش‌داده‌شده)
        </KvButton>
      ) : null}
    </div>
  );
}
