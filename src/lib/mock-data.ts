import type { District, Faculty, Province, School, UserRole } from "@/types";

/**
 * Static mock data ported 1:1 from the legacy Alpine.js prototype
 * (`mockUsersList` and `getDefaultOrgStructure()` in `karvita.html`).
 *
 * Purpose: these constants let the Next.js UI render fully-populated screens
 * (role switcher, org dropdowns, seeded dashboards, etc.) from day one,
 * without waiting on the NestJS backend to come online. Once real API routes
 * / the Drizzle-backed `db` are wired up, every import of this file should be
 * swapped for a live fetch through `src/services/api-client.ts`, and this
 * file can be deleted.
 */

/* -------------------------------------------------------------------------- */
/*                         Dev identity switcher list                       */
/* -------------------------------------------------------------------------- */

/**
 * One quick-switch identity available in the dev "login as" simulator.
 * Mirrors the shape of each entry in Alpine's `mockUsersList`.
 */
export interface MockUserIdentity {
  /** Stable mock user id, e.g. `#MOCK-S1`. Matches `User.id` once seeded. */
  id: string;
  /** Full display name. */
  name: string;
  role: UserRole;
  mobile: string;
  /** Localized (Persian) label for the role, shown in the switcher UI. */
  roleLabel: string;
  /** Font Awesome icon class used next to the identity in the switcher. */
  icon: string;
  /** Short description, usually the college/school + district. */
  desc: string;
  /** Role-specific organizational + business-code metadata. */
  meta: {
    province: string;
    college: string;
    district: string;
    school: string;
    studentId?: string;
    skillCode?: string;
    professorCode?: string;
    personalCode?: string;
  };
}

/**
 * Ported from Alpine's `mockUsersList`. One representative identity per
 * {@link UserRole}, used to seed `db.users` and to populate the dev "login
 * as" simulator so every role can be exercised without a real backend.
 */
export const mockUsersList: MockUserIdentity[] = [
  {
    id: "#MOCK-S1",
    name: "امیرحسین کریمی",
    role: "student",
    mobile: "9123456781",
    roleLabel: "دانشجو",
    icon: "fa-graduation-cap",
    desc: "پردیس شهید باهنر تهران",
    meta: {
      province: "تهران",
      college: "پردیس شهید باهنر تهران",
      district: "",
      school: "",
      studentId: "140210345",
    },
  },
  {
    id: "#MOCK-T1",
    name: "رضا احمدی",
    role: "skill_learner",
    mobile: "9123456782",
    roleLabel: "مهارت‌آموز",
    icon: "fa-screwdriver-wrench",
    desc: "پردیس شهید باهنر تهران",
    meta: {
      province: "تهران",
      college: "پردیس شهید باهنر تهران",
      district: "",
      school: "",
      skillCode: "M-99412",
    },
  },
  {
    id: "#MOCK-P1",
    name: "دکتر محمد کرمی",
    role: "supervisor_professor",
    mobile: "9123456783",
    roleLabel: "استاد راهنما",
    icon: "fa-user-tie",
    desc: "پردیس شهید باهنر تهران",
    meta: {
      province: "تهران",
      college: "پردیس شهید باهنر تهران",
      district: "",
      school: "",
      professorCode: "10002345",
      personalCode: "10002345",
    },
  },
  {
    id: "#MOCK-M1",
    name: "سعید صادقی",
    role: "mentor_teacher",
    mobile: "9123456784",
    roleLabel: "معلم راهنما",
    icon: "fa-chalkboard-user",
    desc: "دبیرستان البرز — ناحیه ۱ تهران",
    meta: {
      province: "تهران",
      college: "",
      district: "ناحیه ۱ تهران",
      school: "دبیرستان البرز",
      personalCode: "10002346",
    },
  },
  {
    id: "#MOCK-PR1",
    name: "علیرضا رضایی",
    role: "school_principal",
    mobile: "9123456785",
    roleLabel: "مدیر مدرسه",
    icon: "fa-school",
    desc: "دبیرستان البرز — ناحیه ۱ تهران",
    meta: {
      province: "تهران",
      college: "",
      district: "ناحیه ۱ تهران",
      school: "دبیرستان البرز",
      personalCode: "10002347",
    },
  },
  {
    id: "#MOCK-A1",
    name: "مدیریت ارشد (ادمین)",
    role: "super_admin",
    mobile: "9123456786",
    roleLabel: "مدیر ارشد سامانه",
    icon: "fa-user-shield",
    desc: "ستاد مرکزی",
    meta: {
      province: "تهران",
      college: "",
      district: "",
      school: "",
      personalCode: "11111111",
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                    Default organizational structure                      */
/* -------------------------------------------------------------------------- */

/**
 * Ported from Alpine's `getDefaultOrgStructure()`. Seeds the province →
 * college/district → school hierarchy so org-picker dropdowns and
 * `customScopes` editors have realistic data to render before the real
 * `provinces`/`colleges`/`districts`/`schools` tables (see `src/db/schema.ts`)
 * are populated.
 */
export const mockProvinces: Province[] = [
  { id: 1, name: "تهران" },
  { id: 2, name: "اصفهان" },
  { id: 3, name: "قزوین" },
  { id: 4, name: "فارس" },
  { id: 5, name: "خراسان رضوی" },
];

/** University colleges/campuses (پردیس), aka "faculties". */
export const mockFaculties: Faculty[] = [
  { id: 1, name: "پردیس شهید باهنر تهران", provinceId: 1 },
  { id: 2, name: "پردیس دکتر شریعتی تهران", provinceId: 1 },
  { id: 3, name: "پردیس فارابی اصفهان", provinceId: 2 },
  { id: 4, name: "پردیس حکیم ابوالقاسم اصفهان", provinceId: 2 },
  { id: 5, name: "پردیس بنت‌الهدی صدر قزوین", provinceId: 3 },
  { id: 6, name: "پردیس امام رضا مشهد", provinceId: 5 },
];

export const mockDistricts: District[] = [
  { id: 1, name: "ناحیه ۱ تهران", provinceId: 1 },
  { id: 2, name: "ناحیه ۲ تهران", provinceId: 1 },
  { id: 3, name: "ناحیه ۵ اصفهان", provinceId: 2 },
  { id: 4, name: "منطقه ۱ قزوین", provinceId: 3 },
  { id: 5, name: "منطقه ۳ شیراز", provinceId: 4 },
  { id: 6, name: "ناحیه ۴ مشهد", provinceId: 5 },
];

export const mockSchools: School[] = [
  { id: 1, name: "دبیرستان البرز", provinceId: 1, districtId: 1 },
  { id: 2, name: "دبیرستان فرزانگان", provinceId: 1, districtId: 1 },
  { id: 3, name: "دبیرستان شهید بهشتی", provinceId: 1, districtId: 2 },
  { id: 4, name: "دبیرستان شیخ بهایی", provinceId: 2, districtId: 3 },
  { id: 5, name: "دبستان هدایت", provinceId: 3, districtId: 4 },
  { id: 6, name: "دبیرستان حافظ شیراز", provinceId: 4, districtId: 5 },
  { id: 7, name: "دبیرستان فردوسی مشهد", provinceId: 5, districtId: 6 },
];
