import 'server-only';

import { isMockApiMode } from '@/lib/api-mode';
import {
  realListBannersServer,
  realListProductsServer,
  realListSocialsServer,
} from '@/services/landing-cms/real/real-landing-cms.reads';
import {
  readLandingBanners,
  readLandingProducts,
  readLandingSocials,
} from '@/services/landing-cms/mock/mock-landing-cms.store';

import type { MarketingChromeData } from './loadMarketingChrome';

async function safeList<T>(label: string, fetcher: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fetcher();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[loadMarketingChromeServer] ${label} failed:`, err);
    }
    return [];
  }
}

export async function loadMarketingChromeServer(): Promise<MarketingChromeData> {
  if (isMockApiMode()) {
    return {
      banners: readLandingBanners(),
      products: readLandingProducts(),
      socials: readLandingSocials(),
    };
  }
  const [banners, products, socials] = await Promise.all([
    safeList('banners', realListBannersServer),
    safeList('products', realListProductsServer),
    safeList('socials', realListSocialsServer),
  ]);
  return { banners, products, socials };
}
