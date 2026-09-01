'use client';

import { useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogFooter,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { KvTypography } from '@/components/shared/KvTypography';
import { shellCopy } from '@/components/shared/shell/shellCopy';
import {
  usePwaInstallAvailable,
  usePwaInstallDialogOpen,
  usePwaStandalone,
} from '@/hooks/usePwaInstall';
import {
  getManualInstallPlatform,
  isIosSafariInstallHint,
  promptPwaInstall,
} from '@/lib/pwa/pwa-install';
import {
  closePwaInstallDialog,
  dismissPwaInstallSuggestion,
  isPwaInstallDismissed,
  shouldShowPwaInstallBanner,
} from '@/lib/pwa/pwa-install-ui';
import { faIcons } from '@/utils/iconMap';

function hintText(): string {
  if (isIosSafariInstallHint()) return shellCopy.account.installOfferIosHint;
  return shellCopy.account.installOfferChromeHint;
}

/**
 * Safari (iOS و macOS) هرگز `beforeinstallprompt` را نمی‌فرستد — برای این دو پلتفرم
 * مراحل دستی نصب را درون دیالوگ نشان می‌دهیم.
 */
function ManualInstallHint() {
  const platform = getManualInstallPlatform();

  if (platform === 'ios') {
    return (
      <div className="flex flex-col gap-kv-field">
        <KvTypography variant="caption" tone="muted" weight="bold" as="p">
          {shellCopy.account.installOfferIosTitle}
        </KvTypography>
        <ol className="flex list-decimal flex-col gap-kv-field ps-kv-group">
          {shellCopy.account.installOfferIosHintSteps.map((step) => (
            <li key={step}>
              <KvTypography variant="caption" tone="muted" as="span">
                {step}
              </KvTypography>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (platform === 'mac-safari') {
    return (
      <div className="flex flex-col gap-kv-field">
        <KvTypography variant="caption" tone="muted" weight="bold" as="p">
          {shellCopy.account.installOfferMacTitle}
        </KvTypography>
        <ol className="flex list-decimal flex-col gap-kv-field ps-kv-group">
          {shellCopy.account.installOfferMacHintSteps.map((step) => (
            <li key={step}>
              <KvTypography variant="caption" tone="muted" as="span">
                {step}
              </KvTypography>
            </li>
          ))}
        </ol>
        <KvTypography variant="caption" tone="muted" as="p">
          {shellCopy.account.installOfferMacUnsupportedHint}
        </KvTypography>
      </div>
    );
  }

  return (
    <KvTypography variant="caption" tone="muted" as="p">
      {hintText()}
    </KvTypography>
  );
}

async function runNativeInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  return promptPwaInstall();
}

function OfferCopy({ nativeAvailable }: { nativeAvailable: boolean }) {
  return (
    <div className="flex flex-col gap-kv-pair">
      <KvTypography variant="body" tone="muted">
        {shellCopy.account.installOfferBody}
      </KvTypography>
      <KvTypography variant="caption" tone="muted">
        {nativeAvailable
          ? shellCopy.account.installOfferNativeHint
          : hintText()}
      </KvTypography>
    </div>
  );
}

/**
 * پیشنهاد نصب: کارت آرام پایین وقتی Chrome می‌تواند نصب کند، به‌علاوه `KvDialog` از فوتر/منوی حساب.
 */
export function PwaInstallSuggestion() {
  const standalone = usePwaStandalone();
  const nativeAvailable = usePwaInstallAvailable();
  const dialogOpen = usePwaInstallDialogOpen();
  const [dismissed, setDismissed] = useState(isPwaInstallDismissed);
  const [busy, setBusy] = useState(false);

  if (standalone) return null;

  const showBanner = shouldShowPwaInstallBanner({
    standalone,
    dismissed,
    nativeAvailable,
  });

  const handleDismiss = () => {
    dismissPwaInstallSuggestion();
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (isIosSafariInstallHint() || !nativeAvailable) {
      closePwaInstallDialog();
      return;
    }
    setBusy(true);
    try {
      const outcome = await runNativeInstall();
      if (outcome === 'accepted') {
        dismissPwaInstallSuggestion();
        setDismissed(true);
      }
    } finally {
      setBusy(false);
      closePwaInstallDialog();
    }
  };

  const primaryLabel =
    nativeAvailable && !isIosSafariInstallHint()
      ? shellCopy.account.installOfferAction
      : shellCopy.account.installOfferGotIt;

  return (
    <>
      {showBanner ? (
        <aside
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-kv-group sm:justify-end sm:p-kv-region"
          aria-label={shellCopy.account.installOfferTitle}
        >
          <div className="pointer-events-auto flex w-full max-w-md items-start gap-kv-group rounded-kv-card border border-kv-border bg-kv-surface p-kv-group shadow-kv-floating">
            <KarvitaBrandMark className="size-10" />
            <div className="min-w-0 flex-1">
              <KvTypography variant="subtitle" as="p">
                {shellCopy.account.installOfferTitle}
              </KvTypography>
              <OfferCopy nativeAvailable={nativeAvailable} />
              <div className="mt-kv-group flex flex-wrap gap-kv-pair">
                <KvButton
                  type="button"
                  size="sm"
                  appearance="secondary"
                  onClick={handleDismiss}
                >
                  {shellCopy.account.installOfferLater}
                </KvButton>
                <KvButton
                  type="button"
                  size="sm"
                  color="cta"
                  loading={busy}
                  icon={<FaIcon icon={faIcons.download} size="xs" />}
                  onClick={() => void handleInstall()}
                >
                  {primaryLabel}
                </KvButton>
              </div>
            </div>
          </div>
        </aside>
      ) : null}

      <KvDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closePwaInstallDialog();
        }}
      >
        <KvDialogContent size="sm">
          <KvDialogHeader>
            <div className="mb-kv-pair flex size-12 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand-soft-fg">
              <FaIcon icon={faIcons.download} size="md" />
            </div>
            <KvDialogTitle>{shellCopy.account.installOfferTitle}</KvDialogTitle>
            <KvDialogDescription>
              {shellCopy.account.installOfferBody}
            </KvDialogDescription>
          </KvDialogHeader>
          {nativeAvailable ? (
            <KvTypography variant="caption" tone="muted" as="p">
              {shellCopy.account.installOfferNativeHint}
            </KvTypography>
          ) : (
            <ManualInstallHint />
          )}
          <KvDialogFooter>
            <KvButton
              type="button"
              appearance="secondary"
              onClick={handleDismiss}
            >
              {shellCopy.account.installOfferLater}
            </KvButton>
            <KvButton
              type="button"
              color="cta"
              loading={busy}
              onClick={() => void handleInstall()}
            >
              {primaryLabel}
            </KvButton>
          </KvDialogFooter>
        </KvDialogContent>
      </KvDialog>
    </>
  );
}
