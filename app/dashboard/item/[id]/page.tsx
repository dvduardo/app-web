"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/app/lib/api-client";
import { useAuth } from "@/app/lib/auth-context";
import Link from "next/link";

interface Item {
  id: string;
  title: string;
  description: string | null;
  customData: string;
  photos: Array<{
    id: string;
    data: string;
    mimeType: string;
  }>;
}

interface CustomField {
  id: string;
  fieldName: string;
  fieldType: string;
}

export default function ItemPage() {
  const params = useParams();
  const itemId = params.id as string;
  const isNew = itemId === "new";
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customData, setCustomData] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (!isNew) {
      fetchItem();
    }
    fetchCustomFields();
  }, [isNew, user, authLoading, router]);

  const fetchItem = async () => {
    try {
      const response = await apiClient.get(`/items/${itemId}`);
      const itemData = response.data.item;
      setItem(itemData);
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
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao carregar item");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomFields = async () => {
    try {
      const response = await apiClient.get("/custom-fields");
      setCustomFields(response.data.customFields || []);
    } catch (err) {
      console.error("Erro ao carregar campos customizados:", err);
    }
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) {
      setError("Nome do campo é obrigatório");
      return;
    }

    try {
      const response = await apiClient.post("/custom-fields", {
        fieldName: newFieldName,
        fieldType: newFieldType,
      });
      setCustomFields([...customFields, response.data.customField]);
      setNewFieldName("");
      setNewFieldType("text");
      setCustomData({
        ...customData,
        [newFieldName]: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao criar campo");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > 2) {
      setError("Máximo de 2 fotos permitidas");
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos([
          ...photos,
          {
            file,
            mimeType: file.type,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = async (photoId: string) => {
    if (isNew) {
      setPhotos(photos.filter((p) => p.id !== photoId));
      return;
    }

    try {
      await apiClient.delete(`/items/${itemId}/photos/${photoId}`);
      setPhotos(photos.filter((p) => p.id !== photoId));
    } catch (err) {
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
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao salvar item");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || (isLoading && !isNew)) {
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
                      <div key={idx} className="relative">
                        <img
                          src={photo.data || (photo.file ? URL.createObjectURL(photo.file) : "")}
                          alt="Preview"
                          className="w-full h-32 sm:h-40 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleRemovePhoto(photo.id || `new-${idx}`)
                          }
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.fieldName}
                      </label>
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
        </div>
      </div>
    </div>
  );
}
