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

/**
 * فهرست chrome عمومی برای ترکیب‌های مارکتینگ.
 *
 * در حالت real هنوز endpoint عمومی لندینگ Nest پیاده نشده —
 * endpoint‌های موجود admin-only هستند و از مرورگر بدون auth 401 می‌زنند
 * که handleUnauthorized را فعال و لندینگ را به login ریدایرکت می‌کند.
 * وقتی مسیر `/landing/*` عمومی Nest آمد، گارد `isMockApiMode` و
 * چک `window` را بردارید.
 */
export async function loadMarketingChrome(): Promise<MarketingChromeData> {
  const { isMockApiMode } = await import('@/lib/api-mode');
  if (!isMockApiMode()) {
    // مرورگر: endpoint عمومی لندینگ هنوز نیست — SSR seed کافیست.
    if (typeof window !== 'undefined') {
      return { banners: [], products: [], socials: [] };
    }
    try {
      const [banners, products, socials] = await Promise.all([
        LandingCmsService.listBanners(),
        LandingCmsService.listProducts(),
        LandingCmsService.listSocials(),
      ]);
      return { banners, products, socials };
    } catch {
      return { banners: [], products: [], socials: [] };
    }
  }

  try {
    const [banners, products, socials] = await Promise.all([
      LandingCmsService.listBanners(),
      LandingCmsService.listProducts(),
      LandingCmsService.listSocials(),
    ]);
    return { banners, products, socials };
  } catch {
    return { banners: [], products: [], socials: [] };
  }
}
