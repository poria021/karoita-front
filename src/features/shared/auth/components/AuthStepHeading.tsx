import { FaIcon } from '@/components/shared/FaIcon';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

interface AuthStepHeadingProps {
  step: number;
  totalSteps: number;
}

type BulletState = 'completed' | 'active' | 'pending';

function resolveBulletState(index: number, currentStep: number): BulletState {
  const stepNumber = index + 1;
  if (stepNumber < currentStep) return 'completed';
  if (stepNumber === currentStep) return 'active';
  return 'pending';
}

function bulletLabel(index: number, state: BulletState): string {
  if (state === 'completed') return `گام ${toPersianDigits(index + 1)} تکمیل شده`;
  if (state === 'active') return `گام ${toPersianDigits(index + 1)} جاری`;
  return `گام ${toPersianDigits(index + 1)} در انتظار`;
}

function AuthStepBullet({ state }: { state: BulletState }) {
  return (
    <span
      className={cn(
        'box-border inline-flex size-5 shrink-0 items-center justify-center rounded-full',
        state === 'completed' && 'bg-kv-brand text-kv-brand-fg',
        state === 'active' && 'border-2 border-kv-brand bg-kv-surface',
        state === 'pending' && 'border border-kv-border-disabled bg-kv-surface'
      )}
      aria-hidden="true"
    >
      {state === 'completed' ? (
        <FaIcon icon={faIcons.check} size="2xs" className="text-kv-brand-fg" />
      ) : null}
      {state === 'active' ? <span className="size-2 rounded-full bg-kv-brand" /> : null}
    </span>
  );
}

export function AuthStepHeading({ step, totalSteps }: AuthStepHeadingProps) {
  if (totalSteps <= 1 || step < 1 || step > totalSteps) {
    return null;
  }

  const label = `گام ${toPersianDigits(step)} از ${toPersianDigits(totalSteps)}`;

  return (
    <div className="flex items-center justify-between gap-kv-inline">
      <h2 className="min-w-0 font-sans text-sm font-bold leading-tight text-kv-brand">
        {label}
      </h2>

      <div
        className="flex shrink-0 items-center gap-1.5"
        dir="ltr"
        role="list"
        aria-label={label}
      >
        {Array.from({ length: totalSteps }, (_, index) => {
          const state = resolveBulletState(index, step);
          return (
            <div
              key={index}
              role="listitem"
              aria-current={state === 'active' ? 'step' : undefined}
              aria-label={bulletLabel(index, state)}
              className="flex"
            >
              <AuthStepBullet state={state} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
