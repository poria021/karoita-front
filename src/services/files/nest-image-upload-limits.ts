import type { Accept } from 'react-dropzone';

/**
 * محدودیت آپلود تصویر به Nest (`POST /v1/files/upload`).
 * OpenAPI فقط مثال `image/jpeg` دارد؛ در عمل JPEG/PNG قبول و WebP با
 * «این نوع فایل قابل بارگذاری نیست» رد می‌شود — پس خروجی فشرده باید JPEG باشد.
 */

export const NEST_IMAGE_UPLOAD_ACCEPT: Accept = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  // ورودی WebP مجاز است؛ قبل از آپلود به JPEG فشرده می‌شود.
  'image/webp': ['.webp'],
};

export const NEST_IMAGE_UPLOAD_INVALID_TYPE =
  'فقط فایل‌های تصویری (JPEG، PNG یا WebP) مجاز هستند.';

export function nestImageUploadHelperText(maxSizeMb: number): string {
  return `JPG، PNG یا WebP، حداکثر ${maxSizeMb} مگابایت`;
}
