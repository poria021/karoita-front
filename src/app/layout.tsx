import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zexa Better Auth",
  description: "A Next.js boilerplate for building web applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      {/*
        `RootLayout` itself stays a Server Component - only `<Providers>`
        (see `src/components/providers.tsx`) opts into the client runtime,
        so the `<html>`/`<body>` shell and metadata keep rendering on the
        server with zero extra client JS for this layout itself.
      */}
      <body className={`${inter.variable} antialiased bg-background`}>
        <Providers>{children}</Providers>

        {/*
          TODO (Auth Refactor): transitional dual-toaster setup. Legacy
          admin dialogs (see `src/components/admin/*-dialog.tsx`) still call
          `toast()` from `react-hot-toast`, so its <Toaster /> stays mounted
          here until those call sites are migrated to `sonner` (which now
          owns toasts for all new code via `<Providers>`). Remove this once
          that migration is done.
        */}
        <Toaster />
      </body>
    </html>
  );
}
