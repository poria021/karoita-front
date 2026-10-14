import {
  nextLandingEntityId,
  readLandingCmsSnapshot,
  writeLandingCmsSnapshot,
} from '@/services/landing-cms/mock/mock-landing-cms.store';
import {
  isPngOrSvgFile,
  isSvgFile,
  LANDING_ICON_MAX_SIZE_MB,
  readFileAsDataUrl,
} from '@/services/landing-cms/landing-cms-media-limits';
import type {
  CreateLandingBannerInput,
  CreateLandingProductInput,
  CreateLandingSocialInput,
  LandingBanner,
  LandingProduct,
  LandingSocial,
  UpdateLandingBannerInput,
  UpdateLandingProductInput,
  UpdateLandingSocialInput,
} from '@/types/landing-cms';
import {
  compressImageToBase64,
  validateImageFile,
} from '@/utils/compressor';

const DEFAULT_SOCIAL_ICON = 'fa-link';
const DEFAULT_PRODUCT_ICON = 'fa-briefcase';

async function encodeImageFile(file: File): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error ?? 'فایل تصویر نامعتبر است.');
  }
  return compressImageToBase64(file);
}

async function encodeProductLogo(file: File): Promise<string> {
  if (!isPngOrSvgFile(file)) {
    throw new Error('فقط فایل‌های SVG یا PNG مجاز هستند.');
  }
  const maxBytes = LANDING_ICON_MAX_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('حجم فایل نباید بیشتر از ۵۱۲ کیلوبایت باشد.');
  }
  if (isSvgFile(file)) {
    return readFileAsDataUrl(file);
  }
  const validation = validateImageFile(file, LANDING_ICON_MAX_SIZE_MB);
  if (!validation.isValid) {
    throw new Error(validation.error ?? 'فایل تصویر نامعتبر است.');
  }
  return compressImageToBase64(file);
}

export async function mockCreateBanner(
  input: CreateLandingBannerInput
): Promise<LandingBanner> {
  const title = input.title.trim();
  if (!title) {
    throw new Error('وارد کردن عنوان بنر الزامی است.');
  }
  if (!input.image) {
    throw new Error('آپلود تصویر بنر الزامی است.');
  }

  const imageUrl = await encodeImageFile(input.image);
  const banner: LandingBanner = {
    id: nextLandingEntityId('bnr'),
    title,
    imageUrl,
    link: (input.link ?? '').trim(),
  };

  const snapshot = readLandingCmsSnapshot();
  writeLandingCmsSnapshot({
    ...snapshot,
    banners: [...snapshot.banners, banner],
  });
  return banner;
}

function requireText(value: string | undefined, message: string): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (!trimmed) throw new Error(message);
  return trimmed;
}

export async function mockUpdateBanner(
  input: UpdateLandingBannerInput
): Promise<LandingBanner> {
  const snapshot = readLandingCmsSnapshot();
  const current = snapshot.banners.find((row) => row.id === input.id);
  if (!current) throw new Error('بنر موردنظر یافت نشد.');
  const title = requireText(input.title, 'وارد کردن عنوان بنر الزامی است.');
  const next: LandingBanner = {
    ...current,
    ...(title !== undefined ? { title } : {}),
    ...(input.link !== undefined ? { link: input.link.trim() } : {}),
    ...(input.image ? { imageUrl: await encodeImageFile(input.image) } : {}),
  };
  writeLandingCmsSnapshot({
    ...snapshot,
    banners: snapshot.banners.map((row) => (row.id === input.id ? next : row)),
  });
  return next;
}

export function mockDeleteBanner(id: string): void {
  const snapshot = readLandingCmsSnapshot();
  writeLandingCmsSnapshot({
    ...snapshot,
    banners: snapshot.banners.filter((row) => row.id !== id),
  });
}

export async function mockCreateSocial(
  input: CreateLandingSocialInput
): Promise<LandingSocial> {
  const name = input.name.trim();
  const link = input.link.trim();
  if (!name) {
    throw new Error('وارد کردن نام شبکه اجتماعی الزامی است.');
  }
  if (!link) {
    throw new Error('وارد کردن لینک شبکه اجتماعی الزامی است.');
  }

  let iconImageUrl = '';
  if (input.iconImage) {
    iconImageUrl = await encodeImageFile(input.iconImage);
  }

  const social: LandingSocial = {
    id: nextLandingEntityId('soc'),
    name,
    link,
    iconImageUrl,
    icon: (input.icon ?? DEFAULT_SOCIAL_ICON).trim() || DEFAULT_SOCIAL_ICON,
  };

  const snapshot = readLandingCmsSnapshot();
  writeLandingCmsSnapshot({
    ...snapshot,
    socials: [...snapshot.socials, social],
  });
  return social;
}

export async function mockUpdateSocial(
  input: UpdateLandingSocialInput
): Promise<LandingSocial> {
  const snapshot = readLandingCmsSnapshot();
  const current = snapshot.socials.find((row) => row.id === input.id);
  if (!current) throw new Error('شبکه اجتماعی موردنظر یافت نشد.');
  const name = requireText(input.name, 'وارد کردن نام شبکه اجتماعی الزامی است.');
  const link = requireText(input.link, 'وارد کردن لینک شبکه اجتماعی الزامی است.');
  let iconImageUrl = current.iconImageUrl;
  if (input.iconImage === null) iconImageUrl = '';
  else if (input.iconImage) iconImageUrl = await encodeImageFile(input.iconImage);
  const next: LandingSocial = {
    ...current,
    ...(name !== undefined ? { name } : {}),
    ...(link !== undefined ? { link } : {}),
    iconImageUrl,
  };
  writeLandingCmsSnapshot({
    ...snapshot,
    socials: snapshot.socials.map((row) => (row.id === input.id ? next : row)),
  });
  return next;
}

export function mockDeleteSocial(id: string): void {
  const snapshot = readLandingCmsSnapshot();
  writeLandingCmsSnapshot({
    ...snapshot,
    socials: snapshot.socials.filter((row) => row.id !== id),
  });
}

export async function mockCreateProduct(
  input: CreateLandingProductInput
): Promise<LandingProduct> {
  const title = input.title.trim();
  const link = input.link.trim();
  if (!title) {
    throw new Error('وارد کردن عنوان محصول الزامی است.');
  }
  if (!link) {
    throw new Error('وارد کردن لینک محصول الزامی است.');
  }
  if (!input.logoImage) {
    throw new Error('آپلود لوگوی محصول الزامی است.');
  }

  const logoImageUrl = await encodeProductLogo(input.logoImage);
  const product: LandingProduct = {
    id: nextLandingEntityId('prd'),
    title,
    link,
    logoImageUrl,
    icon: (input.icon ?? DEFAULT_PRODUCT_ICON).trim() || DEFAULT_PRODUCT_ICON,
  };

  const snapshot = readLandingCmsSnapshot();
  writeLandingCmsSnapshot({
    ...snapshot,
    products: [...snapshot.products, product],
  });
  return product;
}

export async function mockUpdateProduct(
  input: UpdateLandingProductInput
): Promise<LandingProduct> {
  const snapshot = readLandingCmsSnapshot();
  const current = snapshot.products.find((row) => row.id === input.id);
  if (!current) throw new Error('محصول موردنظر یافت نشد.');
  const title = requireText(input.title, 'وارد کردن عنوان محصول الزامی است.');
  const link = requireText(input.link, 'وارد کردن لینک محصول الزامی است.');
  const next: LandingProduct = {
    ...current,
    ...(title !== undefined ? { title } : {}),
    ...(link !== undefined ? { link } : {}),
    ...(input.logoImage
      ? { logoImageUrl: await encodeProductLogo(input.logoImage) }
      : {}),
  };
  writeLandingCmsSnapshot({
    ...snapshot,
    products: snapshot.products.map((row) => (row.id === input.id ? next : row)),
  });
  return next;
}

export function mockDeleteProduct(id: string): void {
  const snapshot = readLandingCmsSnapshot();
  writeLandingCmsSnapshot({
    ...snapshot,
    products: snapshot.products.filter((row) => row.id !== id),
  });
}
