'use client';

import { memo } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
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
import {
  KvTableRowIndexCell,
  KvTableRowIndexHead,
} from '@/components/shared/table/KvTableRowIndex';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import { Badge } from '@/components/ui/badge';
import type { OrgStructureListItem } from '@/services/org-structure.service';
import { faIcons } from '@/utils/iconMap';
import { getModuleEmptyCopy } from '@/utils/moduleDiscoverability';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  getMajorAudienceLabel,
  getSchoolGenderLabel,
  type OrgStructureTabConfig,
} from '../constants';
import {
  getOrgStructureColumns,
  type OrgStructureColumnDef,
} from '../lib/orgStructureTableColumns';

interface OrgStructureTableProps {
  tabConfig: OrgStructureTabConfig;
  items: OrgStructureListItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreError: string | null;
  query: string;
  onLoadMore: () => void;
  onRetryLoadMore: () => void;
  onClearQuery: () => void;
  onAdd: () => void;
  onEdit: (row: OrgStructureListItem) => void;
  onDelete: (row: OrgStructureListItem) => void;
}

function displayText(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '—';
}

function formatCount(value: number | undefined, suffix: string): string {
  return `${toPersianDigits(String(value ?? 0))} ${suffix}`;
}

function renderDataCell(
  column: OrgStructureColumnDef,
  row: OrgStructureListItem
) {
  switch (column.key) {
    case 'name':
      return (
        <KvTableCell key={column.key} emphasis>
          {row.name}
        </KvTableCell>
      );
    case 'provinceName':
      return (
        <KvTableCell key={column.key} align={column.align}>
          {displayText(row.provinceName)}
        </KvTableCell>
      );
    case 'cityName':
      return (
        <KvTableCell key={column.key} align={column.align}>
          {displayText(row.cityName)}
        </KvTableCell>
      );
    case 'districtName':
      return (
        <KvTableCell key={column.key} align={column.align}>
          {displayText(row.districtName)}
        </KvTableCell>
      );
    case 'gender':
      return (
        <KvTableCell key={column.key} align={column.align}>
          {row.gender ? (
            <Badge variant="default">
              {getSchoolGenderLabel(row.gender)}
            </Badge>
          ) : (
            '—'
          )}
        </KvTableCell>
      );
    case 'audience':
      return (
        <KvTableCell key={column.key} align={column.align}>
          {row.audience
            ? getMajorAudienceLabel(row.audience)
            : (row.roleName ?? '—')}
        </KvTableCell>
      );
    case 'campusesCount':
      return (
        <KvTableCell key={column.key} align={column.align}>
          {formatCount(row.campusesCount, column.countSuffix ?? 'واحد')}
        </KvTableCell>
      );
    case 'districtsCount':
      return (
        <KvTableCell key={column.key} align={column.align}>
          {formatCount(row.districtsCount, column.countSuffix ?? 'ناحیه')}
        </KvTableCell>
      );
    case 'schoolsCount':
      return (
        <KvTableCell key={column.key} align={column.align}>
          {formatCount(row.schoolsCount, column.countSuffix ?? 'مدرسه')}
        </KvTableCell>
      );
    case 'usersCount':
      return (
        <KvTableCell key={column.key} align={column.align}>
          {formatCount(row.usersCount, column.countSuffix ?? 'نفر')}
        </KvTableCell>
      );
    default:
      return null;
  }
}

interface OrgStructureTableRowProps {
  row: OrgStructureListItem;
  index: number;
  columns: OrgStructureColumnDef[];
  onEdit: (row: OrgStructureListItem) => void;
  onDelete: (row: OrgStructureListItem) => void;
}

const OrgStructureTableRow = memo(function OrgStructureTableRow({
  row,
  index,
  columns,
  onEdit,
  onDelete,
}: OrgStructureTableRowProps) {
  return (
    <KvTableRow>
      <KvTableRowIndexCell index={index} />
      {columns.map((column) => {
        if (column.key === 'actions') {
          return (
            <KvTableCell key={column.key} align="center">
              <div className="flex items-center justify-center gap-1.5">
                <KvButton
                  type="button"
                  color="neutral"
                  appearance="ghost"
                  size="icon-xs"
                  aria-label="ویرایش"
                  onClick={() => onEdit(row)}
                  icon={<FaIcon icon={faIcons.penToSquare} size="xs" />}
                />
                <KvButton
                  type="button"
                  color="error"
                  appearance="ghost"
                  size="icon-xs"
                  aria-label={
                    row.deleteBlocked
                      ? 'حذف غیرفعال است چون واحدهای وابسته وجود دارد'
                      : 'حذف'
                  }
                  title={
                    row.deleteBlocked
                      ? 'حذف به‌خاطر وابستگی رکوردهای مرتبط ممکن نیست'
                      : undefined
                  }
                  disabled={row.deleteBlocked}
                  onClick={() => onDelete(row)}
                  icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
                />
              </div>
            </KvTableCell>
          );
        }
        return renderDataCell(column, row);
      })}
    </KvTableRow>
  );
});

export function OrgStructureTable({
  tabConfig,
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMoreError,
  query,
  onLoadMore,
  onRetryLoadMore,
  onClearQuery,
  onAdd,
  onEdit,
  onDelete,
}: OrgStructureTableProps) {
  const bodyPhase = getAdminTableBodyPhase(isLoading, items.length);
  const columns = getOrgStructureColumns(tabConfig.key);
  const colSpan = columns.length + 1;
  const hasQuery = query.trim().length > 0;
  const emptyCopy = getModuleEmptyCopy('org_structure');

  return (
    <>
      {loadMoreError ? (
        <div className="mb-kv-group">
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
        </div>
      ) : null}

      <KvTableViewport
        resetKey={tabConfig.key}
        hasMore={bodyPhase === 'rows' && hasMore}
        isLoadingMore={isLoadingMore}
        isBusy={isLoading}
        onEndReached={onLoadMore}
        loadingMoreLabel="در حال بارگذاری ۱۰ سطر بعدی…"
      >
        <KvTable scrollable={false}>
          <KvTableHeader>
            <KvTableRow>
              <KvTableRowIndexHead />
              {columns.map((column) => (
                <KvTableHead key={column.key} align={column.align}>
                  {column.label}
                </KvTableHead>
              ))}
            </KvTableRow>
          </KvTableHeader>
          <KvTableBody>
            {bodyPhase === 'busy' ? (
              <KvTableBusy colSpan={colSpan} />
            ) : bodyPhase === 'empty' ? (
              <KvTableEmpty colSpan={colSpan}>
                <KvEmptyState
                  title={emptyCopy.title}
                  description={emptyCopy.description}
                  actions={
                    hasQuery ? (
                      <KvButton
                        type="button"
                        color="cta"
                        appearance="solid"
                        size="sm"
                        onClick={onClearQuery}
                      >
                        پاک کردن جستجو
                      </KvButton>
                    ) : (
                      <KvButton
                        type="button"
                        color="cta"
                        appearance="solid"
                        size="sm"
                        onClick={onAdd}
                        icon={<FaIcon icon={faIcons.plus} size="xs" />}
                        iconPosition="start"
                      >
                        {emptyCopy.actionLabel}
                      </KvButton>
                    )
                  }
                />
              </KvTableEmpty>
            ) : (
              items.map((row, index) => (
                <OrgStructureTableRow
                  key={row.id}
                  row={row}
                  index={index}
                  columns={columns}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </KvTableBody>
        </KvTable>
      </KvTableViewport>
    </>
  );
}
