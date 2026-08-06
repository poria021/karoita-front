'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvCard,
  KvCardContent,
} from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { KvTypography } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import type { UseDailyApprovalsPageReturn } from '../hooks/useDailyApprovalsPage';
import { DailyApprovalUnreadBadge } from './DailyApprovalUnreadBadge';
import { DailyApprovalWeekGrid } from './DailyApprovalWeekGrid';
import { DailyApprovalWeekLegend } from './DailyApprovalWeekLegend';
import { DailyApprovalsFilters } from './DailyApprovalsFilters';

type DailyApprovalsMobileWorkspaceProps = {
  page: UseDailyApprovalsPageReturn;
  canDrop: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function DailyApprovalsMobileWorkspace({
  page,
  canDrop,
  hasActiveFilters,
  onClearFilters,
}: DailyApprovalsMobileWorkspaceProps) {
  return (
    <div className="space-y-kv-group">
      <DailyApprovalsFilters
        mobile
        query={page.query}
        readFilter={page.readFilter}
        onQueryChange={page.setQuery}
        onReadFilterChange={page.changeReadFilter}
      />

      {page.isLoading ? (
        <KvCard>
          <KvBusySurface className="rounded-kv-control" />
        </KvCard>
      ) : page.trainees.length === 0 ? (
        <KvCard padding="md">
          <KvEmptyState
            title="کارورزی مطابق فیلترها پیدا نشد"
            description="عبارت جستجو یا فیلترهای پایش را تغییر دهید."
            actions={
              hasActiveFilters ? (
                <KvButton
                  type="button"
                  color="cta"
                  appearance="solid"
                  size="sm"
                  onClick={onClearFilters}
                >
                  پاک کردن فیلترها
                </KvButton>
              ) : undefined
            }
          />
        </KvCard>
      ) : (
        page.trainees.map((trainee) => {
          const expanded = page.selectedTrainee?.id === trainee.id;
          return (
            <KvCard key={trainee.id} padding="sm">
              <KvCardContent padding="none" className="space-y-kv-group">
                <div className="flex w-full items-center justify-between gap-kv-group text-start">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-start"
                    onClick={() =>
                      page.selectTrainee(expanded ? null : trainee)
                    }
                  >
                    <KvTypography variant="subtitle" as="h4" truncate>
                      {trainee.traineeName}
                    </KvTypography>
                    <KvTypography variant="caption" tone="muted" truncate>
                      {toPersianDigits(trainee.courseTitle)}
                      {trainee.schoolName
                        ? ` • ${trainee.schoolName}`
                        : ''}
                    </KvTypography>
                  </button>
                  <div className="flex shrink-0 items-center gap-kv-pair">
                    <DailyApprovalUnreadBadge trainee={trainee} compact />
                    {canDrop ? (
                      <KvButton
                        type="button"
                        color="error"
                        appearance="ghost"
                        size="icon-xs"
                        aria-label="حذف کارورز از کلاس"
                        disabled={
                          page.actionBusy || trainee.status === 'dropped'
                        }
                        onClick={() => void page.dropTrainee(trainee)}
                        icon={<FaIcon icon={faIcons.userMinus} size="2xs" />}
                      />
                    ) : null}
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center"
                      aria-label={expanded ? 'بستن جزئیات' : 'باز کردن جزئیات'}
                      onClick={() =>
                        page.selectTrainee(expanded ? null : trainee)
                      }
                    >
                      <FaIcon
                        icon={faIcons.chevronDown}
                        size="2xs"
                        className={
                          expanded
                            ? 'rotate-180 text-kv-brand'
                            : 'text-kv-text-faint'
                        }
                      />
                    </button>
                  </div>
                </div>

                {expanded ? (
                  <div className="space-y-kv-group border-t border-kv-border pt-kv-group">
                    <DailyApprovalWeekGrid trainee={trainee} compact />
                  </div>
                ) : null}
              </KvCardContent>
            </KvCard>
          );
        })
      )}

      {page.loadMoreError ? (
        <KvAlert
          variant="error"
          title="بارگذاری موارد بیشتر ناموفق بود"
          description={page.loadMoreError}
          actions={
            <KvButton
              type="button"
              appearance="secondary"
              size="sm"
              onClick={page.retryLoadMore}
            >
              تلاش مجدد
            </KvButton>
          }
        />
      ) : null}

      {page.hasMore ? (
        <KvButton
          type="button"
          color="neutral"
          appearance="secondary"
          size="md"
          fullWidth
          loading={page.isLoadingMore}
          disabled={page.isLoadingMore}
          onClick={page.loadMore}
          icon={<FaIcon icon={faIcons.chevronDown} size="xs" />}
        >
          بارگذاری موارد بیشتر
        </KvButton>
      ) : null}

      <DailyApprovalWeekLegend titled />
    </div>
  );
}
