'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

import { KvBusySurface } from '@/components/shared/table/KvBusySurface';

/**
 * Route-level split for heavy dashboard client modules.
 * Loading is local busy only (rule 84) — not a full-page skeleton.
 */
export function loadDashboardClient<P extends object = object>(
  loader: () => Promise<{ default: unknown }>
): ComponentType<P> {
  return dynamic(loader as unknown as Parameters<typeof dynamic>[0], {
    ssr: false,
    loading: () => (
      <KvBusySurface className="min-h-48 rounded-kv-panel" />
    ),
  }) as unknown as ComponentType<P>;
}
