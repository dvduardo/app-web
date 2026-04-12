"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type Platform = "android" | "ios" | "other";

interface UseInstallPromptReturn {
  platform: Platform;
  isInstalled: boolean;
  canInstall: boolean;
  install: () => Promise<void>;
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("other");
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detecta se já está instalado (rodando em standalone)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true);
    setIsInstalled(standalone);

    // Detecta plataforma
    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);
    setPlatform(isIos ? "ios" : isAndroid ? "android" : "other");

    // Android/Chrome: captura o evento de instalação nativo
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const canInstall =
    !isInstalled && (platform === "ios" || platform === "android");

  return { platform, isInstalled, canInstall, install };
}
