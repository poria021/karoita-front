import type { OrganizationalCapacityCourse } from '@/types/organizational-capacities';
import { summarizeCapacityCourses } from '@/utils/organizational-capacity-math';

/** درس مستقل یک ردیف است؛ زیرمجموعه‌های یک درس زیر یک سرگروه کشویی جمع می‌شوند. */
export type CapacitySegment =
  | { kind: 'single'; course: OrganizationalCapacityCourse; index: number }
  | {
      kind: 'group';
      groupId: string;
      title: string;
      items: Array<{ course: OrganizationalCapacityCourse; index: number }>;
      summary: ReturnType<typeof summarizeCapacityCourses>;
    };

/** `index` شمارهٔ تخت ردیف است تا ستون شماره بین گروه‌ها پیوسته بماند. */
export function groupCapacityCourses(
  courses: readonly OrganizationalCapacityCourse[]
): CapacitySegment[] {
  const segments: CapacitySegment[] = [];
  const groups = new Map<string, Extract<CapacitySegment, { kind: 'group' }>>();

  courses.forEach((course, index) => {
    if (!course.groupId) {
      segments.push({ kind: 'single', course, index });
      return;
    }
    let group = groups.get(course.groupId);
    if (!group) {
      group = {
        kind: 'group',
        groupId: course.groupId,
        title: course.groupTitle ?? '',
        items: [],
        summary: summarizeCapacityCourses([]),
      };
      groups.set(course.groupId, group);
      segments.push(group);
    }
    group.items.push({ course, index });
  });

  for (const group of groups.values()) {
    group.summary = summarizeCapacityCourses(group.items.map((row) => row.course));
  }
  return segments;
}
