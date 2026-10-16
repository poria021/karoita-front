/**
 * CMS لندینگ: بنر اسلایدر، محصول شناور، شبکهٔ اجتماعی. هر سه یک ساختار دارند
 * (لیست صفحه‌بندی‌شده، get، create، PATCH جزئی، DELETE) پس یک کارخانه می‌سازد.
 * GET در Swagger عمومی است (لندینگ SSR بدون توکن می‌خواند)؛ نوشتن‌ها توکن ادمین می‌خواهند.
 */
import { HttpError, noContent, ok, type RouteContext } from '../http';
import type { Router } from '../router';
import { newId, nowIso, paginate, type Store } from '../store';

import { fileDto } from './files';

type PictureRef = { id: string } | null | undefined;

type Row = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

type ResourceConfig<T extends Row> = {
  basePath: string;
  rows: Map<string, T>;
  toDto: (row: T) => Record<string, unknown>;
  /** ساخت ردیف از بدنهٔ اعتبارسنجی‌شده. */
  create: (body: Record<string, unknown>, picture: string | null) => Omit<T, keyof Row>;
  /** اعمال PATCH جزئی؛ فقط کلیدهای موجود در بدنه عوض می‌شوند. */
  patch: (row: T, body: Record<string, unknown>) => void;
  /** فقط شبکهٔ اجتماعی تصویر را می‌پذیرد خالی بماند. */
  pictureOptional: boolean;
};

function resolvePictureId(
  store: Store,
  picture: PictureRef,
  optional: boolean
): string | null {
  if (picture === null || picture === undefined) {
    if (optional) return null;
    throw new HttpError(422, 'Unprocessable Entity', { picture: 'pictureRequired' });
  }
  const file = store.files.get(picture.id);
  if (!file || file.status !== 'confirmed') {
    throw new HttpError(422, 'Unprocessable Entity', {
      picture: 'fileNotFoundOrNotConfirmed',
    });
  }
  return file.id;
}

function registerResource<T extends Row>(
  router: Router,
  store: Store,
  config: ResourceConfig<T>
): void {
  const { basePath, rows, toDto } = config;
  const idPath = `${basePath}/{id}`;

  const find = (context: RouteContext): T => {
    const row = rows.get(context.params.id!);
    if (!row) throw new HttpError(404, 'Not Found');
    return row;
  };

  router.register('get', basePath, (context) => {
    const page = paginate([...rows.values()], context.query);
    return ok({ data: page.data.map(toDto), hasNextPage: page.hasNextPage });
  });

  router.register('get', idPath, (context) => ok(toDto(find(context))));

  router.register('post', basePath, (context) => {
    const body = context.body as Record<string, unknown>;
    const pictureId = resolvePictureId(
      store,
      body.picture as PictureRef,
      config.pictureOptional
    );
    const now = nowIso();
    const row = {
      id: newId(),
      createdAt: now,
      updatedAt: now,
      ...config.create(body, pictureId),
    } as T;
    rows.set(row.id, row);
    return ok(toDto(row), 201);
  });

  router.register('patch', idPath, (context) => {
    const row = find(context);
    const body = context.body as Record<string, unknown>;
    if ('picture' in body) {
      const pictureId = resolvePictureId(
        store,
        body.picture as PictureRef,
        config.pictureOptional
      );
      (row as Record<string, unknown>).pictureId = pictureId;
    }
    config.patch(row, body);
    row.updatedAt = nowIso();
    return ok(toDto(row));
  });

  router.register('delete', idPath, (context) => {
    const row = find(context);
    rows.delete(row.id);
    return noContent();
  });
}

function pictureOf(store: Store, pictureId: string | null) {
  const file = pictureId ? store.files.get(pictureId) : undefined;
  return file ? fileDto(store, file) : null;
}

export function registerLandingRoutes(router: Router, store: Store): void {
  registerResource(router, store, {
    basePath: '/api/admin/slider-banners',
    rows: store.banners,
    pictureOptional: false,
    toDto: (row) => ({
      id: row.id,
      title: row.title,
      link: row.link,
      picture: pictureOf(store, row.pictureId),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }),
    create: (body, pictureId) => ({
      title: String(body.title),
      link: typeof body.link === 'string' ? body.link : null,
      pictureId: pictureId!,
    }),
    patch: (row, body) => {
      if (typeof body.title === 'string') row.title = body.title;
      if ('link' in body) row.link = typeof body.link === 'string' ? body.link : null;
    },
  });

  registerResource(router, store, {
    basePath: '/api/admin/floating-products',
    rows: store.products,
    pictureOptional: false,
    toDto: (row) => ({
      id: row.id,
      title: row.title,
      link: row.link,
      picture: pictureOf(store, row.pictureId),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }),
    create: (body, pictureId) => ({
      title: String(body.title),
      link: String(body.link),
      pictureId: pictureId!,
    }),
    patch: (row, body) => {
      if (typeof body.title === 'string') row.title = body.title;
      if (typeof body.link === 'string') row.link = body.link;
    },
  });

  registerResource(router, store, {
    basePath: '/api/admin/social-networks',
    rows: store.socials,
    pictureOptional: true,
    toDto: (row) => ({
      id: row.id,
      name: row.name,
      link: row.link,
      picture: pictureOf(store, row.pictureId),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }),
    create: (body, pictureId) => ({
      name: String(body.name),
      link: String(body.link),
      pictureId,
    }),
    patch: (row, body) => {
      if (typeof body.name === 'string') row.name = body.name;
      if (typeof body.link === 'string') row.link = body.link;
    },
  });
}
