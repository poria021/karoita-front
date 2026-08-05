'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { LandingCmsService } from '@/services/landing-cms.service';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type {
  LandingBanner,
  LandingProduct,
  LandingSocial,
} from '@/types/landing-cms';

import type { LandingCmsTab } from '../constants';

const LANDING_CMS_CHROME_ID = 'karvita:landing-cms:chrome';

type LandingCmsChrome = {
  tab: LandingCmsTab;
};

export type LandingCmsDeleteTarget = {
  kind: LandingCmsTab;
  id: string;
  label: string;
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useLandingCmsPage() {
  const getChrome = useDashboardModuleCache((s) => s.getChrome);
  const setChrome = useDashboardModuleCache((s) => s.setChrome);
  const cachedChrome = getChrome<LandingCmsChrome>(LANDING_CMS_CHROME_ID);

  const [tab, setTab] = useState<LandingCmsTab>(
    () => cachedChrome?.tab ?? 'banners'
  );
  const [banners, setBanners] = useState<LandingBanner[]>([]);
  const [socials, setSocials] = useState<LandingSocial[]>([]);
  const [products, setProducts] = useState<LandingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<LandingCmsDeleteTarget | null>(null);

  const loadRequestIdRef = useRef(0);
  const hasDataRef = useRef(false);

  useEffect(() => {
    setChrome<LandingCmsChrome>(LANDING_CMS_CHROME_ID, { tab });
  }, [tab, setChrome]);

  const reload = useCallback(async (opts?: { soft?: boolean }) => {
    const soft = Boolean(opts?.soft && hasDataRef.current);
    const requestId = ++loadRequestIdRef.current;
    if (!soft) setIsLoading(true);
    setError(null);

    try {
      const [nextBanners, nextSocials, nextProducts] = await Promise.all([
        LandingCmsService.listBanners(),
        LandingCmsService.listSocials(),
        LandingCmsService.listProducts(),
      ]);
      if (requestId !== loadRequestIdRef.current) return;
      setBanners(nextBanners);
      setSocials(nextSocials);
      setProducts(nextProducts);
      hasDataRef.current = true;
    } catch (err) {
      if (requestId !== loadRequestIdRef.current) return;
      setError(errorMessage(err, 'بارگذاری محتوای لندینگ ناموفق بود.'));
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const changeTab = useCallback((next: LandingCmsTab) => {
    setTab(next);
  }, []);

  const requestDelete = useCallback((target: LandingCmsDeleteTarget) => {
    setDeleteTarget(target);
  }, []);

  const clearDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.kind === 'banners') {
        await LandingCmsService.deleteBanner(deleteTarget.id);
        toast.success('بنر مورد نظر حذف شد.');
      } else if (deleteTarget.kind === 'socials') {
        await LandingCmsService.deleteSocial(deleteTarget.id);
        toast.success('شبکه اجتماعی حذف شد.');
      } else {
        await LandingCmsService.deleteProduct(deleteTarget.id);
        toast.success('محصول از داک شناور حذف شد.');
      }
      setDeleteTarget(null);
      await reload({ soft: true });
    } catch (err) {
      toast.error(errorMessage(err, 'حذف ناموفق بود.'));
    }
  }, [deleteTarget, reload]);

  const softReload = useCallback(
    () => reload({ soft: true }),
    [reload]
  );

  return {
    tab,
    changeTab,
    banners,
    socials,
    products,
    isLoading,
    error,
    reload,
    softReload,
    deleteTarget,
    requestDelete,
    clearDelete,
    confirmDelete,
  };
}
