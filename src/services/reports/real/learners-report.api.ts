/**
 * HTTP گزارش «لیست فراگیران» (Swagger: تگ‌های Report Filters و Reports).
 * مسیرها نسبت به `NEXT_PUBLIC_API_URL` (`.../api`) هستند؛ `api/` تکرار نشود.
 * `Authorization` و `x-custom-lang: fa` را `apiClient` می‌گذارد.
 *
 * - باکس‌های فیلتر: `GET v1/reports/filters/learners_list?field=…`
 * - جدول:          `GET v1/reports/learners`
 * - خروجی:         `GET v1/reports/learners/export?format=excel|pdf`
 *
 * فقط `id` نگه داشته می‌شود؛ `title`/`fullName` متن نمایشی است.
 */
import { sharedRead } from '@/lib/shared-read';
import { apiClient, ApiClientError } from '@/services/api-client';
import { bearerHeaders, resolveBearerToken } from '@/services/api-token';
import { toSearchParams } from '@/services/nest-search-params';
import {
  EXPORT_ACCEPT,
  saveExportResponse,
} from '@/services/reports/real/save-export-response';
import type {
  ReportFilterKey,
  ReportFilters,
  ReportLearnerScoreDetail,
  ReportOption,
  ReportPeriodState,
  ReportRow,
  ReportScoreStatus,
} from '@/types/reports';

/** کلید پایدار برای dedupe GETهای هم‌زمان (Strict Mode / effect دوبار). */
function sharedLearnersGetKey(
  path: string,
  params: Record<string, string | number>
): string {
  const qs = Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)
    .join('&');
  return `reports-get:${path}?${qs}`;
}

export type LearnersReportPaths = {
  filters: string;
  table: string;
  export: string;
};

export const NEST_LEARNERS_REPORT_PATHS: LearnersReportPaths = {
  filters: 'v1/reports/filters/learners_list',
  table: 'v1/reports/learners',
  export: 'v1/reports/learners/export',
};

/**
 * «حضور و غیاب فراگیران» — همان باکس‌ها، آبشار و پارامترهای جدول «لیست فراگیران»؛
 * فقط مسیرها و شکل ردیف فرق دارد.
 */
export const NEST_LEARNERS_ATTENDANCE_PATHS: LearnersReportPaths = {
  filters: 'v1/reports/filters/learners_attendance',
  table: 'v1/reports/learners/attendance',
  export: 'v1/reports/learners/attendance/export',
};

/**
 * «نمرات فراگیران» — باکس فیلتر، جدول، خروجی و جزئیات.
 * شهر برای این گزارش نیست؛ `cityId` فرستاده نمی‌شود.
 */
export const NEST_LEARNERS_GRADES_PATHS: LearnersReportPaths = {
  filters: 'v1/reports/filters/learners_grades',
  table: 'v1/reports/learners/grades',
  export: 'v1/reports/learners/grades/export',
};

/** `GET v1/reports/learners/grades/detail/:studentId` */
export const NEST_LEARNER_GRADE_DETAIL_PATH =
  'v1/reports/learners/grades/detail';

/** سقف `limit` در Nest پنجاه است. */
export const LEARNERS_PAGE_SIZE = 50;

type FilterBoxSpec = {
  /** مقدار پارامتر `field` در API. */
  field: string;
  /** کلید آرایه در پاسخ باکس. */
  responseKey: string;
  /** متن نمایشی هر گزینه. */
  labelKey: 'title' | 'fullName';
  /** کلید فیلتر والد در UI → نام پارامتر کوئری. */
  parents: Partial<Record<ReportFilterKey, string>>;
};

/**
 * کلیدهای UI (`region`، `faculty`) ↔ نام‌های Nest (`educationalDistrict`، `university`).
 * ترتیب `parents` همان ترتیب آبشار در مستند است.
 */
const FILTER_BOXES: Partial<Record<ReportFilterKey, FilterBoxSpec>> = {
  province: {
    field: 'province',
    responseKey: 'provinces',
    labelKey: 'title',
    parents: {},
  },
  city: {
    field: 'city',
    responseKey: 'cities',
    labelKey: 'title',
    parents: { province: 'provinceId' },
  },
  region: {
    field: 'educationalDistrict',
    responseKey: 'educationalDistricts',
    labelKey: 'title',
    parents: { province: 'provinceId', city: 'cityId' },
  },
  faculty: {
    field: 'university',
    responseKey: 'universities',
    labelKey: 'title',
    // دانشکده به مدرسه وصل نیست؛ انتخاب مدرسه آن را عوض نمی‌کند.
    parents: { province: 'provinceId', city: 'cityId' },
  },
  school: {
    field: 'school',
    responseKey: 'schools',
    labelKey: 'title',
    parents: {
      province: 'provinceId',
      city: 'cityId',
      region: 'educationalDistrictId',
      faculty: 'universityId',
      professor: 'professorId',
    },
  },
  professor: {
    field: 'professor',
    responseKey: 'professors',
    labelKey: 'fullName',
    parents: { province: 'provinceId', faculty: 'universityId' },
  },
  teacher: {
    field: 'teacher',
    responseKey: 'teachers',
    labelKey: 'fullName',
    parents: {
      province: 'provinceId',
      city: 'cityId',
      region: 'educationalDistrictId',
      school: 'schoolId',
    },
  },
};

/** نام پارامتر هر فیلتر در `GET /reports/learners` (و export). */
const TABLE_FILTER_PARAMS: Partial<Record<ReportFilterKey, string>> = {
  province: 'provinceId',
  city: 'cityId',
  region: 'educationalDistrictId',
  faculty: 'universityId',
  school: 'schoolId',
  professor: 'professorId',
  teacher: 'teacherId',
};

/**
 * باکس‌های «نمرات فراگیران» — بدون شهر؛ والدهای آبشار هم `cityId` ندارند.
 */
const GRADES_FILTER_BOXES: Partial<Record<ReportFilterKey, FilterBoxSpec>> = {
  province: {
    field: 'province',
    responseKey: 'provinces',
    labelKey: 'title',
    parents: {},
  },
  region: {
    field: 'educationalDistrict',
    responseKey: 'educationalDistricts',
    labelKey: 'title',
    parents: { province: 'provinceId' },
  },
  faculty: {
    field: 'university',
    responseKey: 'universities',
    labelKey: 'title',
    parents: { province: 'provinceId' },
  },
  school: {
    field: 'school',
    responseKey: 'schools',
    labelKey: 'title',
    parents: {
      province: 'provinceId',
      region: 'educationalDistrictId',
      faculty: 'universityId',
      professor: 'professorId',
    },
  },
  professor: {
    field: 'professor',
    responseKey: 'professors',
    labelKey: 'fullName',
    parents: { province: 'provinceId', faculty: 'universityId' },
  },
  teacher: {
    field: 'teacher',
    responseKey: 'teachers',
    labelKey: 'fullName',
    parents: {
      province: 'provinceId',
      region: 'educationalDistrictId',
      school: 'schoolId',
    },
  },
};

export function isLearnersFilterKey(key: ReportFilterKey): boolean {
  return key in FILTER_BOXES;
}

function descendantKeysFromBoxes(
  boxes: Partial<Record<ReportFilterKey, FilterBoxSpec>>,
  key: ReportFilterKey
): ReportFilterKey[] {
  const out = new Set<ReportFilterKey>();
  const queue: ReportFilterKey[] = [key];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const [candidate, spec] of Object.entries(boxes) as [
      ReportFilterKey,
      FilterBoxSpec,
    ][]) {
      if (out.has(candidate)) continue;
      if (current in spec.parents) {
        out.add(candidate);
        queue.push(candidate);
      }
    }
  }
  return [...out];
}

/**
 * کلیدهایی که بعد از عوض شدن `key` باید پاک شوند (انتقالی).
 * مثال: عوض‌کردن دانشکده → استاد و مدرسه، و چون معلم به مدرسه وابسته است → معلم.
 */
export function learnersDescendantKeys(key: ReportFilterKey): ReportFilterKey[] {
  return descendantKeysFromBoxes(FILTER_BOXES, key);
}

/** آبشار فیلتر «نمرات فراگیران» (بدون شهر). */
export function learnersGradesDescendantKeys(
  key: ReportFilterKey
): ReportFilterKey[] {
  return descendantKeysFromBoxes(GRADES_FILTER_BOXES, key);
}

function periodParams(period: ReportPeriodState): {
  structure?: string;
  semesterId?: string;
} {
  // نظام انتخاب‌شده (ترمی/پودمانی) همیشه فرستاده می‌شود؛ وگرنه بک‌اند هر دو را
  // قاطی برمی‌گرداند. `semesterId` فقط وقتی دورهٔ واقعی انتخاب شده (idهای ماکت نه).
  return {
    structure: period.mode === 'term' ? 'semester' : 'podmani',
    ...(period.semesterId ? { semesterId: period.semesterId } : {}),
  };
}

function tableQuery(
  filters: ReportFilters,
  query: string,
  period: ReportPeriodState,
  options?: {
    /** کلیدهایی که هرگز به Nest فرستاده نشوند (مثلاً city برای نمرات). */
    omitKeys?: readonly ReportFilterKey[];
  }
): Record<string, string | number | undefined> {
  const omit = new Set(options?.omitKeys ?? []);
  const q: Record<string, string | number | undefined> = {};
  for (const [key, param] of Object.entries(TABLE_FILTER_PARAMS) as [
    ReportFilterKey,
    string,
  ][]) {
    if (omit.has(key)) continue;
    const value = filters[key];
    // «همه» یعنی کلید اصلاً در کوئری نباشد.
    if (value) q[param] = value;
  }
  Object.assign(q, periodParams(period));
  const search = query.trim();
  if (search) q.search = search;
  return q;
}

export type LearnersFilterBox =
  /** باکس برای نقش فعلی وجود دارد. */
  | { status: 'ok'; options: ReportOption[] }
  /** کلید در پاسخ نبود / نقش به این باکس دسترسی ندارد → باکس مخفی شود. */
  | { status: 'absent' }
  /** `400`: انتخاب قبلی با والد جدید نمی‌خواند → انتخاب این باکس را خالی کن و دوباره بگیر. */
  | { status: 'conflict'; message: string };

function mapOptions(raw: unknown, spec: FilterBoxSpec): ReportOption[] | null {
  if (!raw || typeof raw !== 'object') return null;
  const list = (raw as Record<string, unknown>)[spec.responseKey];
  if (!Array.isArray(list)) return null;
  const options: ReportOption[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const id = rec.id ?? rec._id;
    const label = rec[spec.labelKey];
    if (typeof id !== 'string' || !id) continue;
    options.push({
      value: id,
      label: typeof label === 'string' && label.trim() ? label : id,
    });
  }
  return options;
}

function isGradesPaths(paths: LearnersReportPaths): boolean {
  return paths.table === NEST_LEARNERS_GRADES_PATHS.table;
}

function filterBoxesForPaths(
  paths: LearnersReportPaths
): Partial<Record<ReportFilterKey, FilterBoxSpec>> {
  return isGradesPaths(paths) ? GRADES_FILTER_BOXES : FILTER_BOXES;
}

function tableQueryOptionsForPaths(
  paths: LearnersReportPaths
): { omitKeys?: readonly ReportFilterKey[] } | undefined {
  return isGradesPaths(paths) ? { omitKeys: ['city'] } : undefined;
}

/** `GET /reports/filters/learners_list?field=…&<والدها>` */
export async function fetchLearnersFilterBox(
  key: ReportFilterKey,
  filters: ReportFilters,
  period: ReportPeriodState,
  search?: string,
  paths: LearnersReportPaths = NEST_LEARNERS_REPORT_PATHS
): Promise<LearnersFilterBox> {
  if (!paths.filters) return { status: 'absent' };
  const boxes = filterBoxesForPaths(paths);
  const spec = boxes[key];
  if (!spec) return { status: 'absent' };

  const query: Record<string, string | number | undefined> = {
    field: spec.field,
  };
  for (const [parentKey, param] of Object.entries(spec.parents) as [
    ReportFilterKey,
    string,
  ][]) {
    const value = filters[parentKey];
    if (value) query[param] = value;
  }
  // دوره برای محدودکردن مدرسه/استاد است؛ اگر انتخاب نشده باشد فرستاده نمی‌شود.
  Object.assign(query, periodParams(period));
  if (search?.trim()) query.search = search.trim();

  try {
    const raw = await apiClient.getJson<unknown>(
      paths.filters,
      undefined,
      { searchParams: toSearchParams(query) }
    );
    const options = mapOptions(raw, spec);
    return options ? { status: 'ok', options } : { status: 'absent' };
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (error.status === 400) {
        return { status: 'conflict', message: error.message };
      }
      // نقش به این باکس دسترسی ندارد.
      if (error.status === 403 || error.status === 404) {
        return { status: 'absent' };
      }
    }
    throw error;
  }
}

/**
 * همهٔ باکس‌های مجاز نقش در یک درخواست (بدون `field`)، مثل مستند حضور و غیاب.
 * idهای انتخاب‌شده با نام پارامتر جدول فرستاده می‌شوند؛ سرور خودش آبشار را اعمال می‌کند.
 * کلیدی که در پاسخ نیامده یعنی برای این نقش مخفی است.
 */
export async function fetchLearnersFilterBoxes(
  filters: ReportFilters,
  period: ReportPeriodState,
  paths: LearnersReportPaths = NEST_LEARNERS_REPORT_PATHS
): Promise<Partial<Record<ReportFilterKey, LearnersFilterBox>>> {
  if (!paths.filters) {
    return {};
  }
  const boxes = filterBoxesForPaths(paths);
  const omit = new Set(tableQueryOptionsForPaths(paths)?.omitKeys ?? []);
  const query: Record<string, string | number | undefined> = {};
  for (const [key, param] of Object.entries(TABLE_FILTER_PARAMS) as [
    ReportFilterKey,
    string,
  ][]) {
    if (omit.has(key)) continue;
    const value = filters[key];
    if (value) query[param] = value;
  }
  Object.assign(query, periodParams(period));

  const keys = Object.keys(boxes) as ReportFilterKey[];
  const all = (box: LearnersFilterBox) =>
    Object.fromEntries(keys.map((key) => [key, box])) as Partial<
      Record<ReportFilterKey, LearnersFilterBox>
    >;

  const searchParams = toSearchParams(query) as Record<string, string | number>;
  return sharedRead(
    sharedLearnersGetKey(paths.filters, searchParams),
    async () => {
      try {
        const raw = await apiClient.getJson<unknown>(paths.filters, undefined, {
          searchParams,
        });
        const out: Partial<Record<ReportFilterKey, LearnersFilterBox>> = {};
        for (const key of keys) {
          const options = mapOptions(raw, boxes[key]!);
          out[key] = options ? { status: 'ok', options } : { status: 'absent' };
        }
        return out;
      } catch (error) {
        if (error instanceof ApiClientError) {
          if (error.status === 400) {
            return all({ status: 'conflict', message: error.message });
          }
          if (error.status === 403 || error.status === 404) {
            return all({ status: 'absent' });
          }
        }
        throw error;
      }
    }
  );
}

/* ------------------------------------------------------------------ */
/* جدول                                                                */
/* ------------------------------------------------------------------ */

function pickText(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
    if (value && typeof value === 'object') {
      const rec = value as Record<string, unknown>;
      const nested = pickText(rec.title, rec.fullName, rec.name);
      if (nested) return nested;
    }
  }
  return undefined;
}

function pickCourses(raw: Record<string, unknown>): string[] {
  const list = raw.courses ?? raw.lessons;
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => pickText(item))
    .filter((item): item is string => Boolean(item));
}

/**
 * شکل ردیف جدول در مستند نیامده؛ نگاشت عمداً چند نام محتمل را می‌پذیرد
 * و فیلد ناموجود را خالی می‌گذارد (نه ماکت، نه حدس).
 */
export function mapLearnerRow(raw: unknown, index: number): ReportRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;
  const first = pickText(rec.firstName);
  const last = pickText(rec.lastName);
  const name =
    pickText(rec.fullName, rec.name) ??
    (first || last ? [first, last].filter(Boolean).join(' ') : undefined);
  const id = pickText(rec.id, rec._id, rec.studentId) ?? `row-${index}`;
  // طبق Swagger: `lessons` آبجکت { title, extraCount } است (نه آرایه).
  const lessons =
    rec.lessons && typeof rec.lessons === 'object' && !Array.isArray(rec.lessons)
      ? (rec.lessons as Record<string, unknown>)
      : null;
  const lessonTitle = lessons ? pickText(lessons.title) : undefined;
  const courses = lessonTitle ? [lessonTitle] : pickCourses(rec);
  const schoolObj =
    rec.school && typeof rec.school === 'object'
      ? (rec.school as Record<string, unknown>)
      : {};

  return {
    id,
    s: '',
    name,
    // ترمی: شمارهٔ دانشجویی، پودمانی: کد مهارت‌آموزی. در Nest هر دو روی کاربر
    // `userUniqueId` ذخیره می‌شوند؛ نام فیلد پاسخ مستند نیست، پس چند نام محتمل را می‌پذیریم.
    studentNumber: pickText(
      rec.studentNumber,
      rec.studentCode,
      rec.studentNo,
      rec.skillCode,
      rec.skillNumber,
      rec.userUniqueId,
      rec.uniqueId,
      rec.uniqueCode,
      rec.identifier
    ),
    phone: pickText(rec.phone, rec.mobile, rec.phoneNumber),
    major: pickText(rec.degree, rec.major, rec.field, rec.fieldOfStudy, rec.grade),
    courses,
    ...(lessons ? { courseExtraCount: pickNumber(lessons.extraCount) ?? 0 } : {}),
    facName: pickText(rec.university, rec.universityTitle, rec.faculty),
    provName: pickText(rec.province, rec.provinceTitle),
    cityName: pickText(rec.city, rec.cityTitle),
    regionName: pickText(
      rec.educationalDistrict,
      rec.educationalDistrictTitle,
      pickText(schoolObj.district),
      rec.region
    ),
    schoolName: pickText(rec.school, rec.schoolTitle),
    profName: pickText(rec.mentor, rec.professor, rec.professorName),
    teacherName: pickText(rec.teacher, rec.teacherName),
  };
}

function pickNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * ردیف «حضور و غیاب فراگیران»:
 * `{ id, fullName, phone, degree, lessons: { title, extraCount }, university,
 *    province, school: { title, district }, attendancePercent }`
 * فقط عنوان اولین درس می‌آید؛ بقیه فقط شمارنده‌اند (`courseExtraCount`).
 */
export function mapLearnerAttendanceRow(
  raw: unknown,
  index: number
): ReportRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;
  const lessons = asRecord(rec.lessons);
  const schoolIsText = typeof rec.school === 'string';
  const school = asRecord(rec.school);
  const lessonTitle = pickText(lessons.title);

  return {
    id: pickText(rec.id, rec._id) ?? `row-${index}`,
    s: '',
    name: pickText(rec.fullName),
    // ترمی: شمارهٔ دانشجویی، پودمانی: کد مهارت‌آموزی (هر دو روی userUniqueId).
    studentNumber: pickText(
      rec.studentNumber,
      rec.studentCode,
      rec.studentNo,
      rec.skillCode,
      rec.skillNumber,
      rec.userUniqueId,
      rec.uniqueId,
      rec.uniqueCode,
      rec.identifier
    ),
    phone: pickText(rec.phone),
    major: pickText(rec.degree),
    courses: lessonTitle ? [lessonTitle] : [],
    courseExtraCount: pickNumber(lessons.extraCount) ?? 0,
    facName: pickText(rec.university),
    provName: pickText(rec.province),
    schoolName: schoolIsText ? pickText(rec.school) : pickText(school.title),
    regionName: pickText(school.district),
    att: pickNumber(rec.attendancePercent),
  };
}

function mapGradeStatus(value: unknown): ReportScoreStatus {
  if (value === 'passed') return 'pass';
  if (value === 'failed') return 'fail';
  return 'none';
}

/**
 * ردیف «نمرات فراگیران» — همان شکل لیست فراگیران به‌علاوه status و scores.
 * `{ id, fullName, phone, degree, lessons, university, province, school,
 *    mentor, teacher, status, scores: [{ lessonTitle, finalScore, weeks }] }`
 */
export function mapLearnerGradeRow(
  raw: unknown,
  index: number
): ReportRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;
  const lessons = asRecord(rec.lessons);
  const schoolIsText = typeof rec.school === 'string';
  const school = asRecord(rec.school);
  const lessonTitle = pickText(lessons.title);

  return {
    id: pickText(rec.id, rec._id) ?? 'row-' + index,
    s: '',
    name: pickText(rec.fullName),
    // ترمی: شمارهٔ دانشجویی، پودمانی: کد مهارت‌آموزی (هر دو روی userUniqueId).
    studentNumber: pickText(
      rec.studentNumber,
      rec.studentCode,
      rec.studentNo,
      rec.skillCode,
      rec.skillNumber,
      rec.userUniqueId,
      rec.uniqueId,
      rec.uniqueCode,
      rec.identifier
    ),
    phone: pickText(rec.phone),
    major: pickText(rec.degree),
    courses: lessonTitle ? [lessonTitle] : [],
    courseExtraCount: pickNumber(lessons.extraCount) ?? 0,
    facName: pickText(rec.university),
    provName: pickText(rec.province),
    schoolName: schoolIsText ? pickText(rec.school) : pickText(school.title),
    regionName: pickText(school.district),
    // سلول متنی خالی به نام فراگیر برمی‌گردد؛ پس برای «بدون استاد» خط‌تیره می‌گذاریم.
    profName: pickText(rec.mentor) ?? '—',
    teacherName: pickText(rec.teacher) ?? '—',
    status: mapGradeStatus(rec.status),
    scores: Array.isArray(rec.scores) ? rec.scores : undefined,
  };
}

export type LearnersPage = {
  rows: ReportRow[];
  hasNextPage: boolean;
  page: number;
};

/** `GET /reports/learners?…&page=&limit=` → `{ data, hasNextPage }`. */
export async function fetchLearnersPage(input: {
  filters: ReportFilters;
  query: string;
  period: ReportPeriodState;
  page: number;
  limit?: number;
  /** پیش‌فرض: «لیست فراگیران». */
  paths?: LearnersReportPaths;
  /** پیش‌فرض: `mapLearnerRow`. */
  mapRow?: (raw: unknown, index: number) => ReportRow | null;
}): Promise<LearnersPage> {
  const paths = input.paths ?? NEST_LEARNERS_REPORT_PATHS;
  const limit = Math.min(input.limit ?? LEARNERS_PAGE_SIZE, LEARNERS_PAGE_SIZE);
  const searchParams = toSearchParams({
    ...tableQuery(
      input.filters,
      input.query,
      input.period,
      tableQueryOptionsForPaths(paths)
    ),
    page: input.page,
    limit,
  }) as Record<string, string | number>;
  const mapRow = input.mapRow ?? mapLearnerRow;

  return sharedRead(
    sharedLearnersGetKey(paths.table, searchParams),
    async () => {
      const raw = await apiClient.getJson<unknown>(paths.table, undefined, {
        searchParams,
      });
      const body = (raw && typeof raw === 'object' ? raw : {}) as {
        data?: unknown;
        hasNextPage?: unknown;
      };
      const data = Array.isArray(body.data) ? body.data : [];
      const rows = data
        .map((item, index) => mapRow(item, (input.page - 1) * limit + index))
        .filter((row): row is ReportRow => row !== null);
      return {
        rows,
        hasNextPage: body.hasNextPage === true,
        page: input.page,
      };
    }
  );
}

/* ------------------------------------------------------------------ */
/* خروجی                                                               */
/* ------------------------------------------------------------------ */

export type LearnersExportFormat = 'excel' | 'pdf';

export type LearnersExportFileNames = Record<LearnersExportFormat, string>;

const EXPORT_FILE: LearnersExportFileNames = {
  excel: 'learners-report.xlsx',
  pdf: 'learners-report.pdf',
};

export const LEARNERS_ATTENDANCE_EXPORT_FILE: LearnersExportFileNames = {
  excel: 'learners-attendance-report.xlsx',
  pdf: 'learners-attendance-report.pdf',
};

/**
 * `GET /reports/learners/export?format=` — همهٔ صفحه‌ها با همان فیلترهای جدول.
 * `apiClient` فقط JSON برمی‌گرداند؛ برای فایل مستقیم `fetch` می‌زنیم.
 * پروکسی `content-disposition` را عبور نمی‌دهد، پس نام فایل را خودمان می‌گذاریم.
 */
export async function downloadLearnersExport(input: {
  format: LearnersExportFormat;
  filters: ReportFilters;
  query: string;
  period: ReportPeriodState;
  paths?: LearnersReportPaths;
  fileNames?: LearnersExportFileNames;
}): Promise<void> {
  const paths = input.paths ?? NEST_LEARNERS_REPORT_PATHS;
  const params = new URLSearchParams();
  const query = toSearchParams({
    ...tableQuery(
      input.filters,
      input.query,
      input.period,
      tableQueryOptionsForPaths(paths)
    ),
    format: input.format,
  }) as Record<string, string | number>;
  for (const [key, value] of Object.entries(query)) {
    params.set(key, String(value));
  }

  const bearer = await resolveBearerToken();
  const response = await fetch(
    `${apiClient.baseUrl}/${paths.export}?${params.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        ...bearerHeaders(bearer),
        'x-custom-lang': 'fa',
        Accept: EXPORT_ACCEPT[input.format],
      },
    }
  );

  if (!response.ok) {
    let message = 'دریافت فایل ناموفق بود.';
    try {
      const body = (await response.json()) as { message?: unknown };
      if (typeof body.message === 'string' && body.message.trim()) {
        message = body.message;
      }
    } catch {
      // بدنهٔ غیر JSON؛ پیام پیش‌فرض.
    }
    throw new ApiClientError(message, response.status);
  }

  await saveExportResponse(
    response,
    (input.fileNames ?? EXPORT_FILE)[input.format],
    input.format
  );
}

/** مسیر فیلتر نمرات برای تست و مقایسه. */
export const LEARNERS_GRADES_FILTER_KEYS = Object.keys(
  GRADES_FILTER_BOXES
) as ReportFilterKey[];

export const LEARNERS_GRADES_EXPORT_FILE: LearnersExportFileNames = {
  excel: 'learners-grades-report.xlsx',
  pdf: 'learners-grades-report.pdf',
};

/* ------------------------------------------------------------------ */
/* جزئیات نمرات                                                        */
/* ------------------------------------------------------------------ */

/**
 * پاسخ `grades/detail/:studentId` یا آرایهٔ `scores` روی ردیف جدول:
 * `{ lessonTitle|title, finalScore, weeks: [{ priority, score }] }`
 * نام فراگیر در پاسخ نیست؛ از ردیف جدول می‌آید.
 * نمرهٔ پایانی همان `finalScore` است (ممکن است تا بستن نیمسال null باشد).
 */
export function mapLearnerGradeDetail(
  raw: unknown,
  learnerId: string,
  learnerName: string
): ReportLearnerScoreDetail {
  const body = asRecord(raw);
  const list = Array.isArray(body.scores)
    ? body.scores
    : Array.isArray(body.lessons)
      ? body.lessons
      : [];
  return {
    learnerId,
    learnerName,
    periodLabel: '',
    courses: list.map((item, index) => {
      const lesson = asRecord(item);
      const weeks = Array.isArray(lesson.weeks) ? lesson.weeks : [];
      const sessions: (number | null)[] = [];
      for (const week of weeks) {
        const w = asRecord(week);
        const score = pickNumber(w.score) ?? null;
        const priority = pickNumber(w.priority) ?? 0;
        if (priority > 0) {
          while (sessions.length < priority) sessions.push(null);
          sessions[priority - 1] = score;
        } else {
          sessions.push(score);
        }
      }
      const finalScore = pickNumber(lesson.finalScore);
      const rawStatus = lesson.status ?? lesson.lessonStatus ?? lesson.result;
      return {
        // یک درس ممکن است در چند نیم‌سال تکرار شود؛ id یکتا بماند.
        id:
          (pickText(lesson.lessonId, lesson.lessonTitle, lesson.title) ??
            'lesson') +
          '-' +
          index,
        name: pickText(lesson.lessonTitle, lesson.title) ?? '',
        average: finalScore ?? null,
        sessions,
        ...(rawStatus !== undefined && rawStatus !== null
          ? { status: mapGradeStatus(rawStatus) }
          : {}),
      };
    }),
  };
}

/**
 * اگر API وضعیت هر درس را نداده باشد و فراگیر فقط یک درس دارد، وضعیت ردیف همان
 * وضعیت آن درس است. با چند درس حدس نمی‌زنیم (وضعیت ردیف مال کل نیمسال است).
 */
export function withRowStatusFallback(
  detail: ReportLearnerScoreDetail,
  rowStatus: ReportScoreStatus | undefined
): ReportLearnerScoreDetail {
  if (!rowStatus || detail.courses.length !== 1) return detail;
  const [only] = detail.courses;
  if (!only || only.status !== undefined) return detail;
  return { ...detail, courses: [{ ...only, status: rowStatus }] };
}

/** `GET /reports/learners/grades/detail/:studentId?structure=&semesterId=` */
export async function fetchLearnerGradeDetail(
  learnerId: string,
  learnerName: string,
  period: ReportPeriodState
): Promise<ReportLearnerScoreDetail> {
  const raw = await apiClient.getJson<unknown>(
    NEST_LEARNER_GRADE_DETAIL_PATH + '/' + encodeURIComponent(learnerId),
    undefined,
    {
      searchParams: toSearchParams(
        period.semesterId ? { ...periodParams(period) } : {}
      ),
    }
  );
  return mapLearnerGradeDetail(raw, learnerId, learnerName);
}
