'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { cn } from '@/lib/utils';
import {
  compressImage,
  formatFileSize,
  validateImageFile,
} from '@/utils/compressor';
import { faIcons } from '@/utils/iconMap';


interface IdentityDocUploaderProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  label?: string | false;
  helperText?: string;
  disabled?: boolean;
  error?: string;
}

export function IdentityDocUploader({
  value,
  onChange,
  label = 'بارگذاری مدرک هویتی (اختیاری)',
  helperText = 'PNG, JPG تا ۱۰ مگابایت',
  disabled = false,
  error,
}: IdentityDocUploaderProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const previewUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setLocalError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setLocalError('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.');
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setLocalError('فقط فایل‌های تصویری (JPEG، PNG) مجاز هستند.');
        } else {
          setLocalError('خطا در بارگذاری فایل. لطفاً دوباره تلاش کنید.');
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const validation = validateImageFile(file, 10);

      if (!validation.isValid) {
        setLocalError(validation.error || 'فایل نامعتبر است.');
        return;
      }

      try {
        setIsCompressing(true);
        const compressedFile = await compressImage(file, {
          maxWidth: 1000,
          quality: 0.7,
          format: 'image/webp',
          allowJpegFallback: false,
        });
        onChange(compressedFile);
      } catch (err) {
        setLocalError(
          err instanceof Error
            ? err.message
            : 'خطا در فشرده‌سازی تصویر. لطفاً دوباره تلاش کنید.'
        );
        onChange(null);
      } finally {
        setIsCompressing(false);
      }
    },
    [onChange]
  );

  const handleRemove = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      setLocalError(null);
      onChange(null);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    disabled: disabled || isCompressing,
    noClick: !!value || isCompressing,
    noDrag: !!value || isCompressing,
  });

  const displayError = error || localError;

  return (
    <div className="space-y-3 rounded-kv-panel border border-kv-border bg-kv-surface-muted/60 p-4">
      {label !== false ? (
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-xs font-black text-kv-text">
            <FaIcon
              icon={faIcons.shield}
              size="xs"
              className="shrink-0 text-kv-brand-soft-fg"
            />
            {label}
            {disabled ? (
              <FaIcon
                icon={faIcons.lock}
                size="xs"
                className="text-kv-text-disabled"
              />
            ) : null}
          </span>
          <p className="text-xs font-medium text-kv-text-muted">
            بارگذاری مدرک اختیاری است و مانع ثبت اطلاعات هویتی نمی‌شود.
          </p>
        </div>
      ) : null}

      <div className="w-full shrink-0">
        {!value && !isCompressing ? (
          <div
            {...getRootProps()}
            className={cn(
              'group mx-auto flex min-h-32 w-full flex-col items-center justify-center gap-kv-pair rounded-kv-control border-2 border-dashed bg-kv-surface p-kv-group text-center transition-all',
              disabled
                ? 'cursor-not-allowed border-kv-border-disabled bg-kv-field-disabled text-kv-text-disabled'
                : isDragActive
                  ? 'cursor-pointer border-kv-brand bg-kv-brand-soft/50'
                  : 'cursor-pointer border-kv-border-strong hover:bg-kv-surface-muted',
              displayError && 'border-kv-danger'
            )}
          >
            <input {...getInputProps()} />
            <div
              className={cn(
                disabled ? 'text-kv-text-disabled' : 'text-kv-text-faint',
                isDragActive && !disabled && 'text-kv-brand-soft-fg'
              )}
            >
              <FaIcon icon={faIcons.cloudArrowUp} size="sm" />
            </div>
            <p className="text-xs font-black text-kv-text-secondary">
              {isDragActive ? 'فایل را اینجا رها کنید' : 'کلیک یا رها کردن مدرک'}
            </p>
            <span className={cn('text-xs font-bold', disabled ? 'text-kv-text-disabled' : 'text-kv-text-faint')}>
              {helperText}
            </span>
          </div>
        ) : null}

        {isCompressing ? (
          <div className="mx-auto flex min-h-32 w-full flex-col items-center justify-center gap-kv-pair rounded-kv-control border-2 border-dashed border-kv-border-strong bg-kv-surface p-kv-group">
            <FaIcon
              icon={faIcons.spinner}
              size="sm"
              spin
              className="text-kv-brand-soft-fg"
            />
            <p className="text-xs font-black text-kv-text-muted">
              در حال بهینه‌سازی و آماده‌سازی تصویر...
            </p>
          </div>
        ) : null}

        {value && !isCompressing ? (
          <div className="relative mx-auto flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-kv-control border-2 border-solid border-kv-border bg-kv-surface p-4 text-center transition-all">
            {previewUrl ? (
              <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-kv-control border border-kv-border bg-kv-surface p-1 shadow-kv-raised">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob preview URL */}
                <img
                  src={previewUrl}
                  alt="پیش‌نمایش مدرک ارسالی"
                  className="h-full w-full rounded object-contain"
                />
              </div>
            ) : null}
            <div className="max-w-full px-1 text-center">
              <p className="max-w-72 truncate text-xs font-black text-kv-text">
                {value.name}
              </p>
              <p className="text-xs font-bold text-kv-text-faint">
                {formatFileSize(value.size)}
              </p>
            </div>
            {!disabled ? (
              <KvButton
                type="button"
                onClick={handleRemove}
                color="error"
                appearance="ghost"
                size="sm"
                icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
              >
                حذف تصویر
              </KvButton>
            ) : null}
          </div>
        ) : null}
      </div>

      {displayError ? (
        <p role="alert" className="text-xs font-bold text-kv-danger">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}
