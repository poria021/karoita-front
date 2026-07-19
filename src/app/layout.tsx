import "./globals.css";
import type { Metadata } from "next";
import { KvToaster } from "@/components/shared/KvToaster";
import { Vazirmatn } from "next/font/google";

import Providers from "@/components/shared/shell/Providers";

// لود کردن و معرفی متغیر فونت خورشیدی وزیرمتن
const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  // Product UI: regular / medium / bold / black (rule 82). Dropped 600 —
  // prefer font-bold over font-semibold to avoid an unused weight.
  weight: ["400", "500", "700", "900"],
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
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} font-sans antialiased bg-kv-canvas`}>
        <Providers>
          {children}
            <KvToaster dir="rtl" richColors closeButton position="top-center" />
            </Providers>
      </body>
    </html>
  );
}