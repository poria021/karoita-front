import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LandingCmsService } from '@/services/landing-cms.service';
import { resetLandingCmsStoreForTests } from '@/services/landing-cms/mock/mock-landing-cms.store';
import {
  AUTH_MOCK_USERS,
  MOCK_SUPER_ADMIN_MOBILE,
} from '@/services/auth/mock/auth-mock-users';
import { resetMockAuthStoreForTests } from '@/services/auth/mock/mock-auth.store';
import { useUserStore } from '@/store/useUserStore';

describe('LandingCmsService (mock)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'development');
    resetLandingCmsStoreForTests();
    resetMockAuthStoreForTests(AUTH_MOCK_USERS.map((u) => ({ ...u })));
    useUserStore.getState().setUser({
      id: '#MOCK-SA',
      firstName: 'مدیر',
      lastName: 'ارشد',
      mobile: MOCK_SUPER_ADMIN_MOBILE,
      role: 'super_admin',
      approved: true,
      docStatus: 'approved',
      hasPassword: true,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    resetLandingCmsStoreForTests();
    resetMockAuthStoreForTests();
    useUserStore.setState({ activeUser: null });
  });

  it('lists seeded banners/socials/products with English ids', async () => {
    const banners = await LandingCmsService.listBanners();
    const socials = await LandingCmsService.listSocials();
    const products = await LandingCmsService.listProducts();

    expect(banners.map((row) => row.id)).toEqual(['bnr-1', 'bnr-2', 'bnr-3']);
    expect(socials.map((row) => row.id)).toEqual(['soc-1', 'soc-2', 'soc-3']);
    expect(products.map((row) => row.id)).toEqual([
      'prd-1',
      'prd-2',
      'prd-3',
      'prd-4',
    ]);
    expect(banners[0]?.imageUrl.startsWith('/marketing/')).toBe(true);
    expect(banners.every((row) => /^bnr-\d+$/.test(row.id))).toBe(true);
  });

  it('deletes a banner in mock for super_admin', async () => {
    await LandingCmsService.deleteBanner('bnr-2');
    const banners = await LandingCmsService.listBanners();
    expect(banners.map((row) => row.id)).toEqual(['bnr-1', 'bnr-3']);
  });

  it('creates a social without icon upload', async () => {
    const created = await LandingCmsService.createSocial({
      name: 'روبیکا',
      link: 'https://rubika.ir',
    });
    expect(created.name).toBe('روبیکا');
    expect(created.link).toBe('https://rubika.ir');
    expect(created.iconImageUrl).toBe('');
    expect(/^soc-\d+$/.test(created.id)).toBe(true);

    const socials = await LandingCmsService.listSocials();
    expect(socials.some((row) => row.id === created.id)).toBe(true);
  });

  it('write methods guard mock authz in mock mode', async () => {
    useUserStore.setState({ activeUser: null });
    await expect(
      LandingCmsService.createSocial({ name: 'x', link: 'https://example.com' })
    ).rejects.toThrow();
    await expect(LandingCmsService.deleteBanner('bnr-1')).rejects.toThrow();
    await expect(LandingCmsService.deleteProduct('prd-1')).rejects.toThrow();
  });
});
