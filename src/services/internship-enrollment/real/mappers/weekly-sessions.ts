import type {
  InternshipProgressiveGrade,
  InternshipWeeklyReportFeedback,
  InternshipWeeklyReportFile,
  InternshipWeeklySession,
  InternshipWeeklySessionState,
} from '@/types/internship-enrollment';
import type {
  NestScoreSummary,
  NestStudentWeek,
  NestStudentWeekSubmission,
} from '@/types/nest-student-enrollments';

import { isRecord } from './primitives';

export function studentWeekId(week: NestStudentWeek): string {
  return week.id ?? week._id ?? '';
}

/**
 * Swagger enum کامل `status` هفته را مستند نکرده (نمونه‌های دیده‌شده صرفاً
 * `pending`/`in_progress`)؛ به‌جای اتکا به این رشته، وضعیت UI را از
 * `score`/`submittedAt`/بازخورد استاد استخراج می‌کنیم — این فیلدها همیشه معنای
 * ثابتی دارند.
 *
 * هفته‌ای که هنوز `startedAt` ندارد را «قفلِ آینده» نمی‌گیریم — هیچ فیلدی از Nest
 * مشخص نمی‌کند کدام هفته الان باز است، و خودِ `PATCH .../start` وقتی زود باشد
 * با خطای روشن («Classes have not started yet») رد می‌شود؛ پس هفته را باز/قابل‌کلیک
 * نشان می‌دهیم و تصمیم نهایی را به همان خطای بک‌اند می‌سپاریم.
 *
 * `needs_edit`: طبق سناریوی محصول، استاد راهنما یا نمره ثبت می‌کند (`graded`) یا
 * بازخورد متنی می‌دهد — این دو عمل متقابلاً منحصرند، یعنی وجود بازخورد استاد
 * بدون نمره یعنی گزارش رد شده و دانشجو باید دوباره ارسال کند. `needsEdit` را
 * فراخوان از قبل با مقایسهٔ زمانِ آخرین پیام استاد و آخرین ارسال دانشجو محاسبه
 * می‌کند (ببین `mapRealWeeklySessions`) — وگرنه بعد از اولین بازخورد، هفته تا
 * ابد `needs_edit` می‌ماند حتی اگر دانشجو دوباره گزارش داده باشد.
 */
export function mapWeekStatus(
  week: NestStudentWeek,
  needsEdit = false
): InternshipWeeklySessionState {
  if (week.score !== null && week.score !== undefined) return 'graded';
  if (needsEdit) return 'needs_edit';
  if (week.submittedAt) return 'pending';
  return 'draft';
}

export function mapSubmissionFiles(
  submission: NestStudentWeekSubmission | undefined
): InternshipWeeklyReportFile[] {
  const raw = submission?.files;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): InternshipWeeklyReportFile | null => {
      if (!isRecord(item)) return null;
      const id =
        typeof item.id === 'string'
          ? item.id
          : typeof item._id === 'string'
            ? item._id
            : '';
      if (!id) return null;
      const name =
        typeof item.name === 'string'
          ? item.name
          : typeof item.filename === 'string'
            ? item.filename
            : '';
      const sizeBytes = typeof item.size === 'number' ? item.size : null;
      const sizeMb =
        typeof item.sizeMb === 'number'
          ? item.sizeMb
          : sizeBytes !== null
            ? sizeBytes / (1024 * 1024)
            : 0;
      return { id, name, sizeMb };
    })
    .filter((item): item is InternshipWeeklyReportFile => item !== null);
}

/**
 * GET `/student-enrollments/{id}/weeks` → کارت‌های تایم‌لاین گزارش هفتگی.
 * متن/فایل هر هفته از آخرین submission همان `student-week` پر می‌شود.
 *
 * شماره‌گذاری از موقعیت آرایه است، نه `weekId.priority` — روی دیتای واقعی دیده شد
 * که `priority` برای همهٔ هفته‌های یک درس یکسان می‌آید (فیلد دیگری‌ست، شمارهٔ هفته
 * نیست)؛ ترتیب برگشتی خودِ Nest (بر اساس زمان ایجاد) منبع درستِ شماره‌گذاریه، و همین
 * شماره باید با اندیس کارت تو `InternshipWeeklyGrid` یکی بماند.
 */
export function mapRealWeeklySessions(
  weeks: readonly NestStudentWeek[],
  latestSubmissionByWeekId: ReadonlyMap<string, NestStudentWeekSubmission>,
  feedbackByWeekId: ReadonlyMap<string, InternshipWeeklyReportFeedback> = new Map()
): InternshipWeeklySession[] {
  return weeks.map((week, index) => {
    const id = studentWeekId(week);
    const latest = latestSubmissionByWeekId.get(id);
    const feedback = feedbackByWeekId.get(id);
    const advisorMessageAt = feedback?.advisorAt ?? null;
    // پیام استاد فقط تا وقتی «رد» حساب می‌شود که دانشجو از آن موقع دوباره
    // ارسال نکرده باشد — وگرنه بعد از اصلاح، هفته اشتباهاً needs_edit می‌ماند.
    const needsEdit = Boolean(
      advisorMessageAt && (!latest?.createdAt || advisorMessageAt > latest.createdAt)
    );
    return {
      id,
      title: `هفته ${index + 1}`,
      status: mapWeekStatus(week, needsEdit),
      score: typeof week.score === 'number' ? week.score : null,
      text: latest?.text ?? '',
      files: mapSubmissionFiles(latest),
      reportSubmittedAt: latest?.createdAt ?? null,
      feedback,
    };
  });
}

/** GET `/student-enrollments/{id}/score-summary` → نمرهٔ تجمیعی از ۲۰. */
export function mapRealProgressiveGrade(
  summary: NestScoreSummary | null
): InternshipProgressiveGrade {
  if (!summary || summary.maximumScore <= 0 || summary.scoredWeeks <= 0) {
    return { gradedCount: summary?.scoredWeeks ?? 0, final20: null };
  }
  const final20 = Math.round((summary.totalScore / summary.maximumScore) * 20 * 100) / 100;
  return { gradedCount: summary.scoredWeeks, final20 };
}
