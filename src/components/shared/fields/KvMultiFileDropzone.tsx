'use client';

import { useCallback, useId, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { toast } from 'sonner';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

export type KvAttachmentItem = {
  id: string;
  name: string;
  sizeMb: number;
  mimeType?: string;
};

export type KvMultiFileDropzoneProps = {
  id?: string;
  files: KvAttachmentItem[];
  disabled?: boolean;
  maxFileSizeMb?: number;
  maxTotalSizeMb?: number;
  acceptLabel?: string;
  onAdd: (files: KvAttachmentItem[]) => void;
  onRemove: (fileId: string) => void;
};

const DEFAULT_ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'video/mp4': ['.mp4'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/mp3': ['.mp3'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    '.docx',
  ],
} as const;

function toSizeMb(bytes: number): number {
  return Number((bytes / (1024 * 1024)).toFixed(2));
}

function createAttachmentId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function KvMultiFileDropzone({
  id: idProp,
  files,
  disabled = false,
  maxFileSizeMb = 2,
  maxTotalSizeMb = 100,
  acceptLabel = 'فرمت‌های مجاز: عکس، ویدیو، صدا و اسناد متنی تا سقف ۲ مگابایت',
  onAdd,
  onRemove,
}: KvMultiFileDropzoneProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [localError, setLocalError] = useState<string | null>(null);

  const currentTotalMb = files.reduce((sum, file) => sum + file.sizeMb, 0);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (disabled) return;
      setLocalError(null);

      if (rejectedFiles.length > 0) {
        const code = rejectedFiles[0]?.errors[0]?.code;
        if (code === 'file-too-large') {
          setLocalError(
            `حجم فایل نباید بیشتر از ${toPersianDigits(String(maxFileSizeMb))} مگابایت باشد.`
          );
        } else if (code === 'file-invalid-type') {
          setLocalError(
            'فرمت فایل انتخابی مجاز نیست. فرمت‌های مجاز: عکس، ویدیو (mp4)، صدا (mp3, wav) و اسناد متنی (pdf, docx)'
          );
        } else {
          setLocalError('خطا در بارگذاری فایل. لطفاً دوباره تلاش کنید.');
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const next: KvAttachmentItem[] = [];
      let runningTotal = currentTotalMb;

      for (const file of acceptedFiles) {
        const sizeMb = toSizeMb(file.size);
        if (sizeMb > maxFileSizeMb) {
          toast.error(
            `خطا: حجم فایل "${file.name}" فراتر از سقف مجاز ${toPersianDigits(String(maxFileSizeMb))} مگابایت است.`
          );
          continue;
        }
        if (runningTotal + sizeMb > maxTotalSizeMb) {
          toast.error(
            `خطا: مجموع حجم فایل‌های ضمیمه شده از سقف مجاز ${toPersianDigits(String(maxTotalSizeMb))} مگابایت عبور می‌کند.`
          );
          break;
        }
        runningTotal += sizeMb;
        next.push({
          id: createAttachmentId(),
          name: file.name,
          sizeMb,
          mimeType: file.type || undefined,
        });
      }

      if (next.length === 0) return;
      onAdd(next);
      toast.success(
        next.length === 1
          ? `فایل "${next[0]!.name}" با موفقیت ضمیمه گردید.`
          : `${toPersianDigits(next.length)} فایل با موفقیت ضمیمه گردید.`
      );
    },
    [currentTotalMb, disabled, maxFileSizeMb, maxTotalSizeMb, onAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: DEFAULT_ACCEPT,
    maxSize: maxFileSizeMb * 1024 * 1024,
    multiple: true,
    disabled,
    noClick: disabled,
    noDrag: disabled,
    noKeyboard: disabled,
  });

  return (
    <div className="space-y-kv-group rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group">
      {!disabled ? (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center gap-kv-pair rounded-kv-panel border-2 border-dashed p-kv-section text-center transition-all',
            isDragActive
              ? 'cursor-pointer border-kv-brand bg-kv-brand-soft/40'
              : 'cursor-pointer border-kv-border bg-kv-surface-muted/50 hover:bg-kv-surface-muted'
          )}
        >
          <input {...getInputProps()} id={id} />
          <span className="text-kv-text-faint">
            <FaIcon icon={faIcons.cloudArrowUp} size="lg" />
          </span>
          <KvTypography variant="subtitle" weight="black" as="p" align="center">
            {isDragActive
              ? 'فایل را اینجا رها کنید'
              : 'کشیدن و رها کردن فایل‌ها یا کلیک جهت انتخاب'}
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="span" align="center">
            {acceptLabel}
          </KvTypography>
        </div>
      ) : null}

      {localError ? (
        <p role="alert" className="text-xs font-bold text-kv-danger">
          {localError}
        </p>
      ) : null}

      {files.length > 0 ? (
        <ul className="flex flex-col gap-kv-pair">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-kv-pair rounded-kv-panel border border-kv-border bg-kv-surface-muted px-kv-group py-kv-pair"
            >
              <span className="flex min-w-0 items-center gap-kv-pair text-xs font-bold text-kv-text-secondary">
                <FaIcon
                  icon={faIcons.paperclip}
                  size="xs"
                  className="shrink-0 text-kv-text-faint"
                />
                <span className="truncate">
                  {file.name} ({toPersianDigits(file.sizeMb)} مگابایت)
                </span>
              </span>
              {!disabled ? (
                <KvButton
                  type="button"
                  color="error"
                  appearance="text"
                  size="sm"
                  icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
                  onClick={() => onRemove(file.id)}
                >
                  حذف ضمیمه
                </KvButton>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
