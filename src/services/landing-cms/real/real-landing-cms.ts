import { FilesService } from '@/services/files.service';
import { floatingProductsApi, type NestFloatingProductDto } from '@/services/landing-cms/real/floating-products.api';
import type {
  CreateLandingProductInput,
  LandingProduct,
} from '@/types/landing-cms';
import type { NestFileType } from '@/types/nest-users';

function toLogoImageUrl(picture: NestFileType): string {
  const path = (picture.path ?? '').trim();
  if (!path) return '';
  if (/^https?:/i.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  return base ? `${base}/${path.replace(/^\//, '')}` : path;
}

function mapFloatingProduct(dto: NestFloatingProductDto): LandingProduct {
  return {
    id: dto.id,
    title: dto.title,
    link: dto.link,
    logoImageUrl: toLogoImageUrl(dto.picture),
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
