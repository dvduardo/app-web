"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCategories } from "@/hooks/use-categories";
import { ItemForm } from "@/app/components/items/item-form";
import type { ItemFormInput } from "@/lib/schemas/item";
import type { UploadablePhoto } from "@/lib/photo-upload";
import type { CustomField } from "@/hooks/use-custom-fields";

function createLocalCustomField(fieldName: string, fieldType: string): CustomField {
  return {
    id: `local-${fieldName}-${Date.now()}`,
    fieldName,
    fieldType,
  };
}

export default function NewItemPage() {
  const { user, isLoading, mounted } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const { categories, createCategory } = useCategories(Boolean(user));

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (!mounted || isLoading) {
    return (
      <div className="vault-app-shell flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Carregando...</p>
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
    <div className="vault-app-shell py-4 sm:py-8">
      <div className="vault-orb vault-orb-1" />
      <div className="vault-orb vault-orb-2" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
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
              const normalizedFieldName = fieldName.trim();
              if (
                customFields.some(
                  (field) =>
                    field.fieldName.toLowerCase() === normalizedFieldName.toLowerCase()
                )
              ) {
                throw new Error("Esse campo já foi adicionado neste item");
              }

              setCustomFields((currentFields) => [
                ...currentFields,
                createLocalCustomField(normalizedFieldName, fieldType),
              ]);
            } catch (submitError: unknown) {
              const message = getErrorMessage(submitError, "Erro ao adicionar campo");
              setError(message);
              throw new Error(message);
            }
          }}
          onRemoveCustomField={async (fieldId, fieldName) => {
            try {
              setError("");
              setCustomFields((currentFields) =>
                currentFields.filter((field) => field.id !== fieldId)
              );
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
