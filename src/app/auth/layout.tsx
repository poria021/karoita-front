import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { DOCUMENT_TITLE, privatePageMetadata } from '@/lib/document-title';

export const metadata: Metadata = privatePageMetadata(DOCUMENT_TITLE.signIn);

/**
 * پوستهٔ `/auth/*` (ورود، ثبت‌نام، فراموشی، admin-gate).
 *
 * متغیر فونت Vazirmatn (`--font-vazirmatn`) از قبل روی `<body>` در layout ریشه
 * (`src/app/layout.tsx`) است. گذاشتن دوبارهٔ کلاس فونت اینجا باعث می‌شد نکست
 * `<link rel="preload">` تکراری برای chunk CSS فونت روی هر `/auth/*` بگذارد و
 * مرورگر هشدار «preloaded but not used» بدهد.
 *
 * حذف کلاس فونت از این layout، preload تکراری را برمی‌دارد بدون اینکه تایپوگرافی
 * عوض شود — متغیر CSS از `<body>` ریشه در scope است.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
