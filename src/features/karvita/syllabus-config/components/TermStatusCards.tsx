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
import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
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
  onToggleEnroll: (open: boolean) => void;
  onToggleTermOpen: (open: boolean) => void;
};

/** انتخاب واحد / برگزاری کلاس — خارج از فیلتر تب مخاطب. */
export function TermGateCards({
  selectedTerm,
  isLoading = false,
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
            <KvSkeleton className="h-3.5 w-36 bg-kv-border" />
          ) : selectedTerm?.enrollStart ? (
            `شروع: ${toPersianDigits(selectedTerm.enrollStart)}`
          ) : (
            'تاریخ شروع ثبت نشده'
          )
        }
        switchOn={Boolean(selectedTerm?.isEnrollOpen)}
        active={enrollActive}
        onToggle={onToggleEnroll}
        disabled={!selectedTerm || isLoading}
        isLoading={isDataLoading}
      />

      <StatusGateCard
        icon={faIcons.chalkboardUser}
        title="برگزاری کلاس‌ها"
        subtitle={
          isDataLoading ? (
            <KvSkeleton className="h-3.5 w-36 bg-kv-border" />
          ) : selectedTerm?.termStart ? (
            `شروع: ${toPersianDigits(selectedTerm.termStart)}`
          ) : (
            'تاریخ شروع ثبت نشده'
          )
        }
        switchOn={Boolean(selectedTerm?.isTermOpen)}
        active={termActive}
        onToggle={onToggleTermOpen}
        disabled={!selectedTerm || isLoading}
        isLoading={isDataLoading}
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
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-kv-pair">
            <KvCardTitleIcon icon={faIcons.graduationCap} />
            <div className="min-w-0">
              <KvTypography variant="subtitle" as="h4">
                نیم‌سال
              </KvTypography>
              <KvTypography variant="caption" tone="muted">
                انتخاب ترم برای مدیریت ارائه و سرفصل
              </KvTypography>
            </div>
          </div>

          <AppTabs
            value={audience}
            onValueChange={(value) =>
              onAudienceChange(value as AcademicTermType)
            }
            gridCols={2}
            fullWidth
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

        <div className="w-full">
          {isDataLoading ? (
            <KvSkeleton className="h-11 w-full rounded-kv-control bg-kv-border" />
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
          <KvSkeleton className="h-9 w-14 shrink-0 rounded-full bg-kv-border" />
        ) : (
          <KvSwitch
            size="md"
            checked={switchOn}
            disabled={disabled}
            onCheckedChange={onToggle}
            aria-label={title}
            className="shrink-0 data-[state=unchecked]:bg-kv-danger/35"
          />
        )}
      </KvCardContent>
    </KvCard>
  );
}
