'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import { useLocalFormDraft } from '@/hooks/useLocalFormDraft';
import { useSyncedUrlParam } from '@/hooks/useSyncedUrlParam';
import { IS_MOCK_MODE } from '@/lib/api-mode';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { unknownErrorMessage } from '@/lib/unknown-error-message';
import { scheduleOptimisticMutation, scheduleUndoableMutation } from '@/lib/undoable-mutation';
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

import { LANDING_CMS_TABS, type LandingCmsTab } from '../constants';
import {
  fetchLandingCmsBundle,
  landingCmsQueryKey,
  type LandingCmsBundle,
} from './landingCmsQuery';

const LANDING_CMS_CHROME_ID = 'karvita:landing-cms:chrome';
const LANDING_CMS_TAB_KEYS = LANDING_CMS_TABS.map(
  (item) => item.key
) as LandingCmsTab[];

type LandingCmsChrome = {
  tab: LandingCmsTab;
};

function revokeIfBlob(url: string): void {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
}

function emptyBundle(): LandingCmsBundle {
  return { banners: [], socials: [], products: [] };
}

export type LandingCmsDeleteTarget = {
  kind: LandingCmsTab;
  id: string;
  label: string;
};

export function useLandingCmsPage() {
  const queryClient = useQueryClient();
  const getChrome = useDashboardModuleCache((s) => s.getChrome);
  const setChrome = useDashboardModuleCache((s) => s.setChrome);
  const cachedChrome = getChrome<LandingCmsChrome>(LANDING_CMS_CHROME_ID);
  const landingTabDraft = useLocalFormDraft<{ tab: LandingCmsTab }>({
    key: 'landing-cms:tab',
    initialValue: { tab: 'banners' },
    debounceMs: 200,
  });

  const [tab, setTab] = useSyncedUrlParam<LandingCmsTab>({
    name: 'tab',
    allowed: LANDING_CMS_TAB_KEYS,
    defaultValue: 'banners',
    preferWhenMissing: cachedChrome?.tab,
  });

  const {
    data,
    error: queryError,
    isPending,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: landingCmsQueryKey,
    queryFn: fetchLandingCmsBundle,
    staleTime: QUERY_STALE_MS.cms,
  });

  const banners = data?.banners ?? [];
  const socials = data?.socials ?? [];
  const products = data?.products ?? [];
  const isLoading = data == null && (isPending || isFetching);
  const error = queryError
    ? unknownErrorMessage(queryError, 'بارگذاری محتوای لندینگ ناموفق بود.')
    : null;

  useEffect(() => {
    setChrome<LandingCmsChrome>(LANDING_CMS_CHROME_ID, { tab });
    landingTabDraft.setValue({ tab });
  }, [landingTabDraft, tab, setChrome]);

  const patchBundle = useCallback(
    (updater: (prev: LandingCmsBundle) => LandingCmsBundle) => {
      queryClient.setQueryData<LandingCmsBundle>(landingCmsQueryKey, (old) =>
        updater(old ?? emptyBundle())
      );
    },
    [queryClient]
  );

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const changeTab = useCallback(
    (next: LandingCmsTab) => {
      setTab(next);
    },
    [setTab]
  );

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

      scheduleOptimisticMutation({
        message: 'بنر جدید به اسلایدر اضافه شد.',
        apply: () => {
          patchBundle((prev) => {
            snapshot = prev.banners;
            return { ...prev, banners: [optimistic, ...prev.banners] };
          });
        },
        revert: () => {
          revokeIfBlob(imageUrl);
          patchBundle((prev) => ({ ...prev, banners: snapshot }));
        },
        commit: () => LandingCmsService.createBanner(input),
        onCommitted: async () => {
          revokeIfBlob(imageUrl);
          await reload();
        },
        onError: (err) => {
          toast.error(unknownErrorMessage(err, 'افزودن بنر ناموفق بود.'));
        },
      });
    },
    [patchBundle, reload]
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

      scheduleOptimisticMutation({
        message: 'شبکه اجتماعی جدید اضافه شد.',
        apply: () => {
          patchBundle((prev) => {
            snapshot = prev.socials;
            return { ...prev, socials: [optimistic, ...prev.socials] };
          });
        },
        revert: () => {
          revokeIfBlob(iconImageUrl);
          patchBundle((prev) => ({ ...prev, socials: snapshot }));
        },
        commit: () => LandingCmsService.createSocial(input),
        onCommitted: async () => {
          revokeIfBlob(iconImageUrl);
          await reload();
        },
        onError: (err) => {
          toast.error(
            unknownErrorMessage(err, 'افزودن شبکه اجتماعی ناموفق بود.')
          );
        },
      });
    },
    [patchBundle, reload]
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

      scheduleOptimisticMutation({
        message: 'محصول جدید به داک شناور اضافه شد.',
        apply: () => {
          patchBundle((prev) => {
            snapshot = prev.products;
            return { ...prev, products: [optimistic, ...prev.products] };
          });
        },
        revert: () => {
          revokeIfBlob(logoImageUrl);
          patchBundle((prev) => ({ ...prev, products: snapshot }));
        },
        commit: () => LandingCmsService.createProduct(input),
        onCommitted: async () => {
          revokeIfBlob(logoImageUrl);
          await reload();
        },
        onError: (err) => {
          toast.error(unknownErrorMessage(err, 'افزودن محصول ناموفق بود.'));
        },
      });
    },
    [patchBundle, reload]
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
        // real mode: commit تا بسته‌شدن toast به تأخیر می‌افتد تا «لغو» واقعی باشد.
        // mock mode: commit فوری لازم است تا داده در localStorage قبل از reload ذخیره شود.
        deferCommit: !IS_MOCK_MODE,
        apply: () => {
          if (target.kind === 'banners') {
            patchBundle((prev) => {
              bannersSnapshot = prev.banners;
              return {
                ...prev,
                banners: prev.banners.filter((item) => item.id !== target.id),
              };
            });
          } else if (target.kind === 'socials') {
            patchBundle((prev) => {
              socialsSnapshot = prev.socials;
              return {
                ...prev,
                socials: prev.socials.filter((item) => item.id !== target.id),
              };
            });
          } else {
            patchBundle((prev) => {
              productsSnapshot = prev.products;
              return {
                ...prev,
                products: prev.products.filter((item) => item.id !== target.id),
              };
            });
          }
        },
        revert: () => {
          if (target.kind === 'banners') {
            patchBundle((prev) => ({ ...prev, banners: bannersSnapshot }));
          } else if (target.kind === 'socials') {
            patchBundle((prev) => ({ ...prev, socials: socialsSnapshot }));
          } else {
            patchBundle((prev) => ({ ...prev, products: productsSnapshot }));
          }
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
          await reload();
        },
        onError: (err) => {
          toast.error(unknownErrorMessage(err, 'حذف ناموفق بود.'));
        },
      });
    },
    [patchBundle, reload]
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
