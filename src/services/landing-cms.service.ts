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

  /** Same-tab CustomEvent name after CMS writes (Facade-public; no store import). */
  LANDING_CMS_UPDATED_EVENT,

  /** Drop in-memory CMS snapshot so the next list* rehydrates (mock-only). */
  invalidateClientCache(): void {
    if (!isMockApiMode()) return;
    invalidateLandingCmsMemory();
  },

  /**
   * Subscribe to marketing chrome changes (same-tab event + cross-tab storage).
   * Mock: invalidates memory then notifies. Real: no-op until Nest push.
   */
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
