'use client';

import { useCallback, useId, useState } from 'react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { toast } from 'sonner';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  kvDropzoneIconClass,
  kvDropzoneSurfaceClass,
} from '@/components/shared/fields/kvDropzoneSurface';
import { KvTypography } from '@/components/shared/KvTypography';
import { apiClient } from '@/services/api-client';
import { FilesService, fileUploadUserMessage } from '@/services/files.service';
import { isMockApiMode } from '@/lib/api-mode';
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
  accept?: Accept;
  acceptLabel?: string;
  invalidTypeMessage?: string;
  onAdd: (files: KvAttachmentItem[]) => void;
  onRemove: (fileId: string) => void;
};

const DEFAULT_ACCEPT: Accept = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
  'application/x-zip': ['.zip'],
};

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
  maxFileSizeMb = 5,
  maxTotalSizeMb = 100,
  accept = DEFAULT_ACCEPT,
  acceptLabel = 'فرمت‌های مجاز: PDF، TXT و ZIP تا سقف ۵ مگابایت',
  invalidTypeMessage = 'فرمت فایل انتخابی مجاز نیست. فقط PDF، TXT یا ZIP مجاز است.',
  onAdd,
  onRemove,
}: KvMultiFileDropzoneProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [localError, setLocalError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentTotalMb = files.reduce((sum, file) => sum + file.sizeMb, 0);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (disabled || isUploading) return;
      setLocalError(null);

      if (rejectedFiles.length > 0) {
        const code = rejectedFiles[0]?.errors[0]?.code;
        if (code === 'file-too-large') {
          setLocalError(
            `حجم فایل نباید بیشتر از ${toPersianDigits(String(maxFileSizeMb))} مگابایت باشد.`
          );
        } else if (code === 'file-invalid-type') {
          setLocalError(invalidTypeMessage);
        } else {
          setLocalError('خطا در بارگذاری فایل. لطفاً دوباره تلاش کنید.');
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const toUpload: File[] = [];
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
        toUpload.push(file);
      }

      if (toUpload.length === 0) return;

      /** حالت mock هیچ اعتبارسنجی mongodb id ندارد؛ فقط real باید واقعاً آپلود شود. */
      const useRealUpload = !isMockApiMode() && apiClient.isConfigured;

      setIsUploading(true);
      const next: KvAttachmentItem[] = [];
      try {
        for (const file of toUpload) {
          const sizeMb = toSizeMb(file.size);
          if (!useRealUpload) {
            next.push({
              id: createAttachmentId(),
              name: file.name,
              sizeMb,
              mimeType: file.type || undefined,
            });
            continue;
          }

          try {
            const uploaded = await FilesService.uploadFile(file);
            next.push({
              id: uploaded.id,
              name: file.name,
              sizeMb,
              mimeType: file.type || undefined,
            });
          } catch (error) {
            toast.error(
              `آپلود فایل "${file.name}" ناموفق بود: ${fileUploadUserMessage(error)}`
            );
          }
        }
      } finally {
        setIsUploading(false);
      }

      if (next.length === 0) return;
      onAdd(next);
      toast.success(
        next.length === 1
          ? `فایل "${next[0]!.name}" با موفقیت ضمیمه گردید.`
          : `${toPersianDigits(next.length)} فایل با موفقیت ضمیمه گردید.`
      );
    },
    [
      currentTotalMb,
      disabled,
      invalidTypeMessage,
      isUploading,
      maxFileSizeMb,
      maxTotalSizeMb,
      onAdd,
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxFileSizeMb * 1024 * 1024,
    multiple: true,
    disabled: disabled || isUploading,
    noClick: disabled || isUploading,
    noDrag: disabled || isUploading,
    noKeyboard: disabled || isUploading,
  });

  return (
    <div className="space-y-kv-inline rounded-kv-panel border border-kv-border bg-kv-surface-muted/60 p-kv-group">
      <div
        {...getRootProps()}
        className={kvDropzoneSurfaceClass({
          disabled: disabled || isUploading,
          isDragActive: disabled || isUploading ? false : isDragActive,
          error: Boolean(localError),
        })}
      >
        <input {...getInputProps()} id={id} />
        <span
          className={kvDropzoneIconClass({
            disabled: disabled || isUploading,
            isDragActive: disabled || isUploading ? false : isDragActive,
          })}
        >
          <FaIcon
            icon={isUploading ? faIcons.spinner : faIcons.cloudArrowUp}
            size="sm"
            spin={isUploading}
          />
        </span>
        <KvTypography
          variant="subtitle"
          weight="black"
          tone={disabled || isUploading ? 'disabled' : 'default'}
          as="p"
          align="center"
        >
          {isUploading
            ? 'در حال بارگذاری فایل...'
            : disabled
              ? 'ضمیمه فایل در این وضعیت فقط قابل مشاهده است'
              : isDragActive
                ? 'فایل را اینجا رها کنید'
                : 'کشیدن و رها کردن فایل‌ها یا کلیک جهت انتخاب'}
        </KvTypography>
        <KvTypography
          variant="caption"
          tone={disabled ? 'disabled' : 'muted'}
          as="span"
          align="center"
        >
          {acceptLabel}
        </KvTypography>
      </div>

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
