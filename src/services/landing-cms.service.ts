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
  invalidateLandingCmsMemory,
  LANDING_CMS_STORAGE_KEY,
  LANDING_CMS_UPDATED_EVENT,
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
 * Landing CMS (banners / socials / floating products).
 * Real branch fail-closed; uploads go multipart when Nest lands.
 *
 * Nest map:
 * - GET    /landing/banners|socials|products
 * - POST   /landing/banners|socials|products  (+ upload)
 * - DELETE /landing/:collection/:id
 */
export const LandingCmsService = {
  /** GET /landing/banners */
  async listBanners(): Promise<LandingBanner[]> {
    gatePublicRead('LandingCmsService.listBanners');
    return readLandingBanners();
  },

  /** GET /landing/socials */
  async listSocials(): Promise<LandingSocial[]> {
    gatePublicRead('LandingCmsService.listSocials');
    return readLandingSocials();
  },

  /** GET /landing/products */
  async listProducts(): Promise<LandingProduct[]> {
    gatePublicRead('LandingCmsService.listProducts');
    return readLandingProducts();
  },

  /** POST /landing/banners (+ image upload) */
  async createBanner(input: CreateLandingBannerInput): Promise<LandingBanner> {
    gateAdminWrite('LandingCmsService.createBanner');
    return mockCreateBanner(input);
  },

  /** DELETE /landing/banners/:id */
  async deleteBanner(id: string): Promise<void> {
    gateAdminWrite('LandingCmsService.deleteBanner');
    mockDeleteBanner(id);
  },

  /** POST /landing/socials (+ optional icon) */
  async createSocial(input: CreateLandingSocialInput): Promise<LandingSocial> {
    gateAdminWrite('LandingCmsService.createSocial');
    return mockCreateSocial(input);
  },

  /** DELETE /landing/socials/:id */
  async deleteSocial(id: string): Promise<void> {
    gateAdminWrite('LandingCmsService.deleteSocial');
    mockDeleteSocial(id);
  },

  /** POST /landing/products (+ logo upload) */
  async createProduct(
    input: CreateLandingProductInput
  ): Promise<LandingProduct> {
    gateAdminWrite('LandingCmsService.createProduct');
    return mockCreateProduct(input);
  },

  /** DELETE /landing/products/:id */
  async deleteProduct(id: string): Promise<void> {
    gateAdminWrite('LandingCmsService.deleteProduct');
    mockDeleteProduct(id);
  },

  /** Same-tab CustomEvent after CMS writes — public so features skip store imports */
  LANDING_CMS_UPDATED_EVENT,

  /** Drop in-memory snapshot so next list* rehydrates (mock-only) */
  invalidateClientCache(): void {
    if (!isMockApiMode()) return;
    invalidateLandingCmsMemory();
  },

  /** Mock: storage + CustomEvent; real: no-op until Nest push */
  subscribeChromeChanges(listener: () => void): () => void {
    if (typeof window === 'undefined' || !isMockApiMode()) {
      return () => {};
    }

    const notify = () => {
      invalidateLandingCmsMemory();
      listener();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === LANDING_CMS_STORAGE_KEY || event.key === null) {
        notify();
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(LANDING_CMS_UPDATED_EVENT, notify);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(LANDING_CMS_UPDATED_EVENT, notify);
    };
  },
};
