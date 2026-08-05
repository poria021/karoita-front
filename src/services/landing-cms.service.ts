import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { assertMockClientIsSuperAdmin } from '@/services/mock/mock-authz';
import {
  mockCreateBanner,
  mockCreateProduct,
  mockCreateSocial,
  mockDeleteBanner,
  mockDeleteProduct,
  mockDeleteSocial,
} from '@/services/landing-cms/mock-landing-cms.mutations';
import {
  readLandingBanners,
  readLandingProducts,
  readLandingSocials,
} from '@/services/landing-cms/mock-landing-cms.store';
import type {
  CreateLandingBannerInput,
  CreateLandingProductInput,
  CreateLandingSocialInput,
  LandingBanner,
  LandingProduct,
  LandingSocial,
} from '@/types/landing-cms';

function gatePublicRead(surface: string): void {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented(surface);
  }
}

function gateAdminWrite(surface: string): void {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented(surface);
  }
  assertMockClientIsSuperAdmin();
}

/**
 * Facade محتوای لندینگ (بنر / شبکه اجتماعی / محصول شناور).
 *
 * Nest-blocked:
 * - شاخهٔ real برای list/create/delete و آپلود تصویر fail-closed است
 *   تا endpointهای Nest وصل شوند.
 */
export const LandingCmsService = {
  /** Nest: GET /landing/banners */
  async listBanners(): Promise<LandingBanner[]> {
    gatePublicRead('LandingCmsService.listBanners');
    return readLandingBanners();
  },

  /** Nest: GET /landing/socials */
  async listSocials(): Promise<LandingSocial[]> {
    gatePublicRead('LandingCmsService.listSocials');
    return readLandingSocials();
  },

  /** Nest: GET /landing/products */
  async listProducts(): Promise<LandingProduct[]> {
    gatePublicRead('LandingCmsService.listProducts');
    return readLandingProducts();
  },

  /** Nest: POST /landing/banners (+ upload) */
  async createBanner(input: CreateLandingBannerInput): Promise<LandingBanner> {
    gateAdminWrite('LandingCmsService.createBanner');
    return mockCreateBanner(input);
  },

  /** Nest: DELETE /landing/banners/:id */
  async deleteBanner(id: string): Promise<void> {
    gateAdminWrite('LandingCmsService.deleteBanner');
    mockDeleteBanner(id);
  },

  /** Nest: POST /landing/socials (+ optional icon upload) */
  async createSocial(input: CreateLandingSocialInput): Promise<LandingSocial> {
    gateAdminWrite('LandingCmsService.createSocial');
    return mockCreateSocial(input);
  },

  /** Nest: DELETE /landing/socials/:id */
  async deleteSocial(id: string): Promise<void> {
    gateAdminWrite('LandingCmsService.deleteSocial');
    mockDeleteSocial(id);
  },

  /** Nest: POST /landing/products (+ logo upload) */
  async createProduct(
    input: CreateLandingProductInput
  ): Promise<LandingProduct> {
    gateAdminWrite('LandingCmsService.createProduct');
    return mockCreateProduct(input);
  },

  /** Nest: DELETE /landing/products/:id */
  async deleteProduct(id: string): Promise<void> {
    gateAdminWrite('LandingCmsService.deleteProduct');
    mockDeleteProduct(id);
  },
};
