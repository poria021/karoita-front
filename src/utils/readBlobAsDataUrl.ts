/**
 * `Blob`/`File` را برای پیش‌نمایش مدرک هویتی به data URL می‌خواند.
 * URLهای S3 اغلب خصوصی‌اند؛ پیش‌نمایش مالک نباید به GET عمومی وابسته باشد.
 */
export function readBlobAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string' && result.startsWith('data:')) {
        resolve(result);
        return;
      }
      reject(new Error('خواندن فایل ناموفق بود.'));
    };
    reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود.'));
    reader.readAsDataURL(file);
  });
}
