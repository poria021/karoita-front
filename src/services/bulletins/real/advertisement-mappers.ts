/**
 * تبدیل Nest Advertisement ↔ Bulletin فرانت.
 * `type=ads|info` همان `kind=advertisement|announcement` است؛ placement پیش‌فرض UI میز کار `sidebar` است.
 */
import {
  fromNestRoleName,
  isStaffAdminRole,
  toNestAdminAccountRole,
  toNestRoleName,
} from '@/services/auth/real/nest-auth-role';
import {
  resolveNestFileUrl,
  toSameOriginMediaUrl,
} from '@/services/files/resolve-nest-file-url';
import type { UserRole } from '@/types/auth';
import type {
  Bulletin,
  BulletinKind,
  UpsertBulletinInput,
} from '@/types/bulletins';
import type {
  NestAdvertisementDto,
  NestAdvertisementFormat,
  NestAdvertisementPlacement,
  NestAdvertisementType,
  NestCreateAdvertisementBody,
  NestPublicAdvertisementDto,
  NestUpdateAdvertisementBody,
} from '@/types/nest-advertisements';
import type { NestFileType } from '@/types/nest-users';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

/** جای نمایش باکس‌های میز کار تا وقتی UI انتخاب placement ندارد. */
export const DASHBOARD_AD_PLACEMENT: NestAdvertisementPlacement = 'sidebar';

export function kindToNestType(kind: BulletinKind): NestAdvertisementType {
  return kind === 'advertisement' ? 'ads' : 'info';
}

export function nestTypeToKind(type: NestAdvertisementType): BulletinKind {
  return type === 'ads' ? 'advertisement' : 'announcement';
}

/** ستاد روی Nest `admin`/`superadmin` است؛ بقیه نام‌های عادی نقش. */
export function toNestBulletinRole(role: UserRole): string {
  return isStaffAdminRole(role) ? toNestAdminAccountRole(role) : toNestRoleName(role);
}

function imageUrlFromNest(image: NestFileType | null | undefined): string | undefined {
  if (!image?.path) return undefined;
  const resolved = resolveNestFileUrl(image.path) ?? image.path;
  const url = toSameOriginMediaUrl(resolved);
  return url || undefined;
}

function mapRoles(names: readonly string[] | undefined): UserRole[] {
  if (!names?.length) return [];
  const out: UserRole[] = [];
  for (const name of names) {
    try {
      out.push(fromNestRoleName(name));
    } catch {
      // نقش ناشناس Nest را رد می‌کنیم تا UI نشکند.
    }
  }
  return out;
}

function authorFromNest(createdByRole: string | null | undefined): {
  authorRole: UserRole;
  authorName: string;
} {
  const authorRole = createdByRole
    ? fromNestRoleName(createdByRole)
    : ('super_admin' as UserRole);
  return {
    authorRole,
    authorName: getRoleStrategy(authorRole).label,
  };
}

export function mapPublicAdvertisement(
  dto: NestPublicAdvertisementDto,
  provinceTitles: string[] = []
): Bulletin {
  const { authorRole, authorName } = authorFromNest(dto.createdByRole);
  const stamp = new Date(0).toISOString();
  const imageUrl = imageUrlFromNest(dto.image);
  return {
    id: dto.id,
    kind: nestTypeToKind(dto.type),
    title: dto.title,
    body: dto.body,
    ...(dto.link ? { linkUrl: dto.link } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    format: dto.format,
    authorRole,
    authorName,
    audienceRoles: [],
    provinces: provinceTitles,
    isActive: true,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function mapAdminAdvertisement(
  dto: NestAdvertisementDto,
  provinceIdToTitle: Map<string, string>
): Bulletin {
  const { authorRole, authorName } = authorFromNest(dto.createdByRole);
  const provinces = (dto.targetProvinceIds ?? [])
    .map((id) => provinceIdToTitle.get(id) ?? id)
    .filter(Boolean);
  const imageUrl = imageUrlFromNest(dto.image);
  return {
    id: dto.id,
    kind: nestTypeToKind(dto.type),
    title: dto.title,
    body: dto.body,
    ...(dto.link ? { linkUrl: dto.link } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    format: dto.format,
    authorRole,
    authorName,
    audienceRoles: mapRoles(dto.targetRoles),
    provinces,
    isActive: dto.isActive !== false,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function resolveFormat(
  kind: BulletinKind,
  input: UpsertBulletinInput,
  existingFormat?: NestAdvertisementFormat
): NestAdvertisementFormat {
  if (kind === 'announcement') return 'text';
  if (existingFormat) return existingFormat;
  return input.imageFile || input.imageUrl ? 'image' : 'text';
}

function nestBodyText(input: UpsertBulletinInput): string {
  // Nest حتی برای تبلیغ تصویری `body` اجباری می‌خواهد؛ alt = متن یا عنوان.
  const body = input.body.trim();
  if (body) return body;
  return input.title.trim();
}

export async function resolveImageFileId(
  input: UpsertBulletinInput,
  upload: (file: File) => Promise<{ id: string }>
): Promise<string | undefined> {
  if (!input.imageFile) return undefined;
  const uploaded = await upload(input.imageFile);
  return uploaded.id;
}

export function toCreateBody(
  input: UpsertBulletinInput,
  opts: {
    provinceTitleToId: Map<string, string>;
    imageId?: string;
  }
): NestCreateAdvertisementBody {
  const type = kindToNestType(input.kind);
  const format = resolveFormat(input.kind, input);
  const roles = input.audienceRoles.map(toNestBulletinRole);
  const provinceIds = input.provinces
    .map((title) => opts.provinceTitleToId.get(title.trim()))
    .filter((id): id is string => Boolean(id));

  const body: NestCreateAdvertisementBody = {
    title: input.title.trim(),
    type,
    format,
    body: nestBodyText(input),
    placement: DASHBOARD_AD_PLACEMENT,
    targetRoles: roles,
    targetProvinceIds: provinceIds,
    isActive: true,
  };

  if (type === 'ads') {
    const link = input.linkUrl?.trim();
    if (link) body.link = link;
    if (format === 'image') {
      if (!opts.imageId) {
        throw new Error('برای تبلیغ تصویری ابتدا تصویر را انتخاب کنید.');
      }
      body.image = { id: opts.imageId };
    }
  }

  return body;
}

export function toUpdateBody(
  input: UpsertBulletinInput,
  opts: {
    provinceTitleToId: Map<string, string>;
    imageId?: string;
    existingFormat?: NestAdvertisementFormat;
  }
): NestUpdateAdvertisementBody {
  const type = kindToNestType(input.kind);
  const format = resolveFormat(input.kind, input, opts.existingFormat);
  const roles = input.audienceRoles.map(toNestBulletinRole);
  const provinceIds = input.provinces
    .map((title) => opts.provinceTitleToId.get(title.trim()))
    .filter((id): id is string => Boolean(id));

  if (
    type === 'ads' &&
    opts.existingFormat === 'text' &&
    (input.imageFile || (input.imageUrl && opts.imageId))
  ) {
    throw new Error(
      'این تبلیغ به‌صورت متنی ساخته شده و نمی‌توان تصویر به آن افزود. یک تبلیغ تصویری جدید بسازید.'
    );
  }

  const body: NestUpdateAdvertisementBody = {
    title: input.title.trim(),
    body: nestBodyText(input),
    placement: DASHBOARD_AD_PLACEMENT,
    targetRoles: roles,
    targetProvinceIds: provinceIds,
  };

  if (type === 'ads') {
    const link = input.linkUrl?.trim();
    body.link = link || null;
    if (opts.imageId) {
      body.image = { id: opts.imageId };
    } else if (format === 'image' && !input.imageUrl && !input.imageFile) {
      throw new Error('تبلیغ تصویری نمی‌تواند بدون تصویر بماند.');
    }
  } else {
    body.link = null;
    body.image = null;
  }

  return body;
}
