'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import {
  kvDropzoneIconClass,
  kvDropzoneSurfaceClass,
} from '@/components/shared/fields/kvDropzoneSurface';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  compressImage,
  formatFileSize,
  validateImageFile,
} from '@/utils/compressor';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

const DEFAULT_MAX_SIZE_MB = 10;

export type KvImageDocUploaderProps = {
  id?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  label?: string | false;
  labelIcon?: ReactNode;
  description?: string;
  helperText?: string;
  disabled?: boolean;
  error?: string;
  optionalHint?: boolean;
  maxSizeMb?: number;
  previewAlt?: string;
  /** Override dropzone accept map (default JPEG + PNG). */
  accept?: Accept;
  invalidTypeMessage?: string;
  /**
   * When false, skip client compress (needed for SVG logos).
   * SVG files always skip compress even when true.
   */
  compress?: boolean;
  /**
   * When false, omit the muted panel chrome around the dropzone
   * (label can still be shown via KvFieldFrame).
   */
  framed?: boolean;
};
export function KvImageDocUploader({
  id: idProp,
  value,
  onChange,
  label = 'بارگذاری تصویر',
  labelIcon,
  description,
  helperText = 'PNG, JPG تا ۱۰ مگابایت',
  disabled = false,
  error,
  optionalHint = false,
  maxSizeMb = DEFAULT_MAX_SIZE_MB,
  previewAlt = 'پیش‌نمایش تصویر بارگذاری‌شده',
  accept = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
  },
  invalidTypeMessage = 'فقط فایل‌های تصویری (JPEG، PNG) مجاز هستند.',
  compress = true,
  framed = true,
}: KvImageDocUploaderProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
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
      if (disabled) return;
      setLocalError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          const sizeLabel =
            maxSizeMb < 1
              ? `${toPersianDigits(String(Math.round(maxSizeMb * 1024)))} کیلوبایت`
              : `${toPersianDigits(String(maxSizeMb))} مگابایت`;
          setLocalError(`حجم فایل نباید بیشتر از ${sizeLabel} باشد.`);
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setLocalError(invalidTypeMessage);
        } else {
          setLocalError('خطا در بارگذاری فایل. لطفاً دوباره تلاش کنید.');
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const isSvg =
        file.type === 'image/svg+xml' ||
        file.name.toLowerCase().endsWith('.svg');

      if (isSvg) {
        if (file.size > maxSizeMb * 1024 * 1024) {
          const sizeLabel =
            maxSizeMb < 1
              ? `${toPersianDigits(String(Math.round(maxSizeMb * 1024)))} کیلوبایت`
              : `${toPersianDigits(String(maxSizeMb))} مگابایت`;
          setLocalError(`حجم فایل نباید بیشتر از ${sizeLabel} باشد.`);
          return;
        }
        onChange(file);
        return;
      }

      const validation = validateImageFile(file, maxSizeMb);

      if (!validation.isValid) {
        setLocalError(validation.error || 'فایل نامعتبر است.');
        return;
      }

      if (!compress) {
        onChange(file);
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
    [compress, disabled, invalidTypeMessage, maxSizeMb, onChange]
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
    accept,
    maxSize: maxSizeMb * 1024 * 1024,
    maxFiles: 1,
    disabled: disabled || isCompressing,
    noClick: disabled || !!value || isCompressing,
    noDrag: disabled || !!value || isCompressing,
    noKeyboard: disabled || !!value || isCompressing,
  });

  const displayError = error || localError || undefined;
  const isLocked = disabled;
  const showOptionalHint = optionalHint || isLocked;

  const body = (
    <KvFieldFrame
      id={id}
      label={label}
      labelIcon={labelIcon}
      optionalHint={showOptionalHint}
      locked={isLocked}
      showLockIcon={false}
      error={displayError}
    >
      {description ? (
        <div className="mb-kv-inline">
          <KvTypography variant="body" as="p">
            {description}
          </KvTypography>
        </div>
      ) : null}

      <div className="w-full shrink-0">
        {!value && !isCompressing ? (
          <div
            {...getRootProps()}
            className={kvDropzoneSurfaceClass({
              disabled,
              isDragActive,
              error: Boolean(displayError),
            })}
          >
            <input {...getInputProps()} id={id} />
            <div className={kvDropzoneIconClass({ disabled, isDragActive })}>
              <FaIcon icon={faIcons.cloudArrowUp} size="sm" />
            </div>
            <KvTypography
              variant="subtitle"
              weight="black"
              tone={disabled ? 'disabled' : 'default'}
              as="p"
              align="center"
            >
              {isDragActive ? 'فایل را اینجا رها کنید' : 'کلیک یا رها کردن تصویر'}
            </KvTypography>
            <KvTypography
              variant="caption"
              as="span"
              tone={disabled ? 'disabled' : 'muted'}
              align="center"
            >
              {helperText}
            </KvTypography>
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
            <KvTypography
              variant="subtitle"
              weight="black"
              tone="muted"
              as="p"
              align="center"
            >
              در حال بهینه‌سازی و آماده‌سازی تصویر...
            </KvTypography>
          </div>
        ) : null}

        {value && !isCompressing ? (
          <div className="relative mx-auto flex min-h-48 w-full flex-col items-center justify-center gap-kv-inline rounded-kv-control border-2 border-solid border-kv-border bg-kv-surface p-kv-group text-center transition-all">
            {previewUrl ? (
              <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-kv-control border border-kv-border bg-kv-surface p-kv-micro shadow-kv-raised">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob:/object URL preview; next/image does not apply */}
                <img
                  src={previewUrl}
                  alt={previewAlt}
                  className="h-full w-full rounded object-contain"
                />
              </div>
            ) : null}
            <div className="max-w-full px-kv-micro text-center">
              <div className="mx-auto max-w-72">
                <KvTypography
                  variant="subtitle"
                  weight="black"
                  as="p"
                  truncate
                  align="center"
                >
                  {value.name}
                </KvTypography>
              </div>
              <KvTypography variant="caption" as="p" align="center">
                {formatFileSize(value.size)}
              </KvTypography>
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
    </KvFieldFrame>
  );

  if (!framed) {
    return <div className="space-y-kv-inline">{body}</div>;
  }

  return (
    <div className="space-y-kv-inline rounded-kv-panel border border-kv-border bg-kv-surface-muted/60 p-kv-group">
      {body}
    </div>
  );
}
