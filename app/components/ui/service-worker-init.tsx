"use client";

import { useEffect } from "react";

export function ServiceWorkerInit() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // SW não disponível neste ambiente — ignora silenciosamente
        });
    }
  }, []);

  return null;
}
