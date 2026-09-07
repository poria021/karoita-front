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
 * endpoint‌های موجود admin-only هستند. تا زمانی که مسیر عمومی `/landing/*`
 * در Nest فراهم شود، real mode داده‌ای بارگذاری نمی‌کند (stub).
 * وقتی endpoint عمومی آمد، بلوک stub را بردارید و realList* را صدا بزنید.
 */
export async function loadMarketingChrome(): Promise<MarketingChromeData> {
  const { isMockApiMode } = await import('@/lib/api-mode');

  // stub: تا endpoint عمومی لندینگ در Nest آماده شود.
  if (!isMockApiMode()) {
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
