import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { assertMockClientIsStaffAdmin } from '@/services/mock/mock-authz';
import {
  mockCreateBanner,
  mockCreateProduct,
  mockCreateSocial,
  mockDeleteBanner,
  mockDeleteProduct,
  mockDeleteSocial,
} from '@/services/landing-cms/mock/mock-landing-cms.mutations';
import {
  invalidateLandingCmsMemory,
  LANDING_CMS_STORAGE_KEY,
  LANDING_CMS_UPDATED_EVENT,
  readLandingBanners,
  readLandingProducts,
  readLandingSocials,
} from '@/services/landing-cms/mock/mock-landing-cms.store';
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
  assertMockClientIsStaffAdmin();
}

/**
 * CMS لندینگ (بنر / شبکه اجتماعی / محصول شناور). شاخهٔ real fail-closed است.
 */
export const LandingCmsService = {
  async listBanners(): Promise<LandingBanner[]> {
    gatePublicRead('LandingCmsService.listBanners');
    return readLandingBanners();
  },

  async listSocials(): Promise<LandingSocial[]> {
    gatePublicRead('LandingCmsService.listSocials');
    return readLandingSocials();
  },

  async listProducts(): Promise<LandingProduct[]> {
    gatePublicRead('LandingCmsService.listProducts');
    return readLandingProducts();
  },

  async createBanner(input: CreateLandingBannerInput): Promise<LandingBanner> {
    gateAdminWrite('LandingCmsService.createBanner');
    return mockCreateBanner(input);
  },

  async deleteBanner(id: string): Promise<void> {
    gateAdminWrite('LandingCmsService.deleteBanner');
    mockDeleteBanner(id);
  },

  async createSocial(input: CreateLandingSocialInput): Promise<LandingSocial> {
    gateAdminWrite('LandingCmsService.createSocial');
    return mockCreateSocial(input);
  },

  async deleteSocial(id: string): Promise<void> {
    gateAdminWrite('LandingCmsService.deleteSocial');
    mockDeleteSocial(id);
  },

  async createProduct(
    input: CreateLandingProductInput
  ): Promise<LandingProduct> {
    gateAdminWrite('LandingCmsService.createProduct');
    return mockCreateProduct(input);
  },

  async deleteProduct(id: string): Promise<void> {
    gateAdminWrite('LandingCmsService.deleteProduct');
    mockDeleteProduct(id);
  },

  /** `CustomEvent` بعد از نوشتن CMS — فیچر نباید store را import کند. */
  LANDING_CMS_UPDATED_EVENT,

  /** فقط mock: حافظه را خالی می‌کند تا `list*` دوباره hydrate شود. */
  invalidateClientCache(): void {
    if (!isMockApiMode()) return;
    invalidateLandingCmsMemory();
  },

  /** در mock به `storage` و `CustomEvent` وصل است؛ real تا push خالی است. */
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
