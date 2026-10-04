import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LandingCmsService } from '@/services/landing-cms.service';

describe('LandingCmsService (mock)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('lists static banners/socials/products with English ids', async () => {
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
  });

  it('creates a social without persisting it', async () => {
    const created = await LandingCmsService.createSocial({
      name: 'روبیکا',
      link: 'https://rubika.ir',
    });
    expect(created.name).toBe('روبیکا');
    expect(created.link).toBe('https://rubika.ir');
    expect(created.iconImageUrl).toBe('');
    expect(/^soc-\d+$/.test(created.id)).toBe(true);

    const socials = await LandingCmsService.listSocials();
    expect(socials.some((row) => row.id === created.id)).toBe(false);
  });

  it('delete resolves without changing the static list', async () => {
    await LandingCmsService.deleteBanner('bnr-2');
    const banners = await LandingCmsService.listBanners();
    expect(banners).toHaveLength(3);
  });
});
