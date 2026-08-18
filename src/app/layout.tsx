import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";

import { Providers } from "@/components/shared/shell/Providers";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_TITLE,
  getSiteUrl,
} from "@/lib/site-seo";

/**
 * Local Vazirmatn — avoids next/font/google download at compile time
 * (Google Fonts is often unreachable and hangs Turbopack on first compile).
 *
 * وزن‌های بارگذاری‌شده:
 *   400 → font-sans (پیش‌فرض بدنه)
 *   500 → font-medium  (nav, body, caption در KvTypography)
 *   700 → font-bold    (title, subtitle, label در KvTypography)
 *   900 → font-black   (display و headingهای برجسته)
 *
 * وزن 600 (font-semibold) در هیچ کجای UI استفاده نمی‌شود — حذف شد تا
 * دو فایل woff2 اضافی (~37KB) در هر صفحه preload نشوند.
 * اگر در آینده font-semibold اضافه شد، دو فایل 600 را دوباره اینجا بیاورید.
 */
const vazirmatn = localFont({
  src: [
    {
      path: "../fonts/vazirmatn/vazirmatn-arabic-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/vazirmatn/vazirmatn-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/vazirmatn/vazirmatn-arabic-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/vazirmatn/vazirmatn-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/vazirmatn/vazirmatn-arabic-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/vazirmatn/vazirmatn-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/vazirmatn/vazirmatn-arabic-900-normal.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "../fonts/vazirmatn/vazirmatn-latin-900-normal.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    'کارویتا',
    'کارورزی',
    'کارآموزی',
    'آموزش مهارتی',
    'آموزش نظری',
    'سامانه آموزش',
    'مدیریت کارورزی',
    'دانشگاه',
    'آموزش و پرورش',
  ],
  alternates: {
    canonical: '/',
    languages: {
      'fa-IR': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [{ url: '/brand/karvita-mark.png', type: 'image/png' }],
    apple: [{ url: '/brand/karvita-mark.png', type: 'image/png' }],
  },
  category: 'education',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} font-sans antialiased bg-kv-canvas`}
      >
        <Providers>
          {children}
          <Toaster
            dir="rtl"
            richColors
            closeButton
            position="top-center"
            toastOptions={{
              closeButton: true,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
