import type { User, UserRole } from '@/types/auth';

/**
 * Seed data ported from `mockUsersList` / `buildMockUserRecord` inside
 * `original-karvita.html`. Used exclusively by `AuthService` when
 * `NEXT_PUBLIC_API_MODE === 'mock'` (never in production — fail-closed).
 *
 * These are LOCAL SIMULATOR credentials — not Nest / SMS / production secrets.
 * Passwords in the seed / localStorage copy are mock-only DX credentials.
 * They must never be copied into Zustand or public User DTOs (`toPublicUser`).
 *
 * Bump {@link MOCK_USERS_SEED_VERSION} when seed mobiles/roles change so
 * localStorage picks up the new list on next load.
 */

/**
 * Fixed OTP for local simulator only.
 * Real mode rejects this via `assertRealModeRejectsMockSecret` — never Nest SMS.
 */
export const MOCK_OTP_CODE = '12345';

/** Shared test password for seeded mock accounts — mock DX only; never in User DTO. */
export const MOCK_USER_PASSWORD = '123456';

/**
 * Memorable super_admin mobile (matches original admin-gate placeholder).
 * Must not collide with sequential seed mobiles below.
 */
export const MOCK_SUPER_ADMIN_MOBILE = '9123456786';

/** Bump when seed list changes — AuthService rewrites localStorage. */
export const MOCK_USERS_SEED_VERSION = '3';

/** Internal-only mock record — never expose `password` outside this module. */
export interface MockAuthUserRecord extends User {
  password: string;
  hasPassword: boolean;
}

interface MockUserSeed {
  id: string;
  name: string;
  role: UserRole;
  /** Override generated mobile (required for super_admin). */
  mobile?: string;
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

const MOCK_USER_SEEDS: MockUserSeed[] = [
  {
    id: '#MOCK-T1',
    name: 'رضا احمدی',
    role: 'skill_learner',
    extra: { skillCode: 'SK-1001' },
  },
  {
    id: '#MOCK-S1',
    name: 'امیرحسین کریمی',
    role: 'student',
    extra: { college: DEFAULT_COLLEGE, studentId: '1400001' },
  },
  {
    id: '#MOCK-M1',
    name: 'مرتضی ملکی',
    role: 'mentor_teacher',
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
    extra: { college: DEFAULT_COLLEGE, personalCode: '2001' },
  },
  {
    id: '#MOCK-PR1',
    name: 'عباس پناهی',
    role: 'school_principal',
    extra: {
      district: DEFAULT_DISTRICT,
      school: DEFAULT_SCHOOL,
      personalCode: '5002',
    },
  },
  {
    id: '#MOCK-RE1',
    name: 'مهندس اکبری',
    role: 'regional_edu_admin',
    extra: { district: DEFAULT_DISTRICT },
  },
  {
    id: '#MOCK-F1',
    name: 'دکتر رضازاده',
    role: 'faculty_role',
    extra: { college: DEFAULT_COLLEGE },
  },
  { id: '#MOCK-PU1', name: 'دکتر علوی', role: 'provincial_university' },
  { id: '#MOCK-AA1', name: 'حسین احمدی', role: 'assistant_admin' },
  { id: '#MOCK-CO1', name: 'مهندس حسینی', role: 'central_organization' },
  {
    id: '#MOCK-A1',
    name: 'ادمین سیستم',
    role: 'super_admin',
    mobile: MOCK_SUPER_ADMIN_MOBILE,
  },
];

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const [firstName = 'کاربر', ...rest] = fullName.split(' ');
  return { firstName, lastName: rest.join(' ') || 'نمونه' };
}

/** Sequential mock mobiles for non-admin seeds: 9120000001 … */
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
      approved: true,
      docStatus: 'approved',
      province: DEFAULT_PROVINCE,
      ...seed.extra,
      password: MOCK_USER_PASSWORD,
      hasPassword: true,
    };
  }
);
