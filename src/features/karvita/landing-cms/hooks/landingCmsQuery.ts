import { LandingCmsService } from '@/services/landing-cms.service';
import type {
  LandingBanner,
  LandingProduct,
  LandingSocial,
} from '@/types/landing-cms';

export const landingCmsQueryKey = ['landing-cms', 'admin-bundle'] as const;

export type LandingCmsBundle = {
  banners: LandingBanner[];
  socials: LandingSocial[];
  products: LandingProduct[];
};

export async function fetchLandingCmsBundle(): Promise<LandingCmsBundle> {
  const [banners, socials, products] = await Promise.all([
    LandingCmsService.listBanners(),
    LandingCmsService.listSocials(),
    LandingCmsService.listProducts(),
  ]);
  return { banners, socials, products };
}
