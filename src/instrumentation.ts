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
 * هوک instrumentation نکست — شکست درخواست سرور/Edge.
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

  // import پویا (نه استاتیک) تا باندل Edge هرگز `process.on(...)` را نکشد —
  // نگاه کنید به `instrumentation-node.ts`.
  const { registerNodeProcessHandlers } = await import(
    './instrumentation-node'
  );
  registerNodeProcessHandlers();
}
