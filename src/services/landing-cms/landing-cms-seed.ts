import type { LandingCmsSnapshot } from '@/types/landing-cms';

/** Persian sample content; image URLs prefer `/public/marketing/*`. */
export function buildLandingCmsSeed(): LandingCmsSnapshot {
  return {
    banners: [
      {
        id: 'bnr-1',
        title: 'سامانه مدیریت کارورزی',
        imageUrl: '/marketing/dashboard-hero.svg',
        link: '/internship',
      },
      {
        id: 'bnr-2',
        title: 'ارزش‌های عملیاتی و دسترسی‌ها',
        imageUrl: '/marketing/onboarding-flow.svg',
        link: '/benefits',
      },
      {
        id: 'bnr-3',
        title: 'بیانیه اکوسیستم کارویتا',
        imageUrl: '/marketing/dashboard-hero.svg',
        link: '/about',
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
        link: '/internship',
        logoImageUrl: '',
        icon: 'fa-graduation-cap',
      },
      {
        id: 'prd-2',
        title: 'پرتال انتشارات علمی',
        link: '/about',
        logoImageUrl: '',
        icon: 'fa-book-open',
      },
      {
        id: 'prd-3',
        title: 'باشگاه آزمون آنلاین',
        link: '/benefits',
        logoImageUrl: '',
        icon: 'fa-clipboard-check',
      },
      {
        id: 'prd-4',
        title: 'سامانه پایش مهارتی',
        link: '/advantages',
        logoImageUrl: '',
        icon: 'fa-sliders',
      },
    ],
  };
}
