'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export type PasswordStrengthLevel = 'empty' | 'weak' | 'moderate' | 'strong';

export interface PasswordStrengthResult {
  score: number;
  level: PasswordStrengthLevel;
  label: string;
  barClassName: string;
  labelClassName: string;
}

type ZxcvbnChecker = { check: (password: string) => { score: number } };

let zxcvbnPromise: Promise<ZxcvbnChecker> | null = null;

function loadZxcvbn(): Promise<ZxcvbnChecker> {
  if (!zxcvbnPromise) {
    zxcvbnPromise = Promise.all([
      import('@zxcvbn-ts/core'),
      import('@zxcvbn-ts/language-common'),
      import('@zxcvbn-ts/language-en'),
    ]).then(([core, common, en]) => {
      return new core.ZxcvbnFactory({
        translations: en.translations,
        graphs: common.adjacencyGraphs,
        dictionary: {
          ...common.dictionary,
          ...en.dictionary,
        },
      });
    });
  }
  return zxcvbnPromise;
}

export function scoreToStrengthResult(score: number): PasswordStrengthResult {
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

export async function evaluatePasswordStrength(
  password: string
): Promise<PasswordStrengthResult> {
  if (!password) {
    return {
      score: 0,
      level: 'empty',
      label: 'خالی',
      barClassName: 'bg-kv-border-strong',
      labelClassName: 'text-kv-text-faint',
    };
  }
  const zxcvbn = await loadZxcvbn();
  return scoreToStrengthResult(zxcvbn.check(password).score);
}

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const PENDING_STRENGTH: PasswordStrengthResult = {
  score: 0,
  level: 'weak',
  label: '…',
  barClassName: 'bg-kv-border-strong',
  labelClassName: 'text-kv-text-faint',
};

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const [engineScore, setEngineScore] = useState<{
    password: string;
    score: number;
  } | null>(null);

  useEffect(() => {
    if (!password) return;

    let cancelled = false;
    void loadZxcvbn().then((zxcvbn) => {
      if (cancelled) return;
      setEngineScore({ password, score: zxcvbn.check(password).score });
    });

    return () => {
      cancelled = true;
    };
  }, [password]);

  if (!password) return null;

  const strength =
    engineScore?.password === password
      ? scoreToStrengthResult(engineScore.score)
      : PENDING_STRENGTH;

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
