'use client';

import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvMediaThumb } from '@/components/shared/KvMediaThumb';
import { faIcons } from '@/utils/iconMap';

import { isPdfDocUrl } from '../constants';

interface OnboardingApprovalsDocPreviewDialogProps {
  url: string | null;
  onClose: () => void;
}

export function OnboardingApprovalsDocPreviewDialog({
  url,
  onClose,
}: OnboardingApprovalsDocPreviewDialogProps) {
  const open = Boolean(url);
  const isPdf = isPdfDocUrl(url ?? undefined);

  return (
    <KvDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <KvDialogContent size="xl">
        <KvDialogHeader>
          <KvDialogTitle>پیش‌نمایش مدرک هویتی</KvDialogTitle>
          <KvDialogDescription>
            برای بستن پنجره، خارج از تصویر کلیک کنید یا Escape را بزنید.
          </KvDialogDescription>
        </KvDialogHeader>

        {url ? (
          isPdf ? (
            <KvCard tone="danger">
              <KvCardContent padding="lg">
                <KvEmptyState
                  tone="danger"
                  icon={<FaIcon icon={faIcons.filePdf} size="lg" />}
                  title="پیش‌نمایش PDF در دسترس نیست"
                  description="سند PDF — پیش‌نمایش درون‌برنامه‌ای در دسترس نیست."
                  actions={
                    <KvButton
                      type="button"
                      appearance="secondary"
                      size="sm"
                      onClick={() =>
                        window.open(url, '_blank', 'noopener,noreferrer')
                      }
                    >
                      باز کردن در تب جدید
                    </KvButton>
                  }
                />
              </KvCardContent>
            </KvCard>
          ) : (
            <KvMediaThumb src={url} variant="preview" alt="پیش‌نمایش مدرک هویتی" />
          )
        ) : null}
      </KvDialogContent>
    </KvDialog>
  );
}
