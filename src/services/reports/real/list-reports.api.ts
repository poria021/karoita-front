/**
 * HTTP «بقیهٔ گزارش‌های لیستی» (Swagger: تگ‌های Report Filters و Reports).
 * مسیرها نسبت به `NEXT_PUBLIC_API_URL` (`.../api`) هستند؛ `api/` تکرار نشود.
 * `Authorization` و `x-custom-lang: fa` را `apiClient` می‌گذارد.
 *
 * شامل: schools, faculties, provinces, teachers, principals (مدیران مدرسه), professors.
 * «لیست فراگیران» جدا در `learners-report.api.ts` است (API و شکل پاسخش کمی فرق دارد).
 *
 * - باکس‌های فیلتر: `GET v1/reports/filters/{report}?field=…`
 * - جدول:          `GET v1/reports/{table}`
 * - خروجی:         `GET v1/reports/{table}/export?format=excel|pdf`
 */
import { apiClient, ApiClientError } from '@/services/api-client';
import { bearerHeaders, resolveBearerToken } from '@/services/api-token';
import { toSearchParams } from '@/services/nest-search-params';
import {
  isPerformanceReportSlug,
  mapPerformanceRow,
} from '@/services/reports/real/performance-report.mappers';
import type { ReportSlug } from '@/types/report-access';
import type {
  ReportFilterKey,
  ReportFilters,
  ReportOption,
  ReportPeriodState,
  ReportRow,
} from '@/types/reports';

/** اسلاگ‌های این فایل؛ «فراگیران» جدا هندل می‌شود. */
export type ListReportSlug =
  | 'schools'
  | 'faculties'
  | 'provinces'
  | 'teachers'
  | 'principals'
  | 'professors'
  | 'professor-attendance'
  // گزارش‌های عملکرد (فیلتر: `*_performance`، جدول: `/reports/{x}/performance`)
  | 'teacher-performance'
  | 'school-performance'
  | 'professor-performance'
  | 'faculty-performance'
  | 'province-performance';

const LIST_REPORT_SLUGS: readonly ListReportSlug[] = [
  'schools',
  'faculties',
  'provinces',
  'teachers',
  'principals',
  'professors',
  'professor-attendance',
  'teacher-performance',
  'school-performance',
  'professor-performance',
  'faculty-performance',
  'province-performance',
];

export function isListReportSlug(slug: ReportSlug): slug is ListReportSlug {
  return (LIST_REPORT_SLUGS as readonly string[]).includes(slug);
}

/**
 * گزارش‌هایی که همهٔ باکس‌های مجاز نقش را در یک درخواست بدون `field` می‌گیرند
 * (حضور اساتید + پنج گزارش عملکرد).
 */
export function usesBatchFilterBoxes(slug: ReportSlug): slug is ListReportSlug {
  return slug === 'professor-attendance' || isPerformanceReportSlug(slug);
}

/** `{report}` در `GET /reports/filters/{report}`. */
const NEST_REPORT_NAME: Record<ListReportSlug, string> = {
  schools: 'schools_list',
  faculties: 'faculties_list',
  provinces: 'provinces_list',
  teachers: 'teachers_list',
  principals: 'school_admins_list',
  professors: 'professors_list',
  'professor-attendance': 'professors_attendance',
  'teacher-performance': 'teachers_performance',
  'school-performance': 'schools_performance',
  'professor-performance': 'professors_performance',
  'faculty-performance': 'faculties_performance',
  'province-performance': 'provinces_performance',
};

/** مسیر جدول هر گزارش (export همین مسیر + `/export`). */
const NEST_TABLE_PATH: Record<ListReportSlug, string> = {
  schools: 'v1/reports/schools',
  faculties: 'v1/reports/faculties',
  provinces: 'v1/reports/provinces',
  teachers: 'v1/reports/teachers',
  principals: 'v1/reports/school-admins',
  professors: 'v1/reports/professors',
  'professor-attendance': 'v1/reports/professors/attendance',
  'teacher-performance': 'v1/reports/teachers/performance',
  'school-performance': 'v1/reports/schools/performance',
  'professor-performance': 'v1/reports/professors/performance',
  'faculty-performance': 'v1/reports/faculties/performance',
  'province-performance': 'v1/reports/provinces/performance',
};

export function nestFiltersPath(slug: ListReportSlug): string {
  return `v1/reports/filters/${NEST_REPORT_NAME[slug]}`;
}

export function nestTablePath(slug: ListReportSlug): string {
  return NEST_TABLE_PATH[slug];
}

export function nestExportPath(slug: ListReportSlug): string {
  return `${NEST_TABLE_PATH[slug]}/export`;
}

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
 * آبشار یکسان برای همهٔ گزارش‌های لیستی (همان قانون «لیست فراگیران»):
 * دانشکده به مدرسه وصل نیست؛ مدرسه به استاد راهنما و منطقه وابسته است؛
 * معلم راهنما به مدرسه وابسته است.
 */
const ALL_FILTER_BOXES: Partial<Record<ReportFilterKey, FilterBoxSpec>> = {
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
    // دانشکده به مدرسه وصل نیست.
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

/**
 * سقف باکس‌هایی که اصلاً برای این گزارش معنی دارند (اتحاد همهٔ نقش‌ها طبق مستند).
 * `admin`/`superadmin`/`organization_center` معمولاً همین سقف را می‌بینند؛
 * نقش‌های دیگر زیرمجموعه (یا طبق allowlist جدا) می‌بینند — همان‌طور که
 * `hiddenReportFilterKeysForRole`/`extraReportFilterKeysForRole` در
 * `org-report-access.ts` مشخص می‌کنند؛ اینجا فقط سقف ساختاری گزارش است.
 */
const REPORT_FIELD_CEILING: Record<ListReportSlug, readonly ReportFilterKey[]> = {
  schools: ['province', 'city', 'region'],
  faculties: ['province', 'city'],
  provinces: [],
  // `teacher` فقط برای آموزش‌وپرورش منطقه (school_district) است؛ سقف اتحاد همهٔ نقش‌هاست.
  teachers: ['province', 'city', 'region', 'school', 'teacher'],
  principals: ['province', 'city', 'region'],
  professors: ['province', 'city', 'faculty'],
  // حضور اساتید: فقط استان، شهر، دانشکده؛ منطقه/مدرسه/استاد/معلم فرستاده نمی‌شود.
  'professor-attendance': ['province', 'city', 'faculty'],
  // عملکرد معلمان: استان، شهر، منطقه، مدرسه، معلم راهنما (هر نقش زیرمجموعه‌اش را می‌گیرد).
  'teacher-performance': ['province', 'city', 'region', 'school', 'teacher'],
  // عملکرد مدارس: استان، شهر، منطقه + (آموزش‌وپرورش منطقه) مدرسه و معلم راهنما.
  'school-performance': ['province', 'city', 'region', 'school', 'teacher'],
  // عملکرد اساتید: استان، شهر، دانشکده؛ منطقه/مدرسه/استاد/معلم فرستاده نمی‌شود.
  'professor-performance': ['province', 'city', 'faculty'],
  'faculty-performance': ['province', 'city'],
  // عملکرد استان‌ها: هیچ باکس سازمانی؛ فقط جستجو و دوره.
  'province-performance': [],
};

/**
 * والدهای متفاوت از آبشار پیش‌فرض برای بعضی گزارش‌ها.
 * عملکرد مدارس: انتخاب معلم راهنما مدرسه‌ها را به مدرسه‌های همان معلم محدود می‌کند
 * (پس معلم والد مدرسه است و برعکس نه — وگرنه آبشار دور می‌زند).
 */
const SLUG_BOX_PARENTS: Partial<
  Record<
    ListReportSlug,
    Partial<Record<ReportFilterKey, Partial<Record<ReportFilterKey, string>>>>
  >
> = {
  'school-performance': {
    school: {
      province: 'provinceId',
      city: 'cityId',
      region: 'educationalDistrictId',
      teacher: 'teacherId',
    },
    teacher: {
      province: 'provinceId',
      city: 'cityId',
      region: 'educationalDistrictId',
    },
  },
};

/** مشخصات باکس برای این گزارش؛ والدها فقط از داخل سقف همین گزارش‌اند. */
function boxSpecFor(
  slug: ListReportSlug,
  key: ReportFilterKey
): FilterBoxSpec | undefined {
  const base = ALL_FILTER_BOXES[key];
  if (!base) return undefined;
  const ceiling = new Set(REPORT_FIELD_CEILING[slug]);
  const parents = SLUG_BOX_PARENTS[slug]?.[key] ?? base.parents;
  const scoped: Partial<Record<ReportFilterKey, string>> = {};
  for (const [parentKey, param] of Object.entries(parents) as [
    ReportFilterKey,
    string,
  ][]) {
    if (ceiling.has(parentKey)) scoped[parentKey] = param;
  }
  return { ...base, parents: scoped };
}

/** نام پارامتر هر فیلتر در `GET /reports/{table}` (و export). */
const TABLE_FILTER_PARAMS: Record<ReportFilterKey, string> = {
  province: 'provinceId',
  city: 'cityId',
  region: 'educationalDistrictId',
  faculty: 'universityId',
  school: 'schoolId',
  professor: 'professorId',
  teacher: 'teacherId',
  course: 'course',
  major: 'major',
  status: 'status',
};

export function isListReportFilterKey(
  slug: ListReportSlug,
  key: ReportFilterKey
): boolean {
  return REPORT_FIELD_CEILING[slug].includes(key);
}

/**
 * کلیدهایی که بعد از عوض‌شدن `key` باید پاک شوند (همان آبشار «لیست فراگیران»).
 * فقط داخل سقف همین گزارش محاسبه می‌شود.
 */
export function listReportDescendantKeys(
  slug: ListReportSlug,
  key: ReportFilterKey
): ReportFilterKey[] {
  const ceiling = new Set(REPORT_FIELD_CEILING[slug]);
  const out = new Set<ReportFilterKey>();
  const queue: ReportFilterKey[] = [key];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const candidate of ceiling) {
      const spec = boxSpecFor(slug, candidate);
      if (!spec || out.has(candidate) || candidate === key) continue;
      if (current in spec.parents) {
        out.add(candidate);
        queue.push(candidate);
      }
    }
  }
  return [...out];
}

function periodParams(period: ReportPeriodState): {
  structure?: string;
  semesterId?: string;
} {
  // بدون انتخاب دورهٔ واقعی چیزی نفرست؛ idهای ماکت (t0/m1) هرگز به Nest نروند.
  if (!period.semesterId) return {};
  return {
    structure: period.mode === 'term' ? 'semester' : 'podmani',
    semesterId: period.semesterId,
  };
}

function tableQuery(
  slug: ListReportSlug,
  filters: ReportFilters,
  query: string,
  period: ReportPeriodState
): Record<string, string | number | undefined> {
  const q: Record<string, string | number | undefined> = {};
  // provinces_list روی جدول فقط search/structure/semesterId/page/limit دارد.
  if (slug !== 'provinces' && slug !== 'province-performance') {
    for (const key of REPORT_FIELD_CEILING[slug]) {
      const value = filters[key];
      // «همه» یعنی کلید اصلاً در کوئری نباشد.
      if (value) q[TABLE_FILTER_PARAMS[key]] = value;
    }
  }
  Object.assign(q, periodParams(period));
  const search = query.trim();
  if (search) q.search = search;
  return q;
}

export type ListFilterBox =
  /** باکس برای نقش فعلی وجود دارد. */
  | { status: 'ok'; options: ReportOption[] }
  /** کلید در پاسخ نبود / نقش به این باکس دسترسی ندارد / گزارش اصلاً این باکس را ندارد → مخفی. */
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

/** `GET /reports/filters/{report}?field=…&<والدها>` */
export async function fetchListFilterBox(
  slug: ListReportSlug,
  key: ReportFilterKey,
  filters: ReportFilters,
  period: ReportPeriodState,
  search?: string
): Promise<ListFilterBox> {
  const spec = boxSpecFor(slug, key);
  if (!spec || !isListReportFilterKey(slug, key)) return { status: 'absent' };

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
      nestFiltersPath(slug),
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
 * همهٔ باکس‌های مجاز نقش در یک درخواست (بدون `field`).
 * کلید غایب در پاسخ یعنی مخفی؛ کلید خارج از سقف گزارش همیشه مخفی است.
 */
export async function fetchListFilterBoxes(
  slug: ListReportSlug,
  filters: ReportFilters,
  period: ReportPeriodState
): Promise<Partial<Record<ReportFilterKey, ListFilterBox>>> {
  const ceiling = REPORT_FIELD_CEILING[slug];
  // بدون باکس (مثل عملکرد استان‌ها) درخواستی لازم نیست.
  if (ceiling.length === 0) return {};
  const query: Record<string, string | number | undefined> = {};
  for (const key of ceiling) {
    const value = filters[key];
    if (value) query[TABLE_FILTER_PARAMS[key]] = value;
  }
  Object.assign(query, periodParams(period));

  const all = (box: ListFilterBox) =>
    Object.fromEntries(ceiling.map((key) => [key, box])) as Partial<
      Record<ReportFilterKey, ListFilterBox>
    >;

  try {
    const raw = await apiClient.getJson<unknown>(
      nestFiltersPath(slug),
      undefined,
      { searchParams: toSearchParams(query) }
    );
    const out: Partial<Record<ReportFilterKey, ListFilterBox>> = {};
    for (const key of ceiling) {
      const spec = boxSpecFor(slug, key);
      const options = spec ? mapOptions(raw, spec) : null;
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

function pickNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

/**
 * شکل ردیف جدول در مستند نیامده؛ نگاشت عمداً چند نام محتمل را می‌پذیرد
 * و فیلد ناموجود را خالی می‌گذارد (نه ماکت، نه حدس).
 * برای همهٔ گزارش‌های لیستی این فایل مشترک است (schools/faculties/.../professors).
 */
export function mapListRow(raw: unknown, index: number): ReportRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;
  const first = pickText(rec.firstName);
  const last = pickText(rec.lastName);
  const name =
    pickText(
      rec.fullName,
      rec.name,
      rec.title,
      rec.schoolName,
      rec.universityName,
      rec.provinceName
    ) ?? (first || last ? [first, last].filter(Boolean).join(' ') : undefined);
  const id = pickText(rec.id, rec._id) ?? `row-${index}`;

  return {
    id,
    s: '',
    name,
    phone: pickText(rec.phone, rec.mobile, rec.phoneNumber),
    head: pickText(rec.head, rec.manager, rec.principal, rec.principalName),
    provName: pickText(rec.province, rec.provinceTitle),
    cityName: pickText(rec.city, rec.cityTitle),
    regionName: pickText(
      rec.educationalDistrict,
      rec.educationalDistrictTitle,
      rec.region
    ),
    facName: pickText(rec.university, rec.universityTitle, rec.faculty),
    schoolName: pickText(rec.school, rec.schoolTitle),
    profName: pickText(rec.professor, rec.professorName),
    teacherName: pickText(rec.teacher, rec.teacherName),
    n: typeof rec.count === 'number' ? rec.count : undefined,
    // «حضور اساتید»: سه عدد جدا و یکی نیستند.
    code: pickText(rec.personnelCode),
    att: pickNumber(rec.attendancePercent),
    attProf: pickNumber(rec.professorConfirmedRate),
    attMgr: pickNumber(rec.attendanceRate),
  };
}

export type ListReportPage = {
  rows: ReportRow[];
  hasNextPage: boolean;
  page: number;
};

/** سقف `limit` در Nest پنجاه است. */
export const LIST_REPORT_PAGE_SIZE = 50;

/** `GET /reports/{table}?…&page=&limit=` → `{ data, hasNextPage }`. */
export async function fetchListPage(
  slug: ListReportSlug,
  input: {
    filters: ReportFilters;
    query: string;
    period: ReportPeriodState;
    page: number;
    limit?: number;
  }
): Promise<ListReportPage> {
  const limit = Math.min(input.limit ?? LIST_REPORT_PAGE_SIZE, LIST_REPORT_PAGE_SIZE);
  const raw = await apiClient.getJson<unknown>(
    nestTablePath(slug),
    undefined,
    {
      searchParams: toSearchParams({
        ...tableQuery(slug, input.filters, input.query, input.period),
        page: input.page,
        limit,
      }),
    }
  );
  const body = (raw && typeof raw === 'object' ? raw : {}) as {
    data?: unknown;
    hasNextPage?: unknown;
  };
  const data = Array.isArray(body.data) ? body.data : [];
  const rows = data
    .map((item, index) => {
      const at = (input.page - 1) * limit + index;
      return isPerformanceReportSlug(slug)
        ? mapPerformanceRow(slug, item, at)
        : mapListRow(item, at);
    })
    .filter((row): row is ReportRow => row !== null);
  return { rows, hasNextPage: body.hasNextPage === true, page: input.page };
}

/* ------------------------------------------------------------------ */
/* خروجی                                                               */
/* ------------------------------------------------------------------ */

export type ListReportExportFormat = 'excel' | 'pdf';

const EXPORT_FILE: Record<ListReportSlug, Record<ListReportExportFormat, string>> = {
  schools: { excel: 'schools-report.xlsx', pdf: 'schools-report.pdf' },
  faculties: { excel: 'faculties-report.xlsx', pdf: 'faculties-report.pdf' },
  provinces: { excel: 'provinces-report.xlsx', pdf: 'provinces-report.pdf' },
  teachers: { excel: 'teachers-report.xlsx', pdf: 'teachers-report.pdf' },
  principals: { excel: 'principals-report.xlsx', pdf: 'principals-report.pdf' },
  professors: { excel: 'professors-report.xlsx', pdf: 'professors-report.pdf' },
  'professor-attendance': {
    excel: 'professors-attendance-report.xlsx',
    pdf: 'professors-attendance-report.pdf',
  },
  'teacher-performance': {
    excel: 'teachers-performance-report.xlsx',
    pdf: 'teachers-performance-report.pdf',
  },
  'school-performance': {
    excel: 'schools-performance-report.xlsx',
    pdf: 'schools-performance-report.pdf',
  },
  'professor-performance': {
    excel: 'professors-performance-report.xlsx',
    pdf: 'professors-performance-report.pdf',
  },
  'faculty-performance': {
    excel: 'faculties-performance-report.xlsx',
    pdf: 'faculties-performance-report.pdf',
  },
  'province-performance': {
    excel: 'provinces-performance-report.xlsx',
    pdf: 'provinces-performance-report.pdf',
  },
};

/**
 * `GET /reports/{table}/export?format=` — همهٔ صفحه‌ها با همان فیلترهای جدول.
 * `apiClient` فقط JSON برمی‌گرداند؛ برای فایل مستقیم `fetch` می‌زنیم.
 * پروکسی `content-disposition` را عبور نمی‌دهد، پس نام فایل را خودمان می‌گذاریم.
 */
export async function downloadListExport(
  slug: ListReportSlug,
  input: {
    format: ListReportExportFormat;
    filters: ReportFilters;
    query: string;
    period: ReportPeriodState;
  }
): Promise<void> {
  const query = toSearchParams({
    ...tableQuery(slug, input.filters, input.query, input.period),
    format: input.format,
  }) as Record<string, string | number>;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    params.set(key, String(value));
  }

  const bearer = await resolveBearerToken();
  const response = await fetch(
    `${apiClient.baseUrl}/${nestExportPath(slug)}?${params.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: { ...bearerHeaders(bearer), 'x-custom-lang': 'fa' },
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

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = EXPORT_FILE[slug][input.format];
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
