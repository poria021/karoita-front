'use client';

import { log } from 'node:console';
import { useEffect } from 'react';

/** موقت: لاگ env سمت مرورگر (فقط NEXT_PUBLIC_* در باندل می‌آید). بعد از دیباگ حذف شود. */
export function EnvDebugLog() {
  useEffect(() => {
    console.log('poooria adroit savad kiihi');
    
    console.log('[env-debug][client]', {
      NEXT_PUBLIC_API_MODE: process.env.NEXT_PUBLIC_API_MODE,
      NEXT_PUBLIC_IS_DEV: process.env.NEXT_PUBLIC_IS_DEV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_ALLOW_MOCK_IN_PROD: process.env.NEXT_PUBLIC_ALLOW_MOCK_IN_PROD,
    });
  }, []);
  return null;
}
