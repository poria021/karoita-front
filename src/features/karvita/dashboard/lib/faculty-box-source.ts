import type { UserRole } from '@/types/auth';

/**
 * منبع داده و متن باکس‌های «ضعیف‌ترین و قوی‌ترین» و «نرخ پاسخ‌دهی» میز کار.
 * مدیر دانشکده: اساتید دانشکده (`professor-performance`).
 * دانشگاه استانی: دانشکده‌های استان (`faculty-performance`) — همان ردیف‌های گزارش عملکرد دانشکده‌ها.
 */
export type FacultyBoxSource = {
  slug: 'professor-performance' | 'faculty-performance';
  entity: 'professor' | 'faculty';
  /** جمع کوتاه برای aria / اسکلت بارگذاری. */
  noun: string;
  /** عنوان باکس‌های رتبه‌بندی. */
  rankingTitle: string;
  /** برچسب نمودار میله‌ای (بعد از نام تب). */
  chartNoun: string;
  scoreEmpty: string;
  attendanceEmpty: string;
  responseTitle: string;
  responseCaption: string;
};

const PROFESSORS: FacultyBoxSource = {
  slug: 'professor-performance',
  entity: 'professor',
  noun: 'اساتید',
  rankingTitle: 'ضعیف‌ترین و قوی‌ترین اساتید دانشکده',
  chartNoun: 'اساتید دانشکده',
  scoreEmpty: 'هنوز دادهٔ کافی برای رتبه‌بندی اساتید دانشکدهٔ شما نیست.',
  attendanceEmpty: 'هنوز استادی برای دانشکدهٔ شما ثبت نشده است.',
  responseTitle: 'نرخ پاسخ‌دهی اساتید',
  responseCaption: 'توزیع اساتید دانشکده بر اساس پاسخ به گزارش‌ها',
};

const FACULTIES: FacultyBoxSource = {
  slug: 'faculty-performance',
  entity: 'faculty',
  noun: 'دانشکده‌ها',
  rankingTitle: 'ضعیف‌ترین و قوی‌ترین دانشکده‌ها',
  chartNoun: 'دانشکده‌ها',
  scoreEmpty: 'هنوز دادهٔ کافی برای رتبه‌بندی دانشکده‌های شما نیست.',
  attendanceEmpty: 'هنوز دانشکده‌ای برای شما ثبت نشده است.',
  responseTitle: 'نرخ پاسخ‌دهی دانشکده‌ها',
  responseCaption: 'توزیع دانشکده‌ها بر اساس پاسخ به گزارش‌ها',
};

export function facultyBoxSourceFor(role: UserRole): FacultyBoxSource {
  return role === 'provincial_university' ? FACULTIES : PROFESSORS;
}
