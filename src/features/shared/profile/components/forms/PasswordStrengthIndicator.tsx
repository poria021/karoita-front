'use client';

import { useMemo } from 'react';
import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import { adjacencyGraphs, dictionary as commonDictionary } from '@zxcvbn-ts/language-common';
import { dictionary as enDictionary, translations } from '@zxcvbn-ts/language-en';

import { cn } from '@/lib/utils';

export type PasswordStrengthLevel = 'empty' | 'weak' | 'moderate' | 'strong';

export interface PasswordStrengthResult {
  /** 0–100 bar width derived from zxcvbn score (0–4). */
  score: number;
  level: PasswordStrengthLevel;
  label: string;
  barClassName: string;
  labelClassName: string;
}

const zxcvbn = new ZxcvbnFactory({
  translations,
  graphs: adjacencyGraphs,
  dictionary: {
    ...commonDictionary,
    ...enDictionary,
  },
});

/**
 * Maps zxcvbn score (0–4) onto the product's three visible strength bands.
 * Empty input stays a dedicated level (UI hides the meter).
 */
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

  const { score } = zxcvbn.check(password);
  const percent = Math.round((score / 4) * 100);

  if (score <= 1) {
    return {
      score: Math.max(percent, 25),
      level: 'weak',
      label: 'ضعیف',
      barClassName: 'bg-kv-danger',
      labelClassName: 'text-kv-danger',
    };
  }

  if (score === 2) {
    return {
      score: Math.max(percent, 50),
      level: 'moderate',
      label: 'متوسط',
      barClassName: 'bg-kv-warning',
      labelClassName: 'text-kv-warning',
    };
  }

  return {
    score: Math.max(percent, 75),
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

/** Color-coded Weak / Moderate / Strong password meter (zxcvbn engine). */
export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(
    () => evaluatePasswordStrength(password),
    [password]
  );
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
