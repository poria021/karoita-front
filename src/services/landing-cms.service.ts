import { isMockApiMode } from '@/lib/api-mode';
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
import {
  realCreateBanner,
  realCreateProduct,
  realCreateSocial,
  realDeleteBanner,
  realDeleteProduct,
  realDeleteSocial,
  realListBanners,
  realListProducts,
  realListSocials,
} from '@/services/landing-cms/real/real-landing-cms';
import type {
  CreateLandingBannerInput,
  CreateLandingProductInput,
  CreateLandingSocialInput,
  LandingBanner,
  LandingProduct,
  LandingSocial,
} from '@/types/landing-cms';

/**
 * CMS لندینگ (بنر / شبکه اجتماعی / محصول شناور).
 * بنر / شبکهٔ اجتماعی / محصول شناور: همه real وصل است.
 */
export const LandingCmsService = {
  async listBanners(): Promise<LandingBanner[]> {
    if (!isMockApiMode()) return realListBanners();
    return readLandingBanners();
  },

  async listSocials(): Promise<LandingSocial[]> {
    if (!isMockApiMode()) return realListSocials();
    return readLandingSocials();
  },

  async listProducts(): Promise<LandingProduct[]> {
    if (!isMockApiMode()) return realListProducts();
    return readLandingProducts();
  },

  async createBanner(input: CreateLandingBannerInput): Promise<LandingBanner> {
    if (!isMockApiMode()) return realCreateBanner(input);
    assertMockClientIsStaffAdmin();
    return mockCreateBanner(input);
  },

  async deleteBanner(id: string): Promise<void> {
    if (!isMockApiMode()) return realDeleteBanner(id);
    assertMockClientIsStaffAdmin();
    mockDeleteBanner(id);
  },

  async createSocial(input: CreateLandingSocialInput): Promise<LandingSocial> {
    if (!isMockApiMode()) return realCreateSocial(input);
    assertMockClientIsStaffAdmin();
    return mockCreateSocial(input);
  },

  async deleteSocial(id: string): Promise<void> {
    if (!isMockApiMode()) return realDeleteSocial(id);
    assertMockClientIsStaffAdmin();
    mockDeleteSocial(id);
  },

  async createProduct(
    input: CreateLandingProductInput
  ): Promise<LandingProduct> {
    if (!isMockApiMode()) return realCreateProduct(input);
    assertMockClientIsStaffAdmin();
    return mockCreateProduct(input);
  },

  async deleteProduct(id: string): Promise<void> {
    if (!isMockApiMode()) return realDeleteProduct(id);
    assertMockClientIsStaffAdmin();
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
