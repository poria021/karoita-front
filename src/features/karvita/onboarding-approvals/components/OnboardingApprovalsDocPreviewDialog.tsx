'use client';

import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { FaIcon } from '@/components/shared/FaIcon';
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
      <KvDialogContent size="xl" className="gap-kv-group">
        <KvDialogHeader>
          <KvDialogTitle>پیش‌نمایش مدرک هویتی</KvDialogTitle>
          <KvDialogDescription>
            برای بستن پنجره، خارج از تصویر کلیک کنید یا Escape را بزنید.
          </KvDialogDescription>
        </KvDialogHeader>

        {url ? (
          isPdf ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-kv-panel border border-kv-border bg-kv-danger-soft/30 p-8 text-kv-danger">
              <FaIcon icon={faIcons.filePdf} size="xl" />
              <p className="text-xs font-bold text-kv-text-secondary">
                سند PDF — پیش‌نمایش درون‌برنامه‌ای در دسترس نیست.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-extrabold text-kv-brand underline-offset-2 hover:underline"
              >
                باز کردن در تب جدید
              </a>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- data-URI mock docs; not a remote asset pipeline
            <img
              src={url}
              alt="پیش‌نمایش مدرک هویتی"
              className="mx-auto max-h-[70vh] w-auto max-w-full rounded-kv-panel border border-kv-border object-contain"
            />
          )
        ) : null}
      </KvDialogContent>
    </KvDialog>
  );
}
