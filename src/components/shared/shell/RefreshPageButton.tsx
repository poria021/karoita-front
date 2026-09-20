'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { usePageRefreshHandlerGetter } from '@/components/shared/shell/PageRefreshContext';
import { usePwaStandalone } from '@/lib/pwa/usePwaStandalone';
import { faIcons } from '@/utils/iconMap';

/**
 * دکمه رفرش صفحه — فقط در PWA standalone و در دسکتاپ/تبلت نمایش داده می‌شود.
 * در موبایل pull-to-refresh جایگزین این دکمه است.
 */
export function RefreshPageButton() {
  const isStandalone = usePwaStandalone();
  const router = useRouter();
  const getPageRefreshHandler = usePageRefreshHandlerGetter();
  const [spinning, setSpinning] = useState(false);

  if (!isStandalone) return null;

  async function handleRefresh() {
    if (spinning) return;
    setSpinning(true);
    // صفحه‌ای که رفرش scoped خودش را با useRegisterPageRefresh معرفی کرده
    // (مثل daily-approvals) همان را صدا می‌زنیم — نه invalidateQueries()
    // سراسری که کل کش React Query (حتی کوئری‌های صفحات/شل دیگر) را دوباره
    // fetch می‌کرد. صفحه‌ای که هنوز معرفی نکرده، فقط router.refresh() می‌گیرد.
    const pageRefresh = getPageRefreshHandler();
    await Promise.all([pageRefresh?.(), router.refresh()]);
    await new Promise((r) => setTimeout(r, 700));
    setSpinning(false);
  }

  return (
    <KvButton
      type="button"
      color="neutral"
      appearance="ghost"
      size="sm"
      onClick={handleRefresh}
      aria-label="بارگذاری مجدد صفحه"
      // موبایل: hidden — pull-to-refresh جایگزین است
      className="hidden sm:flex"
      icon={
        <FaIcon
          icon={faIcons.arrowsRotate}
          size="sm"
          className={spinning ? 'animate-spin' : undefined}
        />
      }
    >
      بارگذاری مجدد
    </KvButton>
  );
}
