"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, BookOpen, UserPlus } from "lucide-react";
import { getErrorMessage } from "@/lib/get-error-message";
import { registerSchema } from "@/lib/schemas/auth";

type RegisterFormValues = z.input<typeof registerSchema>;

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
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

  return (
    <div className="max-w-md w-full px-4 sm:px-0 space-y-6 sm:space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
          Coleções
        </h2>
        <p className="mt-3 text-lg text-white/80 drop-shadow">
          Crie sua conta para começar a organizar suas coleções
        </p>
      </div>
      <form
        className="mt-8 space-y-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
        onSubmit={onSubmit}
        noValidate
      >
        <div className="space-y-5">
          <div className="group">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              <span className="text-red-600">*</span> Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                aria-label="Nome Completo"
                className={`block w-full pl-11 px-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base text-gray-900 placeholder-gray-400 transition-all duration-300 input-focus-glow hover:border-gray-400 ${
                  errors.name ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="Ex: João Silva"
                {...registerField("name")}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-800">{errors.name.message}</p>
            )}
          </div>
          <div className="group">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              <span className="text-red-600">*</span> Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-label="Email"
                className={`block w-full pl-11 px-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base text-gray-900 placeholder-gray-400 transition-all duration-300 input-focus-glow hover:border-gray-400 ${
                  errors.email ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="exemplo@email.com"
                {...registerField("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-800">{errors.email.message}</p>
            )}
          </div>
          <div className="group">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              <span className="text-red-600">*</span> Senha (mínimo 6 caracteres)
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-label="Senha. Mínimo 6 caracteres."
                className={`block w-full pl-11 px-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base text-gray-900 placeholder-gray-400 transition-all duration-300 input-focus-glow hover:border-gray-400 ${
                  errors.password ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="••••••••"
                {...registerField("password")}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-800">{errors.password.message}</p>
            )}
          </div>
          <div className="group">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              <span className="text-red-600">*</span> Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-label="Confirmar Senha"
                className={`block w-full pl-11 px-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base text-gray-900 placeholder-gray-400 transition-all duration-300 input-focus-glow hover:border-gray-400 ${
                  errors.confirmPassword ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="••••••••"
                {...registerField("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-800">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl button-press"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Criando conta...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Criar Conta
              </>
            )}
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 inline-block"
            >
              Faça login aqui
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
