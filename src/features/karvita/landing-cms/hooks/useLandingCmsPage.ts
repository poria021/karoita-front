'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { scheduleUndoableMutation } from '@/lib/undoable-mutation';
import { LandingCmsService } from '@/services/landing-cms.service';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type {
  CreateLandingBannerInput,
  CreateLandingProductInput,
  CreateLandingSocialInput,
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

function revokeIfBlob(url: string): void {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
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

  const scheduleCreateBanner = useCallback(
    (input: CreateLandingBannerInput) => {
      const tempId = `temp-banner-${Date.now()}`;
      const imageUrl = URL.createObjectURL(input.image);
      const optimistic: LandingBanner = {
        id: tempId,
        title: input.title.trim(),
        link: input.link?.trim() ?? '',
        imageUrl,
      };
      let snapshot: LandingBanner[] = [];

      scheduleUndoableMutation({
        message: 'بنر جدید به اسلایدر اضافه شد.',
        undoLabel: 'لغو',
        apply: () => {
          setBanners((prev) => {
            snapshot = prev;
            return [optimistic, ...prev];
          });
        },
        revert: () => {
          revokeIfBlob(imageUrl);
          setBanners(snapshot);
        },
        commit: () => LandingCmsService.createBanner(input),
        onCommitted: async () => {
          revokeIfBlob(imageUrl);
          await reload({ soft: true });
        },
        onError: (err) => {
          toast.error(errorMessage(err, 'افزودن بنر ناموفق بود.'));
        },
      });
    },
    [reload]
  );

  const scheduleCreateSocial = useCallback(
    (input: CreateLandingSocialInput) => {
      const tempId = `temp-social-${Date.now()}`;
      const iconImageUrl = input.iconImage
        ? URL.createObjectURL(input.iconImage)
        : '';
      const optimistic: LandingSocial = {
        id: tempId,
        name: input.name.trim(),
        link: input.link.trim(),
        iconImageUrl,
        icon: input.icon ?? 'fa-share-nodes',
      };
      let snapshot: LandingSocial[] = [];

      scheduleUndoableMutation({
        message: 'شبکه اجتماعی جدید اضافه شد.',
        undoLabel: 'لغو',
        apply: () => {
          setSocials((prev) => {
            snapshot = prev;
            return [optimistic, ...prev];
          });
        },
        revert: () => {
          revokeIfBlob(iconImageUrl);
          setSocials(snapshot);
        },
        commit: () => LandingCmsService.createSocial(input),
        onCommitted: async () => {
          revokeIfBlob(iconImageUrl);
          await reload({ soft: true });
        },
        onError: (err) => {
          toast.error(errorMessage(err, 'افزودن شبکه اجتماعی ناموفق بود.'));
        },
      });
    },
    [reload]
  );

  const scheduleCreateProduct = useCallback(
    (input: CreateLandingProductInput) => {
      const tempId = `temp-product-${Date.now()}`;
      const logoImageUrl = URL.createObjectURL(input.logoImage);
      const optimistic: LandingProduct = {
        id: tempId,
        title: input.title.trim(),
        link: input.link.trim(),
        logoImageUrl,
        icon: input.icon ?? 'fa-cube',
      };
      let snapshot: LandingProduct[] = [];

      scheduleUndoableMutation({
        message: 'محصول جدید به داک شناور اضافه شد.',
        undoLabel: 'لغو',
        apply: () => {
          setProducts((prev) => {
            snapshot = prev;
            return [optimistic, ...prev];
          });
        },
        revert: () => {
          revokeIfBlob(logoImageUrl);
          setProducts(snapshot);
        },
        commit: () => LandingCmsService.createProduct(input),
        onCommitted: async () => {
          revokeIfBlob(logoImageUrl);
          await reload({ soft: true });
        },
        onError: (err) => {
          toast.error(errorMessage(err, 'افزودن محصول ناموفق بود.'));
        },
      });
    },
    [reload]
  );

  const requestDelete = useCallback(
    (target: LandingCmsDeleteTarget) => {
      let bannersSnapshot: LandingBanner[] = [];
      let socialsSnapshot: LandingSocial[] = [];
      let productsSnapshot: LandingProduct[] = [];

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
            setBanners((prev) => {
              bannersSnapshot = prev;
              return prev.filter((item) => item.id !== target.id);
            });
          } else if (target.kind === 'socials') {
            setSocials((prev) => {
              socialsSnapshot = prev;
              return prev.filter((item) => item.id !== target.id);
            });
          } else {
            setProducts((prev) => {
              productsSnapshot = prev;
              return prev.filter((item) => item.id !== target.id);
            });
          }
        },
        revert: () => {
          if (target.kind === 'banners') setBanners(bannersSnapshot);
          else if (target.kind === 'socials') setSocials(socialsSnapshot);
          else setProducts(productsSnapshot);
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
    scheduleCreateBanner,
    scheduleCreateSocial,
    scheduleCreateProduct,
    requestDelete,
  };
}
