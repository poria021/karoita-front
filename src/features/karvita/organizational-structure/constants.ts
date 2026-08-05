import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import type { OrgMajorAudience, OrgStructureSubTab } from '@/types/org-structure';
import { faIcons, iconMap } from '@/utils/iconMap';

export type OrgStructureTabConfig = {
  key: OrgStructureSubTab;
  label: string;
  shortLabel: string;
  icon: IconDefinition;
  searchPlaceholder: string;
  addLabel: string;
  nameColumnLabel: string;
  namePlaceholder: string;
};

export const ORG_STRUCTURE_TABS: OrgStructureTabConfig[] = [
  {
    key: 'provinces',
    label: 'استان‌ها',
    shortLabel: 'استان‌ها',
    icon: iconMap['fa-map'] ?? faIcons.map,
    searchPlaceholder: 'جستجوی استان...',
    addLabel: 'استان',
    nameColumnLabel: 'نام استان',
    namePlaceholder: 'مثال: اصفهان',
  },
  {
    key: 'cities',
    label: 'شهرها',
    shortLabel: 'شهرها',
    icon: faIcons.buildingColumns,
    searchPlaceholder: 'جستجوی شهر...',
    addLabel: 'شهر',
    nameColumnLabel: 'نام شهر',
    namePlaceholder: 'مثال: کاشان',
  },
  {
    key: 'districts',
    label: 'مناطق آموزشی',
    shortLabel: 'مناطق',
    icon: faIcons.mapLocationDot,
    searchPlaceholder: 'جستجوی منطقه...',
    addLabel: 'منطقه',
    nameColumnLabel: 'عنوان منطقه یا ناحیه',
    namePlaceholder: 'مثال: منطقه ۱',
  },
  {
    key: 'schools',
    label: 'مدارس تابعه',
    shortLabel: 'مدارس',
    icon: iconMap['fa-school'] ?? faIcons.school,
    searchPlaceholder: 'جستجوی مدرسه...',
    addLabel: 'مدرسه',
    nameColumnLabel: 'نام مدرسه',
    namePlaceholder: 'مثال: دبستان نمونه',
  },
  {
    key: 'majors',
    label: 'رشته‌های تحصیلی',
    shortLabel: 'رشته‌ها',
    icon: faIcons.graduationCap,
    searchPlaceholder: 'جستجوی رشته...',
    addLabel: 'رشته',
    nameColumnLabel: 'عنوان رشته تحصیلی',
    namePlaceholder: 'مثال: آموزش ابتدایی',
  },
  {
    key: 'faculties',
    label: 'دانشکده‌ها / پردیس‌ها',
    shortLabel: 'دانشکده‌ها',
    icon: faIcons.university,
    searchPlaceholder: 'جستجوی پردیس...',
    addLabel: 'پردیس',
    nameColumnLabel: 'نام پردیس / دانشکده',
    namePlaceholder: 'مثال: پردیس البرز',
  },
];

export function getOrgTabConfig(tab: OrgStructureSubTab): OrgStructureTabConfig {
  return (
    ORG_STRUCTURE_TABS.find((item) => item.key === tab) ?? ORG_STRUCTURE_TABS[0]!
  );
}

export const SCHOOL_GENDER_OPTIONS = [
  { value: 'male', label: 'پسرانه' },
  { value: 'female', label: 'دخترانه' },
] as const;

export const MAJOR_AUDIENCE_OPTIONS = [
  { value: 'student', label: 'دانشجو' },
  { value: 'skill_learner', label: 'مهارت‌آموز' },
  { value: 'supervisor_professor', label: 'استاد راهنما' },
] as const;

export function getSchoolGenderLabel(
  gender: (typeof SCHOOL_GENDER_OPTIONS)[number]['value'] | undefined
): string {
  if (!gender) return '—';
  return SCHOOL_GENDER_OPTIONS.find((opt) => opt.value === gender)?.label ?? '—';
}

export function getMajorAudienceLabel(audience: OrgMajorAudience): string {
  return (
    MAJOR_AUDIENCE_OPTIONS.find((opt) => opt.value === audience)?.label ??
    audience
  );
}
