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
import { KvBrowsableMediaLink } from '@/components/shared/KvBrowsableMediaLink';
import { KvButton } from '@/components/shared/KvButton';
import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import {
  KV_IMAGE_DOC_MEDIA_SURFACE_CLASS,
  kvDropzoneIconClass,
  kvDropzoneSurfaceClass,
} from '@/components/shared/fields/kvDropzoneSurface';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import {
  isBrowsableMediaUrl,
  resolveNestFileUrl,
  toSameOriginMediaUrl,
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
   * URL تصویر قبلاً آپلودشده. با `value=null` پیش‌نمایش از همین URL است.
   */
  existingUrl?: string | null;
  /** `originalFile` برای پسوند واقعی — فایل فشرده معمولاً webp است. */
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
  /** نقشهٔ accept دراپ‌زون؛ پیش‌فرض JPEG و PNG. */
  accept?: Accept;
  invalidTypeMessage?: string;
  /**
   * `false` یعنی بدون فشرده‌سازی کلاینت (لوگوی SVG).
   * SVG حتی با `true` هم فشرده نمی‌شود.
   */
  compress?: boolean;
  /** حداکثر عرض خروجی فشرده‌سازی (پیش‌فرض ۱۰۰۰px، برای تصاویر full-bleed مثل بنر هیرو باید بزرگ‌تر باشد). */
  compressMaxWidth?: number;
  /**
   * `false` کروم پنل دور دراپ‌زون را برمی‌دارد؛ لیبل از `KvFieldFrame` می‌ماند.
   */
  framed?: boolean;
  /** پر شدن سطح پیش‌نمایش با تصویر موجود/جدید. */
  previewFit?: 'contain' | 'cover';
};

function KvImageDocPreviewSurface({
  previewUrl,
  canOpenPreview,
  previewAlt,
  previewImageClass,
  disabled,
  onRemove,
}: {
  previewUrl: string | null;
  canOpenPreview: boolean;
  previewAlt: string;
  previewImageClass: string;
  disabled: boolean;
  onRemove: (event: MouseEvent) => void;
}) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const [previewDimmed, setPreviewDimmed] = useState(false);

  if (previewFailed) {
    return (
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
    );
  }

  if (!previewUrl) return null;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[inherit]"
      onMouseEnter={() => setPreviewDimmed(true)}
      onMouseLeave={() => setPreviewDimmed(false)}
      onClick={() => setPreviewDimmed(false)}
    >
      {canOpenPreview ? (
        <KvBrowsableMediaLink
          href={previewUrl}
          alt={previewAlt}
          className="flex h-full w-full items-center justify-center focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
          aria-label="نمایش تصویر"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- blob:/object URL preview; next/image does not apply */}
          <img
            src={previewUrl}
            alt={previewAlt}
            referrerPolicy="no-referrer"
            onError={() => setPreviewFailed(true)}
            className={previewImageClass}
          />
        </KvBrowsableMediaLink>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob:/object URL preview; next/image does not apply */}
          <img
            src={previewUrl}
            alt={previewAlt}
            referrerPolicy="no-referrer"
            onError={() => setPreviewFailed(true)}
            className={previewImageClass}
          />
        </div>
      )}
      {/* کلیک لایه را برمی‌گرداند — :hover بعد از تب جدید گیر می‌کند */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 z-[1] rounded-[inherit] bg-white/80 transition-opacity duration-300 ease-out dark:bg-black/80',
          previewDimmed ? 'opacity-0' : 'opacity-100'
        )}
      />
      {!disabled ? (
        <KvButton
          type="button"
          onClick={onRemove}
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
  );
}

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
  compressMaxWidth = 1000,
  framed = true,
  previewFit = 'contain',
}: KvImageDocUploaderProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [isCompressing, setIsCompressing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  /** URL والد که کاربر حذف کرده؛ با عوض شدن `existingUrl` دوباره نمایش داده می‌شود. */
  const [dismissedExistingUrl, setDismissedExistingUrl] = useState<
    string | null
  >(null);

  const blobUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value]
  );
  const resolvedExistingUrl = useMemo(() => {
    if (!existingUrl || existingUrl === dismissedExistingUrl) return null;
    const resolved = resolveNestFileUrl(existingUrl) ?? existingUrl;
    return resolved ? toSameOriginMediaUrl(resolved) : null;
  }, [dismissedExistingUrl, existingUrl]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const previewUrl = blobUrl ?? resolvedExistingUrl ?? null;
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
          maxWidth: compressMaxWidth,
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
    [compress, compressMaxWidth, disabled, invalidTypeMessage, maxSizeMb, onChange]
  );

  const handleRemove = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setLocalError(null);
      setDismissedExistingUrl(existingUrl ?? null);
      onChange(null, null);
    },
    [existingUrl, onChange]
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

  const previewImageClass = cn(
    'h-full w-full',
    previewFit === 'cover'
      ? 'absolute inset-0 object-cover'
      : 'object-contain'
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
        {/* `label[for]` زنده بماند حتی وقتی پیش‌نمایش یا فشرده‌سازی روی دراپ‌زون است */}
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
              KV_IMAGE_DOC_MEDIA_SURFACE_CLASS,
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
              KV_IMAGE_DOC_MEDIA_SURFACE_CLASS,
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
          <div className={cn(KV_IMAGE_DOC_MEDIA_SURFACE_CLASS, 'border border-kv-border bg-kv-surface-muted')}>
            <KvImageDocPreviewSurface
              // تعویض blob/existing باید failed را صفر کند — remount با key معادل reset در useEffect است.
              key={`${blobUrl ?? ''}|${resolvedExistingUrl ?? ''}`}
              previewUrl={previewUrl}
              canOpenPreview={canOpenPreview}
              previewAlt={previewAlt}
              previewImageClass={previewImageClass}
              disabled={disabled}
              onRemove={handleRemove}
            />
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
