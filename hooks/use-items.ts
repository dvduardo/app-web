"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export interface ItemSummary {
  id: string;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  title: string;
  description: string | null;
  status: string;
  isFavorite: boolean;
  customData: string;
  photos: Array<{
    id: string;
    data: string;
    mimeType: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCollectionStats {
  totalItems: number;
  favoriteItems: number;
  wishlistItems: number;
  ownedItems: number;
  loanedItems: number;
}

export interface ItemsPage {
  items: ItemSummary[];
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
  search: string;
  categoryId: string;
  status: string;
  favoritesOnly: boolean;
  stats: ItemCollectionStats;
}

async function fetchItems(
  page: number,
  limit: number,
  search: string,
  categoryId: string,
  status: string,
  favoritesOnly: boolean
): Promise<ItemsPage> {
  const response = await apiClient.get("/items", {
    params: { page, limit, search, categoryId, status, favoritesOnly },
  });
  return response.data;
}

async function deleteItem(itemId: string): Promise<void> {
  await apiClient.delete(`/items/${itemId}`);
}

async function updateItem(
  itemId: string,
  data: { isFavorite?: boolean; status?: string }
): Promise<void> {
  await apiClient.put(`/items/${itemId}`, data);
}

export function useItems(
  page = 1,
  limit = 12,
  search = "",
  categoryId = "",
  status = "",
  favoritesOnly = false
) {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: queryKeys.items.list({
      page,
      limit,
      search,
      categoryId,
      status,
      favoritesOnly,
    }),
    queryFn: () => fetchItems(page, limit, search, categoryId, status, favoritesOnly),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: { isFavorite?: boolean; status?: string } }) =>
      updateItem(itemId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });

  return {
    items: itemsQuery.data?.items ?? [],
    totalCount: itemsQuery.data?.totalCount ?? 0,
    totalPages: itemsQuery.data?.totalPages ?? 1,
    page: itemsQuery.data?.page ?? page,
    limit: itemsQuery.data?.limit ?? limit,
    search: itemsQuery.data?.search ?? search,
    categoryId: itemsQuery.data?.categoryId ?? categoryId,
    status: itemsQuery.data?.status ?? status,
    favoritesOnly: itemsQuery.data?.favoritesOnly ?? favoritesOnly,
    stats: itemsQuery.data?.stats ?? {
      totalItems: 0,
      favoriteItems: 0,
      wishlistItems: 0,
      ownedItems: 0,
      loanedItems: 0,
    },
    isLoading: itemsQuery.isLoading,
    error: itemsQuery.error,
    refetch: itemsQuery.refetch,
    deleteItem: deleteMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
