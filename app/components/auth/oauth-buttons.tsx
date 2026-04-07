"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/get-error-message";

type OAuthProvider = "google" | "github" | "discord";

interface OAuthButtonsProps {
  availableProviders: OAuthProvider[];
  isSubmitting?: boolean;
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>;
}

const providerMeta: Record<
  OAuthProvider,
  {
    label: string;
    shortLabel: string;
    loadingLabel: string;
  }
> = {
  google: {
    label: "Continuar com Google",
    shortLabel: "G",
    loadingLabel: "Conectando com Google...",
  },
  github: {
    label: "Continuar com GitHub",
    shortLabel: "GH",
    loadingLabel: "Conectando com GitHub...",
  },
  discord: {
    label: "Continuar com Discord",
    shortLabel: "D",
    loadingLabel: "Conectando com Discord...",
  },
};

export function OAuthButtons({
  availableProviders,
  isSubmitting = false,
  loginWithOAuth,
}: OAuthButtonsProps) {
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<OAuthProvider | null>(null);

  const handleOAuthLogin = async (provider: OAuthProvider, isEnabled: boolean) => {
    if (!isEnabled) {
      toast("Configure as credenciais OAuth no ambiente local para habilitar este acesso.");
      return;
    }

    try {
      setSocialLoadingProvider(provider);
      await loginWithOAuth(provider);
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, "Não foi possível iniciar o login social.");
      toast.error(errorMsg);
      setSocialLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      {(["google", "github", "discord"] as const).map((provider) => {
        const meta = providerMeta[provider];
        const isEnabled = availableProviders.includes(provider);
        const isLoading = socialLoadingProvider === provider;

        return (
          <button
            key={provider}
            type="button"
            onClick={() => void handleOAuthLogin(provider, isEnabled)}
            disabled={Boolean(socialLoadingProvider) || isSubmitting}
            aria-disabled={!isEnabled}
            className={`flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
              isEnabled
                ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/8"
                : "border-white/8 bg-white/[0.03] text-slate-400"
            }`}
          >
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/10 px-1 text-[10px] font-bold">
              {meta.shortLabel}
            </span>
            {isLoading ? meta.loadingLabel : meta.label}
            {!isEnabled && <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Indisponível</span>}
          </button>
        );
      })}
    </div>
  );
}
