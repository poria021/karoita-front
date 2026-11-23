/**
 * دو API داشبورد معلم، مدیر مدرسه و استاد راهنما (Nest: mentor / professor / teacher).
 * مسیرها نسبت به `NEXT_PUBLIC_API_URL` (`.../api`) هستند؛ `api/` تکرار نشود.
 * `Authorization: Bearer` و `x-custom-lang` را همان `apiClient` بقیهٔ گزارش‌ها می‌گذارد.
 *
 * - میانگین نمرهٔ دروس: `GET v1/reports/lessons/average-scores`
 * - در انتظار بررسی:    `GET v1/reports/lessons/pending-reviews`
 *
 * نقش از توکن خوانده می‌شود؛ `role` در query فرستاده نمی‌شود. نقش‌های دیگر ۴۰۳ می‌گیرند.
 * محدودهٔ داده (فقط فراگیران خودش / مدرسه‌های حساب خودش) سمت سرور است.
 */
import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';

export const LESSON_AVERAGE_SCORES_PATH = 'v1/reports/lessons/average-scores';
export const LESSON_PENDING_REVIEWS_PATH = 'v1/reports/lessons/pending-reviews';

/** `structure` در Nest؛ `semester` = ترمی، `podmani` = پودمانی. */
export type LessonReportStructure = 'semester' | 'podmani';

/**
 * فیلتر نیم‌سال، مشترک بین هر دو API و اختیاری:
 * - بدون پارامتر: همهٔ نیم‌سال‌ها
 * - `semesterId`: فقط همان نیم‌سال
 * - `structure`: فقط نیم‌سال‌های همان ساختار
 * اگر `semesterId` با `structure` نخواند سرور ۴۰۰ برمی‌گرداند.
 */
export type LessonReportFilter = {
  semesterId?: string;
  structure?: LessonReportStructure;
};

export type LessonAverageScore = {
  /** نام درس روی محور. */
  title: string;
  /** ارتفاع میله؛ `null` یعنی هنوز نمرهٔ پایانی ثبت نشده. */
  averageScore: number | null;
};

export type LessonPendingReview = {
  /** عنوان کارت. */
  title: string;
  /** عدد بزرگ وسط کارت (هفته‌هایی که فراگیر فرستاده و این نقش هنوز جواب نداده). */
  pendingCount: number;
  /** شناسهٔ درس Nest اگر در پاسخ آمده باشد — برای لینک مستقیم ارزیابی. */
  lessonId?: string;
};

/** query مشترک؛ مقدار خالی فرستاده نمی‌شود. */
export function lessonReportQuery(
  filter: LessonReportFilter = {}
): ReturnType<typeof toSearchParams> {
  const semesterId = filter.semesterId?.trim();
  return toSearchParams({
    semesterId: semesterId || undefined,
    structure: filter.structure,
  });
}

function readData(raw: unknown): unknown[] {
  if (!raw || typeof raw !== 'object') return [];
  const data = (raw as { data?: unknown }).data;
  return Array.isArray(data) ? data : [];
}

function readTitle(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const title = value.trim();
  return title ? title : null;
}

function readFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function mapLessonAverageScores(raw: unknown): LessonAverageScore[] {
  const out: LessonAverageScore[] = [];
  for (const item of readData(raw)) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const title = readTitle(rec.title);
    if (!title) continue;
    out.push({ title, averageScore: readFiniteNumber(rec.averageScore) });
  }
  return out;
}

export function mapLessonPendingReviews(raw: unknown): LessonPendingReview[] {
  const out: LessonPendingReview[] = [];
  for (const item of readData(raw)) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const title = readTitle(rec.title);
    if (!title) continue;
    const pendingCount = readFiniteNumber(rec.pendingCount);
    // درسی بدون مورد در انتظار در `data` نمی‌آید؛ صفر/منفی را هم کارت نمی‌کنیم.
    if (pendingCount === null || pendingCount <= 0) continue;
    const lessonIdRaw = rec.lessonId ?? rec.courseId ?? rec.id;
    const lessonId =
      typeof lessonIdRaw === 'string' && lessonIdRaw.trim()
        ? lessonIdRaw.trim()
        : undefined;
    out.push({ title, pendingCount, ...(lessonId ? { lessonId } : {}) });
  }
  return out;
}

/** `GET /reports/lessons/average-scores` — هر آیتم یک میلهٔ نمودار. */
export async function fetchLessonAverageScores(
  filter: LessonReportFilter = {}
): Promise<LessonAverageScore[]> {
  const raw = await apiClient.getJson<unknown>(
    LESSON_AVERAGE_SCORES_PATH,
    undefined,
    { searchParams: lessonReportQuery(filter) }
  );
  return mapLessonAverageScores(raw);
}

/** `GET /reports/lessons/pending-reviews` — هر آیتم یک کارت. */
export async function fetchLessonPendingReviews(
  filter: LessonReportFilter = {}
): Promise<LessonPendingReview[]> {
  const raw = await apiClient.getJson<unknown>(
    LESSON_PENDING_REVIEWS_PATH,
    undefined,
    { searchParams: lessonReportQuery(filter) }
  );
  return mapLessonPendingReviews(raw);
}
