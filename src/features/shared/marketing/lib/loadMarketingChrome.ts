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
 * در حالت real هنوز endpoint لندینگ Nest پیاده نشده —
 * قبل از Facade کوتاه می‌کنیم تا هشدار `[real-mode stub]` در لاگ سرور نیاید
 * و round-trip شبکهٔ بیهوده نزند. وقتی مسیر `/landing/*` Nest آمد،
 * گارد `isMockApiMode` را بردارید تا سرویس هر دو حالت را هندل کند.
 */
export async function loadMarketingChrome(): Promise<MarketingChromeData> {
  const { isMockApiMode } = await import('@/lib/api-mode');
  if (!isMockApiMode()) {
    // banners هنوز endpoint ندارد؛ products و socials از API واقعی می‌آیند.
    try {
      const [products, socials] = await Promise.all([
        LandingCmsService.listProducts(),
        LandingCmsService.listSocials(),
      ]);
      return { banners: [], products, socials };
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
