import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

import { ToastProvider } from "@/app/components/ui/toast-provider";
import { ClientProvider } from "@/app/components/ui/client-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coleção Virtual",
  description: "Gerenciador de coleções",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d1f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="color-scheme" content="dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Coleções" />
        <meta name="theme-color" content="#0d0d1f" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%232563eb' width='192' height='192'/><text x='50%' y='50%' font-size='80' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'>📚</text></svg>" />
      </head>
      <body className="min-h-screen w-full overflow-x-hidden flex flex-col">
        <ClientProvider>
          <ToastProvider />
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
