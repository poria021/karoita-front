import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import type {
  ApprovalFilterTab,
  ApprovalRoleFilter,
} from '@/types/onboarding-approvals';
import type { UserRole } from '@/types/auth';
import { faIcons, iconMap } from '@/utils/iconMap';

export type OnboardingApprovalTabConfig = {
  key: ApprovalFilterTab;
  label: string;
  shortLabel: string;
  icon: IconDefinition;
};

export const ONBOARDING_APPROVAL_TABS: OnboardingApprovalTabConfig[] = [
  {
    key: 'pending_admin',
    label: 'در‌انتظار بررسی',
    shortLabel: 'در انتظار',
    icon: faIcons.hourglassHalf,
  },
  {
    key: 'approved',
    label: 'تایید‌شده',
    shortLabel: 'تایید شده',
    icon: faIcons.circleCheck,
  },
  {
    key: 'rejected',
    label: 'رد شده',
    shortLabel: 'رد شده',
    icon: faIcons.circleXmark,
  },
];

export const DEFAULT_REJECT_REASONS = [
  {
    value: 'invalid_document',
    text: 'سند بارگذاری شده با نوع مدرک انتخابی همخوانی ندارد',
  },
  {
    value: 'expired_card',
    text: 'تاریخ اعتبار مدرک یا کارت شناسایی ارسالی منقضی شده است',
  },
  {
    value: 'mismatch_college',
    text: 'پردیس دانشگاهی ثبت‌شده با مدرک شما همخوانی ندارد',
  },
  {
    value: 'incomplete_info',
    text: 'نقص اطلاعات پرسنلی در فرم ثبت‌نام',
  },
] as const;

export type ApprovalFieldDef = {
  key: string;
  label: string;
  icon: IconDefinition;
  /** When true, render value with Persian digits. */
  numeric?: boolean;
};

export const GENERAL_APPROVAL_FIELDS: ApprovalFieldDef[] = [
  {
    key: 'province',
    label: 'استان تابعه',
    icon: iconMap['fa-map-location-dot'] ?? faIcons.mapLocationDot,
  },
  {
    key: 'city',
    label: 'شهر تابعه',
    icon: faIcons.buildingColumns,
  },
  {
    key: 'college',
    label: 'دانشکده / پردیس',
    icon: iconMap['fa-school'] ?? faIcons.school,
  },
  {
    key: 'district',
    label: 'منطقه آموزشی',
    icon: faIcons.mapLocationDot,
  },
  {
    key: 'school',
    label: 'مدرسه همکار',
    icon: iconMap['fa-school'] ?? faIcons.school,
  },
];

export const ROLE_APPROVAL_FIELDS: Partial<
  Record<UserRole, ApprovalFieldDef[]>
> = {
  student: [
    {
      key: 'studentId',
      label: 'شماره دانشجویی',
      icon: faIcons.idCardClip,
      numeric: true,
    },
    {
      key: 'major',
      label: 'رشته تحصیلی نظری',
      icon: faIcons.graduationCap,
    },
  ],
  skill_learner: [
    {
      key: 'skillCode',
      label: 'کد مهارتی نوین',
      icon: faIcons.screwdriverWrench,
      numeric: true,
    },
    {
      key: 'major',
      label: 'رشته مهارتی فنی',
      icon: faIcons.screwdriverWrench,
    },
  ],
  supervisor_professor: [
    {
      key: 'personalCode',
      label: 'کد پرسنلی',
      icon: faIcons.idCard,
      numeric: true,
    },
    {
      key: 'college',
      label: 'دانشکده / پردیس',
      icon: faIcons.university,
    },
  ],
  mentor_teacher: [
    {
      key: 'personalCode',
      label: 'کد پرسنلی',
      icon: faIcons.idCard,
      numeric: true,
    },
    {
      key: 'school',
      label: 'مدرسه همکار',
      icon: iconMap['fa-school'] ?? faIcons.school,
    },
  ],
  school_principal: [
    {
      key: 'personalCode',
      label: 'کد پرسنلی',
      icon: faIcons.idCard,
      numeric: true,
    },
    {
      key: 'school',
      label: 'مدرسه همکار',
      icon: iconMap['fa-school'] ?? faIcons.school,
    },
  ],
};

export const APPROVAL_ROLE_FILTER_OPTIONS: {
  value: ApprovalRoleFilter;
  label: string;
}[] = [
  { value: 'all', label: 'همه نقش‌ها' },
  { value: 'student', label: 'دانشجو' },
  { value: 'skill_learner', label: 'مهارت‌آموز' },
  { value: 'supervisor_professor', label: 'استاد راهنما' },
  { value: 'mentor_teacher', label: 'معلم راهنما' },
  { value: 'school_principal', label: 'مدیر مدرسه' },
];

export function isPdfDocUrl(url: string | undefined): boolean {
  return Boolean(url?.startsWith('data:application/pdf'));
}

/** Which review actions are available on each status tab. */
export function getApprovalTabActions(tab: ApprovalFilterTab): {
  canApprove: boolean;
  canReject: boolean;
} {
  if (tab === 'approved') {
    return { canApprove: false, canReject: true };
  }
  if (tab === 'rejected') {
    return { canApprove: true, canReject: false };
  }
  return { canApprove: true, canReject: true };
}
