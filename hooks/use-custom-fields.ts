"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export interface CustomField {
  id: string;
  fieldName: string;
  fieldType: string;
}

async function fetchCustomFields(): Promise<CustomField[]> {
  const response = await apiClient.get("/custom-fields");
  return response.data.customFields ?? [];
}

async function createCustomField(input: {
  fieldName: string;
  fieldType: string;
}): Promise<CustomField> {
  const response = await apiClient.post("/custom-fields", input);
  return response.data.customField;
}

async function deleteCustomField(fieldId: string): Promise<void> {
  await apiClient.delete("/custom-fields", {
    data: { fieldId },
  });
}

export function useCustomFields(enabled = true) {
  const queryClient = useQueryClient();

  const customFieldsQuery = useQuery({
    queryKey: queryKeys.customFields.all(),
    queryFn: fetchCustomFields,
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: createCustomField,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.customFields.all() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomField,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.customFields.all() });
    },
  });

  return {
    customFields: customFieldsQuery.data ?? [],
    isLoading: customFieldsQuery.isLoading,
    error: customFieldsQuery.error,
    addCustomField: createMutation.mutateAsync,
    removeCustomField: deleteMutation.mutateAsync,
    refetch: customFieldsQuery.refetch,
  };
}
