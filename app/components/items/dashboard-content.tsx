"use client";

import { useDeferredValue, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Download,
  Upload,
  Search,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { ItemCard } from "./item-card";
import { getErrorMessage } from "@/lib/get-error-message";
import { useItems } from "@/hooks/use-items";
import { useCategories } from "@/hooks/use-categories";
import { getCategoryTheme } from "@/lib/category-theme";

const ITEMS_PER_PAGE = 12;

export function DashboardContent() {
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const deferredSearch = useDeferredValue(search);
  const { categories, refetch: refetchCategories } = useCategories();
  const hasActiveCategory = categories.some(
    (category) => category.id === selectedCategoryId && category.itemCount > 0
  );
  const effectiveCategoryId = hasActiveCategory ? selectedCategoryId : "";
  const { items, isLoading, error: queryError, refetch, deleteItem, totalPages } =
    useItems(page, ITEMS_PER_PAGE, deferredSearch.trim(), effectiveCategoryId);
  const visibleCategories = categories.filter(
    (category) => category.itemCount > 0
  );

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

  const handleExport = async () => {
    try {
      const response = await fetch("/api/items/export");
      const text = await response.text();
      const blob = new Blob([text], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "colecao.json";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Lista exportada com sucesso!");
    } catch {
      const errorMsg = "Erro ao exportar lista";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const response = await apiClient.post("/items/import", { items: data });
        setError("");
        toast.success(response.data.message);
        setPage(1);
        await refetchCategories();
        await refetch();
      } catch (error: unknown) {
        const errorMsg = getErrorMessage(error, "Erro ao importar lista");
        setError(errorMsg);
        toast.error(errorMsg);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-active={effectiveCategoryId === ""}
              onClick={() => handleCategoryChange("")}
              className="px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors data-[active=true]:bg-gray-900 data-[active=true]:text-white data-[active=true]:border-gray-900"
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
                  className={`px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors ${theme.chip}`}
                >
                  {category.name} ({category.itemCount})
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:flex-1 relative">
            <label htmlFor="search" className="sr-only">
              Buscar itens
            </label>
            <Search
              className="absolute left-3 top-3 text-gray-400 w-5 h-5"
              aria-hidden="true"
            />
            <input
              id="search"
              type="text"
              placeholder="Buscar por título ou descrição..."
              aria-label="Buscar itens por título ou descrição"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 placeholder-gray-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div
              className="flex items-center rounded-md border border-gray-300 bg-gray-50 p-1"
              role="group"
              aria-label="Modo de visualização"
            >
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                aria-label="Exibir em grade"
                title="Exibir em grade"
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                aria-label="Exibir em lista"
                title="Exibir em lista"
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Link
              href="/dashboard/new"
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Novo
            </Link>
            <button
              onClick={handleExport}
              className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Exportar
            </button>
            <button
              onClick={handleImportClick}
              className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Importar
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Error Message */}
      {displayedError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{displayedError}</p>
        </div>
      )}

      {/* Items Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando itens...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">
            {search || effectiveCategoryId
              ? "Nenhum item encontrado com os filtros atuais"
              : "Nenhum item ainda"}
          </p>
          {!search && (
            <Link
              href="/dashboard/new"
              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Criar seu primeiro item
            </Link>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            aria-label="Página anterior"
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              className={`w-9 h-9 rounded-md text-sm font-medium border transition-colors ${
                p === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            aria-label="Próxima página"
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
