import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

import { ToastProvider } from "@/app/components/ui/toast-provider";
import { ClientProvider } from "@/app/components/ui/client-provider";
import { ServiceWorkerInit } from "@/app/components/ui/service-worker-init";

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
  description: "Gerenciador de coleções pessoais",
  formatDetection: { telephone: false },
  applicationName: "Coleções",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Coleções",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0d0d1f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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
        <meta name="color-scheme" content="dark" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen w-full overflow-x-hidden flex flex-col">
        <ClientProvider>
          <ServiceWorkerInit />
          <ToastProvider />
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
