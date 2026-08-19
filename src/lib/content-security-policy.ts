import { sentryConnectOriginsFromEnv } from './observability/parseSentryDsn';

function originFromEnv(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Document CSP. Next App Router emits inline hydration/Flight scripts, so
 * production must allow `'unsafe-inline'` (or a per-request nonce). Blocking
 * those scripts leaves a blank document after paint.
 */
export function buildContentSecurityPolicy(): string {
  const isDev = process.env.NODE_ENV !== 'production';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const apiOrigin = originFromEnv(process.env.NEXT_PUBLIC_API_URL);

  const webhookOrigin = originFromEnv(process.env.NEXT_PUBLIC_ERROR_WEBHOOK_URL);
  const analyticsOrigin = originFromEnv(
    process.env.NEXT_PUBLIC_ANALYTICS_BEACON_URL
  );

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
      "'self'",
      ...(apiUrl ? [apiUrl] : []),
      ...(apiOrigin ? [apiOrigin] : []),
      ...sentryConnectOriginsFromEnv(),
      ...(webhookOrigin ? [webhookOrigin] : []),
      ...(analyticsOrigin ? [analyticsOrigin] : []),
      ...(isDev ? ['ws:', 'wss:', 'http://localhost:*'] : []),
    ],
    'frame-ancestors': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'worker-src': ["'self'"],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}
