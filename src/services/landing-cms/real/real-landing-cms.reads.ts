/**
 * Server-only reads for landing CMS — uses nestServerGetAllPages which requires
 * next/headers (App Router Server Components only). Never import from client code.
 */
import 'server-only';

import { nestServerGetAllPages } from '@/lib/nest-server-fetch';
import type {
  LandingBanner,
  LandingProduct,
  LandingSocial,
} from '@/types/landing-cms';
import type { NestFileType } from '@/types/nest-users';

import type { NestFloatingProductDto } from './floating-products.api';
import type { NestSliderBannerDto } from './slider-banners.api';
import type { NestSocialNetworkDto } from './social-networks.api';

function toAbsoluteUrl(picture: NestFileType): string {
  const path = (picture.path ?? '').trim();
  if (!path) return '';
  if (/^https?:/i.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  return base ? `${base}/${path.replace(/^\//, '')}` : path;
}

function toIconImageUrl(picture: NestFileType | null): string {
  if (!picture) return '';
  return toAbsoluteUrl(picture);
}

function mapSliderBanner(dto: NestSliderBannerDto): LandingBanner {
  return {
    id: dto.id,
    title: dto.title,
    link: dto.link,
    imageUrl: toAbsoluteUrl(dto.picture),
  };
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

function mapSocialNetwork(dto: NestSocialNetworkDto): LandingSocial {
  return {
    id: dto.id,
    name: dto.name,
    link: dto.link,
    iconImageUrl: toIconImageUrl(dto.picture),
    icon: '',
  };
}

export async function realListBannersServer(): Promise<LandingBanner[]> {
  const items = await nestServerGetAllPages<NestSliderBannerDto>('admin/slider-banners');
  return items.map(mapSliderBanner);
}

export async function realListProductsServer(): Promise<LandingProduct[]> {
  const items = await nestServerGetAllPages<NestFloatingProductDto>('admin/floating-products');
  return items.map(mapFloatingProduct);
}

export async function realListSocialsServer(): Promise<LandingSocial[]> {
  const items = await nestServerGetAllPages<NestSocialNetworkDto>('admin/social-networks');
  return items.map(mapSocialNetwork);
}
