"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCustomFields } from "@/hooks/use-custom-fields";
import { ItemForm } from "@/app/components/items/item-form";
import type { ItemFormInput } from "@/lib/schemas/item";
import type { UploadablePhoto } from "@/lib/photo-upload";

interface ItemResponse {
  id: string;
  title: string;
  description: string | null;
  customData: string;
  photos: UploadablePhoto[];
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
  const { customFields, addCustomField, removeCustomField } = useCustomFields(Boolean(user));

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

  if (!mounted || authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !item) {
    return null;
  }

  let defaultCustomData: Record<string, string> = {};
  try {
    defaultCustomData = JSON.parse(item.customData || "{}");
  } catch {
    defaultCustomData = {};
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <ItemForm
          title="Editar Item"
          submitLabel="Salvar"
          savingLabel="Salvando..."
          error={error}
          isSaving={isSaving}
          defaultValues={{
            title: item.title,
            description: item.description ?? "",
            customData: defaultCustomData,
          }}
          initialPhotos={item.photos}
          customFields={customFields}
          onSubmit={handleSubmit}
          onAddCustomField={async (fieldName, fieldType) => {
            try {
              setError("");
              await addCustomField({ fieldName, fieldType });
            } catch (submitError: unknown) {
              const message = getErrorMessage(submitError, "Erro ao criar campo");
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
