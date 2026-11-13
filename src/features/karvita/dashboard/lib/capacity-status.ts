import { CAPACITY_KIND_TABS } from '@/features/karvita/organizational-capacities/constants';
import type {
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityKind,
  OrganizationalCapacitySubmissionStatus,
} from '@/types/organizational-capacities';

export type CapacityFillTone = 'calm' | 'watch' | 'critical' | 'open';

export type CapacityKindStatusView = {
  kind: OrganizationalCapacityKind;
  label: string;
  termId: string;
  termTitle: string;
  total: number | 'unlimited';
  confirmed: number;
  remaining: number | 'unlimited';
  /** ۰ تا ۱؛ برای نامحدود یا سقف صفر، null. */
  fillRatio: number | null;
  fillPercent: number | null;
  tone: CapacityFillTone;
  coursesCount: number;
  coursesWithCapacity: number;
  coursesWithDays: number;
  status: OrganizationalCapacitySubmissionStatus;
};

export type CapacityStatusInsight = {
  tone: CapacityFillTone;
  headline: string;
  detail: string;
};

const STATUS_LABELS: Record<OrganizationalCapacitySubmissionStatus, string> = {
  draft: 'پیش‌نویس',
  pending_admin: 'در انتظار تأیید',
  approved: 'تأییدشده',
  rejected: 'ردشده',
};

export function capacitySubmissionStatusLabel(
  status: OrganizationalCapacitySubmissionStatus
): string {
  return STATUS_LABELS[status];
}

export function kindLabel(kind: OrganizationalCapacityKind): string {
  return CAPACITY_KIND_TABS.find((tab) => tab.value === kind)?.label ?? kind;
}

export function computeFillRatio(
  total: number | 'unlimited',
  confirmed: number
): number | null {
  if (total === 'unlimited' || total <= 0) return null;
  return Math.min(1, Math.max(0, confirmed / total));
}

export function fillToneForRatio(ratio: number | null): CapacityFillTone {
  if (ratio == null) return 'open';
  if (ratio >= 0.95) return 'critical';
  if (ratio >= 0.75) return 'watch';
  return 'calm';
}

export function buildCapacityKindStatusView(
  snapshot: OrganizationalCapacitiesSnapshot
): CapacityKindStatusView {
  const fillRatio = computeFillRatio(
    snapshot.summary.total,
    snapshot.summary.confirmed
  );
  const coursesWithCapacity = snapshot.courses.filter(
    (course) => course.total === null || (course.total ?? 0) > 0
  ).length;
  const coursesWithDays = snapshot.courses.filter(
    (course) => course.selectedDays.length > 0
  ).length;

  return {
    kind: snapshot.kind,
    label: kindLabel(snapshot.kind),
    termId: snapshot.termId,
    termTitle: snapshot.termTitle,
    total: snapshot.summary.total,
    confirmed: snapshot.summary.confirmed,
    remaining: snapshot.summary.remaining,
    fillRatio,
    fillPercent:
      fillRatio == null ? null : Math.round(fillRatio * 100),
    tone: fillToneForRatio(fillRatio),
    coursesCount: snapshot.courses.length,
    coursesWithCapacity,
    coursesWithDays,
    status: snapshot.status,
  };
}

function toneRank(tone: CapacityFillTone): number {
  if (tone === 'critical') return 3;
  if (tone === 'watch') return 2;
  if (tone === 'calm') return 1;
  return 0;
}

/** یک جملهٔ محصولی از بدترین وضعیت بین مسیرهای ترمی/پودمانی. */
export function buildCapacityStatusInsight(
  views: readonly CapacityKindStatusView[]
): CapacityStatusInsight {
  if (views.length === 0) {
    return {
      tone: 'open',
      headline: 'هنوز ظرفیتی برای نمایش نیست',
      detail: 'با انتخاب ترم و اعلام سقف پذیرش، وضعیت اینجا دیده می‌شود.',
    };
  }

  const worst = [...views].sort(
    (a, b) => toneRank(b.tone) - toneRank(a.tone)
  )[0]!;

  if (worst.tone === 'critical') {
    return {
      tone: 'critical',
      headline: `${worst.label} تقریباً پر شده`,
      detail: 'ظرفیت باقی‌مانده ناچیز است؛ قبل از پذیرش جدید سقف را بازبینی کنید.',
    };
  }

  if (worst.tone === 'watch') {
    return {
      tone: 'watch',
      headline: `${worst.label} به سقف نزدیک است`,
      detail: 'بخش زیادی از ظرفیت اعلام‌شده پر شده؛ برنامهٔ پذیرش را سبک نگه دارید.',
    };
  }

  if (worst.tone === 'open') {
    const unlimited = views.some((view) => view.total === 'unlimited');
    if (unlimited) {
      return {
        tone: 'open',
        headline: 'سقف نامحدود فعال است',
        detail: 'پذیرش قطعی را از روی عدد قطعی‌ها دنبال کنید؛ برای کنترل بهتر سقف عددی بگذارید.',
      };
    }
    return {
      tone: 'open',
      headline: '',
      detail: '',
    };
  }

  const remainingLabel =
    worst.remaining === 'unlimited'
      ? 'نامحدود'
      : `${worst.remaining} نفر`;

  return {
    tone: 'calm',
    headline: 'ظرفیت در وضعیت پایدار است',
    detail: `از مسیر ${worst.label} هنوز ${remainingLabel} ظرفیت باقی مانده.`,
  };
}
