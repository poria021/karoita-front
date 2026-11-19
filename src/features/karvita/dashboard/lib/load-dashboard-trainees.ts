import {
  DAILY_APPROVALS_PAGE_SIZE,
  DailyApprovalsService,
} from '@/services/daily-approvals.service';
import type {
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
} from '@/types/daily-approvals';

/** سقف صفحات برای میز کار تا حلقه بی‌نهایت نشود (۱۰ × ۲۰ = ۲۰۰ فراگیر در هر مسیر). */
const MAX_DASHBOARD_PAGES = 10;

const DASHBOARD_KINDS = [
  'internship',
  'apprenticeship',
] as const satisfies readonly DailyApprovalCourseKind[];

type KindTrainees = {
  trainees: DailyApprovalTrainee[];
  truncated: boolean;
};

/** فراگیران ترم باز هر دو مسیر — منبع مشترک باکس‌های شمار و میانگین نمرهٔ میز کار. */
export type DashboardTraineesSnapshot = KindTrainees;

async function loadKindTrainees(
  kind: DailyApprovalCourseKind
): Promise<KindTrainees> {
  const terms = await DailyApprovalsService.listTerms(kind);
  const term = terms.find((item) => item.ended === false) ?? terms[0];
  if (!term) return { trainees: [], truncated: false };

  const trainees: DailyApprovalTrainee[] = [];
  let offset = 0;
  let truncated = false;

  for (let page = 0; page < MAX_DASHBOARD_PAGES; page += 1) {
    const result = await DailyApprovalsService.listPage({
      kind,
      query: '',
      readFilter: 'all',
      course: 'all',
      termId: term.id,
      offset,
      limit: DAILY_APPROVALS_PAGE_SIZE,
    });
    trainees.push(...result.items);
    if (!result.hasMore || result.items.length === 0) break;
    offset += result.items.length;
    if (page === MAX_DASHBOARD_PAGES - 1) truncated = true;
  }

  return { trainees, truncated };
}

/**
 * فراگیران (کارورزی + کارآموزی) ترم باز — همان منبع داده‌ی لیست ارزیابی روزانه،
 * بدون API جدید؛ محدوده‌ی هر نقش را خود سرویس تعیین می‌کند (فراگیران همان
 * استاد / معلم / مدرسه). شمار فراگیران و میانگین نمرهٔ دروس هر دو از همین
 * یک بارگذاری ساخته می‌شوند.
 */
export async function loadDashboardTrainees(): Promise<DashboardTraineesSnapshot> {
  const parts = await Promise.all(DASHBOARD_KINDS.map(loadKindTrainees));
  return {
    trainees: parts.flatMap((part) => part.trainees),
    truncated: parts.some((part) => part.truncated),
  };
}
