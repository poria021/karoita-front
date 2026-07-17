import "./globals.css";
import type { Metadata } from "next";
import { KvToaster } from "@/components/shared/KvToaster";
import { Vazirmatn } from "next/font/google";

import Providers from "@/components/shared/Providers";

// لود کردن و معرفی متغیر فونت خورشیدی وزیرمتن
const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  weight: ["100", "300", "400", "500", "700", "900"],
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
      <body className={`${vazirmatn.variable} font-sans antialiased bg-background`}>
        <Providers>
          {children}
            <KvToaster dir="rtl" richColors closeButton position="top-center" />
            </Providers>
      </body>
    </html>
  );
}