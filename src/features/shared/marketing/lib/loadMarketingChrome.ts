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
 * Public chrome lists for marketing compositions.
 * Real-mode Facade still Nest-blocked — fail soft to empty chrome (not a hard crash).
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
