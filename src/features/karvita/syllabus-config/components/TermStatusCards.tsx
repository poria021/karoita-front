'use client';

import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { cn } from '@/lib/utils';
import { isTermGateActive } from '@/services/syllabus-config.service';
import type { AcademicTerm } from '@/types/syllabus-config';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { formatTermOptionLabel } from '../constants';

interface TermStatusCardsProps {
  terms: AcademicTerm[];
  selectedTerm: AcademicTerm | null;
  isLoading?: boolean;
  onSelectTerm: (termId: string) => void;
  onToggleEnroll: (open: boolean) => void;
  onToggleTermOpen: (open: boolean) => void;
}

const CARD_CONTENT_CLASS =
  'flex min-h-[82px] items-center justify-between gap-kv-group';

export function TermStatusCards({
  terms,
  selectedTerm,
  isLoading = false,
  onSelectTerm,
  onToggleEnroll,
  onToggleTermOpen,
}: TermStatusCardsProps) {
  const enrollActive = isTermGateActive(
    Boolean(selectedTerm?.isEnrollOpen),
    selectedTerm?.enrollStart ?? ''
  );
  const termActive = isTermGateActive(
    Boolean(selectedTerm?.isTermOpen),
    selectedTerm?.termStart ?? ''
  );

  const isDataLoading = isLoading && terms.length === 0;

  return (
    <div className="grid grid-cols-1 items-stretch gap-kv-group lg:grid-cols-3">
      {/* Mobile/tablet: after gates. Desktop (RTL): first from the right. */}
      <KvCard className="order-3 lg:order-1">
        <KvCardContent padding="md" className={CARD_CONTENT_CLASS}>
          <div className="flex min-w-0 items-center gap-kv-pair">
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
          <div className="w-full max-w-56 shrink-0 sm:max-w-64">
            {isDataLoading ? (
              <KvSkeleton className="h-9 w-full rounded-kv-control" />
            ) : (
              <KvSelectField
                label={false}
                size="sm"
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

      <StatusGateCard
        className="order-1 lg:order-2"
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
        disabled={!selectedTerm || isDataLoading}
        isLoading={isDataLoading}
      />

      <StatusGateCard
        className="order-2 lg:order-3"
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
        disabled={!selectedTerm || isDataLoading}
        isLoading={isDataLoading}
      />
    </div>
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
      <KvCardContent padding="md" className={CARD_CONTENT_CLASS}>
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
