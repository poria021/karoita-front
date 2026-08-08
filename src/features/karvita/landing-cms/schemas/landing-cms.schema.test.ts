import { describe, expect, it } from 'vitest';

import {
  LANDING_BANNER_MAX_SIZE_MB,
  LANDING_ICON_MAX_SIZE_MB,
} from '../constants';
import {
  bannerFormSchema,
  productFormSchema,
  socialFormSchema,
} from './landing-cms.schema';

function fakeImageFile(sizeBytes: number, name = 'shot.png') {
  const buffer = new ArrayBuffer(sizeBytes);
  return new File([buffer], name, { type: 'image/png' });
}

describe('landing-cms image size limits', () => {
  it('accepts banner under 2MB and rejects over', () => {
    const ok = bannerFormSchema.safeParse({
      title: 'بنر تست',
      link: '',
      image: fakeImageFile(LANDING_BANNER_MAX_SIZE_MB * 1024 * 1024),
    });
    expect(ok.success).toBe(true);

    const tooBig = bannerFormSchema.safeParse({
      title: 'بنر تست',
      link: '',
      image: fakeImageFile(LANDING_BANNER_MAX_SIZE_MB * 1024 * 1024 + 1),
    });
    expect(tooBig.success).toBe(false);
  });

  it('accepts product logo under 512KB and rejects over', () => {
    const ok = productFormSchema.safeParse({
      title: 'محصول تست',
      link: 'https://example.com',
      logoImage: fakeImageFile(LANDING_ICON_MAX_SIZE_MB * 1024 * 1024),
    });
    expect(ok.success).toBe(true);

    const tooBig = productFormSchema.safeParse({
      title: 'محصول تست',
      link: 'https://example.com',
      logoImage: fakeImageFile(LANDING_ICON_MAX_SIZE_MB * 1024 * 1024 + 1),
    });
    expect(tooBig.success).toBe(false);
  });

  it('rejects product logo that is not png or svg', () => {
    const jpeg = new File([new ArrayBuffer(100)], 'logo.jpg', {
      type: 'image/jpeg',
    });
    const parsed = productFormSchema.safeParse({
      title: 'محصول تست',
      link: 'https://example.com',
      logoImage: jpeg,
    });
    expect(parsed.success).toBe(false);
  });

  it('allows missing social icon and rejects oversized optional icon', () => {
    const withoutIcon = socialFormSchema.safeParse({
      name: 'روبیکا',
      link: 'https://example.com',
      iconImage: null,
    });
    expect(withoutIcon.success).toBe(true);

    const tooBig = socialFormSchema.safeParse({
      name: 'روبیکا',
      link: 'https://example.com',
      iconImage: fakeImageFile(LANDING_ICON_MAX_SIZE_MB * 1024 * 1024 + 1),
    });
    expect(tooBig.success).toBe(false);
  });
});
