import { RouteService } from '@/services/route.service';
import type { LandingCmsSnapshot } from '@/types/landing-cms';

/** Persian sample content; image URLs prefer `/public/marketing/*`. */
export function buildLandingCmsSeed(): LandingCmsSnapshot {
  const authLogin = RouteService.auth.login();

  return {
    banners: [
      {
        id: 'bnr-1',
        title: 'سامانه مدیریت کارورزی',
        imageUrl: '/marketing/dashboard-hero.svg',
        // Link only when CMS admin sets one — empty = not clickable.
        link: '',
      },
      {
        id: 'bnr-2',
        title: 'ارزش‌های عملیاتی و دسترسی‌ها',
        imageUrl: '/marketing/onboarding-flow.svg',
        link: '',
      },
      {
        id: 'bnr-3',
        title: 'بیانیه اکوسیستم کارویتا',
        imageUrl: '/marketing/dashboard-hero.svg',
        link: '',
      },
    ],
    socials: [
      {
        id: 'soc-1',
        name: 'ایتا',
        link: 'https://eitaa.com',
        iconImageUrl: '',
        icon: 'fa-link',
      },
      {
        id: 'soc-2',
        name: 'تلگرام',
        link: 'https://t.me',
        iconImageUrl: '',
        icon: 'fa-link',
      },
      {
        id: 'soc-3',
        name: 'اینستاگرام',
        link: 'https://instagram.com',
        iconImageUrl: '',
        icon: 'fa-link',
      },
    ],
    products: [
      {
        id: 'prd-1',
        title: 'سامانه مدیریت کارورزی',
        link: authLogin,
        logoImageUrl: '',
        icon: 'fa-graduation-cap',
      },
      {
        id: 'prd-2',
        title: 'پرتال انتشارات علمی',
        link: authLogin,
        logoImageUrl: '',
        icon: 'fa-book-open',
      },
      {
        id: 'prd-3',
        title: 'باشگاه آزمون آنلاین',
        link: authLogin,
        logoImageUrl: '',
        icon: 'fa-clipboard-check',
      },
      {
        id: 'prd-4',
        title: 'سامانه پایش مهارتی',
        link: authLogin,
        logoImageUrl: '',
        icon: 'fa-sliders',
      },
    ],
  };
}
