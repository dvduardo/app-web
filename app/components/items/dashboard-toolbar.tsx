"use client";

import { Search, LayoutGrid, List, Plus } from "lucide-react";
import Link from "next/link";
import type { ViewMode } from "@/hooks/use-dashboard-filters";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function DashboardToolbar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      {/* Search — id="search" kept to avoid breaking existing e2e tests */}
      <div className="relative flex-1">
        <label htmlFor="search" className="sr-only">
          Buscar itens
        </label>
        <Search
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          id="search"
          type="text"
          placeholder="Buscar por título ou descrição..."
          aria-label="Buscar itens por título ou descrição"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="vault-app-input w-full rounded-2xl px-4 py-3 pl-11 text-base outline-none transition"
        />
      </div>

      {/* View mode toggle */}
      <div
        className="flex items-center rounded-2xl border border-white/8 bg-black/20 p-1"
        role="group"
        aria-label="Modo de visualização"
      >
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          aria-pressed={viewMode === "grid"}
          aria-label="Exibir em grade"
          title="Grade"
          className={`flex items-center justify-center gap-2 rounded-[1rem] px-3 py-2 text-sm font-medium transition-colors ${
            viewMode === "grid"
              ? "bg-white/92 text-slate-900 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">Grade</span>
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          aria-pressed={viewMode === "list"}
          aria-label="Exibir em lista"
          title="Lista"
          className={`flex items-center justify-center gap-2 rounded-[1rem] px-3 py-2 text-sm font-medium transition-colors ${
            viewMode === "list"
              ? "bg-white/92 text-slate-900 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Lista</span>
        </button>
      </div>

      {/* New item button — desktop; mobile uses bottom nav */}
      <Link
        href="/dashboard/new"
        className="vault-button-primary hidden items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] sm:inline-flex"
      >
        <Plus className="h-4 w-4" />
        Novo
      </Link>
    </div>
  );
}
