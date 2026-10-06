import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminGateCard } from '@/features/shared/auth/components/AdminGateCard';
import { AuthCardRouteFallback } from '@/features/shared/auth/components/AuthCardRouteFallback';
import { DOCUMENT_TITLE, privatePageMetadata } from '@/lib/document-title';

import { EnvDebugLog } from './EnvDebugLog';

export const metadata: Metadata = privatePageMetadata(DOCUMENT_TITLE.signIn);

export default function AdminGatePage() {
  // موقت: لاگ env سمت سرور (ترمینال `next dev`). بعد از دیباگ حذف شود.
  console.log('[env-debug][server]', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_MODE: process.env.NEXT_PUBLIC_API_MODE,
    NEXT_PUBLIC_IS_DEV: process.env.NEXT_PUBLIC_IS_DEV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    BACKEND_INTERNAL_URL: process.env.BACKEND_INTERNAL_URL,
    NEXT_PUBLIC_ALLOW_MOCK_IN_PROD: process.env.NEXT_PUBLIC_ALLOW_MOCK_IN_PROD,
  });

  return (
    <main
      className="kv-blueprint-bg flex min-h-dvh w-full items-center justify-center p-kv-inset"
      dir="rtl"
    >
      <EnvDebugLog />
      <Suspense fallback={<AuthCardRouteFallback />}>
        <AdminGateCard />
      </Suspense>
    </main>
  );
}
