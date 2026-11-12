'use client';

import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import type { SwitchVisualState } from '@/components/ui/switch';
import type { ReportAccessSwitchState } from '@/types/report-access';

type AccessTriStateSwitchProps = {
  state: ReportAccessSwitchState;
  label: string;
  disabled?: boolean;
  onToggle: () => void;
};

function toVisualState(state: ReportAccessSwitchState): SwitchVisualState {
  if (state === 'on') return 'checked';
  if (state === 'mixed') return 'mixed';
  return 'unchecked';
}

/**
 * سوییچ ماتریس دسترسی روی `KvSwitch` دیزاین‌سیستم،
 * با `visualState` برای حالت بخشی از استان‌ها.
 */
export function AccessTriStateSwitch({
  state,
  label,
  disabled = false,
  onToggle,
}: AccessTriStateSwitchProps) {
  return (
    <KvSwitch
      aria-label={label}
      disabled={disabled || state === 'locked'}
      visualState={toVisualState(state)}
      checked={state === 'on'}
      onCheckedChange={() => onToggle()}
    />
  );
}
