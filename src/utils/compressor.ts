/** Lightweight browser-only Canvas image compressor. */
export interface CompressionOptions {
  maxWidth?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
}

const DEFAULT_MAX_WIDTH = 1000;
const DEFAULT_QUALITY = 0.7;
const DEFAULT_FORMAT = 'image/webp';

function ensureBrowserApis(): void {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    typeof FileReader === 'undefined' ||
    typeof Image === 'undefined'
  ) {
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

function readFileAsDataUrl(file: File): Promise<string> {
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

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error('فایل انتخاب‌شده تصویر معتبری نیست.'));
    image.onload = () => resolve(image);
    image.src = source;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: CompressionOptions['format'],
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('تبدیل تصویر به فرمت فشرده با خطا مواجه شد.'));
          return;
        }
        resolve(blob);
      },
      format,
      quality
    );
  });
}

async function compressToBlob(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  ensureBrowserApis();

  if (!file.type.startsWith('image/')) {
    throw new Error('لطفاً یک فایل تصویری معتبر انتخاب کنید.');
  }

  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const format = options.format ?? DEFAULT_FORMAT;
  validateCompressionOptions(maxWidth, quality);

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const scale = Math.min(1, maxWidth / image.naturalWidth);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('مرورگر امکان پردازش تصویر را فراهم نکرده است.');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, width, height);

  return canvasToBlob(canvas, format, quality);
}

/** Compresses to max-width 1000px WebP at 0.7 quality and returns a base64 data URL. */
export async function compressImageToBase64(file: File): Promise<string> {
  const blob = await compressToBlob(file, {
    maxWidth: DEFAULT_MAX_WIDTH,
    quality: DEFAULT_QUALITY,
    format: DEFAULT_FORMAT,
  });
  return readFileAsDataUrl(new File([blob], 'compressed.webp', { type: DEFAULT_FORMAT }));
}

/** Backward-compatible File output used by the existing identity uploader. */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const format = options.format ?? DEFAULT_FORMAT;
  const blob = await compressToBlob(file, options);
  const extension = format.split('/')[1];
  const originalName = file.name.replace(/\.[^/.]+$/, '');

  return new File([blob], `${originalName}.${extension}`, {
    type: format,
    lastModified: Date.now(),
  });
}

/**
 * Validates if a file is an image and meets size requirements.
 *
 * @param file - File to validate
 * @param maxSizeMB - Maximum allowed file size in megabytes
 * @returns Object with validation result and error message
 *
 * @example
 * ```typescript
 * const { isValid, error } = validateImageFile(file, 10);
 * if (!isValid) {
 *   console.error(error);
 * }
 * ```
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { isValid: boolean; error?: string } {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'فایل باید یک تصویر باشد (JPEG، PNG، یا WebP).',
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `حجم فایل نباید بیشتر از ${maxSizeMB} مگابایت باشد.`,
    };
  }

  return { isValid: true };
}

/**
 * Formats file size in bytes to human-readable string.
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 *
 * @example
 * ```typescript
 * formatFileSize(1536000); // "1.5 MB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بایت';

  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(1)} ${units[i]}`;
}
