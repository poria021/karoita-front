'use client';

import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvCard,
  KvCardContent,
  KvCardIdentity,
} from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

import type { LearnerNextAction } from '../lib/learner-workbench';

const TONE_ICON = {
  action: faIcons.rocket,
  waiting: faIcons.hourglassHalf,
  blocked: faIcons.circleExclamation,
  info: faIcons.circleInfo,
} as const;

const TONE_ICON_CLASS = {
  action: 'bg-kv-brand-soft text-kv-brand-soft-fg',
  waiting: 'bg-kv-warning-soft text-kv-warning-soft-fg',
  blocked: 'bg-kv-danger-soft text-kv-danger',
  info: 'bg-kv-surface-muted text-kv-text-muted',
} as const;

type DashboardLearnerNextActionBoxProps = {
  action: LearnerNextAction | null;
  isLoading?: boolean;
  className?: string;
};

/** باکس اقدام بعدی میز کار دانشجو/مهارت‌آموز — یک پیام، یک CTA. */
export function DashboardLearnerNextActionBox({
  action,
  isLoading = false,
  className,
}: DashboardLearnerNextActionBoxProps) {
  if (isLoading) {
    return (
      <div
        aria-hidden
        className={cn(
          'min-h-[7.5rem] animate-pulse rounded-kv-shell border border-kv-border/70 bg-kv-surface shadow-kv-soft',
          className
        )}
      />
    );
  }

  if (!action) return null;

  return (
    <KvCard
      tone="surface"
      padding="none"
      className={cn(
        'relative overflow-hidden border-kv-border/70 shadow-kv-soft',
        className
      )}
      aria-label="اقدام بعدی"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,var(--color-kv-brand-soft)_0%,transparent_48%)] opacity-80"
      />
      <KvCardContent
        padding="md"
        className="relative z-[1] flex flex-col gap-kv-group sm:flex-row sm:items-center sm:justify-between"
      >
        <KvCardIdentity
          leading={
            <span
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-kv-control shadow-kv-soft',
                TONE_ICON_CLASS[action.tone]
              )}
            >
              <FaIcon icon={TONE_ICON[action.tone]} size="sm" />
            </span>
          }
        >
          <div className="min-w-0 space-y-1 text-start">
            <KvTypography variant="caption" tone="muted" as="p" className="font-bold">
              اقدام بعدی · {action.courseLabel}
            </KvTypography>
            <KvTypography variant="subtitle" weight="bold" as="h3">
              {action.title}
            </KvTypography>
            <KvTypography variant="body" tone="muted" as="p" className="text-sm">
              {action.description}
            </KvTypography>
          </div>
        </KvCardIdentity>

        {action.ctaLabel && action.href ? (
          <KvButton asChild className="shrink-0 self-stretch sm:self-center">
            <Link href={action.href} prefetch>
              {action.ctaLabel}
            </Link>
          </KvButton>
        ) : null}
      </KvCardContent>
    </KvCard>
  );
}
