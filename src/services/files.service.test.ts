import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  absoluteObjectUrlFromSignedUrl,
  FilesService,
  nestUploadFileName,
  nestUploadMimeType,
} from '@/services/files.service';

const upload = vi.fn();
const uploadToSignedUrl = vi.fn();
const confirm = vi.fn();

vi.mock('@/services/require-nest-transport', () => ({
  requireNestTransport: vi.fn(),
}));

vi.mock('@/services/files/files.api', () => ({
  filesApi: {
    upload: (...args: unknown[]) => upload(...args),
    uploadToSignedUrl: (...args: unknown[]) => uploadToSignedUrl(...args),
    confirm: (...args: unknown[]) => confirm(...args),
  },
}));

describe('FilesService real two-step upload', () => {
  beforeEach(() => {
    upload.mockReset();
    uploadToSignedUrl.mockReset();
    confirm.mockReset();
  });

  it('keeps the original extension for Nest and strips query from the public path', () => {
    expect(nestUploadFileName('id-card.png')).toBe('id-card.png');
    expect(nestUploadFileName('blob')).toBe('blob.jpg');
    expect(nestUploadMimeType(new File(['x'], 'a.png', { type: 'image/png' }))).toBe(
      'image/png'
    );
    expect(nestUploadMimeType(new File(['x'], 'blob'), 'card.WEBP')).toBe(
      'image/webp'
    );
    expect(
      absoluteObjectUrlFromSignedUrl(
        'https://s3.example.com/bucket/abc.jpg?X-Amz-Signature=sig'
      )
    ).toBe('https://s3.example.com/bucket/abc.jpg');
    expect(absoluteObjectUrlFromSignedUrl('not-a-url')).toBeNull();
  });

  it('sends the original filename to Nest and uploads compressed bytes to the signed URL', async () => {
    upload.mockResolvedValue({
      file: { id: 'file-1', path: 'abc.jpg' },
      uploadSignedUrl: 'https://s3.example.com/abc.jpg?sig=1',
    });
    uploadToSignedUrl.mockResolvedValue(undefined);
    confirm.mockResolvedValue({ id: 'file-1', path: 'abc.jpg' });

    const compressed = new File(['tiny'], 'blob', { type: 'image/jpeg' });
    const original = new File(['full'], 'card.PNG', { type: 'image/png' });

    const result = await FilesService.uploadFile(
      compressed,
      'access-token',
      original
    );

    expect(upload).toHaveBeenCalledWith(
      {
        fileName: 'card.PNG',
        fileSize: compressed.size,
        mimeType: 'image/jpeg',
      },
      'access-token'
    );
    expect(uploadToSignedUrl).toHaveBeenCalledWith(
      'https://s3.example.com/abc.jpg?sig=1',
      compressed,
      'image/jpeg'
    );
    expect(confirm).toHaveBeenCalledWith('file-1', 'access-token');
    expect(result).toEqual({
      id: 'file-1',
      path: 'https://s3.example.com/abc.jpg',
    });
  });
});
