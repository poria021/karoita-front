/**
 * DTOهای تبلیغ/اطلاعیه از OpenAPI لایو (`Advertisements` / `Admin advertisements`).
 * شکل فرانت در `types/bulletins.ts` می‌ماند؛ تبدیل فقط در `services/bulletins/real/`.
 */

import type { NestFileType } from '@/types/nest-users';

/** `ads` = تبلیغ میز کار؛ `info` = اطلاعیه. */
export type NestAdvertisementType = 'ads' | 'info';

export type NestAdvertisementFormat = 'text' | 'image';

export type NestAdvertisementPlacement = 'hero' | 'sidebar';

export type NestAdvertisementStatus = 'active' | 'inactive' | 'expired';

/** پاسخ عمومی داشبورد — `GET /api/v1/advertisements`. */
export type NestPublicAdvertisementDto = {
  id: string;
  type: NestAdvertisementType;
  format: NestAdvertisementFormat;
  title: string;
  body: string;
  link?: string | null;
  placement: NestAdvertisementPlacement;
  image?: NestFileType | null;
  createdByRole?: string | null;
};

/** ردیف ادمین — `GET/POST/PATCH /api/admin/advertisements`. */
export type NestAdvertisementDto = {
  id: string;
  type: NestAdvertisementType;
  format: NestAdvertisementFormat;
  title: string;
  body: string;
  link?: string | null;
  placement: NestAdvertisementPlacement;
  image?: NestFileType | null;
  targetRoles: string[];
  targetProvinceIds: string[];
  targetUniversityIds: string[];
  targetUserIds: string[];
  isActive: boolean;
  status?: NestAdvertisementStatus;
  clickCount?: number;
  impressionCount?: number;
  startsAt?: string;
  endsAt?: string | null;
  createdByUserId?: string | null;
  createdByAdminId?: string | null;
  createdByRole?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NestCreateAdvertisementBody = {
  title: string;
  type: NestAdvertisementType;
  format: NestAdvertisementFormat;
  body: string;
  placement: NestAdvertisementPlacement;
  link?: string | null;
  image?: { id: string } | null;
  targetRoles?: string[];
  targetProvinceIds?: string[];
  targetUniversityIds?: string[];
  targetUserIds?: string[];
  isActive?: boolean;
};

/** PATCH — `type` و `format` در Nest قفل‌اند و اینجا نمی‌آیند. */
export type NestUpdateAdvertisementBody = {
  title?: string;
  body?: string;
  link?: string | null;
  placement?: NestAdvertisementPlacement;
  image?: { id: string } | null;
  targetRoles?: string[];
  targetProvinceIds?: string[];
  targetUniversityIds?: string[];
  targetUserIds?: string[];
  isActive?: boolean;
};

export type NestToggleAdvertisementBody = {
  isActive: boolean;
};
