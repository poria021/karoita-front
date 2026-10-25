/**
 * تبلیغ (`ads`) و اطلاعیه (`info`) — هم‌ارز Swagger Advertisements / Admin advertisements.
 * نقش‌ها نام Nest هستند؛ تبدیل به نقش فرانت در `src/services/bulletins/real/` است.
 */
import { HttpError, noContent, ok } from '../http';
import type { Router } from '../router';
import {
  newId,
  nowIso,
  paginate,
  type Session,
  type Store,
  type StoredAdvertisement,
} from '../store';

import { fileDto } from './files';

const STAFF_ROLES = new Set(['superadmin', 'admin']);

function actorRole(store: Store, session: Session): string {
  if (session.surface === 'admin') {
    const admin = store.admins.get(session.accountId);
    return admin?.role ?? 'admin';
  }
  const user = store.users.get(session.accountId);
  return user?.roleName ?? 'student';
}

function statusOf(row: StoredAdvertisement): 'active' | 'inactive' | 'expired' {
  return row.isActive ? 'active' : 'inactive';
}

function imageDto(store: Store, imageId: string | null) {
  if (!imageId) return null;
  const file = store.files.get(imageId);
  return file ? fileDto(store, file) : null;
}

function toAdminDto(store: Store, row: StoredAdvertisement) {
  return {
    id: row.id,
    type: row.type,
    format: row.format,
    title: row.title,
    body: row.body,
    link: row.link,
    placement: row.placement,
    image: imageDto(store, row.imageId),
    targetRoles: row.targetRoles,
    targetProvinceIds: row.targetProvinceIds,
    targetUniversityIds: row.targetUniversityIds,
    targetUserIds: row.targetUserIds,
    isActive: row.isActive,
    status: statusOf(row),
    clickCount: row.clickCount,
    impressionCount: row.impressionCount,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    createdByRole: row.createdByRole,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toPublicDto(store: Store, row: StoredAdvertisement) {
  return {
    id: row.id,
    type: row.type,
    format: row.format,
    title: row.title,
    body: row.body,
    link: row.link,
    placement: row.placement,
    image: imageDto(store, row.imageId),
    createdByRole: row.createdByRole,
  };
}

function requireSession(context: { session: Session | null }): Session {
  if (!context.session) throw new HttpError(401, 'Unauthorized');
  return context.session;
}

function findRow(store: Store, id: string): StoredAdvertisement {
  const row = store.advertisements.find((item) => item.id === id);
  if (!row) throw new HttpError(404, 'Advertisement not found');
  return row;
}

function validateCreate(
  body: Record<string, unknown>,
  role: string
): Omit<
  StoredAdvertisement,
  'id' | 'createdAt' | 'updatedAt' | 'clickCount' | 'impressionCount' | 'startsAt' | 'endsAt' | 'createdByRole' | 'imageId'
> & { imageId: string | null } {
  const type = body.type;
  const format = body.format;
  const title = String(body.title ?? '').trim();
  const text = String(body.body ?? '').trim();
  const placement = body.placement;
  if (type !== 'ads' && type !== 'info') {
    throw new HttpError(422, 'Unprocessable Entity', { type: 'invalid' });
  }
  if (format !== 'text' && format !== 'image') {
    throw new HttpError(422, 'Unprocessable Entity', { format: 'invalid' });
  }
  if (placement !== 'hero' && placement !== 'sidebar') {
    throw new HttpError(422, 'Unprocessable Entity', { placement: 'invalid' });
  }
  if (!title) throw new HttpError(422, 'Unprocessable Entity', { title: 'required' });
  if (!text) throw new HttpError(422, 'Unprocessable Entity', { body: 'required' });
  if (type === 'ads' && !STAFF_ROLES.has(role)) {
    throw new HttpError(403, 'Only staff admins can publish advertisements');
  }
  if (type === 'info' && format !== 'text') {
    throw new HttpError(422, 'Unprocessable Entity', { format: 'infoMustBeText' });
  }
  if (type === 'info' && (body.link || body.image)) {
    throw new HttpError(422, 'Unprocessable Entity', { link: 'infoForbidsLinkImage' });
  }
  if (type === 'ads' && format === 'image' && !body.image) {
    throw new HttpError(422, 'Unprocessable Entity', { image: 'required' });
  }

  const targetRoles = Array.isArray(body.targetRoles)
    ? body.targetRoles.map(String)
    : [];
  if (type === 'info' && targetRoles.length === 0) {
    throw new HttpError(422, 'Unprocessable Entity', { targetRoles: 'required' });
  }

  return {
    type,
    format,
    title,
    body: text,
    link: type === 'ads' && typeof body.link === 'string' ? body.link : null,
    placement,
    imageId: null,
    targetRoles,
    targetProvinceIds: Array.isArray(body.targetProvinceIds)
      ? body.targetProvinceIds.map(String)
      : [],
    targetUniversityIds: Array.isArray(body.targetUniversityIds)
      ? body.targetUniversityIds.map(String)
      : [],
    targetUserIds: Array.isArray(body.targetUserIds)
      ? body.targetUserIds.map(String)
      : [],
    isActive: body.isActive !== false,
  };
}

export function registerAdvertisementRoutes(router: Router, store: Store): void {
  router.register('get', '/api/v1/advertisements', (context) => {
    requireSession(context);
    const type = context.query.get('type');
    const placement = context.query.get('placement');
    if (type !== 'ads' && type !== 'info') {
      throw new HttpError(422, 'Unprocessable Entity', { type: 'required' });
    }
    if (placement !== 'hero' && placement !== 'sidebar') {
      throw new HttpError(422, 'Unprocessable Entity', { placement: 'required' });
    }
    const rows = store.advertisements.filter(
      (row) =>
        row.isActive && row.type === type && row.placement === placement
    );
    for (const row of rows) row.impressionCount += 1;
    return ok(rows.map((row) => toPublicDto(store, row)));
  });

  router.register('post', '/api/v1/advertisements/{id}/clicks', (context) => {
    requireSession(context);
    const row = findRow(store, context.params.id!);
    row.clickCount += 1;
    return ok({ success: true });
  });

  router.register('get', '/api/admin/advertisements', (context) => {
    requireSession(context);
    let rows = [...store.advertisements];
    const type = context.query.get('type');
    if (type === 'ads' || type === 'info') {
      rows = rows.filter((row) => row.type === type);
    }
    const page = paginate(rows, context.query);
    return ok({
      data: page.data.map((row) => toAdminDto(store, row)),
      hasNextPage: page.hasNextPage,
    });
  });

  router.register('post', '/api/admin/advertisements', (context) => {
    const session = requireSession(context);
    const role = actorRole(store, session);
    const body = context.body as Record<string, unknown>;
    const base = validateCreate(body, role);
    let imageId: string | null = null;
    if (body.image && typeof body.image === 'object' && body.image !== null) {
      const id = String((body.image as { id?: string }).id ?? '');
      const file = store.files.get(id);
      if (!file || file.status !== 'confirmed') {
        throw new HttpError(422, 'Unprocessable Entity', { image: 'fileNotFound' });
      }
      imageId = id;
    }
    const now = nowIso();
    const row: StoredAdvertisement = {
      ...base,
      imageId,
      id: newId(),
      clickCount: 0,
      impressionCount: 0,
      startsAt: now,
      endsAt: null,
      createdByRole: role,
      createdAt: now,
      updatedAt: now,
    };
    store.advertisements.push(row);
    return ok(toAdminDto(store, row), 201);
  });

  router.register('get', '/api/admin/advertisements/{id}', (context) => {
    requireSession(context);
    return ok(toAdminDto(store, findRow(store, context.params.id!)));
  });

  router.register('patch', '/api/admin/advertisements/{id}', (context) => {
    requireSession(context);
    const row = findRow(store, context.params.id!);
    const body = context.body as Record<string, unknown>;
    if (typeof body.title === 'string') row.title = body.title.trim();
    if (typeof body.body === 'string') row.body = body.body.trim();
    if (body.link !== undefined) {
      row.link = typeof body.link === 'string' ? body.link : null;
    }
    if (body.placement === 'hero' || body.placement === 'sidebar') {
      row.placement = body.placement;
    }
    if (Array.isArray(body.targetRoles)) {
      row.targetRoles = body.targetRoles.map(String);
    }
    if (Array.isArray(body.targetProvinceIds)) {
      row.targetProvinceIds = body.targetProvinceIds.map(String);
    }
    if (Array.isArray(body.targetUniversityIds)) {
      row.targetUniversityIds = body.targetUniversityIds.map(String);
    }
    if (Array.isArray(body.targetUserIds)) {
      row.targetUserIds = body.targetUserIds.map(String);
    }
    if (typeof body.isActive === 'boolean') row.isActive = body.isActive;
    if (body.image && typeof body.image === 'object' && body.image !== null) {
      const id = String((body.image as { id?: string }).id ?? '');
      const file = store.files.get(id);
      if (!file || file.status !== 'confirmed') {
        throw new HttpError(422, 'Unprocessable Entity', { image: 'fileNotFound' });
      }
      row.imageId = id;
    }
    row.updatedAt = nowIso();
    return ok(toAdminDto(store, row));
  });

  router.register('delete', '/api/admin/advertisements/{id}', (context) => {
    requireSession(context);
    const row = findRow(store, context.params.id!);
    store.advertisements.splice(store.advertisements.indexOf(row), 1);
    return noContent();
  });

  router.register('patch', '/api/admin/advertisements/{id}/activation', (context) => {
    requireSession(context);
    const row = findRow(store, context.params.id!);
    const body = context.body as { isActive?: boolean };
    if (typeof body.isActive !== 'boolean') {
      throw new HttpError(422, 'Unprocessable Entity', { isActive: 'required' });
    }
    row.isActive = body.isActive;
    row.updatedAt = nowIso();
    return ok(toAdminDto(store, row));
  });

  // فهرست استان‌ها برای فرم مخاطب (قبلاً کنار bulletins بود).
  router.register('get', '/api/admin/province/all', (context) => {
    const title = context.query.get('title')?.trim();
    return ok(
      [...store.provinces.values()]
        .filter((row) => !title || row.title.includes(title))
        .map(({ id, title: rowTitle }) => ({ id, title: rowTitle }))
    );
  });
}
