"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export interface ItemSummary {
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

export interface ItemsPage {
  items: ItemSummary[];
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
  search: string;
}

async function fetchItems(
  page: number,
  limit: number,
  search: string
): Promise<ItemsPage> {
  const response = await apiClient.get("/items", { params: { page, limit, search } });
  return response.data;
}

async function deleteItem(itemId: string): Promise<void> {
  await apiClient.delete(`/items/${itemId}`);
}

export function useItems(page = 1, limit = 12, search = "") {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: queryKeys.items.list({ page, limit, search }),
    queryFn: () => fetchItems(page, limit, search),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all() });
    },
  });

  return {
    items: itemsQuery.data?.items ?? [],
    totalCount: itemsQuery.data?.totalCount ?? 0,
    totalPages: itemsQuery.data?.totalPages ?? 1,
    page: itemsQuery.data?.page ?? page,
    limit: itemsQuery.data?.limit ?? limit,
    search: itemsQuery.data?.search ?? search,
    isLoading: itemsQuery.isLoading,
    error: itemsQuery.error,
    refetch: itemsQuery.refetch,
    deleteItem: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
