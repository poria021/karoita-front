'use client';

import { openPwaInstallDialog } from '@/lib/pwa/pwa-install-ui';

/** Opens the design-system install suggestion (dialog), not a toast. */
export function runPwaInstallFlow(): void {
  openPwaInstallDialog();
}

export function shouldShowPwaInstallMenuItem(standalone: boolean): boolean {
  return !standalone;
}
