"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, FolderOpen, Plus } from "lucide-react";
import Link from "next/link";

import { useDashboardFilters } from "@/hooks/use-dashboard-filters";
import { useItems } from "@/hooks/use-items";
import { useCategories } from "@/hooks/use-categories";
import { useOnline } from "@/hooks/use-online";
import { getErrorMessage } from "@/lib/get-error-message";

import { ItemCard } from "./item-card";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardMobileTabs } from "./dashboard-mobile-tabs";
import { DashboardStats } from "./dashboard-stats";
import { DashboardToolbar } from "./dashboard-toolbar";
import { CategoryChips } from "./category-chips";
import { DashboardBottomNav } from "./dashboard-bottom-nav";

const ITEMS_PER_PAGE = 12;

export function DashboardContent({ userName: _ }: { userName: string }) {
  const [error, setError] = useState("");

  const filters = useDashboardFilters();
  const isOnline = useOnline();
  const { categories, refetch: refetchCategories } = useCategories();
  const visibleCategories = categories.filter((c) => c.itemCount > 0);

  const {
    items,
    isLoading,
    error: queryError,
    deleteItem,
    updateItem,
    totalPages,
    stats,
  } = useItems(
    filters.page,
    ITEMS_PER_PAGE,
    filters.deferredSearch.trim(),
    filters.effectiveCategoryId,
    filters.selectedStatus,
    filters.favoritesOnly,
  );

  const displayedError =
    error || (queryError ? getErrorMessage(queryError, "Erro ao carregar itens") : "");

  const handleDelete = async (itemId: string) => {
    if (!isOnline) {
      toast.error("Sem conexão. Exclusão só é permitida com internet.");
      return;
    }
    if (!confirm("Tem certeza que deseja deletar este item?")) return;
    try {
      await deleteItem(itemId);
      await refetchCategories();
      toast.success("Item deletado com sucesso!");
      // If the deleted item was the last one on a non-first page, step back.
      if (items.length === 1 && filters.page > 1) {
        filters.setPage(filters.page - 1);
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Erro ao deletar item");
      setError(msg);
      toast.error(msg);
    }
  };

  const handleToggleFavorite = async (itemId: string, nextValue: boolean) => {
    try {
      await updateItem({ itemId, data: { isFavorite: nextValue } });
      setError("");
      toast.success(nextValue ? "Favorito salvo" : "Favorito removido");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Erro ao atualizar favorito");
      setError(msg);
      toast.error(msg);
    }
  };

  const hasActiveFilter =
    !!filters.search ||
    !!filters.effectiveCategoryId ||
    !!filters.selectedStatus ||
    filters.favoritesOnly;

  return (
    <>
    <div className="space-y-4">
      {/* ── Mobile tabs (hidden on lg+) ── */}
      <DashboardMobileTabs
        activeTab={filters.activeTab}
        onTabChange={filters.activateTab}
      />

      {/* ── Main layout: sidebar + content ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">

        {/* Sidebar — desktop only (hidden below lg) */}
        <DashboardSidebar
          categories={visibleCategories}
          effectiveCategoryId={filters.effectiveCategoryId}
          selectedStatus={filters.selectedStatus}
          favoritesOnly={filters.favoritesOnly}
          onCategoryChange={filters.handleCategoryChange}
          onStatusChange={filters.handleStatusChange}
          onToggleFavorites={filters.toggleFavoritesOnly}
          onToggleWishlist={filters.toggleWishlist}
        />

        {/* Content column */}
        <div className="min-w-0 flex-1 space-y-4">

          {/* Stats row */}
          <DashboardStats stats={stats} />

          {/* Search + view toggle */}
          <DashboardToolbar
            search={filters.search}
            onSearchChange={filters.handleSearchChange}
            viewMode={filters.viewMode}
            onViewModeChange={filters.setViewMode}
          />

          {/* Category chips — mobile/tablet only; sidebar handles desktop */}
          <CategoryChips
            categories={visibleCategories}
            effectiveCategoryId={filters.effectiveCategoryId}
            onCategoryChange={filters.handleCategoryChange}
            className="lg:hidden"
          />

          {/* Error banner */}
          {displayedError && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
              <p className="text-sm font-medium text-red-200">{displayedError}</p>
            </div>
          )}

          {/* Items */}
          {isLoading ? (
            <div className="vault-app-panel rounded-4xl py-14 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-400" />
              <p className="mt-4 text-slate-400">Carregando itens...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="vault-app-panel rounded-4xl border-dashed px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/4 text-slate-500">
                <FolderOpen className="h-7 w-7" />
              </div>
              <p className="text-lg font-medium text-slate-200">
                {hasActiveFilter
                  ? "Nenhum item encontrado com os filtros atuais"
                  : "Nenhum item ainda"}
              </p>
              {!hasActiveFilter && (
                <Link
                  href="/dashboard/new"
                  className="vault-button-primary mt-5 inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-medium text-white transition"
                >
                  <Plus className="h-4 w-4" />
                  Criar seu primeiro item
                </Link>
              )}
            </div>
          ) : (
            <div
              className={
                filters.viewMode === "grid"
                  ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-3"
              }
            >
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  viewMode={filters.viewMode}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => filters.setPage(Math.max(1, filters.page - 1))}
                disabled={filters.page === 1 || isLoading}
                aria-label="Página anterior"
                className="rounded-2xl border border-white/8 bg-white/3 p-3 text-slate-300 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => filters.setPage(p)}
                  disabled={isLoading}
                  aria-label={`Página ${p}`}
                  aria-current={p === filters.page ? "page" : undefined}
                  className={`h-11 w-11 rounded-2xl border text-sm font-medium transition-colors ${
                    p === filters.page
                      ? "border-indigo-400/30 bg-indigo-500/14 text-indigo-100"
                      : "border-white/8 bg-white/3 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => filters.setPage(Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages || isLoading}
                aria-label="Próxima página"
                className="rounded-2xl border border-white/8 bg-white/3 p-3 text-slate-300 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>

    {/* ── Bottom nav — fixed, fora do space-y-4 para não gerar margin fantasma ── */}
    <DashboardBottomNav
      favoritesOnly={filters.favoritesOnly}
      selectedStatus={filters.selectedStatus}
      onToggleFavorites={filters.toggleFavoritesOnly}
      onToggleWishlist={filters.toggleWishlist}
    />
    </>
  );
}
