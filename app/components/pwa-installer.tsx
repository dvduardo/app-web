"use client";

import { useEffect } from "react";

export function PWAInstaller() {
  useEffect(() => {
    // Register service worker - allow in both production and development
    // Works on HTTPS and localhost, needs special handling for IP-based HTTP
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js", {
          scope: "/",
        })
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration);
          // Check for updates
          registration.addEventListener("updatefound", () => {
            console.log("Service Worker update found");
          });
        })
        .catch((error) => {
          console.warn("⚠️ Service Worker registration failed:", error.message);
          // Service Workers might not work on HTTP non-localhost,
          // but we'll try anyway and fallback to IndexedDB caching
        });
    } else {
      console.warn("Service Worker not supported");
    }

    // PWA install prompt
    let deferredPrompt: Event | null = null;

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Show install button here if needed
    });

    window.addEventListener("appinstalled", () => {
      console.log("PWA installed successfully");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", () => {});
      window.removeEventListener("appinstalled", () => {});
    };
  }, []);

  return null;
}
