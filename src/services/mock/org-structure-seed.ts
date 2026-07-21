import type { OrgStructureSnapshot } from '@/types/org-structure';

/**
 * Seed بزرگ‌تر از یک صفحه (DEFAULT_PAGE_LIMIT=10) تا paging جدول‌های ادمین
 * در mock قابل مشاهده باشد.
 */
const BRANCHES: Array<{
  province: string;
  cities: string[];
  colleges: string[];
  districts: Array<{ name: string; schools: string[] }>;
}> = [
  {
    province: 'تهران',
    cities: ['تهران', 'ری', 'شمیرانات', 'ورامین', 'شهریار'],
    colleges: [
      'پردیس شهید باهنر تهران',
      'دانشگاه فرهنگیان نسیبه تهران',
      'پردیس شهید مفتح تهران',
    ],
    districts: [
      {
        name: 'ناحیه ۱ تهران',
        schools: ['دبیرستان ماندگار البرز', 'مدرسه فرهنگ', 'هنرستان آزادی'],
      },
      {
        name: 'ناحیه ۲ تهران',
        schools: ['دبیرستان شهید بهشتی', 'مدرسه رشد', 'هنرستان انقلاب'],
      },
      {
        name: 'ناحیه ۳ تهران',
        schools: ['دبیرستان خوارزمی', 'مدرسه نور'],
      },
    ],
  },
  {
    province: 'اصفهان',
    cities: ['اصفهان', 'کاشان', 'نجف‌آباد', 'خمینی‌شهر'],
    colleges: [
      'پردیس شهید باهنر اصفهان',
      'مرکز آموزش عالی کاشان',
      'پردیس فاطمه الزهرا اصفهان',
    ],
    districts: [
      {
        name: 'ناحیه ۱ اصفهان',
        schools: ['دبیرستان سعدی', 'هنرستان امیرکبیر', 'مدرسه ادب'],
      },
      {
        name: 'ناحیه ۲ اصفهان',
        schools: ['دبیرستان صارمیه', 'هنرستان فنی شهید بهشتی'],
      },
    ],
  },
  {
    province: 'فارس',
    cities: ['شیراز', 'مرودشت', 'جهرم', 'لار'],
    colleges: ['پردیس شهید رجایی فارس', 'مرکز آموزش عالی شیراز'],
    districts: [
      {
        name: 'ناحیه ۱ شیراز',
        schools: ['دبیرستان نمازی', 'هنرستان دستغیب', 'مدرسه ملاصدرا'],
      },
      {
        name: 'ناحیه ۲ شیراز',
        schools: ['دبیرستان توحید', 'هنرستان صدرا'],
      },
    ],
  },
  {
    province: 'خراسان رضوی',
    cities: ['مشهد', 'نیشابور', 'سبزوار', 'قوچان'],
    colleges: [
      'پردیس شهید بهشتی مشهد',
      'مرکز آموزش عالی نیشابور',
      'پردیس شهید هاشمی نژاد مشهد',
    ],
    districts: [
      {
        name: 'ناحیه ۱ مشهد',
        schools: ['دبیرستان هاشمیه', 'هنرستان رضوی', 'مدرسه فرهنگ'],
      },
      {
        name: 'ناحیه ۲ مشهد',
        schools: ['دبیرستان امام رضا', 'هنرستان توس'],
      },
    ],
  },
  {
    province: 'آذربایجان شرقی',
    cities: ['تبریز', 'مراغه', 'مرند', 'اهر'],
    colleges: ['پردیس علامه امینی تبریز', 'مرکز آموزش عالی مراغه'],
    districts: [
      {
        name: 'ناحیه ۱ تبریز',
        schools: ['دبیرستان فردوسی', 'هنرستان نجات', 'مدرسه رشد'],
      },
      {
        name: 'ناحیه ۲ تبریز',
        schools: ['دبیرستان پروین', 'هنرستان سبلان'],
      },
    ],
  },
  {
    province: 'خوزستان',
    cities: ['اهواز', 'آبادان', 'دزفول', 'ماهشهر'],
    colleges: ['پردیس حضرت رسول اهواز', 'مرکز آموزش عالی دزفول'],
    districts: [
      {
        name: 'ناحیه ۱ اهواز',
        schools: ['دبیرستان رازی', 'هنرستان کارون', 'مدرسه اندیشه'],
      },
      {
        name: 'ناحیه ۲ اهواز',
        schools: ['دبیرستان شهید چمران', 'هنرستان نفت'],
      },
    ],
  },
  {
    province: 'گیلان',
    cities: ['رشت', 'انزلی', 'لاهیجان', 'آستارا'],
    colleges: ['پردیس امام خمینی رشت', 'مرکز آموزش عالی لاهیجان'],
    districts: [
      {
        name: 'ناحیه ۱ رشت',
        schools: ['دبیرستان شهید بهشتی رشت', 'هنرستان گیلان'],
      },
      {
        name: 'ناحیه ۲ رشت',
        schools: ['دبیرستان میرزا کوچک', 'مدرسه سپیدرود'],
      },
    ],
  },
  {
    province: 'مازندران',
    cities: ['ساری', 'بابل', 'آمل', 'قائم‌شهر'],
    colleges: ['پردیس دکتر شریعتی ساری', 'مرکز آموزش عالی بابل'],
    districts: [
      {
        name: 'ناحیه ۱ ساری',
        schools: ['دبیرستان شاهد ساری', 'هنرستان مازندران'],
      },
      {
        name: 'ناحیه ۲ ساری',
        schools: ['دبیرستان فرهنگ', 'مدرسه البرز ساری'],
      },
    ],
  },
  {
    province: 'کرمان',
    cities: ['کرمان', 'رفسنجان', 'سیرجان', 'جیرفت'],
    colleges: ['پردیس شهید باهنر کرمان', 'مرکز آموزش عالی رفسنجان'],
    districts: [
      {
        name: 'ناحیه ۱ کرمان',
        schools: ['دبیرستان خواجه نصیر', 'هنرستان کرمان'],
      },
      {
        name: 'ناحیه ۲ کرمان',
        schools: ['دبیرستان شهید باهنر', 'مدرسه کویر'],
      },
    ],
  },
  {
    province: 'یزد',
    cities: ['یزد', 'اردکان', 'میبد', 'مهریز'],
    colleges: ['پردیس فاطمه الزهرا یزد', 'مرکز آموزش عالی اردکان'],
    districts: [
      {
        name: 'ناحیه ۱ یزد',
        schools: ['دبیرستان ایرانشهر', 'هنرستان یزد'],
      },
      {
        name: 'ناحیه ۲ یزد',
        schools: ['دبیرستان ابوذر', 'مدرسه قنات'],
      },
    ],
  },
  {
    province: 'هرمزگان',
    cities: ['بندرعباس', 'میناب', 'قشم', 'کیش'],
    colleges: ['پردیس شهید رجایی بندرعباس', 'مرکز آموزش عالی میناب'],
    districts: [
      {
        name: 'ناحیه ۱ بندرعباس',
        schools: ['دبیرستان خلیج فارس', 'هنرستان هرمز'],
      },
      {
        name: 'ناحیه ۲ بندرعباس',
        schools: ['دبیرستان شهید حقانی', 'مدرسه ساحل'],
      },
    ],
  },
  {
    province: 'سیستان و بلوچستان',
    cities: ['زاهدان', 'چابهار', 'ایرانشهر', 'زابل'],
    colleges: ['پردیس رسالت زاهدان', 'مرکز آموزش عالی چابهار'],
    districts: [
      {
        name: 'ناحیه ۱ زاهدان',
        schools: ['دبیرستان وحدت', 'هنرستان زاهدان'],
      },
      {
        name: 'ناحیه ۲ زاهدان',
        schools: ['دبیرستان شهید مطهری', 'مدرسه نور زاهدان'],
      },
    ],
  },
];

const MAJOR_NAMES: string[] = [
  'آموزش ابتدایی',
  'آموزش ریاضی',
  'آموزش فیزیک',
  'آموزش شیمی',
  'آموزش زیست‌شناسی',
  'آموزش زبان انگلیسی',
  'آموزش زبان و ادبیات فارسی',
  'آموزش علوم اجتماعی',
  'آموزش تاریخ',
  'آموزش جغرافیا',
  'آموزش تربیت بدنی',
  'آموزش هنر',
  'مشاوره تحصیلی',
  'روان‌شناسی تربیتی',
  'تکنولوژی آموزشی',
  'مدیریت آموزشی',
  'الکترونیک صنعتی',
  'مهندسی کامپیوتر',
];

let seq = 1;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

export function buildOrgStructureSeed(): OrgStructureSnapshot {
  seq = 1000;
  const provinces: OrgStructureSnapshot['provinces'] = [];
  const cities: OrgStructureSnapshot['cities'] = [];
  const faculties: OrgStructureSnapshot['faculties'] = [];
  const districts: OrgStructureSnapshot['districts'] = [];
  const schools: OrgStructureSnapshot['schools'] = [];

  for (const branch of BRANCHES) {
    const provinceId = nextId('prov');
    provinces.push({ id: provinceId, name: branch.province });

    const cityIds: string[] = [];
    for (const cityName of branch.cities) {
      const cityId = nextId('city');
      cityIds.push(cityId);
      cities.push({ id: cityId, name: cityName, provinceId });
    }
    const primaryCityId = cityIds[0]!;

    for (const college of branch.colleges) {
      faculties.push({
        id: nextId('fac'),
        name: college,
        provinceId,
        cityId: primaryCityId,
      });
    }

    branch.districts.forEach((district, index) => {
      const districtId = nextId('dist');
      const cityId = cityIds[Math.min(index, cityIds.length - 1)]!;
      districts.push({
        id: districtId,
        name: district.name,
        provinceId,
        cityId,
      });
      for (const schoolName of district.schools) {
        schools.push({
          id: nextId('sch'),
          name: schoolName,
          provinceId,
          cityId,
          districtId,
          gender: 'male',
        });
      }
    });
  }

  const majors = MAJOR_NAMES.map((name) => ({
    id: nextId('maj'),
    name,
  }));

  return { provinces, cities, faculties, districts, schools, majors };
}
