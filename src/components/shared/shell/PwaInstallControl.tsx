'use client';

import { toast } from 'sonner';

import { shellCopy } from '@/components/shared/shell/shellCopy';
import {
  getManualInstallPlatform,
  isKarvitaPwaInstalled,
  promptPwaInstall,
} from '@/lib/pwa/pwa-install';
import { openPwaInstallDialog } from '@/lib/pwa/pwa-install-ui';

/**
 * iOS و Safari مک `beforeinstallprompt` ندارند — فقط آنجا راهنمای دستی.
 * بقیهٔ مرورگرها مستقیم پرامپت بومی را می‌زنند، بدون مدال تأیید.
 * اگر اپ از قبل روی دستگاه باشد، پرامپت باز نمی‌شود — توستر کافی است.
 */
function notifyAlreadyInstalled(): void {
  toast.warning(shellCopy.account.installAppAlreadyInstalled);
}

export async function runPwaInstallFlow(): Promise<void> {
  if (await isKarvitaPwaInstalled()) {
    notifyAlreadyInstalled();
    return;
  }
  if (getManualInstallPlatform()) {
    openPwaInstallDialog();
    return;
  }
  const outcome = await promptPwaInstall();
  // بدون beforeinstallprompt یعنی یا اپ نصب است یا مرورگر پرامپت ندارد.
  if (outcome === 'unavailable') {
    notifyAlreadyInstalled();
  }
}

/** دکمه می‌ماند تا کلیک روی اپِ نصب‌شده توستر بدهد، نه اینکه آیتم مخفی شود. */
export function shouldShowPwaInstallMenuItem(_standalone: boolean): boolean {
  return true;
}
