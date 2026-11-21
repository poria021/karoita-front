import type {
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityKind,
} from '@/types/organizational-capacities';

import {
  computeFillRatio,
  fillToneForRatio,
  kindLabel,
  type CapacityFillTone,
} from './capacity-status';

export type CourseCapacityRow = {
  id: string;
  title: string;
  kind: OrganizationalCapacityKind;
  kindLabel: string;
  /** `null` = سقف نامحدود. */
  total: number | null;
  confirmed: number;
  /** ۰ تا ۱؛ برای نامحدود/سقف صفر null. */
  fillRatio: number | null;
  tone: CapacityFillTone;
};

/**
 * ردیف ظرفیت هر درس از snapshot ترم جاری (ترمی و پودمانی).
 * درس‌های غیرفعالِ این ترم و درس‌های بدون سقف (۰) حذف می‌شوند.
 */
export function buildCourseCapacityRows(
  snapshots: readonly OrganizationalCapacitiesSnapshot[]
): CourseCapacityRow[] {
  return snapshots.flatMap((snapshot) =>
    snapshot.courses
      .filter(
        (course) =>
          course.isActive !== false &&
          (course.total === null || course.total > 0)
      )
      .map<CourseCapacityRow>((course) => {
        const fillRatio = computeFillRatio(
          course.total ?? 'unlimited',
          course.confirmed
        );
        return {
          id: `${snapshot.kind}:${course.id}`,
          title: course.title,
          kind: snapshot.kind,
          kindLabel: kindLabel(snapshot.kind),
          total: course.total,
          confirmed: course.confirmed,
          fillRatio,
          tone: fillToneForRatio(fillRatio),
        };
      })
  );
}
