/**
 * DSN عمومی Sentry را بدون SDK پارس می‌کند.
 * شکل: `https://<publicKey>@<host>/<projectId>`
 */
export type SentryDsnParts = {
  publicKey: string;
  host: string;
  projectId: string;
  origin: string;
  storeUrl: string;
};

export function parseSentryDsn(raw: string | undefined): SentryDsnParts | null {
  const dsn = raw?.trim();
  if (!dsn) return null;

  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const projectId = url.pathname
      .split('/')
      .filter(Boolean)
      .pop();
    if (!publicKey || !projectId || !url.host) return null;

    const origin = `${url.protocol}//${url.host}`;
    return {
      publicKey,
      host: url.host,
      projectId,
      origin,
      storeUrl: `${origin}/api/${projectId}/store/`,
    };
  } catch {
    return null;
  }
}

export function sentryConnectOriginsFromEnv(
  dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
): string[] {
  const parsed = parseSentryDsn(dsn);
  return parsed ? [parsed.origin] : [];
}
