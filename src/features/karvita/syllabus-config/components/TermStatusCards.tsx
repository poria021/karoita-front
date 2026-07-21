'use client';

import { KvBadge } from '@/components/shared/KvBadge';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { KvTypography } from '@/components/shared/KvTypography';
import { isTermGateActive } from '@/services/syllabus-config.service';
import type { AcademicTerm } from '@/types/syllabus-config';
import { toPersianDigits } from '@/utils/persianDigits';

interface TermStatusCardsProps {
  terms: AcademicTerm[];
  selectedTerm: AcademicTerm | null;
  onSelectTerm: (termId: string) => void;
  onToggleEnroll: (open: boolean) => void;
  onToggleTermOpen: (open: boolean) => void;
}

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
    <div className="grid grid-cols-1 items-stretch gap-kv-group md:grid-cols-3">
      <StatusGateCard
        title="انتخاب واحد"
        subtitle={
          selectedTerm?.enrollStart
            ? `شروع: ${toPersianDigits(selectedTerm.enrollStart)}`
            : 'تاریخ شروع ثبت نشده'
        }
        switchOn={Boolean(selectedTerm?.isEnrollOpen)}
        active={enrollActive}
        openLabel="باز"
        closedLabel="بسته"
        onToggle={onToggleEnroll}
        disabled={!selectedTerm}
      />

      <StatusGateCard
        title="برگزاری کلاس‌ها"
        subtitle={
          selectedTerm?.termStart
            ? `شروع: ${toPersianDigits(selectedTerm.termStart)}`
            : 'تاریخ شروع ثبت نشده'
        }
        switchOn={Boolean(selectedTerm?.isTermOpen)}
        active={termActive}
        openLabel="فعال"
        closedLabel="بسته"
        onToggle={onToggleTermOpen}
        disabled={!selectedTerm}
      />

      <KvCard>
        <KvCardContent
          padding="md"
          className="flex min-h-[82px] items-center justify-center"
        >
          <div className="w-full max-w-64">
            <KvSelectField
              label={false}
              size="md"
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
    </div>
  );
}

function StatusGateCard({
  title,
  subtitle,
  switchOn,
  active,
  openLabel,
  closedLabel,
  onToggle,
  disabled,
}: {
  title: string;
  subtitle: string;
  switchOn: boolean;
  active: boolean;
  openLabel: string;
  closedLabel: string;
  onToggle: (open: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <KvCard
      className={
        active ? 'border-kv-success-border bg-kv-success-soft/30' : undefined
      }
    >
      <KvCardContent
        padding="md"
        className="flex min-h-[82px] items-center justify-between gap-kv-group"
      >
        <div className="min-w-0">
          <KvTypography variant="subtitle" as="h4">
            {title}
          </KvTypography>
          <KvTypography variant="caption" tone="muted">
            {subtitle}
          </KvTypography>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <KvBadge variant={active ? 'success' : 'default'}>
            {active ? openLabel : closedLabel}
          </KvBadge>
          <KvSwitch
            size="md"
            checked={switchOn}
            disabled={disabled}
            onCheckedChange={onToggle}
            aria-label={title}
          />
        </div>
      </KvCardContent>
    </KvCard>
  );
}
