'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { scheduleUndoableMutation } from '@/lib/undoable-mutation';
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
    const requestId = ++loadRequestIdRef.current;
    let cancelled = false;

    // Initial `isLoading` is true; resolve after Facade (setState only post-await).
    void (async () => {
      try {
        const [nextBanners, nextSocials, nextProducts] = await Promise.all([
          LandingCmsService.listBanners(),
          LandingCmsService.listSocials(),
          LandingCmsService.listProducts(),
        ]);
        if (cancelled || requestId !== loadRequestIdRef.current) return;
        setBanners(nextBanners);
        setSocials(nextSocials);
        setProducts(nextProducts);
        hasDataRef.current = true;
        setError(null);
      } catch (err) {
        if (cancelled || requestId !== loadRequestIdRef.current) return;
        setError(errorMessage(err, 'بارگذاری محتوای لندینگ ناموفق بود.'));
      } finally {
        if (!cancelled && requestId === loadRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const changeTab = useCallback((next: LandingCmsTab) => {
    setTab(next);
  }, []);

  const requestDelete = useCallback(
    (target: LandingCmsDeleteTarget) => {
      const bannersSnapshot = banners;
      const socialsSnapshot = socials;
      const productsSnapshot = products;

      const message =
        target.kind === 'banners'
          ? 'بنر مورد نظر حذف شد.'
          : target.kind === 'socials'
            ? 'شبکه اجتماعی حذف شد.'
            : 'محصول از داک شناور حذف شد.';

      scheduleUndoableMutation({
        tone: 'error',
        message,
        undoLabel: 'لغو',
        apply: () => {
          if (target.kind === 'banners') {
            setBanners((prev) => prev.filter((item) => item.id !== target.id));
          } else if (target.kind === 'socials') {
            setSocials((prev) => prev.filter((item) => item.id !== target.id));
          } else {
            setProducts((prev) => prev.filter((item) => item.id !== target.id));
          }
        },
        revert: () => {
          setBanners(bannersSnapshot);
          setSocials(socialsSnapshot);
          setProducts(productsSnapshot);
        },
        commit: async () => {
          if (target.kind === 'banners') {
            await LandingCmsService.deleteBanner(target.id);
          } else if (target.kind === 'socials') {
            await LandingCmsService.deleteSocial(target.id);
          } else {
            await LandingCmsService.deleteProduct(target.id);
          }
        },
        onCommitted: async () => {
          await reload({ soft: true });
        },
        onError: (err) => {
          toast.error(errorMessage(err, 'حذف ناموفق بود.'));
        },
      });
    },
    [banners, products, reload, socials]
  );

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
    requestDelete,
  };
}
