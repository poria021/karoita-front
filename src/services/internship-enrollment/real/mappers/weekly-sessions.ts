import type {
  InternshipProgressiveGrade,
  InternshipWeeklyReportFeedback,
  InternshipWeeklySession,
  InternshipWeeklySessionState,
} from '@/types/internship-enrollment';
import type {
  NestScoreSummary,
  NestStudentWeek,
} from '@/types/nest-student-enrollments';

import type { WeekStudentSubmissionPreview } from './week-feedback';

export function studentWeekId(week: NestStudentWeek): string {
  return week.id ?? week._id ?? '';
}

/**
 * شناسهٔ *تعریفِ* هفته در سرفصل (`week.weekId.id`) — نه شناسهٔ رکورد هفتهٔ
 * دانشجو (`week.id`، خروجیِ `studentWeekId`). لایو تأیید شد: `NestConversation.weekId`
 * با همین شناسه پر می‌شود، نه با `studentWeekId` — قبلاً این دو با هم اشتباه
 * گرفته می‌شدند و `findWeekConversationId` هیچ‌وقت گفتگوی درست را پیدا نمی‌کرد
 * (همیشه می‌افتاد روی fallback گفتگوی `general`، پس همهٔ هفته‌ها روی یک گفتگوی
 * مشترک می‌خواندند/می‌نوشتند). ببین `findWeekConversationId`.
 */
export function weekTemplateId(week: NestStudentWeek): string | null {
  const raw = week.weekId;
  if (!raw) return null;
  if (typeof raw === 'string') return raw || null;
  return raw.id ?? raw._id ?? null;
}

/**
 * رنگ/وضعیت کارت از چهار فیلد صریح `mentorStatus`/`teacherStatus`/
 * `schoolAdminStatus`/`studentStatus` (هرکدام `'send'` یا `null`) به‌همراه
 * `status` کلی هفته مشتق می‌شود. اولویت همیشه با استاد راهنماست
 * (`mentorStatus`, نقش `supervisor_professor`) — حتی اگر معلم راهنما
 * (`teacherStatus`, نقش `mentor_teacher`) قبلاً تایید کرده باشد، اقدام استاد
 * رنگ نهایی کارت را تعیین می‌کند:
 * ۱. `mentorStatus === 'send'` → `needs_edit` اگر هفته هنوز `in_progress`ست
 *    (استاد خواسته دانشجو ویرایش کند)، یا `graded` اگر `completed`ست (نمرهٔ
 *    نهایی ثبت شده).
 * ۲. وگرنه `teacherStatus === 'send'` → `approved` («تایید معلم»).
 * ۳. وگرنه `studentStatus === 'send'` → `pending` (گزارش ارسال شده، منتظر بررسی).
 * ۴. وگرنه `draft` (هنوز هیچ اقدامی نشده).
 */
export function mapWeekStatus(week: NestStudentWeek): InternshipWeeklySessionState {
  if (week.mentorStatus === 'send') {
    return week.status === 'completed' ? 'graded' : 'needs_edit';
  }
  if (week.teacherStatus === 'send') return 'approved';
  if (week.studentStatus === 'send') return 'pending';
  return 'draft';
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
  latestSubmissionByWeekId: ReadonlyMap<string, WeekStudentSubmissionPreview>,
  feedbackByWeekId: ReadonlyMap<string, InternshipWeeklyReportFeedback> = new Map()
): InternshipWeeklySession[] {
  return weeks.map((week, index) => {
    const id = studentWeekId(week);
    const latest = latestSubmissionByWeekId.get(id);
    const feedback = feedbackByWeekId.get(id);
    const completed = week.status === 'completed';
    return {
      id,
      title: `هفته ${index + 1}`,
      status: mapWeekStatus(week),
      score: completed && typeof week.score === 'number' ? week.score : null,
      text: latest?.text ?? '',
      files: latest?.files ?? [],
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
