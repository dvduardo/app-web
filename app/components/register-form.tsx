"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, BookOpen, UserPlus } from "lucide-react";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validações básicas
    if (!name.trim()) {
      const msg = "⚠️ Por favor, preencha seu Nome Completo";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!email.trim()) {
      const msg = "⚠️ Por favor, preencha seu Email";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = "⚠️ Senha deve ter no mínimo 6 caracteres";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = "⚠️ As senhas não correspondem";
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      toast.success("✅ Conta criada com sucesso!");
      router.push("/dashboard");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Erro ao criar conta. Tente novamente.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full px-4 sm:px-0 space-y-6 sm:space-y-8 fade-in-up">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Coleções
            </h2>
            <p className="mt-3 text-lg text-white/80 drop-shadow">Crie sua conta para começar a organizar suas coleções</p>
          </div>
          <form className="mt-8 space-y-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 p-4 border-2 border-red-200 shadow-md animate-pulse">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}
            <div className="space-y-5">
              <div className="group">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-red-600">*</span> Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    aria-label="Nome Completo"
                    aria-required="true"
                    className="block w-full pl-11 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base text-gray-900 placeholder-gray-400 transition-all duration-300 input-focus-glow hover:border-gray-400"
                    placeholder="Ex: João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-red-600">*</span> Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-label="Email"
                    aria-required="true"
                    className="block w-full pl-11 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base text-gray-900 placeholder-gray-400 transition-all duration-300 input-focus-glow hover:border-gray-400"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-red-600">*</span> Senha (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    aria-label="Senha. Mínimo 6 caracteres."
                    aria-required="true"
                    className="block w-full pl-11 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base text-gray-900 placeholder-gray-400 transition-all duration-300 input-focus-glow hover:border-gray-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-red-600">*</span> Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    aria-label="Confirmar Senha"
                    aria-required="true"
                    className="block w-full pl-11 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base text-gray-900 placeholder-gray-400 transition-all duration-300 input-focus-glow hover:border-gray-400"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl button-press"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 inline-block">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </form>
        </div>
  );
}
