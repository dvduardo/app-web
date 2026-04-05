"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCustomFields } from "@/hooks/use-custom-fields";
import { useCategories } from "@/hooks/use-categories";
import { ItemForm } from "@/app/components/items/item-form";
import type { ItemFormInput } from "@/lib/schemas/item";
import type { UploadablePhoto } from "@/lib/photo-upload";

export default function NewItemPage() {
  const { user, isLoading, mounted } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { customFields, addCustomField, removeCustomField } = useCustomFields(Boolean(user));
  const { categories, createCategory } = useCategories(Boolean(user));

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (values: ItemFormInput, photos: UploadablePhoto[]) => {
    setIsSaving(true);
    setError("");

    try {
      const itemResponse = await apiClient.post("/items", values);
      const itemId = itemResponse.data.item.id;

      for (const photo of photos) {
        if (!photo.file) {
          continue;
        }

        const formDataPhoto = new FormData();
        formDataPhoto.append("photo", photo.file);
        await apiClient.post(`/items/${itemId}/photos`, formDataPhoto);
      }

      router.push("/dashboard");
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError, "Erro ao criar item"));
      throw submitError;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <ItemForm
          title="Novo Item"
          submitLabel="Salvar Item"
          savingLabel="Salvando..."
          error={error}
          isSaving={isSaving}
          customFields={customFields}
          categories={categories}
          onSubmit={handleSubmit}
          onCreateCategory={async (categoryName) => {
            try {
              setError("");
              return await createCategory({ name: categoryName });
            } catch (submitError: unknown) {
              const message = getErrorMessage(submitError, "Erro ao criar categoria");
              setError(message);
              throw new Error(message);
            }
          }}
          onAddCustomField={async (fieldName, fieldType) => {
            try {
              setError("");
              await addCustomField({ fieldName, fieldType });
            } catch (submitError: unknown) {
              const message = getErrorMessage(submitError, "Erro ao adicionar campo");
              setError(message);
              throw new Error(message);
            }
          }}
          onRemoveCustomField={async (fieldId, fieldName) => {
            try {
              setError("");
              await removeCustomField(fieldId);
            } catch (submitError: unknown) {
              const message = getErrorMessage(
                submitError,
                `Erro ao remover o campo "${fieldName}"`
              );
              setError(message);
              throw new Error(message);
            }
          }}
        />
      </div>
    </div>
  );
}
