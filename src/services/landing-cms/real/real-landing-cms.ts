import { FilesService } from '@/services/files.service';
import { floatingProductsApi, type NestFloatingProductDto } from '@/services/landing-cms/real/floating-products.api';
import { sliderBannersApi, type NestSliderBannerDto } from '@/services/landing-cms/real/slider-banners.api';
import { socialNetworksApi, type NestSocialNetworkDto } from '@/services/landing-cms/real/social-networks.api';
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
import type { NestFileType } from '@/types/nest-users';

function toAbsoluteUrl(picture: NestFileType): string {
  const path = (picture.path ?? '').trim();
  if (!path) return '';
  if (/^https?:/i.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  return base ? `${base}/${path.replace(/^\//, '')}` : path;
}

function mapSliderBanner(dto: NestSliderBannerDto): LandingBanner {
  return {
    id: dto.id,
    title: dto.title,
    link: dto.link,
    imageUrl: toAbsoluteUrl(dto.picture),
  };
}

export async function realCreateBanner(
  input: CreateLandingBannerInput
): Promise<LandingBanner> {
  const fileRef = await FilesService.uploadFile(input.image);
  const dto = await sliderBannersApi.create({
    picture: { id: fileRef.id },
    title: input.title,
    link: input.link ?? '',
  });
  return mapSliderBanner(dto);
}

export async function realListBanners(): Promise<LandingBanner[]> {
  const dtos = await sliderBannersApi.listAll();
  return dtos.map(mapSliderBanner);
}

/** PATCH جزئی؛ تصویر فقط اگر عوض شده باشد آپلود می‌شود. */
export async function realUpdateBanner(
  input: UpdateLandingBannerInput
): Promise<LandingBanner> {
  const picture = input.image
    ? { id: (await FilesService.uploadFile(input.image)).id }
    : undefined;
  const dto = await sliderBannersApi.update(input.id, {
    ...(picture ? { picture } : {}),
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.link !== undefined ? { link: input.link.trim() } : {}),
  });
  return mapSliderBanner(dto);
}

export async function realDeleteBanner(id: string): Promise<void> {
  await sliderBannersApi.remove(id);
}


function mapFloatingProduct(dto: NestFloatingProductDto): LandingProduct {
  return {
    id: dto.id,
    title: dto.title,
    link: dto.link,
    logoImageUrl: toAbsoluteUrl(dto.picture),
    icon: '',
  };
}

export async function realCreateProduct(
  input: CreateLandingProductInput
): Promise<LandingProduct> {
  const fileRef = await FilesService.uploadFile(input.logoImage);
  const dto = await floatingProductsApi.create({
    picture: { id: fileRef.id },
    title: input.title,
    link: input.link,
  });
  return mapFloatingProduct(dto);
}

export async function realListProducts(): Promise<LandingProduct[]> {
  const dtos = await floatingProductsApi.listAll();
  return dtos.map(mapFloatingProduct);
}

export async function realUpdateProduct(
  input: UpdateLandingProductInput
): Promise<LandingProduct> {
  const picture = input.logoImage
    ? { id: (await FilesService.uploadFile(input.logoImage)).id }
    : undefined;
  const dto = await floatingProductsApi.update(input.id, {
    ...(picture ? { picture } : {}),
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.link !== undefined ? { link: input.link.trim() } : {}),
  });
  return mapFloatingProduct(dto);
}

export async function realDeleteProduct(id: string): Promise<void> {
  await floatingProductsApi.remove(id);
}

function toIconImageUrl(picture: NestFileType | null): string {
  if (!picture) return '';
  return toAbsoluteUrl(picture);
}

function mapSocialNetwork(dto: NestSocialNetworkDto): LandingSocial {
  return {
    id: dto.id,
    name: dto.name,
    link: dto.link,
    iconImageUrl: toIconImageUrl(dto.picture),
    icon: '',
  };
}

export async function realCreateSocial(
  input: CreateLandingSocialInput
): Promise<LandingSocial> {
  let pictureBody: { id: string } | undefined;
  if (input.iconImage) {
    const fileRef = await FilesService.uploadFile(input.iconImage);
    pictureBody = { id: fileRef.id };
  }
  const dto = await socialNetworksApi.create({
    ...(pictureBody ? { picture: pictureBody } : {}),
    name: input.name,
    link: input.link,
  });
  return mapSocialNetwork(dto);
}

export async function realListSocials(): Promise<LandingSocial[]> {
  const dtos = await socialNetworksApi.listAll();
  return dtos.map(mapSocialNetwork);
}

/** `iconImage: null` آیکون را حذف می‌کند (`picture: null`)؛ `undefined` یعنی دست نخورد. */
export async function realUpdateSocial(
  input: UpdateLandingSocialInput
): Promise<LandingSocial> {
  let picture: { id: string } | null | undefined;
  if (input.iconImage === null) picture = null;
  else if (input.iconImage) {
    picture = { id: (await FilesService.uploadFile(input.iconImage)).id };
  }
  const dto = await socialNetworksApi.update(input.id, {
    ...(picture !== undefined ? { picture } : {}),
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.link !== undefined ? { link: input.link.trim() } : {}),
  });
  return mapSocialNetwork(dto);
}

export async function realDeleteSocial(id: string): Promise<void> {
  await socialNetworksApi.remove(id);
}
