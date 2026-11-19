import type { StudentGradeRankingSummary } from './student-grade-ranking';

/**
 * پیش‌نمایش باکس «برترین و ضعیف‌ترین فراگیران» با داده‌ی ماکت.
 *
 * - `true` (و فقط در development): `WorkbenchStudentGradeRankingBox` به‌جای داده‌ی واقعی
 *   از `FAKE_STUDENT_GRADE_RANKING` می‌خواند.
 * - برای برگشت به داده‌ی واقعی این را `false` کنید (یا فایل را پاک کنید).
 * در build تولید (`NODE_ENV === 'production'`) هرگز فعال نمی‌شود.
 */
const FAKE_PREVIEW_SWITCH = true;

export const STUDENT_GRADE_RANKING_FAKE_PREVIEW =
  FAKE_PREVIEW_SWITCH && process.env.NODE_ENV !== 'production';

export const FAKE_STUDENT_GRADE_RANKING: StudentGradeRankingSummary = {
  weakest: [
    {
      id: 'fw1',
      traineeName: 'مریم حسینی',
      courseTitle: 'کارورزی ۳',
      courseKey: 'intern3',
      kind: 'internship',
      grade: 8.5,
    },
    {
      id: 'fw2',
      traineeName: 'علی رضایی',
      courseTitle: 'کارآموزی ۲',
      courseKey: 'appr2',
      kind: 'apprenticeship',
      grade: 9.75,
    },
    {
      id: 'fw3',
      traineeName: 'زهرا کریمی',
      courseTitle: 'کارورزی ۲',
      courseKey: 'intern2',
      kind: 'internship',
      grade: 10.5,
    },
    {
      id: 'fw4',
      traineeName: 'محمدرضا احمدی',
      courseTitle: 'کارورزی ۱',
      courseKey: 'intern1',
      kind: 'internship',
      grade: 11,
    },
    {
      id: 'fw5',
      traineeName: 'فاطمه نوری',
      courseTitle: 'کارآموزی ۱',
      courseKey: 'appr1',
      kind: 'apprenticeship',
      grade: 11.5,
    },
    {
      id: 'fw6',
      traineeName: 'جواد اکبری',
      courseTitle: 'کارورزی ۳',
      courseKey: 'intern3',
      kind: 'internship',
      grade: 12,
    },
  ],
  strongest: [
    {
      id: 'fs1',
      traineeName: 'سارا محمدی',
      courseTitle: 'کارورزی ۴',
      courseKey: 'intern4',
      kind: 'internship',
      grade: 20,
    },
    {
      id: 'fs2',
      traineeName: 'امیر جعفری',
      courseTitle: 'کارآموزی ۱',
      courseKey: 'appr1',
      kind: 'apprenticeship',
      grade: 19.5,
    },
    {
      id: 'fs3',
      traineeName: 'نرگس صادقی',
      courseTitle: 'کارورزی ۱',
      courseKey: 'intern1',
      kind: 'internship',
      grade: 19,
    },
    {
      id: 'fs4',
      traineeName: 'حسین قاسمی',
      courseTitle: 'کارورزی ۲',
      courseKey: 'intern2',
      kind: 'internship',
      grade: 18.25,
    },
    {
      id: 'fs5',
      traineeName: 'الهام موسوی',
      courseTitle: 'کارآموزی ۲',
      courseKey: 'appr2',
      kind: 'apprenticeship',
      grade: 18,
    },
    {
      id: 'fs6',
      traineeName: 'پریسا کاظمی',
      courseTitle: 'کارورزی ۳',
      courseKey: 'intern3',
      kind: 'internship',
      grade: 17.5,
    },
  ],
};
