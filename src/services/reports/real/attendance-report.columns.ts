/**
 * ستون‌های «حضور و غیاب» در حالت real (Nest).
 * ماکت ستون‌های دیگری دارد (استاد/معلم راهنما، ...)؛ اینجا فقط فیلدهایی که API می‌دهد.
 */
import type { ReportColumnDef } from '@/types/reports';

/**
 * هر ردیف یک فراگیر است: نام، موبایل، مقطع، اولین درس (+شمارندهٔ بقیه)،
 * دانشکده، استان، مدرسه (با منطقه) و درصد حضور تاییدشده نسبت به کل جلسات.
 */
export const LEARNERS_ATTENDANCE_COLUMNS: ReportColumnDef[] = [
  { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
  { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
  { id: 'major', title: 'مقطع', kind: 'text', sortKey: 'major' },
  { id: 'course', title: 'درس', kind: 'courses', nosort: true },
  { id: 'faculty', title: 'دانشکده', kind: 'text', sortKey: 'facName' },
  { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
  {
    id: 'school',
    title: 'مدرسه',
    kind: 'two-line',
    sortKey: 'schoolName',
    secondaryKey: 'regionName',
  },
  { id: 'att', title: 'درصد حضور', kind: 'percent', sortKey: 'att' },
];

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
