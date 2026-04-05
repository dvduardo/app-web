"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { getPhotoSrc } from "@/lib/photo-helper";
import { ImageGalleryModal } from "@/app/components/image-gallery-modal";
import Link from "next/link";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCustomFields } from "@/hooks/use-custom-fields";

export default function ItemPage() {
  const params = useParams();
  const itemId = params.id as string;
  const isNew = itemId === "new";
  const router = useRouter();
  const { user, isLoading: authLoading, mounted } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customData, setCustomData] = useState<Record<string, string>>({});
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [photos, setPhotos] = useState<Array<{
    id?: string;
    data?: string;
    mimeType?: string;
    file?: File;
  }>>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const { customFields, addCustomField, removeCustomField } = useCustomFields(
    Boolean(user)
  );

  const fetchItem = useCallback(async () => {
    try {
      const response = await apiClient.get(`/items/${itemId}`);
      const itemData = response.data.item;
      setTitle(itemData.title);
      setDescription(itemData.description || "");
      setPhotos(itemData.photos || []);
      
      // Parse custom data
      try {
        const parsedData = JSON.parse(itemData.customData || "{}");
        setCustomData(parsedData);
      } catch {
        setCustomData({});
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao carregar item"));
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (!isNew) {
      void fetchItem();
    }
  }, [authLoading, fetchItem, isNew, router, user]);

  const handleAddField = async () => {
    if (!newFieldName.trim()) {
      setError("Nome do campo é obrigatório");
      return;
    }

    try {
      await addCustomField({
        fieldName: newFieldName,
        fieldType: newFieldType,
      });
      setNewFieldName("");
      setNewFieldType("text");
      setCustomData({
        ...customData,
        [newFieldName]: "",
      });
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao criar campo"));
    }
  };

  const handleRemoveField = async (fieldId: string, fieldName: string) => {
    if (!confirm(`Deseja remover o campo "${fieldName}"?`)) {
      return;
    }

    try {
      await removeCustomField(fieldId);
      const newCustomData = { ...customData };
      delete newCustomData[fieldName];
      setCustomData(newCustomData);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao remover campo"));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > 2) {
      setError("Máximo de 2 fotos permitidas");
      return;
    }

    setPhotos((currentPhotos) => [
      ...currentPhotos,
      ...Array.from(files).map((file) => ({
        file,
        mimeType: file.type,
      })),
    ]);
  };

  const handleRemovePhoto = async (photoId: string) => {
    if (isNew) {
      setPhotos(photos.filter((p) => p.id !== photoId));
      return;
    }

    try {
      await apiClient.delete(`/items/${itemId}/photos/${photoId}`);
      setPhotos(photos.filter((p) => p.id !== photoId));
    } catch {
      setError("Erro ao remover foto");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Título é obrigatório");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      if (isNew) {
        const response = await apiClient.post("/items", {
          title,
          description,
          customData,
        });

        // Upload photos
        for (const photo of photos) {
          if (photo.file) {
            const formData = new FormData();
            formData.append("photo", photo.file);
            await apiClient.post(
              `/items/${response.data.item.id}/photos`,
              formData
            );
          }
        }

        router.push("/dashboard");
      } else {
        await apiClient.put(`/items/${itemId}`, {
          title,
          description,
          customData,
        });

        // Upload new photos
        for (const photo of photos) {
          if (photo.file) {
            const formData = new FormData();
            formData.append("photo", photo.file);
            await apiClient.post(`/items/${itemId}/photos`, formData);
          }
        }

        router.push("/dashboard");
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao salvar item"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || authLoading || (isLoading && !isNew)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isNew ? "Novo Item" : "Editar Item"}
            </h1>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Voltar
            </Link>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Harry Potter"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Descrição do item"
              />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos (máximo 2)
              </label>
              <div className="space-y-4">
                {photos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative group cursor-pointer" onClick={() => {
                        setGalleryInitialIndex(idx);
                        setGalleryOpen(true);
                      }}>
                        <Image
                          src={getPhotoSrc(photo)}
                          alt="Preview"
                          width={400}
                          height={240}
                          unoptimized
                          className="w-full h-32 sm:h-40 object-cover rounded-md group-hover:opacity-75 transition-opacity"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(photo.id || `new-${idx}`);
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                          title="Remover foto"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {photos.length < 2 && (
                  <div>
                    <label className="block w-full px-4 py-2 border border-gray-300 rounded-md text-center cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-600">
                        Adicionar Foto ({photos.length}/2)
                      </span>
                      <input
                        type="file"
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Fields */}
            {customFields.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Campos Customizados
                </h3>
                <div className="space-y-3">
                  {customFields.map((field) => (
                    <div key={field.id}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {field.fieldName}
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(field.id, field.fieldName)}
                          className="ml-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition"
                        >
                          Remove
                        </button>
                      </div>
                      {field.fieldType === "text" ? (
                        <input
                          type="text"
                          value={customData[field.fieldName] || ""}
                          onChange={(e) =>
                            setCustomData({
                              ...customData,
                              [field.fieldName]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : field.fieldType === "textarea" ? (
                        <textarea
                          value={customData[field.fieldName] || ""}
                          onChange={(e) =>
                            setCustomData({
                              ...customData,
                              [field.fieldName]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <input
                          type={field.fieldType}
                          value={customData[field.fieldName] || ""}
                          onChange={(e) =>
                            setCustomData({
                              ...customData,
                              [field.fieldName]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Field */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Adicionar Campo Customizado
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Campo
                  </label>
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Data de Leitura"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="text">Texto</option>
                    <option value="textarea">Texto longo</option>
                    <option value="number">Número</option>
                    <option value="date">Data</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  + Adicionar Campo
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t pt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center"
              >
                Cancelar
              </Link>
            </div>
          </form>

          {/* Image Gallery Modal */}
          <ImageGalleryModal
            isOpen={galleryOpen}
            photos={photos}
            initialIndex={galleryInitialIndex}
            onClose={() => setGalleryOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
