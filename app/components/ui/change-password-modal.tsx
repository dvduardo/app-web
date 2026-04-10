"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Lock, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  changePasswordSchema,
  setPasswordSchema,
  type ChangePasswordInput,
  type SetPasswordInput,
} from "@/lib/schemas/auth";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PasswordInput({
  id,
  placeholder,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          className="vault-app-input w-full rounded-xl px-4 py-2.5 pr-11 text-sm outline-none transition focus:ring-0"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
          tabIndex={-1}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function ChangeForm({ onClose }: { onClose: () => void }) {
  const { changePassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success("Senha alterada com sucesso!");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err) ?? "Erro ao alterar senha.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="currentPassword" className="block text-xs font-medium text-slate-400">
          Senha atual
        </label>
        <PasswordInput
          id="currentPassword"
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="block text-xs font-medium text-slate-400">
          Nova senha
        </label>
        <PasswordInput
          id="newPassword"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <p className="text-xs text-slate-600">Mínimo 6 caracteres</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmNewPassword" className="block text-xs font-medium text-slate-400">
          Confirmar nova senha
        </label>
        <PasswordInput
          id="confirmNewPassword"
          placeholder="••••••••"
          error={errors.confirmNewPassword?.message}
          {...register("confirmNewPassword")}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-white/8 bg-white/4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/8"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-[2] rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : "Salvar nova senha"}
        </button>
      </div>
    </form>
  );
}

function SetForm({ onClose }: { onClose: () => void }) {
  const { changePassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
  });

  const onSubmit = async (data: SetPasswordInput) => {
    try {
      await changePassword(undefined, data.newPassword);
      toast.success("Senha definida com sucesso!");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err) ?? "Erro ao definir senha.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="block text-xs font-medium text-slate-400">
          Nova senha
        </label>
        <PasswordInput
          id="newPassword"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <p className="text-xs text-slate-600">Mínimo 6 caracteres</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmNewPassword" className="block text-xs font-medium text-slate-400">
          Confirmar senha
        </label>
        <PasswordInput
          id="confirmNewPassword"
          placeholder="••••••••"
          error={errors.confirmNewPassword?.message}
          {...register("confirmNewPassword")}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-white/8 bg-white/4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/8"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-[2] rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : "Definir senha"}
        </button>
      </div>
    </form>
  );
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { user } = useAuth();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const hasPassword = user.hasPassword;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(5,8,20,0.72)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="vault-app-panel w-full max-w-md rounded-2xl p-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/12 ring-1 ring-indigo-400/20">
              {hasPassword ? (
                <Lock className="h-5 w-5 text-indigo-400" />
              ) : (
                <KeyRound className="h-5 w-5 text-indigo-400" />
              )}
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-slate-100">
                {hasPassword ? "Alterar senha" : "Definir senha"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {hasPassword
                  ? "Informe sua senha atual e escolha uma nova senha."
                  : "Você entrou via login social. Defina uma senha para também poder entrar com e-mail."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/7 bg-white/3 text-slate-500 transition hover:text-slate-300"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Badge OAuth */}
        {!hasPassword && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <span>🌐</span>
            Conta conectada via login social
          </div>
        )}

        {hasPassword ? <ChangeForm onClose={onClose} /> : <SetForm onClose={onClose} />}
      </div>
    </div>
  );
}
