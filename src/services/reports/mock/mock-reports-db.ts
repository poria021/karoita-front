import { toPersianDigits } from '@/utils/persianDigits';

/** نرمال‌سازی عبارت جستجو — هم‌تراز پروتوتایپ HTML. */
export function normQ(s: string | undefined | null): string {
  return String(s ?? '')
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌\s]+/g, '')
    .toLowerCase();
}

function rng(seed: number): () => number {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hsh(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const PROV = ['تهران', 'خراسان رضوی', 'اصفهان', 'فارس', 'آذربایجان شرقی'];
const CITIES = [
  ['تهران', 'ری'],
  ['مشهد', 'نیشابور'],
  ['اصفهان', 'کاشان'],
  ['شیراز', 'مرودشت'],
  ['تبریز', 'مراغه'],
];
const SCH_NAMES = [
  'شهید بهشتی',
  'علامه طباطبایی',
  'فرزانگان',
  'امام خمینی',
  'نمونه دولتی',
  'ابن‌سینا',
  'حکیم فردوسی',
  'خوارزمی',
  'مطهری',
  'شهید چمران',
  'البرز',
  'سعدی',
  'شهید مفتح',
  'فاطمیه',
  'آیت‌الله طالقانی',
  'دکتر حسابی',
  'شهید رجایی',
  'کوثر',
  'شهید باهنر',
  'مولوی',
];

export const MAJORS = [
  'علوم تربیتی',
  'آموزش ابتدایی',
  'ریاضی',
  'فیزیک',
  'ادبیات فارسی',
  'زیست‌شناسی',
  'شیمی',
  'زبان انگلیسی',
  'فنی و مهندسی',
];

export type ReportsCourse = { id: string; name: string; code: string };

export const COURSES: ReportsCourse[] = [
  'مبانی آموزش و پرورش',
  'روان‌شناسی رشد',
  'روش‌های تدریس',
  'مدیریت کلاس',
  'ارزشیابی آموزشی',
  'فناوری آموزشی',
  'تربیت‌بدنی و سلامت',
  'ادبیات فارسی کاربردی',
  'ریاضی عمومی',
  'علوم تجربی',
].map((n, i) => ({
  id: `k${i}`,
  name: n,
  code: toPersianDigits(2010 + i * 11),
}));

export type ReportsProvince = { id: string; name: string; head?: string };
export type ReportsCity = { id: string; name: string; province: string };
export type ReportsRegion = {
  id: string;
  name: string;
  city: string;
  province: string;
};
export type ReportsPrincipal = {
  name: string;
  code: string;
  phone: string;
  raw: string;
};
export type ReportsSchool = {
  id: string;
  name: string;
  region: string;
  regionName: string;
  city: string;
  cityName: string;
  province: string;
  provName: string;
  principal: ReportsPrincipal;
};
export type ReportsTeacher = {
  id: string;
  name: string;
  code: string;
  phone: string;
  raw: string;
  school: string;
  schoolName: string;
  region: string;
  regionName: string;
  city: string;
  cityName: string;
  province: string;
  provName: string;
};
export type ReportsFaculty = {
  id: string;
  name: string;
  city: string;
  cityName: string;
  province: string;
  provName: string;
  head: string;
};
export type ReportsProfessor = {
  id: string;
  name: string;
  code: string;
  phone: string;
  raw: string;
  faculty: string;
  facName: string;
  city: string;
  cityName: string;
  province: string;
  provName: string;
  courses: string[];
};
export type ReportsLearner = {
  id: string;
  name: string;
  phone: string;
  major: string;
  courses: string[];
  school: string;
  schoolName: string;
  city: string;
  cityName: string;
  region: string;
  regionName: string;
  province: string;
  provName: string;
  teacher: string;
  teacherName: string;
  professor: string;
  profName: string;
  faculty: string;
  facName: string;
  s: string;
};

export type ReportsDb = {
  provinces: ReportsProvince[];
  cities: ReportsCity[];
  regions: ReportsRegion[];
  schools: ReportsSchool[];
  teachers: ReportsTeacher[];
  faculties: ReportsFaculty[];
  professors: ReportsProfessor[];
  learners: ReportsLearner[];
};

function buildReportsDb(): ReportsDb {
  const R = rng(1405);
  const pick = <T,>(a: readonly T[]): T => a[Math.floor(R() * a.length)];
  const skew = (n: number, p: number) =>
    Math.min(n - 1, Math.floor(R() ** p * n));
  const FM = [
    'علی',
    'محمد',
    'حسین',
    'رضا',
    'امیر',
    'مهدی',
    'سعید',
    'حمید',
    'احسان',
    'بهروز',
    'کامران',
    'پویا',
  ];
  const FF = [
    'سارا',
    'مریم',
    'زهرا',
    'فاطمه',
    'نرگس',
    'الهام',
    'نازنین',
    'مینا',
    'سمیرا',
    'لیلا',
    'پریسا',
    'هانیه',
  ];
  const LN = [
    'احمدی',
    'محمدی',
    'رضایی',
    'حسینی',
    'کریمی',
    'موسوی',
    'جعفری',
    'صادقی',
    'قاسمی',
    'نوری',
    'اکبری',
    'رحیمی',
    'صالحی',
    'فرهادی',
    'یوسفی',
    'زارعی',
    'کاظمی',
    'عباسی',
    'طاهری',
    'مرادی',
    'سلیمانی',
    'شریفی',
  ];
  const nm = () => `${pick(R() < 0.5 ? FM : FF)} ${pick(LN)}`;
  const phone = () => {
    const d = `09${1 + Math.floor(R() * 3)}${String(Math.floor(R() * 1e8)).padStart(8, '0')}`;
    return {
      raw: d,
      fa: toPersianDigits(
        `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
      ),
    };
  };
  const code = (base: string) =>
    toPersianDigits(base + String(Math.floor(R() * 89999 + 10000)));

  const provinces: ReportsProvince[] = PROV.map((n, i) => ({ id: `p${i}`, name: n }));
  const cities: ReportsCity[] = [];
  const regions: ReportsRegion[] = [];
  const schools: ReportsSchool[] = [];
  const teachers: ReportsTeacher[] = [];
  const faculties: ReportsFaculty[] = [];
  const professors: ReportsProfessor[] = [];
  let rc = 0;
  let sc = 0;
  let tc = 0;
  let pc = 0;

  provinces.forEach((p, pi) => {
    CITIES[pi].forEach((cn, ci) => {
      const city: ReportsCity = { id: `c${pi}${ci}`, name: cn, province: p.id };
      cities.push(city);
      for (let k = 0; k < 2; k += 1) {
        rc += 1;
        const reg: ReportsRegion = {
          id: `r${rc}`,
          name: `منطقه ${toPersianDigits(rc)}`,
          city: city.id,
          province: p.id,
        };
        regions.push(reg);
        for (let j = 0; j < 2; j += 1) {
          const idx = sc;
          sc += 1;
          const ph = phone();
          const sch: ReportsSchool = {
            id: `s${idx}`,
            name: `دبیرستان ${SCH_NAMES[idx % 20]}${idx < 20 ? ' (پسرانه)' : ' (دخترانه)'}`,
            region: reg.id,
            regionName: reg.name,
            city: city.id,
            cityName: cn,
            province: p.id,
            provName: p.name,
            principal: {
              name: nm(),
              code: code('۴۲'),
              phone: ph.fa,
              raw: ph.raw,
            },
          };
          schools.push(sch);
          for (let t = 0; t < 2; t += 1) {
            const tp = phone();
            teachers.push({
              id: `t${tc}`,
              name: nm(),
              code: code('۵۱'),
              phone: tp.fa,
              raw: tp.raw,
              school: sch.id,
              schoolName: sch.name,
              region: reg.id,
              regionName: reg.name,
              city: city.id,
              cityName: cn,
              province: p.id,
              provName: p.name,
            });
            tc += 1;
          }
        }
      }
    });
    (
      [
        ['دانشکده علوم تربیتی ', 0],
        ['دانشکده فنی و حرفه‌ای ', 1],
      ] as const
    ).forEach((f, fi) => {
      const fac: ReportsFaculty = {
        id: `f${pi}${fi}`,
        name: f[0] + CITIES[pi][fi],
        city: `c${pi}${fi}`,
        cityName: CITIES[pi][fi],
        province: p.id,
        provName: p.name,
        head: `دکتر ${nm()}`,
      };
      faculties.push(fac);
      for (let k = 0; k < 3; k += 1) {
        const pp = phone();
        const cs: string[] = [];
        while (cs.length < 2 + (k % 2)) {
          const c = pick(COURSES).id;
          if (!cs.includes(c)) cs.push(c);
        }
        professors.push({
          id: `pr${pc}`,
          name: `دکتر ${nm()}`,
          code: code('۳۱'),
          phone: pp.fa,
          raw: pp.raw,
          faculty: fac.id,
          facName: fac.name,
          city: fac.city,
          cityName: fac.cityName,
          province: p.id,
          provName: p.name,
          courses: cs,
        });
        pc += 1;
      }
    });
    p.head = `دکتر ${nm()}`;
  });

  const learners: ReportsLearner[] = [];
  const cum = [0.4, 0.6, 0.75, 0.9, 1];
  for (let i = 0; i < 240; i += 1) {
    const r0 = R();
    const pi = cum.findIndex((c) => r0 <= c);
    const pid = `p${pi}`;
    const sl = schools.filter((s) => s.province === pid);
    const sch = sl[skew(sl.length, 1.8)];
    const tl = teachers.filter((t) => t.school === sch.id);
    const tea = tl[R() < 0.7 ? 0 : 1];
    const pl = professors.filter((x) => x.province === pid);
    const prof = pl[skew(pl.length, 1.6)];
    const cs: string[] = [];
    const n = R() < 0.55 ? 1 : R() < 0.6 ? 2 : 3;
    while (cs.length < n) {
      const c = pick(COURSES).id;
      if (!cs.includes(c)) cs.push(c);
    }
    const ph = phone();
    const name = nm();
    const major = pick(MAJORS);
    learners.push({
      id: `l${i}`,
      name,
      phone: ph.fa,
      major,
      courses: cs,
      school: sch.id,
      schoolName: sch.name,
      city: sch.city,
      cityName: sch.cityName,
      region: sch.region,
      regionName: sch.regionName,
      province: pid,
      provName: PROV[pi],
      teacher: tea.id,
      teacherName: tea.name,
      professor: prof.id,
      profName: prof.name,
      faculty: prof.faculty,
      facName: prof.facName,
      s: normQ(`${name}${ph.raw}${major}`),
    });
  }

  return {
    provinces,
    cities,
    regions,
    schools,
    teachers,
    faculties,
    professors,
    learners,
  };
}

let dbSingleton: ReportsDb | null = null;

export function getReportsDb(): ReportsDb {
  if (!dbSingleton) {
    dbSingleton = buildReportsDb();
  }
  return dbSingleton;
}
