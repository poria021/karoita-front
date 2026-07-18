import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import type { OrgStructureSubTab } from '@/types/org-structure';
import { faIcons, iconMap } from '@/utils/iconMap';

export type OrgStructureTabConfig = {
  key: OrgStructureSubTab;
  label: string;
  shortLabel: string;
  icon: IconDefinition;
  searchPlaceholder: string;
  addLabel: string;
  nameColumnLabel: string;
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
  },
  {
    key: 'cities',
    label: 'شهرها',
    shortLabel: 'شهرها',
    icon: faIcons.buildingColumns,
    searchPlaceholder: 'جستجوی شهر...',
    addLabel: 'شهر',
    nameColumnLabel: 'نام شهر',
  },
  {
    key: 'districts',
    label: 'مناطق آموزشی',
    shortLabel: 'مناطق',
    icon: faIcons.mapLocationDot,
    searchPlaceholder: 'جستجوی منطقه...',
    addLabel: 'منطقه',
    nameColumnLabel: 'نام منطقه',
  },
  {
    key: 'schools',
    label: 'مدارس تابعه',
    shortLabel: 'مدارس',
    icon: iconMap['fa-school'] ?? faIcons.school,
    searchPlaceholder: 'جستجوی مدرسه...',
    addLabel: 'مدرسه',
    nameColumnLabel: 'نام مدرسه',
  },
  {
    key: 'majors',
    label: 'رشته‌های تحصیلی',
    shortLabel: 'رشته‌ها',
    icon: faIcons.graduationCap,
    searchPlaceholder: 'جستجوی رشته...',
    addLabel: 'رشته',
    nameColumnLabel: 'نام رشته',
  },
  {
    key: 'faculties',
    label: 'دانشکده‌ها / پردیس‌ها',
    shortLabel: 'دانشکده‌ها',
    icon: faIcons.university,
    searchPlaceholder: 'جستجوی پردیس...',
    addLabel: 'پردیس',
    nameColumnLabel: 'نام پردیس',
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
  { value: 'mixed', label: 'مختلط' },
] as const;
