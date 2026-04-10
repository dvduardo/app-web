"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, Plus } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

const DISMISSED_KEY = "pwa-install-dismissed";

function Steps({ steps, onDismiss }: { steps: string[]; onDismiss: () => void }) {
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-3"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
            {i + 1}
          </span>
          <p
            className="text-sm text-slate-300"
            dangerouslySetInnerHTML={{ __html: step }}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={onDismiss}
        className="w-full rounded-2xl border border-white/8 py-2.5 text-sm text-slate-400 hover:bg-white/3"
      >
        Ok, entendi
      </button>
    </div>
  );
}

export function InstallBanner() {
  const { platform, isInstalled, canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISSED_KEY) === "true";
    setDismissed(wasDismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  if (isInstalled || dismissed || !canInstall) return null;

  const iosSteps = [
    `Toque no ícone de compartilhar <strong class="text-slate-100">􀈂</strong> na barra do Safari`,
    `Role para baixo e toque em <strong class="text-slate-100">Adicionar à Tela de Início</strong>`,
    `Toque em <strong class="text-slate-100">Adicionar</strong> no canto superior direito`,
  ];

  const androidSteps = [
    `Toque no menu <strong class="text-slate-100">⋮</strong> no canto superior direito do Chrome`,
    `Toque em <strong class="text-slate-100">Adicionar à tela inicial</strong>`,
    `Toque em <strong class="text-slate-100">Adicionar</strong> na confirmação`,
  ];

  const handleAndroidInstall = async () => {
    try {
      await install();
    } catch {
      // Prompt nativo não disponível — mostra instruções manuais
    }
    setShowSteps(true);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3">
      <div className="rounded-[1.75rem] border border-indigo-400/20 bg-[#0d0d1f]/96 p-4 shadow-[0_-8px_40px_rgba(2,6,23,0.7)] backdrop-blur-xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-700 to-violet-600">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                {platform === "ios" ? "Adicionar à tela inicial" : "Instalar Coleções"}
              </p>
              <p className="text-xs text-slate-400">
                Use como um app, sem abrir o browser
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {showSteps ? (
          <Steps
            steps={platform === "ios" ? iosSteps : androidSteps}
            onDismiss={handleDismiss}
          />
        ) : (
          <button
            type="button"
            onClick={platform === "ios" ? () => setShowSteps(true) : handleAndroidInstall}
            className="vault-button-primary w-full rounded-2xl py-3 text-sm font-semibold text-white"
          >
            {platform === "ios" ? (
              <span className="flex items-center justify-center gap-2">
                <Share className="h-4 w-4" /> Ver como instalar
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Instalar
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
