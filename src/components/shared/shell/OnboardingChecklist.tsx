'use client';

import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import type {
  OnboardingProgress,
  OnboardingStepState,
} from '@/utils/onboardingProgress';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type OnboardingChecklistProps = {
  progress: OnboardingProgress;
  className?: string;
  /** When true, omit CTA that points at the current profile page. */
  hideProfileCta?: boolean;
};

const STATE_LABEL: Record<OnboardingStepState, string> = {
  done: 'انجام شد',
  current: 'اقدام لازم',
  pending: 'در انتظار',
  failed: 'نیاز به اصلاح',
};

export function OnboardingChecklist({
  progress,
  className,
  hideProfileCta = false,
}: OnboardingChecklistProps) {
  const showCta =
    Boolean(progress.ctaLabel && progress.ctaHref) &&
    !(hideProfileCta && progress.ctaHref?.includes('/profile'));

  return (
    <section
      aria-label="وضعیت فعال‌سازی حساب"
      className={cn(
        'rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-kv-inline">
        <div className="min-w-0 space-y-kv-pair">
          <KvTypography variant="subtitle" as="h2">
            مسیر فعال‌سازی حساب
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            وضعیت واقعی پرونده شما؛ تا تأیید مدارک، ماژول‌ها قفل می‌مانند.
          </KvTypography>
        </div>
        <KvTypography
          variant="label"
          as="p"
          className="shrink-0 text-kv-brand"
          aria-label={`پیشرفت ${toPersianDigits(String(progress.percent))} درصد`}
        >
          {toPersianDigits(String(progress.percent))}٪
        </KvTypography>
      </div>

      <ol className="mt-kv-group space-y-kv-pair">
        {progress.steps.map((item, index) => (
          <li
            key={item.id}
            className="flex items-start gap-kv-inline text-start"
          >
            <StepMarker state={item.state} index={index + 1} />
            <div className="min-w-0 flex-1">
              <KvTypography variant="body" weight="bold" as="p">
                {item.title}
              </KvTypography>
              <KvTypography variant="caption" tone="muted" as="p">
                {STATE_LABEL[item.state]}
              </KvTypography>
            </div>
          </li>
        ))}
      </ol>

      {showCta && progress.ctaHref && progress.ctaLabel ? (
        <div className="mt-kv-group">
          <KvButton
            asChild
            color="cta"
            appearance="solid"
            size="sm"
            className="min-h-11"
          >
            <Link href={progress.ctaHref} prefetch={false}>
              {progress.ctaLabel}
            </Link>
          </KvButton>
        </div>
      ) : null}
    </section>
  );
}

function StepMarker({
  state,
  index,
}: {
  state: OnboardingStepState;
  index: number;
}) {
  if (state === 'done') {
    return (
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-kv-success-soft text-kv-success"
        aria-hidden
      >
        <FaIcon icon={faIcons.check} size="2xs" />
      </span>
    );
  }

  if (state === 'failed') {
    return (
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-kv-danger-soft text-kv-danger"
        aria-hidden
      >
        <FaIcon icon={faIcons.xmark} size="2xs" />
      </span>
    );
  }

  if (state === 'current') {
    return (
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-kv-brand-soft text-kv-brand text-xs font-semibold"
        aria-hidden
      >
        {toPersianDigits(String(index))}
      </span>
    );
  }

  return (
    <span
      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-kv-border bg-kv-surface-muted text-kv-text-faint text-xs"
      aria-hidden
    >
      {toPersianDigits(String(index))}
    </span>
  );
}
