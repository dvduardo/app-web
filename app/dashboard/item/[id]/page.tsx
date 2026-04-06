"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCategories } from "@/hooks/use-categories";
import { ItemForm } from "@/app/components/items/item-form";
import type { ItemFormInput } from "@/lib/schemas/item";
import type { UploadablePhoto } from "@/lib/photo-upload";
import type { CustomField } from "@/hooks/use-custom-fields";

interface ItemResponse {
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
  photos: UploadablePhoto[];
}

function createLocalCustomField(fieldName: string, fieldType = "text"): CustomField {
  return {
    id: `local-${fieldName}`,
    fieldName,
    fieldType,
  };
}

export default function ItemPage() {
  const params = useParams();
  const itemId = params.id as string;
  const router = useRouter();
  const { user, isLoading: authLoading, mounted } = useAuth();
  const [item, setItem] = useState<ItemResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const { categories, createCategory } = useCategories(Boolean(user));

  const fetchItem = useCallback(async () => {
    try {
      const response = await apiClient.get(`/items/${itemId}`);
      setItem(response.data.item);
    } catch (fetchError: unknown) {
      setError(getErrorMessage(fetchError, "Erro ao carregar item"));
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      void fetchItem();
    }
  }, [authLoading, fetchItem, router, user]);

  const defaultCustomData = useMemo(() => {
    try {
      return JSON.parse(item?.customData || "{}") as Record<string, string>;
    } catch {
      return {};
    }
  }, [item?.customData]);

  const initialCustomFields = useMemo(
    () =>
      Object.keys(defaultCustomData).map((fieldName) =>
        createLocalCustomField(fieldName)
      ),
    [defaultCustomData]
  );

  useEffect(() => {
    setCustomFields(initialCustomFields);
  }, [initialCustomFields]);

  if (!mounted || authLoading || isLoading) {
    return (
      <div className="vault-app-shell flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !item) {
    return null;
  }

  const handleSubmit = async (values: ItemFormInput, photos: UploadablePhoto[]) => {
    setIsSaving(true);
    setError("");

    try {
      await apiClient.put(`/items/${itemId}`, values);

      const existingPhotoIds = new Set(
        photos.filter((photo) => photo.id).map((photo) => photo.id as string)
      );

      for (const currentPhoto of item.photos) {
        if (currentPhoto.id && !existingPhotoIds.has(currentPhoto.id)) {
          await apiClient.delete(`/items/${itemId}/photos/${currentPhoto.id}`);
        }
      }

      for (const photo of photos) {
        if (!photo.file) {
          continue;
        }

        const formData = new FormData();
        formData.append("photo", photo.file);
        await apiClient.post(`/items/${itemId}/photos`, formData);
      }

      router.push("/dashboard");
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError, "Erro ao salvar item"));
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
          title="Editar Item"
          submitLabel="Salvar"
          savingLabel="Salvando..."
          error={error}
          isSaving={isSaving}
          defaultValues={{
            categoryId: item.categoryId ?? "",
            title: item.title,
            description: item.description ?? "",
            status: item.status,
            isFavorite: item.isFavorite,
            customData: defaultCustomData,
          }}
          initialPhotos={item.photos}
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
                throw new Error("Esse campo já existe neste item");
              }

              setCustomFields((currentFields) => [
                ...currentFields,
                createLocalCustomField(normalizedFieldName, fieldType),
              ]);
            } catch (submitError: unknown) {
              const message = getErrorMessage(submitError, "Erro ao criar campo");
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
