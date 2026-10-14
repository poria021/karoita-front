/**
 * آپلود سه‌مرحله‌ای شبیه S3: `POST /v1/files/upload` (آدرس امضاشده) → `PUT /storage/:id`
 * (بایت‌ها؛ خارج از Swagger چون در واقعیت روی S3 است) → `PATCH /v1/files/:id/confirm`.
 */
import { HttpError, ok, type RouteContext } from '../http';
import type { Router } from '../router';
import { newId, type Store, type StoredFile } from '../store';

export function fileDto(store: Store, file: StoredFile) {
  return {
    id: file.id,
    path: storageUrl(store, file.id),
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    uploadedById: file.uploadedById,
    status: file.status,
    confirmedAt: file.confirmedAt,
  };
}

/**
 * نسخهٔ لوکالِ URL امضاشده. پارامتر امضا لازم است چون `/api/files/signed-put` و
 * `/api/files/media` فرانت فقط URLهای دارای امضای S3 را قبول می‌کنند.
 */
export function storageUrl(store: Store, fileId: string): string {
  return `${store.publicUrl}/storage/${fileId}?X-Amz-Signature=fake&X-Amz-Expires=3600`;
}

type UploadBody = { fileName: string; fileSize: number; mimeType: string };

export function registerFileRoutes(router: Router, store: Store): void {
  router.register('post', '/api/v1/files/upload', (context: RouteContext) => {
    const body = context.body as UploadBody;
    const file: StoredFile = {
      id: newId(),
      originalName: body.fileName,
      mimeType: body.mimeType,
      size: body.fileSize,
      uploadedById: context.session?.accountId ?? 'anonymous',
      status: 'pending',
      confirmedAt: null,
      bytes: null,
    };
    store.files.set(file.id, file);
    return ok(
      { file: fileDto(store, file), uploadSignedUrl: storageUrl(store, file.id) },
      201
    );
  });

  router.register('patch', '/api/v1/files/{id}/confirm', (context) => {
    const file = store.files.get(context.params.id!);
    if (!file) throw new HttpError(404, 'File not found');
    if (!file.bytes) {
      throw new HttpError(400, 'File has not been uploaded to storage yet.');
    }
    file.status = 'confirmed';
    file.confirmedAt = new Date().toISOString();
    return ok(fileDto(store, file));
  });
}
