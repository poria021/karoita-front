import type { NestCreateWeekDto, NestLessonWeek, NestUpdateWeekDto } from '@/types/nest-admin';
import type { SyllabusWeek } from '@/types/syllabus-config';

import { isNestObjectId, nestEntityId } from './nest-raw-parsers';
import { nestPriorityFromWeight } from './week-priority';

export type NestWeekWritePlan = {
  creates: NestCreateWeekDto[];
  updates: Array<{ id: string; body: NestUpdateWeekDto }>;
  /** هفته‌ای که از ادیتور حذف شده — `DELETE /admin/weeks/{id}`. */
  deletions: string[];
};

function remoteIsActive(week: NestLessonWeek): boolean {
  return week.status !== false;
}

function patchBody(
  lessonId: string,
  priority: number,
  status: boolean
): NestUpdateWeekDto {
  return { lessonId, priority, status };
}

/**
 * پیکربندی اول (GET خالی): فقط `POST`.
 * بعد از ثبت، GET هفته دارد: هفته‌های محلی جدید هم `POST` می‌شوند (افزودن مجاز است)،
 * ولی هفته‌های ثبت‌شده حذف نمی‌شوند — فقط `PATCH` (بایگانی/بازیابی) روی آن‌ها اعمال می‌شود.
 */
export function planNestWeekWrites(
  lessonId: string,
  weeks: SyllabusWeek[],
  remote: NestLessonWeek[]
): NestWeekWritePlan {
  const remoteById = new Map(
    remote
      .map((week) => [nestEntityId(week), week] as const)
      .filter(([id]) => Boolean(id))
  );
  const used = new Set<string>();
  const creates: NestCreateWeekDto[] = [];
  const updates: Array<{ id: string; body: NestUpdateWeekDto }> = [];
  const deletions: string[] = [];

  function queueUpdate(
    id: string,
    priority: number,
    status: boolean
  ) {
    used.add(id);
    const current = remoteById.get(id);
    if (
      current &&
      (current.priority ?? 0) === priority &&
      remoteIsActive(current) === status
    ) {
      return;
    }
    updates.push({ id, body: patchBody(lessonId, priority, status) });
  }

  weeks.forEach((week, index) => {
    const priority = nestPriorityFromWeight(week.weight);
    const status = week.status === 'active';
    if (isNestObjectId(week.id) && remoteById.has(week.id)) {
      queueUpdate(week.id, priority, status);
      return;
    }

    const remoteAtIndexId = nestEntityId(remote[index] ?? {});
    if (remoteAtIndexId && !used.has(remoteAtIndexId)) {
      queueUpdate(remoteAtIndexId, priority, status);
      return;
    }

    if (isNestObjectId(week.id)) {
      queueUpdate(week.id, priority, status);
      return;
    }

    creates.push({ lessonId, priority, status });
  });

  for (const [id] of remoteById) {
    if (used.has(id)) continue;
    deletions.push(id);
  }

  if (remote.length > 0) {
    return { creates, updates, deletions: [] };
  }

  return { creates, updates, deletions };
}
