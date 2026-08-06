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
import type { DailyApprovalWeek } from '@/types/daily-approvals';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import type { UseDailyApprovalsPageReturn } from '../hooks/useDailyApprovalsPage';
import { DailyApprovalUnreadBadge } from './DailyApprovalUnreadBadge';
import { DailyApprovalWeekEvaluation } from './DailyApprovalWeekEvaluation';
import { DailyApprovalWeekGrid } from './DailyApprovalWeekGrid';
import { DailyApprovalWeekLegend } from './DailyApprovalWeekLegend';
import { DailyApprovalsFilters } from './DailyApprovalsFilters';

type DailyApprovalsMobileWorkspaceProps = {
  page: UseDailyApprovalsPageReturn;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function DailyApprovalsMobileWorkspace({
  page,
  hasActiveFilters,
  onClearFilters,
}: DailyApprovalsMobileWorkspaceProps) {
  return (
    <div className="space-y-kv-group">
      <DailyApprovalsFilters
        mobile
        query={page.query}
        readFilter={page.readFilter}
        course={page.course}
        courseOptions={page.courseOptions}
        onQueryChange={page.setQuery}
        onReadFilterChange={page.changeReadFilter}
        onCourseChange={page.changeCourse}
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
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-kv-group text-start"
                  onClick={() =>
                    page.selectTrainee(expanded ? null : trainee)
                  }
                >
                  <div className="min-w-0">
                    <KvTypography variant="subtitle" as="h4" truncate>
                      {trainee.traineeName}
                    </KvTypography>
                    <KvTypography variant="caption" tone="muted" truncate>
                      {toPersianDigits(trainee.courseTitle)}
                      {trainee.schoolName
                        ? ` • ${trainee.schoolName}`
                        : ''}
                    </KvTypography>
                  </div>
                  <div className="flex shrink-0 items-center gap-kv-pair">
                    <DailyApprovalUnreadBadge trainee={trainee} compact />
                    <KvButton
                      type="button"
                      color="error"
                      appearance="secondary"
                      size="icon-sm"
                      aria-label="حذف کارورز از کلاس"
                      disabled={
                        page.actionBusy || trainee.status === 'dropped'
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        void page.dropTrainee(trainee);
                      }}
                      icon={<FaIcon icon={faIcons.userMinus} size="xs" />}
                    />
                    <FaIcon
                      icon={faIcons.chevronDown}
                      size="2xs"
                      className={
                        expanded
                          ? 'rotate-180 text-kv-brand'
                          : 'text-kv-text-faint'
                      }
                    />
                  </div>
                </button>

                {expanded ? (
                  <div className="space-y-kv-group border-t border-kv-border pt-kv-group">
                    {page.selectedWeek ? (
                      <DailyApprovalWeekEvaluation
                        trainee={trainee}
                        week={page.selectedWeek}
                        advisorFeedback={page.advisorFeedback}
                        scoreInput={page.scoreInput}
                        actionBusy={page.actionBusy}
                        onAdvisorFeedbackChange={page.setAdvisorFeedback}
                        onScoreInputChange={page.setScoreInput}
                        onSave={() => void page.saveEvaluation()}
                        onExtend={() => void page.extendDeadline()}
                        onClose={page.closeWeekEvaluation}
                      />
                    ) : (
                      <DailyApprovalWeekGrid
                        trainee={trainee}
                        selectedWeekId={null}
                        compact
                        onSelectWeek={(week: DailyApprovalWeek) =>
                          void page.selectWeek(trainee, week)
                        }
                      />
                    )}
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
