"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { getProviders } from "next-auth/react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, BookOpen, UserPlus } from "lucide-react";
import { getErrorMessage } from "@/lib/get-error-message";
import { registerSchema } from "@/lib/schemas/auth";
import { OAuthButtons } from "@/app/components/auth/oauth-buttons";

type RegisterFormValues = z.input<typeof registerSchema>;

export function RegisterForm() {
  const { register, loginWithOAuth } = useAuth();
  const router = useRouter();
  const [availableProviders, setAvailableProviders] = useState<Array<"google" | "github" | "discord">>([]);
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register(values.email, values.password, values.name);
      toast.success("Conta criada com sucesso!");
      router.push("/auth/login?success=true");
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, "Erro ao criar conta. Tente novamente.");
      toast.error(errorMsg);
    }
  });

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

  return (
    <div className="w-full">
      <div>

        {/* Mobile header — icon centered above, text below (hidden on desktop) */}
        <div className="mb-8 flex flex-col items-center text-center lg:hidden">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-indigo-700 via-indigo-500 to-violet-500 shadow-[0_14px_32px_rgba(79,70,229,0.4)]">
            <div className="absolute inset-px rounded-[21px] border border-white/10" />
            <BookOpen className="relative h-7 w-7 text-white" />
          </div>
          <p className="mt-4 font-display text-xl font-semibold text-white">Minhas Coleções</p>
          <p className="mt-1 text-sm text-slate-400">Crie sua conta</p>
        </div>

        {/* Desktop header */}
        <div className="mb-8 hidden lg:block">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white">
            Comece de graça
          </h2>
          <div className="mt-3 h-px w-12 bg-gradient-to-r from-indigo-500 to-transparent" />
          <p className="mt-3 text-sm text-slate-500">
            Já tem conta?{" "}
            <Link href="/auth/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Faça login
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
              <span className="bg-[#0d0d1f] px-3">ou crie com email</span>
            </span>
          </div>

          <div className="space-y-4">
            <div className="group">
              <label htmlFor="name" className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span className="text-red-300">*</span> Nome completo
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-300" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  aria-label="Nome Completo"
                  className={`vault-input block min-h-13 w-full rounded-2xl py-3.5 pr-4 pl-12 text-base outline-none transition-all duration-300 ${
                    errors.name ? "border-red-400/80 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(248,113,113,0.16)]" : ""
                  }`}
                  placeholder="Ex: João Silva"
                  {...registerField("name")}
                />
              </div>
              {errors.name && <p className="mt-2 text-sm text-red-300">{errors.name.message}</p>}
            </div>

            <div className="group">
              <label htmlFor="email" className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span className="text-red-300">*</span> Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-300" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-label="Email"
                  className={`vault-input block min-h-13 w-full rounded-2xl py-3.5 pr-4 pl-12 text-base outline-none transition-all duration-300 ${
                    errors.email ? "border-red-400/80 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(248,113,113,0.16)]" : ""
                  }`}
                  placeholder="voce@exemplo.com"
                  {...registerField("email")}
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-300">{errors.email.message}</p>}
            </div>

            <div className="group">
              <label htmlFor="password" className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span className="text-red-300">*</span> Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-300" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  aria-label="Senha. Minimo 6 caracteres."
                  className={`vault-input block min-h-13 w-full rounded-2xl py-3.5 pr-4 pl-12 text-base outline-none transition-all duration-300 ${
                    errors.password ? "border-red-400/80 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(248,113,113,0.16)]" : ""
                  }`}
                  placeholder="Mín. 6 caracteres"
                  {...registerField("password")}
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-300">{errors.password.message}</p>}
            </div>

            <div className="group">
              <label htmlFor="confirmPassword" className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span className="text-red-300">*</span> Confirmar senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-300" />
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-label="Confirmar Senha"
                  className={`vault-input block min-h-13 w-full rounded-2xl py-3.5 pr-4 pl-12 text-base outline-none transition-all duration-300 ${
                    errors.confirmPassword ? "border-red-400/80 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(248,113,113,0.16)]" : ""
                  }`}
                  placeholder="Repita a senha"
                  {...registerField("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-300">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="vault-button-primary mt-2 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Criando conta...
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Criar conta
              </>
            )}
          </button>

          {/* Mobile footer link */}
          <div className="border-t border-white/8 pt-4 text-center lg:hidden">
            <p className="text-sm text-slate-400">
              Já tem uma conta?{" "}
              <Link href="/auth/login" className="font-semibold text-indigo-300 hover:text-indigo-200">
                Faça login aqui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
