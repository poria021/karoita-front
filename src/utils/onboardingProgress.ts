import type { DocStatus } from '@/types/auth';
import { RouteService } from '@/services/route.service';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

export type OnboardingStepId =
  | 'complete_docs'
  | 'submit_review'
  | 'await_approval'
  | 'unlock_modules';

export type OnboardingStepState = 'done' | 'current' | 'pending' | 'failed';

export type OnboardingStep = {
  id: OnboardingStepId;
  title: string;
  state: OnboardingStepState;
};

export type OnboardingProgress = {
  steps: OnboardingStep[];
  /** ۰–۱۰۰، فقط از گام‌های تمام‌شده. */
  percent: number;
  /** برچسب اقدام بعدی؛ `null` وقتی کاری نمانده. */
  ctaLabel: string | null;
  /** مسیر `RouteService` برای CTA. */
  ctaHref: string | null;
};

type ProgressInput = {
  role: string;
  approved: boolean;
  docStatus: DocStatus;
};

const STEP_TITLES: Record<OnboardingStepId, string> = {
  complete_docs: 'تکمیل مدارک پروفایل',
  submit_review: 'ارسال برای بررسی',
  await_approval: 'انتظار تأیید',
  unlock_modules: 'باز شدن ماژول‌ها',
};

/**
 * وضعیت مدرک/تأیید را به چک‌لیست اولین ورود نگاشت می‌کند.
 * قرارداد خالص — شاخهٔ وضعیت را در UI تکرار نکنید.
 */
export function getOnboardingProgress(input: ProgressInput): OnboardingProgress {
  const { role, approved, docStatus } = input;
  const profileHref = RouteService.karvita.profile(role);
  const dashboardHref = RouteService.karvita.dashboard();

  if (approved || docStatus === 'approved') {
    return {
      steps: [
        step('complete_docs', 'done'),
        step('submit_review', 'done'),
        step('await_approval', 'done'),
        step('unlock_modules', 'done'),
      ],
      percent: 100,
      ctaLabel: 'رفتن به میز کار',
      ctaHref: dashboardHref,
    };
  }

  if (docStatus === 'pending_admin') {
    return {
      steps: [
        step('complete_docs', 'done'),
        step('submit_review', 'done'),
        step('await_approval', 'current'),
        step('unlock_modules', 'pending'),
      ],
      percent: 50,
      ctaLabel: null,
      ctaHref: null,
    };
  }

  if (docStatus === 'rejected') {
    return {
      steps: [
        step('complete_docs', 'current'),
        step('submit_review', 'pending'),
        step('await_approval', 'failed'),
        step('unlock_modules', 'pending'),
      ],
      percent: 0,
      ctaLabel: 'اصلاح و ارسال مجدد مدارک',
      ctaHref: profileHref,
    };
  }

  // `not_submitted` و هر وضعیت غیرمنتظرهٔ غیرتأیید
  return {
    steps: [
      step('complete_docs', 'current'),
      step('submit_review', 'pending'),
      step('await_approval', 'pending'),
      step('unlock_modules', 'pending'),
    ],
    percent: 0,
    ctaLabel: 'تکمیل مدارک پروفایل',
    ctaHref: profileHref,
  };
}

export function shouldShowOnboardingChecklist(user: {
  role: string;
  approved: boolean;
}): boolean {
  const strategy = getRoleStrategy(user.role);
  if (!strategy.gateModulesUntilApproved) return false;
  return !user.approved;
}

function step(id: OnboardingStepId, state: OnboardingStepState): OnboardingStep {
  return { id, title: STEP_TITLES[id], state };
}
