import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import {
  LANDING_BANNER_MAX_SIZE_MB,
  LANDING_ICON_MAX_SIZE_MB,
} from '@/services/landing-cms/landing-cms-media-limits';
import { faIcons, iconMap } from '@/utils/iconMap';

export type LandingCmsTab = 'banners' | 'socials' | 'products';

export {
  LANDING_BANNER_MAX_SIZE_MB,
  LANDING_ICON_MAX_SIZE_MB,
};

/** Banner / hero slide — standard web CMS ceiling before client compress. */

export const LANDING_BANNER_MAX_SIZE_HELPER =
  'PNG، JPG تا ۲ مگابایت';

/** Product dock mark — SVG/PNG only (color logos). */
export const LANDING_PRODUCT_LOGO_MAX_SIZE_HELPER =
  'فقط SVG یا PNG تا ۵۱۲ کیلوبایت';

export const LANDING_ICON_MAX_SIZE_HELPER =
  'PNG، JPG تا ۵۱۲ کیلوبایت';

export const LANDING_SOCIAL_ICON_MAX_SIZE_HELPER =
  'اختیاری — PNG یا JPG شفاف تا ۵۱۲ کیلوبایت';

export const LANDING_PRODUCT_LOGO_ACCEPT = {
  'image/png': ['.png'],
  'image/svg+xml': ['.svg'],
} as const;

export const LANDING_PRODUCT_LOGO_INVALID_TYPE =
  'فقط فایل‌های SVG یا PNG مجاز هستند.';

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
