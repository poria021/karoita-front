import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";

import { Providers } from "@/components/shared/shell/Providers";
import { vazirmatn } from "@/lib/vazirmatn-font";
import { DOCUMENT_TITLE_TEMPLATE } from "@/lib/document-title";
import {
  SITE_DESCRIPTION,
  SITE_FAVICON,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_TITLE,
  getSiteUrl,
} from "@/lib/site-seo";
import { PWA_THEME_COLOR } from "@/lib/pwa/pwa-chrome-color";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: SITE_NAME,
    template: DOCUMENT_TITLE_TEMPLATE,
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
    icon: [{ url: SITE_FAVICON, type: 'image/png', sizes: '64x64' }],
    apple: [
      {
        url: '/brand/apple-touch-icon.png',
        type: 'image/png',
        sizes: '180x180',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  category: 'education',
};

export const viewport: Viewport = {
  themeColor: PWA_THEME_COLOR,
  colorScheme: 'light dark',
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
          <Toaster dir="rtl" richColors closeButton position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
