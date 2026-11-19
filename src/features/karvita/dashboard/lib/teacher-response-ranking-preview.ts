import type { TeacherResponseRankingSummary } from './teacher-response-ranking';

/**
 * پیش‌نمایش باکس «ضعیف‌ترین و قوی‌ترین معلمان منطقه» با داده‌ی ماکت.
 *
 * - `true` (و فقط در development): `WorkbenchTeacherResponseRankingBox` برای نقش
 *   آموزش و پرورش منطقه به‌جای داده‌ی واقعی از `FAKE_TEACHER_RESPONSE_RANKING` می‌خواند
 *   (مدیر مدرسه همچنان داده‌ی واقعی می‌بیند).
 * - برای برگشت به داده‌ی واقعی این را `false` کنید (یا فایل را پاک کنید).
 * در build تولید (`NODE_ENV === 'production'`) هرگز فعال نمی‌شود.
 */
const FAKE_PREVIEW_SWITCH = true;

export const TEACHER_RESPONSE_RANKING_FAKE_PREVIEW =
  FAKE_PREVIEW_SWITCH && process.env.NODE_ENV !== 'production';

/** `response` = نرخ پاسخ‌دهی (۰ تا ۱۰۰)؛ ضعیف‌ترین‌ها صعودی، قوی‌ترین‌ها نزولی. */
export const FAKE_TEACHER_RESPONSE_RANKING: TeacherResponseRankingSummary = {
  weakest: [
    { id: 'fake-teacher-w1', rank: 1, name: 'مریم حسینی', learnerCount: 14, response: 18 },
    { id: 'fake-teacher-w2', rank: 2, name: 'علی رضایی', learnerCount: 9, response: 27 },
    { id: 'fake-teacher-w3', rank: 3, name: 'زهرا کریمی', learnerCount: 12, response: 35 },
    { id: 'fake-teacher-w4', rank: 4, name: 'محمدرضا احمدی', learnerCount: 7, response: 41 },
    { id: 'fake-teacher-w5', rank: 5, name: 'فاطمه نوری', learnerCount: 11, response: 48 },
    { id: 'fake-teacher-w6', rank: 6, name: 'جواد اکبری', learnerCount: 10, response: 52 },
  ],
  strongest: [
    { id: 'fake-teacher-s1', rank: 1, name: 'سارا محمدی', learnerCount: 16, response: 100 },
    { id: 'fake-teacher-s2', rank: 2, name: 'امیر جعفری', learnerCount: 10, response: 97 },
    { id: 'fake-teacher-s3', rank: 3, name: 'نرگس صادقی', learnerCount: 13, response: 94 },
    { id: 'fake-teacher-s4', rank: 4, name: 'حسین قاسمی', learnerCount: 8, response: 91 },
    { id: 'fake-teacher-s5', rank: 5, name: 'الهام موسوی', learnerCount: 15, response: 88 },
    { id: 'fake-teacher-s6', rank: 6, name: 'پریسا کاظمی', learnerCount: 12, response: 85 },
  ],
};
