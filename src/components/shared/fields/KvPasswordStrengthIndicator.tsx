'use client';

import { useEffect, useState } from 'react';

import {
  KvTypography,
  type KvTypographyTone,
} from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

export type PasswordStrengthLevel = 'empty' | 'weak' | 'moderate' | 'strong';

export interface PasswordStrengthResult {
  score: number;
  level: PasswordStrengthLevel;
  label: string;
  barClassName: string;
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

function strengthTone(level: PasswordStrengthLevel): KvTypographyTone {
  if (level === 'weak') return 'danger';
  if (level === 'moderate') return 'warning';
  if (level === 'strong') return 'success';
  return 'muted';
}

export function scoreToStrengthResult(score: number): PasswordStrengthResult {
  const percent = Math.round((score / 4) * 100);

  if (score <= 1) {
    return {
      score: Math.max(percent, 25),
      level: 'weak',
      label: 'ضعیف',
      barClassName: 'bg-kv-danger',
    };
  }

  if (score === 2) {
    return {
      score: Math.max(percent, 50),
      level: 'moderate',
      label: 'متوسط',
      barClassName: 'bg-kv-warning',
    };
  }

  return {
    score: Math.max(percent, 75),
    level: 'strong',
    label: 'قوی',
    barClassName: 'bg-kv-success',
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
    };
  }
  const zxcvbn = await loadZxcvbn();
  return scoreToStrengthResult(zxcvbn.check(password).score);
}

interface KvPasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const PENDING_STRENGTH: PasswordStrengthResult = {
  score: 0,
  level: 'empty',
  label: '…',
  barClassName: 'bg-kv-border-strong',
};

export function KvPasswordStrengthIndicator({
  password,
  className,
}: KvPasswordStrengthIndicatorProps) {
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
      <div className="flex items-center justify-between">
        <KvTypography variant="caption" as="span">
          امنیت رمز عبور:
        </KvTypography>
        <KvTypography
          variant="caption"
          as="span"
          tone={strengthTone(strength.level)}
          weight="bold"
        >
          {strength.label}
        </KvTypography>
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