import { LandingCmsService } from '@/services/landing-cms.service';
import type {
  LandingBanner,
  LandingProduct,
  LandingSocial,
} from '@/types/landing-cms';

export type MarketingChromeData = {
  banners: LandingBanner[];
  products: LandingProduct[];
  socials: LandingSocial[];
};

async function safeList<T>(
  label: string,
  fetcher: () => Promise<T[]>
): Promise<T[]> {
  try {
    return await fetcher();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[loadMarketingChrome] ${label} failed:`, err);
    }
    return [];
  }
}

/**
 * داده chrome لندینگ را برای Server Component می‌خواند.
 *
 * real: هر endpoint مستقل try/catch دارد — خرابی یک منبع بقیه را نمی‌کشد.
 * mock: از LandingCmsService روی in-memory store کار می‌کند.
 *
 * برای بنرها و شبکه‌های اجتماعی که endpoint عمومی Nest ندارند:
 * کوکی‌های request کاربر فوروارد می‌شود تا session ادمین (در صورت وجود) منتقل شود.
 * وقتی Nest یک GET عمومی /landing-chrome برگرداند، این workaround حذف خواهد شد.
 */
export async function loadMarketingChrome(): Promise<MarketingChromeData> {
  const [banners, products, socials] = await Promise.all([
    safeList('banners', () => LandingCmsService.listBanners()),
    safeList('products', () => LandingCmsService.listProducts()),
    safeList('socials', () => LandingCmsService.listSocials()),
  ]);
  return { banners, products, socials };
}
