'use client';

import {
  getManualInstallPlatform,
  promptPwaInstall,
} from '@/lib/pwa/pwa-install';
import { openPwaInstallDialog } from '@/lib/pwa/pwa-install-ui';

/**
 * iOS و Safari مک `beforeinstallprompt` ندارند — فقط آنجا راهنمای دستی.
 * بقیهٔ مرورگرها مستقیم پرامپت بومی را می‌زنند، بدون مدال تأیید.
 */
export function runPwaInstallFlow(): void {
  if (getManualInstallPlatform()) {
    openPwaInstallDialog();
    return;
  }
  void promptPwaInstall();
}

export function shouldShowPwaInstallMenuItem(standalone: boolean): boolean {
  return !standalone;
}
