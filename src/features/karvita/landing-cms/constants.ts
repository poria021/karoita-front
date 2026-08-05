import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { faIcons, iconMap } from '@/utils/iconMap';

export type LandingCmsTab = 'banners' | 'socials' | 'products';

export type LandingCmsTabConfig = {
  key: LandingCmsTab;
  label: string;
  shortLabel: string;
  icon: IconDefinition;
  emptyTitle: string;
  emptyDescription: string;
};

export const LANDING_CMS_TABS: readonly LandingCmsTabConfig[] = [
  {
    key: 'banners',
    label: 'بنرهای اسلایدر',
    shortLabel: 'بنرها',
    icon: iconMap['fa-image'] ?? faIcons.image,
    emptyTitle: 'بنری ثبت نشده است',
    emptyDescription: 'اولین بنر اسلایدر اصلی را از فرم کنار جدول اضافه کنید.',
  },
  {
    key: 'socials',
    label: 'شبکه‌های اجتماعی',
    shortLabel: 'اجتماعی',
    icon: iconMap['fa-link'] ?? faIcons.link,
    emptyTitle: 'شبکه اجتماعی ثبت نشده است',
    emptyDescription: 'لینک شبکه‌های فوتر را از فرم کنار جدول اضافه کنید.',
  },
  {
    key: 'products',
    label: 'محصولات شناور',
    shortLabel: 'محصولات',
    icon: iconMap['fa-briefcase'] ?? faIcons.briefcase,
    emptyTitle: 'محصولی ثبت نشده است',
    emptyDescription: 'آیتم‌های داک شناور لندینگ را از فرم کنار جدول اضافه کنید.',
  },
] as const;

export function getLandingCmsTabConfig(tab: LandingCmsTab): LandingCmsTabConfig {
  const found = LANDING_CMS_TABS.find((item) => item.key === tab);
  return found ?? LANDING_CMS_TABS[0]!;
}

export function resolveLandingIcon(stem: string): IconDefinition {
  return iconMap[stem] ?? faIcons.link;
}
