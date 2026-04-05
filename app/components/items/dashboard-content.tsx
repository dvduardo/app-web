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
  Heart,
  Clock3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ItemCard } from "./item-card";
import { getErrorMessage } from "@/lib/get-error-message";
import { useItems } from "@/hooks/use-items";
import { useCategories } from "@/hooks/use-categories";
import { getCategoryTheme } from "@/lib/category-theme";
import { getItemStatusMeta, itemStatusOptions } from "@/lib/item-status";

const ITEMS_PER_PAGE = 12;

export function DashboardContent({ userName }: { userName: string }) {
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
  const firstName = userName.trim().split(" ")[0] ?? userName;
  const featuredItem =
    items.find((item) => item.isFavorite) ??
    items.find((item) => item.photos.length > 0) ??
    items[0];
  const featuredCategoryTheme = getCategoryTheme(featuredItem?.category?.name);
  const featuredStatus = featuredItem ? getItemStatusMeta(featuredItem.status) : null;

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
      <section className="vault-app-panel relative overflow-hidden rounded-[2rem] px-5 py-5 text-white sm:px-8 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.22),transparent_30%),radial-gradient(circle_at_left,rgba(59,130,246,0.18),transparent_28%)]" />
        <div className="relative flex flex-col gap-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="rounded-[1.9rem] border border-white/8 bg-black/18 p-4 sm:p-5">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/18 bg-indigo-400/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-100">
                      <Sparkles className="h-3.5 w-3.5" />
                      Dashboard da coleção
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-4xl">
                      Bem-vindo, {firstName}. Seu acervo fica em foco logo no topo.
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                      A visão web agora mistura contexto, ações principais e destaque visual para reduzir o espaço vazio antes da grade de itens.
                    </p>
                  </div>

                  <div className="hidden min-w-[13rem] rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 text-right lg:block">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Resumo atual
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {totalItems} item{totalItems === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {visibleCategories.length} categorias ativas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-[24rem] xl:grid-cols-4">
                  <div className="vault-app-subpanel rounded-3xl p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Itens
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">{totalItems}</p>
                  </div>
                  <div className="vault-app-subpanel rounded-3xl p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Categorias
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-indigo-300">
                      {visibleCategories.length}
                    </p>
                  </div>
                  <div className="vault-app-subpanel rounded-3xl p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Favoritos
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-rose-400">{stats.favoriteItems}</p>
                  </div>
                  <div className="vault-app-subpanel rounded-3xl p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Wishlist
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-400">{stats.wishlistItems}</p>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[1.75rem] border border-white/8 bg-[#0a0a14]/75 p-3 backdrop-blur sm:grid-cols-[1.4fr_auto] sm:items-center sm:p-4">
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
                      className="vault-app-input w-full rounded-2xl px-4 py-3 pl-11 text-base outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <div
                      className="col-span-2 flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 p-1 sm:col-span-1"
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
                            ? "bg-white/92 text-slate-900 shadow-sm"
                            : "text-slate-400 hover:text-white"
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
                            ? "bg-white/92 text-slate-900 shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <List className="h-4 w-4" />
                        Lista
                      </button>
                    </div>

                    <Link
                      href="/dashboard/new"
                      className="vault-button-primary hidden items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] sm:inline-flex"
                    >
                      <Plus className="h-4 w-4" /> Novo
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <aside className="hidden gap-4 xl:grid">
              <article className="relative overflow-hidden rounded-[1.9rem] border border-indigo-300/18 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#581c87] p-5 shadow-[0_24px_50px_rgba(15,23,42,0.35)]">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.06),rgba(2,6,23,0.82))]" />
                <div className="relative flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100/85">
                  <span>{featuredItem ? "Destaque da coleção" : "Espaço de destaque"}</span>
                  <Heart className={`h-4 w-4 ${featuredItem?.isFavorite ? "fill-rose-400 text-rose-400" : "text-indigo-100/80"}`} />
                </div>

                <div className="relative mt-8 flex min-h-32 items-center justify-center text-7xl">
                  {featuredItem ? (featuredItem.category?.name?.slice(0, 2).toUpperCase() ?? "IT") : "★"}
                </div>

                <div className="relative mt-8 rounded-[1.5rem] border border-white/10 bg-black/22 p-4 backdrop-blur">
                  <div className="flex flex-wrap gap-2">
                    {featuredItem && (
                      <>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${featuredCategoryTheme.badge}`}
                        >
                          {featuredItem.category?.name ?? "Sem categoria"}
                        </span>
                        {featuredStatus && (
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${featuredStatus.badgeClassName}`}
                          >
                            {featuredStatus.shortLabel}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <p className="mt-4 font-display text-2xl font-semibold tracking-[-0.04em] text-white">
                    {featuredItem ? featuredItem.title : "Escolha um item favorito"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200/78">
                    {featuredItem?.description
                      ? featuredItem.description
                      : "Use este espaço para destacar um item favorito ou recente e dar mais presença ao topo do dashboard na visão web."}
                  </p>
                </div>
              </article>

              <div className="grid grid-cols-2 gap-4">
                <article className="vault-app-subpanel rounded-[1.6rem] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Últimos filtros
                  </p>
                  <p className="mt-3 font-display text-xl font-semibold tracking-[-0.04em] text-white">
                    {favoritesOnly ? "Favoritos" : selectedStatus ? "Status ativo" : "Visão geral"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {favoritesOnly
                      ? "Você está focando apenas nos itens favoritos."
                      : selectedStatus
                        ? `Filtro por ${itemStatusOptions.find((option) => option.value === selectedStatus)?.label?.toLowerCase() ?? "status"}.`
                        : "Sem filtros de status ativos no momento."}
                  </p>
                </article>

                <article className="vault-app-subpanel rounded-[1.6rem] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Organização
                  </p>
                  <p className="mt-3 font-display text-xl font-semibold tracking-[-0.04em] text-white">
                    {viewMode === "grid" ? "Grade ativa" : "Lista ativa"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Alterne entre densidade visual e leitura rápida sem perder o contexto da coleção.
                  </p>
                </article>
              </div>
            </aside>
          </div>

        </div>
      </section>

      <section className="vault-app-panel rounded-[2rem] p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-400">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros rápidos
        </div>

        <div className="flex snap-x gap-2 overflow-x-auto pb-1 mobile-scrollbar">
            <button
              type="button"
              data-active={effectiveCategoryId === ""}
              onClick={() => handleCategoryChange("")}
              className="vault-app-chip shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors"
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
                  className={`vault-app-chip shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${effectiveCategoryId === category.id ? theme.chip : ""}`}
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
              className="vault-app-chip shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              Todos os status
            </button>
            {itemStatusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                data-active={selectedStatus === option.value}
                onClick={() => handleStatusChange(option.value)}
                className="vault-app-chip shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors"
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
                ? "border-rose-400/25 bg-rose-500/10 text-rose-300"
                : "border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
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
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-red-200">{displayedError}</p>
        </div>
      )}

      {isLoading ? (
        <div className="vault-app-panel rounded-[2rem] py-14 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-400"></div>
          <p className="mt-4 text-slate-400">Carregando itens...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="vault-app-panel rounded-[2rem] border-dashed px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.04] text-slate-500">
            <FolderOpen className="h-7 w-7" />
          </div>
          <p className="text-lg font-medium text-slate-200">
            {search || effectiveCategoryId || selectedStatus || favoritesOnly
              ? "Nenhum item encontrado com os filtros atuais"
              : "Nenhum item ainda"}
          </p>
          {!search && !effectiveCategoryId && !selectedStatus && !favoritesOnly && (
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
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-slate-300 transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
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
                  ? "border-indigo-400/30 bg-indigo-500/14 text-indigo-100"
                  : "border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            aria-label="Próxima página"
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-slate-300 transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0d0d1f]/82 px-4 py-3 shadow-[0_-18px_50px_-30px_rgba(15,23,42,0.65)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          <button
            type="button"
            onClick={toggleFavoritesOnly}
            className={`inline-flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium ${
              favoritesOnly ? "bg-rose-500 text-white" : "bg-white/6 text-white"
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
            className="vault-button-primary inline-flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Novo item
          </Link>
          <button
            type="button"
            onClick={() => handleStatusChange(selectedStatus === "wishlist" ? "" : "wishlist")}
            className={`inline-flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium ${
              selectedStatus === "wishlist" ? "bg-amber-400 text-slate-950" : "bg-white/6 text-white"
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
