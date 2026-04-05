"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, ItemFormInput } from "@/lib/schemas/item";
import { UploadablePhoto } from "@/lib/photo-upload";
import { PhotoUpload } from "./photo-upload";
import { ImageGalleryModal } from "@/app/components/ui/image-gallery-modal";
import type { CustomField } from "@/hooks/use-custom-fields";
import type { Category } from "@/hooks/use-categories";

type ItemFormValues = z.input<typeof itemSchema>;
const EMPTY_PHOTOS: UploadablePhoto[] = [];

interface ItemFormProps {
  title: string;
  submitLabel: string;
  savingLabel: string;
  cancelLabel?: string;
  defaultValues?: Partial<ItemFormValues>;
  initialPhotos?: UploadablePhoto[];
  customFields: CustomField[];
  categories: Category[];
  error?: string;
  isSaving?: boolean;
  onSubmit: (values: ItemFormInput, photos: UploadablePhoto[]) => Promise<void>;
  onCreateCategory: (categoryName: string) => Promise<Category>;
  onAddCustomField: (fieldName: string, fieldType: string) => Promise<void>;
  onRemoveCustomField: (fieldId: string, fieldName: string) => Promise<void>;
}

export function ItemForm({
  title,
  submitLabel,
  savingLabel,
  cancelLabel = "Cancelar",
  defaultValues,
  initialPhotos = EMPTY_PHOTOS,
  customFields,
  categories,
  error = "",
  isSaving = false,
  onSubmit,
  onCreateCategory,
  onAddCustomField,
  onRemoveCustomField,
}: ItemFormProps) {
  const [formError, setFormError] = useState("");
  const [photos, setPhotos] = useState<UploadablePhoto[]>(() => initialPhotos);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    control,
  } = useForm<ItemFormValues, unknown, ItemFormInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      categoryId: defaultValues?.categoryId ?? "",
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      customData: defaultValues?.customData ?? {},
    },
  });

  useEffect(() => {
    reset({
      categoryId: defaultValues?.categoryId ?? "",
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      customData: defaultValues?.customData ?? {},
    });
  }, [defaultValues, reset]);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  const displayedError = formError || error;
  const categoryField = register("categoryId");
  const selectedCategoryId = useWatch({ control, name: "categoryId" }) ?? "";
  const customDataValues =
    (useWatch({ control, name: "customData" }) as Record<string, string> | undefined) ?? {};

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setFormError("Nome da categoria é obrigatório");
      return;
    }

    try {
      setIsCreatingCategory(true);
      const createdCategory = await onCreateCategory(newCategoryName);
      setValue("categoryId", createdCategory.id, { shouldDirty: true, shouldValidate: true });
      setNewCategoryName("");
      setFormError("");
    } catch (submitError) {
      setFormError(
        submitError instanceof Error ? submitError.message : "Erro ao criar categoria"
      );
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) {
      setFormError("Nome do campo é obrigatório");
      return;
    }

    try {
      await onAddCustomField(newFieldName, newFieldType);
      const currentCustomData =
        (getValues("customData") as Record<string, string> | undefined) ?? {};
      setValue("customData", {
        ...currentCustomData,
        [newFieldName]: "",
      });
      setNewFieldName("");
      setNewFieldType("text");
      setFormError("");
    } catch (submitError) {
      setFormError(
        submitError instanceof Error ? submitError.message : "Erro ao adicionar campo"
      );
    }
  };

  const handleRemoveField = async (fieldId: string, fieldName: string) => {
    if (!confirm(`Deseja remover o campo "${fieldName}"?`)) {
      return;
    }

    try {
      await onRemoveCustomField(fieldId, fieldName);
      const currentCustomData: Record<string, string> = {
        ...(((getValues("customData") as Record<string, string> | undefined) ?? {})),
      };
      delete currentCustomData[fieldName];
      setValue("customData", currentCustomData);
    } catch (submitError) {
      setFormError(
        submitError instanceof Error ? submitError.message : "Erro ao remover campo"
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Voltar
        </Link>
      </div>

      {displayedError && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm font-medium text-red-800">{displayedError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(async (values) => {
          setFormError("");
          await onSubmit(values, photos);
        })}
        className="space-y-6"
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Categoria *
              </label>
              <select
                id="categoryId"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.categoryId ? "border-red-400" : "border-gray-300"
                }`}
                value={selectedCategoryId}
                onChange={(event) =>
                  setValue("categoryId", event.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                name={categoryField.name}
                ref={categoryField.ref}
                onBlur={categoryField.onBlur}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova categoria
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Livros"
                />
                <button
                  type="button"
                  disabled={isCreatingCategory}
                  onClick={() => void handleCreateCategory()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
                >
                  {isCreatingCategory ? "Criando..." : "Criar"}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Ao criar, ela já fica selecionada para este item.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            id="title"
            type="text"
            placeholder="Ex: Harry Potter"
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? "border-red-400" : "border-gray-300"
            }`}
            {...register("title")}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Descrição do item"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register("description")}
          />
        </div>

        <PhotoUpload
          photos={photos}
          disabled={isSaving}
          onChange={setPhotos}
          onError={setFormError}
          onRemove={async (photo, index) => {
            await Promise.resolve();
            setPhotos((currentPhotos) =>
              currentPhotos.filter((_, photoIndex) => photoIndex !== index)
            );
            if (photo.id && galleryOpen && photos.length === 1) {
              setGalleryOpen(false);
            }
          }}
          onPreview={(index) => {
            setGalleryInitialIndex(index);
            setGalleryOpen(true);
          }}
        />

        {customFields.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Campos Customizados
            </h3>
            <div className="space-y-3">
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
                      onClick={() => void handleRemoveField(field.id, field.fieldName)}
                      className="ml-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition"
                    >
                      Remover
                    </button>
                  </div>
                  {field.fieldType === "textarea" ? (
                    <textarea
                      id={field.fieldName}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={customDataValues[field.fieldName] ?? ""}
                      onChange={(event) =>
                        setValue(
                          "customData",
                          {
                            ...customDataValues,
                            [field.fieldName]: event.target.value,
                          },
                          { shouldDirty: true }
                        )
                      }
                    />
                  ) : (
                    <input
                      id={field.fieldName}
                      type={field.fieldType === "select" ? "text" : field.fieldType}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={customDataValues[field.fieldName] ?? ""}
                      onChange={(event) =>
                        setValue(
                          "customData",
                          {
                            ...customDataValues,
                            [field.fieldName]: event.target.value,
                          },
                          { shouldDirty: true }
                        )
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
                onChange={(event) => setNewFieldName(event.target.value)}
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
                onChange={(event) => setNewFieldType(event.target.value)}
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
              onClick={() => void handleAddField()}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              + Adicionar Campo
            </button>
          </div>
        </div>

        <div className="flex gap-3 border-t pt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? savingLabel : submitLabel}
          </button>
          <Link
            href="/dashboard"
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center"
          >
            {cancelLabel}
          </Link>
        </div>
      </form>

      <ImageGalleryModal
        isOpen={galleryOpen}
        photos={photos}
        initialIndex={galleryInitialIndex}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
}
