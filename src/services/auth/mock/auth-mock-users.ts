import type { DocStatus, User, UserRole } from '@/types/auth';


export const MOCK_OTP_CODE = '12345';

export const MOCK_USER_PASSWORD = '12345678';

export const MOCK_SUPER_ADMIN_MOBILE = '9123456786';

/** سوپروایزر تأییدشده برای smoke/e2e ماژول ظرفیت و تأیید روزانه. */
export const MOCK_SUPERVISOR_MOBILE = '9123456787';

/** با تغییر شکل seed بالا ببر تا mock در localStorage دوباره hydrate شود. */
export const MOCK_USERS_SEED_VERSION = '10';

export interface MockAuthUserRecord extends User {
  password: string;
  hasPassword: boolean;
}

interface MockUserSeed {
  id: string;
  name: string;
  role: UserRole;
  mobile?: string;
  docStatus?: DocStatus;
  approved?: boolean;
  adminRequestMessage?: string;
  lastChange?: number;
  docUrl?: string;
  docType?: string;
  major?: string;
  city?: string[];
  province?: string[];
  extra?: Partial<
    Pick<
      User,
      | 'college'
      | 'district'
      | 'school'
      | 'personalCode'
      | 'studentId'
      | 'skillCode'
      | 'specialPermissions'
    >
  >;
}

const DEFAULT_PROVINCE = 'تهران';
const DEFAULT_COLLEGE = 'پردیس شهید باهنر تهران';
const DEFAULT_DISTRICT = 'ناحیه ۱ تهران';
const DEFAULT_SCHOOL = 'دبیرستان ماندگار البرز';

/** JPEG ۱×۱ حداقلی — mock هم‌تراز محصول (jpg) نه SVG. */
const MOCK_DOC_IMAGE_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

const MOCK_DOC_PDF_URL = 'data:application/pdf;base64,JVBERi0xLjAK';

/** نمونهٔ متنی برای تنوع mock. */
const MOCK_DOC_TXT_URL =
  'data:text/plain;charset=utf-8,' +
  encodeURIComponent('نمونه مدرک متنی — کارویتا');

const NOW = Date.UTC(2026, 6, 18, 12, 0, 0);

const PROVINCES_FOR_BULK = [
  'تهران',
  'اصفهان',
  'فارس',
  'خراسان رضوی',
  'آذربایجان شرقی',
  'خوزستان',
] as const;

const FIRST_NAMES = [
  'علی',
  'محمد',
  'حسین',
  'رضا',
  'مهدی',
  'سارا',
  'زهرا',
  'مریم',
  'فاطمه',
  'نرگس',
] as const;

const LAST_NAMES = [
  'احمدی',
  'محمدی',
  'حسینی',
  'کریمی',
  'رضایی',
  'موسوی',
  'جعفری',
  'نوری',
  'صادقی',
  'اکبری',
] as const;

const CORE_SEEDS: MockUserSeed[] = [
  {
    id: '#MOCK-T1',
    name: 'رضا احمدی',
    role: 'skill_learner',
    docStatus: 'pending_admin',
    approved: false,
    lastChange: NOW - 1000 * 60 * 30,
    docUrl: MOCK_DOC_IMAGE_URL,
    docType: 'کارت مهارت‌آموزی',
    major: 'الکترونیک صنعتی',
    city: ['تهران'],
    extra: { skillCode: 'SK-1001' },
  },
  {
    id: '#MOCK-S1',
    name: 'امیرحسین کریمی',
    role: 'student',
    docStatus: 'pending_admin',
    approved: false,
    lastChange: NOW - 1000 * 60 * 60 * 2,
    docUrl: MOCK_DOC_PDF_URL,
    docType: 'کارت دانشجویی',
    major: 'مهندسی کامپیوتر',
    city: ['تهران'],
    extra: { college: [DEFAULT_COLLEGE], studentId: '1400001' },
  },
  {
    id: '#MOCK-M1',
    name: 'مرتضی ملکی',
    role: 'mentor_teacher',
    docStatus: 'approved',
    approved: true,
    lastChange: NOW - 1000 * 60 * 60 * 24 * 3,
    docUrl: MOCK_DOC_IMAGE_URL,
    docType: 'کارت پرسنلی',
    city: ['تهران'],
    extra: {
      district: [DEFAULT_DISTRICT],
      school: [DEFAULT_SCHOOL],
      personalCode: '5001',
    },
  },
  {
    id: '#MOCK-P1',
    name: 'دکتر علیرضا کریمی',
    role: 'supervisor_professor',
    docStatus: 'rejected',
    approved: false,
    adminRequestMessage: 'نقص اطلاعات پرسنلی در فرم ثبت‌نام',
    lastChange: NOW - 1000 * 60 * 60 * 24,
    docUrl: MOCK_DOC_IMAGE_URL,
    docType: 'کارت هیئت علمی',
    city: ['تهران'],
    extra: { college: [DEFAULT_COLLEGE], personalCode: '2001' },
  },
  {
    id: '#MOCK-P2',
    name: 'دکتر سارا موسوی',
    role: 'supervisor_professor',
    mobile: MOCK_SUPERVISOR_MOBILE,
    docStatus: 'approved',
    approved: true,
    lastChange: NOW - 1000 * 60 * 60 * 24 * 2,
    docUrl: MOCK_DOC_IMAGE_URL,
    docType: 'کارت هیئت علمی',
    city: ['تهران'],
    extra: { college: [DEFAULT_COLLEGE], personalCode: '2002' },
  },
  {
    id: '#MOCK-PR1',
    name: 'عباس پناهی',
    role: 'school_principal',
    docStatus: 'pending_admin',
    approved: false,
    lastChange: NOW - 1000 * 60 * 45,
    docUrl: MOCK_DOC_TXT_URL,
    docType: 'حکم مدیریت مدرسه',
    province: ['اصفهان'],
    city: ['اصفهان'],
    extra: {
      district: ['ناحیه ۲ اصفهان'],
      school: ['هنرستان فنی شهید بهشتی'],
      personalCode: '5002',
    },
  },
  {
    id: '#MOCK-RE1',
    name: 'مهندس اکبری',
    role: 'regional_edu_admin',
    docStatus: 'approved',
    approved: true,
    lastChange: NOW - 1000 * 60 * 60 * 24 * 10,
    extra: { district: [DEFAULT_DISTRICT] },
  },
  {
    id: '#MOCK-F1',
    name: 'دکتر رضازاده',
    role: 'faculty_role',
    docStatus: 'approved',
    approved: true,
    lastChange: NOW - 1000 * 60 * 60 * 24 * 12,
    extra: { college: [DEFAULT_COLLEGE] },
  },
  {
    id: '#MOCK-PU1',
    name: 'دکتر علوی',
    role: 'provincial_university',
    docStatus: 'approved',
    approved: true,
    lastChange: NOW - 1000 * 60 * 60 * 24 * 14,
  },
  {
    id: '#MOCK-AA1',
    name: 'حسین احمدی',
    role: 'assistant_admin',
    docStatus: 'approved',
    approved: true,
    lastChange: NOW - 1000 * 60 * 60 * 24 * 15,
  },
  {
    id: '#MOCK-CO1',
    name: 'مهندس حسینی',
    role: 'central_organization',
    docStatus: 'approved',
    approved: true,
    lastChange: NOW - 1000 * 60 * 60 * 24 * 16,
  },
  {
    id: '#MOCK-A1',
    name: 'ادمین سیستم',
    role: 'super_admin',
    mobile: MOCK_SUPER_ADMIN_MOBILE,
    docStatus: 'approved',
    approved: true,
    lastChange: NOW,
  },
];

function buildBulkSeeds(
  status: DocStatus,
  count: number,
  idPrefix: string,
  roles: UserRole[]
): MockUserSeed[] {
  const seeds: MockUserSeed[] = [];
  for (let i = 0; i < count; i += 1) {
    const role = roles[i % roles.length]!;
    const first = FIRST_NAMES[i % FIRST_NAMES.length]!;
    const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]!;
    const province = PROVINCES_FOR_BULK[i % PROVINCES_FOR_BULK.length]!;
    const approved = status === 'approved';
    seeds.push({
      id: `${idPrefix}-${String(i + 1).padStart(2, '0')}`,
      name: `${first} ${last}`,
      role,
      docStatus: status,
      approved,
      lastChange: NOW - 1000 * 60 * (i + 1) * 17,
      docUrl:
        i % 3 === 0
          ? MOCK_DOC_IMAGE_URL
          : i % 3 === 1
            ? MOCK_DOC_PDF_URL
            : MOCK_DOC_TXT_URL,
      docType: role === 'student' ? 'کارت دانشجویی' : 'مدارک هویتی',
      province: [province],
      city: [province],
      adminRequestMessage:
        status === 'rejected' ? 'نقص مدارک بارگذاری‌شده' : undefined,
      extra:
        role === 'student'
          ? {
              college: [DEFAULT_COLLEGE],
              studentId: `1401${String(i + 1).padStart(3, '0')}`,
              specialPermissions:
                i === 0 ? { crossFaculty: true } : undefined,
            }
          : role === 'skill_learner'
            ? { skillCode: `SK-${2000 + i}` }
            : role === 'mentor_teacher' || role === 'school_principal'
              ? {
                  district: [DEFAULT_DISTRICT],
                  school: [DEFAULT_SCHOOL],
                  personalCode: `${6000 + i}`,
                }
              : role === 'supervisor_professor'
                ? {
                    college: [DEFAULT_COLLEGE],
                    personalCode: `${3000 + i}`,
                  }
                : undefined,
    });
  }
  return seeds;
}

/** ردیف کافی در هر تب آنبوردینگ برای صفحه‌بندی `DEFAULT_PAGE_LIMIT`. */
const BULK_PENDING = buildBulkSeeds(
  'pending_admin',
  24,
  '#MOCK-PEND',
  ['student', 'skill_learner', 'mentor_teacher', 'school_principal']
);
const BULK_APPROVED = buildBulkSeeds(
  'approved',
  24,
  '#MOCK-APPR',
  [
    'student',
    'skill_learner',
    'mentor_teacher',
    'supervisor_professor',
    'school_principal',
  ]
);
const BULK_REJECTED = buildBulkSeeds(
  'rejected',
  24,
  '#MOCK-REJ',
  ['student', 'skill_learner', 'supervisor_professor', 'mentor_teacher']
);

const MOCK_USER_SEEDS: MockUserSeed[] = [
  ...CORE_SEEDS,
  ...BULK_PENDING,
  ...BULK_APPROVED,
  ...BULK_REJECTED,
];

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const [firstName = 'کاربر', ...rest] = fullName.split(' ');
  return { firstName, lastName: rest.join(' ') || 'نمونه' };
}

function buildMockMobile(indexInList: number): string {
  return `912${String(indexInList + 1).padStart(7, '0')}`;
}

export const AUTH_MOCK_USERS: MockAuthUserRecord[] = MOCK_USER_SEEDS.map(
  (seed, index) => {
    const { firstName, lastName } = splitFullName(seed.name);

    return {
      id: seed.id,
      firstName,
      lastName,
      mobile: seed.mobile ?? buildMockMobile(index),
      role: seed.role,
      approved: seed.approved ?? true,
      docStatus: seed.docStatus ?? 'approved',
      adminRequestMessage: seed.adminRequestMessage,
      province: seed.province ?? [DEFAULT_PROVINCE],
      city: seed.city,
      major: seed.major,
      docUrl: seed.docUrl,
      docType: seed.docType,
      lastChange: seed.lastChange ?? NOW - index * 1000,
      ...seed.extra,
      password: MOCK_USER_PASSWORD,
      hasPassword: true,
    };
  }
);
