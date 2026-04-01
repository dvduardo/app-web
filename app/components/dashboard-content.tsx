"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Download, Upload, Search } from "lucide-react";
import { apiClient } from "@/app/lib/api-client";
import Link from "next/link";
import { ItemCard } from "./item-card";

interface Item {
  id: string;
  title: string;
  description: string | null;
  customData: string;
  photos: Array<{
    id: string;
    data: string;
    mimeType: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export function DashboardContent({ userId }: { userId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const filtered = items.filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredItems(filtered);
  }, [search, items]);

  const fetchItems = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/items");
      const newItems = response.data.items;
      setItems(newItems);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao carregar itens");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Tem certeza que deseja deletar este item?")) return;

    try {
      await apiClient.delete(`/items/${itemId}`);
      setItems(items.filter((item) => item.id !== itemId));
      toast.success("Item deletado com sucesso!");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Erro ao deletar item";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/items/export");
      const text = await response.text();
      const blob = new Blob([text], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "colecao.json";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Lista exportada com sucesso!");
    } catch (err) {
      const errorMsg = "Erro ao exportar lista";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        const response = await apiClient.post("/items/import", {
          items: data,
        });

        setError("");
        toast.success(response.data.message);
        fetchItems();
      } catch (err) {
        const errorMsg = "Erro ao importar lista";
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
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:flex-1 relative">
            <label htmlFor="search" className="sr-only">Buscar itens</label>
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" aria-hidden="true" />
            <input
              id="search"
              type="text"
              placeholder="Buscar por título ou descrição..."
              aria-label="Buscar itens por título ou descrição"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 placeholder-gray-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
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

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Items Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando itens...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 text-lg">
            {search ? "Nenhum item encontrado" : "Nenhum item ainda"}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
