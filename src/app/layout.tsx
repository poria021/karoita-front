import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";

import { Providers } from "@/components/shared/shell/Providers";

/**
 * Local Vazirmatn (arabic subset) — avoids next/font/google download at compile time
 * (Google Fonts is often unreachable and hangs Turbopack on first compile).
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
      path: "../fonts/vazirmatn/vazirmatn-arabic-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/vazirmatn/vazirmatn-latin-600-normal.woff2",
      weight: "600",
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
  title: "سامانه جامع آموزش نظری و مهارتی کارویتا",
  description: "پورتال کارآموزی کارویتا",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} font-sans antialiased bg-kv-canvas`}>
        <Providers>
          {children}
          <Toaster dir="rtl" richColors closeButton position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
