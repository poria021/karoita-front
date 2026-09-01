import { parseSentryDsn } from '@/lib/observability/parseSentryDsn';

export type ErrorReportContext = {
  source?: string;
  path?: string;
  digest?: string;
    extra?: Record<string, string | number | boolean | null | undefined>;
};

function toError(value: unknown): { name: string; message: string; stack?: string } {
  if (value instanceof Error) {
    return {
      name: value.name || 'Error',
      message: value.message || 'Unknown error',
      stack: value.stack,
    };
  }
  if (typeof value === 'string' && value.trim()) {
    return { name: 'Error', message: value };
  }
  return { name: 'Error', message: 'Unknown error' };
}

function sentryAuthHeader(publicKey: string): string {
  return [
    'Sentry sentry_version=7',
    `sentry_client=karvita-frontend/0.1`,
    `sentry_key=${publicKey}`,
  ].join(', ');
}

async function postJson(url: string, body: unknown, headers?: Record<string, string>) {
  await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
    keepalive: true,
  });
}

/**
 * همیشه locally لاگ می‌کند. اگر env ست باشد، به store سنتری و/یا webhook هم می‌فرستد.
 * هرگز throw نمی‌کند — گزارش نباید UI خطا را بشکند.
 */
export async function reportError(
  error: unknown,
  context: ErrorReportContext = {}
): Promise<void> {
  const normalized = toError(error);
  const digest =
    context.digest ??
    (error instanceof Error && 'digest' in error
      ? String((error as Error & { digest?: string }).digest ?? '')
      : '');

  console.error(`[${context.source ?? 'app'}]`, normalized.message, error);

  const payload = {
    ...normalized,
    digest: digest || undefined,
    source: context.source,
    path: context.path,
    extra: context.extra,
    environment: process.env.NODE_ENV,
    timestamp: Date.now(),
  };

  const webhook = process.env.NEXT_PUBLIC_ERROR_WEBHOOK_URL?.trim();
  const dsn = parseSentryDsn(process.env.NEXT_PUBLIC_SENTRY_DSN);

  try {
    const jobs: Promise<unknown>[] = [];

    if (webhook) {
      jobs.push(postJson(webhook, { type: 'error', ...payload }));
    }

    if (dsn) {
      jobs.push(
        postJson(
          dsn.storeUrl,
          {
            message: normalized.message,
            exception: {
              values: [
                {
                  type: normalized.name,
                  value: normalized.message,
                  stacktrace: normalized.stack
                    ? { frames: [{ filename: 'inline', function: normalized.stack }] }
                    : undefined,
                },
              ],
            },
            tags: {
              source: context.source ?? 'app',
            },
            extra: {
              path: context.path,
              digest: digest || undefined,
              ...context.extra,
            },
            environment: process.env.NODE_ENV,
            platform: 'javascript',
          },
          { 'X-Sentry-Auth': sentryAuthHeader(dsn.publicKey) }
        )
      );
    }

    await Promise.all(jobs);
  } catch {
    // شکست reporter نباید UI خطا را بشکند.
  }
}
