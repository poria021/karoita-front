'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { isTermGateActive } from '@/services/syllabus-config.service';
import type { AcademicTerm, AcademicTermType } from '@/types/syllabus-config';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  COURSE_OFFERING_AUDIENCE_TABS,
  formatTermOptionLabel,
} from '../constants';

const GATE_CONTENT_CLASS =
  'flex min-h-[82px] items-center justify-between gap-kv-group';

type TermGateCardsProps = {
  selectedTerm: AcademicTerm | null;
  isLoading?: boolean;
  enrollPending?: boolean;
  termOpenPending?: boolean;
  onToggleEnroll: (open: boolean) => void;
  onToggleTermOpen: (open: boolean) => void;
};

/** انتخاب واحد / برگزاری کلاس — خارج از فیلتر تب مخاطب. */
export function TermGateCards({
  selectedTerm,
  isLoading = false,
  enrollPending = false,
  termOpenPending = false,
  onToggleEnroll,
  onToggleTermOpen,
}: TermGateCardsProps) {
  const enrollActive = isTermGateActive(
    Boolean(selectedTerm?.isEnrollOpen),
    selectedTerm?.enrollStart ?? ''
  );
  const termActive = isTermGateActive(
    Boolean(selectedTerm?.isTermOpen),
    selectedTerm?.termStart ?? ''
  );
  const isDataLoading = isLoading && !selectedTerm;

  return (
    <div className="grid grid-cols-1 items-stretch gap-kv-group sm:grid-cols-2">
      <StatusGateCard
        icon={faIcons.clipboardList}
        title="انتخاب واحد"
        subtitle={
          isDataLoading ? (
            <Spinner className="size-3.5 text-kv-brand" aria-hidden="true" />
          ) : selectedTerm?.enrollStart ? (
            `شروع: ${toPersianDigits(selectedTerm.enrollStart)}`
          ) : (
            'تاریخ شروع ثبت نشده'
          )
        }
        switchOn={Boolean(selectedTerm?.isEnrollOpen)}
        active={enrollActive}
        onToggle={onToggleEnroll}
        disabled={!selectedTerm || isLoading || enrollPending}
        isLoading={isDataLoading || enrollPending}
      />

      <StatusGateCard
        icon={faIcons.chalkboardUser}
        title="برگزاری کلاس‌ها"
        subtitle={
          isDataLoading ? (
            <Spinner className="size-3.5 text-kv-brand" aria-hidden="true" />
          ) : selectedTerm?.termStart ? (
            `شروع: ${toPersianDigits(selectedTerm.termStart)}`
          ) : (
            'تاریخ شروع ثبت نشده'
          )
        }
        switchOn={Boolean(selectedTerm?.isTermOpen)}
        active={termActive}
        onToggle={onToggleTermOpen}
        disabled={!selectedTerm || isLoading || termOpenPending}
        isLoading={isDataLoading || termOpenPending}
      />
    </div>
  );
}

type TermSemesterCardProps = {
  terms: AcademicTerm[];
  selectedTerm: AcademicTerm | null;
  audience: AcademicTermType;
  isLoading?: boolean;
  onAudienceChange: (audience: AcademicTermType) => void;
  onSelectTerm: (termId: string) => void;
};

/** نیم‌سال + تب مخاطب (دانشجو / مهارت‌آموز). */
export function TermSemesterCard({
  terms,
  selectedTerm,
  audience,
  isLoading = false,
  onAudienceChange,
  onSelectTerm,
}: TermSemesterCardProps) {
  const isDataLoading = isLoading && terms.length === 0;

  return (
    <KvCard>
      <KvCardContent padding="md" className="flex flex-col gap-kv-pair">
        <div className="flex items-center justify-between gap-kv-pair">
          <div className="flex min-w-0 items-center gap-kv-pair">
            <KvCardTitleIcon icon={faIcons.graduationCap} />
            <KvTypography variant="subtitle" as="h4">
              نیم‌سال
            </KvTypography>
          </div>

          <div className="shrink-0">
            <AppTabs
              value={audience}
              onValueChange={(value) =>
                onAudienceChange(value as AcademicTermType)
              }
              gridCols={2}
            >
              <AppTabsList aria-label="فیلتر مخاطب نیم‌سال">
                {COURSE_OFFERING_AUDIENCE_TABS.map((tab) => (
                  <AppTabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </AppTabsTrigger>
                ))}
              </AppTabsList>
            </AppTabs>
          </div>
        </div>

        <div className="w-full">
          {isDataLoading ? (
            <div
              className="flex h-11 w-full items-center justify-center rounded-kv-control border border-kv-border bg-kv-surface"
              role="status"
              aria-busy="true"
              aria-label="در حال بارگذاری نیم‌سال"
            >
              <Spinner className="size-4 text-kv-brand" aria-hidden="true" />
            </div>
          ) : (
            <KvSelectField
              label={false}
              size="md"
              value={selectedTerm?.id ?? ''}
              displayValue={
                selectedTerm
                  ? formatTermOptionLabel(selectedTerm.title)
                  : undefined
              }
              onValueChange={onSelectTerm}
              placeholder="انتخاب ترم"
            >
              {terms.map((term) => (
                <KvSelectItem key={term.id} value={term.id}>
                  {formatTermOptionLabel(term.title)}
                </KvSelectItem>
              ))}
            </KvSelectField>
          )}
        </div>
      </KvCardContent>
    </KvCard>
  );
}

function StatusGateCard({
  className,
  icon,
  title,
  subtitle,
  switchOn,
  active,
  onToggle,
  disabled,
  isLoading,
}: {
  className?: string;
  icon: IconDefinition;
  title: string;
  subtitle: React.ReactNode;
  switchOn: boolean;
  active: boolean;
  onToggle: (open: boolean) => void;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  return (
    <KvCard
      className={cn(
        active
          ? 'border-kv-success-border bg-kv-success-soft/30'
          : 'border-kv-danger-border bg-kv-danger-soft/30',
        className
      )}
    >
      <KvCardContent padding="md" className={GATE_CONTENT_CLASS}>
        <div className="flex min-w-0 items-center gap-kv-pair">
          <KvCardTitleIcon icon={icon} />
          <div className="min-w-0">
            <KvTypography variant="subtitle" as="h4">
              {title}
            </KvTypography>
            {typeof subtitle === 'string' ? (
              <KvTypography variant="caption" tone="muted">
                {subtitle}
              </KvTypography>
            ) : (
              <div className="flex items-center py-0.5">{subtitle}</div>
            )}
          </div>
        </div>
        {isLoading ? (
          <span
            className="inline-flex h-7 w-11 shrink-0 items-center justify-center"
            role="status"
            aria-label={`در حال به‌روزرسانی ${title}`}
          >
            <Spinner className="size-4 text-kv-brand" aria-hidden="true" />
          </span>
        ) : (
          <KvSwitch
            size="md"
            checked={switchOn}
            disabled={disabled}
            onCheckedChange={onToggle}
            aria-label={title}
            className="shrink-0 data-[state=unchecked]:bg-kv-danger"
          />
        )}
      </KvCardContent>
    </KvCard>
  );
}
