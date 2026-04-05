"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

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

const ITEMS_QUERY_KEY = ["items"];

async function fetchItems(): Promise<ItemSummary[]> {
  const response = await apiClient.get("/items");
  return response.data.items;
}

async function deleteItem(itemId: string): Promise<void> {
  await apiClient.delete(`/items/${itemId}`);
}

export function useItems() {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: fetchItems,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    },
  });

  return {
    items: itemsQuery.data ?? [],
    isLoading: itemsQuery.isLoading,
    error: itemsQuery.error,
    refetch: itemsQuery.refetch,
    deleteItem: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
