'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import { KvFeatureIntro } from '@/components/shared/shell/KvFeatureIntro';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { REPORTS_FEATURE } from '../constants';
import type { RoleReportView } from '../catalog/roleAccess';

type ReportsWorkspaceHeaderProps = {
  title?: string;
  description?: string;
  views: readonly RoleReportView[];
  reportId: string;
  onReportChange: (id: string) => void;
  activeFilterCount: number;
  filterCount: number;
  onOpenFilters: () => void;
  onExport?: () => void;
};

export function ReportsWorkspaceHeader({
  title = REPORTS_FEATURE.title,
  description = REPORTS_FEATURE.description,
  views,
  reportId,
  onReportChange,
  activeFilterCount,
  filterCount,
  onOpenFilters,
  onExport,
}: ReportsWorkspaceHeaderProps) {
  return (
    <div
      data-slot="reports-workspace-header"
      className="border-b border-kv-border pb-kv-group"
    >
      <KvFeatureIntro
        title={title}
        description={description}
        actions={
          <>
            <div className="order-1 w-full shrink-0 lg:order-2 lg:min-w-[18rem] lg:max-w-md lg:flex-1">
              {views.length ? (
                <KvSelect value={reportId} onValueChange={onReportChange}>
                  <KvSelectTrigger
                    aria-label="انتخاب گزارش"
                    className="bg-kv-surface !shadow-kv-raised"
                  >
                    <KvSelectValue placeholder="انتخاب گزارش" />
                  </KvSelectTrigger>
                  <KvSelectContent>
                    {views.map((view) => (
                      <KvSelectItem key={view.id} value={view.id}>
                        {view.label}
                      </KvSelectItem>
                    ))}
                  </KvSelectContent>
                </KvSelect>
              ) : (
                <div className="flex h-11 items-center rounded-kv-control border border-kv-border bg-kv-surface-muted px-kv-group text-xs font-bold text-kv-text-faint">
                  گزارشی برای این نقش تعریف نشده
                </div>
              )}
            </div>
            <KvButton
              type="button"
              appearance="secondary"
              size="md"
              className="order-2 lg:order-1"
              disabled={!filterCount}
              icon={<FaIcon icon={faIcons.sliders} size="xs" />}
              onClick={onOpenFilters}
            >
              فیلتر
              {activeFilterCount > 0
                ? ` (${toPersianDigits(activeFilterCount)})`
                : ''}
            </KvButton>
            <KvButton
              type="button"
              appearance="ghost"
              size="md"
              className="order-3"
              icon={<FaIcon icon={faIcons.download} size="xs" />}
              onClick={onExport}
            >
              اکسل
            </KvButton>
          </>
        }
      />
    </div>
  );
}
