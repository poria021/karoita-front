'use client';

import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvTypography } from '@/components/shared/KvTypography';
import type { AcademicTerm } from '@/types/syllabus-config';
import { toPersianDigits } from '@/utils/persianDigits';

interface TermStatusCardsProps {
  terms: AcademicTerm[];
  selectedTerm: AcademicTerm | null;
  onSelectTerm: (termTitle: string) => void;
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
  return (
    <div className="grid grid-cols-1 items-stretch gap-kv-group md:grid-cols-3">
      <KvCard>
        <KvCardContent
          padding="md"
          className="flex min-h-[82px] items-center justify-between gap-kv-group"
        >
          <div className="min-w-0">
            <KvTypography variant="subtitle" as="h4">
              نیم‌سال فعال
            </KvTypography>
            <KvTypography variant="caption" tone="muted">
              بازه جاری سامانه
            </KvTypography>
          </div>
          <div className="w-40 shrink-0">
            <KvSelectField
              label={false}
              size="sm"
              value={selectedTerm?.title ?? ''}
              onValueChange={onSelectTerm}
              placeholder="انتخاب ترم"
            >
              {terms.map((term) => (
                <KvSelectItem key={term.id} value={term.title}>
                  {toPersianDigits(term.title)}
                </KvSelectItem>
              ))}
            </KvSelectField>
          </div>
        </KvCardContent>
      </KvCard>

      <StatusGateCard
        title="انتخاب واحد"
        subtitle={
          selectedTerm?.enrollStart
            ? `شروع: ${toPersianDigits(selectedTerm.enrollStart)}`
            : 'غیرفعال'
        }
        open={Boolean(selectedTerm?.isEnrollOpen)}
        onToggle={onToggleEnroll}
        disabled={!selectedTerm}
      />

      <StatusGateCard
        title="برگزاری کلاس‌ها"
        subtitle={
          selectedTerm?.termStart
            ? `شروع: ${toPersianDigits(selectedTerm.termStart)}`
            : 'غیرفعال'
        }
        open={Boolean(selectedTerm?.isTermOpen)}
        onToggle={onToggleTermOpen}
        disabled={!selectedTerm}
      />
    </div>
  );
}

function StatusGateCard({
  title,
  subtitle,
  open,
  onToggle,
  disabled,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: (open: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <KvCard>
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
        <KvButton
          type="button"
          color={open ? 'success' : 'error'}
          size="sm"
          disabled={disabled}
          aria-pressed={open}
          aria-label={`${title}: ${open ? 'فعال' : 'غیرفعال'}`}
          onClick={() => onToggle(!open)}
        >
          {open ? 'فعال' : 'غیرفعال'}
        </KvButton>
      </KvCardContent>
    </KvCard>
  );
}
