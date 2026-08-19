'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { runPwaInstallFlow } from '@/components/shared/shell/PwaInstallControl';
import { shellCopy } from '@/components/shared/shell/shellCopy';
import { usePwaStandalone } from '@/hooks/usePwaInstall';
import { faIcons } from '@/utils/iconMap';

/**
 * Marketing footer install affordance — client leaf for beforeinstallprompt.
 */
export function MarketingPwaInstallChip() {
  const standalone = usePwaStandalone();
  if (standalone) return null;

  return (
    <button
      type="button"
      onClick={() => void runPwaInstallFlow()}
      className="group inline-flex items-center gap-3 rounded-kv-control border-2 border-kv-brand-border bg-kv-surface px-4 py-2.5 text-start transition-colors hover:bg-kv-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring/30"
      aria-label={shellCopy.account.installApp}
    >
      <div className="flex items-center gap-1.5 rounded-sm bg-kv-brand-soft px-2.5 py-1.5 text-xs font-black text-kv-brand">
        <FaIcon icon={faIcons.mobileScreen} size="xs" />
        <FaIcon icon={faIcons.tabletScreenButton} size="xs" />
        <FaIcon icon={faIcons.desktop} size="xs" />
      </div>
      <span className="flex flex-col text-right">
        <span className="text-xs font-black text-kv-text">
          {shellCopy.account.installAppPwa}
        </span>
      </span>
      <FaIcon
        icon={faIcons.arrowLeft}
        size="xs"
        className="me-0 ms-2 text-kv-brand rtl:rotate-180"
      />
    </button>
  );
}
