import type { Metadata } from "next";
import { Geist_Mono, Outfit, Sora } from "next/font/google";

import { AppProviders } from "@/app/providers";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${sora.variable} ${geistMono.variable} font-sans min-h-dvh antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
