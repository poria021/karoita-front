'use client';

import { KvInput } from '@/components/shared/fields/KvInput';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

/** Editable ظرفیت پذیرش — same surface/border language as KvInput. */
export const CAPACITY_METRIC_BOX = [
  'inline-flex h-8 w-24 shrink-0 items-center justify-center',
  'rounded-kv-control border border-kv-border bg-kv-field',
  'text-xs font-bold text-kv-text-secondary',
].join(' ');

/** Readonly confirmed count — plain text, no border or filled chrome. */
export const CAPACITY_CONFIRMED_VALUE = [
  'inline-flex h-8 w-24 shrink-0 items-center justify-center',
  'border-0 bg-transparent',
  'text-xs font-bold text-kv-text-secondary',
].join(' ');

type OrganizationalCapacitiesTotalFieldProps = {
  value: number | null;
  maxCapacity: number;
  locked?: boolean;
  onChange: (value: string) => void;
  'aria-label'?: string;
};

export function OrganizationalCapacitiesTotalField({
  value,
  maxCapacity,
  locked = false,
  onChange,
  'aria-label': ariaLabel = 'ظرفیت پذیرش',
}: OrganizationalCapacitiesTotalFieldProps) {
  return (
    <KvInput
      type="text"
      inputMode="numeric"
      dir="ltr"
      disabled={locked}
      aria-label={ariaLabel}
      value={toPersianDigits(value ?? 0)}
      maxLength={String(maxCapacity).length + 1}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        CAPACITY_METRIC_BOX,
        'mx-auto px-2 text-center leading-none'
      )}
    />
  );
}
