import { describe, expect, it } from 'vitest';

import { ApiClientError } from '@/services/api-error';
import {
  fileUploadUserMessage,
  parseNestFileUploadResponse,
} from '@/services/files/parse-nest-file-upload';

const SWAGGER_201 = {
  file: {
    id: 'file-1',
    path: 'users/a.webp',
    originalName: 'image.jpg',
    mimeType: 'image/webp',
    size: 138722,
    uploadedById: 'user-1',
    status: 'pending',
    confirmedAt: '2026-09-04T09:25:41.376Z',
  },
  uploadSignedUrl:
    'https://s3.example.com/bucket/users/a.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=sig',
};

describe('parseNestFileUploadResponse', () => {
  it('reads the Swagger 201 body', () => {
    expect(parseNestFileUploadResponse(SWAGGER_201)).toEqual({
      file: { id: 'file-1', path: 'users/a.webp' },
      uploadSignedUrl: SWAGGER_201.uploadSignedUrl,
    });
  });

  it('unwraps a data envelope and mongoose _id', () => {
    expect(
      parseNestFileUploadResponse({
        data: {
          file: { _id: 'mongo-id', path: 'k.jpg' },
          uploadSignedUrl: 'https://files.example.com/k.jpg?Signature=1',
        },
      })
    ).toEqual({
      file: { id: 'mongo-id', path: 'k.jpg' },
      uploadSignedUrl: 'https://files.example.com/k.jpg?Signature=1',
    });
  });

  it('rejects a body without a signed URL', () => {
    expect(() =>
      parseNestFileUploadResponse({ file: { id: 'file-1', path: 'a' } })
    ).toThrow(ApiClientError);
  });
});

describe('fileUploadUserMessage', () => {
  it('maps Failed to fetch to a Persian storage error', () => {
    expect(fileUploadUserMessage(new TypeError('Failed to fetch'))).toMatch(
      /فضای ذخیره‌سازی/
    );
  });
});
