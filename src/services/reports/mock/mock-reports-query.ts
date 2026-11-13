import {
  CUR_PERIOD,
  MODULES,
  PAGE_SIZE,
  REPORT_PAGE_DEFS,
  TERMS,
} from '@/features/karvita/reports/constants';
import type { ReportSlug } from '@/types/report-access';
import type {
  ReportColumnDef,
  ReportCompareItem,
  ReportCompareMetric,
  ReportFilterCatalog,
  ReportFilterKey,
  ReportFilters,
  ReportLearnerCourseDetail,
  ReportLearnerScoreDetail,
  ReportOption,
  ReportPeriodState,
  ReportQueryInput,
  ReportQueryResult,
  ReportRow,
  ReportScoreStatus,
  ReportSort,
} from '@/types/reports';

import {
  COURSES,
  getReportsDb,
  hsh,
  MAJORS,
  normQ,
  type ReportsDb,
} from './mock-reports-db';

const STATUS_OPTIONS: ReportOption[] = [
  { value: 'pass', label: 'قبول' },
  { value: 'fail', label: 'مردود' },
  { value: 'none', label: 'ثبت‌نشده' },
];

function periodId(period: ReportPeriodState): string {
  return period.mode === 'term' ? period.termId : period.moduleId;
}

function mv(id: string, kind: string, per: string, lo: number, hi: number): number {
  return Math.round(lo + hsh(`${id}${kind}${per}`) * (hi - lo));
}

function periodN(n: number, id: string, p: string): number {
  return p === CUR_PERIOD.term || p === CUR_PERIOD.module
    ? n
    : Math.round(n * (0.7 + hsh(`${id}n${p}`) * 0.3));
}

/** مدیر ارشد: همهٔ فراگیران در محدوده — بدون فیلتر نقش. */
function allLearners(db: ReportsDb): ReportsDb['learners'] {
  return db.learners;
}

function nLearn(
  learners: ReportsDb['learners'],
  key: 'school' | 'teacher' | 'professor' | 'faculty' | 'province',
  id: string
): number {
  return learners.filter((l) => l[key] === id).length;
}

export function buildRows(slug: ReportSlug, period: ReportPeriodState): ReportRow[] {
  const db = getReportsDb();
  const def = REPORT_PAGE_DEFS[slug];
  const L = allLearners(db);
  const pid = periodId(period);
  const term = pid;
  let rows: ReportRow[] = [];

  switch (def.entity) {
    case 'learner':
    case 'score':
      rows = L.filter(
        (l) =>
          pid === CUR_PERIOD.term ||
          pid === CUR_PERIOD.module ||
          hsh(`${l.id}${pid}`) < 0.82
      ).map((l) => {
        const h = hsh(`${l.id}s${pid}`);
        const status: ReportScoreStatus =
          h < 0.12 ? 'none' : h < 0.27 ? 'fail' : 'pass';
        return {
          ...l,
          s: l.s,
          att: mv(l.id, 'a', pid, 55, 100),
          status,
        };
      });
      break;
    case 'teacher':
    case 'teacherPerf':
      rows = db.teachers.map((t) => ({
        ...t,
        s: normQ(`${t.name}${t.raw}${t.code}`),
        n:
          def.entity === 'teacher'
            ? nLearn(L, 'teacher', t.id)
            : periodN(nLearn(L, 'teacher', t.id), t.id, term),
        resp: mv(t.id, 'r', term, 58, 99),
      }));
      break;
    case 'principal':
      rows = db.schools.map((s) => ({
        id: `pc${s.id}`,
        name: s.principal.name,
        code: s.principal.code,
        phone: s.principal.phone,
        school: s.id,
        schoolName: s.name,
        region: s.region,
        regionName: s.regionName,
        city: s.city,
        cityName: s.cityName,
        province: s.province,
        provName: s.provName,
        s: normQ(`${s.principal.name}${s.principal.raw}${s.principal.code}`),
      }));
      break;
    case 'school':
    case 'schoolPerf':
      rows = db.schools.map((s) => ({
        id: s.id,
        name: s.name,
        principalName: s.principal.name,
        principalCode: s.principal.code,
        cityName: s.cityName,
        regionName: s.regionName,
        provName: s.provName,
        province: s.province,
        city: s.city,
        region: s.region,
        nT: db.teachers.filter((t) => t.school === s.id).length,
        n: nLearn(L, 'school', s.id),
        resp: mv(s.id, 'r', term, 58, 99),
        score: mv(s.id, 'g', term, 62, 96),
        s: normQ(`${s.name}${s.principal.name}${s.principal.code}`),
      }));
      break;
    case 'professor':
    case 'profAtt':
    case 'profPerf':
      rows = db.professors.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        phone: p.phone,
        facName: p.facName,
        provName: p.provName,
        province: p.province,
        city: p.city,
        cityName: p.cityName,
        faculty: p.faculty,
        courses: p.courses,
        courseText: p.courses.join(' '),
        n: nLearn(L, 'professor', p.id),
        att: mv(p.id, 'a', term, 60, 100),
        attProf: mv(p.id, 'ap', term, 60, 100),
        attMgr: mv(p.id, 'am', term, 55, 100),
        days: mv(p.id, 'd', term, 62, 99),
        resp: mv(p.id, 'r', term, 58, 99),
        score: mv(p.id, 'g', term, 62, 96),
        s: normQ(`${p.name}${p.raw}${p.code}`),
      }));
      break;
    case 'faculty':
    case 'facPerf': {
      const perf = def.entity === 'facPerf';
      rows = db.faculties.map((f) => ({
        id: f.id,
        name: f.name,
        city: f.city,
        cityName: f.cityName,
        provName: f.provName,
        province: f.province,
        head: f.head,
        nP: db.professors.filter((p) => p.faculty === f.id).length,
        n: nLearn(L, 'faculty', f.id),
        days: mv(f.id, 'd', perf ? term : '', 62, 99),
        resp: mv(f.id, 'r', perf ? term : '', 58, 99),
        score: mv(f.id, 'g', perf ? term : '', 62, 96),
        s: normQ(`${f.name}${f.head}`),
      }));
      break;
    }
    case 'province':
    case 'provPerf': {
      const perf = def.entity === 'provPerf';
      rows = db.provinces.map((p) => ({
        id: p.id,
        name: p.name,
        head: p.head,
        nF: db.faculties.filter((f) => f.province === p.id).length,
        nP: db.professors.filter((x) => x.province === p.id).length,
        n: nLearn(L, 'province', p.id),
        days: mv(p.id, 'd', perf ? term : '', 62, 99),
        resp: mv(p.id, 'r', perf ? term : '', 58, 99),
        score: mv(p.id, 'g', perf ? term : '', 62, 96),
        s: normQ(`${p.name}${p.head ?? ''}`),
      }));
      break;
    }
    default:
      rows = [];
  }

  return rows;
}

export function applyFilters(
  rows: ReportRow[],
  filters: ReportFilters,
  query: string
): ReportRow[] {
  const q = normQ(query);
  const teacherSchoolId = filters.teacher
    ? getReportsDb().teachers.find((t) => t.id === filters.teacher)?.school
    : undefined;
  return rows.filter((r) => {
    if (q && !String(r.s ?? '').includes(q)) return false;
    for (const k of [
      'province',
      'city',
      'region',
      'school',
      'faculty',
      'professor',
      'status',
    ] as const) {
      const fv = filters[k];
      if (fv && r[k] !== undefined && r[k] !== fv) return false;
    }
    if (filters.teacher) {
      if (r.teacher !== undefined) {
        if (r.teacher !== filters.teacher) return false;
      } else if (r.school !== undefined) {
        // مدیران/مدارس: معلّم انتخاب‌شده باید در همان مدرسه باشد.
        if (!teacherSchoolId || r.school !== teacherSchoolId) return false;
      }
    }
    if (filters.major && r.major !== filters.major) return false;
    if (filters.course) {
      const courses = r.courses;
      if (!courses || !courses.includes(filters.course)) return false;
    }
    return true;
  });
}

function columnValue(
  row: ReportRow,
  col: ReportColumnDef
): string | number | undefined {
  const key = col.sortKey ?? col.id;
  const v = row[key];
  if (typeof v === 'string' || typeof v === 'number') return v;
  if (col.id === 'school' && row.schoolName) {
    return row.schoolName;
  }
  if (col.id === 'principal' && row.principalName) {
    return row.principalName;
  }
  if (col.id === 'prov' && row.provName) {
    return row.provName;
  }
  if (col.id === 'prof' && row.profName) {
    return row.profName;
  }
  if (col.id === 'fac' && row.facName) {
    return row.facName;
  }
  if (col.id === 'course' && row.courses?.[0]) {
    return COURSES.find((c) => c.id === row.courses![0])?.name;
  }
  return undefined;
}

export function sortRows(
  rows: ReportRow[],
  columns: ReportColumnDef[],
  sort: ReportSort | null
): ReportRow[] {
  if (!sort) return rows;
  const c = columns.find((x) => x.id === sort.id);
  if (!c || c.nosort) return rows;
  const d = sort.dir === 'asc' ? 1 : -1;
  return rows.slice().sort((a, b) => {
    const x = columnValue(a, c);
    const y = columnValue(b, c);
    if (x === undefined || y === undefined) return 0;
    return (
      (typeof x === 'number' && typeof y === 'number'
        ? x - y
        : String(x).localeCompare(String(y), 'fa')) * d
    );
  });
}

const COLUMN_DEFS: Record<ReportSlug, ReportColumnDef[]> = {
  learners: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    { id: 'major', title: 'رشته تحصیلی', kind: 'text', sortKey: 'major' },
    { id: 'course', title: 'درس', kind: 'courses', sortKey: 'course' },
    { id: 'faculty', title: 'دانشکده', kind: 'text', sortKey: 'facName' },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    {
      id: 'school',
      title: 'مدرسه',
      kind: 'two-line',
      sortKey: 'schoolName',
      secondaryKey: 'regionName',
    },
    { id: 'prof', title: 'استاد راهنما', kind: 'text', sortKey: 'profName' },
    { id: 'teacher', title: 'معلم راهنما', kind: 'text', sortKey: 'teacherName' },
  ],
  attendance: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    { id: 'major', title: 'رشته تحصیلی', kind: 'text', sortKey: 'major' },
    { id: 'course', title: 'درس', kind: 'courses', sortKey: 'course' },
    { id: 'faculty', title: 'دانشکده', kind: 'text', sortKey: 'facName' },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    {
      id: 'school',
      title: 'مدرسه',
      kind: 'two-line',
      sortKey: 'schoolName',
      secondaryKey: 'regionName',
    },
    { id: 'prof', title: 'استاد راهنما', kind: 'text', sortKey: 'profName' },
    { id: 'teacher', title: 'معلم راهنما', kind: 'text', sortKey: 'teacherName' },
    { id: 'att', title: 'درصد حضور', kind: 'percent', sortKey: 'att' },
  ],
  'professor-attendance': [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'code', title: 'کد استادی', kind: 'text', sortKey: 'code' },
    { id: 'fac', title: 'دانشکده', kind: 'text', sortKey: 'facName' },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'city', title: 'شهر', kind: 'text', sortKey: 'cityName' },
    { id: 'att', title: 'درصد حضور', kind: 'percent', sortKey: 'att' },
    {
      id: 'attProf',
      title: 'نرخ حضور استاد تایید شده توسط استاد',
      kind: 'percent',
      sortKey: 'attProf',
    },
    {
      id: 'attMgr',
      title: 'نرخ حضور استاد تایید شده توسط مدیران',
      kind: 'percent',
      sortKey: 'attMgr',
    },
  ],
  scores: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    { id: 'prof', title: 'استاد راهنما', kind: 'text', sortKey: 'profName' },
    { id: 'status', title: 'وضعیت', kind: 'status', sortKey: 'status' },
    {
      id: 'act',
      title: 'ریز نمرات',
      kind: 'scores-action',
      nosort: true,
    },
  ],
  teachers: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'code', title: 'کد پرسنلی', kind: 'text', sortKey: 'code' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    {
      id: 'school',
      title: 'مدرسه',
      kind: 'two-line',
      sortKey: 'schoolName',
      secondaryKey: 'regionName',
    },
    { id: 'n', title: 'تعداد فراگیر', kind: 'count', sortKey: 'n' },
  ],
  principals: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'code', title: 'کد پرسنلی', kind: 'text', sortKey: 'code' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    {
      id: 'school',
      title: 'مدرسه',
      kind: 'two-line',
      sortKey: 'schoolName',
      secondaryKey: 'regionName',
    },
  ],
  professors: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'code', title: 'کد استادی', kind: 'text', sortKey: 'code' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'city', title: 'شهر', kind: 'text', sortKey: 'cityName' },
    { id: 'fac', title: 'دانشکده', kind: 'text', sortKey: 'facName' },
    { id: 'courses', title: 'دروس تدریس', kind: 'text', sortKey: 'courseText' },
    { id: 'n', title: 'تعداد فراگیر', kind: 'count', sortKey: 'n' },
  ],
  schools: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    {
      id: 'principal',
      title: 'نام مدیر (کد پرسنلی)',
      kind: 'two-line',
      sortKey: 'principalName',
      secondaryKey: 'principalCode',
    },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'city', title: 'شهر', kind: 'text', sortKey: 'cityName' },
    { id: 'region', title: 'منطقه', kind: 'text', sortKey: 'regionName' },
    { id: 'nT', title: 'تعداد معلمان', kind: 'count', sortKey: 'nT' },
    { id: 'n', title: 'تعداد فراگیر', kind: 'count', sortKey: 'n' },
  ],
  'teacher-performance': [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'code', title: 'کد پرسنلی', kind: 'text', sortKey: 'code' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    {
      id: 'school',
      title: 'مدرسه',
      kind: 'two-line',
      sortKey: 'schoolName',
      secondaryKey: 'regionName',
    },
    { id: 'n', title: 'تعداد فراگیران', kind: 'count', sortKey: 'n' },
    {
      id: 'resp',
      title: 'نرخ پاسخ‌دهی به گزارش‌ها',
      kind: 'percent',
      sortKey: 'resp',
    },
  ],
  'school-performance': [
    {
      id: 'name',
      title: 'نام مدرسه',
      kind: 'two-line',
      sortKey: 'name',
      secondaryKey: 'regionName',
    },
    {
      id: 'principal',
      title: 'نام مدیر مدرسه (کد پرسنلی)',
      kind: 'two-line',
      sortKey: 'principalName',
      secondaryKey: 'principalCode',
    },
    {
      id: 'resp',
      title: 'نرخ پاسخ‌دهی به گزارش‌ها',
      kind: 'percent',
      sortKey: 'resp',
    },
    {
      id: 'score',
      title: 'میانگین نمره فراگیران',
      kind: 'percent',
      sortKey: 'score',
    },
  ],
  'professor-performance': [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'code', title: 'کد استادی', kind: 'text', sortKey: 'code' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    {
      id: 'days',
      title: 'میانگین روزهای حضور نسبت به کل جلسات',
      kind: 'percent',
      sortKey: 'days',
    },
    {
      id: 'resp',
      title: 'نرخ پاسخ‌دهی به گزارش‌ها',
      kind: 'percent',
      sortKey: 'resp',
    },
    {
      id: 'score',
      title: 'میانگین نمره فراگیران',
      kind: 'percent',
      sortKey: 'score',
    },
  ],
  faculties: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'prov', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'city', title: 'شهر', kind: 'text', sortKey: 'cityName' },
    { id: 'head', title: 'رئیس دانشکده', kind: 'text', sortKey: 'head' },
    { id: 'nP', title: 'تعداد اساتید', kind: 'count', sortKey: 'nP' },
    { id: 'n', title: 'تعداد فراگیران', kind: 'count', sortKey: 'n' },
  ],
  provinces: [
    { id: 'name', title: 'نام استان', kind: 'text', sortKey: 'name' },
    { id: 'head', title: 'رئیس دانشگاه استانی', kind: 'text', sortKey: 'head' },
    { id: 'nF', title: 'تعداد دانشکده‌ها', kind: 'count', sortKey: 'nF' },
    { id: 'nP', title: 'تعداد اساتید', kind: 'count', sortKey: 'nP' },
    { id: 'n', title: 'تعداد فراگیران', kind: 'count', sortKey: 'n' },
  ],
  'faculty-performance': [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'prov', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'city', title: 'شهر', kind: 'text', sortKey: 'cityName' },
    {
      id: 'days',
      title: 'میانگین روزهای حضور نسبت به کل جلسات',
      kind: 'percent',
      sortKey: 'days',
    },
    {
      id: 'resp',
      title: 'نرخ پاسخ‌دهی به گزارش‌ها',
      kind: 'percent',
      sortKey: 'resp',
    },
    {
      id: 'score',
      title: 'میانگین نمره فراگیران',
      kind: 'percent',
      sortKey: 'score',
    },
  ],
  'province-performance': [
    { id: 'name', title: 'نام استان', kind: 'text', sortKey: 'name' },
    {
      id: 'head',
      title: 'نام رئیس دانشگاه استانی',
      kind: 'text',
      sortKey: 'head',
    },
    {
      id: 'days',
      title: 'میانگین روزهای حضور نسبت به کل جلسات',
      kind: 'percent',
      sortKey: 'days',
    },
    {
      id: 'resp',
      title: 'نرخ پاسخ‌دهی به گزارش‌ها',
      kind: 'percent',
      sortKey: 'resp',
    },
    {
      id: 'score',
      title: 'میانگین نمره فراگیران',
      kind: 'percent',
      sortKey: 'score',
    },
  ],
};

export function getColumnDefs(slug: ReportSlug): ReportColumnDef[] {
  return COLUMN_DEFS[slug];
}

const CASCADE: ReportFilterKey[] = [
  'province',
  'city',
  'region',
  'school',
  'faculty',
];

type GeoEntity = {
  id: string;
  name: string;
  province?: string;
  city?: string;
  region?: string;
  school?: string;
  faculty?: string;
};

function cascadeOk(
  item: GeoEntity,
  sel: Partial<Record<(typeof CASCADE)[number], string>>,
  facDom: boolean,
  targetKey: ReportFilterKey
): boolean {
  return CASCADE.every((a) => {
    if (
      a === 'city' &&
      !facDom &&
      (targetKey === 'faculty' || targetKey === 'professor')
    ) {
      return true;
    }
    const field = item[a as keyof GeoEntity];
    if (field === undefined || !sel[a] || field === sel[a]) return true;
    return false;
  });
}

export function getFilterCatalog(): ReportFilterCatalog {
  const db = getReportsDb();
  return {
    provinces: db.provinces.map((p) => ({ value: p.id, label: p.name })),
    cities: db.cities.map((c) => ({ value: c.id, label: c.name })),
    regions: db.regions.map((r) => ({ value: r.id, label: r.name })),
    schools: db.schools.map((s) => ({ value: s.id, label: s.name })),
    faculties: db.faculties.map((f) => ({ value: f.id, label: f.name })),
    professors: db.professors.map((p) => ({ value: p.id, label: p.name })),
    teachers: db.teachers.map((t) => ({ value: t.id, label: t.name })),
    courses: COURSES.map((c) => ({ value: c.id, label: c.name })),
    majors: MAJORS.map((m) => ({ value: m, label: m })),
    statuses: STATUS_OPTIONS,
    terms: [
      ...TERMS.map((t) => ({
        value: t.id,
        label: t.label,
        group: 'ترمی',
      })),
      ...MODULES.map((m) => ({
        value: m.id,
        label: m.label,
        group: 'پودمانی',
      })),
    ],
    modules: MODULES.map((m) => ({ value: m.id, label: m.label })),
  };
}

export function getFilterOptions(
  key: ReportFilterKey | 'term',
  filters: ReportFilters,
  slug: ReportSlug
): ReportOption[] {
  const db = getReportsDb();
  const facDom = !!REPORT_PAGE_DEFS[slug].fac;
  const sel: Partial<Record<(typeof CASCADE)[number], string>> = {};
  CASCADE.forEach((a) => {
    sel[a] = filters[a];
  });

  if (key === 'term') {
    return [
      ...TERMS.map((t) => ({ value: t.id, label: t.label, group: 'ترمی' })),
      ...MODULES.map((m) => ({
        value: m.id,
        label: m.label,
        group: 'پودمانی',
      })),
    ];
  }
  if (key === 'course') {
    return COURSES.map((c) => ({ value: c.id, label: c.name }));
  }
  if (key === 'major') {
    return MAJORS.map((m) => ({ value: m, label: m }));
  }
  if (key === 'status') {
    return STATUS_OPTIONS;
  }

  let items: GeoEntity[] = [];
  if (key === 'province') items = db.provinces;
  else if (key === 'city') items = db.cities;
  else if (key === 'region') items = db.regions;
  else if (key === 'school') items = db.schools;
  else if (key === 'faculty') items = db.faculties;
  else if (key === 'professor') items = db.professors;
  else if (key === 'teacher') items = db.teachers;
  else return [];

  return items
    .filter((it) => cascadeOk(it, sel, facDom, key))
    .map((it) => ({ value: it.id, label: it.name }));
}

export function queryReport(input: ReportQueryInput): ReportQueryResult {
  const columns = getColumnDefs(input.slug);
  const pageSize = input.pageSize ?? PAGE_SIZE;
  let rows = buildRows(input.slug, input.period);
  rows = applyFilters(rows, input.filters, input.query);
  rows = sortRows(rows, columns, input.sort);
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, input.page), pages);
  const from = (page - 1) * pageSize;
  const slice = rows.slice(from, from + pageSize);
  return {
    rows: slice,
    total,
    page,
    pageSize,
    columns,
  };
}

function periodLabel(period: ReportPeriodState): string {
  const list = period.mode === 'term' ? TERMS : MODULES;
  const id = periodId(period);
  const found = list.find((o) => o.id === id);
  return found ? found.label.replace(' (جاری)', '') : '';
}

export function getLearnerCourseDetails(
  learnerId: string,
  period: ReportPeriodState
): ReportLearnerCourseDetail | null {
  const db = getReportsDb();
  const learner = db.learners.find((x) => x.id === learnerId);
  if (!learner) return null;
  return {
    learnerId: learner.id,
    learnerName: learner.name,
    periodLabel: periodLabel(period),
    courses: learner.courses.map((cid) => {
      const c = COURSES.find((x) => x.id === cid)!;
      return { id: c.id, name: c.name, code: c.code };
    }),
  };
}

function sessionScores(
  learnerId: string,
  courseId: string,
  pid: string
): (number | null)[] {
  const n = 6 + (courseId.charCodeAt(1) % 3);
  return Array.from({ length: n }, (_, i) =>
    hsh(`${learnerId}${courseId}${i}${pid}`) < 0.08
      ? null
      : Math.round(45 + hsh(`${learnerId}${courseId}x${i}${pid}`) * 55)
  );
}

export function getLearnerScoreDetails(
  learnerId: string,
  period: ReportPeriodState
): ReportLearnerScoreDetail | null {
  const db = getReportsDb();
  const learner = db.learners.find((x) => x.id === learnerId);
  if (!learner) return null;
  const pid = periodId(period);
  return {
    learnerId: learner.id,
    learnerName: learner.name,
    periodLabel: periodLabel(period),
    courses: learner.courses.map((cid) => {
      const c = COURSES.find((x) => x.id === cid)!;
      const sc = sessionScores(learner.id, cid, pid);
      const got = sc.filter((v): v is number => v !== null);
      const average = got.length
        ? Math.round(got.reduce((a, b) => a + b, 0) / got.length)
        : null;
      return {
        id: c.id,
        name: c.name,
        average,
        sessions: sc,
      };
    }),
  };
}

type CompareDef = {
  metrics: ReportCompareMetric[];
  subtitle: (row: ReportRow) => string;
  info: { label: string; value: (row: ReportRow) => string }[];
};

const CMP_DEFS: Partial<Record<ReportSlug, CompareDef>> = {
  attendance: {
    metrics: [{ key: 'att', title: 'درصد حضور جلسات' }],
    subtitle: (r) => String(r.facName ?? ''),
    info: [
      { label: 'دانشکده', value: (r) => String(r.facName ?? '') },
      { label: 'استان', value: (r) => String(r.provName ?? '') },
      { label: 'رشته تحصیلی', value: (r) => String(r.major ?? '') },
      { label: 'استاد راهنما', value: (r) => String(r.profName ?? '') },
      { label: 'مدرسه', value: (r) => String(r.schoolName ?? '') },
    ],
  },
  'professor-attendance': {
    metrics: [{ key: 'att', title: 'درصد حضور جلسات' }],
    subtitle: (r) => String(r.facName ?? ''),
    info: [
      { label: 'دانشکده', value: (r) => String(r.facName ?? '') },
      { label: 'استان', value: (r) => String(r.provName ?? '') },
      { label: 'کد استادی', value: (r) => String(r.code ?? '') },
    ],
  },
  'teacher-performance': {
    metrics: [{ key: 'resp', title: 'نرخ پاسخ‌دهی به گزارش‌ها' }],
    subtitle: (r) => String(r.schoolName ?? ''),
    info: [
      { label: 'مدرسه', value: (r) => String(r.schoolName ?? '') },
      {
        label: 'شهر و منطقه',
        value: (r) => `${r.cityName ?? ''}، ${r.regionName ?? ''}`,
      },
      { label: 'کد پرسنلی', value: (r) => String(r.code ?? '') },
    ],
  },
  'school-performance': {
    metrics: [
      { key: 'resp', title: 'نرخ پاسخ‌دهی به گزارش‌ها' },
      { key: 'score', title: 'میانگین نمره فراگیران' },
    ],
    subtitle: (r) => `${r.cityName ?? ''}، ${r.regionName ?? ''}`,
    info: [
      { label: 'مدیر مدرسه', value: (r) => String(r.principalName ?? '') },
      {
        label: 'شهر و منطقه',
        value: (r) => `${r.cityName ?? ''}، ${r.regionName ?? ''}`,
      },
    ],
  },
  'professor-performance': {
    metrics: [
      { key: 'days', title: 'میانگین روزهای حضور نسبت به کل جلسات' },
      { key: 'resp', title: 'نرخ پاسخ‌دهی به گزارش‌ها' },
      { key: 'score', title: 'میانگین نمره فراگیران' },
    ],
    subtitle: (r) => String(r.facName ?? ''),
    info: [
      { label: 'دانشکده', value: (r) => String(r.facName ?? '') },
      { label: 'استان', value: (r) => String(r.provName ?? '') },
      { label: 'کد استادی', value: (r) => String(r.code ?? '') },
    ],
  },
  'faculty-performance': {
    metrics: [
      { key: 'days', title: 'میانگین روزهای حضور نسبت به کل جلسات' },
      { key: 'resp', title: 'نرخ پاسخ‌دهی به گزارش‌ها' },
      { key: 'score', title: 'میانگین نمره فراگیران' },
    ],
    subtitle: (r) => `${r.provName ?? ''}، ${r.cityName ?? ''}`,
    info: [
      { label: 'استان', value: (r) => String(r.provName ?? '') },
      { label: 'شهر', value: (r) => String(r.cityName ?? '') },
      { label: 'رئیس دانشکده', value: (r) => String(r.head ?? '') },
    ],
  },
  'province-performance': {
    metrics: [
      { key: 'days', title: 'میانگین روزهای حضور نسبت به کل جلسات' },
      { key: 'resp', title: 'نرخ پاسخ‌دهی به گزارش‌ها' },
      { key: 'score', title: 'میانگین نمره فراگیران' },
    ],
    subtitle: (r) => String(r.head ?? ''),
    info: [
      {
        label: 'رئیس دانشگاه استانی',
        value: (r) => String(r.head ?? ''),
      },
    ],
  },
};

export function getCompareItems(
  slug: ReportSlug,
  ids: string[],
  period: ReportPeriodState
): ReportCompareItem[] {
  const def = CMP_DEFS[slug];
  if (!def) return [];
  const byId: Record<string, ReportRow> = {};
  buildRows(slug, period).forEach((r) => {
    byId[r.id] = r;
  });
  return ids
    .map((id) => byId[id])
    .filter((r): r is ReportRow => Boolean(r))
    .map((r) => {
      const metrics: Record<string, number> = {};
      def.metrics.forEach((m) => {
        const v = r[m.key];
        if (typeof v === 'number') metrics[m.key] = v;
      });
      return {
        id: r.id,
        name: String(r.name ?? ''),
        subtitle: def.subtitle(r),
        metrics,
        info: def.info.map((item) => ({
          label: item.label,
          value: item.value(r),
        })),
      };
    });
}
