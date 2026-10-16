import { ApiClientError } from '@/services/api-error';
import { mapMentorLessonFileRecord } from '@/services/course-materials/real/mentor-lesson-file-mappers';
import {
  COURSE_MATERIAL_REAL_MAX_BYTES,
  validateCourseMaterialInput,
} from '@/services/course-materials/course-material-rules';
import { FilesService } from '@/services/files.service';
import { mentorLessonFilesApi } from '@/services/mentor-lesson-files.api';
import { requireNestTransport } from '@/services/require-nest-transport';
import { useUserStore } from '@/store/useUserStore';
import type {
  CourseMaterial,
  PublishCourseMaterialInput,
} from '@/types/course-materials';
import type { InternshipCourseKind } from '@/types/internship-enrollment';
import type { NestMentorLessonFile } from '@/types/nest-mentor-lesson-files';

/**
 * جزوه/فایل درس روی `/v1/mentor-lesson-files`. در real، `courseKey` همان
 * `lessonId` ارائهٔ ترم است (فیلتر درس صفحهٔ ارزیابی و `state.lessonId` دانشجو).
 * Nest عنوان جدا ندارد — عنوان ردیف نام فایل است، مثل فرم.
 */

/** Swagger: هر دو GET آرایهٔ ساده برمی‌گردانند؛ هر شکل دیگر خطای قرارداد است. */
function asRecords(raw: unknown): NestMentorLessonFile[] {
  if (!Array.isArray(raw)) {
    throw new Error('پاسخ فایل‌های درس از سرور نامعتبر است.');
  }
  return raw as NestMentorLessonFile[];
}

function newestFirst(rows: CourseMaterial[]): CourseMaterial[] {
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listRealReceivedCourseMaterials(
  kind: InternshipCourseKind,
  courseKey: string
): Promise<CourseMaterial[]> {
  requireNestTransport('CourseMaterialsService.listReceived');
  if (!courseKey) return [];

  let raw: unknown;
  try {
    raw = await mentorLessonFilesApi.listForStudent(courseKey);
  } catch (error) {
    // وقتی استاد هنوز چیزی بارگذاری نکرده، بک‌اند ۴۰۴ می‌دهد — خطا نیست،
    // یعنی لیست خالی (UI حالت «خالی» را نشان می‌دهد، نه خطا + تلاش دوباره).
    if (error instanceof ApiClientError && error.status === 404) return [];
    throw error;
  }

  return newestFirst(
    asRecords(raw).flatMap((record) =>
      mapMentorLessonFileRecord(record, { kind }).map((row) => ({
        ...row,
        courseKey: row.courseKey || courseKey,
      }))
    )
  );
}

/** `kind` روی پاسخ Nest نیست — فیلتر درس در UI با `courseKey` انجام می‌شود. */
export async function listRealManagedCourseMaterials(): Promise<CourseMaterial[]> {
  requireNestTransport('CourseMaterialsService.listManaged');
  const raw = await mentorLessonFilesApi.list();
  return newestFirst(
    asRecords(raw).flatMap((record) =>
      mapMentorLessonFileRecord(record, { kind: 'internship' })
    )
  );
}

export async function publishRealCourseMaterial(
  input: PublishCourseMaterialInput
): Promise<CourseMaterial> {
  requireNestTransport('CourseMaterialsService.publish');
  const role = useUserStore.getState().activeUser?.role;
  const error = validateCourseMaterialInput(
    input,
    role,
    COURSE_MATERIAL_REAL_MAX_BYTES
  );
  if (error) throw new Error(error);

  const uploaded = await FilesService.uploadFile(input.file);
  const description = input.description.trim();
  const created = await mentorLessonFilesApi.create({
    lessonId: input.courseKey,
    fileIds: [uploaded.id],
    ...(description ? { description } : {}),
  });

  // پاسخ POST در Swagger مستند نیست؛ ردیف را از چیزی که خودمان می‌دانیم می‌سازیم
  // (نام/نوع/حجم از فایل انتخابی کاربر، چون بک‌اند نمی‌دهد).
  const now = new Date().toISOString();
  const [row] = mapMentorLessonFileRecord(
    {
      id: created.id,
      professorId: created.professorId ?? '',
      lessonId: input.courseKey,
      description,
      files: [{ id: uploaded.id, path: uploaded.path }],
      createdAt: created.createdAt ?? now,
      updatedAt: created.updatedAt ?? now,
    },
    { kind: input.kind, courseLabel: input.courseLabel }
  );
  if (!row) throw new Error('ثبت فایل درس ناموفق بود.');
  return {
    ...row,
    title: input.file.name,
    fileName: input.file.name,
    mimeType: input.file.type || row.mimeType,
    sizeBytes: input.file.size,
  };
}

export async function deleteRealCourseMaterial(id: string): Promise<void> {
  requireNestTransport('CourseMaterialsService.delete');
  await mentorLessonFilesApi.remove(id);
}
