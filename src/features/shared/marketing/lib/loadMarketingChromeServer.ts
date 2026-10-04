import 'server-only';

import { isMockApiMode } from '@/lib/api-mode';
import {
  realListBannersServer,
  realListProductsServer,
  realListSocialsServer,
} from '@/services/landing-cms/real/real-landing-cms.reads';
import { buildLandingCmsSeed } from '@/services/landing-cms/landing-cms-seed';

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
    return buildLandingCmsSeed();
  }
  const [banners, products, socials] = await Promise.all([
    safeList('banners', realListBannersServer),
    safeList('products', realListProductsServer),
    safeList('socials', realListSocialsServer),
  ]);
  return { banners, products, socials };
}
