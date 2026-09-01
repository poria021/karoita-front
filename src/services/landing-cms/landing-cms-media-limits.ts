/** سقف حجم رسانهٔ CMS لندینگ (Facade + فرم فیچر). */

export const LANDING_BANNER_MAX_SIZE_MB = 2;
export const LANDING_ICON_MAX_SIZE_MB = 0.5;

export function isPngOrSvgFile(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (mime === 'image/png' || mime === 'image/svg+xml') return true;
  const name = file.name.toLowerCase();
  return name.endsWith('.png') || name.endsWith('.svg');
}

export function isSvgFile(file: File): boolean {
  return (
    file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
  );
}

export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error('خواندن فایل تصویر با خطا مواجه شد.'));
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
