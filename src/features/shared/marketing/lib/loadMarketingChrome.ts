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
 *
 * In real-API mode the Nest landing endpoints are not yet implemented —
 * we short-circuit before calling the service so no [real-mode stub] warn
 * is emitted in the server log and no unnecessary network round-trip fires.
 * When the Nest /landing/* routes land, remove the isMockApiMode guard and
 * let the service handle both modes.
 */
export async function loadMarketingChrome(): Promise<MarketingChromeData> {
  const { isMockApiMode } = await import('@/lib/api-mode');
  if (!isMockApiMode()) {
    // Real-mode: Nest landing endpoints not yet implemented — return empty
    // chrome silently instead of letting throwRealModeNotImplemented fire
    // and pollute the server log with [real-mode stub] warnings.
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
