import type {
  NestBulkCreateOriginalLessonDto,
  NestOriginalLesson,
  NestUpdateOriginalLessonDto,
  OriginalLessonType,
} from '@/types/nest-original-lessons';
import type {
  AcademicTermType,
  CourseDefinition,
  UpsertCourseDefinitionInput,
} from '@/types/syllabus-config';

/**
 * Nest هر زیرمجموعه را یک ردیف تخت (`mainTitle` + `lessonTitle`) نگه می‌دارد؛
 * UI یک «درس» با آرایهٔ `subModules` می‌خواهد. شناسهٔ گروه سمت سرور وجود ندارد،
 * پس از `type + mainTitle` ساخته می‌شود.
 */

const GROUP_ID_SEPARATOR = '::';

export function audienceToNestType(audience: AcademicTermType): OriginalLessonType {
  return audience === 'modular' ? 'podmani' : 'semester';
}

function nestTypeToAudience(type: string): AcademicTermType | null {
  if (type === 'semester') return 'semester';
  if (type === 'podmani') return 'modular';
  return null;
}

export function courseGroupId(type: OriginalLessonType, mainTitle: string): string {
  return `${type}${GROUP_ID_SEPARATOR}${mainTitle.trim()}`;
}

/**
 * ردیف‌های تخت را به درس + زیرمجموعه گروه می‌کند.
 * گروهی با یک ردیف که `lessonTitle` آن با `mainTitle` برابر است، درسِ بدون زیرمجموعه حساب می‌شود
 * (همان شکلی که `toNestBulkCreateBody` برای درس مستقل می‌نویسد).
 * درس وقتی بایگانی است که هیچ ردیف `active` نداشته باشد.
 */
export function groupOriginalLessons(
  rows: readonly NestOriginalLesson[]
): CourseDefinition[] {
  const groups = new Map<string, { audience: AcademicTermType; title: string; rows: NestOriginalLesson[] }>();

  for (const row of rows) {
    const audience = nestTypeToAudience(row.type);
    if (!audience) continue;
    const id = courseGroupId(row.type, row.mainTitle);
    const group = groups.get(id);
    if (group) {
      group.rows.push(row);
    } else {
      groups.set(id, { audience, title: row.mainTitle.trim(), rows: [row] });
    }
  }

  return [...groups.entries()].map(([id, group]) => {
    const standalone =
      group.rows.length === 1 &&
      group.rows[0]!.lessonTitle.trim() === group.title;
    return {
      id,
      title: group.title,
      audience: group.audience,
      isActive: group.rows.some((row) => row.status === 'active'),
      subModules: standalone
        ? []
        : group.rows.map((row) => ({ id: row.id, title: row.lessonTitle.trim() })),
    };
  });
}

/** درس بدون زیرمجموعه = یک ردیف با `lessonTitle` برابر `mainTitle`. */
export function toNestBulkCreateBody(
  input: UpsertCourseDefinitionInput
): NestBulkCreateOriginalLessonDto {
  const mainTitle = input.title.trim();
  const lessonTitles =
    input.subModules.length > 0
      ? input.subModules.map((sub) => sub.title.trim())
      : [mainTitle];
  return {
    type: audienceToNestType(input.audience),
    data: [
      {
        mainTitle,
        lessons: lessonTitles.map((lessonTitle) => ({ lessonTitle })),
      },
    ],
  };
}

export type CourseWritePlan = {
  patches: Array<{ id: string; body: NestUpdateOriginalLessonDto }>;
  create: NestBulkCreateOriginalLessonDto | null;
  /** `POST` ردیف را active می‌سازد؛ برای درس بایگانی باید بعد از ساخت deactive شود. */
  deactivateCreated: boolean;
  deleteIds: string[];
};

/**
 * تفاوت ردیف‌های فعلیِ یک درس با فرم را به PATCH / POST / DELETE تبدیل می‌کند.
 * زیرمجموعه‌ای که `id` ردیف موجود را دارد PATCH می‌شود (فقط فیلدهای تغییرکرده)،
 * بدون `id` ردیف تازه است، و ردیفی که در فرم نیست حذف می‌شود.
 * درس بدون زیرمجموعه روی ردیف اولِ موجود می‌نشیند تا حذف و ساخت دوباره لازم نشود.
 */
export function planCourseUpdate(
  rows: readonly NestOriginalLesson[],
  input: UpsertCourseDefinitionInput
): CourseWritePlan {
  const mainTitle = input.title.trim();
  const type = audienceToNestType(input.audience);
  const status = input.isActive ? 'active' : 'deactive';

  const desired =
    input.subModules.length > 0
      ? input.subModules.map((sub) => ({ id: sub.id, lessonTitle: sub.title.trim() }))
      : [{ id: rows[0]?.id, lessonTitle: mainTitle }];

  const byId = new Map(rows.map((row) => [row.id, row]));
  const kept = new Set<string>();
  const patches: CourseWritePlan['patches'] = [];
  const newLessons: Array<{ lessonTitle: string }> = [];

  for (const item of desired) {
    const current = item.id ? byId.get(item.id) : undefined;
    if (!current || kept.has(current.id)) {
      newLessons.push({ lessonTitle: item.lessonTitle });
      continue;
    }
    kept.add(current.id);
    const body: NestUpdateOriginalLessonDto = {};
    if (current.mainTitle.trim() !== mainTitle) body.mainTitle = mainTitle;
    if (current.lessonTitle.trim() !== item.lessonTitle) body.lessonTitle = item.lessonTitle;
    if (current.type !== type) body.type = type;
    if (current.status !== status) body.status = status;
    if (Object.keys(body).length > 0) patches.push({ id: current.id, body });
  }

  return {
    patches,
    create:
      newLessons.length > 0
        ? { type, data: [{ mainTitle, lessons: newLessons }] }
        : null,
    deactivateCreated: !input.isActive && newLessons.length > 0,
    deleteIds: rows.filter((row) => !kept.has(row.id)).map((row) => row.id),
  };
}
