"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardContent } from "@/app/components/items/dashboard-content";
import { ChangePasswordModal } from "@/app/components/ui/change-password-modal";
import { InstallBanner } from "@/app/components/ui/install-banner";
import Image from "next/image";
import { LogOut, KeyRound } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading, mounted, logout } = useAuth();
  const router = useRouter();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
      <div className="vault-app-shell flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="vault-app-shell">
      <div className="vault-orb vault-orb-1" />
      <div className="vault-orb vault-orb-2" />
      <div className="vault-orb vault-orb-3" />

      <header className="sticky top-0 z-30 border-b border-indigo-400/10 bg-[#0d0d1f]/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl overflow-hidden shadow-[0_0_24px_rgba(99,102,241,0.32)]">
              <Image src="/icons/icon-192.png" alt="Minhas Coleções" width={48} height={48} className="h-12 w-12 object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display truncate text-lg font-semibold tracking-[-0.03em] text-slate-50 sm:text-2xl">
                Minhas Coleções
              </h1>
              <p className="truncate text-sm text-slate-400">
                Bem-vindo, <span className="font-semibold text-slate-200">{user.name.split(" ")[0]}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/8 px-3 text-sm font-medium text-indigo-200 shadow-sm transition hover:bg-indigo-500/12"
              title={user.hasPassword ? "Alterar senha" : "Definir senha"}
            >
              <KeyRound className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{user.hasPassword ? "Alterar senha" : "Definir senha"}</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/8 px-3 text-sm font-medium text-indigo-200 shadow-sm transition hover:bg-indigo-500/12"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-32 pt-5 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8">
        <DashboardContent userName={user.name} />
      </main>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <InstallBanner />
    </div>
  );
}
