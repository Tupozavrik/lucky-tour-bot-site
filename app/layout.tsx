import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TelegramThemeProvider from "@/components/TelegramThemeProvider";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Lucky Tour — Детали тура",
  description: "Telegram Web App для туристического агентства Lucky Tour",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Telegram Web App SDK — обязателен для доступа к themeParams */}
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body className="h-full antialiased" suppressHydrationWarning>
        <TelegramThemeProvider>
          {children}
        </TelegramThemeProvider>
      </body>
    </html>
  );
}
