import type { DocStatus, User, UserRole } from '@/types/auth';


export const MOCK_OTP_CODE = '12345';

export const MOCK_USER_PASSWORD = '123456';

export const MOCK_SUPER_ADMIN_MOBILE = '9123456786';

export const MOCK_USERS_SEED_VERSION = '4';

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
  city?: string;
  province?: string;
  extra?: Partial<
    Pick<
      User,
      | 'college'
      | 'district'
      | 'school'
      | 'personalCode'
      | 'studentId'
      | 'skillCode'
    >
  >;
}

const DEFAULT_PROVINCE = 'تهران';
const DEFAULT_COLLEGE = 'پردیس شهید باهنر تهران';
const DEFAULT_DISTRICT = 'ناحیه ۱ تهران';
const DEFAULT_SCHOOL = 'دبیرستان ماندگار البرز';

const MOCK_DOC_IMAGE_URL =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200">' +
      '<rect width="160" height="200" fill="currentColor" opacity="0.08"/>' +
      '<rect x="20" y="24" width="120" height="80" rx="8" fill="currentColor" opacity="0.18"/>' +
      '<text x="80" y="140" text-anchor="middle" fill="currentColor" font-size="12" font-family="Tahoma,sans-serif">نمونه مدرک</text>' +
      '</svg>'
  );

const MOCK_DOC_PDF_URL = 'data:application/pdf;base64,JVBERi0xLjAK';

const NOW = Date.UTC(2026, 6, 18, 12, 0, 0);

const MOCK_USER_SEEDS: MockUserSeed[] = [
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
    city: 'تهران',
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
    city: 'تهران',
    extra: { college: DEFAULT_COLLEGE, studentId: '1400001' },
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
    city: 'تهران',
    extra: {
      district: DEFAULT_DISTRICT,
      school: DEFAULT_SCHOOL,
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
    city: 'تهران',
    extra: { college: DEFAULT_COLLEGE, personalCode: '2001' },
  },
  {
    id: '#MOCK-PR1',
    name: 'عباس پناهی',
    role: 'school_principal',
    docStatus: 'pending_admin',
    approved: false,
    lastChange: NOW - 1000 * 60 * 45,
    docUrl: MOCK_DOC_IMAGE_URL,
    docType: 'حکم مدیریت مدرسه',
    province: 'اصفهان',
    city: 'اصفهان',
    extra: {
      district: 'ناحیه ۲ اصفهان',
      school: 'هنرستان فنی شهید بهشتی',
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
    extra: { district: DEFAULT_DISTRICT },
  },
  {
    id: '#MOCK-F1',
    name: 'دکتر رضازاده',
    role: 'faculty_role',
    docStatus: 'approved',
    approved: true,
    lastChange: NOW - 1000 * 60 * 60 * 24 * 12,
    extra: { college: DEFAULT_COLLEGE },
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

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const [firstName = 'کاربر', ...rest] = fullName.split(' ');
  return { firstName, lastName: rest.join(' ') || 'نمونه' };
}

function buildMockMobile(indexInList: number): string {
  const positionalSuffix = String(indexInList + 1).padStart(2, '0');
  return `91200000${positionalSuffix}`.slice(0, 10);
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
      province: seed.province ?? DEFAULT_PROVINCE,
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
