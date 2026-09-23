'use client';

import { useRouter } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { RouteService } from '@/services/route.service';
import { faIcons } from '@/utils/iconMap';

export function AuthPwaBackButton() {
  const router = useRouter();

  return (
    <KvButton
      type="button"
      color="neutral"
      appearance="secondary"
      size="sm"
      aria-label="بازگشت"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
          return;
        }
        router.push(RouteService.marketing.loginSelect());
      }}
      icon={<FaIcon icon={faIcons.arrowLeft} size="sm" />}
    />
  );
}
