"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardContent } from "@/app/components/items/dashboard-content";
import { LogOut, BookOpen, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading, mounted, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen animated-gradient relative overflow-hidden">
      <div className="absolute left-[-4rem] top-12 h-56 w-56 rounded-full bg-purple-500/30 blur-3xl float-animation" />
      <div className="animation-delay-2s absolute bottom-10 right-[-3rem] h-64 w-64 rounded-full bg-blue-500/30 blur-3xl float-animation" />
      <div className="animation-delay-4s absolute left-1/3 top-1/2 h-52 w-52 rounded-full bg-pink-500/20 blur-3xl float-animation" />

      <header className="sticky top-0 z-30 border-b border-white/15 bg-slate-950/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">
                <Sparkles className="h-3.5 w-3.5" />
                coleção mobile
              </div>
              <h1 className="truncate text-lg font-semibold text-white sm:text-2xl">
                Minhas Coleções
              </h1>
              <p className="truncate text-sm text-white/75">
                Bem-vindo, <span className="font-semibold">{user.name.split(" ")[0]}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-white/15"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        <DashboardContent />
      </main>
    </div>
  );
}
