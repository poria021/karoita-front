import type {
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityCourse,
  OrganizationalCapacityKind,
} from '@/types/organizational-capacities';

/**
 * پیش‌نمایش باکس «ظرفیت دروس» با داده‌ی ماکت.
 *
 * - `true` (و فقط در development): `WorkbenchCourseCapacitiesBox` به‌جای داده‌ی واقعی
 *   از `FAKE_COURSE_CAPACITY_SNAPSHOTS` می‌خواند.
 * - برای برگشت به داده‌ی واقعی این را `false` کنید (یا فایل را پاک کنید).
 * در build تولید (`NODE_ENV === 'production'`) هرگز فعال نمی‌شود.
 */
const FAKE_PREVIEW_SWITCH = true;

export const COURSE_CAPACITIES_FAKE_PREVIEW =
  FAKE_PREVIEW_SWITCH && process.env.NODE_ENV !== 'production';

function course(
  id: string,
  title: string,
  kind: OrganizationalCapacityKind,
  total: number | null,
  confirmed: number
): OrganizationalCapacityCourse {
  return { id, title, kind, total, confirmed, selectedDays: [], isActive: true };
}

function snapshot(
  kind: OrganizationalCapacityKind,
  courses: OrganizationalCapacityCourse[]
): OrganizationalCapacitiesSnapshot {
  return {
    termId: 'fake-term',
    termTitle: 'ترم ماکت',
    kind,
    maxCapacity: 30,
    status: 'approved',
    courses,
    summary: { total: 0, confirmed: 0, remaining: 0 },
    terms: [],
  };
}

export const FAKE_COURSE_CAPACITY_SNAPSHOTS: OrganizationalCapacitiesSnapshot[] =
  [
    snapshot('internship', [
      course('i1', 'کارورزی ۱', 'internship', 12, 3),
      course('i2', 'کارورزی ۲', 'internship', 12, 9),
      course('i3', 'کارورزی ۳', 'internship', 12, 12),
      course('i4', 'کارورزی ۴', 'internship', 20, 0),
    ]),
    snapshot('apprenticeship', [
      course('a1', 'کارآموزی ۱', 'apprenticeship', 15, 11),
      course('a2', 'کارآموزی ۲', 'apprenticeship', null, 6),
    ]),
  ];
