/**
 * مرتب‌سازی الفبایی — فقط `/admin/provinces` و `/admin/cities` این پارامتر را
 * در OpenAPI لایو تعریف کرده‌اند (چک‌شده روی `/docs-json`). endpointهای دیگر
 * (educations, schools, degreeee, universites) اصلاً `sort` ندارند؛ ارسال آن
 * می‌تواند رد شود یا نادیده گرفته شود — عمداً فقط همین دو مسیر را می‌فرستیم.
 */
export const TITLE_ASC_SORT = '[{"orderBy":"title","order":"ASC"}]';

/**
 * مسیرها نسبت به `NEXT_PUBLIC_API_URL` (`.../api`).
 * املای `universites` و `degreeee` و DELETE مدرسه بدون `/` با OpenAPI لایو یکی است.
 */
export const NEST_ADMIN_PATHS = {
  provinces: 'admin/provinces',
  provincesAll: 'admin/province/all',
  provinceById: (id: string) => `admin/provinces/${id}`,
  provinceCities: (id: string) => `admin/provinces/${id}/cities`,
  cities: 'admin/cities',
  cityById: (id: string) => `admin/cities/${id}`,
  educations: 'admin/educations',
  educationById: (id: string) => `admin/educations/${id}`,
  cityEducations: (id: string) => `admin/cities/${id}/educations`,
  provinceEducations: (id: string) => `admin/province/${id}/educations`,
  schools: 'admin/schools',
  schoolsAll: 'admin/schools/all',
  schoolById: (id: string) => `admin/schools/${id}`,
  /** DELETE لایو بدون `/` قبل از id: `admin/schools{id}` نه `admin/schools/{id}`. */
  schoolDeleteById: (id: string) => `admin/schools${id}`,
  degree: 'admin/degree',
  degreeById: (id: string) => `admin/degree/${id}`,
  degreesWithRole: 'admin/degreeee',
  roles: 'admin/roles',
  roleDegrees: (roleId: string) => `admin/roles/${roleId}/degrees`,
  universities: 'admin/universites',
  universityById: (id: string) => `admin/universites/${id}`,
  semesters: 'admin/semester',
  semesterById: (id: string) => `admin/semester/${id}`,
  semestersAll: 'admin/semesters_all',
  lessonStatusById: (id: string) => `admin/lessons/${id}/status`,
  /** PATCH آرایه — ظرفیت/روز/وضعیت چند درس. */
  lessonsStatus: 'admin/lessons/status',
  lessonWeeks: (lessonId: string) => `admin/lessons/${lessonId}/weeks`,
  weeks: 'admin/weeks',
  weekById: (id: string) => `admin/weeks/${id}`,
  weeksByLesson: (lessonId: string) => `admin/weeks/lesson/${lessonId}`,
  academicSettings: 'admin/settings',
  professorCapacities: 'admin/professor-capacities',
} as const;
