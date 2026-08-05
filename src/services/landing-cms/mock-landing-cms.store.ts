import { isMockApiMode } from '@/lib/api-mode';
import { buildLandingCmsSeed } from '@/services/landing-cms/landing-cms-seed';
import type {
  LandingBanner,
  LandingCmsSnapshot,
  LandingProduct,
  LandingSocial,
} from '@/types/landing-cms';

const STORAGE_KEY = 'karvita_mock_landing_cms_v1';

export const LANDING_CMS_STORAGE_QUOTA_ERROR =
  'حجم تصاویر آپلود شده زیاد است و در حافظه مرورگر ذخیره نشد.';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function cloneSnapshot(data: LandingCmsSnapshot): LandingCmsSnapshot {
  return structuredClone(data);
}

function isQuotaExceededError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;
  return (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    // Legacy browsers
    error.code === 22 ||
    error.code === 1014
  );
}

let memory: LandingCmsSnapshot | null = null;

function normalizeSnapshot(raw: unknown): LandingCmsSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<LandingCmsSnapshot>;
  if (
    !Array.isArray(data.banners) ||
    !Array.isArray(data.socials) ||
    !Array.isArray(data.products)
  ) {
    return null;
  }
  return {
    banners: data.banners as LandingBanner[],
    socials: data.socials as LandingSocial[],
    products: data.products as LandingProduct[],
  };
}

function persistSnapshot(data: LandingCmsSnapshot): void {
  if (!isBrowser() || !isMockApiMode()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    if (isQuotaExceededError(error)) {
      throw new Error(LANDING_CMS_STORAGE_QUOTA_ERROR);
    }
    throw error;
  }
}

function loadSnapshot(): LandingCmsSnapshot {
  if (memory) return memory;

  if (!isBrowser()) {
    memory = cloneSnapshot(buildLandingCmsSeed());
    return memory;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = buildLandingCmsSeed();
    persistSnapshot(seed);
    memory = cloneSnapshot(seed);
    return memory;
  }

  try {
    const parsed = normalizeSnapshot(JSON.parse(raw) as unknown);
    if (!parsed) {
      const seed = buildLandingCmsSeed();
      persistSnapshot(seed);
      memory = cloneSnapshot(seed);
      return memory;
    }
    memory = cloneSnapshot(parsed);
    return memory;
  } catch {
    const seed = buildLandingCmsSeed();
    persistSnapshot(seed);
    memory = cloneSnapshot(seed);
    return memory;
  }
}

export function readLandingCmsSnapshot(): LandingCmsSnapshot {
  return cloneSnapshot(loadSnapshot());
}

export function writeLandingCmsSnapshot(data: LandingCmsSnapshot): void {
  const next = cloneSnapshot(data);
  persistSnapshot(next);
  memory = next;
}

export function readLandingBanners(): LandingBanner[] {
  return readLandingCmsSnapshot().banners;
}

export function readLandingSocials(): LandingSocial[] {
  return readLandingCmsSnapshot().socials;
}

export function readLandingProducts(): LandingProduct[] {
  return readLandingCmsSnapshot().products;
}

export function nextLandingEntityId(prefix: 'bnr' | 'soc' | 'prd'): string {
  // English ASCII digits only (rule 85).
  return `${prefix}-${Date.now()}`;
}

/** Test-only reset to seed (clears in-memory + storage when available). */
export function resetLandingCmsStoreForTests(
  snapshot?: LandingCmsSnapshot
): void {
  const next = cloneSnapshot(snapshot ?? buildLandingCmsSeed());
  memory = next;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota/storage errors in test reset.
    }
  }
}
