/**
 * Read a Blob/File as a data URL for in-app identity-doc preview.
 * Remote S3 object URLs are often private; the owner’s own preview
 * should not depend on a public GET.
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
