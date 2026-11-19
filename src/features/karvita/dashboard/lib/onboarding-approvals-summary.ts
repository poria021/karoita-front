import type {
  ApprovalFilterTab,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';

export const ONBOARDING_DASHBOARD_PENDING_LIMIT = 10;

export type OnboardingStatusCounts = {
  pending_admin: number;
  approved: number;
  rejected: number;
};

export type OnboardingPieSegmentId = ApprovalFilterTab;

export type OnboardingPieSegment = {
  id: OnboardingPieSegmentId;
  label: string;
  /** برچسب کوتاه برای داخل قطاع نمودار. */
  shortLabel: string;
  value: number;
  /** رنگ پرکنندهٔ نمودار — توکن‌های وضعیت کارویتا. */
  color: string;
  softClassName: string;
  textClassName: string;
};

export type OnboardingApprovalsSummary = {
  counts: OnboardingStatusCounts;
  total: number;
  segments: OnboardingPieSegment[];
  pendingPreview: OnboardingApprovalUser[];
};

const SEGMENT_META: Record<
  OnboardingPieSegmentId,
  Omit<OnboardingPieSegment, 'id' | 'value'>
> = {
  pending_admin: {
    label: 'در انتظار بررسی',
    shortLabel: 'در انتظار',
    color: 'var(--kv-warning)',
    softClassName: 'bg-kv-warning-soft',
    textClassName: 'text-kv-warning-soft-fg',
  },
  approved: {
    label: 'تأیید شده',
    shortLabel: 'تأیید',
    color: 'var(--kv-success)',
    softClassName: 'bg-kv-success-soft',
    textClassName: 'text-kv-success-soft-fg',
  },
  rejected: {
    label: 'رد شده',
    shortLabel: 'رد شده',
    color: 'var(--kv-danger)',
    softClassName: 'bg-kv-danger-soft',
    textClassName: 'text-kv-danger-soft-fg',
  },
};

/** ترتیب برش‌های دایره: انتظار ← تأیید ← رد. */
const SEGMENT_ORDER: readonly OnboardingPieSegmentId[] = [
  'pending_admin',
  'approved',
  'rejected',
];

export function buildOnboardingPieSegments(
  counts: OnboardingStatusCounts
): OnboardingPieSegment[] {
  return SEGMENT_ORDER.map((id) => ({
    id,
    value: Math.max(0, counts[id] || 0),
    ...SEGMENT_META[id],
  }));
}

export function sumOnboardingCounts(counts: OnboardingStatusCounts): number {
  return (
    Math.max(0, counts.pending_admin || 0) +
    Math.max(0, counts.approved || 0) +
    Math.max(0, counts.rejected || 0)
  );
}

export function buildOnboardingApprovalsSummary(input: {
  counts: OnboardingStatusCounts;
  pendingPreview: OnboardingApprovalUser[];
}): OnboardingApprovalsSummary {
  const segments = buildOnboardingPieSegments(input.counts);
  return {
    counts: {
      pending_admin: Math.max(0, input.counts.pending_admin || 0),
      approved: Math.max(0, input.counts.approved || 0),
      rejected: Math.max(0, input.counts.rejected || 0),
    },
    total: sumOnboardingCounts(input.counts),
    segments,
    pendingPreview: input.pendingPreview.slice(
      0,
      ONBOARDING_DASHBOARD_PENDING_LIMIT
    ),
  };
}

export function userInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '؟';
  if (parts.length === 1) return parts[0]!.slice(0, 1);
  return `${parts[0]!.slice(0, 1)}${parts[parts.length - 1]!.slice(0, 1)}`;
}
