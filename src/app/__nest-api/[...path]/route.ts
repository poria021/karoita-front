import { NextRequest } from 'next/server';

import { forwardToNestApi } from '@/lib/nest-proxy-forward';

export const dynamic = 'force-dynamic';

type RouteCtx = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return forwardToNestApi(request, path ?? []);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
