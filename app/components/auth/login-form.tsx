"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { getProviders } from "next-auth/react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  LogIn,
  BookOpen,
  Disc3,
  Bot,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";
import { getErrorMessage } from "@/lib/get-error-message";
import { loginSchema } from "@/lib/schemas/auth";
import { OAuthButtons } from "@/app/components/auth/oauth-buttons";

type LoginFormValues = z.input<typeof loginSchema>;

const collectibleIcons: LucideIcon[] = [BookOpen, Disc3, Bot, Gamepad2];

export function LoginForm() {
  const { login, loginWithOAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeIconIndex, setActiveIconIndex] = useState(0);
  const [isIconTransitioning, setIsIconTransitioning] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<Array<"google" | "github" | "discord">>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true") {
      toast.success("Cadastro realizado com sucesso! Faça login agora.");
      router.replace("/auth/login");
      return;
    }

    if (error === "OAuthEmailMissing") {
      toast.error("Não foi possível obter seu email no provedor social.");
      router.replace("/auth/login");
      return;
    }

    if (error) {
      toast.error("Não foi possível concluir o login social. Tente novamente.");
      router.replace("/auth/login");
    }
  }, [router, searchParams]);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providers = await getProviders();
        const enabledProviders = (["google", "github", "discord"] as const).filter(
          (provider) => Boolean(providers?.[provider])
        );
        setAvailableProviders(enabledProviders);
      } catch {
        setAvailableProviders([]);
      }
    };

    void loadProviders();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let isLocked = false;

    const intervalId = window.setInterval(() => {
      if (isLocked) {
        return;
      }

      isLocked = true;
      setIsIconTransitioning(true);

      window.setTimeout(() => {
        setActiveIconIndex((currentIndex) => (currentIndex + 1) % collectibleIcons.length);
      }, 90);

      window.setTimeout(() => {
        setIsIconTransitioning(false);
        isLocked = false;
      }, 220);
    }, 3600);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      toast.success("Login realizado com sucesso!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, "Email ou senha incorretos.");
      toast.error(errorMsg);
    }
  });

  return (
    <div className="w-full">
      <div>

        {/* Mobile header — icon centered above, text below (hidden on desktop) */}
        <div className="mb-8 flex flex-col items-center text-center lg:hidden">
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-indigo-700 via-indigo-500 to-violet-500 shadow-[0_14px_32px_rgba(79,70,229,0.4)]" />
            <div className="absolute inset-px rounded-[21px] border border-white/10" />
            {collectibleIcons.map((Icon, index) => {
              const isActive = index === activeIconIndex;
              return (
                <div
                  key={Icon.displayName ?? Icon.name ?? `collectible-icon-${index}`}
                  aria-hidden="true"
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                    isActive ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
                  } ${isIconTransitioning && isActive ? "opacity-0" : ""}`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
              );
            })}
          </div>
          <p className="mt-4 font-display text-xl font-semibold text-white">Minhas Coleções</p>
          <p className="mt-1 text-sm text-slate-400">Bem-vindo de volta</p>
        </div>

        {/* Desktop header (hidden on mobile) */}
        <div className="mb-8 hidden lg:block">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white">
            Bem-vindo de volta
          </h2>
          <div className="mt-3 h-px w-12 bg-linear-to-r from-indigo-500 to-transparent" />
          <p className="mt-3 text-sm text-slate-500">
            Não tem conta?{" "}
            <Link href="/auth/register" className="font-medium text-indigo-400 hover:text-indigo-300">
              Crie uma grátis
            </Link>
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={onSubmit}
          noValidate
        >
          <OAuthButtons
            availableProviders={availableProviders}
            isSubmitting={isSubmitting}
            loginWithOAuth={loginWithOAuth}
          />

          <div className="relative py-1">
            <div className="h-px w-full bg-white/8" />
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              <span className="bg-[#0d0d1f] px-3">ou entre com email</span>
            </span>
          </div>

          <div className="space-y-4">
            <div className="group">
              <label htmlFor="email" className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-300" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-label="Email"
                  className={`vault-input block min-h-[52px] w-full rounded-2xl py-3.5 pr-4 pl-12 text-base outline-none transition-all duration-300 ${
                    errors.email ? "border-red-400/80 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(248,113,113,0.16)]" : ""
                  }`}
                  placeholder="voce@exemplo.com"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-300">{errors.email.message}</p>}
            </div>

            <div className="group">
              <label htmlFor="password" className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-300" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-label="Senha"
                  className={`vault-input block min-h-[52px] w-full rounded-2xl py-3.5 pr-4 pl-12 text-base outline-none transition-all duration-300 ${
                    errors.password ? "border-red-400/80 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(248,113,113,0.16)]" : ""
                  }`}
                  placeholder="••••••••"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-300">{errors.password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="vault-button-primary mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Entrando...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Entrar na conta
              </>
            )}
          </button>

          {/* Mobile footer link */}
          <div className="border-t border-white/8 pt-4 text-center lg:hidden">
            <p className="text-sm text-slate-400">
              Não tem conta?{" "}
              <Link href="/auth/register" className="font-semibold text-indigo-300 hover:text-indigo-200">
                Crie uma aqui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
