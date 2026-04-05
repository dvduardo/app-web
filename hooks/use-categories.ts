"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export interface Category {
  id: string;
  name: string;
  itemCount: number;
}

interface CategoriesResponse {
  categories: Category[];
}

async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await apiClient.get("/categories");
  return response.data;
}

async function createCategory(input: { name: string }): Promise<Category> {
  const response = await apiClient.post("/categories", input);
  return response.data.category;
}

export function useCategories(enabled = true) {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: fetchCategories,
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all() });
    },
  });

  return {
    categories: categoriesQuery.data?.categories ?? [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    refetch: categoriesQuery.refetch,
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
