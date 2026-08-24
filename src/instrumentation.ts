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

  // Dynamic import (not a static one) so bundling for the Edge Runtime
  // never pulls in process.on(...) — see instrumentation-node.ts.
  const { registerNodeProcessHandlers } = await import(
    './instrumentation-node'
  );
  registerNodeProcessHandlers();
}
