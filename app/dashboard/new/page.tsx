'use client';

import { useAuth } from '@/app/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/app/lib/api-client';

interface CustomField {
  id: string;
  fieldName: string;
  fieldType: string;
}

export default function NewItemPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customData: {} as Record<string, string>,
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    try {
      const response = await apiClient.get('/custom-fields');
      setCustomFields(response.data?.customFields || []);
    } catch (err) {
      console.error('Error fetching custom fields:', err);
      setCustomFields([]);
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    try {
      const response = await apiClient.post('/custom-fields', {
        fieldName: newFieldName,
        fieldType: newFieldType,
      });
      setCustomFields([...customFields, response.data.customField]);
      setNewFieldName('');
      setNewFieldType('text');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao adicionar campo');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomDataChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customData: {
        ...prev.customData,
        [fieldName]: value,
      },
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 2;
    
    if (files.length + photos.length > maxFiles) {
      setError(`Máximo ${maxFiles} fotos permitidas`);
      return;
    }

    const newPhotos = [...photos, ...files.slice(0, maxFiles - photos.length)];
    setPhotos(newPhotos);

    // Create preview URLs
    const previews: string[] = [];
    newPhotos.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
        if (previews.length === newPhotos.length) {
          setPhotoPreview(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreview.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreview(newPreviews);
  };

  const handleRemoveField = async (fieldId: string, fieldName: string) => {
    if (!confirm(`Deseja remover o campo "${fieldName}"?`)) {
      return;
    }

    try {
      await apiClient.delete('/custom-fields', {
        data: { fieldId },
      });
      setCustomFields(customFields.filter((f) => f.id !== fieldId));
      const { [fieldName]: _, ...newCustomData } = formData.customData;
      setFormData((prev) => ({
        ...prev,
        customData: newCustomData,
      }));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao remover campo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Create item
      const itemResponse = await apiClient.post('/items', {
        title: formData.title,
        description: formData.description,
        customData: formData.customData,
      });

      const itemId = itemResponse.data.item.id;

      // Upload photos if any
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const formDataPhoto = new FormData();
          formDataPhoto.append('photo', photos[i]);

          await apiClient.post(`/items/${itemId}/photos`, formDataPhoto, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar item');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8 overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Novo Item</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-lg shadow p-6">
          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: HQ Amazing Spider-Man #1"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Adicioned mais detalhes sobre seu item..."
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotos (até 2)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                id="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={photos.length >= 2}
                className="hidden"
              />
              <label
                htmlFor="photos"
                className="block text-center cursor-pointer"
              >
                <div className="text-gray-600">
                  <p className="text-sm">Clique ou arraste imagens aqui</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {photos.length}/2 fotos selecionadas
                  </p>
                </div>
              </label>
            </div>

            {photoPreview.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {photoPreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900">Campos Customizados</h3>
              {customFields.map((field) => (
                <div key={field.id}>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor={field.fieldName}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {field.fieldName}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveField(field.id, field.fieldName)}
                      className="ml-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition"
                    >
                      ✕ Remover
                    </button>
                  </div>
                  {field.fieldType === 'textarea' ? (
                    <textarea
                      id={field.fieldName}
                      value={formData.customData[field.fieldName] || ''}
                      onChange={(e) => handleCustomDataChange(field.fieldName, e.target.value)}
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : field.fieldType === 'select' ? (
                    <input
                      type="text"
                      id={field.fieldName}
                      value={formData.customData[field.fieldName] || ''}
                      onChange={(e) => handleCustomDataChange(field.fieldName, e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <input
                      type={field.fieldType}
                      id={field.fieldName}
                      value={formData.customData[field.fieldName] || ''}
                      onChange={(e) => handleCustomDataChange(field.fieldName, e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Field */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900">Adicionar Novo Campo</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="Nome do campo"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="date">Data</option>
                <option value="textarea">Texto Longo</option>
              </select>
              <button
                type="button"
                onClick={handleAddField}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {isSaving ? 'Salvando...' : 'Salvar Item'}
            </button>
            <Link
              href="/dashboard"
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-md hover:bg-gray-400 text-center font-medium"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
