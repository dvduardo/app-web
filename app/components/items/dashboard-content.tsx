"use client";

import { useDeferredValue, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  SlidersHorizontal,
  FolderOpen,
  Package2,
  Heart,
  Clock3,
} from "lucide-react";
import Link from "next/link";
import { ItemCard } from "./item-card";
import { getErrorMessage } from "@/lib/get-error-message";
import { useItems } from "@/hooks/use-items";
import { useCategories } from "@/hooks/use-categories";
import { getCategoryTheme } from "@/lib/category-theme";
import { itemStatusOptions } from "@/lib/item-status";

const ITEMS_PER_PAGE = 12;

export function DashboardContent() {
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const { categories, refetch: refetchCategories } = useCategories();
  const hasActiveCategory = categories.some(
    (category) => category.id === selectedCategoryId && category.itemCount > 0
  );
  const effectiveCategoryId = hasActiveCategory ? selectedCategoryId : "";
  const {
    items,
    isLoading,
    error: queryError,
    deleteItem,
    updateItem,
    totalPages,
    stats,
  } = useItems(
    page,
    ITEMS_PER_PAGE,
    deferredSearch.trim(),
    effectiveCategoryId,
    selectedStatus,
    favoritesOnly
  );
  const visibleCategories = categories.filter(
    (category) => category.itemCount > 0
  );
  const totalItems = stats.totalItems;

  const queryErrorMessage = queryError
    ? getErrorMessage(queryError, "Erro ao carregar itens")
    : "";
  const displayedError = error || queryErrorMessage;

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const toggleFavoritesOnly = () => {
    setFavoritesOnly((currentValue) => !currentValue);
    setPage(1);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Tem certeza que deseja deletar este item?")) return;

    try {
      await deleteItem(itemId);
      await refetchCategories();
      toast.success("Item deletado com sucesso!");
      // If last item on page and not first page, go back one page
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, "Erro ao deletar item");
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleToggleFavorite = async (itemId: string, nextValue: boolean) => {
    try {
      await updateItem({ itemId, data: { isFavorite: nextValue } });
      setError("");
      toast.success(nextValue ? "Favorito salvo" : "Favorito removido");
    } catch (updateError: unknown) {
      const errorMsg = getErrorMessage(updateError, "Erro ao atualizar favorito");
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 px-5 py-5 text-white shadow-2xl backdrop-blur-xl sm:px-8 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.28),transparent_30%),radial-gradient(circle_at_left,rgba(59,130,246,0.24),transparent_28%)]" />
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                <Package2 className="h-3.5 w-3.5" />
                Biblioteca pessoal em qualquer tela
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                Um dashboard com cara de app para navegar sua coleção no mobile.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Busca, filtros e ações principais ficaram mais acessíveis no celular,
                sem perder a visão ampla no desktop.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[24rem]">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                  Itens
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">{totalItems}</p>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                  Categorias
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {visibleCategories.length}
                </p>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                  Favoritos
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">{stats.favoriteItems}</p>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                  Wishlist
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">{stats.wishlistItems}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-white/20 bg-slate-950/20 p-3 backdrop-blur sm:grid-cols-[1.4fr_auto] sm:items-center sm:p-4">
            <div className="relative">
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
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/95 px-4 py-3 pl-11 text-base text-slate-900 shadow-inner shadow-slate-200/70 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <div
                className="col-span-2 flex items-center justify-between rounded-2xl border border-white/20 bg-slate-950/35 p-1 sm:col-span-1"
                role="group"
                aria-label="Modo de visualização"
              >
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-pressed={viewMode === "grid"}
                  aria-label="Exibir em grade"
                  title="Exibir em grade"
                  className={`flex flex-1 items-center justify-center gap-2 rounded-[1rem] px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Grade
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  aria-label="Exibir em lista"
                  title="Exibir em lista"
                  className={`flex flex-1 items-center justify-center gap-2 rounded-[1rem] px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <List className="h-4 w-4" />
                  Lista
                </button>
              </div>

              <Link
                href="/dashboard/new"
                className="items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:from-blue-700 hover:to-purple-700 hidden sm:inline-flex"
              >
                <Plus className="h-4 w-4" /> Novo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/25 bg-white/80 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros rápidos
        </div>

        <div className="flex snap-x gap-2 overflow-x-auto pb-1 mobile-scrollbar">
            <button
              type="button"
              data-active={effectiveCategoryId === ""}
              onClick={() => handleCategoryChange("")}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors data-[active=true]:border-slate-900 data-[active=true]:bg-slate-900 data-[active=true]:text-white"
            >
              Todas
            </button>
            {visibleCategories.map((category) => {
              const theme = getCategoryTheme(category.name);

              return (
                <button
                  key={category.id}
                  type="button"
                  data-active={effectiveCategoryId === category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors ${theme.chip}`}
                >
                  {category.name} ({category.itemCount})
                </button>
              );
            })}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex snap-x gap-2 overflow-x-auto pb-1 mobile-scrollbar">
            <button
              type="button"
              data-active={selectedStatus === ""}
              onClick={() => handleStatusChange("")}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors data-[active=true]:border-slate-900 data-[active=true]:bg-slate-900 data-[active=true]:text-white"
            >
              Todos os status
            </button>
            {itemStatusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                data-active={selectedStatus === option.value}
                onClick={() => handleStatusChange(option.value)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors data-[active=true]:border-slate-900 data-[active=true]:bg-slate-900 data-[active=true]:text-white"
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleFavoritesOnly}
            aria-pressed={favoritesOnly}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              favoritesOnly
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Heart
              className={`h-4 w-4 transition ${
                favoritesOnly
                  ? "fill-rose-500 text-rose-600"
                  : "text-current"
              }`}
            />
            Somente favoritos
          </button>
        </div>
      </section>

      {displayedError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{displayedError}</p>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 py-14 text-center shadow-[0_22px_55px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Carregando itens...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/75 px-6 py-14 text-center backdrop-blur">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
            <FolderOpen className="h-7 w-7" />
          </div>
          <p className="text-lg font-medium text-slate-700">
            {search || effectiveCategoryId || selectedStatus || favoritesOnly
              ? "Nenhum item encontrado com os filtros atuais"
              : "Nenhum item ainda"}
          </p>
          {!search && !effectiveCategoryId && !selectedStatus && !favoritesOnly && (
            <Link
              href="/dashboard/new"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Criar seu primeiro item
            </Link>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            aria-label="Página anterior"
            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              disabled={isLoading}
              aria-label={`Página ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={`h-11 w-11 rounded-2xl border text-sm font-medium transition-colors ${
                p === page
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            aria-label="Próxima página"
            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/20 bg-slate-950/70 px-4 py-3 shadow-[0_-18px_50px_-30px_rgba(15,23,42,0.65)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          <button
            type="button"
            onClick={toggleFavoritesOnly}
            className={`inline-flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium ${
              favoritesOnly ? "bg-rose-500 text-white" : "bg-white/10 text-white"
            }`}
          >
            <Heart
              className={`h-4 w-4 transition ${
                favoritesOnly
                  ? "fill-white text-white"
                  : "text-current"
              }`}
            />
            Favoritos
          </button>
          <Link
            href="/dashboard/new"
            className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Novo item
          </Link>
          <button
            type="button"
            onClick={() => handleStatusChange(selectedStatus === "wishlist" ? "" : "wishlist")}
            className={`inline-flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium ${
              selectedStatus === "wishlist" ? "bg-amber-400 text-slate-950" : "bg-white/10 text-white"
            }`}
          >
            <Clock3 className="h-4 w-4" />
            Desejos
          </button>
        </div>
      </div>
    </div>
  );
}
