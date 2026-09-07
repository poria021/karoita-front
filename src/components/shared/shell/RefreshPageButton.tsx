'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { usePwaStandalone } from '@/lib/pwa/usePwaStandalone';
import { faIcons } from '@/utils/iconMap';

/**
 * دکمه رفرش صفحه — فقط در PWA standalone و در دسکتاپ/تبلت نمایش داده می‌شود.
 * در موبایل pull-to-refresh جایگزین این دکمه است.
 */
export function RefreshPageButton() {
  const isStandalone = usePwaStandalone();
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  if (!isStandalone) return null;

  async function handleRefresh() {
    if (spinning) return;
    setSpinning(true);
    router.refresh();
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
