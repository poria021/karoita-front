import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Vazirmatn } from "next/font/google";

import Providers from "@/components/shared/shell/Providers";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
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
            <Toaster dir="rtl" richColors closeButton position="top-center" />
            </Providers>
      </body>
    </html>
  );
}