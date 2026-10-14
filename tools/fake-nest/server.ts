/**
 * سرور جعلی Nest — به‌جای mock داخل برنامه، همان قرارداد HTTP بک‌اند را در یک
 * فرایند جدا شبیه‌سازی می‌کند. برنامه در حالت real و فقط با عوض شدن آدرس
 * (`BACKEND_INTERNAL_URL` / `NEXT_PUBLIC_API_URL`) به آن وصل می‌شود، پس مسیر کد
 * (پروکسی `/api/nest`، refresh روی سرور، SSR) دقیقاً همان تولید است.
 *
 * دقت: هر مسیر باید در `openapi.snapshot.json` باشد، بدنهٔ درخواست و پاسخ موفق در
 * برابر schema اعتبارسنجی می‌شوند (حالت strict پیش‌فرض: تخلف = ۵۰۰ با توضیح).
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import { registerAuthRoutes } from './handlers/auth';
import { registerFileRoutes } from './handlers/files';
import { registerLandingRoutes } from './handlers/landing';
import { registerNotificationRoutes } from './handlers/notifications';
import { HttpError, type RouteResult } from './http';
import {
  HTTP_METHODS,
  operationRequiresAuth,
  requestBodySchema,
  successResponseSchema,
  validateAgainstSchema,
  type HttpMethod,
} from './openapi';
import { Router } from './router';
import { seedStore } from './seed';
import { clearStore, createStore, type Session, type Store } from './store';

export type FakeNestOptions = {
  /** `0` یعنی پورت آزاد (تست). */
  port?: number;
  publicUrl?: string;
  /** تخلف قرارداد → ۵۰۰. `false` فقط هشدار لاگ می‌کند. */
  strict?: boolean;
  delayMs?: number;
  seed?: boolean;
  quiet?: boolean;
};

export type FakeNest = {
  server: Server;
  router: Router;
  store: () => Store;
  listen: () => Promise<number>;
  close: () => Promise<void>;
};

const MAX_BODY_BYTES = 35 * 1024 * 1024;
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);

function isHttpMethod(value: string): value is HttpMethod {
  return (HTTP_METHODS as readonly string[]).includes(value);
}

function readRawBody(request: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    request.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'Payload Too Large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

function sendJson(response: ServerResponse, status: number, body?: unknown): void {
  if (status === 204 || body === undefined) {
    response.writeHead(status);
    response.end();
    return;
  }
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  response.end(payload);
}

function applyCors(request: IncomingMessage, response: ServerResponse): void {
  response.setHeader('access-control-allow-origin', request.headers.origin ?? '*');
  response.setHeader('access-control-allow-credentials', 'true');
  response.setHeader(
    'access-control-allow-headers',
    'authorization,content-type,x-custom-lang'
  );
  response.setHeader('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
}

/** `$.title: …` → `{ title: '…' }` هم‌شکل خطای ValidationPipe نست. */
function toFieldErrors(errors: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const error of errors) {
    const match = /^\$\.?([^.:[\]]*)/.exec(error);
    const key = match?.[1] || 'body';
    out[key] ??= error.replace(/^[^:]*:\s*/, '');
  }
  return out;
}

/** access برای همه؛ refresh فقط روی `/auth/refresh` (Nest همان را Bearer می‌گیرد). */
function expectedTokenKind(specPath: string): Session['kind'] {
  return specPath.endsWith('/auth/refresh') ? 'refresh' : 'access';
}

function isAdminOnly(specPath: string): boolean {
  return specPath.startsWith('/api/admin/') || specPath.startsWith('/api/v1/admin/');
}

function bearerSession(request: IncomingMessage, store: Store): Session | null {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return store.sessions.get(header.slice('Bearer '.length).trim()) ?? null;
}

export function createFakeNest(options: FakeNestOptions = {}): FakeNest {
  const port = options.port ?? 4000;
  const strict = options.strict ?? true;
  let publicUrl = options.publicUrl ?? `http://localhost:${port}`;
  const store = createStore(publicUrl);
  if (options.seed ?? true) seedStore(store);

  const router = new Router();
  registerAuthRoutes(router, store);
  registerFileRoutes(router, store);
  registerLandingRoutes(router, store);
  registerNotificationRoutes(router, store);

  const log = (line: string) => {
    if (!options.quiet) console.info(`[fake-nest] ${line}`);
  };

  const finish = (
    response: ServerResponse,
    result: RouteResult,
    method: string,
    pathname: string,
    startedAt: number
  ) => {
    sendJson(response, result.status, result.body);
    log(`${method} ${pathname} → ${result.status} (${Date.now() - startedAt}ms)`);
  };

  async function handle(request: IncomingMessage, response: ServerResponse) {
    const startedAt = Date.now();
    const method = (request.method ?? 'GET').toUpperCase();
    const url = new URL(request.url ?? '/', publicUrl);
    const { pathname } = url;
    applyCors(request, response);

    if (method === 'OPTIONS') {
      sendJson(response, 204);
      return;
    }

    // کنترل توسعه — خارج از Swagger.
    if (pathname === '/__fake/health') {
      finish(response, { status: 200, body: { ok: true } }, method, pathname, startedAt);
      return;
    }
    if (pathname === '/__fake/reset' && method === 'POST') {
      clearStore(store);
      seedStore(store);
      finish(response, { status: 204 }, method, pathname, startedAt);
      return;
    }

    // ذخیرهٔ فایل شبیه S3 — خارج از Swagger.
    const storageMatch = /^\/storage\/([^/]+)$/.exec(pathname);
    if (storageMatch) {
      const file = store.files.get(storageMatch[1]!);
      if (!file) {
        finish(response, { status: 404, body: { message: 'Not Found' } }, method, pathname, startedAt);
        return;
      }
      if (method === 'PUT') {
        file.bytes = await readRawBody(request);
        file.size = file.bytes.length;
        finish(response, { status: 200 }, method, pathname, startedAt);
        return;
      }
      if (method === 'GET' && file.bytes) {
        response.writeHead(200, {
          'content-type': file.mimeType,
          'content-length': file.bytes.length,
        });
        response.end(file.bytes);
        log(`GET ${pathname} → 200 (${Date.now() - startedAt}ms)`);
        return;
      }
      finish(response, { status: 404, body: { message: 'Not Found' } }, method, pathname, startedAt);
      return;
    }

    const lower = method.toLowerCase();
    const matched = isHttpMethod(lower) ? router.match(lower, pathname) : null;
    if (!matched || !isHttpMethod(lower)) {
      const status = router.pathExists(pathname) ? 405 : 404;
      finish(
        response,
        {
          status,
          body: {
            statusCode: status,
            message: `Cannot ${method} ${pathname}`,
            error: status === 405 ? 'Method Not Allowed' : 'Not Found',
          },
        },
        method,
        pathname,
        startedAt
      );
      return;
    }

    const { route, params } = matched;
    try {
      const session = bearerSession(request, store);
      if (operationRequiresAuth(lower, route.specPath)) {
        if (!session || session.kind !== expectedTokenKind(route.specPath)) {
          throw new HttpError(401, 'Unauthorized');
        }
        if (isAdminOnly(route.specPath) && session.surface !== 'admin') {
          throw new HttpError(403, 'Forbidden');
        }
      }

      let body: unknown;
      if (BODY_METHODS.has(method)) {
        const raw = await readRawBody(request);
        if (raw.length > 0) {
          try {
            body = JSON.parse(raw.toString('utf8'));
          } catch {
            throw new HttpError(400, 'Malformed JSON body');
          }
        }
        const schema = requestBodySchema(lower, route.specPath);
        if (schema) {
          const errors = validateAgainstSchema(body ?? {}, schema);
          if (errors.length > 0) {
            throw new HttpError(422, 'Unprocessable Entity', toFieldErrors(errors));
          }
        }
      }

      const result = await route.handler({
        method: lower,
        pathname,
        params,
        query: url.searchParams,
        body,
        session,
      });

      const contract = successResponseSchema(lower, route.specPath);
      if (contract && result.status === contract.status && contract.schema) {
        const errors = validateAgainstSchema(result.body, contract.schema);
        if (errors.length > 0) {
          const detail = `Fake-Nest contract violation on ${method} ${route.specPath}: ${errors.join('; ')}`;
          log(detail);
          if (strict) {
            finish(response, { status: 500, body: { message: detail } }, method, pathname, startedAt);
            return;
          }
        }
      }
      if (contract && result.status !== contract.status) {
        log(`warning: ${method} ${route.specPath} پاسخ ${result.status} داد، Swagger ${contract.status} می‌گوید`);
      }

      if (options.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
      }
      finish(response, result, method, pathname, startedAt);
    } catch (error) {
      if (error instanceof HttpError) {
        finish(response, { status: error.status, body: error.toBody() }, method, pathname, startedAt);
        return;
      }
      log(`unexpected error: ${error instanceof Error ? error.stack : String(error)}`);
      finish(response, { status: 500, body: { message: 'Internal Server Error' } }, method, pathname, startedAt);
    }
  }

  const server = createServer((request, response) => {
    void handle(request, response).catch((error: unknown) => {
      const status = error instanceof HttpError ? error.status : 500;
      if (!response.headersSent) sendJson(response, status, { message: String(error) });
    });
  });

  return {
    server,
    router,
    store: () => store,
    listen: () =>
      new Promise((resolve) => {
        server.listen(port, () => {
          const address = server.address();
          const actual =
            typeof address === 'object' && address ? address.port : port;
          // پورت آزاد (`0`) تا بعد از listen معلوم نیست؛ آدرس فایل‌ها باید همان باشد.
          if (!options.publicUrl) {
            publicUrl = `http://localhost:${actual}`;
            store.publicUrl = publicUrl;
          }
          resolve(actual);
        });
      }),
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  };
}
