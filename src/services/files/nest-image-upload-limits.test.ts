import { describe, expect, it } from 'vitest';

import {
  NEST_IMAGE_UPLOAD_ACCEPT,
  NEST_IMAGE_UPLOAD_INVALID_TYPE,
  nestImageUploadHelperText,
} from './nest-image-upload-limits';

describe('nest-image-upload-limits', () => {
  it('accepts jpeg/png/webp for the picker while Nest upload stays jpeg/png-safe after compress', () => {
    expect(NEST_IMAGE_UPLOAD_ACCEPT).toEqual({
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    });
    expect(NEST_IMAGE_UPLOAD_INVALID_TYPE).toContain('WebP');
    expect(nestImageUploadHelperText(5)).toBe(
      'JPG، PNG یا WebP، حداکثر 5 مگابایت'
    );
  });
});
