'use client';

import { cn } from '@/lib/utils';

export type PasswordStrengthLevel = 'empty' | 'weak' | 'moderate' | 'strong';

export interface PasswordStrengthResult {
  score: number;
  level: PasswordStrengthLevel;
  label: string;
  barClassName: string;
  labelClassName: string;
}

/** Mirrors the legacy `passwordStrength` getter in `original-karvita.html`. */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      level: 'empty',
      label: 'خالی',
      barClassName: 'bg-kv-border-strong',
      labelClassName: 'text-kv-text-faint',
    };
  }

  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 10) score += 25;
  if (/[A-Z]/i.test(password)) score += 25;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25;

  if (score <= 50) {
    return {
      score,
      level: 'weak',
      label: 'ضعیف',
      barClassName: 'bg-kv-danger',
      labelClassName: 'text-kv-danger',
    };
  }

  if (score <= 75) {
    return {
      score,
      level: 'moderate',
      label: 'متوسط',
      barClassName: 'bg-kv-warning',
      labelClassName: 'text-kv-warning',
    };
  }

  return {
    score,
    level: 'strong',
    label: 'قوی',
    barClassName: 'bg-kv-success',
    labelClassName: 'text-kv-success',
  };
}

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

/** Color-coded Weak / Moderate / Strong password meter. */
export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const strength = evaluatePasswordStrength(password);
  if (!password) return null;

  return (
    <div className={cn('mt-kv-field space-y-1', className)}>
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-kv-text-subtle">امنیت رمز عبور:</span>
        <span className={strength.labelClassName}>{strength.label}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-kv-border-strong">
        <div
          className={cn('h-full transition-all duration-300', strength.barClassName)}
          style={{ width: `${strength.score}%` }}
        />
      </div>
    </div>
  );
}
