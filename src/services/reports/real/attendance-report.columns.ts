/**
 * ستون‌های «حضور و غیاب» در حالت real (Nest).
 * ماکت ستون‌های دیگری دارد (استاد/معلم راهنما، ...)؛ اینجا فقط فیلدهایی که API می‌دهد.
 */
import type { ReportColumnDef, ReportPeriodMode } from '@/types/reports';

/**
 * هر ردیف یک فراگیر است. ترتیب: نام (تلفن زیرش)، استان، دانشکده (رشته تحصیلی
 * کم‌رنگ‌تر زیرش)، مدرسه (با منطقه)، درس‌ها (اولین درس + شمارندهٔ بقیه) و
 * درصد حضور تاییدشده نسبت به کل جلسات.
 */
export const LEARNERS_ATTENDANCE_COLUMNS: ReportColumnDef[] = [
  {
    id: 'name',
    title: 'نام',
    kind: 'two-line',
    sortKey: 'name',
    secondaryKey: 'phone',
  },
  { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
  {
    id: 'faculty',
    title: 'دانشکده',
    kind: 'two-line',
    sortKey: 'facName',
    secondaryKey: 'major',
  },
  {
    id: 'school',
    title: 'مدرسه',
    kind: 'two-line',
    sortKey: 'schoolName',
    secondaryKey: 'regionName',
  },
  { id: 'course', title: 'درس‌ها', kind: 'courses', nosort: true },
  { id: 'att', title: 'درصد حضور', kind: 'percent', sortKey: 'att' },
];

/** ستون‌های حضور فراگیران؛ عنوان ستون شناسه به نظام دوره بستگی دارد. */
export function getLearnersAttendanceColumns(
  mode: ReportPeriodMode = 'term'
): ReportColumnDef[] {
  void mode; // ستون‌ها به نظام دوره بستگی ندارند.
  return LEARNERS_ATTENDANCE_COLUMNS;
}

/**
 * هر ردیف یک استاد است. سه عدد جدا نشان داده می‌شود و یکی نیستند:
 * - `att`      ← attendancePercent: هم استاد حاضر بوده هم مدیر مدرسه تایید کرده
 * - `attProf`  ← professorConfirmedRate: استاد حضور خودش را زده
 * - `attMgr`   ← attendanceRate: مدیر مدرسه حضور استاد را تایید کرده
 */
export const PROFESSORS_ATTENDANCE_COLUMNS: ReportColumnDef[] = [
  { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
  { id: 'code', title: 'کد استادی', kind: 'text', sortKey: 'code' },
  { id: 'fac', title: 'دانشکده', kind: 'text', sortKey: 'facName' },
  { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
  { id: 'city', title: 'شهر', kind: 'text', sortKey: 'cityName' },
  {
    id: 'att',
    title: 'درصد حضور (تاییدشده توسط استاد و مدیر)',
    kind: 'percent',
    sortKey: 'att',
  },
  {
    id: 'attProf',
    title: 'نرخ حضور ثبت‌شده توسط استاد',
    kind: 'percent',
    sortKey: 'attProf',
  },
  {
    id: 'attMgr',
    title: 'نرخ حضور تاییدشده توسط مدیر مدرسه',
    kind: 'percent',
    sortKey: 'attMgr',
  },
];
