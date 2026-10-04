import { isMockApiMode } from '@/lib/api-mode';
import { buildLandingCmsSeed } from '@/services/landing-cms/landing-cms-seed';
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

/** تصویر ثابت برای ردیف‌های ساخته‌شده در mock (بدون encode/ذخیره‌ی فایل). */
const MOCK_IMAGE = '/marketing/dashboard-hero.svg';
const mockId = (prefix: 'bnr' | 'soc' | 'prd') => `${prefix}-${Date.now()}`;

/**
 * CMS لندینگ (بنر / شبکه اجتماعی / محصول شناور).
 * mock: فقط داده‌ی ثابت؛ ایجاد/حذف چیزی ذخیره نمی‌کند.
 */
export const LandingCmsService = {
  async listBanners(): Promise<LandingBanner[]> {
    if (!isMockApiMode()) return realListBanners();
    return buildLandingCmsSeed().banners;
  },

  async listSocials(): Promise<LandingSocial[]> {
    if (!isMockApiMode()) return realListSocials();
    return buildLandingCmsSeed().socials;
  },

  async listProducts(): Promise<LandingProduct[]> {
    if (!isMockApiMode()) return realListProducts();
    return buildLandingCmsSeed().products;
  },

  async createBanner(input: CreateLandingBannerInput): Promise<LandingBanner> {
    if (!isMockApiMode()) return realCreateBanner(input);
    return {
      id: mockId('bnr'),
      title: input.title.trim(),
      imageUrl: MOCK_IMAGE,
      link: (input.link ?? '').trim(),
    };
  },

  async deleteBanner(id: string): Promise<void> {
    if (!isMockApiMode()) return realDeleteBanner(id);
  },

  async createSocial(input: CreateLandingSocialInput): Promise<LandingSocial> {
    if (!isMockApiMode()) return realCreateSocial(input);
    return {
      id: mockId('soc'),
      name: input.name.trim(),
      link: input.link.trim(),
      iconImageUrl: '',
      icon: input.icon?.trim() || 'fa-link',
    };
  },

  async deleteSocial(id: string): Promise<void> {
    if (!isMockApiMode()) return realDeleteSocial(id);
  },

  async createProduct(
    input: CreateLandingProductInput
  ): Promise<LandingProduct> {
    if (!isMockApiMode()) return realCreateProduct(input);
    return {
      id: mockId('prd'),
      title: input.title.trim(),
      link: input.link.trim(),
      logoImageUrl: MOCK_IMAGE,
      icon: input.icon?.trim() || 'fa-briefcase',
    };
  },

  async deleteProduct(id: string): Promise<void> {
    if (!isMockApiMode()) return realDeleteProduct(id);
  },
};
