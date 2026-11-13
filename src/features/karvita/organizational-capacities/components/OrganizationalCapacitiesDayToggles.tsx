'use client';

import { cn } from '@/lib/utils';
import type { OrganizationalCapacityWeekday } from '@/types/organizational-capacities';

import { CAPACITY_WEEK_DAYS } from '../constants';

type OrganizationalCapacitiesDayTogglesProps = {
  selectedDays: readonly OrganizationalCapacityWeekday[];
  disabled?: boolean;
  onToggle: (day: OrganizationalCapacityWeekday) => void;
  className?: string;
};

export function OrganizationalCapacitiesDayToggles({
  selectedDays,
  disabled = false,
  onToggle,
  className,
}: OrganizationalCapacitiesDayTogglesProps) {
  return (
    <div
      className={cn(
        'flex flex-row flex-nowrap items-center justify-start gap-0.5 sm:gap-kv-micro',
        className
      )}
      role="group"
      aria-label="روزهای حضور"
    >
      {CAPACITY_WEEK_DAYS.map((day) => {
        const active = selectedDays.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            aria-label={day.fullName}
            title={day.fullName}
            onClick={() => onToggle(day.value)}
            className={cn(
              'flex size-7 items-center justify-center rounded-kv-control border text-xs font-black transition-colors',
              'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              active
                ? 'border-kv-brand-border bg-kv-brand-soft text-kv-brand-soft-fg'
                : 'border-kv-border-muted bg-kv-surface-subtle text-kv-text-faint hover:border-kv-border hover:text-kv-text-subtle'
            )}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
