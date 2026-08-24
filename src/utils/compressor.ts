export interface CompressionOptions {
  maxWidth?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
  allowJpegFallback?: boolean;
}

const DEFAULT_MAX_WIDTH = 1000;
const DEFAULT_QUALITY = 0.7;
const DEFAULT_FORMAT = 'image/webp' as const;

type ImageCompressionFn = typeof import('browser-image-compression').default;
let imageCompressionPromise: Promise<ImageCompressionFn> | null = null;

function loadImageCompression(): Promise<ImageCompressionFn> {
  if (!imageCompressionPromise) {
    imageCompressionPromise = import(
      /* webpackChunkName: "image-compression" */ 'browser-image-compression'
    ).then((mod) => mod.default ?? mod);
  }
  return imageCompressionPromise;
}

function ensureBrowser(): void {
  if (typeof window === 'undefined') {
    throw new Error('فشرده‌سازی تصویر فقط در مرورگر امکان‌پذیر است.');
  }
}

function validateCompressionOptions(maxWidth: number, quality: number): void {
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    throw new Error('عرض نهایی تصویر باید یک عدد مثبت باشد.');
  }
  if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
    throw new Error('کیفیت تصویر باید عددی بین صفر و یک باشد.');
  }
}

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خواندن فایل تصویر با خطا مواجه شد.'));
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('محتوای فایل تصویر قابل خواندن نیست.'));
        return;
      }
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function compressWithLibrary(
  file: File,
  options: CompressionOptions & { allowJpegFallback?: boolean }
): Promise<File> {
  ensureBrowser();

  if (!file.type.startsWith('image/')) {
    throw new Error('لطفاً یک فایل تصویری معتبر انتخاب کنید.');
  }

  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const preferredFormat = options.format ?? DEFAULT_FORMAT;
  const allowJpegFallback = options.allowJpegFallback ?? true;
  validateCompressionOptions(maxWidth, quality);

  const imageCompression = await loadImageCompression();

  const run = (fileType: string) =>
    imageCompression(file, {
      maxWidthOrHeight: maxWidth,
      initialQuality: quality,
      fileType,
      // useWebWorker: true باعث میشه کتابخونه از cdn.jsdelivr.net script لود کنه
      // که توسط CSP بلاک میشه — main thread برای عکس پروفایل کافیه
      useWebWorker: false,
      preserveExif: false,
    });

  try {
    return await run(preferredFormat);
  } catch (error) {
    if (allowJpegFallback && preferredFormat === 'image/webp') {
      return run('image/jpeg');
    }
    throw error instanceof Error
      ? error
      : new Error('فشرده‌سازی تصویر با خطا مواجه شد.');
  }
}

export async function fileToDataUrl(file: Blob): Promise<string> {
  ensureBrowser();
  return readFileAsDataUrl(file);
}

export async function compressImageToBase64(file: File): Promise<string> {
  const compressed = await compressWithLibrary(file, {
    maxWidth: DEFAULT_MAX_WIDTH,
    quality: DEFAULT_QUALITY,
    format: DEFAULT_FORMAT,
    allowJpegFallback: false,
  });
  return readFileAsDataUrl(compressed);
}

/**
 * فشرده‌سازی تصویر سمت کلاینت قبل از آپلود Facade (عرض حداکثر ۱۰۰۰، WebP ~۰٫۷).
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const format = options.format ?? DEFAULT_FORMAT;
  const compressed = await compressWithLibrary(file, options);
  const extension = (compressed.type || format).split('/')[1] ?? 'webp';
  const originalName = file.name.replace(/\.[^/.]+$/, '');

  return new File([compressed], `${originalName}.${extension}`, {
    type: compressed.type || format,
    lastModified: Date.now(),
  });
}

export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { isValid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'فایل باید یک تصویر باشد (JPEG، PNG، یا WebP).',
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    const sizeLabel =
      maxSizeMB < 1
        ? `${Math.round(maxSizeMB * 1024)} کیلوبایت`
        : `${maxSizeMB} مگابایت`;
    return {
      isValid: false,
      error: `حجم فایل نباید بیشتر از ${sizeLabel} باشد.`,
    };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بایت';

  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(1)} ${units[i]}`;
}