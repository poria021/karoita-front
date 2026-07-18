import type { OrgStructureSnapshot } from '@/types/org-structure';

/**
 * Initial mock org tree — kept aligned with profile
 * `organization-catalog` labels so selects and this module share one seed story.
 */

const BRANCHES: Array<{
  province: string;
  cities: string[];
  colleges: string[];
  districts: Array<{ name: string; schools: string[] }>;
}> = [
  {
    province: 'تهران',
    cities: ['تهران', 'ری', 'شمیرانات'],
    colleges: ['پردیس شهید باهنر تهران', 'دانشگاه فرهنگیان نسیبه تهران'],
    districts: [
      { name: 'ناحیه ۱ تهران', schools: ['دبیرستان ماندگار البرز', 'مدرسه فرهنگ'] },
      { name: 'ناحیه ۲ تهران', schools: ['دبیرستان شهید بهشتی', 'هنرستان آزادی'] },
    ],
  },
  {
    province: 'اصفهان',
    cities: ['اصفهان', 'کاشان', 'نجف‌آباد'],
    colleges: ['پردیس شهید باهنر اصفهان', 'مرکز آموزش عالی کاشان'],
    districts: [
      { name: 'ناحیه ۱ اصفهان', schools: ['دبیرستان سعدی', 'هنرستان امیرکبیر'] },
      { name: 'ناحیه ۲ اصفهان', schools: ['دبیرستان صارمیه', 'مدرسه ادب'] },
    ],
  },
  {
    province: 'فارس',
    cities: ['شیراز', 'مرودشت', 'جهرم'],
    colleges: ['پردیس شهید رجایی فارس', 'مرکز آموزش عالی شیراز'],
    districts: [
      { name: 'ناحیه ۱ شیراز', schools: ['دبیرستان نمازی', 'هنرستان دستغیب'] },
      { name: 'ناحیه ۲ شیراز', schools: ['دبیرستان توحید', 'مدرسه ملاصدرا'] },
    ],
  },
  {
    province: 'خراسان رضوی',
    cities: ['مشهد', 'نیشابور', 'سبزوار'],
    colleges: ['پردیس شهید بهشتی مشهد', 'مرکز آموزش عالی نیشابور'],
    districts: [
      { name: 'ناحیه ۱ مشهد', schools: ['دبیرستان هاشمیه', 'هنرستان رضوی'] },
      { name: 'ناحیه ۲ مشهد', schools: ['دبیرستان امام رضا', 'مدرسه فرهنگ'] },
    ],
  },
  {
    province: 'آذربایجان شرقی',
    cities: ['تبریز', 'مراغه', 'مرند'],
    colleges: ['پردیس علامه امینی تبریز', 'مرکز آموزش عالی مراغه'],
    districts: [
      { name: 'ناحیه ۱ تبریز', schools: ['دبیرستان فردوسی', 'هنرستان نجات'] },
      { name: 'ناحیه ۲ تبریز', schools: ['دبیرستان پروین', 'مدرسه رشد'] },
    ],
  },
];

const MAJOR_NAMES: string[] = [
  // Intentionally empty so the «رشته‌ها» tab shows KvEmptyState in mock DX.
];

let seq = 1;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

/** Build hierarchical mock snapshot (string ids). */
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
          gender: 'mixed',
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
