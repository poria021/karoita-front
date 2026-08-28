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
  KV_IMAGE_DOC_SURFACE_HEIGHT_CLASS,
  kvDropzoneIconClass,
  kvDropzoneSurfaceClass,
} from '@/components/shared/fields/kvDropzoneSurface';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import {
  isBrowsableMediaUrl,
  resolveNestFileUrl,
} from '@/services/files/resolve-nest-file-url';
import {
  compressImage,
  validateImageFile,
} from '@/utils/compressor';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

const DEFAULT_MAX_SIZE_MB = 10;

export type KvImageDocUploaderProps = {
  id?: string;
  value?: File | null;
  /**
   * URL تصویر قبلاً آپلودشده (مثلاً docUrl از user store).
   * وقتی value=null ولی existingUrl وجود داشته باشد، preview از URL نمایش داده می‌شود.
   */
  existingUrl?: string | null;
  /** originalFile: راهنمای شناسایی extension واقعی — چون فایل فشرده‌شده معمولاً webp است. */
  onChange: (file: File | null, originalFile?: File | null) => void;
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
  existingUrl,
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

  const blobUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value]
  );
  const resolvedExistingUrl = useMemo(
    () => resolveNestFileUrl(existingUrl) ?? existingUrl ?? null,
    [existingUrl]
  );
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  useEffect(() => {
    setPreviewFailed(false);
  }, [blobUrl, resolvedExistingUrl]);

  // اگه فایل جدید انتخاب شده blob URL رو نشون بده، وگرنه از existingUrl استفاده کن
  const previewUrl = blobUrl ?? resolvedExistingUrl ?? null;
  // آیا preview از URL قبلی (نه فایل جدید) است
  const isExistingPreview = !value && !!resolvedExistingUrl;
  const canOpenPreview =
    Boolean(previewUrl) && isBrowsableMediaUrl(previewUrl ?? '');

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
        onChange(file, file);
        return;
      }

      const validation = validateImageFile(file, maxSizeMb);

      if (!validation.isValid) {
        setLocalError(validation.error || 'فایل نامعتبر است.');
        return;
      }

      if (!compress) {
        onChange(file, file);
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
        onChange(compressedFile, file);
      } catch (err) {
        setLocalError(
          err instanceof Error
            ? err.message
            : 'خطا در فشرده‌سازی تصویر. لطفاً دوباره تلاش کنید.'
        );
        onChange(null, null);
      } finally {
        setIsCompressing(false);
      }
    },
    [compress, disabled, invalidTypeMessage, maxSizeMb, onChange]
  );

  const handleRemove = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setLocalError(null);
      onChange(null, null);
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

  const mediaSurfaceClass = cn(
    KV_IMAGE_DOC_SURFACE_HEIGHT_CLASS,
    'relative w-full overflow-hidden rounded-kv-control'
  );

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
        {/* hidden input: label[for] رو live نگه می‌داره حتی وقتی preview یا compressing نمایش داده میشه */}
        {(value || isCompressing) ? (
          <input {...getInputProps()} id={id} hidden aria-hidden="true" />
        ) : null}

        {!value && !isExistingPreview && !isCompressing ? (
          <div
            {...getRootProps()}
            className={cn(
              kvDropzoneSurfaceClass({
                disabled,
                isDragActive,
                error: Boolean(displayError),
              }),
              mediaSurfaceClass,
              'min-h-0'
            )}
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
          <div
            className={cn(
              mediaSurfaceClass,
              'flex flex-col items-center justify-center gap-kv-pair border-2 border-dashed border-kv-border-strong bg-kv-surface p-kv-group text-center'
            )}
          >
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
              در حال بهینه‌سازی تصویر...
            </KvTypography>
          </div>
        ) : null}

        {(value || isExistingPreview) && !isCompressing ? (
          <div className={cn(mediaSurfaceClass, 'border border-kv-border bg-kv-surface-muted')}>
            {previewFailed ? (
              <div className="flex h-full flex-col items-center justify-center gap-kv-pair px-kv-group text-center">
                <FaIcon
                  icon={faIcons.triangleExclamation}
                  size="sm"
                  className="text-kv-text-faint"
                />
                <KvTypography variant="caption" tone="muted" as="p">
                  تصویر مدرک بارگذاری نشد
                </KvTypography>
              </div>
            ) : previewUrl ? (
              <div className="relative h-full w-full">
                {canOpenPreview ? (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full w-full items-center justify-center focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
                    aria-label="باز کردن مدرک در تب جدید"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob:/object URL preview; next/image does not apply */}
                    <img
                      src={previewUrl}
                      alt={previewAlt}
                      referrerPolicy="no-referrer"
                      onError={() => setPreviewFailed(true)}
                      className="h-full w-full object-contain"
                    />
                  </a>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob:/object URL preview; next/image does not apply */}
                    <img
                      src={previewUrl}
                      alt={previewAlt}
                      referrerPolicy="no-referrer"
                      onError={() => setPreviewFailed(true)}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                {!disabled ? (
                  <KvButton
                    type="button"
                    onClick={handleRemove}
                    color="error"
                    appearance="ghost"
                    size="sm"
                    className="absolute start-2 top-2 z-10"
                    icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
                  >
                    حذف
                  </KvButton>
                ) : null}
              </div>
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
