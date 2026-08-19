import { reportError } from '@/lib/observability/reportError';

type RequestErrorInfo = {
  path?: string;
  method?: string;
};

type RequestErrorContext = {
  routePath?: string;
  routerKind?: string;
  routeType?: string;
};

/**
 * Next.js instrumentation hook — server/edge request failures.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function onRequestError(
  error: unknown,
  request: RequestErrorInfo,
  context: RequestErrorContext
): Promise<void> {
  await reportError(error, {
    source: 'next-onRequestError',
    path: request.path ?? context.routePath,
    extra: {
      method: request.method,
      routerKind: context.routerKind,
      routeType: context.routeType,
    },
  });
}

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  process.on('unhandledRejection', (reason) => {
    void reportError(reason, { source: 'process.unhandledRejection' });
  });
  process.on('uncaughtException', (error) => {
    void reportError(error, { source: 'process.uncaughtException' });
  });
}
