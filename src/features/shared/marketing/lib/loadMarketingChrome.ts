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
 * real: GET /api/admin/floating-products بدون auth عمومی است (bearer برنداشته).
 * mock: از LandingCmsService که روی in-memory store کار می‌کند.
 */
export async function loadMarketingChrome(): Promise<MarketingChromeData> {
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
