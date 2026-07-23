'use client';

import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { isTermGateActive } from '@/services/syllabus-config.service';
import type { AcademicTerm } from '@/types/syllabus-config';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

interface TermStatusCardsProps {
  terms: AcademicTerm[];
  selectedTerm: AcademicTerm | null;
  onSelectTerm: (termId: string) => void;
  onToggleEnroll: (open: boolean) => void;
  onToggleTermOpen: (open: boolean) => void;
}

const CARD_CONTENT_CLASS =
  'flex min-h-[82px] items-center justify-between gap-kv-group';

export function TermStatusCards({
  terms,
  selectedTerm,
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
          <div className="w-full max-w-44 shrink-0">
            <KvSelectField
              label={false}
              size="sm"
              value={selectedTerm?.id ?? ''}
              onValueChange={onSelectTerm}
              placeholder="انتخاب ترم"
            >
              {terms.map((term) => (
                <KvSelectItem key={term.id} value={term.id}>
                  {toPersianDigits(term.title)}
                </KvSelectItem>
              ))}
            </KvSelectField>
          </div>
        </KvCardContent>
      </KvCard>

      <StatusGateCard
        className="order-1 lg:order-2"
        icon={faIcons.clipboardList}
        title="انتخاب واحد"
        subtitle={
          selectedTerm?.enrollStart
            ? `شروع: ${toPersianDigits(selectedTerm.enrollStart)}`
            : 'تاریخ شروع ثبت نشده'
        }
        switchOn={Boolean(selectedTerm?.isEnrollOpen)}
        active={enrollActive}
        onToggle={onToggleEnroll}
        disabled={!selectedTerm}
      />

      <StatusGateCard
        className="order-2 lg:order-3"
        icon={faIcons.chalkboardUser}
        title="برگزاری کلاس‌ها"
        subtitle={
          selectedTerm?.termStart
            ? `شروع: ${toPersianDigits(selectedTerm.termStart)}`
            : 'تاریخ شروع ثبت نشده'
        }
        switchOn={Boolean(selectedTerm?.isTermOpen)}
        active={termActive}
        onToggle={onToggleTermOpen}
        disabled={!selectedTerm}
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
}: {
  className?: string;
  icon: IconDefinition;
  title: string;
  subtitle: string;
  switchOn: boolean;
  active: boolean;
  onToggle: (open: boolean) => void;
  disabled?: boolean;
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
            <KvTypography variant="caption" tone="muted">
              {subtitle}
            </KvTypography>
          </div>
        </div>
        <KvSwitch
          size="md"
          checked={switchOn}
          disabled={disabled}
          onCheckedChange={onToggle}
          aria-label={title}
          className="shrink-0 data-[state=unchecked]:bg-kv-danger/35"
        />
      </KvCardContent>
    </KvCard>
  );
}
