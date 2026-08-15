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
        'flex flex-row flex-nowrap items-center justify-start gap-kv-micro',
        className
      )}
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
                ? 'border-kv-brand bg-kv-brand text-kv-brand-fg shadow-kv-soft'
                : 'border-kv-border bg-kv-surface-muted text-kv-text-faint'
            )}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
