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

export async function realListBanners(): Promise<LandingBanner[]> {
  const items = await sliderBannersApi.listAll();
  return items.map(mapSliderBanner);
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

export async function realListProducts(): Promise<LandingProduct[]> {
  const items = await floatingProductsApi.listAll();
  return items.map(mapFloatingProduct);
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

export async function realListSocials(): Promise<LandingSocial[]> {
  const items = await socialNetworksApi.listAll();
  return items.map(mapSocialNetwork);
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

export async function realDeleteSocial(id: string): Promise<void> {
  await socialNetworksApi.remove(id);
}
